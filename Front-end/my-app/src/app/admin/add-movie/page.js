"use client";

import React, { useState } from "react";

const AddMoviePage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    hall: "",
    price: "",
    seats: [], // Array to hold seat values
    showTimes: [], // Properly formatted for backend
  });
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [tempHours, setTempHours] = useState([]); // Temporary hours for a specific day
  const [seatInput, setSeatInput] = useState(""); // Temporary input for seats
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  // Add a single time to the temporary hours list
  const handleAddTime = () => {
    if (time.trim()) {
      setTempHours([...tempHours, { time }]);
      setTime("");
    }
  };

  // Add a day with its times to the showTimes array
const handleAddDay = () => {
  if (day.trim() && tempHours.length > 0) {
    // Ensure hours are formatted correctly
    const formattedHours = tempHours.map((hour) => ({
      time: hour.time, // Each time is wrapped in an object with a 'time' key
    }));

    setFormData((prev) => ({
      ...prev,
      showTimes: [
        ...prev.showTimes,
        { day, hours: formattedHours } // Add the day and corresponding hours
      ],
    }));

    setDay("");
    setTempHours([]); // Clear temporary hours
  }
};

  // Add seats to the seats array
  const handleAddSeats = () => {
    if (seatInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        seats: [
          ...prev.seats,
          ...seatInput.split(",").map((seat) => seat.trim()),
        ],
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
  console.log("showTimes to be sent: ", formData.showTimes);

   const formDataToSend = new FormData();
   formDataToSend.append("title", formData.title);
   formDataToSend.append("description", formData.description);
   formDataToSend.append("category", formData.category);
   formDataToSend.append("hall", formData.hall);
   formDataToSend.append("price", formData.price);
   formDataToSend.append("seats", JSON.stringify(formData.seats));
   formDataToSend.append("showTimes", JSON.stringify(formData.showTimes)); // Ensure showTimes is correctly formatted
   formDataToSend.append("image", image);

   console.log("Payload being sent to backend:", {
     title: formData.title,
     description: formData.description,
     category: formData.category,
     hall: formData.hall,
     price: formData.price,
     seats: formData.seats,
     showTimes: formData.showTimes,
   });

   try {
     const response = await fetch("http://localhost:5000/admin/addmovie", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${localStorage.getItem("authToken")}`,
       },
       body: formDataToSend,
     });

     const data = await response.json();
     if (response.ok) {
       setMessage("Movie added successfully!");
     } else {
       setMessage(`Error: ${data.message}`);
     }
   } catch (error) {
     setMessage("An error occurred while adding the movie.");
     console.error(error);
   }
 };

  return (
    <div>
      <h1>Add Movie</h1>
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
          <label htmlFor="price">price</label>
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
        <div>
          <label htmlFor="image">Movie Image</label>
          <input type="file" id="image" onChange={handleFileChange} />
        </div>
        <button type="submit">Add Movie</button>
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
            </div>
          ))}
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddMoviePage;
