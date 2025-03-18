import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageVolunteers() {
  // state to track applications, selected application, volunteer details, and loading states
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [volunteerDetails, setVolunteerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // state for filtering application status: "pending" or "approved"
  const [filterStatus, setFilterStatus] = useState('pending');

  // State for volunteer activity form
  const [activityForm, setActivityForm] = useState({
    date_worked: '',
    start: '',
    end: '',
  });
  const [submittingActivity, setSubmittingActivity] = useState(false);
  const [activityMessage, setActivityMessage] = useState('');

  // Fetch applications when component mounts or filterStatus changes
  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteer-applications?status=${filterStatus}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setApplications(res.data.applications);
    } catch (error) {
      // console.error("Error fetching applications:", error);
      setApplications([]);
    }
  };

  const fetchVolunteerDetails = async (volunteer_id) => {
    setLoadingDetails(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteer/${volunteer_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setVolunteerDetails(res.data.volunteer);
    } catch (error) {
      console.error('Error fetching volunteer details:', error);
    }
    setLoadingDetails(false);
  };

  const handleApplicationClick = (application) => {
    setSelectedApplication(application);
    fetchVolunteerDetails(application.volunteer_id);
    setActivityMessage('');
    setActivityForm({
      date_worked: '',
      start: '',
      end: '',
    });
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteers/${applicationId}`,
        { updated_status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      // Refresh the list after update
      fetchApplications();
      setSelectedApplication(null);
      setVolunteerDetails(null);
    } catch (error) {
      console.error('Error updating application status:', error);
    }
    setUpdatingStatus(false);
  };

  // Submit volunteer activity hours for approved applications
  const submitVolunteerActivity = async (e) => {
    e.preventDefault();
    setSubmittingActivity(true);
    setActivityMessage('');
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteer-activity/${selectedApplication.id}`,
        {
          date_worked: activityForm.date_worked,
          working_hours: {
            start: activityForm.start,
            end: activityForm.end,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (res.data.status === 'success') {
        setActivityMessage('Activity logged successfully.');
        // Optionally, clear the form:
        setActivityForm({
          date_worked: '',
          start: '',
          end: '',
        });
      }
    } catch (error) {
      console.error('Error logging volunteer activity:', error);
      setActivityMessage('Failed to log activity.');
    }
    setSubmittingActivity(false);
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
    <div className="min-h-screen w-3/4 mt-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Manage Volunteer Applications
        </h1>

        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`py-2 px-4 rounded ${
              filterStatus === 'pending'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending Applications
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`py-2 px-4 rounded ${
              filterStatus === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved Applications
          </button>
        </div>

        {/* List of Applications */}
        {!selectedApplication && (
          <div className="bg-white shadow rounded-lg w-full overflow-x-auto">
            {applications.length === 0 ? (
              <div className="p-6 text-center bg-gray-100 text-gray-600">
                There are no applications now.
              </div>
            ) : (
              <table className="w-full table-auto divide-y divide-gray-200">
                <thead className="bg-green-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-white">
                      Volunteer Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-white">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-white">
                      Job Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-white">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-white">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-white">
                      Applied At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleApplicationClick(app)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {app.volunteer_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {app.job_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {app.job_category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {app.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {app.status}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {formatDateToLocal(app.applied_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Volunteer Details View */}
        {selectedApplication && volunteerDetails && (
          <div className="bg-white shadow rounded-lg p-6">
            <button
              onClick={() => {
                setSelectedApplication(null);
                setVolunteerDetails(null);
              }}
              className="mb-4 text-blue-600 hover:underline"
            >
              &larr; Back to Applications
            </button>
            <h2 className="text-2xl font-bold mb-4">Volunteer Details</h2>
            {loadingDetails ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Name:</span>{' '}
                  {volunteerDetails.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{' '}
                  {volunteerDetails.email}
                </p>
                <p>
                  <span className="font-semibold">Description:</span>{' '}
                  {volunteerDetails.description}
                </p>
                <p>
                  <span className="font-semibold">Experiences:</span>{' '}
                  {volunteerDetails.experiences}
                </p>
              </div>
            )}

            {/* Update Application Status */}
            <div className="mt-6 space-x-4">
              {selectedApplication.status !== 'approved' && (
                <button
                  onClick={() =>
                    updateApplicationStatus(selectedApplication.id, 'approved')
                  }
                  disabled={updatingStatus}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Approve
                </button>
              )}
              {selectedApplication.status !== 'rejected' && (
                <button
                  onClick={() =>
                    updateApplicationStatus(selectedApplication.id, 'rejected')
                  }
                  disabled={updatingStatus}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  Reject
                </button>
              )}
            </div>

            {/* Volunteer Activity Hours (only for approved applications) */}
            {selectedApplication.status === 'approved' && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">
                  Add Volunteer Activity Hours
                </h3>
                <form onSubmit={submitVolunteerActivity} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-semibold">
                      Date Worked
                    </label>
                    <input
                      type="date"
                      value={activityForm.date_worked}
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          date_worked: e.target.value,
                        })
                      }
                      className="border p-2 w-full"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block mb-1 font-semibold">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={activityForm.start}
                        onChange={(e) =>
                          setActivityForm({
                            ...activityForm,
                            start: e.target.value,
                          })
                        }
                        className="border p-2 w-full"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1 font-semibold">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={activityForm.end}
                        onChange={(e) =>
                          setActivityForm({
                            ...activityForm,
                            end: e.target.value,
                          })
                        }
                        className="border p-2 w-full"
                        required
                      />
                    </div>
                  </div>
                  {activityMessage && (
                    <p className="text-sm text-green-600">{activityMessage}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submittingActivity}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  >
                    {submittingActivity
                      ? 'Submitting...'
                      : 'Submit Activity Hours'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
