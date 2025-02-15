// pages/api/auth.js
import axios from 'axios';

export default async function handler(req, res) {
  console.log('req.method:', req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  try {
    // Call your backend API for authentication
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/auth/signin`,
      { email, password }
    );
    const data = response.data;
    const token = data.token;
    const role = data.role;

    if (token) {
      return res.status(200).json({ token, role, message: 'Logged in successfully' });
    } else {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ message: error.response.data.detail || 'Authentication failed' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}
