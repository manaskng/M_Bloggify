require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");

const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { checkForAuthenicationCookie } = require("./middlewares/authentication.js");

const userRoutes = require("./routes/user.js");
const blogRoutes = require("./routes/blog.js");
const { Blog } = require("./models/blog.js");

//  Connect MongoDB
mongoose.connect(process.env.MONGODB_CONNECT_URL)
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error(" MongoDB connection error:", err));

//  Set up view engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("./public")));
app.use(cookieParser());
app.use(checkForAuthenicationCookie("token"));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});


app.use("/user", userRoutes);
app.use("/blog", blogRoutes);
//global access
app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).populate("createdBy");
  res.render("home", {
    blogs: allBlogs
    
  });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(` Server running on PORT: ${PORT}`);
});
