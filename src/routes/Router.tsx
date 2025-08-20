import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout';
import GoalsPage from '../pages/GoalsPage.tsx';
import WeightTrackerPage from '../pages/WeightTrackerPage.tsx';

const Router = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<WeightTrackerPage />} />
        <Route path="/goals" element={<GoalsPage />} />
      </Route>
    </Routes>
  );
};

export default Router;
