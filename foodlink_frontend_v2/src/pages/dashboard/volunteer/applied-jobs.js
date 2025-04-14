import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';

const AvailableJobs = () => {
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;
  const router = useRouter();

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

  return (
    <div className="p-4 w-3/4">
      {/* TABLE VIEW for md+ screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full mt-4 border border-black">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-2">POSITION</th>
              <th className="p-2">CATEGORY</th>
              <th className="p-2">FOOD BANK</th>
              <th className="p-2">APPLIED AT</th>
              <th className="p-2">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((app) => {
              const job = jobDetails[app.job_id];

              // If still fetching or job not found, skip
              if (!job) return null;

              return (
                <tr
                  key={app.job_id}
                  className="border hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleRowClick(app.id, job)}
                >
                  <td className="p-2 font-bold text-blue-700">
                    {job.title}
                    <br />
                    <span className="text-sm text-gray-500">{job.location}</span>
                  </td>
                  <td className="p-2">{job.category}</td>
                  <td className="p-2">{job.foodbank_name || 'N/A'}</td>
                  <td className="p-2">
                    {app.applied_at
                      ? new Date(app.applied_at).toISOString().split('T')[0]
                      : 'N/A'}
                  </td>
                  <td className="p-2">{app.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CARD VIEW for small screens */}
      <div className="block md:hidden space-y-2">
        {currentJobs.map((app) => {
          const job = jobDetails[app.job_id];
          if (!job) return null;

          return (
            <div
              key={app.job_id}
              onClick={() => handleRowClick(app.id, job)}
              className="border p-2 rounded hover:bg-gray-100 cursor-pointer"
            >
              <p className="font-bold text-blue-700">{job.title}</p>
              <p className="text-sm text-gray-500">{job.location}</p>
              <p>
                <strong>Category:</strong> {job.category}
              </p>
              <p>
                <strong>Food Bank:</strong> {job.foodbank_name || 'N/A'}
              </p>
              <p>
                <strong>Applied At:</strong>{' '}
                {app.applied_at
                  ? new Date(app.applied_at).toISOString().split('T')[0]
                  : 'N/A'}
              </p>
              <p>
                <strong>Status:</strong> {app.status}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          className="border p-2"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`border p-2 ${currentPage === page ? 'bg-black text-white' : ''}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="border p-2"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default AvailableJobs;
