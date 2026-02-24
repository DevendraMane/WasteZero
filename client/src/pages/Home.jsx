import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate(); // ✅ YOU FORGOT THIS

  return (
    <div className="font-sans">
      {/* HERO SECTION */}
      <section className="bg-green-600 text-white py-24 text-center px-6">
        <h1 className="text-5xl font-bold mb-6">
          Innovative Solutions for a Cleaner Planet
        </h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Join WasteZero in transforming waste management through sustainable
          practices and community-driven initiatives.
        </p>

        {/* ✅ FIXED BUTTON */}
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Get Started
        </button>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-12 text-green-700">
          Our Services
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Waste Pickup</h3>
            <p>
              Schedule and manage waste pickups efficiently with real-time
              tracking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Recycling Programs</h3>
            <p>
              Participate in eco-friendly recycling initiatives and reduce
              landfill waste.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Community Impact</h3>
            <p>
              Track your environmental contributions and make a measurable
              impact.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6 text-green-700">
          Why Choose WasteZero?
        </h2>
        <p className="max-w-3xl mx-auto text-lg">
          WasteZero empowers communities and businesses with innovative waste
          management solutions designed to create a sustainable future.
          Together, we reduce waste, increase recycling, and build cleaner
          cities.
        </p>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-green-700 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>

        {/* ✅ FIXED BUTTON */}
        <button
          onClick={() => navigate("/register")}
          className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Join Now
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8 text-center">
        <p>© 2026 WasteZero. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
