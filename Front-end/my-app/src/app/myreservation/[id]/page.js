"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const UpdateReservationPage = ({ params }) => {
  const { id } = React.use(params); // Get reservation ID from route params
  const [reservation, setReservation] = useState(null);
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [OldSeats, setOldSeats] = useState([]);
  const [OldTime, setOldTime] = useState(null);
  const [OldDay, setOldDay] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/myreservation/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();
        console.log("Fetched Data:", data);

        if (response.ok) {
          const { reservation } = data;
          console.log(reservation);
          setReservation(reservation || {});
          setMovie(reservation.movie || {});
          setSelectedSeats(reservation.seat || []);
          setSelectedDay(reservation.day || "");
          setSelectedTime(reservation.hour || "");
          setOldSeats(reservation.oldSeat || []);
          setOldDay(reservation.day || "");
          setOldTime(reservation.hour || "");
        } else {
          setError(data.message || "Failed to load the reservation.");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("An error occurred while fetching the reservation.");
      }
    };

    fetchReservation();
  }, [id]);

  const handleSeatSelect = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleTime = (day, time) => {
    if (day === OldDay && time === OldTime) {
      // If both day and time match the old reservation, keep the old seats
      setSelectedDay(day);
      setSelectedTime(time);
      setSelectedSeats(reservation.seat);
    } else {
      // Otherwise, reset selected seats and update day and time
      setSelectedDay(day);
      setSelectedTime(time);
      setSelectedSeats([]);
    }
  };

  const handleUpdateReservation = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/updatereservation/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            seats: selectedSeats,
            day: selectedDay,
            time: selectedTime,
          }),
        }
      );
console.log(response)
      // Log the raw response if it's not ok
      if (!response.ok) {
        setUpdateMessage("An error occurred: Update");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setUpdateMessage("Reservation updated successfully!");
        router.push(`/myreservation`);
      } else {
        setUpdateMessage(data.message || "Update failed.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      setUpdateMessage("An error occurred while updating the reservation.");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!reservation || !movie) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Update Reservation for {movie.title}</h1>
      <img
        src={reservation.image}
        alt={reservation.title}
        style={{ maxWidth: "250px", height: "250px" }}
      />
      <div>
        <h2>Current Reservation</h2>
        <p>
          <strong>Day:</strong> {reservation.day}
        </p>
        <p>
          <strong>Time:</strong> {reservation.hour}
        </p>
        <p>
          <strong>Seats:</strong> {reservation.seat.join(", ")}
        </p>
      </div>
      <div>
        <h2>Select New Showtime</h2>
        {movie.showTimes?.map((showtime, index) => (
          <div key={index}>
            <h3>{showtime.day}</h3>
            {showtime.hours.map((hour, i) => (
              <div key={i}>
                <button onClick={() => handleTime(showtime.day, hour.time)}>
                  {hour.time}
                </button>
                {selectedDay === showtime.day && selectedTime === hour.time && (
                  <div>
                    <h4>Select Seats</h4>
                    {/* Check if the current hour matches the old reservation hour */}
                    {hour.time === OldTime && OldDay === showtime.day
                      ? OldSeats.map((seat, j) => (
                          <label key={j} style={{ marginRight: "10px" }}>
                            <input
                              type="checkbox"
                              value={seat}
                              checked={selectedSeats.includes(seat)}
                              onChange={() => handleSeatSelect(seat)}
                            />
                            {seat}
                          </label>
                        ))
                      : hour.availableSeats.map((seat, j) => (
                          <label key={j} style={{ marginRight: "10px" }}>
                            <input
                              type="checkbox"
                              value={seat}
                              onChange={() => handleSeatSelect(seat)}
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

      <div>
        <h2>Selected Updates</h2>
        <p>
          <strong>Day:</strong> {selectedDay || "Not selected"}
        </p>
        <p>
          <strong>Time:</strong> {selectedTime || "Not selected"}
        </p>
        <p>
          <strong>Seats:</strong> {selectedSeats.join(", ") || "None selected"}
        </p>
        <button onClick={() => handleUpdateReservation()}>
          Update Reservation
        </button>
        {updateMessage && <p>{updateMessage}</p>}
      </div>
    </div>
  );
};

export default UpdateReservationPage;
