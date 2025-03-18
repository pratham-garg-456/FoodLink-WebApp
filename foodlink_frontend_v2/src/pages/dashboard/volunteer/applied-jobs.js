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
                                // ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/job/${app.job_id}
                                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/job/${app.job_id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                                    },
                                }
                            );
                            
                            jobsData[app.job_id] = jobResponse.data.job; // ✅ Store only job data
                        } catch (error) {
                            console.error(`Error fetching job details for job ID ${app.job_id}:`, error);
                            jobsData[app.job_id] = null; // Mark job as null if it fails
                        }
                    })
                );

                setJobDetails(jobsData); // ✅ Update state after all jobs are fetched
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }

    const handleRowClick = (appId,job) => {
        localStorage.setItem('selectedJob', JSON.stringify(job));
        localStorage.setItem('previousPage', 'applied-jobs');
        localStorage.setItem('selectedAppId', appId);
        router.push(`/dashboard/volunteer/${appId}`);
    };

    // Pagination logic
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = applications.slice(indexOfFirstJob, indexOfLastJob);

    return (
        <div className="p-4">
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
                        return job ? (
                            <tr key={app.job_id} className="border hover:bg-gray-100"  onClick={() => handleRowClick(app.id,job)} >
                                <td className="p-2 font-bold text-blue-700">{job.title}<br/><span className="text-sm text-gray-500">{job.location}</span></td>
                                <td className="p-2">{job.category}</td>
                                <td className="p-2">{job.foodbank_name || "N/A"}</td>
                                <td className="p-2">{app.applied_at ? new Date(app.applied_at).toISOString().split('T')[0] : "N/A"}</td>
                                <td className="p-2">{app.status}</td>
                            </tr>
                        ) : (
                            <tr key={app.job_id} className="border">
                                <td className="p-2 text-red-500" colSpan="5">Loading job details...</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                    className="border p-2"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    &lt;
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
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
                    disabled={currentPage === Math.ceil(applications.length / jobsPerPage)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
}

export default AvailableJobs;
