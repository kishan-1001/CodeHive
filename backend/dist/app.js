"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const execute_1 = __importDefault(require("./routes/execute"));
const posts_1 = __importDefault(require("./routes/posts"));
const problems_1 = __importDefault(require("./routes/problems"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/execute', execute_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/problems', problems_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});
exports.default = app;
