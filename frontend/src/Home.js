import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';  // Import the CSS file for styling


function Home() {
  
    return (
      <div className="d-flex justify-content-center mt-5">

        <div className="box-container">
            <Link to="/register" className="box">
                <h3>Register</h3>
                <p>Do your registration here</p>
            </Link>
            <Link to="/booking" className="box">
                <h3>Booking</h3>
                <p>Book your transport here</p>
            </Link>
            <Link to="/transfer" className="box">
                <h3>Transfer</h3>
                <p>Transfer your money here</p>
            </Link>
            <Link to="/contact" className="box">
                <h3>Contact</h3>
                <p>Get in touch with us</p>
            </Link>
            <Link to="/report" className="box">
                <h3>Report</h3>
                <p>Get your report</p>
            </Link>
        </div>

        </div>
    );
}

export default Home;
