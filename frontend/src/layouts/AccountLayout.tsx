import { NavLink, Outlet } from 'react-router-dom';
import '@hotosm/tool-menu';
import hotLogo from '../assets/images/hot-logo.svg';
import { useLanguage } from '../contexts/LanguageContext';
import { useRoles } from '../hooks/useRoles';

// Shared chrome for the account section: top bar with the HOT logo + tool menu
// and a left sidebar with navigation. The page content renders in <Outlet/>.
function AccountLayout() {
  const { t, currentLanguage } = useLanguage();
  const { isAdmin, isAccountManager } = useRoles();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-hot-red-50 text-hot-red-600'
        : 'text-hot-gray-700 hover:bg-hot-gray-50'
    }`;

  // Admin is a superuser area: styled distinctly (amber + shield) so it clearly
  // reads as elevated access, separate from the regular account nav.
  const adminNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-amber-100 text-amber-800'
        : 'text-amber-700 hover:bg-amber-50'
    }`;

  return (
    <div className="min-h-screen bg-hot-gray-50">
      {/* Top chrome (logo + tool menu), replaces each page's own header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src={hotLogo} alt="HOT" className="h-10" />
          <hotosm-tool-menu lang={currentLanguage} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-xl p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-hot-gray-500 px-3 mb-3">
              {t('hotAccount')}
            </h2>
            <nav className="space-y-1">
              <NavLink to="/profile" className={navClass}>
                {t('navProfile')}
              </NavLink>
              <NavLink to="/organizations" className={navClass}>
                {t('navOrganizations')}
              </NavLink>
              <NavLink to="/teams" className={navClass}>
                {t('navTeams')}
              </NavLink>
              {(isAdmin || isAccountManager) && (
                <>
                  <div className="my-2 border-t border-hot-gray-200" />
                  <NavLink to="/admin" className={adminNavClass}>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    {t('navAdmin')}
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AccountLayout;
