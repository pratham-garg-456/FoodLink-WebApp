import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';
import { useAtom } from 'jotai';
import donateNow from '../../../../public/images/Donatenow.jpg';
import { selectedFoodbankAtom } from '../../../../store';
import { OrbitProgress } from 'react-loading-indicators';

export default function DonatePage() {
  const router = useRouter();
  const [amount, setAmount] = useState(50);

  const [errorMessage, setErrorMessage] = useState('');
  const [foodbanks, setFoodbanks] = useState([]);
  const [selectedFoodbank, setSelectedFoodbank] = useAtom(selectedFoodbankAtom);

  // Dummy Card Details State
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFoodbanks = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
        );
        const data = await response.json();
        const filteredFoodbanks = data.users.filter((user) => user.role === 'foodbank');
        setFoodbanks(filteredFoodbanks);
      } catch (error) {
        console.error('Error fetching foodbanks:', error);
      }
    };
    fetchFoodbanks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    // Validate Inputs
    if (amount <= 0) {
      setErrorMessage('Donation amount must be greater than zero.');
      return;
    }
    if (!selectedFoodbank) {
      setErrorMessage('Please select a food bank.');
      return;
    }
    if (!/^\d{16}$/.test(cardNumber)) {
      setErrorMessage('Invalid card number. Enter a 16-digit number.');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      setErrorMessage('Invalid expiry date. Format: MM/YY.');
      return;
    }
    if (!/^\d{3}$/.test(cvv)) {
      setErrorMessage('Invalid CVV. Enter a 3-digit number.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log('selected foodbank:', selectedFoodbank);

      // POST donation details
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/donations`,
        {
          foodbank_id: selectedFoodbank,
          amount: amount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 'success') {
        router.push('/dashboard/donor/paymentSuccess');
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      setErrorMessage(
        error.response?.data?.detail || 'An error occurred while creating your donation.'
      );
    }
    setLoading(false);
  };

  if (loading)
    return (
      <div class="flex items-center justify-center">
        <OrbitProgress color="#000000" size="large" text="" textColor="" />
      </div>
    );

  return (
    <div
      className="bg-white flex items-center justify-center p-8"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <div className="flex flex-col md:flex-row w-[60vw] h-[75vh] bg-slate-200 shadow-2xl rounded">
        {/* Left Column */}
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
          <h1 className="text-5xl font-bold mb-6">Your support means the world to us</h1>
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lg text-gray-600">Food Bank</label>
              <select
                value={selectedFoodbank}
                onChange={(e) => setSelectedFoodbank(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select a Food Bank
                </option>
                {foodbanks.map((foodbank) => (
                  <option key={foodbank.id} value={foodbank.id}>
                    {foodbank.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg  font-semibold mb-1">Donation Amount ($)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                className="w-full border p-2 rounded"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            {/* Card Details Section */}
            <div>
              <label className="block text-lg font-semibold mb-1">Card Number</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-lg  font-semibold mb-1">Expiry Date (MM/YY)</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              <div className="w-1/2">
                <label className="block text-lg font-semibold mb-1">CVV</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                className="px-4 text-lg  py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => router.push('/dashboard/donor')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className=" text-2xl px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-700"
              >
                Donate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
