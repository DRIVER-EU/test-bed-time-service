import io from 'socket.io-client';
import { ITimeMessage } from '../models/time-message';
import { SimulationState } from '../models/sim-state';
import { States } from '../models/states';

// tslint:disable-next-line:no-console
const log = console.log;
let socket: SocketIOClient.Socket;

const setupSocket = () => {
  if (socket) {
    return socket;
  }

  socket = io({
    path: '/time-service/socket.io/',
  });
  socket.on('connect', () => log('Connected'));
  socket.on('event', (data: any) => log(data));
  socket.on('disconnect', () => log('Disconnected'));
  socket.on('stateUpdated', (state: States) => {
    SimulationState.state = state;
  });
  let handler = -1;
  socket.on('time', (time: ITimeMessage) => {
    // log(`Time message received: ${time.trialTime}`);
    SimulationState.trialTime = time.trialTime || new Date().setUTCHours(12, 0, 0).valueOf();
    SimulationState.trialTimeSpeed = time.trialTimeSpeed;
    SimulationState.timeElapsed = time.timeElapsed;
    window.clearInterval(handler);
    if (time.trialTimeSpeed > 0) {
      const secDuration = 1000;
      handler = window.setInterval(() => {
        SimulationState.trialTime += secDuration;
      }, secDuration / time.trialTimeSpeed);
    }
  });
  return socket;
};
socket = setupSocket();

export const SocketService = {
  socket: socket || setupSocket(),
};
