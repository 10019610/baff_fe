import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

const OAuthPage = () => {
  const navigate = useNavigate();
  const { token, expirationTime } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  console.log('OAuthPage', token);

  useEffect(() => {
    console.log('OAuthPage', token);
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('good');
        navigate('/');
      } else {
        console.log('bad');
      }
    }
    // if (token && expirationTime) {
    //   navigate('/');
    // }
  }, [isLoading, isAuthenticated, navigate]);

  return <div>OAuth</div>;
};

export default OAuthPage;
