const sql = require("mssql");

// ✅ Database Configuration (Ensure `.env` file exists)
const dbConfig = {
  server: process.env.DB_SERVER, 
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true,
  },
};

// ✅ Create a connection pool and connect to the database
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then((pool) => {
        console.log("✅ Connected to SQL Server");
        return pool;
    })
    .catch((err) => {
        console.error("❌ Database Connection Error:", err);
        process.exit(1); // Exit app if DB fails
    });

module.exports = {
    sql,
    poolPromise,
};
