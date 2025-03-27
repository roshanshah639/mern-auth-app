import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-rose-100 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4 md:py-32">
        <h1 className="text-4xl md:text-6xl font-bold text-rose-900 mb-4 animate-fade-in">
          Welcome to MERN Chat App
        </h1>
        <p className="text-lg md:text-xl text-rose-700 max-w-xl mb-8">
          Secure, fast, and modern authentication built with the MERN stack.
          Sign up or log in to get started!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="bg-rose-600 text-white px-8 py-1 pt-1 rounded-full hover:bg-rose-700 transition duration-300"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="bg-transparent border-2 border-rose-600 text-rose-600 px-8 py-1 rounded-full hover:bg-rose-600 hover:text-white transition duration-300"
          >
            Log In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-rose-50 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-semibold text-rose-800 mb-2">
              Secure Login
            </h3>
            <p className="text-rose-600">
              Industry-standard JWT authentication to keep your data safe.
            </p>
          </div>
          <div className="p-6 bg-rose-50 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-semibold text-rose-800 mb-2">
              Fast Performance
            </h3>
            <p className="text-rose-600">
              Powered by Node.js and Express for lightning-fast responses.
            </p>
          </div>
          <div className="p-6 bg-rose-50 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-semibold text-rose-800 mb-2">
              Responsive Design
            </h3>
            <p className="text-rose-600">
              Looks great on any device, from mobile to desktop.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 text-center bg-rose-200">
        <h2 className="text-3xl md:text-4xl font-bold text-rose-900 mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-rose-700 max-w-xl mx-auto mb-8">
          Join thousands of users who trust MERN Auth for seamless
          authentication.
        </p>
        <Link
          to="/chat-now"
          className="bg-rose-600 text-white px-8 py-2 rounded-full font-semibold text-lg hover:bg-rose-700 transition duration-300"
        >
          Chat Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-rose-600 bg-rose-50">
        <p>&copy; 2025 MERN Auth App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
