import m from 'mithril';
import { InfoMsg, SocketChannels } from '../models';
import { SocketService } from '../services/socket-service';

export const Billboard = () => {
  let headline: string = '';
  let description: string = '';

  return {
    oninit: () => {
      SocketService.socket.on(SocketChannels.BILLBOARD, (msg: InfoMsg) => {
        headline = msg.headline;
        description = msg.description;
        m.redraw();
      });
    },
    view: () => {
      return m(
        '#billboard.billboard',
        m('.message', { className: 'center' }, [m('h1', headline), m('div', description)])
      );
    },
  };
};
