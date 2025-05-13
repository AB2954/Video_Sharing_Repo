// DOTENV configured in package.json dev script
// "dev": "nodemon -r dotenv/config --experimental-jsone-modules src/index.js"
// import dotenv from "dotenv";
// dotenv.config({
//   path: "./.env"
// });
import express from "express";
import connectDB from "./db/index.js";
const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



/*
;(async()=>{
  try{
    // Connect to MongoDB
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("MongoDB connection instance: ", connectionInstance);
    app.on("error",(error)=>{
      console.error("Application cannot talk to MongoDB : ",error);
      process.exit(1);
    })
  }catch(error){
    console.error("Error connecting to MongoDB: ", error);
    process.exit(1);
  }
})()
*/