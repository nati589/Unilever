import React from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";

export default function DashboardDashboard() {
  const navigate = useNavigate();
  return (
    <>
      <Header type={2} />

      <div className="mx-4 my-8">
        <div className="text-2xl text-red-400">Dashboard</div>
        <div className="w-full flex justify-end my-5">
          <button
            className="text-blue-500 border-blue-500 border-2 px-3 py-1 rounded-md"
            onClick={() => navigate("/booking")}>
            Book Laundry Service
          </button>
        </div>
      </div>
    </>
  );
}
