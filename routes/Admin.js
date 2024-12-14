const express = require("express");
const router = express.Router();
const MoviesAdmin = require("../controller/moviesAdmin");
const isAuth = require("../midddelware/isAuth");
const isAdmin = require("../midddelware/isAdmin");

router.get("/admin/allmovies", isAuth, isAdmin,MoviesAdmin.getMovies);
router.get("/admin/movie/:MovieId", isAuth, isAdmin, MoviesAdmin.getOneMovie);
router.post("/admin/addmovie", isAuth,  isAdmin,MoviesAdmin.addMovie);
router.put("/admin/update/:MovieId", isAuth,isAdmin, MoviesAdmin.updateMovie);
router.delete(
  "/admin/delete/:MovieId",
  isAuth,
  isAdmin,
  MoviesAdmin.deletemovie
);

module.exports = router;

