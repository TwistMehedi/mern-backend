require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(express.json());
app.use(cookieParser);

const userRouter = require("./router/userRouter");

mongoose
  .connect(process.env.MONGOOSE_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connection successful"))
  .catch((err) => console.log(err));

app.use("/api/v1", userRouter);

app.listen(process.env.PORT, () => {
  console.log(`Your port number running is ${process.env.PORT}`);
});
