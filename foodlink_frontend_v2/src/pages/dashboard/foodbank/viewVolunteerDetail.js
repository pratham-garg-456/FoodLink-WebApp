import { useRouter } from 'next/router';
import { useEffect } from 'react';
import React,{  useState } from 'react';

export default () => {
    const handleBack = ()=>{
        router.back()
    }
    const volunteer = {
        name: "John Smith",
        phone: "123 - 123 - 1234",
        email: "johnS@test.com",
        address: "Toronto, ON",
        experience: [
          { organization: "Toronto Health Care", duration: "May 2023 - June 2023" },
          { organization: "Toronto Health Care", duration: "May 2023 - June 2023" },
          { organization: "Toronto Health Care", duration: "May 2023 - June 2023" },
        ],
        position: "Volunteer Cooker",
      };

    const router = useRouter();
    const { id } = router.query;
    const [data,setData] = useState()
    useEffect(() => {
      // id is the volunteer id
      // hardcode the id first, but get 500 server error
      // id: '67ad57de836f6b636269145f'
      const fetchData = async () => {
        const volunteerResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteer/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          const volunteerDetail = await volunteerResponse.json();
          setData(volunteerDetail)
      }
      fetchData()
    }, [id]);

    
   
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
          {/* Main Content */}
          <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Left - Volunteer Image */}
            <div className="w-1/2 bg-gray-300 flex items-center justify-center">
            <img 
            src="/images/user-icon.jpg" 
            alt="Volunteer Image" 
            className="w-5/6 h-4/6 border-2 border-gray-500 object-cover rounded-lg shadow-md"
            />
            </div>

            {/* Right - Details */}
            <div className="w-1/2 p-6">
              <h2 className="text-2xl font-bold mb-4">{volunteer.position}</h2>
              <p className="mb-2"><strong>Name:</strong> {volunteer.name}</p>
              <p className="mb-2"><strong>Phone:</strong> {volunteer.phone}</p>
              <p className="mb-2"><strong>Email:</strong> {volunteer.email}</p>
              <p className="mb-4"><strong>Address:</strong> {volunteer.address}</p>
    
              {/* Experience Table */}
              <h3 className="font-semibold mb-2">Experience:</h3>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-300 text-center">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Organization</th>
                      <th className="border p-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteer.experience.map((exp, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-2">{exp.organization}</td>
                        <td className="border p-2">{exp.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
    
          {/* Back Button */}
          <button
            className="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-300"
            onClick={handleBack}
          >
            BACK
          </button>
        </div>
      );
  };
  


