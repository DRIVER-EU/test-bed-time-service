import m, { FactoryComponent } from 'mithril';
import './video-player.css';
import { InfoMsg, InfoMsgType, SocketChannels } from '../../models';
import { SocketService } from '../../services/socket-service';
import { TIME_SERVICE_MUTED } from '../../views/layout';

export const VideoPlayer: FactoryComponent = () => {
  let videoEl: HTMLVideoElement;
  let video: string = '';
  let videoType: string = '';

  const setVideo = (v: InfoMsg) => {
    console.log(v);
    if (!v) return;
    if (v.type === InfoMsgType.CLEAR) {
      videoEl.setAttribute('style', 'display: none');
      video = '';
      videoType = '';
    } else if (v.filename) {
      // Define a mapping of common video extensions to MIME types
      const videoExtensions: { [key: string]: string } = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogv: 'video/ogg',
        avi: 'video/x-msvideo',
        mkv: 'video/x-matroska',
        flv: 'video/x-flv',
        wmv: 'video/x-ms-wmv',
        '3gp': 'video/3gpp',
        mov: 'video/quicktime',
        mpeg: 'video/mpeg',
        mpg: 'video/mpeg',
      };
      const ext = v.filename.split('.').pop()?.toLowerCase();
      if (!ext) return;
      videoType = videoExtensions[ext];
      if (!videoType) return;
      video = v.filename;
      console.table({ video, videoType });
      videoEl.setAttribute('style', 'display: block');
    }
    m.redraw();
  };

  return {
    oninit: () => {
      console.log('Initializing video');
      SocketService.socket.on(SocketChannels.VIDEO, (msg: InfoMsg) => setVideo(msg));
    },
    view: () => {
      const muted = localStorage.getItem(TIME_SERVICE_MUTED) === '1';
      return m(
        'video#video_player',
        {
          autoplay: true,
          muted,
          controls: true,
          width: '100%',
          height: '100%',
          oncreate: ({ dom }) => {
            console.log(dom);
            videoEl = dom as HTMLVideoElement;
            videoEl.load();
            videoEl.onended = () => {
              videoEl.setAttribute('style', 'display: none');
              video = '';
              videoType = '';
              m.redraw();
            };
          },
        },
        video && m('source', { src: 'http://' + SOCKET_IO_SERVER + '/time/videos/' + video, type: videoType }),
        'Your browser does not support HTML5 video.'
      );
    },
  };
};
