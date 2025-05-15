// DOTENV configured in package.json dev script
// "dev": "nodemon -r dotenv/config --experimental-jsone-modules src/index.js"
// import dotenv from "dotenv";
// dotenv.config({
//   path: "./.env"
// });
import connectDB from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

connectDB()
.then(()=>{
  app.listen(PORT,()=>{
    const PORT  = process.env.PORT || 8080;
    console.log(`Server running on PORT:${PORT} !!!`)
  })
  app.on("error",()=>{
    console.log("Application could not talk to DB.", error);
    process.exit(1);
  })
})
.catch((error)=>{
  console.log("Error Connecting MongoDB !!!",error);
  process.exit(1);
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