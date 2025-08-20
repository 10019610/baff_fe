import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import Router from './routes/Router';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Router />
    </BrowserRouter>
);
