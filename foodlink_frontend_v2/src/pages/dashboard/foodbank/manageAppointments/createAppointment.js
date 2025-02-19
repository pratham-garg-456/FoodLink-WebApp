import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import validateToken from '@/utils/validateToken';

export default function CreateAppointment() {
  const router = useRouter();
  const [foodbankId, setFoodbankId] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    start_time: '',
    end_time: '',
    product: '',
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Retrieve the user's id from localStorage and set it as the foodbankId
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const decodedToken = await validateToken(token);
        setFoodbankId(decodedToken.user.id);
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Convert the product string to an array (split by comma)
    const products = formData.product
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);

    const payload = {
      foodbank_id: foodbankId,
      description: formData.description,
      start_time: formData.start_time,
      end_time: formData.end_time,
      product: products,
    };

    try {
      // Retrieve access token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/individual/appointment`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.data.status === 'success') {
        setSuccessMessage('Appointment created successfully!');
        // Optionally redirect to view the created appointment
        // setTimeout(() => {
        //   router.push(`/viewAppointment?appointmentId=${response.data.appointment.id}`);
        // }, 1500);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      setErrorMessage('Failed to create appointment. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Appointment</h1>
      {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
      {successMessage && <p className="mb-4 text-green-500">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows="3"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Start Time</label>
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">End Time</label>
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Products (comma separated)</label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
            placeholder="Pantry Box, Apple Juice, Bean Can"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Create Appointment
          </button>
        </div>
      </form>
    </div>
  );
}
