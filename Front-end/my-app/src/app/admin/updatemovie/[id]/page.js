"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

const UpdateMoviePage = () => {
  const { id } = useParams(); // Get the movie ID from params
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    description: "",
    category: "",
    hall: "",
    price: "",
    seats: [],
    showTimes: [],
  });
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [tempHours, setTempHours] = useState([]);
  const [seatInput, setSeatInput] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    // Fetch the current movie details from the backend
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/admin/movie/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setFormData({
            title: data.movie.title,
            description: data.movie.description,
            image: data.movie.image,
            category: data.movie.category,
            hall: data.movie.hall,
            price: data.movie.price,
            seats: data.movie.seats,
            showTimes: data.movie.showTimes,
          });
        } else {
          setMessage(`Error: ${data.message}`);
        }
      } catch (error) {
        setMessage("An error occurred while fetching the movie details.");
        console.error(error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleAddTime = () => {
    if (time.trim()) {
      setTempHours([...tempHours, { time }]);
      setTime("");
    }
  };

const handleAddDay = () => {
  if (day.trim() && tempHours.length > 0) {
    const formattedHours = tempHours.map((hour) => ({ time: hour.time }));

    setFormData((prev) => ({
      ...prev,
      showTimes: [
        ...prev.showTimes.filter((show) => show.day !== day), // Remove the old showtimes for the selected day
        { day, hours: formattedHours }, // Add the new showtimes for the selected day
      ],
    }));

    setDay("");
    setTempHours([]); // Reset the temporary hours array
  }
};
const handleDeleteDay = (dayToDelete) => {
  setFormData((prev) => ({
    ...prev,
    showTimes: prev.showTimes.filter((show) => show.day !== dayToDelete), // Remove the showtimes for the specified day
  }));
};

  const handleAddSeats = () => {
    if (seatInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        seats: seatInput.split(",").map((seat) => seat.trim()), // Replace old seats with new ones
      }));
      setSeatInput("");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to send in the request
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("hall", formData.hall);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("seats", JSON.stringify(formData.seats));
    formDataToSend.append("showTimes", JSON.stringify(formData.showTimes)); // Ensure showTimes is formatted as JSON
    if (image) {
      formDataToSend.append("image", image); // Append the image if present
    }

    try {
      const response = await fetch(
        `http://localhost:5000/admin/update/${id}`, // Corrected `movieId` to `id`
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Ensure you're sending the token for authentication
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage("Movie updated successfully!");
        router.push("/admin/movies")
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("An error occurred while updating the movie.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Update Movie</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div>
          {formData.image && formData.image !== "" ? (
            <img
              src={formData.image}
              alt={formData.title}
              style={{ maxWidth: "250px", height: "250px" }}
            />
          ) : (
            <p>No image available</p> // Optionally show a message if no image is available
          )}
          <input type="file" id="image" onChange={handleFileChange} />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="hall">Hall</label>
          <input
            type="text"
            id="hall"
            value={formData.hall}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="price">Price</label>
          <input
            type="text"
            id="price"
            value={formData.price}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="seatInput">Seats (comma-separated)</label>
          <input
            type="text"
            id="seatInput"
            value={seatInput}
            onChange={(e) => setSeatInput(e.target.value)}
          />
          <button type="button" onClick={handleAddSeats}>
            Add Seats
          </button>
        </div>
        <div>
          <label htmlFor="day">Show Day</label>
          <input
            type="text"
            id="day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="time">Show Time</label>
          <input
            type="text"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button type="button" onClick={handleAddTime}>
            Add Time
          </button>
        </div>
        <div>
          <button type="button" onClick={handleAddDay}>
            Add Day with Times
          </button>
        </div>
        <button type="submit">Update Movie</button>
      </form>
      {formData.seats.length > 0 && (
        <div>
          <h2>Seats</h2>
          <ul>
            {formData.seats.map((seat, index) => (
              <li key={index}>{seat}</li>
            ))}
          </ul>
        </div>
      )}
      {formData.showTimes.length > 0 && (
        <div>
          <h2>Current Show Times</h2>
          {formData.showTimes.map((show, index) => (
            <div key={index}>
              <strong>Day:</strong> {show.day}
              <ul>
                {show.hours.map((hour, hourIndex) => (
                  <li key={hourIndex}>{hour.time}</li>
                ))}
              </ul>
              <button type="button" onClick={() => handleDeleteDay(show.day)}>
                Delete {show.day}
              </button>
            </div>
          ))}
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateMoviePage;
