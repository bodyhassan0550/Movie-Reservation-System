"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useFetchUserData from "../hooks/useFetchUserData"; // Import the custom hook
import Movies from "../components/GetAllmovies"
import Link from "next/link";
const UserHomePage = () => {
  const router = useRouter();
  const token = localStorage.getItem("authToken");

  // If no token, redirect to login page
  if (!token) {
    console.error("Token not found, redirecting to login...");
    router.push("/login");
    return;
  }

  const { userData, loading, error } = useFetchUserData(token); // Use the hook to fetch user data

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove token from localStorage
    router.push("/login"); // Redirect to login page
  };

  if (loading) {
    return <p>Loading...</p>; // Loading state while fetching data
  }

  if (error) {
    return <p>Error: {error}</p>; // Error handling
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, {userData.name}!</p>
      <button onClick={handleLogout}>Logout</button>
      <button>
        <Link href="/myreservation">My Reservations</Link>
      </button>

      <Movies></Movies>
    </div>
  );
};

export default UserHomePage;
