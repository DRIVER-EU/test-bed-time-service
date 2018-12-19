import { SocketService } from './services/socket-service';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.js';
import 'material-icons/iconfont/material-icons.css';
import M from 'materialize-css';
import './styles.css';
import m, { RouteDefs } from 'mithril';
import { Layout } from './views/layout';
import { Clock } from './components/clock';
import { DigitalClock } from './components/digital-clock';
import { Calendar } from './components/calendar/calendar';

const waitForSocketIO = () =>
  new Promise((resolve) => {
    // let iterations = 0;
    const handler = window.setInterval(() => {
      // iterations++;
      const socket = SocketService.socket;
      // console.warn(`waited ${iterations} iterations for SocketIO to path ` + socket + ` to finish loading`);
      if (socket.connected) {
        // console.warn(`waited ${iterations} iterations for SocketIO to path ` + socket + ` to finish loading`);
        window.clearInterval(handler);
        resolve();
      }
    }, 1);
  });

const routingTable: RouteDefs = {
  '/': {
    render: () => m(Layout, { theme: '.black-theme' }, [m(DigitalClock), m(Calendar)]),
  },
  '/analog': {
    render: () => m(Layout, { theme: '.white-theme' }, [m(Clock), m(Calendar)]),
  },
};

// waitForMaterialize()
  // .then(() => waitForSocketIO())
//m.route.prefix("/time-service")
waitForSocketIO().then(() => m.route(document.body, '/', routingTable));
