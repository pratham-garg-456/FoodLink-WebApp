import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import { cartAtom, cartErrorAtom } from '../../../../../../../store'; // Import the atoms
import validateToken from '@/utils/validateToken';

const FoodBankInventory = () => {
  const router = useRouter();
  const { foodBank } = router.query;

  const [inventory, setInventory] = useState([]);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useAtom(cartAtom); // Use Jotai atom for cart
  const [cartError, setCartError] = useAtom(cartErrorAtom); // Use Jotai atom for cartError

  // Load the token on mount
  useEffect(() => {
    setToken(localStorage.getItem('accessToken'));
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart'));
    if (savedCart) {
      setCart(savedCart);
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        localStorage.clear();
        router.push('/auth/login');
        return;
      }

      try {
        const decodedToken = await validateToken(token);
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [router]);
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart'); // Clear cart from localStorage when empty
    }
  }, [cart]);

  useEffect(() => {
    if (!foodBank || !token) return;

    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/individual/inventory/${foodBank}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        setInventory(data.inventory.stock);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [foodBank, token]);

  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  const addItemToCart = (item) => {
    const totalItems = getTotalItems();

    if (totalItems >= 5) {
      setCartError('You can only select up to 5 items.');
      return;
    }

    setCartError('');

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((i) => i.food_name === item.food_name);

      if (existingItemIndex !== -1) {
        if (prevCart[existingItemIndex].quantity >= 2) {
          setCartError('You can only select up to 2 of each item.');
          return prevCart;
        }
        setInventory((prevInventory) =>
          prevInventory.map((i) =>
            i.food_name === item.food_name ? { ...i, quantity: i.quantity - 1 } : i
          )
        );
        return prevCart.map((i, index) =>
          index === existingItemIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      setInventory((prevInventory) =>
        prevInventory.map((i) =>
          i.food_name === item.food_name ? { ...i, quantity: i.quantity - 1 } : i
        )
      );
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const incrementQuantity = (foodName) => {
    const totalItems = getTotalItems();

    if (totalItems >= 5) {
      setCartError('You can only select up to 5 items.');
      return;
    }

    setCartError('');

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.food_name === foodName
          ? item.quantity < 2
            ? { ...item, quantity: item.quantity + 1 }
            : item
          : item
      )
    );
  };

  const decrementQuantity = (foodName) => {
    setCartError('');
    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((item) =>
          item.food_name === foodName ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);

      setInventory((prevInventory) =>
        prevInventory.map((i) =>
          i.food_name === foodName ? { ...i, quantity: i.quantity + 1 } : i
        )
      );

      return updatedCart;
    });
  };

  const handleCheckout = () => {
    setCartError('');
    router.push('/dashboard/individual/manageAppointments/book/cart');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full min-h-screen flex flex-col">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Food Bank Inventory</h1>

      <p className="text-sm text-gray-700 mb-4 text-center">
        ⚠️ You can select a **maximum of 5 items** in total, with a **limit of 2 per item**.
      </p>

      {error && <p className="text-red-500 text-center mb-5">Error: {error}</p>}
      {cartError && <p className="text-red-500 text-center mb-5">{cartError}</p>}

      {loading ? (
        <p className="text-center">Loading inventory...</p>
      ) : (
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 justify-center mb-${cart.length > 0 ? '48' : '0'}`}
        >
          {inventory.length === 0 ? (
            <p className="text-center col-span-full">No items available.</p>
          ) : (
            inventory.map((item) => (
              <div
                key={`${item.food_name ?? 'unknown'}-${item.quantity}`}
                className="border p-4 rounded-lg shadow-md flex flex-col items-center text-center max-w-[300px] w-full mx-auto justify-space-between"
              >
                <h3 className="text-lg font-semibold">{item.food_name ?? 'Unnamed Food Item'}</h3>
                <p className="text-gray-600">{item.description ?? 'No description available'}</p>
                <div className="flex flex-col justify-start mt-2">
                  <p>Available: {item.quantity ?? 0}</p>
                  <button
                    onClick={() => addItemToCart(item)}
                    className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-center">Cart</h2>
          <ul className="max-w-md mx-auto">
            {cart.map((item) => (
              <li key={item.food_name} className="flex justify-between items-center mt-2">
                <span>{item.food_name}</span>
                <div className="flex items-center">
                  <button
                    onClick={() => decrementQuantity(item.food_name)}
                    className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() => incrementQuantity(item.food_name)}
                    className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={handleCheckout}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition mt-4"
          >
            Go to Checkout
          </button>
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition mt-4"
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodBankInventory;
