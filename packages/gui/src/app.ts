import { SocketService } from './services/socket-service';
// import 'materialize-css/js/jquery.hammer';
// import 'materialize-css/js/hammer.min';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.js';
// import 'materialize-css/dist/js/materialize.min';
import M from 'materialize-css';
import m, { RouteDefs } from 'mithril';
import { Layout } from './views/layout';
import { Clock } from './components/clock';
import { Calendar } from './components/calendar/calendar';
import './styles.css';

const log = console.log;

const waitForMaterialize = () =>
  new Promise((resolve) => {
    let iterations = 0;
    const handler = window.setInterval(() => {
      iterations++;
      const ma = (window as any).Materialize;
      if (
        // ma.elementOrParentIsFixed &&
        // ma.escapeHash &&
        // ma.fadeInImage &&
        // ma.guid &&
        // ma.scrollFire &&
        // ma.showStaggeredList &&
        // ma.toast &&
        ma.updateTextFields
      ) {
        log(`waited ${iterations} iterations for Materialize to finish loading`);
        window.clearInterval(handler);
        resolve();
      }
    }, 1);
  });

const waitForSocketIO = () =>
  new Promise((resolve) => {
    let iterations = 0;
    const handler = window.setInterval(() => {
      iterations++;
      const socket = SocketService.socket;
      if (socket.connected) {
        log(`waited ${iterations} iterations for SocketIO to finish loading`);
        window.clearInterval(handler);
        resolve();
      }
    }, 1);
  });

const routingTable: RouteDefs = {
  '/': {
    render: () => m(Layout, [m(Clock), m(Calendar)]),
  },
};

// tslint:disable-next-line:no-console
console.log(M);

// waitForMaterialize()
  // .then(() => waitForSocketIO())
waitForSocketIO().then(() => m.route(document.body, '/', routingTable));
