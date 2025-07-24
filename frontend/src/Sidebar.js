import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css"; // Optional for additional custom styles

function Sidebar() {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        // Retrieve user name from localStorage
        const storedName = localStorage.getItem("userFullName");
        if (storedName) {
            setUserName(storedName);
        }
    }, []);

    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div className="sidebar bg-primary text-white vh-100 p-3">
                {userName && <h4 className="mb-4">{userName}</h4>}
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link to="/home" className="nav-link text-white">
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/user-details" className="nav-link text-white">
                            Registration Details
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
