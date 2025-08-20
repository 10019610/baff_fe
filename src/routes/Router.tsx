import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout';
import MainPage from '../pages/MainPage';

const Router = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path='/' element={<MainPage />} />
            </Route>
        </Routes>
    );
};

export default Router;
