import m, { FactoryComponent } from 'mithril';
import { SimulationState } from '../models/sim-state';
import { d3clock, sbb } from 'd3-clock';
import { SocketService } from '../services/socket-service';
import { SocketChannels } from '../models/socket-channels';

export const Clock: FactoryComponent = () => {
  return {
    view: () => m('.clock[id=clock]'),
    oncreate: () => {
      const width = Math.min(document.body.clientHeight, document.body.clientWidth) || 600;
      SocketService.socket.on(SocketChannels.TIME, () => m.redraw());
      d3clock({
        // Parent div to put the clock in
        target: '#clock',
        width,
        date: () => SimulationState.simulationTime,
        // Time zone offset
        // TZOffset: { hours: 0 },
        // Clock face, e.g. sbb, braun, modern, or classic, must be imported
        face: sbb,
      });
    },
  };
};
