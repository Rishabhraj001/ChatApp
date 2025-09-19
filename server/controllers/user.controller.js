import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const Signup = async (req, res) => {
    console.log("Hii")
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.json({ success: false, message: "Please provide all the fields" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "account already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });
        const token = generateToken(newUser._id);
        return res.json({ success: true, message: "User registered successfully", token });
    } catch (err) {
        console.log(err.message)
        res.json({ success: false, message: err.message })
    }
}
export const Login = async (req, res) => {
    
    const { email, password } = req.body;
    
    try {
        
        if (!email || !password) {
            return res.json({ success: false, message: "Please provide all the fields" });
        }
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        const token = generateToken(userData._id);
        return res.json({ success: true, userData, message: "Login successful", token });
    } catch (err) {
        console.log(err.message)
        res.json({ success: false, message: err.message })
    }
}

export const checkAuth = async (req, res) => {
    return res.json({ success: true, user: req.user });
};


export const updateProfile = async (req, res) => {
    try {
        
        const { profilepic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;
        if (!profilepic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName },
                { new: true });
        } else {
            const upload = await cloudinary.uploader.upload(profilepic);
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName, profilePic: upload.secure_url },
                { new: true });
        }
        return res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        console.log(err.message)
        res.json({ success: false, message: err.message })
    }
}