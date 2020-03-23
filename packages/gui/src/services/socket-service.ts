import io from 'socket.io-client';
import { ITimeMessage } from '../models/time-message';
import { SimulationState } from '../models/sim-state';
import { States } from '../models/states';
import { SocketChannels } from '../models/socket-channels';
import { IRolePlayerMessage } from '../models/role-player-message';

// tslint:disable-next-line:no-console
const log = console.log;
let socket: SocketIOClient.Socket;

const setupSocket = () => {
  if (socket) {
    return socket;
  }

  socket = io({
    path: '/socket.io/',
  });
  socket.on('connect', () => log('Connected'));
  socket.on('event', (data: any) => {
    if (typeof data === 'object' && Object.keys(data).length > 0) {
      log(data);
    }
  });
  socket.on('disconnect', () => log('Disconnected'));
  socket.on(SocketChannels.STATE_UPDATED, (state: States) => {
    SimulationState.state = state;
  });
  let handler = -1;
  socket.on(SocketChannels.TIME, (time: ITimeMessage) => {
    // log(`Time message received: ${time.simulationTime}`);
    SimulationState.simulationTime = time.simulationTime || new Date().setHours(12, 0, 0).valueOf();
    SimulationState.simulationSpeed = time.simulationSpeed;
    SimulationState.timeElapsed = time.timeElapsed;
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
