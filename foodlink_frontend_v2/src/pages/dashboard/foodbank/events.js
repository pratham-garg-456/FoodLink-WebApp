import axios from 'axios';
import { useEffect, useState } from 'react';
import Notification from '@/components/Notification';
import EventInventoryModal from '@/components/EventInventoryModal';
import { OrbitProgress } from 'react-loading-indicators';

const Events = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [inventoryModalEvent, setInventoryModalEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const [eventData, setEventData] = useState({
    event_name: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    status: 'scheduled',
  });

  // Get token from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('accessToken');
      setToken(storedToken);
    }
  }, []);

  const handleCancel = () => {
    setEventData({
      event_name: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      status: 'scheduled',
    });
    setEditingEventId(null);
    setShowForm(false);
    setNotification({ message: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' });
    const requestBody = { ...eventData };
    try {
      if (editingEventId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event/${editingEventId}`,
          requestBody,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification({ message: 'Event updated successfully', type: 'success' });
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event`,
          requestBody,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification({ message: 'Event created successfully', type: 'success' });
      }
      fetchEvents();
      handleCancel();
    } catch (error) {
      setNotification({
        message: error?.response?.data?.detail || 'Failed to submit the event.',
        type: 'error',
      });
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/events`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(response?.data?.events);
    } catch (e) {
      setNotification({ message: 'Failed to load events.', type: 'error' });
    }
    setLoading(false);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    date.setHours(date.getHours() + 4);
    return date.toTimeString().split(' ')[0].slice(0, 5);
  };

  const handleEditEvent = (event) => {
    setEditingEventId(event.id);
    setEventData({
      event_name: event.event_name,
      description: event.description,
      date: formatDate(event.date),
      start_time: formatTime(event.start_time),
      end_time: formatTime(event.end_time),
      location: event.location,
      status: event.status,
    });
    setShowForm(true);
    setNotification({ message: '', type: '' });
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setNotification({ message: '', type: '' });
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event/${eventId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification({ message: 'Event deleted successfully', type: 'success' });
        fetchEvents();
      } catch (error) {
        setNotification({
          message: error?.response?.data?.detail || 'Failed to delete the event',
          type: 'error',
        });
      }
    }
  };

  const openInventoryModal = (event) => {
    setInventoryModalEvent(event);
  };

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <div class="flex items-center justify-center">
          <OrbitProgress color="#000000" size="large" text="" textColor="" />
        </div>
      ) : (
        <>
          {notification.message && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification({ message: '', type: '' })}
            />
          )}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mt-8 max-w-3xl mx-auto border rounded-lg shadow-lg p-4"
            >
              <h2 className="text-2xl font-bold mb-4">
                {editingEventId ? 'Edit Event' : 'Create New Event'}
              </h2>
              <div className="mb-4">
                <label htmlFor="event_name" className="block font-bold mb-1 text-xl">
                  Event Name
                </label>
                <input
                  type="text"
                  id="event_name"
                  name="event_name"
                  placeholder="Community Food Drive"
                  value={eventData.event_name}
                  onChange={(e) => setEventData({ ...eventData, event_name: e.target.value })}
                  className="border p-2 w-full rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block font-bold mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="A food donation drive for the local community."
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  className="border p-2 w-full rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="date" className="block font-bold mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={eventData.date}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                    className="border p-2 w-full rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block font-bold mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="123 Main Street, City"
                    value={eventData.location}
                    onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                    className="border p-2 w-full rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="start_time" className="block font-bold mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="start_time"
                    name="start_time"
                    value={eventData.start_time}
                    onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                    className="border p-2 w-full rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="end_time" className="block font-bold mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="end_time"
                    name="end_time"
                    value={eventData.end_time}
                    onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                    className="border p-2 w-full rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl"
                >
                  Cancel Process
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-xl text-white px-4 py-2 rounded-xl"
                >
                  {editingEventId ? 'Update Event' : 'Submit Event'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-12">
            <h2 className="text-5xl font-bold mb-4 text-center">Existing Events</h2>
            {!showForm && (
              <div className="text-center mb-8">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-xl text-white px-4 py-2 rounded"
                  onClick={() => {
                    setEditingEventId(null);
                    setShowForm(true);
                    setNotification({ message: '', type: '' });
                  }}
                >
                  Create New Event
                </button>
              </div>
            )}
            {events.length === 0 ? (
              <p className="text-center">No events found.</p>
            ) : (
              <ul className="space-y-4">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="border bg-slate-50 p-5 rounded-lg flex flex-col shadow-xl"
                  >
                    <div className="flex justify-between items-center">
                      <div onClick={() => handleEditEvent(event)} className="cursor-pointer">
                        <h3 className="text-2xl font-bold">{event.event_name}</h3>
                        <p>{event.description}</p>
                        <p>
                          <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>From:</strong> {formatTime(event.start_time)}
                        </p>
                        <p>
                          <strong>To:</strong> {formatTime(event.end_time)}
                        </p>
                        <p>
                          <strong>Location:</strong> {event.location}
                        </p>
                        <p>
                          <strong>Status:</strong> {event.status}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInventoryModal(event);
                          }}
                          className="bg-purple-500 hover:bg-purple-600 text-white text-xl px-3 py-1 rounded mb-2"
                        >
                          Manage Inventory
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {inventoryModalEvent && (
            <EventInventoryModal
              event={inventoryModalEvent}
              token={token}
              onClose={() => setInventoryModalEvent(null)}
              setNotification={setNotification}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Events;
