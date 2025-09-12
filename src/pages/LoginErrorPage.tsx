import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const LoginErrorPage = () => {
  const [searchParams] = useSearchParams();
  const [errorInfo, setErrorInfo] = useState({
    error: '',
    message: '',
    details: '',
  });

  useEffect(() => {
    const error = searchParams.get('error') || 'No error code provided';
    const message = searchParams.get('message') || 'No error message provided';
    const details = searchParams.get('details') || 'No details provided';
    setErrorInfo({ error, message, details });
  }, [searchParams]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Login Error</h1>
      <p>
        An error occurred during the login process. Here is the information we
        have:
      </p>
      <div
        style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        <strong>Error Code:</strong> {errorInfo.error}
        <br />
        <strong>Message:</strong> {errorInfo.message}
        <br />
        <strong>Details:</strong>
        <pre>{errorInfo.details}</pre>
      </div>
      <p>
        Please take a screenshot of this page and send it to the developer.
      </p>
    </div>
  );
};

export default LoginErrorPage;
