import { TimeService } from './time-service';
import { ICommandOptions } from './';
import { createServer, Server } from 'http';
import { ITimeMessage } from './models/time-message';
import { Application, Request, Response } from 'express';
import * as express from 'express';
import * as socketIO from 'socket.io';

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
    this.app.use(express.static('public'));
    this.server = createServer(this.app);
    this.io = socketIO(this.server);
    this.setupRoutes();
    this.listen();

    this.timeService = new TimeService(options);
    this.timeService.on('time', (time: ITimeMessage) => {
      this.io.emit('time', time);
    });
    this.timeService.connect();
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

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  private setupRoutes() {
    this.app.get('/', (_req: Request, res: Response) => {
      res.sendFile(process.cwd() + '/index.html');
    });
  }

  public getApp(): Application {
    return this.app;
  }

}