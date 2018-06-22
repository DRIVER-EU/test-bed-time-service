import { TimeService } from './time-service';
import { ICommandOptions } from './';
import { createServer, Server } from 'http';
import { ITimeMessage } from './models/time-message';
import { Application } from 'express';
import * as express from 'express';
import * as cors from 'cors';
import * as socketIO from 'socket.io';
import { TimingControlCommand } from './models/timing-control-message';
import { States } from './states/states';

/** Main application */
export class App {
  /** Port number where the service listens for clients */
  private readonly port: number;
  private app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private timeService: TimeService;

  constructor(options: ICommandOptions) {
    this.port = options.port;
    this.app = express();
    this.app.use(cors());
    this.app.use(express.static('public'));
    this.server = createServer(this.app);
    this.io = socketIO(this.server);

    this.timeService = new TimeService(options);
    this.timeService.on('time', (time: ITimeMessage) => {
      this.io.emit('time', time);
    });
    this.timeService.on('stateUpdated', (state: States) => {
      this.io.emit('stateUpdated', state);
    });
    this.timeService.connect().then(() => this.listen());
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log(`Running server on port ${this.port}.`);
    });

    this.io.on('connect', (socket: SocketIO.Socket) => {
      console.log(`Connected client on port ${this.port}`);
      socket.on('message', (m: ITimeMessage) => {
        console.log('[server](message): %s', JSON.stringify(m));
        this.io.emit('message', m);
      });

      socket.on('init', (trialTime?: number) => {
        console.log('[server](message): init request received.');
        this.timeService.transition({
          trialTime,
          command: TimingControlCommand.Init
        });
      });
      socket.on('start', (trialTimeSpeed: number) => {
        console.log('[server](message): start request received.');
        this.timeService.transition({
          trialTimeSpeed,
          command: TimingControlCommand.Start
        });
      });
      socket.on('pause', () => {
        console.log('[server](message): pause request received.');
        this.timeService.transition({
          command: TimingControlCommand.Pause
        });
      });
      socket.on('stop', () => {
        console.log('[server](message): stop request received.');
        this.timeService.transition({
          command: TimingControlCommand.Stop
        });
      });
      socket.on('reset', () => {
        console.log('[server](message): reset request received.');
        this.timeService.transition({
          command: TimingControlCommand.Reset
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
