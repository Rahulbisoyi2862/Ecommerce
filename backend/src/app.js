import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auths.route.js';
import { sellerModel } from './models/seller.model.js';
import cron from 'node-cron';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auths", authRoutes)

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// background work for clearing expired OTPs
cron.schedule("*/3 * * * *", async () => {

    const now = new Date();

    try {
        const result = await sellerModel.deleteMany({
            expiry: { $lt: now }
        });


    } catch (error) {
        console.log("Error in cron job:", error);
    }
});