import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout';
import GoalsPage from '../pages/GoalsPage.tsx';
import WeightTrackerPage from '../pages/WeightTrackerPage.tsx';
import PrivateRoute from './PrivateRoute.tsx';
import LoginPage from '../pages/LoginPage.tsx';

const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<WeightTrackerPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
