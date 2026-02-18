import jwt from "jsonwebtoken"
import sellerOtpModel from "../models/seller.otp.model.js";
import transporter from "../config/nodemailer.js";
import { sellerModel } from "../models/seller.model.js";
import bcrypt from "bcryptjs"

export const sellerRegister = async (req, res) => {

    const { name, email, phone, password, conformPassword, storeName, businessType, gstNumber, address } = req.body;

    const token = jwt.sign({ name, email, phone, password, conformPassword, storeName, businessType, gstNumber, address }, process.env.JWT_SECRET, { expiresIn: "3m" })
    try {

        const existingSeller = await sellerModel.findOne({ email })

        if (existingSeller) {
            return res.status(400).json({ message: "Seller already exists" });
        }

        res.cookie("sellerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3 * 60 * 1000, // 3 minutes
        })

        const otp = Math.floor(100000 + Math.random() * 900000).toString();



        const userAlreadyExists = await sellerOtpModel.findOne({ email: email });

        if (userAlreadyExists) {
            userAlreadyExists.otp = otp;
            userAlreadyExists.expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now
            await userAlreadyExists.save();

        }
        else {
            await sellerOtpModel.create({
                otp: otp,
                email: email,
                expiry: new Date(Date.now() + 3 * 60 * 1000) // 3 minutes from now
            })
        }

        transporter.sendMail({
            from: process.env.email,
            to: email,
            subject: "OTP for Seller Registration",
            html: `
                <!doctype html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <title>OTP for Seller Registration</title>
                    <style>
                        /* Basic resets */
                        body { background-color: #f4f6f8; margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
                        .container { max-width:600px; margin:24px auto; }
                        .card { background:#ffffff; border-radius:12px; padding:28px; box-shadow:0 6px 18px rgba(22,28,37,0.08); }
                        .logo { text-align:center; margin-bottom:18px; }
                        .title { color:#0f1724; font-size:20px; font-weight:700; text-align:center; margin-bottom:6px; }
                        .subtitle { color:#556070; font-size:14px; text-align:center; margin-bottom:20px; }
                        .otp { display:flex; justify-content:center; align-items:center; gap:12px; margin:22px 0; }
                        .otp-code { background:linear-gradient(90deg,#0ea5a4,#3b82f6); color:#fff; padding:14px 22px; border-radius:10px; font-size:26px; letter-spacing:4px; font-weight:700; }
                        .info { color:#556070; font-size:13px; text-align:center; margin-top:8px; }
                        .btn-verify { display:block; width:220px; margin:20px auto 0; text-decoration:none; background:#111827; color:#fff; padding:10px 14px; border-radius:8px; text-align:center; }
                        .small { color:#9aa3ad; font-size:12px; text-align:center; margin-top:18px; }
                        @media (max-width:420px){ .otp-code{ font-size:22px; padding:12px 18px; } .card{ padding:20px; } }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="logo">
                                <!-- Optionally replace with an inline logo image -->
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Your Brand">
                                    <rect width="24" height="24" rx="6" fill="#3b82f6" />
                                    <path d="M7 12l3 3 7-7" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div class="title">Verify your email</div>
                            <div class="subtitle">Use the code below to complete your seller registration.</div>

                            <div class="otp">
                                <div class="otp-code">${otp}</div>
                            </div>

                            <div class="info">This code is valid for 3 minutes. Do not share it with anyone.</div>

                            <a class="btn-verify" href="#">Enter OTP on the site</a>

                            <div class="small">If you didn't request this, you can ignore this email. For help, reply to this message.</div>
                        </div>
                    </div>
                </body>
                </html>
                `
        })

        res.status(200).json({ message: "OTP sent to email successfully" });

    } catch (error) {

        console.log(error.message);
    }

}

export const verifySellerOtp = async (req, res) => {

    const { otp } = req.body;

    try {

        const otpFetch = await sellerOtpModel.findOne({ email: req.seller.email, otp });

        if (!otpFetch) {
            return res.status(400).json({ message: "invalid otp" });
        }


        if (otpFetch.expiry < new Date()) {
            await sellerOtpModel.deleteOne({ otp });
            return res.status(400).json({ message: "otp expired" });
        }

        const hashedPassword = await bcrypt.hash(req.seller.password, 10);

        const storeData = await sellerModel.create({
            name: req.seller.name,
            email: req.seller.email,
            phone: req.seller.phone,
            password: hashedPassword,
            storeName: req.seller.storeName,
            businessType: req.seller.businessType,
            gstNumber: req.seller.gstNumber,
            address: req.seller.address,
        })

        const sellerAuthToken = jwt.sign({ id: storeData._id, email: storeData.email }, process.env.JWT_SECRET, { expiresIn: "3m" })

        res.cookie("sellerAuthToken", sellerAuthToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3 * 60 * 1000, // 3 minutes
        })

        await sellerOtpModel.deleteMany({ email: req.seller.email })

        res.status(201).json({ message: "Seller registered successfully", storeData });


    } catch (error) {
        console.log(error.message);
    }

}

export const sellerLogout = (req, res) => {
    res.clearCookie("sellerAuthToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({ message: "Seller logged out successfully" });
}