import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DonationPage = () => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [donorId, setDonorId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setDonorId(decodedToken.sub);
    } else {
      router.push('/auth/login'); // Redirect if not logged in
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!donorId) {
      setMessage('You must be logged in to donate.');
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      setMessage('Donation recorded successfully!');
      setAmount('');
    } else {
      setMessage(data.detail || 'Error submitting donation');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Make a Donation</h1>
      {message && <p className="text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="number"
          placeholder="Amount ($)"
          className="border p-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Donate
        </button>
      </form>
    </div>
  );
};

export default DonationPage;
