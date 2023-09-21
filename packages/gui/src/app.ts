import { SocketService } from './services/socket-service';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min.js';
// import 'material-icons/iconfont/material-icons.css';
import './styles.css';
import m, { RouteDefs } from 'mithril';
import { Layout } from './views/layout';
import { Clock } from './components/clock';
import { VideoPlayer, DigitalClock, Calendar, Billboard } from './components';

const waitForSocketIO = () =>
  new Promise((resolve) => {
    console.log('Starting....');
    // let iterations = 0;
    const handler = window.setInterval(() => {
      // iterations++;
      const socket = SocketService.socket;
      if (socket.connected) {
        // console.warn(`waited ${iterations} iterations for SocketIO to finish loading`);
        window.clearInterval(handler);
        resolve(socket);
      }
    }, 100);
  });

const routingTable: RouteDefs = {
  '/': {
    render: () => m(Layout, { theme: '.black-theme' }, [m(DigitalClock), m(Calendar), m(Billboard), m(VideoPlayer)]),
  },
  '/analog': {
    render: () => m(Layout, { theme: '.white-theme' }, [m(Clock), m(Calendar)]),
  },
};

waitForSocketIO().then(() => m.route(document.body, '/', routingTable));
