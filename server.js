import express from "express"
import dotenv from "dotenv"
import cors from "cors"
dotenv.config()
import { connectDB } from "./config/db.js"
import newProjectRoutes from "./routes/newProject.routes.js"

connectDB()

const app = express()

const corsOptions = {
  origin: "http://localhost:2500", // frontend URL (React)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // credentials: true, // if you send cookies or auth headers
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

app.use("/api/projects", newProjectRoutes)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
