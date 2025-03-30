import React from 'react';

const VolunteerManagement = () => {
  return (
    <div className="container mx-auto px-4 md:my-24 my-16">
      <h1 className="text-4xl font-bold text-center mb-8 mt-10">Volunteer Management</h1>
      <img
        src="/images/volunteer-management2.jpg"
        alt="Volunteer Management"
        className="h-48 w-full mb-4 object-cover rounded-lg shadow-lg"
      />
      <p className="text-xl text-gray-600 mb-2 mt-10 text-center">
        Manage and coordinate volunteers effectively.
      </p>
      <p className="text-gray-600 mt-1 text-center">
        Our volunteer management system helps organizations streamline their volunteer efforts,
        ensuring that every volunteer is effectively utilized and appreciated.
      </p>

      <h2 className="text-4xl font-semibold mt-20 mb-10 text-center">How It Works:</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-20">
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/create-job-post.jpg"
            alt="Create Job Post"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Create Volunteer Job Posts</h3>
            <p className="text-gray-600 text-center">
              Easily create and publish job posts for volunteer opportunities.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/manage-applications.jpg"
            alt="Manage Applications"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Manage Applications</h3>
            <p className="text-gray-600 text-center">
              Review and manage volunteer applications efficiently.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/update-job-post.jpg"
            alt="Update Job Post"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Update Job Posts</h3>
            <p className="text-gray-600 text-center">
              Modify existing job posts to keep them up-to-date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerManagement;
