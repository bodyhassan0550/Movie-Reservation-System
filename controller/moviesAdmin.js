const Movies = require("../module/movies");
const User = require("../module/User");

exports.getMovies = (req, res, next) => {
  Movies.find()
    .then((movie) => {
      if (!movie) {
        res.json({ massage: "No Movies found" });
      }
      res.status(200).json({
        movies: movie,
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
 const { title, description, category, showTimes, seats, hall } = req.body;

if (!req.userId) {
  return res.status(401).json({ message: "User not authenticated." });
}

User.findById(req.userId)
  .then((user) => {
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied. You are not an admin." });
    }
    if (!title || !description || !category || !showTimes || !seats || !hall) {
      return res.status(422).json({
        message: "title, description, category, showTimes, seats, and hall are required.",
      });
    }

    // Validate that showTimes has the correct structure
    if (!Array.isArray(showTimes)) {
      return res.status(422).json({ message: "showTimes must be an array of objects with 'day' and 'hours'." });
    }

    // Transform showTimes into the correct structure
    const formattedShowTimes = showTimes.map((show) => ({
      day: show.day,
      hours: show.hours.map((hour) => ({
        time: hour.time,
        availableSeats: seats, // Each time will have the same available seats initially
        reservedSeats: []
      }))
    }));

    const movie = new Movies({
      title: title,
      description: description,
      category: category,
      showTimes: formattedShowTimes,
      hall: hall,
      seats: seats,
    });

    return movie.save();
  })
  .then((result) => {
    res.status(201).json({ message: "Movie added successfully"});
  })
  .catch((err) => {
    res.status(500).json({ message: "An error occurred", error: err.message });
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
        movies: movie,
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
  const { title, description, categorized, showTime, seats } = req.body;
  if (!req.userId) {
    res.status(401).json({ massage: "User not authenticated." });
  }
  Movies.findByIdAndUpdate(MovieId, {
    title: title,
    description: description,
    categorized: categorized,
    showTimes: showTime,
    seats: seats,
  })
    .then((updatedMovie) => {
      if (!updatedMovie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.status(200).json({ message: "Movie updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Error updating movie" });
    });
};
