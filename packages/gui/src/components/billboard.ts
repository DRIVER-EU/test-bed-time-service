import m from 'mithril';
import { IRolePlayerMessage, SimulationState, SocketChannels } from '../models';
import { SocketService } from '../services/socket-service';

export const Billboard = () => {
  return {
    oninit: () => {
      SocketService.socket.on(SocketChannels.BILLBOARD, () => m.redraw());
    },
    view: () => {
      const { messageQueue } = SimulationState;
      const msg =
        messageQueue.length > 0
          ? messageQueue[messageQueue.length - 1]
          : ({
              headline: '',
              description: '',
            } as IRolePlayerMessage);
      const { headline, description } = msg;
      const className = 'center';
      return m('.billboard[id=billboard]', m('.message', { className }, [m('h1', headline), m('div', description)]));
    },
  };
};
