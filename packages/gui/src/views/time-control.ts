import { Paused } from './../../../server/src/states/time-service-paused-state';
import { SimulationState } from './../models/sim-state';
import { States } from './../models/states';
import { iconButton } from '../utils/html';
import m from 'mithril';
import { SocketService } from '../services/socket-service';
import TimePicker, { ITimePickerTime } from 'mithril-timepicker';

const socket = SocketService.socket;
socket.emit('test');

// tslint:disable-next-line:prefer-const
let startTime = { h: 9, m: 0 } as ITimePickerTime;

export const TimeControl = () => ({
  view: () => {
    const controls = () => {
      switch (SimulationState.state) {
        case States.Idle:
          const time = new Date().setHours(startTime.h, startTime.m);
          return m('div.left', [
            iconButton('timer', {}, { onclick: () => socket.emit('init', time) }),
            m('div.left', [m('label', 'Start time:'), m(TimePicker, { time: startTime, tfh: true })]),
          ]);
        case States.Paused:
        case States.Initialized:
          return m('div', [
            iconButton('stop', {}, { onclick: () => socket.emit('stop') }),
            iconButton('play_arrow', {}, { onclick: () => socket.emit('start') }),
          ]);
        case States.Started:
          return m('div', [
            iconButton('stop', {}, { onclick: () => socket.emit('stop') }),
            iconButton('pause', {}, { onclick: () => socket.emit('pause') }),
          ]);
        case States.Stopped:
          return m('div', [iconButton('timer_off', {}, { onclick: () => socket.emit('reset') })]);
      }
    };
    return m('.button-group', controls());
  },
});
