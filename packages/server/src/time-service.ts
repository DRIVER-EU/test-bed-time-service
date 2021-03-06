import { TimeServiceState } from './states/time-service-states';
import { ICommandOptions } from './index';
import { EventEmitter } from 'events';
import {
  TestBedAdapter,
  Logger,
  LogLevel,
  ProduceRequest,
  IAdapterMessage,
  TimeState,
  ITimeControl,
  ITimeManagement,
  IRolePlayerMessage,
  TimeTopic,
  TimeControlTopic,
  TrialManagementRolePlayerTopic,
  HeartbeatTopic,
  LogTopic,
} from 'node-test-bed-adapter';
import { Idle } from './states/time-service-idle-state';
import { SocketChannels } from './models/socket-channels';

export interface TimeService {
  on(event: SocketChannels.STATE_UPDATED, listener: (state: TimeState) => void): this;
  on(event: SocketChannels.TIME, listener: (time: ITimeManagement) => void): this;
  on(event: SocketChannels.BILLBOARD, listener: (msg: IRolePlayerMessage) => void): this;
}

export class TimeService extends EventEmitter implements TimeService {
  private adapter: TestBedAdapter;
  private log = Logger.instance;
  private billboard?: string;

  /** Can be used in clearInterval to reset the timer */
  private _timeHandler?: NodeJS.Timer;

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
    this.billboard = billboard ? billboard.toLowerCase() : undefined;
    this.interval = interval;
    this._trialTimeSpeed = 0;
    this._state = new Idle(this);

    const consume = [{ topic: TimeControlTopic }];
    if (billboard) {
      consume.push({ topic: TrialManagementRolePlayerTopic });
    }

    this.adapter = new TestBedAdapter({
      kafkaHost,
      schemaRegistry,
      fetchAllSchemas: false,
      clientId: 'TB-TimeService',
      autoRegisterSchemas,
      schemaFolder: 'schemas',
      autoRegisterDefaultSchemas: false,
      consume,
      produce: [HeartbeatTopic, LogTopic, TimeControlTopic, TimeTopic],
      fromOffset: false,
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
    this.adapter.on('message', message => this.handleMessage(message));
    this.adapter.on('error', err => this.log.error(`Consumer received an error: ${err}`));
    this.adapter.on('offsetOutOfRange', err => {
      this.log.error(`Consumer received an offsetOutOfRange error on topic ${err.topic}.`);
    });
  }

  private handleMessage(message: IAdapterMessage) {
    switch (message.topic) {
      case TimeControlTopic:
        this.log.info(`${TimeControlTopic} message:\n` + JSON.stringify(message, null, 2));
        const controlMsg = message.value as ITimeControl;
        this.transition(controlMsg);
        break;
      case TrialManagementRolePlayerTopic:
        const msg = message.value as IRolePlayerMessage;
        console.log('TrialManagementRolePlayerTopic received');
        console.table(msg);
        if (
          msg &&
          msg.participantNames &&
          msg.participantNames.filter(pn => pn.toLowerCase() === this.billboard).length > 0
        ) {
          this.emit(SocketChannels.BILLBOARD, msg);
          console.log('TrialManagementRolePlayerTopic emitted');
        }
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
      messages: timeMsg,
      attributes: 1, // Gzip
    } as ProduceRequest;

    this.adapter.send(payload, (err: Error) => {
      if (err) {
        const msg = `Error received for topic '${payload.topic}': ${err.message}.`;
        Logger.instance.error(msg);
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
