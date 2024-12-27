"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
const GetAllmovies = () => {
  const [movie, setMovie] = useState([]);
  const [error, seterror] = useState("");
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:5000/allmovies", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMovie(data.movies);
        } else {
          seterror(data.massage || "Failed load the movies");
        }
      } catch (error) {
        seterror("An error occurred while fetching the movies.");
      }
    };
    fetchMovies();
  }, []);
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Movies</h1>
      <div className="list">
        {movie.map((movie) => (
          <div key={movie.id} className="card">
            <div>
              <h2>{movie.title}</h2>
            </div>
            <img
              src={movie.image}
              alt={movie.title}
              style={{ maxWidth: "250px", height: "250px" }}
            />
            <div>
              <strong>Description :</strong> <p>{movie.description}</p>
            </div>
            <div>
              <strong>Category :</strong> <p>{movie.category}</p>
            </div>
            <div>
              <strong>Hall :</strong> <p>{movie.hall}</p>
            </div>
            <div>
              <strong>Price :</strong> <p>{movie.price}</p>
            </div>
            <button>
              <Link href={`/movie/${movie.id}`}>View Details</Link>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GetAllmovies;
