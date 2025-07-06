import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from 'src/Pages/LoginPage';
import DashboardPage from 'src/Pages/DashboardPage';
import ClaimDetailPage from 'src/Pages/ClaimDetailPage';
import NewClaimPage from 'src/Pages/NewClaimPage';
import ProfilePage from 'src/Pages/ProfilePage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/claims/new" element={<NewClaimPage />} />
        <Route path="/claims/:id" element={<ClaimDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
