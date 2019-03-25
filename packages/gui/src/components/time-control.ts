import m, { Component } from 'mithril';
import { SimulationState } from '../models/sim-state';
import { States } from '../models/states';
import { SocketService } from '../services/socket-service';
import { TimePicker, DatePicker, FlatButton, ModalPanel } from 'mithril-materialized';
import { padLeft, formatTime } from '../utils';

const Controls = () => {
  return {
    view: ({ attrs }) => {
      const { socket, isPaused, canChangeSpeed } = attrs;
      return [
        m(FlatButton, {
          iconName: 'fast_rewind',
          onclick: () => socket.emit('update', SimulationState.trialTimeSpeed / 2),
          disabled: !canChangeSpeed,
        }),
        m(FlatButton, {
          modalId: 'stopPanel',
          iconName: 'stop',
          disabled: SimulationState.state === States.Initialized,
        }),
        isPaused
          ? m(FlatButton, { iconName: 'play_arrow', onclick: () => socket.emit('start') })
          : m(FlatButton, { iconName: 'pause', onclick: () => socket.emit('pause') }),
        m(FlatButton, {
          iconName: 'fast_forward',
          onclick: () => socket.emit('update', SimulationState.trialTimeSpeed * 2),
          disabled: !canChangeSpeed,
        }),
      ];
    },
  } as Component<{
    socket: SocketIOClient.Socket;
    canChangeSpeed: boolean;
    isPaused: boolean;
  }>;
};

export const TimeControl = () => {
  const socket = SocketService.socket;

  let startTime = '10:00';
  let startDate = new Date();

  const newTime = () => {
    const [hours, minutes] = startTime.split(':').map(v => +v);
    return startDate.setUTCHours(hours, minutes, 0, 0);
  };

  const timeHasNotChanged = () => {
    const d = new Date(SimulationState.trialTime);
    return (
      startTime === formatTime(d, false) &&
      startDate.getUTCFullYear() === d.getUTCFullYear() &&
      startDate.getUTCMonth() === d.getUTCMonth() &&
      startDate.getUTCDate() === d.getUTCDate()
    );
  };

  const onSelect = (hrs: number, min: number) => {
    startTime = `${padLeft(hrs, 2)}:${padLeft(min, 2)}`;
  };

  return {
    oninit: () => {
      socket.on('stateUpdated', () => m.redraw());
    },
    view: () => {
      const controls = () => {
        switch (SimulationState.state) {
          case States.Idle:
            return m('.row.left', [
              m(FlatButton, {
                label: 'Initialise time',
                contentClass: 'btn-flat-large',
                iconName: 'timer',
                iconClass: 'medium',
                onclick: () => socket.emit('init', newTime()),
              }),
              m('.row.left', [
                m(TimePicker, {
                  label: 'Start time:',
                  container: '#main',
                  initialValue: startTime,
                  twelveHour: false,
                  onSelect,
                }),
                m(DatePicker, {
                  label: 'Start date:',
                  container: document.getElementById('main') as Element,
                  onchange: (d: Date) => {
                    startDate = d;
                  },
                }),
              ]),
            ]);
          case States.Initialized:
            return m('.row', [
              m(Controls, { socket, isPaused: true, canChangeSpeed: false }),
              m(FlatButton, {
                label: 'Reset time',
                iconName: 'timer_off',
                onclick: () => socket.emit('reset'),
              }),
            ]);
          case States.Paused:
            return m('.row', [
              m(Controls, { socket, isPaused: true, canChangeSpeed: false }),
              m('.row.left', [
                m(TimePicker, {
                  label: 'Updated time:',
                  container: '#main',
                  initialValue: startTime,
                  twelveHour: false,
                  onSelect,
                }),
                m(DatePicker, {
                  label: 'Updated date:',
                  container: document.getElementById('main') as Element,
                  initialValue: startDate,
                  onchange: (d: Date) => {
                    startDate = d;
                  },
                }),
                m(FlatButton, {
                  label: 'Update time',
                  iconName: 'update',
                  disabled: timeHasNotChanged(),
                  onclick: () => socket.emit('update', 0, newTime()),
                }),
              ]),
            ]);
          case States.Started:
            return m('.row', [
              m(Controls, { socket, isPaused: false, canChangeSpeed: true }),
              m('.row', [
                m('em', 'Trial Time Speed Factor: ' + SimulationState.trialTimeSpeed),
                SimulationState.trialTimeSpeed !== 1
                  ? m(FlatButton, { iconName: 'restore', onclick: () => socket.emit('update', 1) })
                  : undefined,
              ]),
            ]);
          case States.Stopped:
            return m(
              '.row',
              m(FlatButton, { label: 'Reset time', iconName: 'timer_off', onclick: () => socket.emit('reset') })
            );
        }
      };
      return m('.button-group', [controls()]);
    },
  };
};
