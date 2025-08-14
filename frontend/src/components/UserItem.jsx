export function UserItem({ user, onSendMoney }) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200">
          <span className="text-lg font-medium">{user.firstName.charAt(0).toUpperCase()}</span>
        </div>
        <div className="font-semibold">
          {user.firstName} {user.lastName}
        </div>
      </div>
      <button
        onClick={onSendMoney}
        className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
      >
        Send Money
      </button>
    </div>
  );
}