import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AccountLayout from './layouts/AccountLayout';
import AcceptInvitePage from './pages/AcceptInvitePage';
import AdminPage from './pages/AdminPage';
import LinkLearnWorldsPage from './pages/LinkLearnWorldsPage';
import LoginPage from './pages/LoginPage';
import NotificationsPage from './pages/NotificationsPage';
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import OrganizationsPage from './pages/OrganizationsPage';
import OrgsToApprovePage from './pages/OrgsToApprovePage';
import ProfilePage from './pages/ProfilePage';
import TeamDetailPage from './pages/TeamDetailPage';
import TeamsPage from './pages/TeamsPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter basename="/app">
          <Routes>
            {/* Root path serves the login page (outside the account chrome) */}
            <Route path="/" element={<LoginPage />} />

            {/* Claim an existing LearnWorlds account before the LMS makes a
                new one. Outside the account chrome: it is a stop on the way
                to learn.hotosm.org, not a section of the site. */}
            <Route path="/link/learnworlds" element={<LinkLearnWorldsPage />} />

            {/* Account section: shared sidebar + top chrome via AccountLayout */}
            <Route element={<AccountLayout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route
                path="/organizations/:id"
                element={<OrganizationDetailPage />}
              />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/:id" element={<TeamDetailPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              {/* Organization approvals (admin / account manager only) */}
              <Route path="/orgs-to-approve" element={<OrgsToApprovePage />} />
              {/* Accepts an organization invitation from ?token= */}
              <Route path="/invite" element={<AcceptInvitePage />} />
            </Route>

            {/* Admin page keeps its own full-width chrome */}
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
