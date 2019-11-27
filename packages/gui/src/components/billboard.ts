import m from 'mithril';
import { SimulationState } from '../models/sim-state';
import { SocketService } from '../services/socket-service';
import { SocketChannels } from '../models/socket-channels';
import { IRolePlayerMessage } from '../models/role-player-message';

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
              headline: 'headline',
              description: 'blsjlas sd s fsdk fsdfk skfh ksdhfjkhsf hsfhjksjklf sdhf sdfk',
            } as IRolePlayerMessage);
      const { headline, description } = msg;
      const className = description ? '' : 'center';
      console.log(msg);
      return m('.billboard[id=billboard]', m('.message', { className }, [m('h1', headline), m('div', description)]));
    },
  };
};
