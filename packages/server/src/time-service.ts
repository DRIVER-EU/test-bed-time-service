import { EventEmitter } from 'events';
import {
  TestBedAdapter,
  AdapterLogger,
  LogLevel,
  TimeState,
  ITimeControl,
  ITimeManagement,
  IRolePlayerMessage,
  TimeTopic,
  TimeControlTopic,
  HeartbeatTopic,
  LogTopic,
  AdapterMessage,
  AdapterProducerRecord,
} from 'node-test-bed-adapter';
import { TimeServiceState } from './states/time-service-states.js';
import { ICommandOptions } from './index.js';
import { Idle } from './states/time-service-idle-state.js';
import { SocketChannels } from './models/socket-channels.js';
import { InfoMsg, InfoMsgType } from './models/info-message.js';

export interface TimeService {
  on(event: SocketChannels.STATE_UPDATED, listener: (state: TimeState) => void): this;
  on(event: SocketChannels.TIME, listener: (time: ITimeManagement) => void): this;
  on(event: SocketChannels.BILLBOARD, listener: (msg: InfoMsg) => void): this;
  on(event: SocketChannels.VIDEO, listener: (msg: InfoMsg) => void): this;
}

const InformativeMessage = 'system_tm_info_msg';

export class TimeService extends EventEmitter implements TimeService {
  private adapter: TestBedAdapter;
  private log = AdapterLogger.instance;
  private billboard = false;

  /** Can be used in clearInterval to reset the timer */
  private _timeHandler?: NodeJS.Timeout;

  /** Real-time when the scenario is started */
  private _realStartTime?: number;
  /** Real-time of last update */
  private _lastUpdateTime?: number;
  /**  The fictive date and time of the simulation / trial as the number of milliseconds
   * from the UNIX epoch, 1 January 1970 00:00:00.000 UTC. */
  private _trialTime?: number;
  /** Current speed of the simulation in number of times real-time */
  private _trialTimeSpeed: number;

  private _state: TimeServiceState;

  /** Interval to send messages to Kafka and browser clients (via Socket.io.). */
  private readonly interval: number;

  constructor(options: ICommandOptions) {
    super();
    const { interval, billboard, kafkaHost, schemaRegistryUrl: schemaRegistry, autoRegisterSchemas } = options;
    this.billboard = typeof billboard !== 'undefined' && billboard;
    this.interval = interval;
    this._trialTimeSpeed = 0;
    this._state = new Idle(this);

    const consume = [TimeControlTopic];
    if (billboard) {
      consume.push(InformativeMessage);
    }

    this.adapter = new TestBedAdapter({
      kafkaHost,
      schemaRegistry,
      fetchAllSchemas: false,
      groupId: options.groupId || 'TimeService',
      autoRegisterSchemas,
      schemaFolder: 'schemas',
      autoRegisterDefaultSchemas: false,
      consume,
      produce: [HeartbeatTopic, LogTopic, TimeControlTopic, TimeTopic],
      fromOffset: 'latest',
      logging: {
        logToConsole: LogLevel.Info,
        logToKafka: LogLevel.Warn,
      },
    });
    this.adapter.on('ready', () => {
      this.subscribe();
      this.log.info('Consumer is connected');
    });
  }

  public connect() {
    return this.adapter.connect();
  }

  /** Allow external services to control transitions. */
  public transition(msg: ITimeControl) {
    this._state = this._state.transition(msg);
    this.sendTimeUpdate(); // force update with new state info ASAP
    this.emit(SocketChannels.STATE_UPDATED, this._state.name);
  }

  private subscribe() {
    this.adapter.on('message', (message) => this.handleMessage(message));
    this.adapter.on('error', (err) => this.log.error(`Consumer received an error: ${err}`));
    this.adapter.on('offsetOutOfRange', (err) => {
      this.log.error(`Consumer received an offsetOutOfRange error on topic ${err.topic}.`);
    });
  }

  private handleMessage(message: AdapterMessage) {
    switch (message.topic) {
      case TimeControlTopic:
        this.log.info(`${TimeControlTopic} message:\n` + JSON.stringify(message, null, 2));
        const controlMsg = message.value as ITimeControl;
        this.transition(controlMsg);
        break;
      case InformativeMessage:
        const msg = message.value as InfoMsg;
        this.emit(msg.type === InfoMsgType.BILLBOARD ? SocketChannels.BILLBOARD : SocketChannels.VIDEO, msg);
        console.log('Informative billboard message emitted:');
        console.table(msg);
        break;
      default:
        this.log.warn('Unhandled message: ' + JSON.stringify(message));
        break;
    }
  }

  get state() {
    return this._state;
  }

  get simulationTime() {
    return this._trialTime;
  }

  set simulationTime(val) {
    // keep track of last time trial time was updated to allow correct computation of trial time based on speed
    this._lastUpdateTime = Date.now();
    this._trialTime = val;
  }

  get simulationSpeed() {
    return this._trialTimeSpeed;
  }

  set simulationSpeed(val) {
    this._trialTimeSpeed = val;
  }

  get lastUpdateTime() {
    return this._lastUpdateTime;
  }

  get realStartTime() {
    if (!this._realStartTime) {
      this._realStartTime = Date.now();
    }
    return this._realStartTime;
  }

  /**
   * Computes the new Trial Time using the amount of time that has passed since the previous computation of simulationTime
   * and the simulationSpeed. Updates the Trial Time accordingly.
   */
  public progressTrialTime() {
    const now = Date.now();
    const passed = now - this.lastUpdateTime!;
    const newTrialTime = Math.round(this.simulationTime! + passed * this.simulationSpeed!);
    this.simulationTime = newTrialTime;
    this._lastUpdateTime = now;
    return newTrialTime;
  }

  public startScenario() {
    this.log.info('Starting scenario');
    this._realStartTime = Date.now();
    if (this.simulationTime === null) {
      this.log.info('No simulation time provided upon scenario start. Defaulting to current time.');
      this.simulationTime = this.realStartTime;
    }
    this._lastUpdateTime = this.realStartTime;
    this.startProducingTimeMessages();
  }

  public stopScenario() {
    this.stopProducingTimeMessages();
  }

  public sendTimeUpdate() {
    this.sendTimeMessage(this.state.createTimeMessage());
  }

  public sendTimeMessage(timeMsg: ITimeManagement) {
    this.emit(SocketChannels.TIME, timeMsg);

    const payload = {
      topic: TimeTopic,
      messages: [{ value: timeMsg }],
      attributes: 1, // Gzip
    } as AdapterProducerRecord;

    this.adapter.send(payload, (err: Error) => {
      if (err) {
        const msg = `Error received for topic '${payload.topic}': ${err.message}.`;
        AdapterLogger.instance.error(msg);
        this.log.error(msg);
        console.table(timeMsg);
      }
    });
  }

  private startProducingTimeMessages() {
    this._timeHandler = setInterval(() => this.sendTimeUpdate(), this.interval);
  }

  private stopProducingTimeMessages() {
    if (this._timeHandler) {
      clearInterval(this._timeHandler);
    }
  }
}
