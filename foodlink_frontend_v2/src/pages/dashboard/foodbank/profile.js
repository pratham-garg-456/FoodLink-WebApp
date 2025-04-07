'use client';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import validateToken from '@/utils/validateToken';
import { useRouter } from 'next/router';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    image_url: '',
    location: '',
    description: '',
    operating_hours: '',
    services: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('/images/default-profile.png');
  const [imageFile, setImageFile] = useState(null);
  const addressInputRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem('name');
    const storedEmail = localStorage.getItem('email');
    const storedPhone = localStorage.getItem('phone_number');
    const storedImageUrl = localStorage.getItem('image_url');

    if (storedName || storedEmail || storedPhone || storedImageUrl) {
      setUser({
        name: storedName || '',
        email: storedEmail || '',
        phone: storedPhone || '',
        image_url: storedImageUrl || '',
        location: '',
        description: '',
        operating_hours: '',
        services: '',
      });
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const decodedToken = await validateToken(token);
      console.log(decodedToken);
      if (decodedToken.error) {
        console.error('Invalid token: ', decodedToken.error);
        router.push('/auth/login');
        return;
      }
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profileData = response.data;
        console.log(profileData);

        // Update local storage with fetched user data
        localStorage.setItem('name', profileData.user.name);
        localStorage.setItem('email', profileData.user.email);
        localStorage.setItem('phone_number', profileData.user.phone_number);
        localStorage.setItem('image_url', profileData.user.image_url);
        localStorage.setItem('location', profileData.user.location || '');
        localStorage.setItem('description', profileData.user.description || '');
        localStorage.setItem('operating_hours', profileData.user.operating_hours || '');
        localStorage.setItem('services', profileData.user.services || '');

        // Set user state
        setUser({
          name: profileData.user.name || '',
          email: profileData.user.email || '',
          phone: profileData.user.phone_number || '',
          image_url: profileData.user.image_url || null,
          location: profileData.user.location || '',
          description: profileData.user.description || '',
          operating_hours: profileData.user.operating_hours || '',
          services: profileData.user.services || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
    const loadGooglePlacesScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            setUser((prevUser) => ({
              ...prevUser,
              location: place.formatted_address,
            }));
          }
        });
      };
      document.body.appendChild(script);
    };

    loadGooglePlacesScript();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const updatedData = {
      description: user.description || '',
      phone_number: user.phone || '',
      location: user.location || '',
      operating_hours: user.operating_hours || '',
      services: user.services || '',
    };

    // Check if an image file is provided
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      try {
        // Upload image to Cloudinary
        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/upload/`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image to server');
        }

        const uploadResult = await uploadResponse.json();
        const imageUrl = uploadResult.secure_url;

        // Add image URL to updatedData
        updatedData.image_url = imageUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
        return; // Exit if image upload fails
      }
    } else {
      updatedData.image_url = null;
    }

    // Proceed to update user profile only if there are fields to update
    if (
      Object.keys(updatedData).some((key) => updatedData[key] !== null && updatedData[key] !== '')
    ) {
      try {
        // Update user profile
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/metadata`,
          updatedData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (!response.data.status === 'success') {
          throw new Error('Failed to update profile');
        }

        // Fetch updated user data
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        // Update local storage with new user data
        const profileData = profileResponse.data;
        localStorage.setItem('name', profileData.user.name);
        localStorage.setItem('email', profileData.user.email);
        localStorage.setItem('phone_number', profileData.user.phone_number);
        localStorage.setItem('image_url', profileData.user.image_url);
        localStorage.setItem('location', profileData.user.location || '');
        localStorage.setItem('description', profileData.user.description || '');
        localStorage.setItem('operating_hours', profileData.user.operating_hours || '');
        localStorage.setItem('services', profileData.user.services || '');
        window.dispatchEvent(new Event('storage'));
        window.location.reload();

        console.log(profileData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
      }
    } else {
      alert('No changes made to update.');
    }
  };

  return (
    <div className="mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg flex flex-col lg:flex-row w-[70vw] my-16 md:my-28">
      <div className="order-2 lg:order-1 pr-4 w-full lg:w-2/3 flex flex-col items-center">
        <div className="space-y-4 w-full lg:w-1/2">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">User Profile</h2>
          <label className="block">
            <span className="text-gray-700">Name</span>
            <input
              type="text"
              name="name"
              value={user.name}
              disabled={true}
              className="w-full mt-1 p-2 border rounded-md bg-gray-200 cursor-not-allowed"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              name="email"
              value={user.email}
              disabled={true}
              className="w-full mt-1 p-2 border rounded-md bg-gray-200 cursor-not-allowed"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Phone</span>
            <input
              type="text"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Location</span>
            <input
              type="text"
              name="location"
              ref={addressInputRef}
              value={user.location}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Description</span>
            <textarea
              name="description"
              value={user.description}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Operating Hours</span>
            <input
              type="text"
              name="operating_hours"
              value={user.operating_hours}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Services</span>
            <input
              type="text"
              name="services"
              value={user.services}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </label>
          <label className="flex justify-center items-start flex-col">
            <span className="text-gray-700">Profile Picture</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={!isEditing}
              className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </label>
        </div>

        <div className="flex gap-4 mt-6">
          {isEditing ? (
            <>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="order-1 lg:order-2 w-auto  flex justify-center items-center">
        <img
          src={user.image_url || profileImage}
          alt="User Profile"
          className="w-44 md:w-64 h-44 md:h-64 rounded-full object-cover"
        />
      </div>
    </div>
  );
}
