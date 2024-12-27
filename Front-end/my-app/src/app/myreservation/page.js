"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const Page = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("http://localhost:5000/myreservation", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          if (!data.reservations || data.reservations.length === 0) {
            setReservations([]);
          } else {
            setReservations(data.reservations);
          }
          console.log(data);
                      console.log(reservations);

        } else {
          setError(data.message || "Failed to fetch reservations.");
        }
      } catch (err) {
        setError("An error occurred while fetching the reservations.");
      }
    };

    fetchReservations();
  }, []);

  const handelDelete = async (id) => {
    console.log("Attempting to delete reservation with ID:", id);
    try {
      const response = await fetch(
        `http://localhost:5000/cancelreservation/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      console.log("Backend response:", data);
      if (response.ok) {
        // Refresh reservations without reloading the page
        setReservations((prev) => prev.filter((res) => res.id !== id));
      } else {
        setError(data.message || "Failed to delete the reservation.");
      }
    } catch (err) {
      console.error("Error:", err.message);
      setError("An error occurred while deleting the reservation.");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (reservations.length === 0) {
    return <div>No Reservations yet</div>;
  }

  return (
    <div>
      <h1>Reservations</h1>
      <div className="list">
        {reservations.map((res) => (
          <div key={res.id} className="card">
            <div>{res.title}</div>
            <img
              src={res.image}
              alt={res.title}
              style={{ maxWidth: "250px", height: "250px" }}
            />
            <div>
              <h3>Hall :</h3>
              <p>{res.Hall}</p>
            </div>
            <div>
              <h3>Day :</h3>
              <p>{res.Day}</p>
            </div>
            <div>
              <h3>Hour :</h3>
              <p>{res.hour}</p>
            </div>
            <div>
              <h3>Seats :</h3>
              <p>{res.Seat}</p>
            </div>
            <div>
              <h3>Total Price :</h3>
              <p>{res.total}</p>
            </div>
            <button onClick={() => handelDelete(res.id)}>Delete</button>
            <button>
              <Link href={`/myreservation/${res.id}`}>Update</Link>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
