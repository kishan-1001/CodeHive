import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Middleware that recursively sanitizes strings in req.body to prevent XSS attacks.
 */
export const xssSanitize = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    next();
};

const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
        if (typeof obj === 'string') {
            return xss(obj);
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key === 'code') {
                sanitized[key] = obj[key];
            } else {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
    }
    return sanitized;
};
