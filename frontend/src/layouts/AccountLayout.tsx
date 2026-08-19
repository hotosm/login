import { Outlet } from 'react-router-dom';
import '@hotosm/tool-menu';
import externalLinkIcon from '../assets/icons/box-arrow-up-right.svg';
import hotLogo from '../assets/images/hot-logo.svg';
import SidebarNav, { type SidebarNavItem } from '../components/SidebarNav';
import { useLanguage } from '../contexts/LanguageContext';
import { useRoles } from '../hooks/useRoles';


function AccountLayout() {
  const { t, currentLanguage } = useLanguage();
  const { isAdmin, isAccountManager } = useRoles();

  const navItems: SidebarNavItem[] = [
    { to: '/profile', label: t('navProfile') },
    /* { to: '/organizations', label: t('navOrganizations') }, */
    { to: '/teams', label: t('navTeams') },
    /* { to: '/notifications', label: t('navNotifications') }, */
  ];

  if (isAdmin || isAccountManager) {
    navItems.push(
      /* { to: '/orgs-to-approve', label: t('navOrgsToApprove'), elevated: true }, */
      {
        to: '/admin',
        label: t('navAdmin'),
        elevated: true,
        icon: externalLinkIcon,
        newTab: true,
      },
    );
  }

  return (
    <div className="min-h-screen bg-hot-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src={hotLogo} alt="HOT" className="h-10" />
          <hotosm-tool-menu lang={currentLanguage} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        <aside className="md:w-56 flex-shrink-0">
          <SidebarNav title={t('hotAccount')} items={navItems} />
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AccountLayout;
