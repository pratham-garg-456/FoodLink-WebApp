import axios from 'axios';
import { useEffect, useState } from 'react';

export default function EventInventoryModal({ event, token, onClose, setNotification }) {
  const [eventInventory, setEventInventory] = useState(null);
  const [mainInventory, setMainInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingMainInventory, setLoadingMainInventory] = useState(false);
  const [formData, setFormData] = useState({ food_name: '', quantity: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isMainInventoryItem, setIsMainInventoryItem] = useState(false);

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

  const isFoodQuantityGreaterThanInventory = (foodName, quantity) => {
    let isGreater = false;
    eventInventory?.stock.forEach((item) => {
      if (item.food_name.toLowerCase() === foodName.toLowerCase()) {
        if (Number(quantity) > item.quantity) {
          isGreater = true;
        }
      }
    });
    return isGreater;
  };

  const handleAddToEvent = async (e) => {
    e.preventDefault();
    if (!isMainInventoryItem) {
      setNotification({
        message: 'Can only add items from main inventory to event',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    setNotification({ message: '', type: '' });

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event/${event.id}/inventory`,
        { stock: [{ food_name: formData.food_name.trim(), quantity: Number(formData.quantity) }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 'success') {
        setNotification({ message: 'Added to event inventory successfully.', type: 'success' });
        setFormData({ food_name: '', quantity: '' });
        fetchEventInventory();
      }
    } catch (error) {
      setNotification({
        message: error?.response?.data?.detail || 'Failed to add to event inventory.',
        type: 'error',
      });
    }
    setSubmitting(false);
  };

  const handleRemoveFromEvent = async (e) => {
    e.preventDefault();
    if (isMainInventoryItem) {
      setNotification({
        message: 'Can only remove items from event inventory',
        type: 'error',
      });
      return;
    }

    if (isFoodQuantityGreaterThanInventory(formData.food_name.trim(), formData.quantity)) {
      setNotification({
        message: `Cannot remove more than available quantity`,
        type: 'error',
      });
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    setNotification({ message: '', type: '' });

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/event/${event.id}/inventory`,
        { stock: [{ food_name: formData.food_name.trim(), quantity: Number(formData.quantity) }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 'success') {
        setNotification({ message: 'Removed from event inventory successfully.', type: 'success' });
        setFormData({ food_name: '', quantity: '' });
        fetchEventInventory();
      }
    } catch (error) {
      setNotification({
        message: error?.response?.data?.detail || 'Failed to remove from event inventory.',
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

  const handleFoodSelect = (e) => {
    const selectedFood = e.target.value;
    // Check if the selected food is from event inventory instead of main inventory
    const isMainItem = !eventInventory?.stock.some((item) => item.food_name === selectedFood);
    setIsMainInventoryItem(isMainItem);
    setFormData({ ...formData, food_name: selectedFood });
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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 p-8 relative max-h-[90vh] overflow-y-auto mx-4 transform transition-all duration-300">
        {/* Header Section */}
        <div className="border-b pb-4 mb-6">
          <h3 className="text-3xl font-bold text-gray-800">Manage Event Inventory</h3>
          <button
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Current Inventory Section */}
        {loadingInventory ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : eventInventory ? (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-inner">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Current Event Inventory</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventInventory.stock.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{item.food_name}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        item.quantity <= 10
                          ? 'bg-red-100 text-red-800'
                          : item.quantity <= 30
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.quantity} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Last Updated: {formatDateToLocal(eventInventory.last_updated)}
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
            No inventory available for this event.
          </div>
        )}

        {/* Inventory Management Form */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Select Item</label>
              <select
                value={formData.food_name}
                onChange={handleFoodSelect}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                required
              >
                <option value="">Choose an item...</option>
                {/* Event Items Group */}
                {eventInventory && eventInventory.stock.length > 0 && (
                  <optgroup label="Event Items" className="font-semibold">
                    {eventInventory.stock.map((item, idx) => (
                      <option key={`event-${idx}`} value={item.food_name}>
                        {item.food_name} (Event Stock: {item.quantity})
                      </option>
                    ))}
                  </optgroup>
                )}
                {/* Main Inventory Group */}
                {mainInventory.length > 0 && (
                  <optgroup label="Main Inventory" className="font-semibold">
                    {mainInventory.map((item, idx) => (
                      <option key={`main-${idx}`} value={item.food_name}>
                        {item.food_name} (Main Stock: {item.quantity})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {formData.food_name && (
                <p
                  className={`mt-2 text-sm ${isMainInventoryItem ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  {isMainInventoryItem
                    ? 'You can transfer this item from main inventory to the event'
                    : 'You can remove this item from event inventory'}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">Quantity</label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full h-11 text-lg px-4 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Enter amount..."
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <span className="text-gray-500 text-sm">units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={handleAddToEvent}
              disabled={submitting || !isMainInventoryItem || !formData.food_name}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                !isMainInventoryItem || !formData.food_name
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md'
              }`}
              title={
                !formData.food_name
                  ? 'Select an item first'
                  : !isMainInventoryItem
                    ? 'Select an item from main inventory'
                    : ''
              }
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Add to Event'
              )}
            </button>
            <button
              type="button"
              onClick={handleRemoveFromEvent}
              disabled={submitting || isMainInventoryItem || !formData.food_name}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isMainInventoryItem || !formData.food_name
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md'
              }`}
              title={
                !formData.food_name
                  ? 'Select an item first'
                  : isMainInventoryItem
                    ? 'Select an item from event inventory'
                    : ''
              }
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Remove from Event'
              )}
            </button>
          </div>
        </form>

        {/* Transfer All Button */}
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={handleTransferBack}
            disabled={submitting || !eventInventory?.stock?.length}
            className={`w-full sm:w-auto float-right px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              !eventInventory?.stock?.length
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md'
            }`}
            title={
              !eventInventory?.stock?.length
                ? 'No items in event inventory'
                : 'Transfer all items back to main inventory'
            }
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Transfer All Back to Main'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
