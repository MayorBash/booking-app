import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    date_of_birth: '',
    email: '',
    gender: '',
    address: '',
    mobile_number: '',
    country: ''
  });

  const [countries, setCountries] = useState([]); // Store countries from DB
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/countries')
      .then(response => setCountries(response.data))
      .catch(error => console.error('Error fetching countries:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile_number") {
      if (!/^[0-9]*$/.test(value)) return; // Prevent non-numeric characters
      if (value.length > 15) return; // Limit max length
    }

    if (name === "date_of_birth") {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prevData => ({ ...prevData, date_of_birth: value, age: age.toString() }));
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.mobile_number.length < 10) {
      setErrorMessage('Mobile number must be at least 10 digits long.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/register', formData);
      if (response.status === 201) {
        setSuccessMessage('Registration successful!');
        setFormData({
          first_name: '', last_name: '', age: '', date_of_birth: '', email: '',
          gender: '', address: '', mobile_number: '', country: ''
        });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setErrorMessage('User not found. Please sign up first.');
        } else if (error.response.status === 400) {
          setErrorMessage('User is already registered.');
        } else {
          setErrorMessage('Registration failed. Please try again.');
        }
      } else {
        setErrorMessage('Registration failed due to a network issue.');
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">First Name</label>
            <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Last Name</label>
            <input type="text" name="last_name" className="form-control" value={formData.last_name} onChange={handleChange} required />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Date of Birth</label>
            <input type="date" name="date_of_birth" className="form-control" value={formData.date_of_birth} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Age</label>
            <input type="number" name="age" className="form-control" value={formData.age} readOnly />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Gender</label>
          <select name="gender" className="form-control" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Mobile Number</label>
          <input type="text" name="mobile_number" className="form-control" value={formData.mobile_number} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Country</label>
          <select name="country" className="form-control" value={formData.country} onChange={handleChange} required>
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.name}>{country.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100">Register</button>
      </form>

      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
    </div>
  );
};

export default Register;
