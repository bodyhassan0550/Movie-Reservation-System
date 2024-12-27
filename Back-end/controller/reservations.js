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
          id: movie.id,
          title: movie.title,
          description: movie.description,
          category: movie.category,
          showTimes: movie.showTimes.map((showtime) => ({
            day: showtime.day,
            Hours: showtime.hours.map((hour) => hour.time),
          })),
          price: movie.price,
          hall: movie.hall,
          image: `http://localhost:5000/uploads/${movie.image}`, // Use the image field directly from the database
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
        movie: {
          title: movie.title,
          description: movie.description,
          category: movie.category,
          price: movie.price,
          hall: movie.hall,
          image: `http://localhost:5000/uploads/${movie.image}`,
          showTimes: movie.showTimes.map((showtime) => ({
            day: showtime.day,
            Hours: showtime.hours.map((hour) => ({
              time: hour.time,
              availableSeats: hour.availableSeats,
              reservedSeats: hour.availableSeats,
            })),
          })),
        },
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: err.message });
    });
};

exports.ReservedMovie = (req, res, next) => {
  console.log("work");
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
        totalPrice: movie.price * seats.length,
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

exports.getReservation = async (req, res, next) => {
  const { reservationId } = req.params;

  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    // Step 1: Find the user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Step 2: Verify the reservation exists in the user's reservations
    const reservationExists = user.reservations.some(
      (reserved) => reserved.toString() === reservationId
    );

    if (!reservationExists) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    // Step 3: Fetch the reservation details
    const reservationData = await Reservation.findById(reservationId);
    if (!reservationData) {
      return res
        .status(404)
        .json({ message: "Reservation details not found." });
    }

    // Step 4: Fetch the movie details
    const movie = await Movies.findById(reservationData.movie);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }
const updateAllSeats = (movie, reservationData) => {
  let AllSeats = []; // Reinitialize AllSeats to ensure it's empty at the start

  movie.showTimes.forEach((showTime) => {
    showTime.hours.forEach((hour) => {
      if (hour.time === reservationData.showTime.hours.time) {
        // Add available seats for the matched hour
        AllSeats = [...AllSeats, ...hour.availableSeats];
      }
    });
  });

  // Add reserved seats from the reservation data
  AllSeats = [...AllSeats, ...reservationData.showTime.hours.reserved_seats];

  return AllSeats;
};

const AllSeats=updateAllSeats(movie, reservationData);
console.log(AllSeats);
    // Step 5: Construct the response
    res.status(200).json({
      reservation: {
        id: reservationData._id,
        movie: movie,
        title: movie.title,
        image: `http://localhost:5000/uploads/${movie.image}`,
        day: reservationData.showTime.day,
        hour: reservationData.showTime.hours.time,
        hall: movie.hall,
        seat: reservationData.showTime.hours.reserved_seats,
        oldSeat:AllSeats,
        total: reservationData.totalPrice,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the reservation." });
  }
};

exports.getAllReservation = (req, res, next) => {
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  User.findById(req.userId)
    .then((user) => {
      if (!user || !user.reservations || user.reservations.length === 0) {
        return res.status(404).json({ message: "No reservations found." });
      }

      // Use Promise.all to retrieve all reservations and corresponding movies in parallel
      return Promise.all(
        user.reservations.map((reservationId) =>
          Reservation.findById(reservationId).then((reserved) => {
            if (!reserved) return null; // Skip if reservation is not found

            return Movies.findById(reserved.movie).then((movie) => {
              if (!movie) return null; // Skip if movie is not found

              // Return structured reservation data
              return {
                id: reserved._id,
                movieId:movie._id,
                title: movie.title,
                image: `http://localhost:5000/uploads/${movie.image}`,
                Day: reserved.showTime.day,
                hour: reserved.showTime.hours.time,
                Hall: movie.hall,
                Seat: reserved.showTime.hours.reserved_seats,
                total: reserved.totalPrice,
              };
            });
          })
        )
      );
    })
    .then((reservations) => {
      // Filter out any null results
      const validReservations = reservations.filter((res) => res !== null);

      if (validReservations.length === 0) {
        return res.status(404).json({ message: "No reservations found." });
      }

      res.status(200).json({ reservations: validReservations });
    })
    .catch((err) => {
      console.error("Error retrieving reservations:", err.message);
      res
        .status(500)
        .json({ message: "An error occurred", error: err.message });
    });
};


exports.CancelReservation = (req, res, next) => {
  const { reservationId } = req.params;
  console.log("Request received to cancel reservation:", reservationId);
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Remove the reservation from the user's reservations list
      user.reservations = user.reservations.filter(
        (reservation) => reservation.toString() !== reservationId
      );

      return user.save();
    })
    .then(() => {
      return Reservation.findById(reservationId);
    })
    .then((reservation) => {
      if (!reservation) {
        return res.status(404).json({ message: "No reservation found." });
      }

      // Find the corresponding movie to update its seats
      return Movies.findById(reservation.movie).then((movie) => {
        if (!movie) {
          return res.status(404).json({ message: "No movie found." });
        }

        // Find the showtime and hour inside the movie's showTimes array
        const showTime = movie.showTimes.find(
          (st) => st.day === reservation.showTime.day
        );

        if (!showTime) {
          return res.status(404).json({ message: "Showtime not found." });
        }

        const hour = showTime.hours.find(
          (hr) => hr.time === reservation.showTime.hours.time
        );

        if (!hour) {
          return res
            .status(404)
            .json({ message: "Hour not found in showtime." });
        }

        // Return the reserved seats to availableSeats and remove from reservedSeats
        hour.availableSeats = hour.availableSeats.concat(
          reservation.showTime.hours.reserved_seats
        );

        hour.reservedSeats = hour.reservedSeats.filter(
          (seat) => !reservation.showTime.hours.reserved_seats.includes(seat)
        );

        return movie.save();
      });
    })
    .then(() => {
      // Delete the reservation from the Reservation collection
      return Reservation.findByIdAndDelete(reservationId);
    })
    .then(() => {
      res.status(200).json({ message: "Reservation canceled successfully." });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: err.message });
    });
};

exports.UpdateReservation = (req, res, next) => {
  const { reservationId } = req.params;
  let { seats, day, time } = req.body;

  // Check if user is authenticated
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  // Find the user and reservation
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const reservation = user.reservations.find(
        (res) => res.toString() === reservationId
      );
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found." });
      }

      // Find the reservation by ID
      return Reservation.findById(reservationId).then((reservationData) => {
        if (!reservationData) {
          return res.status(404).json({ message: "Reservation not found." });
        }

        // Find the movie
        return Movies.findById(reservationData.movie).then((movie) => {
          if (!movie) {
            return res.status(404).json({ message: "No movie found." });
          }

          // Find the showtime and hour within the movie's showtimes array
          const showTime = movie.showTimes.find(
            (st) => st.day === reservationData.showTime.day
          );
          if (!showTime) {
            return res.status(404).json({ message: "Showtime not found." });
          }

          const hour = showTime.hours.find(
            (hr) => hr.time === reservationData.showTime.hours.time
          );
          if (!hour) {
            return res
              .status(404)
              .json({ message: "Hour not found in showtime." });
          }

          // Release previously reserved seats
          const reservedSeats = reservationData.showTime.hours.reserved_seats;
          hour.availableSeats = hour.availableSeats.concat(reservedSeats);
          hour.reservedSeats = hour.reservedSeats.filter(
            (seat) => !reservedSeats.includes(seat)
          );

          // Update reservation details
          day = day || reservationData.showTime.day;
          time = time || reservationData.showTime.hours.time;
          seats = seats || reservationData.showTime.hours.reserved_seats;

          // Find the new showtime and hour
          const newShowTime = movie.showTimes.find((st) => st.day === day);
          if (!newShowTime) {
            return res.status(404).json({ message: "New showtime not found." });
          }

          const newHour = newShowTime.hours.find((hr) => hr.time === time);
          if (!newHour) {
            return res
              .status(404)
              .json({ message: "New hour not found in showtime." });
          }

          // Check if selected seats are available
          const availableSeats = newHour.availableSeats;
          const unavailableSeats = seats.filter(
            (seat) => !availableSeats.includes(seat)
          );
          if (unavailableSeats.length > 0) {
            return res.status(400).json({
              message: "Some of the selected seats are not available.",
              unavailableSeats,
            });
          }

          // Update the available and reserved seats
          newHour.availableSeats = newHour.availableSeats.filter(
            (seat) => !seats.includes(seat)
          );
          newHour.reservedSeats = newHour.reservedSeats.concat(seats);

          // Save the movie data
          return movie
            .save()
            .then(() => {
              // Update the reservation in the database
              return Reservation.findByIdAndUpdate(
                reservationId,
                {
                  "showTime.day": day,
                  "showTime.hours.time": time,
                  "showTime.hours.reserved_seats": seats,
                  totalPrice: seats.length*movie.price,
                },
                { new: true }
              );
            })
            .then((updatedReservation) => {
              if (!updatedReservation) {
                return res
                  .status(404)
                  .json({ message: "Reservation update failed." });
              }

              // Return updated reservation details
              res.status(200).json({
                message: "Reservation updated successfully.",
                Reservation: {
                  movie: movie.title,
                  day: updatedReservation.showTime.day,
                  time: updatedReservation.showTime.hours.time,
                  hall: movie.hall,
                  seats: updatedReservation.showTime.hours.reserved_seats,
                },
              });
            });
        });
      });
    })
    .catch((error) => {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while updating the reservation." });
    });
};
