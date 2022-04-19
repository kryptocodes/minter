const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/Database");


const compression = require("compression");

const cookieParser = require("cookie-parser");
const Upload = require("./routes/upload");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MongoDB
connectDB();
app.set('trust proxy', 1);
app.use(cookieParser());







// Express configuration
app.set("port", process.env.PORT || 5000);


app.use(cors());
app.use(compression());

app.use("/api",Upload)

app.get("/", (_req, res) => {
  res.send("API Running");
});

const port = app.get("port");
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

module.exports = server;