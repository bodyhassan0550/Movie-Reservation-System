const Movies = require("../module/movies");
const User = require("../module/User");

exports.getMovies = (req, res, next) => {
  Movies.find()
    .then((movies) => {
      if (!movies || movies.length === 0) {
        return res.status(404).json({ message: "No Movies found" });
      }
      // Respond with the movies including the image field
      console.log(movies);
      res.status(200).json({
        movies: movies.map((movie) => ({
          id:movie._id,
          title: movie.title,
          description: movie.description,
          category: movie.category,
          showTimes: movie.showTimes,
          hall: movie.hall,
          price: movie.price,
          seats: movie.seats,
          image: `http://localhost:5000/uploads/${movie.image}`, // Use the image field directly from the database
        })),
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};


exports.addMovie = (req, res, next) => {
  console.log("Request body:", req.body); // Log the entire request body

  const { title, description, category, showTimes, seats, hall, price } =
    req.body;

  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.isAdmin) {
        return res
          .status(403)
          .json({ message: "Access denied. You are not an admin." });
      }

      // Ensure that all required fields are provided
      if (
        !title ||
        !description ||
        !category ||
        !showTimes ||
        !seats ||
        !hall ||
        !price||
        !req.file
      ) {
        return res.status(422).json({
          message:
            "title, description, category, showTimes, seats, hall, and image are required.",
        });
      }

      // Parse showTimes and seats from strings to objects/arrays if necessary
      let parsedShowTimes;
      let parsedSeats;
      try {
        parsedShowTimes = JSON.parse(showTimes); // Parse showTimes if it's a string
        parsedSeats = JSON.parse(seats); // Parse seats if it's a string
      } catch (error) {
        return res
          .status(422)
          .json({ message: "Invalid JSON format for showTimes or seats." });
      }

      // Validate that showTimes is an array of objects with 'day' and 'hours'
      if (!Array.isArray(parsedShowTimes)) {
        return res.status(422).json({ message: "showTimes must be an array." });
      }

      // Validate each show in showTimes
      for (let show of parsedShowTimes) {
        if (
          !show.day ||
          !Array.isArray(show.hours) ||
          show.hours.length === 0
        ) {
          return res.status(422).json({
            message: "Each showTime must have a 'day' and 'hours' array.",
          });
        }

        for (let hour of show.hours) {
          if (!hour.time) {
            return res
              .status(422)
              .json({ message: "Each hour must have a 'time'." });
          }
        }
      }

      // Format showTimes for the backend
      const formattedShowTimes = parsedShowTimes.map((show) => ({
        day: show.day,
        hours: show.hours.map((hour) => ({
          time: hour.time,
          availableSeats: parsedSeats, // Each time will have the same available seats initially
          reservedSeats: [],
        })),
      }));

      // Create the movie
      const movie = new Movies({
        title,
        description,
        category,
        showTimes: formattedShowTimes,
        hall,
        price,
        seats: parsedSeats,
        image: req.file.filename,
      });

      // Save the movie to the database
      return movie.save();
    })
    .then(() => {
      return res.status(201).json({ message: "Movie added successfully" });
    })
    .catch((err) => {
      console.error("Error while adding movie:", err);
      if (!res.headersSent) {
        // Check to avoid sending multiple responses
        return res
          .status(500)
          .json({ message: "An error occurred", error: err.message });
      }
    });
};


exports.getOneMovie = (req, res, next) => {
  const { MovieId } = req.params;
  Movies.findById(MovieId)
    .then((movie) => {
      if (!movie) {
        res.json({ massage: "No Movies found" });
      }
       res.status(200).json({
         movie: {
           id: movie._id,
           title: movie.title,
           description: movie.description,
           category: movie.category,
           showTimes: movie.showTimes,
           hall: movie.hall,
           price: movie.price,
           seats: movie.seats,
           image: `http://localhost:5000/uploads/${movie.image}`, // Use the image field directly from the database
         },
       });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};

exports.deletemovie = (req, res, next) => {
  const { MovieId } = req.params;
  Movies.findByIdAndDelete(MovieId)
    .then((movie) => {
      if (!movie) {
        res.json({ massage: "No Movies found" });
      }
      res.status(200).json({
        massage: "Successful Delete Movie",
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};
exports.updateMovie = (req, res, next) => {
  const { MovieId } = req.params;
  const { title, description, category, showTimes, seats, hall, price } =
    req.body;

  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.isAdmin) {
        return res
          .status(403)
          .json({ message: "Access denied. You are not an admin." });
      }

      // Parse showTimes and seats from strings to objects/arrays if necessary
      let parsedShowTimes;
      let parsedSeats;
      try {
        parsedShowTimes = JSON.parse(showTimes); // Parse showTimes if it's a string
        parsedSeats = JSON.parse(seats); // Parse seats if it's a string
      } catch (error) {
        return res
          .status(422)
          .json({ message: "Invalid JSON format for showTimes or seats." });
      }

      // Validate showTimes and seats
      if (!Array.isArray(parsedShowTimes)) {
        return res.status(422).json({ message: "showTimes must be an array." });
      }
      for (let show of parsedShowTimes) {
        if (
          !show.day ||
          !Array.isArray(show.hours) ||
          show.hours.length === 0
        ) {
          return res.status(422).json({
            message: "Each showTime must have a 'day' and 'hours' array.",
          });
        }
        for (let hour of show.hours) {
          if (!hour.time) {
            return res
              .status(422)
              .json({ message: "Each hour must have a 'time'." });
          }
        }
      }

      // Format showTimes for the backend
      const formattedShowTimes = parsedShowTimes.map((show) => ({
        day: show.day,
        hours: show.hours.map((hour) => ({
          time: hour.time,
          availableSeats: parsedSeats, // Each time will have the same available seats initially
          reservedSeats: [], // Initially no reserved seats
        })),
      }));

      // Update the movie details in the database
      return Movies.findByIdAndUpdate(
        MovieId,
        {
          title,
          description,
          category,
          showTimes: formattedShowTimes,
          hall,
          price,
          seats: parsedSeats,
          image: req.file ? req.file.filename : undefined, // Only update image if file exists
        },
        { new: true } // Return the updated movie document
      );
    })
    .then((updatedMovie) => {
      if (!updatedMovie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res
        .status(200)
        .json({ message: "Movie updated successfully", movie: updatedMovie });
    })
    .catch((err) => {
      console.error("Error while updating movie:", err);
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ message: "An error occurred", error: err.message });
      }
    });
};