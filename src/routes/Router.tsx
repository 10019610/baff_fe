import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout';
import MainPage from '../pages/MainPage';
import GoalsPage from '../pages/GoalsPage.tsx';

const Router = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path='/' element={<MainPage />} />
                <Route path='/goals' element={<GoalsPage />} />
            </Route>
        </Routes>
    );
};

export default Router;
