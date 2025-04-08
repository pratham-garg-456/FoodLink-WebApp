import { useState, useEffect } from 'react';
import Notification from './Notification';
import axios from 'axios';

export default function EventList({ apiEndPoint }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Helper function to get the appropriate color class for quantity
  const getQuantityColor = (quantity) => {
    if (quantity >= 50) return 'bg-green-500';
    if (quantity < 10) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  useEffect(() => {
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

    fetchEvents();
  }, [apiEndPoint]);

  if (loading) return <p className="text-center">Loading events...</p>;

  return (
    <div className="space-y-6">
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      {events.map((event) => (
        <div key={event.id} className="bg-white shadow rounded-lg p-6">
          <h2 className="text-4xl font-bold mb-2">{event.event_name}</h2>
          <p className="text-gray-700 text-xl mb-2">{event.description}</p>
          <p className="text-lg text-gray-500">
            Date: {new Date(event.date).toLocaleDateString()} | From:{' '}
            {new Date(event.start_time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            | To:{' '}
            {new Date(event.end_time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-lg text-gray-500">Location: {event.location}</p>
          <p className="text-lg text-gray-500">Status: {event.status}</p>
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
              <p className="text-sm text-gray-400">
                Last Updated: {new Date(event.event_inventory.last_updated).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
