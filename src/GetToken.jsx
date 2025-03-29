import { useEffect, useState } from 'react';

const GetToken = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken || 'No token found');
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Authentication Token</h2>
      <p>Use this for testing API endpoints:</p>
      <textarea 
        readOnly
        value={token}
        style={{ 
          width: '100%', 
          height: '100px', 
          marginTop: '10px',
          padding: '10px'
        }}
      />
    </div>
  );
};

export default GetToken;
