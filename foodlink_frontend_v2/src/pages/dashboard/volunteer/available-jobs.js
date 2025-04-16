import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';
import { OrbitProgress } from 'react-loading-indicators';
const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;
  const [volunteerId, setVolunteerId] = useState([]);
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
        setVolunteerId(decodedToken.user.id);
        fetchJobs();
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [currentPage]);
  async function fetchJobs() {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/jobs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      const data = await response.data;
      if (data.status === 'success') {
        setJobs(data.jobs);
      }
    } catch (error) {
      setJobs([]);
      console.error('Error fetching jobs:', error);
    }
    setLoading(false);
  }
  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <OrbitProgress color="#000000" size="large" text="" textColor="" />
      </div>
    );
  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Available Positions</h1>

      {/* Search and filter section - placeholder for future enhancement */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="text-sm text-gray-600">{jobs.length} positions available</div>
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
                <th className="px-6 py-4 text-left">DATE POSTED</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    localStorage.setItem('selectedJob', JSON.stringify(job));
                    localStorage.setItem('previousPage', 'available-jobs');
                    router.push(`/dashboard/volunteer/${job.id}`);
                  }}
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
                  <td className="px-6 py-4 text-gray-700">{job.foodbank_name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(job.date_posted).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARD VIEW for small screens */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {currentJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => {
              localStorage.setItem('selectedJob', JSON.stringify(job));
              localStorage.setItem('previousPage', 'available-jobs');
              router.push(`/dashboard/volunteer/${job.id}`);
            }}
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
              <span className="font-medium">Food Bank:</span> {job.foodbank_name}
            </div>
            <div className="text-sm text-gray-600">
              Posted on {new Date(job.date_posted).toLocaleDateString()}
            </div>
          </div>
        ))}
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
