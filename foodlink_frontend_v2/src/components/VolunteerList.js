import axios from 'axios';
import { useEffect, useState } from 'react';
import { OrbitProgress } from 'react-loading-indicators';

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`py-2 px-6 rounded-lg transition-all duration-200 font-medium ${
            statusFilter === 'pending'
              ? 'bg-yellow-500 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setStatusFilter('pending')}
        >
          <div className="flex items-center space-x-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                statusFilter === 'pending' ? 'bg-white' : 'bg-yellow-500'
              }`}
            ></span>
            <span>Pending</span>
          </div>
        </button>
        <button
          className={`py-2 px-6 rounded-lg transition-all duration-200 font-medium ${
            statusFilter === 'approved'
              ? 'bg-green-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setStatusFilter('approved')}
        >
          <div className="flex items-center space-x-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                statusFilter === 'approved' ? 'bg-white' : 'bg-green-500'
              }`}
            ></span>
            <span>Approved</span>
          </div>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <OrbitProgress color="#000000" size="large" text="" />
        </div>
      ) : volunteers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-900">No {statusFilter} applications</p>
          <p className="text-gray-500 mt-2">Applications will appear here once volunteers apply</p>
        </div>
      ) : (
        <div className="space-y-4">
          {volunteers.map((vol) => (
            <div
              key={vol.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      {vol.volunteer_id.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">ID: {vol.volunteer_id}</p>
                      <p className="text-sm text-gray-500">
                        Applied{' '}
                        {new Date(vol.applied_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="ml-10 space-y-1">
                    <p className="text-gray-700">
                      <span className="font-medium">Position:</span> {vol.applied_position}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Category:</span> {vol.category}
                    </p>
                  </div>
                </div>

                {statusFilter === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => updateVolunteer(vol.id, 'approved')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => updateVolunteer(vol.id, 'rejected')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerList;
