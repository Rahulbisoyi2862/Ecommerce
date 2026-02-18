
import jwt from 'jsonwebtoken';

export const tokenChecker = (req, res, next) => {
    const token = req.cookies.sellerToken;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized Seller" });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.seller = decoded;

        next();

    } catch (error) {

        console.log(error.message);
        
    }
}