import Image from 'next/image';
import foodbank from '../../public/images/food-bank.jpg';
import router from 'next/router';
import { useEffect, useState } from 'react';

export default function Home() {
  const [userCount, setUserCount] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [individualCount, setIndividualCount] = useState(0);
  const [foodbankCount, setFoodbankCount] = useState(0);

  // New state for animated counts
  const [animatedUserCount, setAnimatedUserCount] = useState(0);
  const [animatedVolunteerCount, setAnimatedVolunteerCount] = useState(0);
  const [animatedTotalDonations, setAnimatedTotalDonations] = useState(0);
  const [animatedIndividualCount, setAnimatedIndividualCount] = useState(0);
  const [animatedFoodbankCount, setAnimatedFoodbankCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
        );

        const data = await response.json();
        setUserCount(data.users.length);
        const volunteers = data.users.filter((user) => user.role === 'volunteer');
        const individuals = data.users.filter((user) => user.role === 'individual');
        setVolunteerCount(volunteers.length);
        setIndividualCount(individuals.length);
        const foodbanks = data.users.filter((user) => user.role === 'foodbank');
        setFoodbankCount(foodbanks.length);

        // Fetch total donations
        const donationResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/donations`
        );
        const donationData = await donationResponse.json();
        setTotalDonations(donationData.total_donations);

        // After fetching data, start the animation
        animateCount(setAnimatedTotalDonations, donationData.total_donations);
        animateCount(setAnimatedVolunteerCount, volunteers.length);
        animateCount(setAnimatedIndividualCount, individuals.length);
        animateCount(setAnimatedFoodbankCount, foodbanks.length);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const animateCount = (setCount, target) => {
    let count = 0;
    const increment = Math.ceil(target / 100); // Adjust increment for speed
    const interval = setInterval(() => {
      count += increment;
      if (count >= target) {
        clearInterval(interval);
        setCount(target); // Ensure it ends at the target value
      } else {
        setCount(count);
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
                <strong>${animatedTotalDonations}</strong> in Donations
              </p>
              <p>
                <strong>{animatedVolunteerCount}</strong> Volunteers
              </p>
              <p>
                <strong>{animatedIndividualCount}</strong> Users
              </p>
              <p>
                <strong>{animatedFoodbankCount}</strong> Food Banks
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
