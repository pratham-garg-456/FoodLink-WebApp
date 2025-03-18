import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';
import donateNow from '../../../../public/images/Donatenow.jpg';

export default function DonatePage() {
  const router = useRouter();
  const [amount, setAmount] = useState(50);
  const [giftFrequency, setGiftFrequency] = useState('One Time');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (amount <= 0) {
      setErrorMessage('Donation amount must be greater than zero.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // POST to your create_donation endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/donations`,
        {
          amount, // Only sending "amount" now
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 'success') {
        router.push('/dashboard/donor/payment');
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      setErrorMessage(
        error.response?.data?.detail || 'An error occurred while creating your donation.'
      );
    }
  };

  return (
    <div
      className="bg-white flex items-center justify-center p-8"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <div className="flex flex-col md:flex-row w-[60vw] h-[60vh] bg-white shadow-md rounded">
        {/* Left Column*/}
        <div className="w-full md:w-1/2 relative">
          <Image
            src={donateNow}
            alt="Donate Now"
            layout="fill"
            objectFit="cover"
            className="rounded-l"
          />
        </div>

        {/* Right Column: Donation Form */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-6">Your support means the world to us</h1>
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Donation Amount ($)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                className="w-full border p-2 rounded"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Gift Frequency</label>
              <div className="flex gap-4 mt-2">
                {['One Time', 'Monthly', 'Annually'].map((freq) => (
                  <label key={freq} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="frequency"
                      value={freq}
                      checked={giftFrequency === freq}
                      onChange={(e) => setGiftFrequency(e.target.value)}
                    />
                    {freq}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => router.push('/dashboard/donor')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
