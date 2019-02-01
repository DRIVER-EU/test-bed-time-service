import m from 'mithril';
import { SimulationState } from '../models/sim-state';
import { d3clock, sbb } from 'd3-clock';
import { SocketService } from '../services/socket-service';

export const Clock = () => {
  return {
    view: () => m('.clock[id=clock]'),
    oncreate: () => {
      const el = document.getElementById('clock');
      const width = el ? Math.min(el.clientHeight, el.clientWidth) : 600;
      SocketService.socket.on('time', () => m.redraw());
      d3clock({
        // Parent div to put the clock in
        target: '#clock',
        width,
        date: () => SimulationState.trialTime,
        // Time zone offset
        TZOffset: { hours: 0 },
        // Clock face, e.g. sbb, braun, modern, or classic, must be imported
        face: sbb,
      });
    },
  };
};
