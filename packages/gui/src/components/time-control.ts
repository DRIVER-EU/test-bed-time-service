import m, { Component } from 'mithril';
import { SimulationState } from '../models/sim-state';
import { States } from '../models/states';
import { SocketService } from '../services/socket-service';
import { TimePicker, DatePicker, FlatButton } from 'mithril-materialized';
import { padLeft, formatTime } from '../utils';

const Controls = () => {
  return {
    view: ({ attrs }) => {
      const { socket, isPaused, canChangeSpeed } = attrs;
      return [
        m(FlatButton, {
          iconName: 'fast_rewind',
          ui: { onclick: () => socket.emit('update', SimulationState.trialTimeSpeed / 2), disabled: !canChangeSpeed },
        }),
        m(FlatButton, { iconName: 'stop', ui: { onclick: () => socket.emit('stop') } }),
        isPaused
          ? m(FlatButton, {
              iconName: 'play_arrow',
              ui: {
                onclick: () =>
                  SimulationState.state === States.Initialized ? socket.emit('start', 1) : socket.emit('start'),
              },
            })
          : m(FlatButton, { iconName: 'pause', ui: { onclick: () => socket.emit('pause') } }),
        m(FlatButton, {
          iconName: 'fast_forward',
          ui: { onclick: () => socket.emit('update', SimulationState.trialTimeSpeed * 2), disabled: !canChangeSpeed },
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
    return startDate.setHours(hours, minutes, 0, 0);
  };

  const timeHasNotChanged = () => {
    const d = new Date(SimulationState.trialTime);
    return (
      startTime === formatTime(d, false) &&
      startDate.getFullYear() === d.getFullYear() &&
      startDate.getMonth() === d.getMonth() &&
      startDate.getDate() === d.getDate()
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
                ui: { onclick: () => socket.emit('init', newTime()) },
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
            return m('.row', m(Controls, { socket, isPaused: true, canChangeSpeed: false }));
          // return m(
          //   '.row',
          //   m(FlatButton, { iconName: 'play_arrow', ui: { onclick: () => socket.emit('start', newTime()) } })
          // );
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
                  ui: {
                    disabled: timeHasNotChanged(),
                    onclick: () => socket.emit('update', 0, newTime()),
                  },
                }),
              ]),
            ]);
          case States.Started:
            return m('.row', [
              m(Controls, { socket, isPaused: false, canChangeSpeed: true }),
              m('.row', [
                m('em', 'Trial Time Speed Factor: ' + SimulationState.trialTimeSpeed),
                SimulationState.trialTimeSpeed !== 1
                  ? m(FlatButton, { iconName: 'restore', ui: { onclick: () => socket.emit('update', 1) } })
                  : undefined,
              ]),
            ]);
          case States.Stopped:
            return m(
              '.row',
              m(FlatButton, { label: 'Reset time', iconName: 'timer_off', ui: { onclick: () => socket.emit('reset') } })
            );
        }
      };
      return m('.button-group', controls());
    },
  };
};
