"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Home = () => {
const token = localStorage.getItem("authToken");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

 useEffect(() => {
   const checkUserRole = async () => {
     const token = localStorage.getItem("authToken");
     if (!token) {
       console.error("Token not found, redirecting to login...");
       router.push("/login");
       return;
     }

     try {
       const response = await fetch("http://localhost:5000/user", {
         method: "GET",
         credentials: "include", // Include cookies (JWT token set as HTTP-only cookie)
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`, // Add the token here
         },
       });

       console.log("Response status:", response.status); // Debug: log status
       const data = await response.json(); // Parse the user data returned by the backend
       console.log("User data:", data); // Debug: log the data

       if (!response.ok) {
         console.error("Error response:", data);
         router.push("/login"); // Redirect to login if not authenticated or user not found
         return;
       }

       // Check if user is an admin and redirect accordingly
       if (data.isAdmin) {
         console.log("Admin user detected, redirecting to admin home...");
         router.push("/admin/home");
       } else {
         console.log("User detected, redirecting to user home...");
         router.push("/home");
       }
     } catch (err) {
       console.error("Error fetching user role:", err);
       router.push("/login"); // Redirect to login if there is an error
     } finally {
       setLoading(false); // Finish loading
     }
   };

   checkUserRole();
 }, [router]);

  if (loading) {
    return <p>Loading...</p>; // Loading indicator while checking authentication
  }

  return null; // Empty while redirecting
};

export default Home;
