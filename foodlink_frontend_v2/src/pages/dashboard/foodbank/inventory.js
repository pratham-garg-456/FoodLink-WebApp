import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import validateToken from '@/utils/validateToken';
import Notification from '@/components/Notification';
import { OrbitProgress } from 'react-loading-indicators';

export default function Inventory() {
  const router = useRouter();
  const [foodbankId, setFoodbankId] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFoodItems, setLoadingFoodItems] = useState(true);
  const [showFoodItemModal, setShowFoodItemModal] = useState(false);
  const [newFoodItem, setNewFoodItem] = useState({
    food_name: '',
    category: '',
    unit: '',
    description: '',
    expiration_date: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [showFoodItemDetailsModal, setShowFoodItemDetailsModal] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showFoodItems, setShowFoodItems] = useState(true);

  // Check token and set foodbankId
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

  // Fetch inventory and food items when foodbankId is available
  useEffect(() => {
    if (foodbankId) {
      fetchInventory();
      fetchFoodItems();
    }
  }, [foodbankId]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/inventory`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      const data = await response.json();
      if (data.status === 'success') {
        setInventory(data.inventory);
      }
    } catch (error) {
      console.error('Error fetching inventory', error);
    }
    setLoading(false);
  };

  const fetchFoodItems = async () => {
    setLoadingFoodItems(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/food-items`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      const data = await response.json();
      if (data.status === 'success') {
        setFoodItems(data.food_items);
      }
    } catch (error) {
      console.error('Error fetching food items', error);
    }
    setLoadingFoodItems(false);
  };

  const isFoodInInventory = (foodName) => {
    let found = false;
    inventory?.forEach((inv) => {
      inv.stock.forEach((item) => {
        if (item.food_name.toLowerCase() === foodName.toLowerCase()) {
          found = true;
        }
      });
    });

    return found;
  };

  const isFoodQuantityGreaterThanInventory = (foodName, quantity) => {
    let isGreater = false;
    inventory?.forEach((inv) => {
      inv.stock.forEach((item) => {
        if (item.food_name.toLowerCase() === foodName.toLowerCase()) {
          if (Number(quantity) > item.quantity) {
            isGreater = true;
          }
        }
      });
    });

    return isGreater;
  };

  const isFoodInFoodItems = (foodName) => {
    return foodItems.some((item) => item.food_name.toLowerCase() === foodName.toLowerCase());
  };

  // POST route: Add or increment stock
  const handleAddStock = async (foodName, quantity) => {
    if (!isFoodInFoodItems(foodName.trim())) {
      setNotification({
        message: `${foodName} is not registered as a food item. Please add it as a food item first.`,
        type: 'error',
      });
      setShowFoodItemModal(true);
      setNewFoodItem((prev) => ({ ...prev, food_name: foodName.trim() }));
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/inventory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            stock: [{ food_name: foodName.trim(), quantity: Number(quantity) }],
          }),
        }
      );
      const data = await response.json();
      if (data.status === 'success') {
        fetchInventory();
        setNotification({
          message: 'Stock added successfully',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error adding stock', error);
      setNotification({
        message: error?.response?.data?.detail || 'Error adding stock.',
        type: 'error',
      });
    }
  };

  // PUT route: Decrement stock
  const handleRemoveStock = async (foodName, quantity) => {
    // Validate the food name before sending the request
    if (!isFoodInInventory(foodName.trim())) {
      setNotification({
        message: `${foodName} is not in the inventory.`,
        type: 'error',
      });
      return;
    }

    if (isFoodQuantityGreaterThanInventory(foodName, quantity)) {
      setNotification({
        message: `${foodName}'s quantity is greater than the stock quantity`,
        type: 'error',
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/inventory`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            stock: [{ food_name: foodName.trim(), quantity: Number(quantity) }],
          }),
        }
      );
      const data = await response.json();
      if (data.status === 'success') {
        fetchInventory();
      }
    } catch (error) {
      setNotification({
        message: error?.response?.data?.detail || 'Error removing stock.',
        type: 'error',
      });
    }
  };

  // POST route for adding a new food item
  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/food-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(newFoodItem),
        }
      );
      const data = await response.json();
      if (data.status === 'success') {
        // Clear the form and refresh the food items list
        setNewFoodItem({
          food_name: '',
          category: '',
          unit: '',
          description: '',
          expiration_date: '',
        });
        setShowFoodItemModal(false);
        fetchFoodItems();
      }
    } catch (error) {
      setNotification({
        message: error?.response?.data?.detail || 'Error adding food items.',
        type: 'error',
      });
    }
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

  const handleViewFoodItemDetails = (item) => {
    setSelectedFoodItem(item);
    setShowFoodItemDetailsModal(true);
  };

  return (
    <div className="container mx-auto p-4 my-28">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Manage Inventory</h1>

      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      {/* Combined Food Items and Inventory Section */}
      <div
        className="flex items-center justify-between cursor-pointer bg-white p-4 rounded-t-xl shadow-lg"
        onClick={() => setShowFoodItems(!showFoodItems)}
      >
        <h2 className="text-2xl font-bold">Food Items Inventory</h2>
        <div className="flex items-center gap-2">
          <button
            className="bg-lime-700 text-white px-3 py-1 rounded text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowFoodItemModal(true);
            }}
          >
            + Add Food Item
          </button>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {foodItems.length} Items
          </span>
          <svg
            className={`w-6 h-6 transition-transform ${showFoodItems ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {loadingFoodItems || loading ? (
        <div className="flex items-center justify-center p-4 bg-white rounded-b-xl shadow-lg">
          <OrbitProgress color="#000000" size="large" text="" textColor="" />
        </div>
      ) : (
        showFoodItems && (
          <div className="bg-white shadow-lg rounded-b-xl p-4">
            {foodItems.length > 0 ? (
              <div
                className="flex flex-wrap justify-start content-start"
                style={{ gap: '0.5rem', margin: '-0.25rem' }}
              >
                {[...foodItems]
                  .sort((a, b) => a.food_name.localeCompare(b.food_name))
                  .map((item) => {
                    const inventoryItem =
                      inventory.length > 0
                        ? inventory[0].stock.find((stock) => stock.food_name === item.food_name)
                        : null;

                    return (
                      <div
                        key={item.id}
                        className="bg-gray-50 border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow m-1"
                        style={{ width: '140px' }}
                      >
                        <div className="flex flex-col h-full">
                          <h3 className="font-semibold text-base mb-2 text-gray-800 truncate">
                            {item.food_name}
                          </h3>
                          <div className="mb-2 text-sm">
                            {inventoryItem ? (
                              <span
                                className={`${inventoryItem.quantity <= 10 ? 'text-red-600' : 'text-green-600'}`}
                              >
                                Stock: {inventoryItem.quantity} {item.unit}
                                {inventoryItem.quantity <= 10 && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                    Low
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-500">No stock</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleViewFoodItemDetails(item)}
                            className="w-full bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors mt-auto"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p>No food items available.</p>
            )}
            {inventory.length > 0 && (
              <div className="mt-3 text-sm text-gray-500 text-right">
                Last Updated: {formatDateToLocal(inventory[0].last_updated)}
              </div>
            )}
          </div>
        )
      )}

      {/* Food Item Details Modal */}
      {showFoodItemDetailsModal && selectedFoodItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-lg w-11/12 md:w-1/2 p-6 relative">
            <h3 className="text-xl font-bold mb-4">{selectedFoodItem.food_name} Details</h3>
            <div className="space-y-3">
              <p>
                <strong>Category:</strong> {selectedFoodItem.category}
              </p>
              <p>
                <strong>Unit:</strong> {selectedFoodItem.unit}
              </p>
              <p>
                <strong>Description:</strong> {selectedFoodItem.description}
              </p>
              <p>
                <strong>Expiration Date:</strong>{' '}
                {formatDateToLocal(selectedFoodItem.expiration_date)}
              </p>

              {/* Show current inventory level if available */}
              {inventory.length > 0 &&
                inventory[0].stock.map((stock) => {
                  if (stock.food_name === selectedFoodItem.food_name) {
                    return (
                      <p key="inventory" className="text-green-600">
                        <strong>Current Stock:</strong> {stock.quantity} {selectedFoodItem.unit}
                      </p>
                    );
                  }
                  return null;
                })}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowFoodItemDetailsModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Update Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Update Inventory</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Form to add/increment stock */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Add Stock</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const foodName = e.target.foodName.value;
                const quantity = e.target.quantity.value;
                handleAddStock(foodName, quantity);
              }}
              className="bg-green-200 p-4 rounded-2xl shadow-xl"
            >
              <select name="foodName" className="border p-2 mb-2 w-full" required>
                <option value="">Select Food Item</option>
                {foodItems.map((item) => (
                  <option key={item.id} value={item.food_name}>
                    {item.food_name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                className="border p-2 mb-2 w-full"
                step="0.1"
                required
              />
              <button type="submit" className="bg-green-500 text-white p-2 rounded w-full">
                Add Stock
              </button>
            </form>
          </div>

          {/* Form to remove/decrement stock */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Remove Stock</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const foodName = e.target.foodName.value;
                const quantity = e.target.quantity.value;
                handleRemoveStock(foodName, quantity);
              }}
              className="bg-red-200 p-4 rounded-2xl shadow-xl"
            >
              <select name="foodName" className="border p-2 mb-2 w-full" required>
                <option value="">Select Food Item</option>
                {inventory.length > 0 &&
                  inventory[0].stock.map((item, idx) => (
                    <option key={idx} value={item.food_name}>
                      {item.food_name}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                className="border p-2 mb-2 w-full"
                step="0.1"
                required
              />
              <button type="submit" className="bg-red-500 text-white p-2 rounded w-full">
                Remove Stock
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal for Adding a New Food Item */}
      {showFoodItemModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-lg w-11/12 md:w-1/2 p-6 relative">
            <h3 className="text-xl font-bold mb-4">Add New Food Item</h3>
            <form onSubmit={handleAddFoodItem}>
              <div className="mb-4">
                <label className="block mb-1">Food Name</label>
                <input
                  type="text"
                  value={newFoodItem.food_name}
                  onChange={(e) => setNewFoodItem({ ...newFoodItem, food_name: e.target.value })}
                  className="border p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Category</label>
                <select
                  value={newFoodItem.category}
                  onChange={(e) => setNewFoodItem({ ...newFoodItem, category: e.target.value })}
                  className="border p-2 w-full"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meat">Meat</option>
                  <option value="Canned Goods">Canned Goods</option>
                  <option value="Grains">Grains</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Packed Food">Packed Food</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Unit</label>
                <select
                  value={newFoodItem.unit}
                  onChange={(e) => setNewFoodItem({ ...newFoodItem, unit: e.target.value })}
                  className="border p-2 w-full"
                  required
                >
                  <option value="" disabled>
                    Select a unit
                  </option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="grams">Grams (g)</option>
                  <option value="liters">Liters (l)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="packs">Packs</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Description</label>
                <textarea
                  value={newFoodItem.description}
                  onChange={(e) => setNewFoodItem({ ...newFoodItem, description: e.target.value })}
                  className="border p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Expiration Date (YYYY-MM-DD HH:mm)</label>
                <input
                  type="text"
                  value={newFoodItem.expiration_date}
                  onChange={(e) =>
                    setNewFoodItem({ ...newFoodItem, expiration_date: e.target.value })
                  }
                  className="border p-2 w-full"
                  placeholder="2026-09-30 23:59"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => setShowFoodItemModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-500 text-white">
                  Add Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
