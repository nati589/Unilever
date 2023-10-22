import React from "react";
import { useNavigate } from "react-router";

export default function Header({ type }) {
  const navigate = useNavigate();
  return (
    <header class="w-full text-gray-700 bg-white border-t border-gray-100 shadow-sm body-font sticky top-0 z-50">
      <div class="container flex flex-col items-start justify-between p-6 mx-auto md:flex-row">
        <a
          href="/"
          class="flex items-center mb-4 font-bold italic text-gray-900 title-font md:mb-0">
          Laundry App
        </a>
        {type === 2 ? (
          <nav class="flex flex-wrap items-center justify-center pl-24 text-base md:ml-auto md:mr-auto">
            <a href="/dashboard" class="mr-5 font-medium hover:text-gray-900">
              Home
            </a>
            <a href="/booking" class="mr-5 font-medium hover:text-gray-900">
              Booking
            </a>
            <a href="/employee" class="font-medium hover:text-gray-900">
              Employee 
            </a>
          </nav>
        ) : (
          <></>
        )}
        {type === 1 ? (
          <div class="items-center h-full">
            <button
              onClick={() => navigate("/login")}
              class="mr-5 font-medium hover:text-gray-900">
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              class="px-4 py-2 text-xs font-bold text-white uppercase transition-all duration-150 bg-teal-500 rounded shadow outline-none active:bg-teal-600 hover:shadow-md focus:outline-none ease">
              Sign Up
            </button>
          </div>
        ) : (
          <>
            <div class="flex items-center space-x-4">
              {/* <img class="w-10 h-10 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="Rounded avatar"> */}
              <img
                class="w-10 h-10 rounded"
                src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                alt="Default avatar"
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
