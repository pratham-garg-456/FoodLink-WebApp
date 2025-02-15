import React,{ useEffect, useState } from 'react';
import { useRouter } from 'next/router';
export default () => {
    const router = useRouter();
    // fetch the application from backend
    const [data,setData] = useState([])
    // const [volunteer,setVolunteer] = useState([])
    useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteers/67acd88a4540909a08d6cb73?status=pending`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
        const result = await response.json();
        const volunteerDetail = await Promise.all(result?.volunteers.map(async (volunteer) =>{
            const volunteerResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteer/${volunteer.volunteer_id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
              });
              const volunteerDetail = await volunteerResponse.json();
              return { ...volunteer, volunteerDetail };
        }))
        console.log(volunteerDetail);
        
        setData(volunteerDetail);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const updateStatus = async (applicationId,status)=>{
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteers/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ updated_status: status }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert(`Application status updated to "${status}" successfully!`);

        // Update the local state to reflect the status change
        setData((prevData) =>
          prevData.filter((item) => item.id !== applicationId)
        );
      } else {
        alert('Failed to update application status.');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  }

  const handleViewDetail = async(volunteer_id)=>{
    router.push(`/dashboard/foodbank/viewVolunteerDetail?id=${volunteer_id}`);
  }


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Applied Position</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Category</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border p-2 flex items-center justify-center">
                {item.volunteerDetail.name}
                <button className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"onClick={() => handleViewDetail(item.volunteer_id)} >View Detail</button>
              </td>
              <td className="border p-2">{item.volunteerDetail.email}</td>
              <td className="border p-2">{item.applied_position}</td>
              <td className="border p-2">
                <button className="bg-black text-white px-2 py-1 rounded mr-2" onClick={() => updateStatus(item.id, 'approved')}>Accept</button>
                <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => updateStatus(item.id, 'rejected')}>Reject</button>
              </td>
              <td className="border p-2">{item.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
