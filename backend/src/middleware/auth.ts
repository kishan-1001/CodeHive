import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';



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

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('Middleware: Verifying with secret:', secret);
    jwt.verify(token, secret, (err: any, user: any) => {
        if (err) {
            console.log('JWT Verify Error:', err);
            return res.status(403).json({ message: 'Token verification failed: ' + err.message });
        }
        console.log('User authenticated:', user);
        req.user = user;
        next();
    });
};

export const optionalAuthenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    jwt.verify(token, secret, (err: any, user: any) => {
        if (!err) {
            req.user = user;
        }
        next();
    });
};
