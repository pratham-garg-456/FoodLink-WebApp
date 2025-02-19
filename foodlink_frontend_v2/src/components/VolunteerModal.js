import VolunteerList from './VolunteerList';

const VolunteerModal = ({ event, token, setNotification, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Volunteers for {event.event_name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>
        <VolunteerList eventId={event.id} token={token} setNotification={setNotification} />
      </div>
    </div>
  );
};

export default VolunteerModal;
