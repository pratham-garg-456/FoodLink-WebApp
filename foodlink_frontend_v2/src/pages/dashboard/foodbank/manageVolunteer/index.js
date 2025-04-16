import { useState, useEffect } from 'react';
import axios from 'axios';
import { OrbitProgress } from 'react-loading-indicators';

export default function ManageVolunteers() {
  // state to track applications, selected application, volunteer details, and loading states
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [volunteerDetails, setVolunteerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // state for filtering application status: "pending" or "approved"
  const [filterStatus, setFilterStatus] = useState('pending');

  const [loadingStatusSwitch, setLoadingStatusSwitch] = useState(false);

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
    // Reset volunteer details view when filter status changes
    setSelectedApplication(null);
    setVolunteerDetails(null);
    setActivityForm({
      date_worked: '',
      start: '',
      end: '',
    });
    setActivityMessage('');
  }, [filterStatus]);

  const fetchApplications = async () => {
    setLoadingStatusSwitch(true); // Start loading indicator
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
    setLoadingStatusSwitch(false); // end loading indicator
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
      // Reset states to close the details view and refresh the list
      setSelectedApplication(null);
      setVolunteerDetails(null);
      setActivityForm({
        date_worked: '',
        start: '',
        end: '',
      });
      setActivityMessage('');
      // Refresh the applications list with updated status
      await fetchApplications();
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
    utcDate.setHours(utcDate.getHours() + 4);
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
    <div className="min-h-screen w-full px-4 md:w-3/4 mx-auto mt-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 md:mb-0">
            Manage Volunteer Applications
          </h1>

          {/* Filter Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`py-2.5 px-6 rounded-lg transition-all duration-200 font-medium ${
                filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    filterStatus === 'pending' ? 'bg-white' : 'bg-yellow-500'
                  }`}
                ></span>
                <span>Pending</span>
              </div>
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`py-2.5 px-6 rounded-lg transition-all duration-200 font-medium ${
                filterStatus === 'approved'
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    filterStatus === 'approved' ? 'bg-white' : 'bg-green-500'
                  }`}
                ></span>
                <span>Approved</span>
              </div>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loadingStatusSwitch ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <OrbitProgress color="#000000" size="large" text="" />
          </div>
        ) : (
          <>
            {/* List of Applications */}
            {!selectedApplication && (
              <div className="bg-white shadow-lg rounded-xl w-full overflow-hidden border border-gray-100">
                {applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
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
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-xl text-gray-600">No applications found</p>
                    <p className="text-gray-400 mt-2">
                      Applications will appear here once volunteers apply
                    </p>
                  </div>
                ) : (
                  <>
                    {/* TABLE (hidden on small screens) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead
                          className={filterStatus === 'pending' ? 'bg-yellow-500' : 'bg-green-600'}
                        >
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                              Volunteer Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                              Job Title
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                              Job Category
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                              Applied At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {applications.map((app) => (
                            <tr
                              key={app.id}
                              className="cursor-pointer transition-colors hover:bg-gray-50"
                              onClick={() => handleApplicationClick(app)}
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                {app.volunteer_name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                {app.job_name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                {app.job_category}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                {app.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    app.status === 'approved'
                                      ? 'bg-green-100 text-green-800'
                                      : app.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                {formatDateToLocal(app.applied_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* CARD VIEW (visible on small screens) */}
                    <div className="block md:hidden divide-y divide-gray-200">
                      {applications.map((app) => (
                        <div
                          key={app.id}
                          className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleApplicationClick(app)}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {app.volunteer_name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                app.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : app.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Job:</span> {app.job_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Category:</span> {app.category}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Applied:</span>{' '}
                              {formatDateToLocal(app.applied_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Volunteer Details View */}
        {selectedApplication && volunteerDetails && (
          <div className="bg-white shadow-lg rounded-xl p-8 mt-4 border border-gray-100">
            <button
              onClick={() => {
                setSelectedApplication(null);
                setVolunteerDetails(null);
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Applications
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Details</h2>
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <OrbitProgress color="#000000" size="large" text="" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Name</label>
                      <p className="mt-1 text-lg text-gray-900">{volunteerDetails.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="mt-1 text-lg text-gray-900">{volunteerDetails.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Description</label>
                      <p className="mt-1 text-gray-900">{volunteerDetails.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Experiences</label>
                      <p className="mt-1 text-gray-900">{volunteerDetails.experiences}</p>
                    </div>
                  </div>
                )}

                {/* Update Application Status */}
                <div className="mt-8 flex space-x-4">
                  {selectedApplication.status !== 'approved' && (
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                      disabled={updatingStatus}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Approve</span>
                    </button>
                  )}
                  {selectedApplication.status !== 'rejected' && (
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      disabled={updatingStatus}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Volunteer Activity Hours (only for approved applications) */}
              {selectedApplication.status === 'approved' && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Add Volunteer Activity Hours
                  </h3>
                  <form onSubmit={submitVolunteerActivity} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    {activityMessage && (
                      <div className="bg-green-50 text-green-800 rounded-lg p-4">
                        {activityMessage}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={submittingActivity}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      {submittingActivity ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
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
                          <span>Submit Activity Hours</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
