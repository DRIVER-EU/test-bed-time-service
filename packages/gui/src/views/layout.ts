import { TimeControl } from '../components/time-control';
import m, { Vnode } from 'mithril';
import logoUri from '../assets/logo/non-transparent-logo.png';
import backgroundUri from '../assets/background-clock.png';
import M from 'materialize-css';

const driverLink = 'a[href=http://www.driver-project.eu][target=_blank]';

export const Layout = () => ({
  view: (vnode: Vnode) =>
    m('container', [
      m(
        'ul[id=slide-out].sidenav', { style: 'width: 350px;' }
        m('li', [
          m('.user-view', [
            m('.background', m(`img[src=${backgroundUri}]`)),
            m(driverLink, m(`img.circle[src=${logoUri}]`)),
            m(driverLink, m('span.white-text.name', 'DRIVER+')),
          ]),
        ]),
        m('li', m(TimeControl))
      ),
      m('a.sidenav-trigger.almost-hidden[href=#][data-target=slide-out]', m('i.material-icons', 'menu')),
      m('section', vnode.children),
    ]),
  oncreate: () => {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
  },
});
