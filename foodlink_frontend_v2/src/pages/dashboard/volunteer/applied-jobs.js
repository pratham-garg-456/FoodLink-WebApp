import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';
import { OrbitProgress } from 'react-loading-indicators';

const AvailableJobs = () => {
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const decodedToken = await validateToken(token);
        fetchApplications();
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [currentPage]);

  async function fetchApplications() {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/applied_job`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      const data = response.data;
      if (data.status === 'success') {
        setApplications(data.application);

        // Fetch job details for each application
        const jobsData = {};
        await Promise.all(
          data.application.map(async (app) => {
            try {
              const jobResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/job/${app.job_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                  },
                }
              );
              jobsData[app.job_id] = jobResponse.data.job; // Store job data
            } catch (error) {
              if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.error(`Job ${app.job_id} not found.`);
                jobsData[app.job_id] = null; // Mark job as null if 404
              } else {
                console.error('Other error fetching job details:', error);
                jobsData[app.job_id] = null; // Mark job as null for any other error
              }
            }
          })
        );

        setJobDetails(jobsData); // Update state after all jobs are fetched
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  }

  const handleRowClick = (appId, job) => {
    localStorage.setItem('selectedJob', JSON.stringify(job));
    localStorage.setItem('previousPage', 'applied-jobs');
    localStorage.setItem('selectedAppId', appId);
    router.push(`/dashboard/volunteer/${appId}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(applications.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = applications.slice(indexOfFirstJob, indexOfLastJob);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <OrbitProgress color="#000000" size="large" text="" textColor="" />
      </div>
    );

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Applied Positions</h1>

      {/* Status summary section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="text-sm text-gray-600">{applications.length} applications submitted</div>
      </div>

      {/* TABLE VIEW for md+ screens */}
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-6 py-4 text-left">POSITION</th>
                <th className="px-6 py-4 text-left">CATEGORY</th>
                <th className="px-6 py-4 text-left">FOOD BANK</th>
                <th className="px-6 py-4 text-left">APPLIED AT</th>
                <th className="px-6 py-4 text-left">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.map((app) => {
                const job = jobDetails[app.job_id];
                if (!job) return null;

                return (
                  <tr
                    key={app.job_id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleRowClick(app.id, job)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-blue-600 hover:text-blue-800">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{job.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                        {job.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{job.foodbank_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          app.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : app.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARD VIEW for small screens */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {currentJobs.map((app) => {
          const job = jobDetails[app.job_id];
          if (!job) return null;

          return (
            <div
              key={app.job_id}
              onClick={() => handleRowClick(app.id, job)}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-100"
            >
              <div className="font-semibold text-blue-600 text-lg mb-2">{job.title}</div>
              <div className="text-sm text-gray-500 mb-3">{job.location}</div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                  {job.category}
                </span>
              </div>
              <div className="text-gray-700 mb-2">
                <span className="font-medium">Food Bank:</span> {job.foodbank_name || 'N/A'}
              </div>
              <div className="text-gray-700 mb-2">
                <span className="font-medium">Applied:</span>{' '}
                {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full ${
                    app.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : app.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 gap-2">
        <button
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200'
          }`}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`w-10 h-10 rounded-md ${
                currentPage === page
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors duration-200`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200'
          }`}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AvailableJobs;
