require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log("DB Connected"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/issues", require("./routes/issues"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/comments", require("./routes/comments"));
app.use("/uploads", express.static("uploads"));


app.listen(process.env.PORT, ()=>console.log("Server running"));
