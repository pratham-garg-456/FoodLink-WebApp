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
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

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
    if (amount <= 0 || isNaN(amount)) {
      setErrorMessage('Donation amount must be a valid number greater than zero.');
      setLoading(false);
      return;
    }
    if (!selectedFoodbank) {
      setErrorMessage('Please select a food bank.');
      setLoading(false);
      return;
    }
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      setErrorMessage('Invalid card number. Enter a 16-digit number.');
      setLoading(false);
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      setErrorMessage('Invalid expiry date format. Use MM/YY.');
      setLoading(false);
      return;
    }

    // Check if expiry date is valid
    const [month, year] = expiryDate.split('/');
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(`20${year}`, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Months are 0-based in JavaScript
    const currentYear = now.getFullYear();

    if (expiryMonth < 1 || expiryMonth > 12) {
      setErrorMessage('Invalid expiry month. Month must be between 01 and 12.');
      setLoading(false);
      return;
    }
    if (expiryYear < currentYear) {
      setErrorMessage('Expiry year cannot be in the past.');
      setLoading(false);
      return;
    }
    if (expiryYear === currentYear && expiryMonth < currentMonth) {
      setErrorMessage('Expiry month cannot be in the past.');
      setLoading(false);
      return;
    }

    if (!/^\d{3}$/.test(cvv)) {
      setErrorMessage('Invalid CVV. Enter a 3-digit number.');
      setLoading(false);
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
          card_number: cardNumber.replace(/\s/g, ''), // Remove spaces
          expiry_date: expiryDate.replace(/\//g, ''), // Remove slash
          cvv: cvv,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 'success') {
        setShowModal(true); // Show the success modal
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      setErrorMessage(
        error.response?.data?.detail || 'An error occurred while creating your donation.'
      );
    }
    setLoading(false);
  };

  const handleModalClose = () => {
    setShowModal(false); // Hide the modal
    router.push('/dashboard/donor/tracker'); // Redirect to another route
  };

  const handleCardNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
    const formattedCardNumber = input.replace(/(\d{4})(?=\d)/g, '$1 '); // Add a space after every 4 digits
    setCardNumber(formattedCardNumber); // Update the state with the formatted value
  };

  const handleExpiryDateChange = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
    const formattedExpiryDate = input
      .slice(0, 4) // Limit to 4 characters (MMYY)
      .replace(/(\d{2})(?=\d)/, '$1/'); // Add a slash after the first 2 digits
    setExpiryDate(formattedExpiryDate); // Update the state with the formatted value
  };

  if (loading)
    return (
      <div className="flex items-center justify-center">
        <OrbitProgress color="#000000" size="large" text="" textColor="" />
      </div>
    );

  return (
    <div className="bg-white flex flex-col items-center justify-center p-8 mb-9">
      <div className="flex flex-col  items-center justify-center my-8 md:my-12 w-[70vw]">
        <h1 className="md:text-4xl text-3xl font-bold mb-6 md:mb-20 uppercase text-center">
          Your support means the world to us
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center md:gap-10 ">
          <div className="flex flex-col  mb-4 md:mb-0 md:w-1/2">
            <div className="flex justify-center ">
              <Image
                src={donateNow}
                alt="Picture of People helped through donation"
                objectFit="cover"
                className="rounded md:w-[80%]"
              />
            </div>
            <div className="md:flex flex-col md:p-8 hidden ">
              <h1 className=" text-2xl font-bold text-start mb-4">You will make a difference</h1>
              <p className="">
                Food bank usage in our community has reached an all-time high, with visits now over
                three times higher than before the pandemic.
                <br />
                <br /> Your continued generosity plays a vital role in helping those facing food
                insecurity access essential food and support.
              </p>
            </div>
          </div>

          <div className="w-full mt-9 md:m-0 flex flex-col justify-center md:w-1/2 ">
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-lg font-semibold">Food Bank</label>
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
                  onChange={handleCardNumberChange} // Use the new handler
                  maxLength={19} // Limit to 19 characters (16 digits + 3 spaces)
                />
              </div>

              <div className="flex gap-4 items-end">
                <div className="w-1/2">
                  <label className="block text-lg  font-semibold mb-1">Expiry Date (MM/YY)</label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryDateChange} // Use the new handler
                    maxLength={5} // Limit to 5 characters (MM/YY)
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

              <div className="flex justify-center ">
                <button
                  type="submit"
                  className=" text-xl font-medium px-4 py-2 w-full bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Donate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold mb-4">Donation Successful</h3>
            <p className="mb-4">Thank you for your generous donation!</p>
            <button
              onClick={handleModalClose}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
