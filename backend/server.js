import { app } from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.Port || 3001;

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
