require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const folderRoutes = require('./src/routes/folderRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const activityLogRoutes = require('./src/routes/activityLogRoutes');

const app = express();

const extraOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Native mobile apps often send no Origin header.
            const isLocal =
                !origin ||
                /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) ||
                /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/i.test(origin) ||
                /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/i.test(origin);

            const isAllowedExtra = extraOrigins.includes(origin) || extraOrigins.includes('*');

            if (isLocal || isAllowedExtra) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
);

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

app.get('/', (req, res) => {
    res.send('Secure Storage API Running');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'secure-storage-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', activityLogRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
