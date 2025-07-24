const { sql, poolPromise } = require("./db"); // Import the database connection

// ✅ Function to start a SQL Server Agent job
async function startJob(jobName) {
    try {
        const pool = await poolPromise; // Use the existing connection pool
        await pool.request()
            .input("jobName", sql.VarChar, jobName)
            .query(`EXEC msdb.dbo.sp_start_job @job_name = @jobName`);
        
        console.log(`✅ SQL Server Agent job '${jobName}' started successfully.`);
    } catch (err) {
        console.error("❌ Error starting job:", err);
    }
}

// ✅ Function to check job status
async function checkJobStatus(jobName) {
    try {
        const pool = await poolPromise; // Use the existing connection pool
        const result = await pool.request()
            .input("jobName", sql.VarChar, jobName)
            .query(`
                SELECT name, enabled, last_run_outcome, last_run_date, last_run_time
                FROM msdb.dbo.sysjobs
                WHERE name = @jobName
            `);

        console.log("📊 Job Status:", result.recordset);
        return result.recordset;
    } catch (err) {
        console.error("❌ Error checking job status:", err);
    }
}

module.exports = { startJob, checkJobStatus };
