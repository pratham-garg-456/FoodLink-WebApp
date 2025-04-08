import axios from 'axios';
import { useEffect, useState } from 'react';

export default function EventInventoryModal({ event, token, onClose, setNotification }) {
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
      fetchMainInventory();
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
      <div className="bg-white rounded-xl shadow-xl w-11/12 md:w-1/2 p-6 relative">
        <h3 className="text-3xl font-bold mb-4">Manage Event Inventory</h3>
        <button
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl p-2"
          onClick={onClose}
        >
          close
        </button>
        <div className="lg:flex lg:flex-row lg:justify-evenly">
          {/* Display current event inventory */}
          {loadingInventory ? (
            <p>Loading event inventory...</p>
          ) : eventInventory ? (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-xl">Current Event Inventory:</h4>
              <ul className="list-disc ml-6 text-lg">
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
                  <h4 className="font-semibold mb-2 text-xl">Main Inventory:</h4>
                  <ul className="list-disc ml-6 text-lg">
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
        </div>

        {/* Form to add/increment or remove inventory */}
        <form className="space-y-4" onSubmit={handleAddStock}>
          <div>
            <label className="block font-semibold mb-1 text-xl">Food Name</label>
            <input
              type="text"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              className="border p-2 w-full rounded-xl"
              placeholder="Enter food name"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-xl">Quantity</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="border p-2 w-full rounded-xl"
              placeholder="Enter quantity"
              required
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleAddStock}
              disabled={submitting}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full"
            >
              {submitting ? 'Submitting...' : 'Add / Increment Stock'}
            </button>
            <button
              onClick={handleRemoveStock}
              disabled={submitting}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
            >
              {submitting ? 'Submitting...' : 'Remove / Decrement Stock'}
            </button>
          </div>
        </form>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleTransferBack}
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            {submitting ? 'Processing...' : 'Transfer Back to Main Inventory'}
          </button>
        </div>
      </div>
    </div>
  );
}