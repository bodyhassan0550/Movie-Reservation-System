const express = require("express")
const body_parser= require("body-parser")
const cors = require("cors");
const mongoose = require("mongoose")
const app =express();
const UserRoute=require("./routes/User")
const AdminRouter=require("./routes/Admin")
const ReservationRouter=require("./routes/reseervation")
const Auth=require("./midddelware/isAuth")
const path = require("path");
app.use(
  "/uploads",
  express.static(path.join(__dirname, "midddelware/uploads"))
);
app.use(body_parser.json())
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL (adjust if using a different port)
    credentials: true, // Allow cookies to be sent with the request
  })
);app.use(Auth)
app.use(UserRoute)
app.use(AdminRouter)
app.use(ReservationRouter);
const mongooseURL =
  "mongodb+srv://bodyhassan0550:body312002%40@cluster0.i6vca26.mongodb.net/Movies";
mongoose.connect(mongooseURL).then(()=>{
    console.log("connect")
    app.listen(5000)
})