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

    // Convert start_time and end_time to UTC
    const convertToUTC = (timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const localDate = new Date();
      localDate.setHours(hours, minutes, 0, 0);

      // Convert to UTC
      const utcHours = localDate.getUTCHours();
      const utcMinutes = localDate.getUTCMinutes();

      // Format as HH:MM
      return `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}`;
    };

    const requestBody = {
      ...eventData,
      start_time: convertToUTC(eventData.start_time), // Convert start_time to UTC
      end_time: convertToUTC(eventData.end_time), // Convert end_time to UTC
    };

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
    <div className="container mx-auto p-6 max-w-7xl">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
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

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Event Management</h1>
            {!showForm && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform transition-transform hover:scale-105 flex items-center gap-2"
                onClick={() => {
                  setEditingEventId(null);
                  setShowForm(true);
                  setNotification({ message: '', type: '' });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Event
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
              <form onSubmit={handleSubmit}>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                  {editingEventId ? 'Edit Event' : 'Create New Event'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="event_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Event Name
                    </label>
                    <input
                      type="text"
                      id="event_name"
                      name="event_name"
                      placeholder="Community Food Drive"
                      value={eventData.event_name}
                      onChange={(e) => setEventData({ ...eventData, event_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      placeholder="123 Main Street, City"
                      value={eventData.location}
                      onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="A food donation drive for the local community."
                      value={eventData.description}
                      onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={eventData.date}
                      onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="start_time"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Start Time
                      </label>
                      <input
                        type="time"
                        id="start_time"
                        name="start_time"
                        value={eventData.start_time}
                        onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="end_time"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        End Time
                      </label>
                      <input
                        type="time"
                        id="end_time"
                        name="end_time"
                        value={eventData.end_time}
                        onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    {editingEventId ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Existing Events</h2>
            {events.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-lg">No events found. Create your first event!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{event.event_name}</h3>
                        <span className="px-3 py-1 rounded-full text-sm capitalize bg-blue-100 text-blue-800">
                          {event.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            {new Date(event.start_time).toLocaleTimeString()} -{' '}
                            {new Date(event.end_time).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openInventoryModal(event)}
                          className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                        >
                          Inventory
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
