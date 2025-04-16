import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const CartPage = () => {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [cartError, setCartError] = useState('');
  const [selectedFoodbank, setSelectedFoodbank] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [foodbankName, setFoodbankName] = useState('Guest'); // Default username

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [endTime, setEndTime] = useState('');
  const [startTime, setStartTime] = useState('');
  const [description] = useState('Request for food assistance'); // Default description
  const [showModal, setShowModal] = useState(false); // Modal state

  const getUsername = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
      );
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      const matchedUser = data.users.find((user) => user.id === userId);
      return matchedUser ? matchedUser.name : userId.slice(0, 5);
    } catch (error) {
      console.error('Error fetching users:', error);
      return 'Guest';
    }
  };

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
    if (storedFoodbank) {
      setSelectedFoodbank(storedFoodbank);
      getUsername(storedFoodbank).then((name) => setFoodbankName(name));
    }
  }, [setCart, setAppointmentDate, setAppointmentTime, setSelectedFoodbank, setFoodbankName]);

  useEffect(() => {
    if (appointmentDate && appointmentTime) {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
      const endDateTime = new Date(appointmentDateTime.getTime() + 10 * 60000);

      setStartTime(appointmentDateTime.toLocaleString());
      setEndTime(endDateTime.toLocaleString());
    }
  }, [appointmentDate, appointmentTime]);

  const calculateAppointmentTimes = (date, time) => {
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + 10 * 60000);
    return { start, end };
  };

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

    const { start, end } = calculateAppointmentTimes(appointmentDate, appointmentTime);

    const appointmentData = {
      foodbank_id: selectedFoodbank,
      description,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
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

      setShowModal(true);
      ['cart', 'appointmentDate', 'appointmentTime', 'selectedFoodbank'].forEach((key) =>
        localStorage.removeItem(key)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Review Your Order</h1>

          {(cartError || error) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{cartError || error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Food Bank</p>
                <p className="font-medium text-gray-900">{foodbankName || 'Not Selected'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Appointment Date</p>
                <p className="font-medium text-gray-900">{appointmentDate || 'Not Selected'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="font-medium text-gray-900">{startTime || 'Not Selected'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">End Time</p>
                <p className="font-medium text-gray-900">{endTime || 'Not Selected'}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Items</h2>
            {cart.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items in cart</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add some items to your cart to continue.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cart.map((item) => (
                  <div
                    key={item.food_name}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{item.food_name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.back()}
              className="w-full sm:w-auto order-2 sm:order-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="mr-2 -ml-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Selection
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2 inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Confirming...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 -ml-1 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Confirm Appointment
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">
              Appointment Confirmed!
            </h2>
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Food Bank</p>
                <p className="font-medium text-gray-900">{foodbankName}</p>
                <p className="text-sm text-gray-600 mt-2">Date & Time</p>
                <p className="font-medium text-gray-900">{`${appointmentDate} at ${appointmentTime}`}</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('cart');
                setShowModal(false);
                router.push('/dashboard/individual/manageAppointments/');
              }}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              View My Appointments
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
