import io from 'socket.io-client';
import { States } from '../models/states';
import { ITimeMessage } from '../models/time-message';
import { SimulationState } from '../models/sim-state';

const log = console.log;

let socket: SocketIOClient.Socket;

const setupSocket = () => {
  socket = socket || io('http://localhost');
  socket.on('connect', () => log('Connected'));
  socket.on('event', (data: any) => log(data));
  socket.on('disconnect', () => log('Disconnected'));
  socket.on('stateUpdated', (state: States) => SimulationState.state = state);
  socket.on('time', (time: ITimeMessage) => {
    SimulationState.trialTime = time.trialTime;
    SimulationState.trialTimeSpeed = time.trialTimeSpeed;
    SimulationState.timeElapsed = time.timeElapsed;
  });
  return socket;
};

export const SocketService = {
  socket: setupSocket(),
};
