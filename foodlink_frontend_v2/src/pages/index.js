import Image from 'next/image';
import foodbank from '../../public/images/food-bank.jpg';
import router from 'next/router';
import { useEffect, useState } from 'react';

export default function Home() {
  const [counts, setCounts] = useState({
    userCount: 0,
    volunteerCount: 0,
    totalDonations: 0,
    individualCount: 0,
    foodbankCount: 0,
  });

  const [animatedCounts, setAnimatedCounts] = useState({
    animatedUserCount: 0,
    animatedVolunteerCount: 0,
    animatedTotalDonations: 0,
    animatedIndividualCount: 0,
    animatedFoodbankCount: 0,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const { users } = await response.json();
        const volunteers = users.filter((user) => user.role === 'volunteer');
        const individuals = users.filter((user) => user.role === 'individual');
        const foodbanks = users.filter((user) => user.role === 'foodbank');

        setCounts({
          userCount: users.length,
          volunteerCount: volunteers.length,
          individualCount: individuals.length,
          foodbankCount: foodbanks.length,
          totalDonations: counts.totalDonations, // Keep previous total donations
        });

        // Fetch total donations
        const donationResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/donations`
        );

        if (!donationResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const { total_donations } = await donationResponse.json();
        setCounts((prevCounts) => ({ ...prevCounts, totalDonations: total_donations }));

        // After fetching data, start the animation
        animateCount(setAnimatedCounts, total_donations, 'animatedTotalDonations');
        animateCount(setAnimatedCounts, volunteers.length, 'animatedVolunteerCount');
        animateCount(setAnimatedCounts, individuals.length, 'animatedIndividualCount');
        animateCount(setAnimatedCounts, foodbanks.length, 'animatedFoodbankCount');
      } catch (error) {
        console.error('Error fetching users:', error);
        // Optionally, set an error state to display to the user
      }
    };

    fetchUsers();
  }, []);

  const animateCount = (setCount, target, countKey) => {
    let count = 0;
    const increment = Math.ceil(target / 100); // Adjust increment for speed
    const interval = setInterval(() => {
      count += increment;
      if (count >= target) {
        clearInterval(interval);
        setCount((prevCounts) => ({ ...prevCounts, [countKey]: target })); // Ensure it ends at the target value
      } else {
        setCount((prevCounts) => ({ ...prevCounts, [countKey]: count }));
      }
    }, 20); // Adjust interval timing for speed
  };

  return (
    <>
      <div className="flex flex-col items-center  ">
        <div className="flex flex-col justify-center items-center w-[70vw] md:flex-row md:justify-end md:w-[80vw] md:gap-2 ">
          {/* Left section */}
          <div className="order-last md:order-first md:w-4/6 md:pr-4">
            <h1 className="text-2xl md:text-5xl text-center mt-5 font-bold text-gray-900 md:text-left mb-7">
              Find, support, and donate to local food banks
            </h1>

            <div className="flex flex-wrap justify-center gap-2 md:justify-start ">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => router.push('/auth/register')}
              >
                Register
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={() => router.push('/auth/login')}
              >
                Donate Now
              </button>
              <button
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                onClick={() => router.push('/findFoodBank')}
              >
                Find Food Bank
              </button>
            </div>

            <div className="mt-8 text-md text-gray-800 flex flex-col items-center md:justify-start md:items-start md:flex-row md:gap-4">
              <p>
                <strong>${animatedCounts.animatedTotalDonations}</strong> in Donations
              </p>
              <p>
                <strong>{animatedCounts.animatedVolunteerCount}</strong> Volunteers
              </p>
              <p>
                <strong>{animatedCounts.animatedIndividualCount}</strong> Users
              </p>
              <p>
                <strong>{animatedCounts.animatedFoodbankCount}</strong> Food Banks
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="md:w-2/6 flex flex-col justify-center items-center">
            <Image
              src={foodbank} // Make sure to add your image in the public folder
              alt="Food Bank"
              className="rounded-full object-cover shadow-lg w-32 h-32 md:w-64 md:h-64"
            />
            <div className="mt-6 text-center text-gray-600">
              <p className="text-md font-semibold md">
                Connecting communities with food and resources
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
