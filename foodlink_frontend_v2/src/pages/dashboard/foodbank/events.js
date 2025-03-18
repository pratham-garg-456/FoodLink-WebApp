import axios from 'axios';
import { useEffect, useState } from 'react';
import Notification from '@/components/Notification';
import VolunteerModal from '@/components/VolunteerModal';

function EventInventoryModal({ event, token, onClose, setNotification }) {
  const [eventInventory, setEventInventory] = useState(null);
  const [mainInventory, setMainInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingMainInventory, setLoadingMainInventory] = useState(false);
  const [formData, setFormData] = useState({ food_name: '', quantity: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch event inventory
  const fetchEventInventory = async () => {
    setLoadingInventory(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event/${event.id}/inventory`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEventInventory(res.data.event_inventory);
      fetchMainInventory()
    } catch (error) {
      setNotification({
        message: 'Failed to load event inventory.',
        type: 'error',
      });
    }
    setLoadingInventory(false);
  };

  // Fetch main inventory from foodbank
  const fetchMainInventory = async () => {
    setLoadingMainInventory(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/inventory`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Assuming the API returns a list and we use the first object’s stock array.
      if (res.data.status === 'success' && res.data.inventory.length > 0) {
        setMainInventory(res.data.inventory[0].stock);
      }
    } catch (error) {
      setNotification({
        message: 'Failed to load main inventory.',
        type: 'error',
      });
    }
    setLoadingMainInventory(false);
  };

  useEffect(() => {
    fetchEventInventory();
    fetchMainInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle adding/incrementing stock via POST route
  const handleAddStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification({ message: '', type: '' });
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event/${event.id}/inventory`,
        { stock: [{ food_name: formData.food_name.trim(), quantity: Number(formData.quantity) }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 'success') {
        setNotification({ message: 'Inventory updated successfully.', type: 'success' });
        setFormData({ food_name: '', quantity: '' });
        fetchEventInventory();
      }
    } catch (error) {
      setNotification({
        message: error?.response?.data?.detail || 'Failed to update event inventory.',
        type: 'error',
      });
    }
    setSubmitting(false);
  };

  // Handle decrementing stock via PUT route
  const handleRemoveStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification({ message: '', type: '' });
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event/${event.id}/inventory`,
        { stock: [{ food_name: formData.food_name.trim(), quantity: Number(formData.quantity) }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 'success') {
        setNotification({ message: 'Inventory updated successfully.', type: 'success' });
        setFormData({ food_name: '', quantity: '' });
        fetchEventInventory();
      }
    } catch (error) {
      setNotification({
        message: error?.response?.data?.detail || 'Failed to update event inventory.',
        type: 'error',
      });
    }
    setSubmitting(false);
  };

  // Transfer event inventory back to main inventory
  const handleTransferBack = async () => {
    if (!window.confirm('Transfer all event inventory back to main inventory?')) return;
    setSubmitting(true);
    setNotification({ message: '', type: '' });
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event/${event.id}/inventory/transfer-back`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 'success') {
        setNotification({ message: 'Inventory transferred back successfully.', type: 'success' });
        fetchEventInventory();
      }
    } catch (error) {
      setNotification({
        message: error?.response?.data?.detail || 'Failed to transfer inventory back.',
        type: 'error',
      });
    }
    setSubmitting(false);
  };

  // When a main inventory item is clicked, pre-fill the food name field.
  const handleMainItemClick = (item) => {
    setFormData({ ...formData, food_name: item.food_name });
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
      hour12: false, // 24-hour format
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg w-11/12 md:w-1/2 p-6 relative">
        <h3 className="text-xl font-bold mb-4">Manage Event Inventory</h3>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          X
        </button>

        {/* Display current event inventory */}
        {loadingInventory ? (
          <p>Loading event inventory...</p>
        ) : eventInventory ? (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Current Event Inventory:</h4>
            <ul className="list-disc ml-6">
              {eventInventory.stock.map((item, idx) => (
                <li key={idx}>
                  {item.food_name} - {item.quantity}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-1">
              Last Updated: {formatDateToLocal(eventInventory.last_updated)}
            </p>
          </div>
        ) : (
          <p>No inventory available for this event.</p>
        )}

        {/* Display main inventory for reference */}
        {loadingMainInventory ? (
          <p>Loading main inventory...</p>
        ) : (
          <>
            {mainInventory.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Main Inventory:</h4>
                <ul className="list-disc ml-6">
                  {mainInventory.map((item, idx) => (
                    <li
                      key={idx}
                      className="cursor-pointer hover:underline"
                      onClick={() => handleMainItemClick(item)}
                    >
                      {item.food_name} - {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Form to add/increment or remove inventory */}
        <form className="space-y-4" onSubmit={handleAddStock}>
          <div>
            <label className="block font-semibold mb-1">Food Name</label>
            <input
              type="text"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              className="border p-2 w-full rounded"
              placeholder="Enter food name"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Quantity</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="border p-2 w-full rounded"
              placeholder="Enter quantity"
              required
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleAddStock}
              disabled={submitting}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              {submitting ? 'Submitting...' : 'Add / Increment Stock'}
            </button>
            <button
              onClick={handleRemoveStock}
              disabled={submitting}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              {submitting ? 'Submitting...' : 'Remove / Decrement Stock'}
            </button>
          </div>
        </form>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleTransferBack}
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {submitting ? 'Processing...' : 'Transfer Back to Main Inventory'}
          </button>
        </div>
      </div>
    </div>
  );
}







const Events = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [volunteerModalEvent, setVolunteerModalEvent] = useState(null);
  const [inventoryModalEvent, setInventoryModalEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [token, setToken] = useState('');

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
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/events`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(response?.data?.events);
    } catch (e) {
      setNotification({ message: 'Failed to load events.', type: 'error' });
    }
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

  const openVolunteerModal = (event) => {
    setVolunteerModalEvent(event);
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
      <h1 className="text-2xl font-bold mb-4 text-center">Manage Events</h1>
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      {!showForm && (
        <div className="text-center mb-8">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
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
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4">
            {editingEventId ? 'Edit Event' : 'Create New Event'}
          </h2>
          <div className="mb-4">
            <label htmlFor="event_name" className="block font-bold mb-1">
              Event Name
            </label>
            <input
              type="text"
              id="event_name"
              name="event_name"
              placeholder="Community Food Drive"
              value={eventData.event_name}
              onChange={(e) => setEventData({ ...eventData, event_name: e.target.value })}
              className="border p-2 w-full rounded"
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
              className="border p-2 w-full rounded"
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
                className="border p-2 w-full rounded"
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
                className="border p-2 w-full rounded"
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
                className="border p-2 w-full rounded"
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
                className="border p-2 w-full rounded"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel Process
            </button>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              {editingEventId ? 'Update Event' : 'Submit Event'}
            </button>
          </div>
        </form>
      )}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 text-center">Existing Events</h2>
        {events.length === 0 ? (
          <p className="text-center">No events found.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li key={event.id} className="border p-4 rounded flex flex-col">
                <div className="flex justify-between items-center">
                  <div onClick={() => handleEditEvent(event)} className="cursor-pointer">
                    <h3 className="text-lg font-bold">{event.event_name}</h3>
                    <p>{event.description}</p>
                    <p>
                      <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>From:</strong>{' '}
                      {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p>
                      <strong>To:</strong>{' '}
                      {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded mb-2"
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
      {volunteerModalEvent && (
        <VolunteerModal
          event={volunteerModalEvent}
          token={token}
          setNotification={setNotification}
          onClose={() => setVolunteerModalEvent(null)}
        />
      )}
      {inventoryModalEvent && (
        <EventInventoryModal
          event={inventoryModalEvent}
          token={token}
          onClose={() => setInventoryModalEvent(null)}
          setNotification={setNotification}
        />
      )}
    </div>
  );
};

export default Events;
