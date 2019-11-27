import './calendar.css';
import { SimulationState } from '../../models/sim-state';
import m from 'mithril';
import { SocketService } from '../../services/socket-service';
import { SocketChannels } from '../../models/socket-channels';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Calendar = () => {
  return {
    view: () => {
      const trialTime = new Date(SimulationState.trialTime);
      const month = monthNames[trialTime.getMonth()];
      const date = trialTime.getDate();
      const day = dayNames[trialTime.getDay()];
      return m('.cal.anim04c[id=calendar]', [
        m('.cal-signboard.cal-outer', [
          m('.cal-signboard.cal-front.cal-inner.anim04c', [
            m('.calMain.anim04c', [
              m('.cal-month.anim04c', m('span', `${month}`)),
              m('.cal-date.anim04c', m('span', `${date}`)),
              m('.cal-day.anim04c', m('span', `${day}`)),
            ]),
          ]),
          m('.cal-signboard.cal-left.cal-inner.anim04c'),
          m('.cal-signboard.cal-right.cal-inner.anim04c'),
        ]),
      ]);
    },
    oncreate: () => {
      SocketService.socket.on(SocketChannels.TIME, () => m.redraw());
    },
  };
};
