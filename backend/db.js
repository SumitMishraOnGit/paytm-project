const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
    type: String,
    required: [true, "Name is required"],
    unique:true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
    minlength: [8, "Password must be at least 8 characters"],
  },
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
})

const User = mongoose.model("User", UserSchema);
module.exports = User;