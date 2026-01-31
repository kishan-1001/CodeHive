import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';



export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("SERVER CONFIG ERROR: JWT_SECRET is missing.");
    }

    jwt.verify(token, secret, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: 'Token verification failed' });
        }
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

    const secret = process.env.JWT_SECRET;
    if (secret) {
        jwt.verify(token, secret, (err: any, user: any) => {
            if (!err) {
                req.user = user;
            }
            next();
        });
    } else {
        next();
    }
};
