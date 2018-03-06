import { ITimingControlMessage } from './models/timing-control-message';
import { ICommandOptions } from './index';
import { EventEmitter } from 'events';
import { Message, ProduceRequest } from 'kafka-node';
import { TestBedAdapter, Logger, LogLevel } from 'node-test-bed-adapter';
import { ITimeMessage } from './models/time-message';

const ConfigurationTopic = 'test-bed-configuration';
const TimeTopic = 'connect-status-time';

export class TimeService extends EventEmitter {
  private adapter: TestBedAdapter;
  private log = Logger.instance;

  /** Can be used in clearInterval to reset the timer */
  private timeHandler?: NodeJS.Timer;

  /** Real-time when the scenario is started */
  private realStartTime?: number;
  /** Real-time of last update */
  private lastUpdateTime?: number;
  /**  The fictive date and time of the simulation / trial as the number of milliseconds
   * from the UNIX epoch, 1 January 1970 00:00:00.000 UTC. */
  private trialTime?: number;
  /** Current speed of the simulation in number of times real-time */
  private currentSpeed: number;

  private sequenceId: number;

  // TODO: currently the fictive time always starts at the current time. This should be configurable?

  /** Interval to send messages to Kafka and browser clients (via Socket.io.). */
  private readonly interval: number;

  constructor(options: ICommandOptions) {
    super();
    this.interval = options.interval;
    this.currentSpeed = 1.0;
    this.sequenceId = 0;

    this.adapter = new TestBedAdapter({
      kafkaHost: 'localhost:3501',
      schemaRegistry: 'localhost:3502',
      fetchAllSchemas: false,
      clientId: 'TimeService',
      consume: [
         // { topic: ConfigurationTopic }
      ],
      produce: [ TimeTopic ],
      logging: {
        logToConsole: LogLevel.Debug,
        logToFile: LogLevel.Debug,
        logToKafka: LogLevel.Debug,
        logFile: 'log.txt'
      }
    });
    this.adapter.on('ready', () => {
      this.subscribe();
      // TEST
      this.startScenario();
      this.log.info('Consumer is connected');
    });
  }

  public connect() {
    this.adapter.connect();
  }

  private subscribe() {
    this.adapter.on('message', (message) => this.handleMessage(message));
    this.adapter.on('error', (err) => this.log.error(`Consumer received an error: ${err}`));
    this.adapter.on('offsetOutOfRange', (err) => this.log.error(`Consumer received an offsetOutOfRange error: ${err}`));
  }

  private handleMessage(message: Message) {
    switch (message.topic) {
      case 'test-bed-configuration':
      var controlmessage = message.value;
        // When we receive a start scenario message, start it
        this.startScenario();
        // When we receive a stop scenario message, start it
        this.stopScenario();
        break;
      default:
        console.log(message.value);
        break;
    }
  }

  private startScenario() {
    this.realStartTime = Date.now();
    this.trialTime = this.realStartTime;
    this.lastUpdateTime = this.realStartTime;
    this.startProducingTimeMessages();
  }

  private stopScenario() {
    this.stopProducingTimeMessages();
  }

  private sendTimeMessage() {
    const newUpdateTime = Date.now();
    const elapsedSinceLastUpdate = newUpdateTime - this.lastUpdateTime!;
    this.trialTime = this.trialTime! + elapsedSinceLastUpdate * this.currentSpeed;
    const totalElapsed = newUpdateTime - this.realStartTime!;

    const timeMsg = {
      id: this.sequenceId,
      updatedAt: newUpdateTime,
      trialTime: this.trialTime,
      timeElapsed: totalElapsed,
      trialTimeSpeed: this.currentSpeed
    } as ITimeMessage;

    this.emit('time', timeMsg as ITimeMessage);

    const payload = { 
      topic: TimeTopic, 
      messages: timeMsg,
      attributes: 1 // Gzip
    } as ProduceRequest;

    this.adapter.send(payload, (err, data) => {
      if (err) {
        this.log.error(err);
      }
      if (data) {
        this.log.info(data);
      }
    });

    this.lastUpdateTime = newUpdateTime; // log the time of the last time update
    this.sequenceId++;
  }

  private startProducingTimeMessages() {
    this.timeHandler = setInterval(() => this.sendTimeMessage(), this.interval);
  }

  private stopProducingTimeMessages() {
    if (this.timeHandler) {
      clearInterval(this.timeHandler);
    }
  }
}
