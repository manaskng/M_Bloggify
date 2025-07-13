const { Router } = require("express");
const multer = require("multer");
const { storage } = require("../server/config/cloudinary.js");
const router = Router();

const { Blog } = require("../models/blog");

// Multer setup with Cloudinary storage
const upload = multer({ storage });

// Endorse a blog post
router.post("/:id/endorse", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Not found" });

    const alreadyEndorsed = blog.endorsedBy.includes(req.user._id);
    if (alreadyEndorsed) return res.status(200).json({ endorsed: true, count: blog.endorses });

    blog.endorses += 1;
    blog.endorsedBy.push(req.user._id);
    await blog.save();

    res.status(200).json({ endorsed: true, count: blog.endorses });
  } catch (err) {
    console.error("Endorse error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Show blog creation form
router.get("/add-new", (req, res) => {
  if (!req.user) return res.redirect("/user/signin");
  return res.render("addblog", {
    user: req.user,
  });
});

// Handle blog creation with image upload
router.post("/add-new", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;

    console.log("File received:", req.file);

    const imageUrl = req.file?.path || req.file?.secure_url;

    const blog = new Blog({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL: imageUrl,
    });

    await blog.save();
    res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).send("Internal Server Error");
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
      userName: userBlogs[0].createdBy.fullname, // Fix: Get username from populated blogs
      user: req.user, // For template logic
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
});

// Delete blog by user
router.post("/delete/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  // Ensure only creator can delete
  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  await Blog.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

// Show blog edit form
router.get("/edit/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  // Check permission
  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  res.render("edit-blog", {
    user: req.user,
    blog,
  });
});

router.post("/edit/:id", upload.single("coverImage"), async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  const { title, body } = req.body;

  blog.title = title;
  blog.body = body;

  // ✅ If new file uploaded, update image
  if (req.file) {
    blog.coverImageURL = req.file.path; // Cloudinary stores this in .path
  }

  await blog.save();
  res.redirect(`/blog/${blog._id}`);
});

module.exports = router;
