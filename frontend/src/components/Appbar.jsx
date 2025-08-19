export function AppBar({ firstName }) {
  return (
    <div className="flex justify-between items-center p-2 shadow-md bg-white">
      <div className="text-2xl font-bold"><span className="text-base font-semibold">the</span>PaymentApp</div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-700">Hello, {firstName}</span>
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200">
          <span className="text-xl font-medium">{firstName.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}