import { useState } from 'react';

export function AppBar({ firstName, transactions = [] }) {
  const [showTransactions, setShowTransactions] = useState(false);

  return (
    <div className="flex justify-between items-center p-2 shadow-md bg-white relative">
      <div className="text-2xl font-bold">
        <span className="text-base font-semibold">the</span>PaymentApp
      </div>

      <div className="flex items-center space-x-4">
        {/* Transactions Button with Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setShowTransactions(true)}
          onMouseLeave={() => setShowTransactions(false)}
        >
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm text-gray-700 hidden sm:inline">Transactions</span>
            {transactions.length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {transactions.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showTransactions && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
              </div>

              {transactions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No transactions yet
                </div>
              ) : (
                <div className="divide-y">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-3 hover:bg-gray-50 transition-colors ${tx.type === 'P2P_SENT' ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-green-400'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">
                            {tx.type === 'P2P_SENT' ? '↑ Sent' : '↓ Received'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {tx.relatedUser?.name || 'Unknown User'}
                          </div>
                        </div>
                        <div className={`font-bold ${tx.type === 'P2P_SENT' ? 'text-red-600' : 'text-green-600'
                          }`}>
                          {tx.type === 'P2P_SENT' ? '-' : '+'}₹{tx.amount}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {transactions.length > 0 && (
                <div className="p-2 border-t bg-gray-50 rounded-b-lg">
                  <div className="text-xs text-center text-gray-500">
                    Showing last {transactions.length} transactions
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <span className="text-gray-700 hidden sm:inline">Hello, {firstName}</span>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200">
            <span className="text-xl font-medium">{firstName?.charAt(0)?.toUpperCase() || '?'}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/signin';
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}