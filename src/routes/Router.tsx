import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout';
import GoalsPage from '../pages/GoalsPage.tsx';
import WeightTrackerPage from '../pages/WeightTrackerPage.tsx';
import PrivateRoute from './PrivateRoute.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import OAuthPage from '../pages/OAuthPage.tsx';
import AdminPage from '../pages/AdminPage.tsx';
import ProfilePage from '../pages/ProfilePage.tsx';

const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/user/oauth-response/:token/:expirationTime" element={<OAuthPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<WeightTrackerPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Route>
        <Route path="/admin">
          <Route path="dashboard" element={<AdminPage />} />
        </Route>
        <Route path="/user">
          <Route path="profile/:userId" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
