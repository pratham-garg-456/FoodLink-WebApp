import { useEffect, useState } from 'react';
import axios from 'axios';
import { OrbitProgress } from 'react-loading-indicators';

export default function VolunteerDashboard() {
  const [activities, setActivities] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');

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
      setLoading(false);
    };

    fetchActivities();
  }, []);

  const filterActivitiesByMonth = (activities, month) => {
    if (month === 'all') return activities;
    return activities.filter((activity) => {
      const activityDate = new Date(activity.working_hours.start);
      return activityDate.getMonth() === parseInt(month);
    });
  };

  const getActivityStats = () => {
    const uniqueFoodBanks = new Set(activities.map((a) => a.foodbank_name));
    const categoryCounts = activities.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});
    const mostCommonActivity =
      Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    return {
      totalActivities: activities.length,
      uniqueFoodBanks: uniqueFoodBanks.size,
      mostCommonActivity,
    };
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <OrbitProgress color="#000000" size="large" text="" textColor="" />
      </div>
    );

  const stats = getActivityStats();
  const filteredActivities = filterActivitiesByMonth(activities, selectedMonth);

  return (
    <div className="p-6 max-w-7xl mx-auto my-10">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Volunteer Activity Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Hours</h3>
          <p className="text-3xl font-bold text-green-600">{totalHours.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Activities</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalActivities}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-600">Food Banks Helped</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.uniqueFoodBanks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-600">Most Common Activity</h3>
          <p className="text-xl font-bold text-orange-600">{stats.mostCommonActivity}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Activity History</h2>
        <select
          className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="all">All Time</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i}>
              {new Date(2024, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Date and Time</th>
                <th className="px-6 py-4 text-left">Activity Type</th>
                <th className="px-6 py-4 text-left">Food Bank</th>
                <th className="px-6 py-4 text-right">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredActivities.map((activity, index) => {
                const startTime = new Date(activity.working_hours.start);
                const endTime = new Date(activity.working_hours.end);
                const duration = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2);

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{startTime.toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{startTime.toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {activity.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{activity.foodbank_name}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-gray-900">{duration}</span>
                      <span className="text-gray-500 ml-1">hrs</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No activities found for the selected period.
        </div>
      )}
    </div>
  );
}
