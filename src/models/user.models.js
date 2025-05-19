import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  watchHistory:[{
    type: Schema.Types.ObjectId,
    ref: "Video"
  }],
  username:{
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    index: true,
  },
  email:{
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  fullName:{
    type: String,
    required: true,
    trim: true,
  },
  avatar:{
    type: String,
    required: true,
  },
  coverImage:{
    type: String,
  },
  password:{
    type: String,
    required: [true, "Password field is mandatory."],
  },
  refreshToken:{
    type: String,
  }
},{timestamps:true});

userSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password,10);  // Always store the value in this.[parameter] if you are updating the value before saving.
  next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = async function(){
  return jwt.sign({
    _id:this.id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  )  
}
userSchema.methods.generateRefreshToken = async function(){
  return jwt.sign({
    _id:this.id,
  },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  )
}

export const User = mongoose.model("User",userSchema);