import 'materialize-css/js/jquery.hammer';
import 'materialize-css/js/hammer.min';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import m, { RouteDefs, Vnode } from 'mithril';
import './styles.css';
import { Layout } from './views/layout';
import { Clock } from './views/clock';

const waitForMaterialize = () =>
  new Promise((resolve, reject) => {
    let iterations = 0;
    const handler = window.setInterval(() => {
      iterations++;
      const ma = (window as any).Materialize;
      if (
        ma.elementOrParentIsFixed &&
        ma.escapeHash &&
        ma.fadeInImage &&
        ma.guid &&
        ma.scrollFire &&
        ma.showStaggeredList &&
        ma.toast &&
        ma.updateTextFields
      ) {
        // tslint:disable-next-line:no-console
        console.log(`waited ${iterations} iterations for Materialize to finish loading`);
        window.clearInterval(handler);
        resolve();
      }
    }, 1);
  });

const routingTable: RouteDefs = {
  '/': {
    render: (vnode: Vnode<{ id: number; editing: boolean }>) => m(Layout, m(Clock)),
  },
};

waitForMaterialize()
  .then(() => m.route(document.body, '/', routingTable));
