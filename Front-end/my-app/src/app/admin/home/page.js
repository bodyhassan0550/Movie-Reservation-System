"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useFetchUserData from "../../hooks/useFetchUserData"; // Import the custom hook
import Link from "next/link";

const AdminHomePage = () => {
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
      <h1>Admin Dashboard</h1>
      <p>Welcome Admin, {userData.name}!</p>
      <button onClick={handleLogout}>Logout</button>
      <button><Link href="/admin/add-movie">Add movie</Link></button>
      <button><Link href="/admin/movies">All movie</Link></button>
    </div>
  );
};

export default AdminHomePage;
