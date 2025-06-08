const mongoose=require("mongoose");
const {createTokenForUser,validateToken}=require("../service/authentication")
//for mapping passwored we use node crypto(bcrypt also works)
const {createHmac ,randomBytes}=require("node:crypto")
const Userschema =new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true,

    },
    profileImage:{
        type:String,
        default: "public/profile.png"  ,
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    },
},{
    timestamps:true,
})
//before storing data to db it runs this function to store only hashed password for privacy of user
Userschema.pre("save",function(next){
    const user =this;
    if(!user.isModified("password")) return;

    const salt=randomBytes(16).toString("hex");
    const hashedPassword=createHmac("sha256",salt)
         .update(user.password)
         .digest("hex")

    this.salt=salt;
    this.password=hashedPassword;
    next();

})
//as in login we receive only email and password ,
// we find user with that email and its password in hash form and 
// new password using same method given by user if they match return true else false
Userschema.static("matchPasswordAndGenerateToken", async function(email,password){
    const user= await this.findOne({email});//find by email
    if(!user) throw new Error("user not found!");
    const salt=user.salt;
    const hashedPassword=user.password;

    const userProvidedHash=createHmac("sha256",salt)
    .update(password).digest("hex")
    if(hashedPassword!==userProvidedHash)throw new Error("Incorrect Password")//if found but password doesnt match

    const token =createTokenForUser(user);
    return token;

})
const User=mongoose.model('user',Userschema);
module.exports={ User

}
// //Userschema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();

//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // ✅ Method to compare passwords during login
// Userschema.methods.comparePassword = async function (candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };
