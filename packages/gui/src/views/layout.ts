import { TimeControl } from './time-control';
import m, { Vnode } from 'mithril';
import logoUri from '../assets/logo/non-transparent-logo.png';
import backgroundUri from '../assets/background-clock.png';

const driverLink = 'a[href=http://www.driver-project.eu][target=_blank]';

export const Layout = () => ({
  view: (vnode: Vnode) =>
    m('container', [
      m('ul[id=slide-out]',
        { class: 'side-nav' },
        m('li', [
          m('.user-view', [
            m('.background', m(`img[src=${backgroundUri}]`)),
            m(driverLink, m(`img[src=${logoUri}]`, { class: 'circle' })),
            m(driverLink, m('span', { class: 'white-text name' }, 'DRIVER+')),
          ]),
        ]),
        m('li', m(TimeControl))
      ),
      m(
        'a[href=#][data-activates=slide-out]',
        { class: 'button-collapse' },
        m('i', { class: 'material-icons' }, 'menu')
      ),
      m('section', vnode.children),
    ]),
  oncreate: () => {
    ($('.button-collapse') as any).sideNav();
  },
});
