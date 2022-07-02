const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter your name"],
    maxLength: [20, "Your name is very long please enter 20 characters"],
    minLength: [3, "Your name is very small please enter the 3 characters"],
  },
  email: {
    type: String,
    required: [true, "Enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter your valid email"],
  },
  password: {
    type: String,
    required: [true, "Enter your password"],
    maxLength: [15, "Your password is very long please enter in 15 characters"],
    minLength: [8, "Your password is very small please enter in 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "User",
  },

  resetPasswordToken: String,
  resetPasswordExpire: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// userSchema.methods.comparePassword = async function (enterPassword) {
//   return await bcrypt.compare(enterPassword, this.password);
// };
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const user = new mongoose.model("User", userSchema);
module.exports = user;
