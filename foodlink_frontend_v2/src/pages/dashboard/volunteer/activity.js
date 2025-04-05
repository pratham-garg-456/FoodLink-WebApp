import { useEffect, useState } from 'react';
import axios from 'axios';

export default function VolunteerDashboard() {
  const [activities, setActivities] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/volunteer/activity`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        console.log(response);

        const data = response.data.activity_list;
        if (!Array.isArray(data)) {
          console.error('Expected an array but got:', data);
          return;
        }

        setActivities(data);

        // ✅ Fix: Properly accumulate and round total hours
        let hours = data.reduce((total, activity) => {
          const startTime = new Date(activity.working_hours.start);
          const endTime = new Date(activity.working_hours.end);
          const duration = (endTime - startTime) / (1000 * 60 * 60); // Convert ms to hours
          return total + duration;
        }, 0);

        setTotalHours(parseFloat(hours.toFixed(2))); // ✅ Ensures only 2 decimal places
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="p-4 flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-8">
      {/* Left Side - Table */}
      <div className="lg:w-3/4">
        <h2 className="text-xl font-bold mb-4">Volunteer Activities</h2>
        <div className="overflow-x-auto w-full border border-black">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-2">Date and Time</th>
                <th className="p-2">Activity Type</th>
                <th className="p-2">Food Bank</th>
                <th className="p-2">Hours Contributed</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => {
                const startTime = new Date(activity.working_hours.start);
                const endTime = new Date(activity.working_hours.end);
                const duration = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2);

                return (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 text-sm md:text-base"
                  >
                    <td className="p-2">
                      {startTime.toISOString().split('T')[0]}
                    </td>
                    <td className="p-2">{activity.category}</td>
                    <td className="p-2">{activity.foodbank_name}</td>
                    <td className="p-2">{duration} hrs</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Side - Total Hours Circle */}
      <div className="lg:w-1/4 flex flex-col items-center">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex justify-center items-center border-4 border-gray-700 rounded-full">
          <span className="text-lg sm:text-2xl font-bold">
            {totalHours.toFixed(2)} hrs
          </span>
        </div>
        <p className="mt-4 text-base sm:text-lg font-semibold text-gray-700 text-center">
          The total hours for activities is{' '}
          <span className="text-black">{totalHours.toFixed(2)} hrs</span>
        </p>
      </div>
    </div>
  );
}
