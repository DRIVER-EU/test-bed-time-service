import { ICommandOptions } from './index';
import { EventEmitter } from 'events';
import { Message, ProduceRequest } from 'kafka-node';
import { TestBedAdapter, Logger, LogLevel } from 'node-test-bed-adapter';
import { ITimeMessage } from './models/time-message';

const ConfigurationTopic = 'test-bed-configuration';
const TimeTopic = 'test-bed-time';

export class TimeService extends EventEmitter {
  private adapter: TestBedAdapter;
  private log = Logger.instance;
  /** Can be used in clearInterval to reset the timer */
  private timeHandler?: NodeJS.Timer;
  /** Interval to send messages to Kafka and browser clients (via Socket.io.). */
  private readonly interval: number;

  constructor(options: ICommandOptions) {
    super();
    this.interval = options.interval;

    this.adapter = new TestBedAdapter({
      kafkaHost: 'localhost:3501',
      schemaRegistry: 'localhost:3502',
      fetchAllSchemas: false,
      clientId: 'Consumer',
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
      this.startProducingTimeMessages();

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
        // When we receive a start scenario message, start it
        this.startProducingTimeMessages();
        // When we receive a stop scenario message, start it
        this.stopProducingTimeMessages();
        break;
      default:
        console.log(message.value);
        break;
    }
  }

  private startProducingTimeMessages() {
    this.timeHandler = setInterval(() => {
      this.emit('time', { realTime: Date.now() } as ITimeMessage);
      // Publish message to Kafka - requires AVRO schema
      const payload = { topic: TimeTopic, messages: 'Time' } as ProduceRequest;
      this.adapter.send(payload, (err, data) => {
        if (err) {
          this.log.error(err);
        }
        if (data) {
          this.log.info(data);
        }
      });
    }, this.interval);
  }

  private stopProducingTimeMessages() {
    if (this.timeHandler) {
      clearInterval(this.timeHandler);
    }
  }
}
