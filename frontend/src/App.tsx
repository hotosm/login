import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter basename="/app">
          <Routes>
            {/* Root path serves the login page */}
            <Route path="/" element={<LoginPage />} />
            {/* Profile page for user settings */}
            <Route path="/profile" element={<ProfilePage />} />
            {/* Admin page for managing user mappings */}
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
