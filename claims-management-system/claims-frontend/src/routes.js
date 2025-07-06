import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HospitalLoginPage from './Pages/HospitalLoginPage';
import PatientLoginPage from './Pages/PatientLoginPage.js';
import InsurerLoginPage from './Pages/InsurerLoginPage';
import AdminLoginPage from './Pages/AdminLoginPage';
import DashboardPage from './Pages/DashboardPage';
import ClaimDetailPage from './Pages/ClaimDetailPage';
import NewClaimPage from './Pages/NewClaimPage';
import ProfilePage from './Pages/ProfilePage';
import SelectLoginPage from './Pages/SelectLoginPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectLoginPage />} />
        <Route path="/login/hospital" element={<HospitalLoginPage />} />
        <Route path="/login/patient" element={<PatientLoginPage />} />
        <Route path="/login/insurer" element={<InsurerLoginPage />} />
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/claims/new" element={<NewClaimPage />} />
        <Route path="/claims/:id" element={<ClaimDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;