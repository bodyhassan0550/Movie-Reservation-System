"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleInput = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        router.push("/");
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleInput}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            className="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <div>{message}</div>} {/* Display error message */}
      <div>
        <p>Don't have an account?</p>
        <Link href="/signup">
          <button>Signup</button>
        </Link>
      </div>
    </div>
  );
};

export default Page;
