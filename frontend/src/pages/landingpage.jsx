import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen text-gray-800 flex flex-col items-center p-8 font-sans">
      
      {/* Navigation Bar */}
      <nav className="w-full max-w-4xl flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold tracking-tight">Payments App</h1>
        <Link 
          to="/signup" 
          className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
        >
          Sign Up
        </Link>
      </nav>

      <main className="flex-1 w-full max-w-4xl flex flex-col justify-center items-center text-center">

        {/* Hero Section */}
        <section className="my-12 sm:my-16 md:my-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            Send and Receive Money Instantly.
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            A simple and secure way to manage your finances. No hidden fees, no complexity.
          </p>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-2xl my-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-2xl font-semibold mb-2">Instant Transfers</h3>
            <p className="text-gray-500">
              Transfer funds to any user on the platform in real-time.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-2xl font-semibold mb-2">Secure Transactions</h3>
            <p className="text-gray-500">
              All your payments are encrypted and protected with industry-leading security.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-2xl font-semibold mb-2">Track Your Balance</h3>
            <p className="text-gray-500">
              Always know your current balance with an easy-to-read dashboard.
            </p>
          </div>
          
        </section>

        {/* Call to Action Section */}
        <section className="w-full my-12">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of users who trust our app for their daily payments.
          </p>
          <Link 
            to="/signup" 
            className="inline-block bg-gray-900 text-white text-xl px-10 py-4 rounded-full font-bold shadow-lg hover:bg-gray-700 hover:scale-105 transition-all duration-300 transform"
          >
            Sign Up Now
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center text-sm text-gray-500 py-4 mt-8 border-t border-gray-300">
        &copy; 2024 Payments App. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
