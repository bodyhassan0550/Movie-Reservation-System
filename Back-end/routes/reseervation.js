const express = require("express");
const router = express.Router();
const reservationController = require("../controller/reservations");
const isAuth = require("../midddelware/isAuth");
router.get("/allmovies", reservationController.getAllMovies);
router.get("/movie/:movieId", reservationController.OneMovie);
router.post(
  "/reservation/:movieId",
  isAuth,
  reservationController.ReservedMovie
);
router.get(
  "/myreservation/:reservationId",
  isAuth,
  reservationController.getReservation
);
router.get("/myreservation", isAuth, reservationController.getAllReservation);
router.post(
  "/cancelreservation/:reservationId",
  isAuth,
  reservationController.CancelReservation
);
router.put(
  "/updatereservation/:reservationId",
  isAuth,
  reservationController.UpdateReservation
);

module.exports = router;
