import Link from 'next/link';

export default function FoodbankAppointments() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Foodbank Appointments</h1>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/dashboard/foodbank/manageAppointments/createAppointment">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Create Appointment
          </button>
        </Link>
        <Link href="/dashboard/foodbank/manageAppointments/viewAppointments">
          <button className="bg-green-600 hover:bg-green-700  text-white px-4 py-2 rounded transition-all duration-200">
            View Appointment
          </button>
        </Link>
      </div>
    </div>
  );
}
