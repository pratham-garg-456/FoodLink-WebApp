'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';

export default function VolunteerProfile() {
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    image_url: '',
    description: '',
    experiences: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('/images/default-profile.png');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('accessToken');
      if (!token) return router.push('/auth/login');

      const decoded = await validateToken(token);
      if (decoded.error) return router.push('/auth/login');

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const user = res.data.user;

        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone_number || '',
          address: user.address || '',
          image_url: user.image_url || '',
          description: user.description || '',
          experiences: user.experiences || '',
        });

        setProfileImage(user.image_url || '/images/default-profile.png');
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = profile.image_url;

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/upload/`,
          { method: 'POST', body: formData }
        );

        const result = await uploadRes.json();
        imageUrl = result.secure_url;
      }

      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/metadata`,
        {
          phone_number: profile.phone,
          image_url: imageUrl,
          description: profile.description,
          experiences: profile.experiences,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Profile updated successfully!');
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error('Update failed', err);
      alert('Error updating profile.');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg flex flex-col lg:flex-row w-[70vw] my-16 md:my-28">
      <div className="order-2 lg:order-1 pr-4 w-full lg:w-2/3 flex flex-col items-center">
        <div className="space-y-4 w-full lg:w-3/4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Volunteer Profile</h2>

          {[
            { label: 'Name', value: profile.name, disabled: true },
            { label: 'Email', value: profile.email, disabled: true },
            {
              label: 'Phone',
              name: 'phone',
              value: profile.phone,
              disabled: !isEditing,
            },
            {
              label: 'Address',
              value: profile.address,
              disabled: true,
            },
          ].map((field, idx) => (
            <label key={idx}>
              <span className="text-gray-700">{field.label}</span>
              <input
                type="text"
                name={field.name || field.label.toLowerCase()}
                value={field.value}
                onChange={handleChange}
                disabled={field.disabled}
                className={`w-full mt-1 p-2 border rounded-md ${
                  field.disabled ? 'bg-gray-200' : ''
                }`}
              />
            </label>
          ))}

          <label>
            <span className="text-gray-700">Description</span>
            <textarea
              name="description"
              rows={4}
              value={profile.description}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </label>

          <label>
            <span className="text-gray-700">Experiences</span>
            <textarea
              name="experiences"
              rows={5}
              value={profile.experiences}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </label>

          <label>
            <span className="text-gray-700">Profile Picture</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={!isEditing}
              className="mt-1 w-full p-2 border rounded-md"
            />
          </label>

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
      </div>

      <div className="order-1 lg:order-2 w-auto flex justify-center items-center">
        <img
          src={profile.image_url || profileImage}
          alt="Profile"
          className="w-44 md:w-64 h-44 md:h-64 rounded-full object-cover"
        />
      </div>
    </div>
  );
}
