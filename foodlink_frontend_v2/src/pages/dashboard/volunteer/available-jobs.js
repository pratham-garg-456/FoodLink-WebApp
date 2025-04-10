import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';

const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;
  const [volunteerId, setVolunteerId] = useState([]);
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
      console.error('Error fetching jobs:', error);
    }
  }
  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  
  const handleRowClick = (appId, job) => {
    localStorage.setItem('selectedJob', JSON.stringify(job));
    localStorage.setItem('previousPage', 'applied-jobs');
    localStorage.setItem('selectedAppId', appId);
    router.push(`/dashboard/volunteer/${appId}`);
  };

  return (
    <div className="p-4 w-3/4">
      {/* TABLE VIEW for md+ screens */}
      <div className="hidden md:block">
        <table className="w-full mt-4 border border-black">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-2">POSITION</th>
              <th className="p-2">CATEGORY</th>
              <th className="p-2">FOOD BANK</th>
              <th className="p-2">DATE POSTED</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((job) => (
              <tr
                key={job.id}
                className="border hover:bg-gray-100"
                onClick={() => {
                  localStorage.setItem('selectedJob', JSON.stringify(job));
                  localStorage.setItem('previousPage', 'available-jobs');
                  router.push(`/dashboard/volunteer/${job.id}`);
                }}
              >
                <td className="p-2 font-bold text-blue-700">
                  {job.title}
                  <br />
                  <span className="text-sm text-gray-500">{job.location}</span>
                </td>
                <td className="p-2">{job.category}</td>
                <td className="p-2">{job.foodbank_name}</td>
                <td className="p-2">{new Date(job.date_posted).toISOString().split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CARD VIEW for small screens */}
      <div className="block md:hidden space-y-2">
        {currentJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => handleJobClick(job)}
            className="border p-2 rounded hover:bg-gray-100 cursor-pointer"
          >
            <p className="font-bold text-blue-700">{job.title}</p>
            <p className="text-sm text-gray-500">{job.location}</p>
            <p>
              <strong>Category:</strong> {job.category}
            </p>
            <p>
              <strong>Food Bank:</strong> {job.foodbank_name}
            </p>
            <p>
              <strong>Date Posted:</strong> {new Date(job.date_posted).toISOString().split('T')[0]}
            </p>
          </div>
        ))}
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

        {/* Create an array of size totalPages: [1..totalPages] */}
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
