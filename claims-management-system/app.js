
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [token, setToken] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', form);
      setToken(response.data.token);
      alert('Login successful!');
    } catch (err) {
      alert('Login failed: ' + err.response?.data?.error);
    }
  };

  return (
    <div className="App">
      <h2>Login</h2>
      <input name="username" onChange={handleChange} placeholder="Username" />
      <input name="password" type="password" onChange={handleChange} placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
      {token && <p>Token: {token}</p>}
    </div>
  );
}

export default App;