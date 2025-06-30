const { Router } = require("express");
const { User } = require("../models/user");
const { Blog } = require("../models/blog");

const router = Router();
// As we are using nav in our signin and signout which may or maynot be in our signin or signout page

router.get("/signin", (req, res) => {
    return res.render("signin", { user: req.user || null });
});

router.get("/signup", (req, res) => {
    return res.render("signup", { user: req.user || null });
});





// POST: Sign In User
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect email or password",
    });
  }
});

// POST: Sign Up User
router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;
  const user = new User({ fullname, email, password });
  await user.save();
  return res.redirect("/user/signin");
});

// GET: Logout User
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.redirect("/user/signin");
});

// GET: Blogs by specific user
router.get("/:id/blogs", async (req, res) => {
  try {
    const userId = req.params.id;
    const blogs = await Blog.find({ createdBy: userId }).populate("createdBy");

    if (blogs.length === 0) {
      return res.render("userBlogs", {
        blogs: [],
        userName: "This user hasn't posted any blogs yet.",
      });
    }

    return res.render("userBlogs", {
      blogs,
      userName: blogs[0].createdBy.fullname,
    });
  } catch (error) {
    console.log("Error fetching blogs:", error.message);
    return res.redirect("/");
  }
});
router.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { body: { $regex: query, $options: "i" } },
      ],
    }).populate("createdBy");

    const users = await User.find({
      fullname: { $regex: query, $options: "i" },
    });

    res.render("searchResults", {
      query,
      blogs,
      users,
      user: req.user,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Error performing search");
  }
  

});


module.exports = router;
