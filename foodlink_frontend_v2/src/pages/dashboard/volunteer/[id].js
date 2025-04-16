import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { OrbitProgress } from 'react-loading-indicators';

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
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/cancel_application/${appId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      alert('Application deleted successfully!');
      router.replace('/dashboard/volunteer/applied-jobs');
    } catch (error) {
      alert('Failed to delete application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleApply = async () => {
    if (!job) return;
    setIsApplying(true);

    try {
      if (job.event_id) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/application/event`,
          {
            event_id: job.event_id,
            job_id: job.id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/application/foodbank`,
          {
            foodbank_id: job.foodbank_id,
            job_id: job.id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      alert('Application submitted successfully!');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          alert('You have already applied to this position.');
        } else {
          alert(
            `Failed to submit application. Error: ${error.response.data.detail || error.message}`
          );
        }
      } else {
        alert('Error submitting application. Please check your internet connection and try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <OrbitProgress color="#000000" size="large" text="" textColor="" />
      </div>
    );
  }

  const formattedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <button
          onClick={() =>
            router.push(
              fromAppliedJobs
                ? '/dashboard/volunteer/applied-jobs'
                : '/dashboard/volunteer/available-jobs'
            )
          }
          className="flex items-center gap-2 mb-6 px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200"
        >
          ←&nbsp;Back
        </button>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{job.location}</span>
                  </div>
                  <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                    {job.category}
                  </span>
                </div>
              </div>

              {fromAppliedJobs ? (
                <button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition duration-200"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete Application'
                  )}
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition duration-200"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Applying...
                    </span>
                  ) : (
                    'Apply Now'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div className="p-6 space-y-6">
            {/* Description Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
            </div>

            {/* Timeline Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Posted
                </div>
                <div className="text-gray-900 font-medium">{formattedDate(job.date_posted)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Application Deadline
                </div>
                <div className="text-gray-900 font-medium">{formattedDate(job.deadline)}</div>
              </div>
            </div>

            {/* Additional Details */}
            {job.requirements && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
                <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
