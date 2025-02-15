import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../../../styles/inventory.module.css'; // Import the CSS module
import validateToken from '@/utils/validateToken';

const Inventory = ({ userRole }) => {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ food_name: '', quantity: '' });
  const [editItem, setEditItem] = useState(null);
  const [error, setError] = useState({});
  const [apiError, setApiError] = useState('');
  const [foodbankId, setFoodbankId] = useState(null);

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
        fetchInventory(decodedToken.user.id);
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [router]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/inventory`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setInventory(response.data.inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setApiError('Error fetching inventory. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = async () => {
    const errors = {};
    if (!newItem.food_name) errors.food_name = 'Food name is required';
    if (!newItem.quantity) errors.quantity = 'Quantity is required';
    setError(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/inventory`,
        newItem,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setInventory([...inventory, response.data.inventory]);
      setNewItem({ food_name: '', quantity: '' });
      setApiError('');
    } catch (error) {
      console.error('Error adding inventory item:', error);
      setApiError('Error adding inventory item. Please try again later.');
    }
  };

  const handleEditItem = (item) => {
    setEditItem(item);
  };

  const handleUpdateItem = async () => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/inventory/${editItem.id}`,
        editItem,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setInventory(
        inventory.map((item) => (item.id === editItem.id ? response.data.inventory : item))
      );
      setEditItem(null);
      setApiError('');
    } catch (error) {
      console.error('Error updating inventory item:', error);
      setApiError('Error updating inventory item. Please try again later.');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/inventory/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setInventory(inventory.filter((item) => item.id !== id));
      setApiError('');
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      setApiError('Error deleting inventory item. Please try again later.');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: value });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Food Bank Inventory</h1>
      {apiError && <p className="text-red-500 text-center mb-4">{apiError}</p>}
      <div className={styles.formContainer}>
        <h2>Add New Item</h2>
        <div className="flex flex-col md:flex-row items-center mb-4">
          <div className="flex flex-col mb-2 md:mb-0 md:mr-2">
            <input
              type="text"
              name="food_name"
              value={newItem.food_name}
              onChange={handleInputChange}
              placeholder="Food Name"
              className={styles.input}
            />
            {error.food_name && <p className="text-red-500 text-sm mt-1">{error.food_name}</p>}
          </div>
          <div className="flex flex-col mb-2 md:mb-0 md:mr-2">
            <input
              type="number"
              name="quantity"
              value={newItem.quantity}
              onChange={handleInputChange}
              placeholder="Quantity"
              className={styles.input}
            />
            {error.quantity && <p className="text-red-500 text-sm mt-1">{error.quantity}</p>}
          </div>
          <button onClick={handleAddItem} className={`${styles.button} ${styles.bgBlue}`}>
            Add Item
          </button>
        </div>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Food Name</th>
              <th className={styles.tableHeader}>Quantity</th>
              <th className={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  {editItem && editItem.id === item.id ? (
                    <div className="flex flex-col">
                      <input
                        type="text"
                        name="food_name"
                        value={editItem.food_name}
                        onChange={handleEditInputChange}
                        className={styles.input}
                      />
                      {error.food_name && (
                        <p className="text-red-500 text-sm mt-1">{error.food_name}</p>
                      )}
                    </div>
                  ) : (
                    item.food_name
                  )}
                </td>
                <td className={styles.tableCell}>
                  {editItem && editItem.id === item.id ? (
                    <div className="flex flex-col">
                      <input
                        type="number"
                        name="quantity"
                        value={editItem.quantity}
                        onChange={handleEditInputChange}
                        className={styles.input}
                      />
                      {error.quantity && (
                        <p className="text-red-500 text-sm mt-1">{error.quantity}</p>
                      )}
                    </div>
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className={styles.tableCell}>
                  {editItem && editItem.id === item.id ? (
                    <button
                      onClick={handleUpdateItem}
                      className={`${styles.button} ${styles.bgGreen} mr-2`}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditItem(item)}
                        className={`${styles.button} ${styles.bgYellow} mr-2`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className={`${styles.button} ${styles.bgRed}`}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
