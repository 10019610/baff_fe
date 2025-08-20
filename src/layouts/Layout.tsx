import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Navbar from './Navbar.tsx';

const Layout = () => {
  return (
    <div>
      {/* header */}
      {/* body */}
      <Header />
      <Outlet />
      {/* footer */}
      {/* navbar */}
      <Navbar />
    </div>
  );
};

export default Layout;
