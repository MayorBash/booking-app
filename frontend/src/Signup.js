import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Validation from "./SignupValidation";

function Signup() {
    const [values, setValues] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const err = Validation(values);
        setErrors(err);

        if (!err.first_name && !err.last_name && !err.email && !err.password) {
            axios
                .post("http://localhost:5000/signup", values)
                .then((res) => {
                    alert(res.data.message || "Signup successful!");
                    navigate("/");
                })
                .catch((err) => {
                    console.error("Signup error:", err.response?.data || err.message);
                    alert(err.response?.data?.error || "An error occurred during signup.");
                });
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-primary vh-100">
            <div className="bg-white p-3 rounded w-25">
                <h2>Sign-Up</h2>
                <form onSubmit={handleSubmit}>
                    {/* First Name Input */}
                    <div className="mb-3">
                        <label htmlFor="first_name"><strong>First Name</strong></label>
                        <input
                            type="text"
                            placeholder="Enter First Name"
                            name="first_name"
                            onChange={handleInput}
                            className="form-control rounded-0"
                        />
                        {errors.first_name && <span className="text-danger">{errors.first_name}</span>}
                    </div>

                    {/* Last Name Input */}
                    <div className="mb-3">
                        <label htmlFor="last_name"><strong>Last Name</strong></label>
                        <input
                            type="text"
                            placeholder="Enter Last Name"
                            name="last_name"
                            onChange={handleInput}
                            className="form-control rounded-0"
                        />
                        {errors.last_name && <span className="text-danger">{errors.last_name}</span>}
                    </div>

                    {/* Email Input */}
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

                    {/* Password Input */}
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

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-success w-100 rounded-0"><strong>Sign up</strong></button>
                    <p>You have to Agree to our Terms and Policies</p>

                    {/* Login Link */}
                    <Link to="/" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">Login</Link>
                </form>
            </div>
        </div>
    );
}

export default Signup;
