import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter
import axios from 'axios';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const router = useRouter(); // Initialize useRouter

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setShowModal(true); // Show the modal for errors
      return;
    }

    try {
      

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/auth/register`,
        {
          name,
          role,
          email,
          password,
          confirm_password: confirmPassword,
        }
      );
      
      setSuccessMessage('Registration successful!');
      setShowModal(true); // Show the modal for success
    } catch (error) {
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setShowModal(true); // Show the modal for errors
    }
  };

  const handleModalClose = () => {
    setShowModal(false); // Hide the modal
    if (successMessage) {
      router.push(`/auth/login?email=${encodeURIComponent(email)}`); // Redirect to login page if successful
    }
  };

  return (
    <div className="flex items-center justify-center ">
      <div className="w-80 md:w-96 p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-600">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="donor">Donor</option>
              <option value="volunteer">Volunteer</option>
              <option value="individual">Individual</option>
              <option value="foodbank">Food Bank</option>
            </select>
          </div>
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
              placeholder="Create a password"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-black rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <a href="/auth/login" className="text-black underline">
            Log in
          </a>
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            {successMessage ? (
              <>
                <h3 className="text-lg font-bold mb-4 text-center">Registration Successful</h3>
                <p className="mb-4">{successMessage}</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4 text-red-500">Registration Failed</h3>
                <p className="mb-4">{error}</p>
              </>
            )}
            <button
              onClick={handleModalClose}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
