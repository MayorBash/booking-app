import React from "react";
import { Link} from "react-router-dom";

function Navbar() {
    // const navigate = useNavigate();

    const handleLogout = () => {
        // Clear user details from localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("userEmail");
        window.location.replace("/login");

        // // Redirect to the login page (or home page if preferred)
        // navigate("/login"); // Change this to your desired route (e.g., "/login")
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Success</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <button className="nav-link btn" onClick={handleLogout}>Log Out</button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
