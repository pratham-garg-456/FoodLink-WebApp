// pages/about.js
export default function About() {
  return (
    <div className="flex flex-col items-center justify-center w-[80vw]">
      <h1 className="mt-10 text-4xl md:text-5xl font-extrabold mb-2 text-center">
        OUR MISSION AND VISION
      </h1>
      <div className="p-8 ">
        <p className="text-lg text-center text-gray-700 mb-6">
          At Food Link, our mission is to fight hunger and provide nutritious food to those in need
          by connecting communities with vital food resources. <br /> We envision a world where
          everyone has access to sufficient and nutritious food, fostering a healthy and sustainable
          community.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h2>
        <ul className="list-disc pl-6 text-lg text-gray-700 space-y-2">
          <li>Empathy and Compassion for those in need</li>
          <li>Transparency in all our actions</li>
          <li>Collaboration with local food banks and volunteers</li>
          <li>Innovation in addressing food insecurity</li>
        </ul>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">Join Us</h2>
        <p className="text-lg text-gray-700">
          We invite you to become part of our community and support the cause through donations,
          volunteering, or spreading awareness. Together, we can make a real difference!
        </p>
      </div>
    </div>
  );
}
