import React, { useState } from "react";
import axios from "axios";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validation: Check if all fields are filled
    if (!formData.name || !formData.email || !formData.mobile || !formData.message) {
      setError("Please fill in all fields.");
      return;
    }

    // Validate mobile number (simple check for 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/contact", formData);
      if (response.status === 200) {
        setSubmitted(true);
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      {submitted ? (
        <p className="success-message">Thank you! Your message has been sent.</p>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />

          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />

          <label>Mobile Number:</label>
          <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter your mobile number" required />

          <label>Message:</label>
          <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your message" required></textarea>

          <button type="submit">Submit</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default Contact;
