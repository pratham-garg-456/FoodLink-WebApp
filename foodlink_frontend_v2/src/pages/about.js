// pages/about.js
export default function About() {
  return (
    <div className="flex flex-col items-center justify-center w-[80vw] mt-24">
      <h1 className="mt-16 text-4xl md:text-5xl font-extrabold mb-2 text-center">
        OUR MISSION AND VISION
      </h1>
      <div className="p-8 flex flex-col items-center justify-center">
        <p className="text-lg text-center text-gray-700 mb-6">
          At Food Link, our mission is to fight hunger and provide nutritious food to those in need
          by connecting communities with vital food resources. <br /> We envision a world where
          everyone has access to sufficient and nutritious food, fostering a healthy and sustainable
          community.
        </p>
        <h2 className="text-3xl font-bold text-gray-800 mt-4 mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col items-center mb-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img
              src="images/value1.jpg"
              alt="Empathy and Compassion"
              className="w-full h-44 mb-2 rounded-lg"
            />
            <p className="text-lg text-gray-700 text-center">
              Empathy and Compassion for those in need
            </p>
          </div>
          <div className="flex flex-col items-center mb-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img
              src="/images/value2.jpg"
              alt="Transparency"
              className="w-full h-44 mb-2 rounded-lg"
            />
            <p className="text-lg text-gray-700 text-center">Transparency in all our actions</p>
          </div>
          <div className="flex flex-col items-center mb-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img
              src="/images/value3.jpg"
              alt="Collaboration"
              className="w-full h-44 mb-2 rounded-lg"
            />
            <p className="text-lg text-gray-700 text-center">
              Collaboration with local food banks and volunteers
            </p>
          </div>
          <div className="flex flex-col items-center mb-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img
              src="/images/value4.jpg"
              alt="Innovation"
              className="w-full h-44 mb-2 rounded-lg"
            />
            <p className="text-lg text-gray-700 text-center">
              Innovation in addressing food insecurity
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center m-28">
          <h2 className="text-3xl font-bold text-gray-800 mt-8 mb-4">Join Us</h2>
          <p className="text-lg text-gray-600 font-medium text-center mb-4 lg:w-4/5">
            We invite you to become part of our community and support the cause through donations,
            volunteering, or spreading awareness. Together, we can make a real difference!
          </p>
        </div>
      </div>
    </div>
  );
}
