import { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    deadline: '',
    status: 'available',
  });

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/jobs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setJobs(response.data.jobs);
    } catch (error) {
      setJobs([]);
      console.log('Error fetching jobs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJobId) {
        // Update existing job using PUT
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/job/${editingJobId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
      } else {
        // Create new job using POST
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/job`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
      }
      // Refresh job list and reset form
      fetchJobs();
      setModalOpen(false);
      setEditingJobId(null);
      setFormData({
        title: '',
        description: '',
        location: '',
        category: '',
        deadline: '',
        status: 'available',
      });
    } catch (error) {
      console.error('Error submitting job:', error);
    }
  };

  const convertDateFormat = (input) => {
    if (!input) return '';
    const deadline = formatDateToLocal(input)
    const [datePart, timePart] = deadline.split(', ');
    const [month, day, year] = datePart.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timePart}`;
  };
  
  

  // Pre-fill the form for editing a job
  const handleEditJob = (job) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      category: job.category,
      deadline: job.deadline ? convertDateFormat(job.deadline) : " ",
      status: job.status,
    });
    setModalOpen(true);
  };

  const formatDateToLocal = (isoString) => {
    if (!isoString) return 'N/A';
    const utcDate = new Date(isoString + 'Z');
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
    <div className="min-h-screen p-6 mt-10">
      <div className="w-full mx-auto">
        {/* Header and Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Jobs</h1>
          <button
            onClick={() => {
              setModalOpen(true);
              setEditingJobId(null);
              setFormData({
                title: '',
                description: '',
                location: '',
                category: '',
                deadline: '',
                status: 'available',
              });
            }}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Add New Job
          </button>
        </div>

        {/* Jobs Table */}
        <div className="bg-white shadow rounded-lg w-full overflow-x-auto">
          <table className="w-full table-auto divide-y divide-gray-200">
            <thead className="bg-green-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Description</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Location</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Deadline</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{job.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-normal break-words">
                    {job.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{job.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{job.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {formatDateToLocal(job.deadline)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{job.status}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    {/* Additional actions (e.g. delete) can be added here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for adding/updating a job */}
        {modalOpen && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4">
                {editingJobId ? 'Update Job' : 'Add New Job'}
              </h2>
              <form onSubmit={handleFormSubmit}>
                {/* Title */}
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                    placeholder="e.g. Warehouse Manager"
                  />
                </div>
                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                    placeholder="Job responsibilities, tasks, etc."
                  ></textarea>
                </div>
                {/* Location */}
                <div className="mb-4">
                  <label htmlFor="location" className="block text-gray-700 font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                    placeholder="e.g. Toronto, ON"
                  />
                </div>
                {/* Category */}
                <div className="mb-4">
                  <label htmlFor="category" className="block text-gray-700 font-medium mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                    placeholder="e.g. Logistics, Event"
                  />
                </div>
                {/* Deadline */}
                <div className="mb-4">
                  <label htmlFor="deadline" className="block text-gray-700 font-medium mb-1">
                    Deadline (YYYY-MM-DD HH:MM)
                  </label>
                  <input
                    type="text"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                    placeholder="e.g. 2025-03-18 09:09"
                  />
                </div>
                {/* Status */}
                <div className="mb-4">
                  <label htmlFor="status" className="block text-gray-700 font-medium mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded w-full"
                >
                  {editingJobId ? 'Update Job' : 'Submit Job'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
