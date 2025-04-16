import EventList from '@/components/EventList';

export default function EventListPage() {
  return (
    <div className="container mx-auto p-6 my-20">
      <h1 className="text-5xl font-bold mb-6 text-center uppercase">Events</h1>
      <EventList
        apiEndPoint={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/individual/events`}
      />
    </div>
  );
}
