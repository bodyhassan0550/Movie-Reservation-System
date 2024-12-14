const express= require("express")
const router=express.Router()
const reservationController=require("../controller/reservations")
const isAuth = require("../midddelware/isAuth")
router.get("/allmovies",reservationController.getAllMovies);
router.get("/movie/:movieId", reservationController.OneMovie);
router.post("/reservation/:movieId", isAuth, reservationController.ReservedMovie);

module.exports=router