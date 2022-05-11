require("dotenv").config();
const express = require("express");
const users = require('./routes/users');
const items = require('./routes/items');
const auth = require('./routes/auth');
const images = require('./routes/images');
const global = require('./routes/global')
const { checkUser } = require('./middleware/auth');
const port = process.env.PORT || 8000;
const connectDB = require('./db');
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');

// Connect to MongoDB
connectDB();

// Initialising CORS middleware
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// Initialises body parser middleware functions .json() and .urlencoded()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Initialises cookie parser middleware
app.use(cookieParser());
// Initialises middleware to server static files in the folder named images
app.use("/images", express.static("images"));

// Initialises middleware to check for authenticated users on all API requests
app.get("*", checkUser);
app.post("*", checkUser);
app.put("*", checkUser);
app.delete("*", checkUser);
// Initialises all base API routes and their associated routing file
app.use("/api/users", users);
app.use("/api/items", items);
app.use("/api/auth", auth);
app.use("/api/images", images);
app.use("/api/global", global)

// Starts a server and listens on the specified port for connections
app.listen(port, console.log(`Server running on port ${port}.`));