const { connect } = require("mongoose");

require('dotenv').config()



const URL = process.env.MONGODB

const connectDB = async () => {
  try {
    const mongoURI = URL
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    await connect(mongoURI, options);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;