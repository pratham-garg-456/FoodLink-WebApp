import React, { useEffect, useState } from 'react';

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteers/67acd88a4540909a08d6cb73?status=approved`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        const result = await response.json();
        const volunteerDetail = await Promise.all(
          result?.volunteers?.map(async (volunteer) => {
            const volunteerResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteer/${volunteer.volunteer_id}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
              }
            );
            const volunteerDetail = await volunteerResponse.json();
            return { ...volunteer, volunteerDetail };
          })
        );
        setData(volunteerDetail);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Position</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Category</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) &&
            data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2 flex items-center justify-center">
                  {item.volunteerDetail.name}
                  {/* <button className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                    View Detail
                  </button> */}
                </td>
                <td className="border p-2">{item.volunteerDetail.email}</td>
                <td className="border p-2">{item.applied_position}</td>
                <td className="border p-2">{item.volunteerDetail.phone}</td>
                {/*There is no phone in volunteer api, so I hardcode it first*/}
                <td className="border p-2">'12345</td>
                {/* <td className="border p-2">{item.volunteerDetail.}</td>  */}
                <td className="border p-2">{item.category}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
