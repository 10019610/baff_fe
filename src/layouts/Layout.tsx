import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Navbar from './Navbar.tsx';
import Footer from '../components/footer/Footer.tsx';

const Layout = () => {
  return (
    <div>
      {/* header */}
      {/* body */}
      <Header />
      <Outlet />
      {/* footer */}
      <Footer />
      {/* navbar */}
      <Navbar />
    </div>
  );
};

export default Layout;
