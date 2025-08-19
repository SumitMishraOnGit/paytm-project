
export default function Notification({ message, type, onClose }) {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? '✔' : '❗';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg text-white shadow-lg flex items-center transition-all duration-300 transform ${message ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${bgColor}`}>
      <span className="text-xl mr-2">{icon}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        &times;
      </button>
    </div>
  );
}
