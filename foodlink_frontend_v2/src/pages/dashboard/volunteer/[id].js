import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function JobDetailPage() {
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [isProcessing, setIsApplying] = useState(false);
    const [fromAppliedJobs, setFromAppliedJobs] = useState(false);
    const [appId, setAppId] = useState(null);
    useEffect(() => {
        if (router.isReady) { 
            const { appId: routerAppId } = router.query;
            if (routerAppId) {
                setAppId(routerAppId);
                localStorage.setItem('selectedAppId', routerAppId); 
            } else {
                const storedAppId = localStorage.getItem('selectedAppId');
                if (storedAppId) {
                    setAppId(storedAppId);
                }
            }
        }
        const storedJob = localStorage.getItem('selectedJob');
        const previousPage = localStorage.getItem('previousPage'); 
        if (storedJob) {
            setJob(JSON.parse(storedJob));
            setFromAppliedJobs(previousPage === 'applied-jobs');
        } else {
            router.push('/available-jobs'); 
        }
    }, [router.isReady, router.query]);

    const handleDelete = async () => {
        if (!job) return;
        setIsApplying(true);

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/cancel_application/${appId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            alert("Application deleted successfully!");
            router.replace('/dashboard/volunteer/applied-jobs');
        } catch (error) {
            alert("Failed to delete application. Please try again.");
        } finally {
            setIsApplying(false);
        }
    };

    const handleApply = async () => {
        if (!job) return;
        setIsApplying(true);

        try {
            if (job.event_id) {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/application/event`, {
                    event_id: job.event_id,
                    job_id: job.id
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/application/foodbank`, {
                    foodbank_id: job.foodbank_id,
                    job_id: job.id
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            alert("Application submitted successfully!");
        } catch (error) {
            if (error.response) {
                if (error.response.status === 409) {
                    alert("You have already applied to this position.");
                } else {
                    alert(`Failed to submit application. Error: ${error.response.data.detail || error.message}`);
                }
            } else {
                alert("Error submitting application. Please check your internet connection and try again.");
            }
        } finally {
            setIsApplying(false);
        }
    };

    if (!job) return <p className="text-center mt-10">Loading job details...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6 w-full">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-gray-500">{job.location}</p>
            <p className="mt-4">{job.description}</p>

            <div className="mt-6 p-4 border rounded-lg">
                <p><strong>Category:</strong> {job.category}</p>
                <p><strong>Posted:</strong> {new Date(job.date_posted).toISOString().split('T')[0]}</p>
                <p><strong>Deadline:</strong> {new Date(job.deadline).toISOString().split('T')[0]}</p>
            </div>

            <div className="mt-6 flex justify-between">
                <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200"
                    onClick={() => router.push(fromAppliedJobs ? '/dashboard/volunteer/applied-jobs' : '/dashboard/volunteer/available-jobs')}
                >
                    Back to {fromAppliedJobs ? 'Applied Jobs' : 'Available Jobs'}
                </button>
                
                {fromAppliedJobs ? (
                    <button 
                    className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-red-700 transition duration-200"  
                        onClick={handleDelete} 
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Deleting..." : "Delete Application"}
                    </button>
                ) : (
                    <button 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg disabled:opacity-50 hover:bg-green-700 transition duration-200" 
                        onClick={handleApply} 
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Applying..." : "Apply Now"}
                    </button>
                )}
            </div>
        </div>
    );
}