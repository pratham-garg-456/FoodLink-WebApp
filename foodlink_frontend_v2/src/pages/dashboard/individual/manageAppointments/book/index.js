import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import router from 'next/router';
import {
  appointmentDateAtom,
  appointmentTimeAtom,
  selectedFoodbankAtom,
} from '../../../../../../store';

import validateToken from '@/utils/validateToken';

const BookAppointment = () => {
  const [appointmentDate, setAppointmentDate] = useAtom(appointmentDateAtom);
  const [appointmentTime, setAppointmentTime] = useAtom(appointmentTimeAtom);
  const [selectedFoodbank, setSelectedFoodbank] = useAtom(selectedFoodbankAtom);
  const [foodbanks, setFoodbanks] = useState([]); // updated from foodBanks to foodbanks
  const [userAppointments, setUserAppointments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        localStorage.clear();
        router.push('/auth/login');
        return;
      }

      try {
        const decodedToken = await validateToken(token);
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [router]);
  const [nextAvailableDate, setNextAvailableDate] = useState('');

  // Load data from localStorage on page load
  useEffect(() => {
    const storedAppointmentDate = localStorage.getItem('appointmentDate');
    const storedAppointmentTime = localStorage.getItem('appointmentTime');
    const storedSelectedFoodbank = localStorage.getItem('selectedFoodbank'); // updated from selectedFoodBank to userSelectedFoodbank

    // updated from selectedFoodBank to userSelectedFoodbank

    const fetchFoodbanks = async () => {
      // updated from fetchFoodBanks to fetchFoodbanks
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
        );
        const data = await response.json();
        const filteredFoodbanks = data.users.filter((user) => user.role === 'foodbank'); // updated from foodBanks to foodbanks
        setFoodbanks(filteredFoodbanks); // updated from setFoodBanks to setFoodbanks
      } catch (error) {
        console.error('Error fetching foodbanks:', error); // updated from food banks to foodbanks
      }
    };

    const fetchUserAppointments = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/individual/appointments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        const filteredAppointments = data.appointments.filter(
          (appointment) =>
            appointment.status !== 'cancelled' &&
            ['scheduled', 'picked', 'rescheduled'].includes(appointment.status)
        );
        setUserAppointments(filteredAppointments);

        if (filteredAppointments.length > 1) {
          const lastAppointmentDate = new Date(
            filteredAppointments[filteredAppointments.length - 1].end_time
          );
          lastAppointmentDate.setDate(lastAppointmentDate.getDate() + 30);
          setNextAvailableDate(lastAppointmentDate.toISOString().split('T')[0]);
        } else {
          setNextAvailableDate(null);
        }
      } catch (error) {
        console.error('Error fetching user appointments:', error);
      }
    };

    fetchFoodbanks(); // updated from fetchFoodBanks to fetchFoodbanks
    fetchUserAppointments();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedFoodbank) {
      // updated from selectedFoodBank to userSelectedFoodbank
      setErrorMessage('Please select a food bank.');
      return;
    }

    const minTime = '10:00';
    const maxTime = '16:00';
    if (appointmentTime < minTime || appointmentTime > maxTime) {
      setErrorMessage('Please select a time between 10:00 AM and 4:00 PM.');
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const nextAvailable = new Date(nextAvailableDate);

    if (selectedDate < nextAvailable) {
      setErrorMessage(
        `You cannot book more than 2 appointments in a month. You can only book an appointment after ${nextAvailableDate}.`
      );
      return;
    }

    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    const appointmentsInMonth = userAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date);
      return (
        appointmentDate.getMonth() === selectedMonth &&
        appointmentDate.getFullYear() === selectedYear
      );
    });

    if (appointmentsInMonth.length >= 2) {
      setErrorMessage('');
      return;
    }

    setErrorMessage('');

    // Save the values in localStorage to persist across refreshes
    localStorage.setItem('appointmentDate', appointmentDate);
    localStorage.setItem('appointmentTime', appointmentTime);
    localStorage.setItem('selectedFoodbank', selectedFoodbank); // updated from selectedFoodBank to userSelectedFoodbank

    router.push(
      `/dashboard/individual/manageAppointments/book/selectItems?foodBank=${selectedFoodbank}` // updated from foodBank to foodbank
    );
  };

  const currentDate = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const maxDate = futureDate.toISOString().split('T')[0];

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Book an Appointment</h1>
      <p className="text-gray-800 text-sm text-center mb-4">
        **You can only book an appointment maximum 10 days ahead and 2 per month**
      </p>
      {nextAvailableDate && (
        <p className="text-gray-800 text-sm text-center mb-4">
          You have already booked 2 appointments for this month check back later
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600">Food Bank</label>
          <select
            value={selectedFoodbank} // updated from selectedFoodBank to userSelectedFoodbank
            onChange={(e) => setSelectedFoodbank(e.target.value)} // updated from setSelectedFoodBank to setUserSelectedFoodbank
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a Food Bank</option>
            {foodbanks.map(
              (
                foodbank // updated from foodBanks to foodbanks
              ) => (
                <option key={foodbank.id} value={foodbank.id}>
                  {foodbank.name}
                </option>
              )
            )}
          </select>
        </div>
        <div>
          <label className="block text-gray-600">Date</label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min={currentDate}
            max={maxDate}
          />
        </div>
        <div>
          <label className="block text-gray-600">Time</label>
          <input
            type="time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="10:00"
            max="16:00"
          />
        </div>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Next
        </button>
        {/* Go Back Button */}
        <button
          onClick={() => router.back()}
          className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition mt-4"
        >
          Go Back
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
