import { TimeServiceState } from './states/time-service-states';
import { ITimingControlMessage } from './models/timing-control-message';
import { ICommandOptions } from './index';
import { EventEmitter } from 'events';
import { ProduceRequest } from 'node-test-bed-adapter';
import { TestBedAdapter, Logger, LogLevel, IAdapterMessage } from 'node-test-bed-adapter';
import { ITimeMessage } from './models/time-message';
import { Idle } from './states/time-service-idle-state';
import { States } from './states/states';

const ConfigurationTopic = 'system_timing_control';
const TimeTopic = 'system_timing';

export interface TimeService {
  on(event: 'stateUpdated', listener: (state: States) => void): this;
  on(event: 'time', listener: (time: ITimeMessage) => void): this;
}

export class TimeService extends EventEmitter implements TimeService {
  private adapter: TestBedAdapter;
  private log = Logger.instance;

  /** Can be used in clearInterval to reset the timer */
  private _timeHandler?: NodeJS.Timer;

  /** Real-time when the scenario is started */
  private _realStartTime?: number;
  /** Real-time of last update */
  private _lastTrialTimeUpdate?: number;
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
    this.interval = options.interval;
    this._trialTimeSpeed = 0;
    this._state = new Idle(this);

    this.adapter = new TestBedAdapter({
      kafkaHost: options.kafkaHost,
      schemaRegistry: options.schemaRegistryUrl,
      fetchAllSchemas: false,
      clientId: 'TimeService',
      autoRegisterSchemas: options.autoRegisterSchemas,
      schemaFolder: 'schemas',
      consume: [{ topic: ConfigurationTopic }],
      produce: [TimeTopic, ConfigurationTopic],
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
  public transition(msg: ITimingControlMessage) {
    this._state = this._state.transition(msg);
    this.sendTimeUpdate(); // force update with new state info ASAP
    this.emit('stateUpdated', this._state.name);
  }

  private subscribe() {
    this.adapter.on('message', (message) => this.handleMessage(message));
    this.adapter.on('error', (err) => this.log.error(`Consumer received an error: ${err}`));
    this.adapter.on('offsetOutOfRange', (err) => this.log.error(`Consumer received an offsetOutOfRange error: ${err}`));
  }

  private handleMessage(message: IAdapterMessage) {
    switch (message.topic) {
      case ConfigurationTopic:
        const controlMsg = message.value as ITimingControlMessage;
        this.transition(controlMsg);
        break;
      default:
        console.log('Unhandled message: ' + message.value);
        break;
    }
  }

  get state() {
    return this._state;
  }

  get trialTime() {
    return this._trialTime;
  }

  set trialTime(val) {
    // keep track of last time trial time was updated to allow correct computation of trial time based on speed
    this._lastTrialTimeUpdate = Date.now();
    this._trialTime = val;
  }

  get trialTimeSpeed() {
    return this._trialTimeSpeed;
  }

  set trialTimeSpeed(val) {
    this._trialTimeSpeed = val;
  }

  get lastUpdateTime() {
    return this._lastTrialTimeUpdate;
  }

  get realStartTime() {
    return this._realStartTime;
  }

  /**
   * Computes the new Trial Time using the amount of time that has passed since the previous computation of TrialTime
   * and the TrialTimeSpeed. Updates the Trial Time accordingly.
   */
  public progressTrialTime() {
    const now = Date.now();
    const passed = now - this.lastUpdateTime!;
    const newTrialTime = this.trialTime! + passed * this.trialTimeSpeed!;
    this.trialTime = newTrialTime;
    this._lastTrialTimeUpdate = now;
  }

  public startScenario() {
    this._realStartTime = Date.now();
    if (this.trialTime === null) {
      this.log.warn('No trial time provided upon scenario start. Defaulting Trial Time to current Real-time');
      this.trialTime = this.realStartTime;
    }
    this._lastTrialTimeUpdate = this.realStartTime;
    this.startProducingTimeMessages();
  }

  public stopScenario() {
    this.stopProducingTimeMessages();
  }

  public sendTimeUpdate() {
    this.sendTimeMessage(this.state.createTimeMessage());
  }

  public sendTimeMessage(timeMsg: ITimeMessage) {
    this.emit('time', timeMsg);

    const payload = {
      topic: TimeTopic,
      messages: timeMsg,
      attributes: 1, // Gzip
    } as ProduceRequest;

    this.adapter.send(payload, (err, data) => {
      if (err) {
        this.log.error(err);
      }
      if (data) {
        this.log.info(data);
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
