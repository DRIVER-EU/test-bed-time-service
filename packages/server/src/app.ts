import { ICommandOptions } from './';
import { createServer, Server } from 'http';
import { Application } from 'express';
import express from 'express';
import cors from 'cors';
import socketIO, { Server as SocketIoServer } from 'socket.io';
import { ITimeManagement, TimeState, TimeCommand, IRolePlayerMessage } from 'node-test-bed-adapter';
import { SocketChannels } from './models/socket-channels';
import { join } from 'path';
import { TimeService } from './time-service.js';
import { cwd } from 'process';
import { InfoMsg } from './models/info-message';

/** Main application */
export class App {
  /** Port number where the service listens for clients */
  private readonly port: number;
  private app: express.Application;
  private server: Server;
  private io: socketIO.Server;
  private timeService: TimeService;

  constructor(options: ICommandOptions) {
    this.port = options.port;
    this.app = express();
    this.app.use(cors());
    const pwd = join(cwd(), 'public');
    this.app.use('', express.static(pwd));
    this.app.use('/videos', express.static(options.videos));

    this.server = createServer(this.app);

    this.io = new SocketIoServer(this.server, {
      path: '/socket.io',
    });

    console.log('Start-up options');
    console.table(options);

    this.timeService = new TimeService(options);
    this.timeService.on(SocketChannels.TIME, (time: ITimeManagement) => {
      // console.log(`Sending time update: ${JSON.stringify(time, null, 2)}`);
      this.io.emit(SocketChannels.TIME, time);
    });
    this.timeService.on(SocketChannels.STATE_UPDATED, (state: TimeState) => {
      console.log(`Sending state update: ${state}`);
      this.io.emit(SocketChannels.STATE_UPDATED, state);
    });
    this.timeService.on(SocketChannels.BILLBOARD, (msg: InfoMsg) => {
      console.log(`Sending billboard msg: ${msg}`);
      this.io.emit(SocketChannels.BILLBOARD, msg);
    });
    this.timeService.on(SocketChannels.VIDEO, (msg: InfoMsg) => {
      console.log(`Sending video msg: ${msg}`);
      this.io.emit(SocketChannels.VIDEO, msg);
    });
    this.timeService.connect().then(() => this.listen());
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log(`Running server on port ${this.port}.`);
    });

    /** Return last informative message */
    this.app.get('/info_msg', (_req, res) => {
      const last = this.timeService.infoMsgs.length - 1;
      res.json(last < 0 ? {} : this.timeService.infoMsgs[last]);
    });

    /** Return all informative messages */
    this.app.get('/info_msgs', (_req, res) => {
      res.json(this.timeService.infoMsgs);
    });

    this.io.on('connect', (socket) => {
      console.log(`Connected client on port ${this.port}`);
      socket.emit(SocketChannels.STATE_UPDATED, this.timeService.state.name);
      socket.emit(SocketChannels.TIME, this.timeService.state.createTimeMessage());
      // this.timeService.sendTimeUpdate();
      socket.on('message', (m: ITimeManagement) => {
        console.log('[server](message): %s', JSON.stringify(m));
        this.io.emit('message', m);
      });

      socket.on('init', (simulationTime?: number) => {
        console.log('[server](message): init request received.');
        this.timeService.transition({
          simulationTime,
          command: TimeCommand.Init,
        });
      });
      socket.on('start', (simulationSpeed: number) => {
        console.log(`[server](message): start request received (speed = ${simulationSpeed}).`);
        this.timeService.transition({
          simulationSpeed,
          command: TimeCommand.Start,
        });
      });
      socket.on('pause', () => {
        console.log('[server](message): pause request received.');
        this.timeService.transition({
          command: TimeCommand.Pause,
        });
      });
      socket.on('stop', () => {
        console.log('[server](message): stop request received.');
        this.timeService.transition({
          command: TimeCommand.Stop,
        });
      });
      socket.on('update', (simulationSpeed?: number, simulationTime?: number) => {
        console.log('[server](message): update request received.');
        this.timeService.transition({
          simulationSpeed,
          simulationTime,
          command: TimeCommand.Update,
        });
      });
      socket.on('reset', () => {
        console.log('[server](message): reset request received.');
        this.timeService.transition({
          command: TimeCommand.Reset,
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
