"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Page = ({ params }) => {
  const { id } = React.use(params); // Unwrap the `params` using `React.use()`
  const [movie, setMovie] = useState(null); // Initialize as `null` for a single movie object
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/delete/${id}`, {
        method: "DELETE", // Change to DELETE method
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        router.push("/admin/movies");
      } else {
        setError(data.message || "Failed to Delete the movie.");
      }
    } catch (err) {
      setError("An error occurred while deleting the movie.");
    }
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/admin/movie/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setMovie(data.movie); // Assume the API returns the movie object in `data.movie`
        } else {
          setError(data.message || "Failed to load the movie.");
        }
      } catch (err) {
        setError("An error occurred while fetching the movie.");
      }
    };

    fetchMovie();
  }, [id]); // Add `id` as a dependency for useEffect

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!movie) {
    return <div>Loading...</div>; // Show a loading state while fetching
  }

  return (
    <div>
      <h1>{movie.title}</h1>
      <img
        src={movie.image}
        alt={movie.title}
        style={{ maxWidth: "250px", height: "250px" }}
      />
      <p>{movie.description}</p>
      <p>
        <strong>Category:</strong> {movie.category}
      </p>
      <p>
        <strong>Hall:</strong> {movie.hall}
      </p>
      <p>
        <strong>Price:</strong> {movie.price}
      </p>
      <p>
        <strong>Seats:</strong> {movie.seats.join(", ")}
      </p>
      <div>
        <h3>Show Times</h3>
        {movie.showTimes.map((show, index) => (
          <div key={index}>
            <strong>{show.day}</strong>
            <ul>
              {show.hours.map((hour, hourIndex) => (
                <li key={hourIndex}>{hour.time}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button>
        <Link href={`/admin/updatemovie/${movie.id}`}>Update</Link>
      </button>
      <button onClick={() => handleDelete(movie.id)}>Delete</button>
    </div>
  );
};

export default Page;
