import Link from 'next/link';

export default function FoodbankAppointments() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Foodbank Appointments</h1>
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/foodbank/manageAppointments/createAppointment">
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            Create Appointment
          </button>
        </Link>
        <Link href="/dashboard/foodbank/manageAppointments/viewAppointments">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            View Appointment
          </button>
        </Link>
      </div>
    </div>
  );
}
