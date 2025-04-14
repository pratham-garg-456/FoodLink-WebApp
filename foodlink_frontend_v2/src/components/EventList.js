import { useState, useEffect } from 'react';
import Notification from './Notification';
import axios from 'axios';
import { OrbitProgress } from 'react-loading-indicators';
export default function EventList({ apiEndPoint }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [timeLeft, setTimeLeft] = useState(120);

  // Helper function to get the appropriate color class for quantity
  const getQuantityColor = (quantity) => {
    if (quantity >= 50) return 'bg-green-500';
    if (quantity < 10) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(apiEndPoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (response.data.status === 'success') {
        setEvents(response.data.events);
      } else {
        setNotification({
          message: 'Failed to fetch events.',
          type: 'error',
        });
      }
    } catch (err) {
      setNotification({
        message: err?.response?.data?.detail || 'Error fetching events.',
        type: 'error',
      });
      setEvents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Fetch events initially
    fetchEvents();

    const interval = setInterval(() => {
      fetchEvents();
      setTimeLeft(120);
    }, 120000);

    const countDownInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countDownInterval);
    };
  }, [apiEndPoint]);

  if (loading)
    return (
      <div class="flex items-center justify-center">
        <OrbitProgress color="#000000" size="large" text="" textColor="" />
      </div>
    );

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    date.setHours(date.getHours() + 4);
    return date.toTimeString().split(' ')[0].slice(0, 5);
  };

  const formatDateToLocal = (isoString) => {
    if (!isoString) return 'N/A';
    const utcDate = new Date(isoString + 'Z'); // Force UTC interpretation
    return utcDate.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="space-y-6">
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      {/* Countdown Timer */}
      <div className="text-center text-gray-600 mb-4">
        <p>
          Next refresh in: <strong>{timeLeft} seconds</strong>
        </p>
      </div>
      {events.map((event) => (
        <div key={event.id} className="bg-indigo-50 shadow-xl rounded-xl p-6">
          <h2 className="text-4xl font-bold mb-2">{event.event_name}</h2>
          <p className="text-gray-700 text-xl mb-2">{event.description}</p>
          <p className="text-lg text-gray-600">
            Date: {new Date(event.date).toLocaleDateString()} | From: {formatTime(event.start_time)}{' '}
            | To: {formatTime(event.end_time)}
          </p>
          <p className="text-lg text-gray-600">Location: {event.location}</p>
          <p className="text-lg text-gray-600">Status: {event.status}</p>
          {event.event_inventory && (
            <div className="mt-4">
              <h3 className="text-2xl font-semibold">Event Inventory</h3>
              <ul className="list-disc ml-5">
                {event.event_inventory.stock.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-xl">
                    {/* Inventory icon */}
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${getQuantityColor(item.quantity)}`}
                    ></span>
                    <span>
                      {item.food_name} - Quantity: <strong>{item.quantity}</strong>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500">
                Last Updated: {formatDateToLocal(event.event_inventory.last_updated)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
