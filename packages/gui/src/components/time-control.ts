import '../../node_modules/mithril-timepicker/src/style.css';
import '../../node_modules/mithril-datepicker/src/style.css';
import { SimulationState } from '../models/sim-state';
import { States } from '../models/states';
import { iconButton } from '../utils/html';
import m from 'mithril';
import { SocketService } from '../services/socket-service';
import TimePicker, { ITimePickerTime } from 'mithril-timepicker';
import DatePicker from 'mithril-datepicker';

const socket = SocketService.socket;

let startTime = { h: 9, m: 0 } as ITimePickerTime;
let startDate = new Date();

let currentDate = new Date(SimulationState.trialTime);
let currentTime = { h: currentDate.getHours(), m: currentDate.getMinutes() } as ITimePickerTime;

export const TimeControl = () => ({
  oninit: () => {
    socket.on('stateUpdated', () => m.redraw());
  },
  view: () => {
    const controls = () => {
      switch (SimulationState.state) {
        case States.Idle:
          const time = startDate.setHours(startTime.h, startTime.m, 0, 0);
          return m('div.left', [
            iconButton(
              'timer',
              {},
              { onclick: () => socket.emit('init', time) }
            ),
            m('div.left', [
              m('label[for=tp]', 'Start time:'),
              m(TimePicker, {
                time: startTime,
                tfh: true,
                onchange: (t: ITimePickerTime) => {
                  startTime = t;
                },
              }),
              m('label[for=dp]', 'Start date:'),
              m(DatePicker, {
                weekStart: 1,
                onchange: (d: Date) => {
                  startDate = d;
                },
              }),
            ]),
          ]);
        case States.Initialized:
          return m('div', [
            iconButton(
              'play_arrow',
              {},
              { onclick: () => socket.emit('start') }
            ),
          ]);
        case States.Paused:
          const newTime = currentDate.setHours(currentTime.h, currentTime.m, 0, 0);
          return m('div', [
            iconButton('stop', {}, { onclick: () => socket.emit('stop') }),
            iconButton(
              'play_arrow',
              {},
              { onclick: () => socket.emit('start') }
            ),
            iconButton(
              'update',
              {},
              { onclick: () => socket.emit('update', 0, newTime) }
            ),
            m('div.left', [
              m('label[for=tp]', 'Updated time:'),
              m(TimePicker, {
                time: currentTime,
                tfh: true,
                onchange: (t: ITimePickerTime) => (currentTime = t),
              }),
              m('label[for=dp]', 'Updated date:'),
              m(DatePicker, {
                weekStart: 1,
                date: currentDate,
                onchange: (d: Date) => (currentDate = d),
              }),
            ]),
          ]);
        case States.Started:
          return m('div', [
            m(
              'h5',
              'Trial Time Speed Factor: ' + SimulationState.trialTimeSpeed
            ),
            iconButton(
              'fast_rewind',
              {},
              {
                onclick: () => {
                  socket.emit('update', SimulationState.trialTimeSpeed / 2);
                },
              }
            ),
            iconButton('stop', {}, { onclick: () => socket.emit('stop') }),
            iconButton('pause', {}, { onclick: () => socket.emit('pause') }),
            iconButton(
              'fast_forward',
              {},
              {
                onclick: () => {
                  socket.emit('update', SimulationState.trialTimeSpeed * 2);
                },
              }
            ),
            iconButton(
              'restore',
              {},
              {
                onclick: () => {
                  socket.emit('update', 1);
                },
              }
            ),
          ]);
        case States.Stopped:
          return m('div', [
            iconButton('timer_off', {}, { onclick: () => socket.emit('reset') }),
          ]);
      }
    };
    return m('.button-group', controls());
  },
});
