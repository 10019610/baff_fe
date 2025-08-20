import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';

const Layout = () => {
  return (
    <div>
      {/* header */}
      {/* body */}
      <Header />
      <Outlet />
      {/* footer */}
      {/* navbar */}
    </div>
  );
};

export default Layout;
