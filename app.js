require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { checkForAuthenicationCookie } = require("./middlewares/authentication.js");
const userRoutes = require("./routes/user.js");
const blogRoutes = require("./routes/blog.js");
const aiRoutes = require('./routes/ai');
const { Blog } = require("./models/blog.js");

mongoose.connect(process.env.MONGODB_CONNECT_URL)
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error(" MongoDB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json()); 
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
app.use("/", aiRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", async (req, res) => {
  const sort = req.query.sort || "latest";

  let sortQuery =
    sort === "endorsed"
      ? { endorses: -1 }
      : { createdAt: -1 };

  const blogs = await Blog.find({})
    .populate("createdBy")
    .sort(sortQuery);

  res.render("home", {
    blogs,
    sort
  });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(` Server running on PORT: ${PORT}`);
});
