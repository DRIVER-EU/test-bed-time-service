import m from 'mithril';
import { d3clock, sbb } from 'd3-clock';

export const Clock = () => {
  return {
    view: () => m('.clock[id=clock]'),
    oncreate: () => {
      const el = document.getElementById('clock');
      const width = el ? Math.min(el.clientHeight, el.clientWidth) : 600;
      d3clock({
        // Parent div to put the clock in
        target: '#clock',
        // Width of the clock
        width,
        // Fixed time
        // date:'Mon May 25 2015 10:09:37',
        // Time zone offset
        TZOffset: { hours: 0 },
        // Clock face, e.g. sbb, braun, modern, or classic, must be imported
        face: sbb,
      });
    },
  };
};
