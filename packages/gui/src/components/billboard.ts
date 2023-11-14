import m from 'mithril';
import { InfoMsg, InfoMsgType, SocketChannels } from '../models';
import { SocketService } from '../services/socket-service';
import chimeSrc from '../assets/chime.mp3';
import { render } from 'slimdown-js';

export const Billboard = () => {
  let headline: string = '';
  let description: string = '';
  let chimeSound: HTMLAudioElement;

  const playChime = () => {
    console.log('PLAY CHIME')
    if (!chimeSound) return;
    // Check if the audio is already playing and stop it if it is
    if (!chimeSound.paused) {
      chimeSound.pause();
      chimeSound.currentTime = 0;
    }
    // Play the chime sound
    chimeSound.play();
  }

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
          playChime();
        }
        m.redraw();
      });
    },
    view: () => {
      return [
        m('audio#chimeSound', { src: chimeSrc, style: 'display: none;', oncreate: ({ dom }) => chimeSound = dom as HTMLAudioElement }),
        m(
          '#billboard.billboard',
          m('.message', { className: 'center' }, [m('h1', m.trust(render(headline, true))), m('div', m.trust(render(description, true)))])
        )];
    },
  };
};
