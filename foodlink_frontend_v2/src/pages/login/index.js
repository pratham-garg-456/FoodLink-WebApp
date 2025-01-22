import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `https://foodlink-backend-v1.onrender.com/api/v1/foodlink/auth/signin`,
        {
          email,
          password,
        }
      );
      console.log('Login successful:', response.data);
      // Handle successful login here (e.g., redirect to another page)
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login failure here (e.g., show error message)
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
