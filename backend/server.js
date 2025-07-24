require("dotenv").config(); // ✅ Load environment variables at the start
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cors = require("cors");
const { sql, poolPromise } = require("./db"); // Import database connection
const { startJob, checkJobStatus } = require("./jobs");

const app = express();

// ✅ Enable CORS for Frontend

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || origin.startsWith("http://localhost")) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: "GET,POST,PUT,DELETE",
        allowedHeaders: "Content-Type,Authorization",
    })
);


app.use(express.json());

// ✅ Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL_USER, // ✅ Use environment variables
      pass: process.env.EMAIL_PASS  // ✅ Use App Password (not plain text)
  }
});


// API to start a job
app.get("/start-job/:jobName", async (req, res) => {
    try {
        const jobName = req.params.jobName;
        await startJob(jobName);
        res.send(`Job '${jobName}' started.`);
    } catch (error) {
        res.status(500).send("Error starting job.");
    }
});

// API to check job status
app.get("/job-status/:jobName", async (req, res) => {
    try {
        const jobName = req.params.jobName;
        const status = await checkJobStatus(jobName);
        res.json(status);
    } catch (error) {
        res.status(500).send("Error checking job status.");
    }
});

// 🚀 **Signup Route**
app.post("/signup", async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const pool = await poolPromise; // ✅ Ensure connection is ready
        const hashedPassword = await bcrypt.hash(password, 10);

        const sqlQuery = `
            INSERT INTO login (first_name, last_name, email, password) 
            VALUES (@first_name, @last_name, @email, @password);
        `;

        const request = pool.request(); // ✅ Use `pool.request()`
        request.input("first_name", sql.NVarChar, first_name);
        request.input("last_name", sql.NVarChar, last_name);
        request.input("email", sql.NVarChar, email);
        request.input("password", sql.NVarChar, hashedPassword);

        await request.query(sqlQuery);

        res.status(201).json({ message: "User signed up successfully" });
    } catch (err) {
        console.error("❌ Signup Error:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// 🚀 **Login Route**
app.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      // Ensure all fields are provided
      if (!email || !password) {
          return res.status(400).json({ error: "Email and password are required" });
      }

      // Get database connection
      const pool = await poolPromise; // ✅ Use poolPromise

      // SQL Query
      const query = "SELECT * FROM login WHERE email = @email";

      // Execute Query
      const result = await pool.request()
          .input("email", sql.NVarChar, email)
          .query(query);

      // Check if user exists
      if (result.recordset.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }

      const user = result.recordset[0];

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT Token
      const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET, // ✅ Ensure this is defined in `.env`
          { expiresIn: "1h" }
      );

      res.status(200).json({ message: "Login successful", token });

  } catch (err) {
      console.error("❌ Database query error:", err);
      res.status(500).json({ error: "Database error", details: err.message });
  }
});

// 🚀 **Register Route**
app.post("/register", async (req, res) => {
  const { email, age, date_of_birth, gender, address, mobile_number, country } = req.body;

  if (!email || !mobile_number) {
      return res.status(400).json({ error: "Email and mobile number are required" });
  }

  try {
      const pool = await poolPromise;

      // 1️⃣ Check if the email exists in the login table and get user details
      let loginUser = await pool.request()
          .input("email", sql.VarChar, email)
          .query("SELECT id, first_name, last_name, email FROM login WHERE email = @email");

      if (loginUser.recordset.length === 0) {
          return res.status(400).json({ error: "Email not found. Please sign up first." });
      }

      const user_id = loginUser.recordset[0].id;
      const first_name = loginUser.recordset[0].first_name;
      const last_name = loginUser.recordset[0].last_name;
      const login_email = loginUser.recordset[0].email; // Fetching email from login table

      // 2️⃣ Check if the user is already registered
      let checkUser = await pool.request()
          .input("user_id", sql.Int, user_id)
          .query("SELECT * FROM register WHERE user_id = @user_id");

      if (checkUser.recordset.length > 0) {
          return res.status(400).json({ error: "User is already registered." });
      }

      // 3️⃣ Insert new user details into the register table, including email
      await pool.request()
          .input("user_id", sql.Int, user_id) // Foreign key reference
          .input("first_name", sql.VarChar, first_name) // Retrieved from login table
          .input("last_name", sql.VarChar, last_name) // Retrieved from login table
          .input("email", sql.VarChar, login_email) // Retrieved from login table
          .input("age", sql.Int, age)
          .input("date_of_birth", sql.Date, date_of_birth)
          .input("gender", sql.VarChar, gender)
          .input("address", sql.VarChar, address)
          .input("mobile_number", sql.VarChar, mobile_number)
          .input("country", sql.VarChar, country)
          .query(`INSERT INTO register (user_id, first_name, last_name, email, age, date_of_birth, gender, address, mobile_number, country) 
                  VALUES (@user_id, @first_name, @last_name, @email, @age, @date_of_birth, @gender, @address, @mobile_number, @country)`);

      res.status(201).json({ message: "Registration successful", userId: user_id });

  } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error" });
  }
});



// 🚀 Fetch countries list for dropdown (MSSQL)
app.get("/api/countries", async (req, res) => {
  try {
      const pool = await poolPromise; // ✅ Get the database connection
      const result = await pool.request().query("SELECT id, name FROM countries");
      res.json(result.recordset);
  } catch (err) {
      console.error("❌ Error fetching countries:", err);
      res.status(500).json({ error: "Database error", details: err.message });
  }
});


app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(400).json({ message: "Email is required" });
  }

  try {
      const pool = await poolPromise;

      // Check if email exists
      let user = await pool.request()
          .input("email", sql.VarChar, email)
          .query("SELECT id FROM login WHERE email = @email");

      if (user.recordset.length === 0) {
          return res.status(404).json({ message: "Email not found" });
      }

      // Generate reset token
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

      // Reset link
      const resetLink = `http://localhost:3000/reset-password/${token}`;

      // Send email
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Password Reset",
          text: `Click this link to reset your password: ${resetLink}`
      };

      transporter.sendMail(mailOptions, (error) => {
          if (error) {
              console.error("Email sending error:", error);
              return res.status(500).json({ message: "Failed to send email" });
          }
          res.json({ message: "Password reset link sent to your email" });
      });

  } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database error" });
  }
});

// ✅ Correct Reset Password Route
app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
  }

  try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password in DB
      const pool = await poolPromise;
      await pool.request()
          .input("email", sql.VarChar, email)
          .input("password", sql.VarChar, hashedPassword)
          .query("UPDATE login SET password = @password WHERE email = @email");

      res.json({ message: "Password reset successful", success: true });

  } catch (err) {
      console.error("Error resetting password:", err);
      return res.status(400).json({ message: "Invalid or expired token" });
  }
});

// ✅ Fetch user by ID (for sidebar)
app.get("/api/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
      const pool = await poolPromise;

      const sql = "SELECT first_name, last_name FROM register WHERE user_id = @user_id";
      const result = await pool.request()
          .input("user_id", sql.Int, userId)
          .query(sql);

      if (result.recordset.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }

      const fullName = `${result.recordset[0].first_name} ${result.recordset[0].last_name}`;
      res.json({ fullName });

  } catch (err) {
      console.error("Error fetching user data:", err);
      res.status(500).json({ error: "Database error" });
  }
});

// ✅ Fetch user details by email
app.post("/user-details", async (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(400).json({ error: "Email is required" });
  }

  try {
      const pool = await poolPromise; // Ensure DB connection exists

      const sqlQuery = `
          SELECT l.email, r.first_name, r.last_name, r.age, r.gender, r.address, r.mobile_number, r.country, r.user_id
          FROM register r
          JOIN login l ON r.user_id = l.id
          WHERE l.email = @email;
      `;

      const request = pool.request();
      request.input("email", sql.NVarChar, email);

      const result = await request.query(sqlQuery);

      if (result.recordset.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(result.recordset[0]);

  } catch (err) {
      console.error("❌ Database error:", err.message);
      res.status(500).json({ error: "Database error", details: err.message });
  }
});


// Available Seats
app.get("/api/available-seats", async (req, res) => {
  const { travelDate, departure, destination } = req.query;

  console.log("🔹 Incoming Request:", { travelDate, departure, destination });

  if (!travelDate || !departure || !destination) {
      return res.status(400).json({ error: "Missing required parameters" });
  }

  const sqlQuery = `
      SELECT seat_number 
      FROM booking 
      WHERE CAST(travelDate AS DATE) = @travelDate 
      AND CAST(departure AS VARCHAR) = @departure
      AND destination = @destination
      AND status IN ('reserved', 'booked')
  `;

  try {
      const pool = await poolPromise;
      const result = await pool
          .request()
          .input("travelDate", sql.NVarChar, travelDate)
          .input("departure", sql.NVarChar, departure)
          .input("destination", sql.NVarChar, destination)
          .query(sqlQuery);

      console.log("🔹 Query Result:", result.recordset);

      const allSeats = Array.from({ length: 30 }, (_, i) => i + 1);
      const bookedSeats = result.recordset.map(seat => seat.seat_number);
      const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));

      res.json(availableSeats);
  } catch (error) {
      console.error("❌ Database Query Error:", error);
      res.status(500).json({ error: "Database query failed" });
  }
});





//Reserve Seats
app.post("/api/reserve-seat", async (req, res) => {
  const { seat_number, travelDate, departure, destination, user_id } = req.body;

  if (!seat_number || !travelDate || !departure || !destination || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const pool = await poolPromise;
      const result = await pool.request()
          .input("seat_number", sql.Int, seat_number)
          .input("travelDate", sql.Date, travelDate)
          .input("departure", sql.VarChar, departure)
          .input("destination", sql.VarChar, destination)
          .input("user_id", sql.Int, user_id)
          .query(`
              INSERT INTO booking (seat_number, user_id, travelDate, departure, destination, status)
              VALUES (@seat_number, @user_id, @travelDate, @departure, @destination, 'reserved')
          `);

      res.status(200).json({ message: "Seat reserved successfully" });
  } catch (error) {
      console.error("❌ SQL Error:", error);
      res.status(500).json({ error: "Database error" });
  }
});



//Book Transport
app.post("/api/book-transport", async (req, res) => {
  const { user_id, seat_number, travelDate, departure, destination } = req.body;

  if (!user_id || !seat_number || !travelDate || !departure || !destination) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const pool = await poolPromise;

      // Update the seat status to 'booked'
      const result = await pool.request()
          .input("user_id", sql.Int, user_id)
          .input("seat_number", sql.Int, seat_number)
          .input("travelDate", sql.Date, travelDate)
          .input("departure", sql.VarChar, departure)
          .input("destination", sql.VarChar, destination)
          .query(`
              UPDATE booking 
              SET status = 'booked', user_id = @user_id, reserved_until = NULL 
              WHERE seat_number = @seat_number 
              AND travelDate = @travelDate 
              AND departure = @departure 
              AND destination = @destination 
              AND status = 'reserved'
          `);

      if (result.rowsAffected[0] === 0) {
          return res.status(400).json({ error: "Seat is not reserved or already booked" });
      }

      res.status(201).json({ message: "Seat booked successfully" });
  } catch (err) {
      console.error("Error booking seat:", err);
      res.status(500).json({ error: "Could not book seat" });
  }
});


//Fetch Destination
app.get("/api/destinations", async (req, res) => {
  try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT name FROM countries");

      res.json(result.recordset.map(row => row.name));
  } catch (err) {
      console.error("Error fetching destinations:", err);
      res.status(500).json({ error: "Database error" });
  }
});



app.post("/contact", async (req, res) => {
    const { name, email, mobile, message } = req.body;

    // 🔹 Validation
    if (!name || !email || !mobile || !message) {
        return res.status(400).json({ error: "Please fill all fields" });
    }

    // 🔹 Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    // 🔹 Validate mobile number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobile)) {
        return res.status(400).json({ error: "Invalid mobile number. Must be 10 digits." });
    }

    try {
        // 🔹 Set up Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,  // Sender's email
                pass: process.env.EMAIL_PASS,  // App-specific password
            },
        });

        // 🔹 Email details
        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.EMAIL_USER, // Admin/support email
            subject: `Support Request from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\nMessage: ${message}`,
        };

        // 🔹 Send email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Message sent successfully!" });

    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send message. Please try again later." });
    }
});


// 📌 Endpoint to get the report based on date range
app.post("/api/report", async (req, res) => {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Missing required parameters." });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("startDate", sql.Date, startDate)
            .input("endDate", sql.Date, endDate)
            .query(`
                SELECT b.id, r.full_name, b.seat_number, b.destination, b.travelDate 
                FROM booking b
                JOIN register r ON b.USER_ID = r.USER_ID
                WHERE b.travelDate BETWEEN @startDate AND @endDate
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("❌ Error fetching report:", error);
        res.status(500).json({ error: "Failed to fetch report." });
    }
});





// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
