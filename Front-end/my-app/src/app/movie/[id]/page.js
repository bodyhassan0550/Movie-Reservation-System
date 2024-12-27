"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const MoviePage = ({ params }) => {
  const { id } = React.use(params); ; // Correct way to access `params`
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null); // To store the selected time
  const [selectedDay, setSelectedDay] = useState(""); // To store the selected day
  const [reservationMessage, setReservationMessage] = useState("");

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`http://localhost:5000/movie/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMovie(data.movie);
        } else {
          setError(data.message || "Failed to load the movie.");
        }
      } catch (err) {
        setError("An error occurred while fetching the movie.");
      }
    };
    fetchMovie();
  }, [id]);

  const handleSeatSelect = (day, time, seat) => {
    const seatKey = `${day}-${time}-${seat}`;
    setSelectedSeats((prev) =>
      prev.includes(seatKey)
        ? prev.filter((s) => s !== seatKey)
        : [...prev, seatKey]
    );
  };

  const handleTime = (day, time) => {
    setSelectedTime(time);
    setSelectedDay(day);
  };

  const handleReservation = async () => {
    if (!selectedSeats.length || !selectedTime || !selectedDay) {
      setReservationMessage("Please select day, time, and seats.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/reservation/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          seats: selectedSeats.map((seat) => seat.split("-").pop()), // Send seat IDs
          showTime: selectedTime,
          day: selectedDay,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setReservationMessage("Reservation successful! Enjoy the watch :)");
        setSelectedSeats([]);
        setSelectedTime(null);
        setSelectedDay("");
      } else {
        setReservationMessage(data.message || "Reservation failed.");
      }
    } catch (err) {
      setReservationMessage("An error occurred while making the reservation.");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!movie) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="Card">
        <h2>{movie.title}</h2>
        <img
          src={movie.image}
          alt={movie.title}
          style={{ maxWidth: "250px", height: "250px" }}
        />
        <div>
          <strong>Description:</strong> <p>{movie.description}</p>
        </div>
        <div>
          <strong>Category:</strong> <p>{movie.category}</p>
        </div>
        <div>
          <strong>Hall:</strong> <p>{movie.hall}</p>
        </div>
        <div>
          <strong>Price:</strong> <p>{movie.price}</p>
        </div>
        <div>
          <h3>Showtimes:</h3>
          {movie.showTimes.map((showtime, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <h4>{showtime.day}</h4>
              {showtime.Hours.map((hour, i) => (
                <div key={i}>
                  <p>
                    <strong>Time:</strong> {hour.time}
                  </p>
                  <button onClick={() => handleTime(showtime.day, hour.time)}>
                    Choose
                  </button>
                  {selectedTime === hour.time &&
                    selectedDay === showtime.day && (
                      <div>
                        <p>Select Seats:</p>
                        {hour.availableSeats.map((seat, j) => (
                          <label key={j} style={{ marginRight: "10px" }}>
                            <input
                              type="checkbox"
                              value={seat}
                              checked={selectedSeats.includes(
                                `${showtime.day}-${hour.time}-${seat}`
                              )}
                              onChange={() =>
                                handleSeatSelect(showtime.day, hour.time, seat)
                              }
                            />
                            {seat}
                          </label>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div>
        {selectedSeats.length > 0 && (
          <div>
            <h3>Selected Seats:</h3>
            <ul>
              {selectedSeats.map((seat, index) => (
                <li key={index}>{seat}</li>
              ))}
            </ul>
            <button onClick={handleReservation}>Reservation</button>
          </div>
        )}
        {reservationMessage && <p>{reservationMessage}</p>}
      </div>
    </div>
  );
};

export default MoviePage;
