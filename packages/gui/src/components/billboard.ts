import m from 'mithril';
import { InfoMsg, InfoMsgType, SocketChannels } from '../models';
import { SocketService } from '../services/socket-service';

export const Billboard = () => {
  let headline: string = '';
  let description: string = '';

  return {
    oninit: () => {
      SocketService.socket.on(SocketChannels.BILLBOARD, (msg: InfoMsg) => {
        console.log(msg);
        if (msg.type === InfoMsgType.CLEAR) {
          headline = '';
          description = '';
        } else {
          headline = msg.headline;
          description = msg.description;
        }
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
