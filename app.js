require("dotenv").config();
const express=require("express")
const app=express();
const path= require("path");
const router =require("./routes/user.js")

const blogRouter =require("./routes/blog.js")
const {Blog}=require("./models/blog.js")

const mongoose=require("mongoose")
mongoose.connect(process.env.MONGO_URL).then(e=>console.log("mongodb connected"))

const PORT=process.env.PORT||8000;
const cookieParser =require("cookie-parser");
const { checkForAuthenicationCookie } = require("./middlewares/authentication.js");
//calling view engine for ejs
app.set("view engine",'ejs')
app.set("views",path.resolve("./views"))
app.use(cookieParser());
app.use(checkForAuthenicationCookie("token"))
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.resolve("./public")))



app.use("/user",router)
app.use("/blog",blogRouter)


//allowing express to serve files in public folder


app.get("/",async(req,res)=>{
    const allBlogs=await Blog.find({});
    return res.render("home",{
    user:req.user,
    blogs:allBlogs,
    });
    
})
app.listen(PORT,()=>{
    console.log(`Server started at PORT:${PORT}`)
})