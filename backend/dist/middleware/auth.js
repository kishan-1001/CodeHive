"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Auth Header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('No token found in header');
        return res.sendStatus(401);
    }
    console.log('Middleware: Verifying with secret:', JWT_SECRET);
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('JWT Verify Error:', err);
            return res.sendStatus(403);
        }
        console.log('User authenticated:', user);
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
