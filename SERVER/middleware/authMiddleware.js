const jwt = require("jsonwebtoken")
const HttpError = require("../models/ErrorModel")

const authMiddleware = async (req, res, next) => {
    try {
        const Authorization = req.headers.Authorization || req.headers.authorization;

        if (!Authorization) {
            return next(new HttpError("Unauthorized. No token", 401));
        }

        if (!Authorization.startsWith("Bearer ")) {
            return next(new HttpError("Invalid token format", 401));
        }

        const token = Authorization.split(' ')[1];
        
        jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
            if (err) {
                return next(new HttpError("Unauthorized. Invalid token.", 401));
            }
            req.user = info;
            next();
        });
    } catch (error) {
        return next(new HttpError("Authentication failed", 401));
    }
};

module.exports = authMiddleware;