const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const router = Router();

const { Blog } = require("../models/blog");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads/"));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });

// Show blog creation form
router.get("/add-new", (req, res) => {
  if (!req.user) return res.redirect("/user/signin");
  return res.render("addBlog", {
    user: req.user,
  });
});

// Handle blog creation
router.post("/add-new", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;

    const blog = new Blog({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    await blog.save();
    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error creating blog:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// View a single blog
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id).populate("createdBy");

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    return res.render("blog", {
      blog,
      user: req.user,
    });
  } catch (err) {
    console.error("Error fetching blog:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// View all blogs by a specific user
router.get("/user/:userId/blogs", async (req, res) => {
  const { userId } = req.params;

  try {
    const userBlogs = await Blog.find({ createdBy: userId }).populate("createdBy");

    if (!userBlogs.length) {
      return res.status(404).send("No blogs found for this user");
    }

    res.render("userBlogs", {
  blogs: userBlogs,
  userName: user.fullname,
  user: req.user // This is required to match `user._id`
});

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
});
//adding edit and delete feature by a User
router.post("/delete/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  // 🛡 Ensure only the creator can delete
  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  await Blog.findByIdAndDelete(req.params.id);
  res.redirect("/");
});
// edit blog by that user first get blog then post data from edit-blog
router.get("/edit/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  // 🛡 Check permission
  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  res.render("edit-blog", {
    user: req.user,
    blog,
  });
});

router.post("/edit/:id", async (req, res) => {
  const { title, body, coverImageURL } = req.body;
  const blog = await Blog.findById(req.params.id);

  // 🛡 Check permission
  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  blog.title = title;
  blog.body = body;
  blog.coverImageURL = coverImageURL;

  await blog.save();
  res.redirect("/");
});



module.exports = router;
