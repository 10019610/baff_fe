import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div>
            {/* header */}
            {/* body */}
            <Outlet />
            {/* footer */}
            {/* navbar */}
        </div>
    );
};

export default Layout;
