/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiSmartphone,
  FiTwitter,
} from "react-icons/fi";

import {
  FaPaypal,
  FaStripe,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaMobileAlt,
  FaRegCopyright,
} from "react-icons/fa";

const Footer = ({ data }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  if (!data || !data.length) {
    return (
      <footer className="bg-sky-100 text-center p-4">
        Loading footer data...
      </footer>
    );
  }

  const currentShop = data[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("/api/newsletter/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setMessage("Thank you for subscribing!");
      setEmail(""); // Clear input
    } catch (error) {
      setMessage("There was an error subscribing. Please try again.");
    }
  };

  return (
    <footer className="bg-gradient-to-b from-sky-50 to-sky-100 text-sky-900 px-6 py-8 md:px-10 md:py-12">
      {/* Shop Name */}
      <div className="flex justify-center items-center mb-8">
        <Link to="/" className="text-2xl md:text-3xl font-bold text-sky-700">
          {currentShop.name}
        </Link>
      </div>

      {/* Footer Content */}
      <div className="container mx-auto flex flex-col md:flex-row gap-8 md:gap-6">
        {/* Opening Days (Dynamic) */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-sky-700 text-center mb-3">
            Opening Days
          </h3>
          <ul className="border border-sky-200 rounded-md p-3 space-y-2 text-sm md:text-base">
            {currentShop.operationperiods
              ? Object.entries(currentShop.operationperiods).map(
                  ([day, hours]) => (
                    <li key={day} className="grid grid-cols-2">
                      <span className="capitalize">{day}:</span>
                      <span>
                        {hours.open} - {hours.close}
                      </span>
                    </li>
                  )
                )
              : "No operation periods available"}
          </ul>
        </div>

        {/* Company Policy (Dynamic) */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-sky-700 text-center mb-3">
            Company Policy
          </h3>
          <p className="text-sm md:text-base leading-relaxed">
            {currentShop.companypolicy || "No policy available."}
          </p>
        </div>

        {/* Newsletter Subscription */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-sky-700 text-center mb-3">
            Newsletter
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="p-2 rounded-md border border-sky-300 bg-white text-sky-700 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            />

            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-base py-2 rounded-md transition-colors"
            >
              Subscribe
            </button>
            {message && (
              <p className="text-sm text-red-600" aria-live="polite">
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Contact Information */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-sky-700 text-center mb-3">
            Contact Us
          </h3>
          <div className="space-y-4 text-sm md:text-base">
            {/* Address */}
            <p className="flex items-center">
              <FiMapPin className="mr-2 text-sky-600" />
              {currentShop?.location?.address &&
              currentShop?.location?.mapurl?.[0] ? (
                <a
                  href={currentShop.location.mapurl[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-sky-600 hover:text-sky-500"
                >
                  {currentShop.location.address}
                </a>
              ) : (
                <span>Location not available</span>
              )}
            </p>
            {/* Phone */}
            <p className="flex items-center">
              <FiSmartphone className="mr-2 text-sky-600" />
              <span>Phone: {currentShop.contact.phoneno}</span>
            </p>
            {/* Email */}
            <p className="flex items-center">
              <FiMail className="mr-2 text-sky-600" />
              <a
                href={`mailto:${currentShop.contact.email}`}
                className="text-sky-600 hover:underline"
              >
                {currentShop.contact.email}
              </a>
            </p>
          </div>

          {/* Social Media Links (Dynamic) */}
          <div className="flex justify-center mt-6 space-x-6">
            {currentShop.socialmedialinks?.map((link, index) => {
              let Icon;
              if (link.includes("facebook")) Icon = FiFacebook;
              else if (link.includes("twitter")) Icon = FiTwitter;
              else if (link.includes("instagram")) Icon = FiInstagram;
              else return null; // Ignore if no matching icon

              return (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-600"
                >
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Icons */}
      <div className="flex justify-center items-center mt-8 space-x-6">
        <FaPaypal className="h-6 w-6 text-blue-500" />
        <FaStripe className="h-6 w-6 text-blue-700" />
        <FaCcVisa className="h-6 w-6 text-blue-600" />
        <FaCcMastercard className="h-6 w-6 text-red-600" />
        <FaCcAmex className="h-6 w-6 text-blue-500" />
        <FaMobileAlt className="h-6 w-6 text-green-500" />
      </div>

      {/* Copyright */}
      <div className="flex justify-center mt-8">
        <p className="text-xs md:text-sm text-gray-500 flex items-center">
          <FaRegCopyright className="inline-block h-3 w-3 mr-1" />
          2025 SME Sale Point. All rights reserved. Developed by Dancah Technology
        </p>
      </div>
    </footer>
  );
};

export default Footer;
