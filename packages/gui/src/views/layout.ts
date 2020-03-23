import { TimeControl } from '../components/time-control';
import { ModalPanel } from 'mithril-materialized';
import m, { Vnode, FactoryComponent } from 'mithril';
import logoUri from '../assets/logo/non-transparent-logo.png';
import backgroundUri from '../assets/background-clock.png';
import M from 'materialize-css';
import { SocketService } from '../services/socket-service';

const driverLink = 'a[href=http://www.driver-project.eu][target=_blank]';

export const Layout: FactoryComponent<{ theme: string }> = () => ({
  view: (vnode: Vnode<{ theme: string }>) =>
    m(vnode.attrs.theme, [
      m('a.sidenav-trigger.almost-hidden[href=/][data-target=slide-out]', m('i.material-icons', 'menu')),
      m('#main', [
        m(
          'ul#slide-out.sidenav',
          { style: 'width: 350px;' },
          m('li', [
            m('.user-view', [
              m('.background', m(`img[src=${backgroundUri}]`)),
              m(driverLink, m(`img.circle[src=${logoUri}]`)),
              m(driverLink, m('span.white-text.name', 'DRIVER+')),
            ]),
          ]),
          m('li', m(TimeControl))
        ),
        m('div', vnode.children),
        m(ModalPanel, {
          id: 'stopPanel',
          title: 'Are you certain you want to stop?',
          description: 'After stopping the time service, you will not be able to continue anymore.',
          buttons: [
            { label: 'No, bring me back to safety' },
            { label: 'Yes, I am sure!', onclick: () => SocketService.socket.emit('stop') },
          ],
        }),
      ]),
    ]),
  oncreate: () => {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
  },
});
