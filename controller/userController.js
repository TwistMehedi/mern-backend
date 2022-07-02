const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "simple_id",
      url: "sampleUlr",
    },
  });

  if (!user) {
    return next(
      new ErrorHandler("Registration fail please check our requirements")
    );
  }
  sendToken(user, 201, res);
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email && password) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  const isMatchedPassword = user.comparePassword(password);
  if (!isMatchedPassword) {
    return next(new ErrorHandler("Auth fail", 404));
  }

  sendToken(user, 200, res);
});

exports.logOut = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    massage: "logout successfully",
  });
});

// forgot password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //reset password uri
  const resetPasswordUri = `${req.prototype}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  //send massage
  const massage = `Your Password reset token is :- \n\n ${resetPasswordUri} \n\nIf you have not requested this email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password recovery successful`,
      massage,
    });
    res.status(200).json({
      success: true,
      massage: `Email send ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.massage, 500));
  }
});

// reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await People.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Reset password token is invalid"));
  }

  if (req.body !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match"));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await People.Save();
  sendToken(user, 200, res);
});
