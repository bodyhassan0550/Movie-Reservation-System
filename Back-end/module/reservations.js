const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ReservationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movie: {
    type: Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  showTime: {
    day: {
      type: String, // e.g., "2024-11-14" (ISO format for the day)
      required: true,
    },
    hours: {
      time: { type: String, required: true },
      reserved_seats: [
        {
          type: String,
          required: true,
        },
      ],
    },
  },
  reservationDate: {
    type: Date,
    default: Date.now,
  },
  totalPrice: {
    type: Number,
    default:0,
  },

});
module.exports = mongoose.model("Reservation", ReservationSchema);
