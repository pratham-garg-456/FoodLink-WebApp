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
    <div className=" p-4 ">
      <h1 className="text-center text-2xl font-bold mb-6">Manage Volunteer Applications</h1>
      <div className="flex gap-4 flex-wrap  justify-center">
        <button
          onClick={handleViewApprovedApplications}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-200"
        >
          View Approved Applications
        </button>
        <button
          onClick={handleEditApplications}
          className=" px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-all duration-200"
        >
          Edit Applications
        </button>
      </div>
    </div>
  );
};

export default ManageVolunteer;
