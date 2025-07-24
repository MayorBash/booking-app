import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Validation from "./LoginValidation";

function Login() {
    const [values, setValues] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const err = Validation(values);
        setErrors(err);

        if (!err.email && !err.password) {
            axios
                .post("http://localhost:5000/login", values)
                .then((res) => {
                    if (res.status === 200) {
                        // Save the JWT token in localStorage
                        localStorage.setItem("authToken", res.data.token); // ✅ Store token in localStorage
                        
                        // Save the email in localStorage
                        localStorage.setItem("userEmail", values.email); // Store email in localStorage

                        navigate("/home");  // Redirect to home or dashboard
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.error("Login error:", err.response?.data || err.message);
                    alert(err.response?.data?.message || "An error occurred during login.");
                });
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-primary vh-100">
            <div className="bg-white p-3 rounded w-25">
                <h2>Sign-In</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email"><strong>Email</strong></label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            name="email"
                            onChange={handleInput}
                            className="form-control rounded-0"
                        />
                        {errors.email && <span className="text-danger">{errors.email}</span>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password"><strong>Password</strong></label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            name="password"
                            onChange={handleInput}
                            className="form-control rounded-0"
                        />
                        {errors.password && <span className="text-danger">{errors.password}</span>}
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-0"><strong>Log in</strong></button>
                    <p>You have to Agree to our Terms and Policies</p>
                    <Link to="/forget-password" className="text-decoration-none">Forget Password</Link>
                    <Link to="/signup" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">Create Account</Link>
                </form>
            </div>
        </div>
    );
}

export default Login;
