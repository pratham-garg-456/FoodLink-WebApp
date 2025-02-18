import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import validateToken from '@/utils/validateToken';

export default function ViewAppointment() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    let isMounted = true;

    const fetchAppointments = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token || token === 'undefined') {
        console.error('JWT Token is invalid or missing');
        router.push('/auth/login');
        return;
      }

      try {
        const decodedToken = await validateToken(token);
        if (!decodedToken) {
          console.error('Invalid token');
          router.push('/auth/login');
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/appointments/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: statusFilter ? { status: statusFilter } : {},
          }
        );

        if (isMounted) {
          if (response.data.status === 'success') {
            setAppointments(response.data.appointments || []);
            setErrorMessage(
              response.data.appointments.length
                ? null
                : `No appointments found for status: ${statusFilter}.`
            );
          } else {
            setAppointments([]);
            setErrorMessage('No appointments found.');
          }
        }
      } catch (error) {
        if (isMounted) {
          setAppointments([]);
          if (error.response) {
            const { status } = error.response;
            if (status === 401) {
              console.error('Unauthorized access, redirecting to login.');
              router.push('/auth/login');
            } else if (status === 404) {
              setErrorMessage(`No appointments found for status: ${statusFilter || 'all'}.`);
            } else {
              console.error(`Error fetching appointments: ${status}`, error.response.data);
              setErrorMessage('An error occurred while fetching appointments.');
            }
          } else {
            console.error('Unexpected error:', error.message);
            setErrorMessage('An unexpected error occurred.');
          }
        }
      }
    };

    fetchAppointments();
    return () => {
      isMounted = false;
    };
  }, [router, statusFilter]);

  return (
    <div className="flex flex-col items-center w-[70vw] min-h-[80vh] md:w-[80vw] md:gap-2 pt-10 justify-start">
      <div className=" w-full flex justify-start">
        <Link href="/dashboard/foodbank/manageAppointments">
          <button className="mb-4 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded flex-start">
            &lt;- Back to Manage Appointments{' '}
          </button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-4">Appointments</h1>

      <div className="mb-4">
        <label className="font-semibold">Filter by Status:</label>
        <select
          className="ml-2 p-2 border rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
      </div>
      <div className="w-full max-w-6xl bg-white rounded-lg p-6">
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        {!appointments.length && !errorMessage && <p>Loading...</p>}

        {appointments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-300 shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Description</th>
                  <th className="p-3 border">Products</th>
                  <th className="p-3 border">Start Time</th>
                  <th className="p-3 border">End Time</th>
                  <th className="p-3 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={appointment.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="p-3 border">{appointment.id}</td>
                    <td className="p-3 border">{appointment.description}</td>
                    <td className="p-3 border">
                      {appointment.product ? appointment.product.join(', ') : 'N/A'}
                    </td>
                    <td className="p-3 border">
                      {new Date(appointment.start_time).toLocaleString()}
                    </td>
                    <td className="p-3 border">
                      {new Date(appointment.end_time).toLocaleString()}
                    </td>
                    <td className="p-3 border capitalize font-semibold text-blue-600">
                      {appointment.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
