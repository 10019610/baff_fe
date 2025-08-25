import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Navbar from './Navbar.tsx';
import Footer from '../components/footer/Footer.tsx';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <div>
      {/* header */}
      <Header />
      {/* body */}
      <div className="flex-1 pb-4 md:pb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
      {/* footer */}
      <Footer />
      {/* navbar */}
      <Navbar />
      <Toaster />
    </div>
  );
};

export default Layout;
