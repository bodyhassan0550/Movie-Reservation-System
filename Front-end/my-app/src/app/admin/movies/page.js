// pages/movies.js
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link"; // Ensure Link is imported
import { useRouter } from "next/navigation";
const MoviesPage = () => {
  const router=useRouter();
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:5000/admin/allmovies", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setMovies(data.movies); // Set the fetched movies
        } else {
          setError(data.message || "Failed to load movies");
          
        }
      } catch (err) {
        setError("An error occurred while fetching the movies.");
      }
    };

    fetchMovies();
  }, []);

  if (error?.includes("Unauthorized: You are not an admin")) {
    router.push("/login");
  } else if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Movies</h1>
      <div className="movie-list">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <h2>{movie.title}</h2>
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
              <Link href={`/admin/movie/${movie.id}`}>View Details</Link>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoviesPage;
