import io, { ManagerOptions, SocketOptions } from 'socket.io-client';
import { IRolePlayerMessage, ITimeMessage, TimeState, SimulationState, SocketChannels } from '../models';

// tslint:disable-next-line:no-console
const log = console.log;
let socket: any;

const setupSocket = () => {
  if (socket) {
    return socket;
  }
  const ioConfig: Partial<ManagerOptions & SocketOptions> = {
    path: '/time/socket.io',
    transports: ['websocket', 'polling'],
  };

  socket = io(SOCKET_IO_SERVER, ioConfig);
  socket.on('connect', () => log('Connected'));
  socket.on('event', (data: any) => {
    if (typeof data === 'object' && Object.keys(data).length > 0) {
      log(data);
    }
  });
  socket.on('disconnect', () => log('Disconnected'));
  socket.on(SocketChannels.STATE_UPDATED, (state: TimeState) => {
    SimulationState.state = state;
  });
  let handler = -1;
  socket.on(SocketChannels.TIME, (time: ITimeMessage) => {
    log(`Time message received: ${JSON.stringify(time, null, 2)}`);
    SimulationState.simulationTime = time.simulationTime || new Date().setHours(12, 0, 0).valueOf();
    SimulationState.simulationSpeed = time.simulationSpeed;
    if (time.tags && time.tags.timeElapsed) {
      SimulationState.tags!.timeElapsed = time.tags.timeElapsed;
    }
    window.clearInterval(handler);
    if (time.simulationSpeed > 0) {
      const secDuration = 1000;
      handler = window.setInterval(() => {
        SimulationState.simulationTime += secDuration;
      }, secDuration / time.simulationSpeed);
    }
  });
  socket.on(SocketChannels.BILLBOARD, (msg: IRolePlayerMessage) => {
    SimulationState.messageQueue.push(msg);
  });
  return socket;
};
socket = setupSocket();

export const SocketService = {
  socket: socket || setupSocket(),
};
