import io from 'socket.io-client';
import { States } from '../models/states';
import { ITimeMessage } from '../models/time-message';
import { SimulationState } from '../models/sim-state';

// tslint:disable-next-line:no-console
const log = console.log;
let socket: SocketIOClient.Socket;

const setupSocket = (relPath? : string) => {
  if (socket) {
    return socket;
  }

  socket = relPath ? io({
    path: relPath,
    reconnectionAttempts: 1
  }) : io({reconnectionAttempts: 1});
  socket.on('connect', () => log('Connected to Socket at ' + (relPath ? relPath : "root")));
  socket.on('event', (data: any) => log(data));
  socket.on('disconnect', () => log('Disconnected'));
  socket.on('reconnect_failed', () => log("Reconnect attempt failed"));
  socket.on('stateUpdated', (state: States) => {
    SimulationState.state = state;
  });
  let handler = -1;
  socket.on('time', (time: ITimeMessage) => {
    // log(`Time message received: ${time.trialTime}`);
    SimulationState.trialTime = time.trialTime || new Date().setHours(12, 0, 0).valueOf();
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
socket.on('reconnect_failed', () => {
  socket.close();
  log("Could not connect to Socket at root. Attempt connection to path /time-service/socket.io");
  socket = setupSocket("/time-service/socket.io");
  socket.on('connect', () => log('CONNECTED!!!!'));
});

export const SocketService = {
  socket: socket || setupSocket(),
};
