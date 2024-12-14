const User = require("../module/User");
const Movies = require("../module/movies");
const Reservation = require("../module/reservations");

exports.getAllMovies = (req, res, next) => {
  Movies.find()
    .then((movies) => {
      if (!movies || movies.length === 0) {
        return res.status(404).json({ message: "No movies found" }); // 404 for not found
      }
      res.status(200).json({
        movies: movies.map((movie) => ({
          title: movie.title,
          description: movie.description,
          category: movie.category,
          showTimes: movie.showTimes.map((showtime) => ({
            day: showtime.day,
            Hours: showtime.hours.map((hour) => hour.time),
          })),
        })),
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: err.message });
    });
};

exports.OneMovie = (req, res, next) => {
  const { movieId } = req.params;
  Movies.findById(movieId)
    .then((movie) => {
      if (!movie || movie.length === 0) {
        return res.status(404).json({ message: "No movies found" }); // 404 for not found
      }
      res.status(200).json({
        title: movie.title,
        description: movie.description,
        category: movie.category,
        showTimes: movie.showTimes.map((showtime) => showtime),
        Available_seat: movie.Available_seats,
        Reserved_seats: movie.Reserved_seats,
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: err.message });
    });
};

exports.ReservedMovie = (req, res, next) => {
  const { movieId } = req.params;
  let { seats, showTime, day } = req.body;

  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }
  // Find the user and movie
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        throw new Error("User not found");
      }
      return Movies.findById(movieId);
    })
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({ message: "No movie found" });
      }

      // Find the specific showTime on the given day
      const showTimeSlot = movie.showTimes.find((show) => show.day === day);

      if (!showTimeSlot) {
        return res
          .status(404)
          .json({ message: "Show time for the day not found" });
      }

      // Find the specific hour based on the time
      const hourSlot = showTimeSlot.hours.find(
        (hour) => hour.time === showTime
      );

      if (!hourSlot) {
        return res.status(404).json({ message: "Show time not found" });
      }

      // Check for available seats
      const availableSeats = hourSlot.availableSeats;
      const unavailableSeats = seats.filter((seat) =>
        availableSeats.includes(seat)
      );

      if (unavailableSeats.length !== seats.length) {
        return res.status(400).json({
          message: "Some of the selected seats are not available",
          unavailableSeats,
        });
      }

      // Create a reservation
      const reservation = new Reservation({
        user: req.userId,
        movie: movieId,
        showTime: { day, hours: { time: showTime, reserved_seats: seats } }, // Save the day and time with reserved seats
      });

      // Save the reservation and update movie seats
      return reservation
        .save()
        .then(() => {
          // Update available and reserved seats for the selected show time
          hourSlot.availableSeats = hourSlot.availableSeats.filter(
            (seat) => !seats.includes(seat)
          );
          hourSlot.reservedSeats = hourSlot.reservedSeats
            ? hourSlot.reservedSeats.concat(seats)
            : seats;

          return movie.save();
        })
        .then(() => {
          return User.findByIdAndUpdate(
            req.userId,
            { $push: { reservations: reservation._id } },
            { new: true }
          );
        });
    })
    .then(() => {
      res.status(200).json({
        message: "Successful reservation! Enjoy the watch :)",
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: err.message });
    });
};
