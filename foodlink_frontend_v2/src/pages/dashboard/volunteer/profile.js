import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function VolunteerProfile() {
  const router = useRouter();
  const [volunteer, setVolunteer] = useState({ description: "", experiences: "" });
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get(
            // ${process.env.NEXT_PUBLIC_BACKEND_URL}
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        console.log(response);

        // Extract user details from response and prepopulate the fields
        const user = response.data.user;
        console.log(user);
        
        setVolunteer({
          description: user.description || "",
          experiences: user.experiences || "",
          // other user fields if needed
          ...user,
        });
        setUserInfo(user);
      } catch (err) {
        setError("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVolunteer({ ...volunteer, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        // http://127.0.0.1:8000
        // ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/metadata
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/metadata`,
        volunteer,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-6xl font-bold mb-6 text-center">Volunteer Profile</h1>

      {/* Display user information */}
      {userInfo && (
        <div className="mb-6 bg-gray-100 p-4 rounded-lg">
          <p className="text-lg"><strong>Name:</strong> {userInfo.name}</p>
          <p className="text-lg"><strong>Email:</strong> {userInfo.email}</p>
          <p className="text-lg">
            <strong>Created At:</strong>{" "}
            {new Date(userInfo.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Profile update form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 text-lg mb-2">Description</label>
          <textarea
            name="description"
            value={volunteer.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            rows="5"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-lg mb-2">Experiences</label>
          <textarea
            name="experiences"
            value={volunteer.experiences}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            rows="6"
          />
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-800 text-lg"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-800 text-lg"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
