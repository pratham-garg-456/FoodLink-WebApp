import React from 'react';
import { useRouter } from 'next/router';

const ManageVolunteer = () => {
  const router = useRouter();

  const handleEditApplications = () => {
    router.push('/dashboard/foodbank/manageVolunteer/getApplication');
  };

  const handleViewApprovedApplications = () => {
    router.push('/dashboard/foodbank/manageVolunteer/getApproveApplication');
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Volunteer Applications</h1>
      <div className="flex flex-col gap-4 items-center">
        <button
          onClick={handleViewApprovedApplications}
          className="w-60 p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
        >
          View Approved Applications
        </button>
        <button
          onClick={handleEditApplications}
          className="w-60 p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200"
        >
          Edit Applications
        </button>
      </div>
    </div>
  );
};

export default ManageVolunteer;
