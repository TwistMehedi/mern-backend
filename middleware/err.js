const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.massage = err.massage || "Internal server error";

  if (error.name === "CastError") {
    const massage = `Resource not found, Invalid: ${error.path}`;
    err = new ErrorHandler(massage, 400);
  }

  res.status(err.statusCode).json({
    success: true,
    error: err,
  });
};
