import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import {
  cartAtom,
  cartErrorAtom,
  appointmentAtom,
  selectedFoodbankAtom,
  appointmentDateAtom,
  appointmentTimeAtom,
} from '../../../../../../store'; // Adjust import path if needed
import validateToken from '@/utils/validateToken';

const CartPage = () => {
  const router = useRouter();
  const [cart, setCart] = useAtom(cartAtom);
  const [cartError, setCartError] = useAtom(cartErrorAtom);
  const [selectedFoodbank, setSelectedFoodbank] = useAtom(selectedFoodbankAtom);
  const [appointmentDate, setAppointmentDate] = useAtom(appointmentDateAtom);
  const [appointmentTime, setAppointmentTime] = useAtom(appointmentTimeAtom);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [endTime, setEndTime] = useState('');
  const [startTime, setStartTime] = useState('');
  const [description] = useState('Request for food assistance'); // Default description
  const [showModal, setShowModal] = useState(false); // Modal state

  useEffect(() => {
    // Retrieve values from localStorage
    const storedCart = localStorage.getItem('cart');
    const storedDate = localStorage.getItem('appointmentDate');
    const storedTime = localStorage.getItem('appointmentTime');
    const storedFoodbank = localStorage.getItem('selectedFoodbank');

    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }

    if (storedDate) setAppointmentDate(storedDate);
    if (storedTime) setAppointmentTime(storedTime);
    if (storedFoodbank) setSelectedFoodbank(storedFoodbank);
  }, [setCart, setAppointmentDate, setAppointmentTime, setSelectedFoodbank]);

  useEffect(() => {
    if (appointmentDate && appointmentTime) {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
      const endDateTime = new Date(appointmentDateTime.getTime() + 10 * 60000);

      setStartTime(appointmentDateTime.toLocaleString());
      setEndTime(endDateTime.toLocaleString());
    }
  }, [appointmentDate, appointmentTime]);

  const handleSubmit = async () => {
    if (!appointmentDate || !appointmentTime || !selectedFoodbank) {
      setError('Please select a food bank, date, and time before proceeding.');
      return;
    }

    if (cart.length === 0) {
      setCartError('You must select at least one item.');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError('Authentication required.');
      router.push('/auth/login');
      return;
    }

    const appointmentData = {
      foodbank_id: selectedFoodbank,
      description,
      start_time: new Date(`${appointmentDate}T${appointmentTime}:00`).toISOString(),
      end_time: new Date(
        new Date(`${appointmentDate}T${appointmentTime}:00`).getTime() + 10 * 60000
      ).toISOString(),
      product: cart.map((item) => ({
        food_name: item.food_name,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/individual/appointment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(appointmentData),
        }
      );

      if (!response.ok) throw new Error('Failed to create appointment.');

      const data = await response.json();
      console.log(data);

      setShowModal(true); // Show confirmation modal
      localStorage.removeItem('cart');
      localStorage.removeItem('appointmentDate');
      localStorage.removeItem('appointmentTime');
      localStorage.removeItem('selectedFoodbank');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Cart</h1>

      {cartError && <p className="text-red-500 text-center mb-5">{cartError}</p>}
      {error && <p className="text-red-500 text-center mb-5">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cart.map((item) => (
          <div
            key={item.food_name}
            className="border p-4 rounded-lg shadow-md flex flex-col items-center text-center"
          >
            <h3 className="text-lg font-semibold">{item.food_name}</h3>
            <p className="text-gray-600">Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p>
          <strong>Start Time:</strong> {startTime}
        </p>
        <p>
          <strong>End Time:</strong> {endTime}
        </p>
        <p>
          <strong>Food Bank:</strong> {selectedFoodbank || 'Not Selected'}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition mt-4"
      >
        {loading ? 'Submitting...' : 'Confirm Appointment'}
      </button>

      {/* Go Back Button */}
      <button
        onClick={() => router.back()}
        className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition mt-4"
      >
        Go Back
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold text-green-600 mb-4">Appointment Confirmed</h2>
            <p>Your appointment has been successfully scheduled.</p>
            <p>
              <strong>Food Bank:</strong> {selectedFoodbank}
            </p>
            <p>
              <strong>Date:</strong> {appointmentDate}
            </p>
            <p>
              <strong>Time:</strong> {appointmentTime}
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                router.push('/dashboard/individual/manageAppointments/');
              }}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
