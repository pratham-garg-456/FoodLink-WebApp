import axios from 'axios';
import { useEffect, useState } from 'react';
import Notification from '@/components/Notification';
import VolunteerModal from '@/components/VolunteerModal';

const Events = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [volunteerModalEvent, setVolunteerModalEvent] = useState(null);

  const [eventData, setEventData] = useState({
    event_name: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    food_services: [],
    event_inventory: [],
  });

  const [mainInventory, setMainInventory] = useState([]);
  const [events, setEvents] = useState([]);
  const [token, setToken] = useState('');

  // Ensure we get the token from localStorage on client side.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('accessToken');
      setToken(storedToken);
    }
  }, []);

  // Drag & Drop functions.
  const onDragStart = (e, item) => {
    e.dataTransfer.setData('item', JSON.stringify(item));
  };

  const onDrop = (e) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('item'));
    const eventItem = { ...item, allocatedQuantity: 1 };
    setEventData((prev) => ({
      ...prev,
      event_inventory: [...prev.event_inventory, eventItem],
    }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveItem = (index) => {
    setEventData((prev) => {
      const newInventory = [...prev.event_inventory];
      newInventory.splice(index, 1);
      return { ...prev, event_inventory: newInventory };
    });
  };

  const handleCancel = () => {
    setEventData({
      event_name: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      food_services: [],
      event_inventory: [],
    });
    setEditingEventId(null);
    setShowForm(false);
    setNotification({ message: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' });
    const formattedInventory = eventData.event_inventory.map((item) => ({
      food_name: item.food_name,
      quantity: item.allocatedQuantity || 1,
    }));
    const requestBody = {
      ...eventData,
      event_inventory: formattedInventory,
    };
    try {
      if (editingEventId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event/${editingEventId}`,
          requestBody,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotification({ message: 'Event updated successfully', type: 'success' });
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event`,
          requestBody,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotification({ message: 'Event created successfully', type: 'success' });
      }
      fetchEvents();
      fetchInventoryFromDb();
      handleCancel();
    } catch (error) {
      if (error?.response?.data?.detail) {
        setNotification({
          message: error.response.data.detail,
          type: 'error',
        });
      } else {
        setNotification({
          message: 'Failed to submit the event.',
          type: 'error',
        });
      }
    }
  };

  const fetchInventoryFromDb = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/inventory`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMainInventory(response?.data?.inventory ?? []);
    } catch (e) {
      if (error?.response?.data?.detail) {
        setNotification({
          message: error.response.data.detail,
          type: 'error',
        });
      } else {
        setNotification({
          message: 'Failed to load main inventory',
          type: 'error',
        });
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/events`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents(response?.data?.events);
    } catch (e) {
      setNotification({ message: 'Failed to load events.', type: 'error' });
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // Extracts the date part in YYYY-MM-DD format
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toTimeString().split(' ')[0].slice(0, 5); // Extracts the time part in HH:mm format
  };

  const handleEditEvent = (event) => {
    setEditingEventId(event.id);
    const transformedInventory = event.event_inventory.map((item) => ({
      ...item,
      allocatedQuantity: item.quantity,
    }));
    setEventData({
      event_name: event.event_name,
      description: event.description,
      date: formatDate(event.date),
      start_time: formatTime(event.start_time),
      end_time: formatTime(event.end_time),
      location: event.location,
      food_services: event.food_services,
      event_inventory: transformedInventory,
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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotification({ message: 'Event deleted successfully', type: 'success' });
        fetchEvents();
      } catch (error) {
        if (error?.response?.data?.detail) {
          setNotification({
            message: error.response.data.detail,
            type: 'error',
          });
        } else {
          setNotification({
            message: 'Failed to delete the event',
            type: 'error',
          });
        }
      }
    }
  };

  const openVolunteerModal = (event) => {
    setVolunteerModalEvent(event);
  };

  useEffect(() => {
    if (token) {
      fetchInventoryFromDb();
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
              placeholder="Community Feast 4"
              value={eventData.event_name}
              onChange={(e) => setEventData({ ...eventData, event_name: e.target.value })}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block font-bold mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="A place to share"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="border p-2 w-full rounded"
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
                placeholder="Yonge and Finch"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                className="border p-2 w-full rounded"
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
              />
            </div>
          </div>
          <div className="mb-4">
            <span className="block font-bold mb-1">Food Services</span>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="Hot meals"
                  checked={eventData.food_services.includes('Hot meals')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEventData({
                        ...eventData,
                        food_services: [...eventData.food_services, 'Hot meals'],
                      });
                    } else {
                      setEventData({
                        ...eventData,
                        food_services: eventData.food_services.filter(
                          (item) => item !== 'Hot meals'
                        ),
                      });
                    }
                  }}
                  className="mr-1"
                />
                Hot meals
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="Snacks"
                  checked={eventData.food_services.includes('Snacks')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEventData({
                        ...eventData,
                        food_services: [...eventData.food_services, 'Snacks'],
                      });
                    } else {
                      setEventData({
                        ...eventData,
                        food_services: eventData.food_services.filter((item) => item !== 'Snacks'),
                      });
                    }
                  }}
                  className="mr-1"
                />
                Snacks
              </label>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Event Inventory</h2>
            <div className="flex space-x-4">
              <div className="w-1/2 border p-4 rounded">
                <h3 className="font-semibold mb-2">Main Inventory</h3>
                <ul>
                  {mainInventory.map((item) => (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className="border p-2 mb-2 cursor-move hover:bg-gray-100"
                    >
                      <span className="font-medium">{item.food_name}</span> -{' '}
                      <span>{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="w-1/2 border p-4 rounded min-h-[200px]"
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <h3 className="font-semibold mb-2">Drop Items Here</h3>
                {eventData.event_inventory.length === 0 ? (
                  <p className="text-gray-500">No items added yet.</p>
                ) : (
                  <ul>
                    {eventData.event_inventory.map((item, index) => (
                      <li
                        key={index}
                        className="border p-2 mb-2 bg-gray-50 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">{item.food_name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            (Available: {item.quantity})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="mr-2 text-sm">Quantity:</label>
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            value={item.allocatedQuantity || 1}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value, 10) || 1;
                              setEventData((prev) => {
                                const newInventory = [...prev.event_inventory];
                                newInventory[index].allocatedQuantity = newQuantity;
                                return { ...prev, event_inventory: newInventory };
                              });
                            }}
                            className="border p-1 w-20"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
                      <strong>From:</strong> {new Date(event.start_time).toLocaleTimeString()}
                    </p>
                    <p>
                      <strong>To:</strong> {new Date(event.end_time).toLocaleTimeString()}
                    </p>
                    <p>
                      <strong>Location:</strong> {event.location}
                    </p>
                    <p>
                      <strong>Food Services:</strong> {event.food_services.join(', ')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openVolunteerModal(event);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mb-2"
                    >
                      Manage Volunteers
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
    </div>
  );
};

export default Events;
