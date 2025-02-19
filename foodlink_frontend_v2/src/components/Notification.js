import { useEffect } from "react";
// Notification Component: renders a pop-up message on the top-right.
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-dismiss after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  let bgColor = 'bg-blue-500';
  if (type === 'error') bgColor = 'bg-red-500';
  if (type === 'success') bgColor = 'bg-green-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`}>
      {message}
    </div>
  );
};

export default Notification
