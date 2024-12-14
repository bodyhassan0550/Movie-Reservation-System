const express = require("express")
const body_parser= require("body-parser")
const mongoose = require("mongoose")
const app =express();
const UserRoute=require("./routes/User")
const AdminRouter=require("./routes/Admin")
const ReservationRouter=require("./routes/reseervation")
const Auth=require("./midddelware/isAuth")
app.use(body_parser.json())
app.use(Auth)
app.use(UserRoute)
app.use(AdminRouter)
app.use(ReservationRouter);

const mongooseURL =
  "mongodb+srv://bodyhassan0550:body312002%40@cluster0.i6vca26.mongodb.net/Movies";
mongoose.connect(mongooseURL).then(()=>{
    console.log("connect")
    app.listen(3000)
})