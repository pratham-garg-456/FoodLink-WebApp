import axios from 'axios';
import { useEffect, useState } from 'react';

const VolunteerList = ({ eventId, token, setNotification }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  // statusFilter: "pending" or "approved"
  const [statusFilter, setStatusFilter] = useState('pending');

  // Fetch volunteer applications based on the current statusFilter.
  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteers/${eventId}?status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Ensure only applications with exact matching status are shown.
      const fetchedVolunteers = response?.data?.volunteers || [];
      setVolunteers(fetchedVolunteers);
    } catch (error) {
      if (error?.response?.data?.detail) {
        setNotification({
          message: error.response.data.detail,
          type: 'error',
        });
      } else {
        setNotification({
          message: 'Failed to load volunteer applications.',
          type: 'error',
        });
      }
      setVolunteers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVolunteers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, statusFilter]);

  // Update the status of a volunteer application.
  const updateVolunteer = async (applicationId, updatedStatus) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteers/${applicationId}`,
        { updated_status: updatedStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotification({
        message: `Application ${updatedStatus}.`,
        type: 'success',
      });
      fetchVolunteers();
    } catch (error) {
      if (error?.response?.data?.detail) {
        setNotification({
          message: error.response.data.detail,
          type: 'error',
        });
      } else {
        setNotification({
          message: 'Failed to update volunteer applications.',
          type: 'error',
        });
      }
    }
  };

  return (
    <div className="mt-4">
      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-2">
        <button
          className={`px-3 py-1 rounded ${
            statusFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`px-3 py-1 rounded ${
            statusFilter === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setStatusFilter('approved')}
        >
          Approved
        </button>
      </div>

      {loading ? (
        <p>Loading volunteer applications...</p>
      ) : volunteers.length === 0 ? (
        <p className="text-sm text-gray-600">No {statusFilter} volunteer applications.</p>
      ) : (
        <ul className="space-y-2">
          {volunteers.map((vol) => (
            <li key={vol.id} className="border p-2 rounded flex justify-between items-center">
              <div>
                <p>
                  <strong>Volunteer ID:</strong> {vol.volunteer_id}
                </p>
                <p>
                  <strong>Position:</strong> {vol.applied_position}
                </p>
                <p>
                  <strong>Category:</strong> {vol.category}
                </p>
                <p className="text-xs text-gray-500">
                  Applied At: {new Date(vol.applied_at).toLocaleDateString()}
                </p>
              </div>
              {/* Show update buttons only in pending mode */}
              {statusFilter === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateVolunteer(vol.id, 'approved')}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateVolunteer(vol.id, 'rejected')}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VolunteerList;
