import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config";

const protectRoute = async (req, res, next) => {
    try {
        // get token
        // const token = req.headers("Authorization")?.replace("Bearer ", "");
        const token = req.headers.authorization && req.headers.authorization.startsWith("Bearer")
            ? req.headers.authorization.split(" ")[1]
            : null;

        if (!token) return res.status(401).json({ message: "No authentication token, access denied" });

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        

        // find user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) return res.status(401).json({ message: "Invalid Token!" });
        req.user = user;

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Authentication failed, invalid token!" });
    }
}

export default protectRoute;

