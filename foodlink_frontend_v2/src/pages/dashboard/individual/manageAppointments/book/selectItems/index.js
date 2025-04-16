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
    <div className=" min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${cart.length > 0 ? 'mb-[calc(12rem+env(safe-area-inset-bottom))] sm:mb-32' : ''}`}
      >
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">Food Bank Inventory</h1>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Select up to <span className="font-semibold">5 items</span> in total, with a
                  maximum of <span className="font-semibold">2 per item</span>.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {cartError && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{cartError}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl justify-items-center">
                {inventory.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Check back later for available items.
                    </p>
                  </div>
                ) : (
                  inventory.map((item) => (
                    <div
                      key={`${item.food_name ?? 'unknown'}-${item.quantity}`}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-sm"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.food_name ?? 'Unnamed Food Item'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {item.description ?? 'No description available'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.quantity > 5
                                ? 'bg-green-100 text-green-800'
                                : item.quantity > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.quantity > 0 ? `${item.quantity} available` : 'Out of stock'}
                          </span>
                          <button
                            onClick={() => addItemToCart(item)}
                            disabled={item.quantity <= 0}
                            className={`ml-4 inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium shadow-sm
                              ${
                                item.quantity <= 0
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 pb-[env(safe-area-inset-bottom)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                  <h2 className="text-lg font-medium text-gray-900 text-center sm:text-left">
                    Shopping Cart ({getTotalItems()} items)
                  </h2>
                  <div className="mt-2 flow-root">
                    <div className="-my-2">
                      {cart.map((item) => (
                        <div key={item.food_name} className="flex items-center py-2">
                          <span className="flex-1 text-sm text-gray-700">{item.food_name}</span>
                          <div className="flex items-center">
                            <button
                              onClick={() => decrementQuantity(item.food_name)}
                              className="inline-flex items-center p-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="mx-3 text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => incrementQuantity(item.food_name)}
                              className="inline-flex items-center p-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => router.back()}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodBankInventory;
