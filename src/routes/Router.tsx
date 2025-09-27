import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout';
import GoalsPage from '../pages/GoalsPage.tsx';
import WeightTrackerPage from '../pages/WeightTrackerPage.tsx';
import PrivateRoute from './PrivateRoute.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import OAuthPage from '../pages/OAuthPage.tsx';
import AdminPage from '../pages/AdminPage.tsx';
import ProfilePage from '../pages/ProfilePage.tsx';
import AnalyticsPage from '../pages/AnalyticsPage.tsx';
import DashboardPage from '../pages/DashboardPage.tsx';
import BattlePage from '../pages/BattlePage.tsx';
import InvitePage from '../pages/InvitePage.tsx';
import LoginErrorPage from '../pages/LoginErrorPage.tsx';
import { WithdrawalPage } from '../pages/WithdrawalPage.tsx';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage.tsx';
import { TermsPage } from '../pages/TermsPage.tsx';

const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/error=auth_failed" element={<LoginErrorPage />} />
      <Route element={<Layout />}>
        <Route
          path="/user/oauth-response/:token/:expirationTime"
          element={<OAuthPage />}
        />
        {/* 초대 링크 전용 페이지 (PrivateRoute 밖) */}
        <Route path="/invite" element={<InvitePage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/weightTracker" element={<WeightTrackerPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/battle/*" element={<BattlePage />} />
        </Route>
        <Route path="/admin">
          <Route path="dashboard" element={<AdminPage />} />
        </Route>
        <Route path="/user">
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="withdrawal" element={<WithdrawalPage />} />
        </Route>
        <Route path="/legal">
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
