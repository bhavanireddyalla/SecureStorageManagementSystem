require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),

    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const connectDB = async () => {
    try {
        const pool = await sql.connect(config);
        console.log("✅ Connected to MSSQL Database successfully!");
        return pool;
    }
    catch(err) {
        console.error("❌ Database Connection Failed:");
        console.error(err.message);
        throw err;
    }
};

module.exports = {
    connectDB,
    sql
};