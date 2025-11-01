import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About CourierCue
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for logistics companies who want to eliminate paperwork and streamline their 
              delivery operations with modern digital tools.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            CourierCue was created to solve a common problem in the logistics industry: the inefficiency 
            of paper-based delivery documentation. We believe that managing loads, tracking deliveries, 
            and coordinating drivers shouldn't require mountains of paperwork and manual processes.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our platform digitizes the entire delivery workflow, from load creation to signature capture 
            to receipt generation. By bringing your operations into the digital age, we help you save 
            time, reduce errors, and provide better service to your customers.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How CourierCue Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Create Loads
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Admins create digital delivery loads with service addresses, items, and special instructions.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Assign Drivers
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Assign loads to drivers who receive instant notifications with all delivery details on their mobile device.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Track Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Drivers update status in real-time as they pick up and deliver loads. Everyone stays informed.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Capture Proof
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Capture digital signatures at delivery. Automatically generate and email PDF receipts to customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Platform Features
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-3xl mr-3">🏢</span>
              For Administrators
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Create and manage loads with detailed service information
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Assign loads to drivers with automatic notifications
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Track trailer compliance and dock assignments
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Manage users and set role-based permissions
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  View comprehensive dashboard with load statistics
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Generate and email PDF receipts to customers
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-3xl mr-3">🚚</span>
              For Drivers
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  View assigned loads with all delivery details
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Update load status throughout the delivery process
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Capture digital signatures on mobile devices
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Access trailer and pickup location information
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Simple, mobile-optimized interface for on-the-go access
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-300">
                  View delivery history and completed loads
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Business Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Improve Efficiency
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Reduce time spent on manual paperwork and administrative tasks. Automate receipt 
                generation and delivery notifications.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Reduce Errors
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Eliminate lost paperwork and manual data entry mistakes. Digital records are 
                always accurate and accessible.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">😊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Better Customer Service
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Provide real-time delivery updates and instant receipt delivery. Keep customers 
                informed throughout the process.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Complete Visibility
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Know the status of every load at all times. Track driver performance and identify 
                bottlenecks in your operations.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Compliance & Security
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track trailer registrations and inspections. Secure data storage with enterprise-grade 
                encryption and access controls.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Scale Your Business
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Grow without adding administrative overhead. The platform scales with your business 
                as you add more drivers and loads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Built on Modern Technology
        </h2>
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            CourierCue is built as a cloud-native SaaS platform using industry-leading technologies:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <span className="text-blue-600 text-xl mr-3">☁️</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Cloud-Based</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Access from anywhere, on any device. No servers to maintain.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 text-xl mr-3">🔐</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Enterprise Security</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Multi-tenant architecture with complete data isolation.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 text-xl mr-3">📱</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Mobile-Responsive</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Works seamlessly on desktop, tablet, and mobile devices.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 text-xl mr-3">⚡</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Fast & Reliable</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Built for performance with 99.9% uptime SLA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Delivery Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            See how CourierCue can help your business eliminate paperwork and improve efficiency.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-gray-100 rounded-lg shadow-lg transition-colors"
          >
            Get Started Today
          </Link>
        </div>
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
