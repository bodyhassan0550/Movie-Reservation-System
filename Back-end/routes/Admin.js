const express = require("express");
const router = express.Router();
const MoviesAdmin = require("../controller/moviesAdmin");
const isAuth = require("../midddelware/isAuth");
const isAdmin = require("../midddelware/isAdmin");
const upload = require("../midddelware/imguoload");


router.get(
  "/admin/allmovies",
  isAuth,
  isAdmin,
  upload.single("image"),
  MoviesAdmin.getMovies
);
router.get("/admin/movie/:MovieId", isAuth, isAdmin, MoviesAdmin.getOneMovie);
router.post(
  "/admin/addmovie",
  isAuth,
  isAdmin,
  upload.single("image"),
  MoviesAdmin.addMovie
);
router.put("/admin/update/:MovieId", isAuth,isAdmin, upload.single("image"),MoviesAdmin.updateMovie);
router.delete(
  "/admin/delete/:MovieId",
  isAuth,
  isAdmin,
  MoviesAdmin.deletemovie
);

module.exports = router;
