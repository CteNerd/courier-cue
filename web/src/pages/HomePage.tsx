import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Digitize Your Delivery Operations
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            CourierCue transforms paper-based delivery slips into a streamlined digital workflow. 
            Track loads, manage drivers, and capture signatures—all in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Everything You Need to Manage Your Fleet
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Real-Time Load Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor every delivery from assignment to completion. Know exactly where your loads are 
              and their current status at all times.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Digital Signatures
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Capture proof of delivery instantly with digital signatures. Generate PDF receipts 
              automatically and email them to customers.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Driver Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Assign loads to drivers with ease. Give your team mobile access to their assigned 
              deliveries with all the details they need.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">🚛</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Trailer & Dock Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track trailer compliance, manage dock assignments, and ensure your fleet stays 
              up-to-date with registration and inspection requirements.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Secure & Multi-Tenant
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your data is protected with enterprise-grade security. Complete isolation between 
              organizations with role-based access control.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Comprehensive Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get instant visibility into your operations. View load statistics, driver performance, 
              and compliance status at a glance.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-blue-600 dark:bg-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Why Choose CourierCue?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-white">
            <div className="flex items-start">
              <div className="text-3xl mr-4">⚡</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Eliminate Paper Waste</h3>
                <p className="text-blue-100">
                  Go completely digital. No more lost delivery slips or filing cabinets full of paper.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">💰</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Reduce Administrative Overhead</h3>
                <p className="text-blue-100">
                  Automate receipt generation and email delivery. Save hours of manual data entry.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">📱</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Mobile-First Design</h3>
                <p className="text-blue-100">
                  Drivers access everything they need on their phones. Easy to use on the road.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔄</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
                <p className="text-blue-100">
                  Know the status of every delivery instantly. Better customer communication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Ready to Modernize Your Delivery Operations?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Join forward-thinking logistics companies who have already made the switch to digital delivery management.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-colors"
        >
          Start Your Free Trial
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 CourierCue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
