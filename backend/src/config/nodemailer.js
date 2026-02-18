import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config();

 const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.email,
        pass: process.env.password,
    }
})

export default transporter;