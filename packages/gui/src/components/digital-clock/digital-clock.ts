import m from 'mithril';
import './digital-clock.css';
import { SimulationState } from '../../models/sim-state';
import { SocketService } from '../../services/socket-service';
import { formatTime } from '../../utils';
import { SocketChannels } from '../../models/socket-channels';

export const DigitalClock = () => {
  const updateSimTime = () => {
    const now = Date.now();
    const delta = (now - state.updated) * state.speed;
    state.updated = now;
    const oldTime = state.time;
    state.time = new Date(state.time.valueOf() + delta);
    if (state.time && oldTime && state.time.valueOf() !== oldTime.valueOf()) {
      m.redraw();
    }
  };
  const interval = () => 500 / (state.speed || 1);
  const state = {
    updated: Date.now(),
    time: new Date(),
    speed: 1,
    handler: -1,
  };

  return {
    oncreate: () => {
      state.handler = window.setInterval(updateSimTime, interval());
      SocketService.socket.on(SocketChannels.TIME, () => {
        const oldSpeed = state.speed;
        state.time = new Date(SimulationState.simulationTime);
        state.speed = SimulationState.simulationSpeed;
        if (state.speed === oldSpeed) {
          return;
        }
        clearInterval(state.handler);
        state.handler = window.setInterval(updateSimTime, interval());
      });
    },
    onremove: () => {
      clearInterval(state.handler);
    },
    view: () => {
      const mainContainer = document.getElementById('main') as HTMLElement;
      const fontSize = mainContainer.clientWidth / 5;
      return m('.digital-clock', { style: `font-size: ${fontSize}px` }, m('.time', formatTime(state.time)));
    },
  };
};
