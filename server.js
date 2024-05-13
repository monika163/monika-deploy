const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");

//rest object
const app = express();

//dotenv config
dotenv.config();

//db connection
connectDB();

//middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

//routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/category", require("./routes/categoryRoutes"));
app.use("/api/v1/product", require("./routes/productRoutes"));

//PORT
const PORT = process.env.PORT || 8080;

//static files
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", function (req, resp) {
  resp.sendFile(path.join(__dirname, "./client/build/index.html"));
});

//rest apis
app.get("/", (req, resp) => {
  resp.send({
    message: "Welcome To Ecommerce App"
  });
});

app.listen(PORT, () => {
  console.log(`Server Running On ${PORT}`);
});
