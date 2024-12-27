const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Path or URL of the uploaded image
    required: true,
  },
  price: {
    type: String, // Path or URL of the uploaded image
    required: true,
  },
  showTimes: [
    {
      day: {
        type: String, // e.g., "2024-11-14" (ISO format for the day)
        required: true,
      },
      hours: [
        {
          time: {
            type: String, // e.g., "1:00 PM" or "13:00"
            required: true,
          },
          availableSeats: [
            {
              type: String,
              required: true,
            },
          ],
          reservedSeats: [
            {
              type: String,
            },
          ],
        },
      ],
    },
  ],
  hall: {
    type: String,
    required: true,
  },
  seats: [
    {
      type: String,
      required: true,
    },
  ],
});

module.exports = mongoose.model("Movie", MovieSchema);
