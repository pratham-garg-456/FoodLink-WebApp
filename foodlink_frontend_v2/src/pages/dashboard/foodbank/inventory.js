import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import validateToken from '@/utils/validateToken';

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

  // POST route: Add or increment stock
  const handleAddStock = async (foodName, quantity) => {
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
      }
    } catch (error) {
      console.error('Error adding stock', error);
    }
  };

  // PUT route: Decrement stock
  const handleRemoveStock = async (foodName, quantity) => {
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
      console.error('Error removing stock', error);
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
      console.error('Error adding food item', error);
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

  return (
    <div className="container mx-auto p-4 mt-10">
      {/* Food Items Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Available Food Items</h2>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          onClick={() => setShowFoodItemModal(true)}
        >
          + Add Food Item
        </button>
      </div>

      {loadingFoodItems ? (
        <p>Loading food items...</p>
      ) : (
        <div className="bg-white shadow-md rounded p-4">
          {foodItems.length > 0 ? (
            <>
              {/* TABLE (hidden on small screens) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Food Name</th>
                      <th className="py-2 px-4 border-b">Category</th>
                      <th className="py-2 px-4 border-b">Unit</th>
                      <th className="py-2 px-4 border-b">Description</th>
                      <th className="py-2 px-4 border-b">Expiration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-4 border-b">{item.food_name}</td>
                        <td className="py-2 px-4 border-b">{item.category}</td>
                        <td className="py-2 px-4 border-b">{item.unit}</td>
                        <td className="py-2 px-4 border-b">{item.description}</td>
                        <td className="py-2 px-4 border-b">
                          {formatDateToLocal(item.expiration_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CARD VIEW (visible on small screens) */}
              <div className="block md:hidden space-y-4">
                {foodItems.map((item) => (
                  <div key={item.id} className="border rounded p-4 shadow-sm">
                    <p>
                      <strong>Food Name:</strong> {item.food_name}
                    </p>
                    <p>
                      <strong>Category:</strong> {item.category}
                    </p>
                    <p>
                      <strong>Unit:</strong> {item.unit}
                    </p>
                    <p>
                      <strong>Description:</strong> {item.description}
                    </p>
                    <p>
                      <strong>Expiration Date:</strong> {formatDateToLocal(item.expiration_date)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No food items available.</p>
          )}
        </div>
      )}

      {/* Inventory Section */}
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-4">Inventory</h1>
        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <div className="bg-white shadow-md rounded p-4">
            {inventory.length > 0 ? (
              <>
                {inventory.map((inv) => (
                  <div key={inv.id} className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Inventory ID: {inv.id}</h2>
                    <p className="text-sm text-gray-600 mb-2">
                      Last Updated: {formatDateToLocal(inv.last_updated)}
                    </p>

                    {/* TABLE (hidden on small screens) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b">Food Name</th>
                            <th className="py-2 px-4 border-b">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.stock.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-4 border-b">{item.food_name}</td>
                              <td className="py-2 px-4 border-b">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* CARD VIEW (visible on small screens) */}
                    <div className="block md:hidden space-y-4">
                      {inv.stock.map((item, idx) => (
                        <div key={idx} className="border rounded p-4 shadow-sm">
                          <p>
                            <strong>Food Name:</strong> {item.food_name}
                          </p>
                          <p>
                            <strong>Quantity:</strong> {item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p>No inventory data available.</p>
            )}
          </div>
        )}
      </div>

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
              className="bg-green-100 p-4 rounded"
            >
              <input
                type="text"
                name="foodName"
                placeholder="Food Name"
                className="border p-2 mb-2 w-full"
                required
              />
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
              className="bg-red-100 p-4 rounded"
            >
              <input
                type="text"
                name="foodName"
                placeholder="Food Name"
                className="border p-2 mb-2 w-full"
                required
              />
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
