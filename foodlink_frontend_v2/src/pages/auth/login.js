import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(''); // Clear any previous error

    try {
      // Call the Next.js API route that handles authentication
      const response = await axios.post('/api/auth', { email, password });

      if (response.data.token) {
        // ✅ Store token in localStorage
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('userRole', response.data.role);
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new Event('storage'));
        router.push('/dashboard'); // Redirect user to dashboard
      } else {
        setError('Authentication failed.');
      }
    } catch (error) {
      // Extract error message from the response
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
        console.error(error);
      }
    }
  };

  return (
    <div className="flex items-center justify-center ">
      <div className="w-80 md:w-96 p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-black rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <a href="/auth/register" className="text-black underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
