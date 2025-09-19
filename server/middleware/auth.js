
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protectRoute = async (req, res, next) => {

    try {
        
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized: Missing or invalid token format." });
        }

        const token = authHeader.split(" ")[1];
       
        if (!token) {
             
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "user not found" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
