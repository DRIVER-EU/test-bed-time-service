import { TimeControl } from '../components/time-control';
import m, { Vnode } from 'mithril';
import logoUri from '../assets/logo/non-transparent-logo.png';
import backgroundUri from '../assets/background-clock.png';

const driverLink = 'a[href=http://www.driver-project.eu][target=_blank]';

export const Layout = () => ({
  view: (vnode: Vnode) =>
    m('container', [
      m(
        'ul[id=slide-out]',
        { class: 'side-nav' },
        m('li', [
          m('.user-view', [
            m('.background', m(`img[src=${backgroundUri}]`)),
            m(driverLink, m(`img.circle[src=${logoUri}]`)),
            m(driverLink, m('span.white-text.name', 'DRIVER+')),
          ]),
        ]),
        m('li', m(TimeControl))
      ),
      m('a.button-collapse.almost-hidden[href=#][data-activates=slide-out]', m('i.material-icons', 'menu')),
      m('section', vnode.children),
    ]),
  oncreate: () => {
    ($('.button-collapse') as any).sideNav();
  },
});
