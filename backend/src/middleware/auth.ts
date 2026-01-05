import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    console.log('Auth Header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No token found in header');
        return res.sendStatus(401);
    }

    console.log('Middleware: Verifying with secret:', JWT_SECRET);
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.log('JWT Verify Error:', err);
            return res.sendStatus(403);
        }
        console.log('User authenticated:', user);
        req.user = user;
        next();
    });
};
