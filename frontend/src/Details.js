import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Details.css";

const Details = () => {
    const [user, setUser] = useState(null);
    const email = localStorage.getItem("userEmail"); // Get email from localStorage

    useEffect(() => {
        console.log("Email from localStorage:", email);  // Log email to confirm it's being retrieved

        if (email) {
            // Fetch user details if email is present
            axios.post("http://localhost:5000/user-details", { email })
                .then((res) => {
                    console.log("User details fetched:", res.data);  // Log the response data
                    setUser(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching user details:", err);
                });
        } else {
            console.log("No email found in localStorage");  // Log if email is not found
        }
    }, [email]);

    const handlePrint = () => {
        const printButton = document.getElementById("printButton");
        printButton.style.display = "none";
        window.print();
        setTimeout(() => {
            printButton.style.display = "block";
        }, 500);
    };

    if (!user) {
        return <p>Loading user details...</p>;
    }

    return (
        <div className="card p-3">
            <h2>User Details</h2>
            <p><strong>First Name:</strong> {user.first_name}</p>
            <p><strong>Last Name:</strong> {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Age:</strong> {user.age}</p>
            <p><strong>Gender:</strong> {user.gender}</p>
            <p><strong>Address:</strong> {user.address}</p>
            <p><strong>Mobile:</strong> {user.mobile_number}</p>
            <p><strong>Country:</strong> {user.country}</p>

            {/* Print Button */}
            <button id="printButton" onClick={handlePrint}>Print Details</button>
        </div>
    );
};

export default Details;
