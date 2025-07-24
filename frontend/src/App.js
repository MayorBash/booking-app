import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Home from "./Home";
import Booking from "./Booking";
import Navbar from "./Navbar";
import Transfer from "./Transfer";
import Contact from "./Contact";
import Register from "./Register";
import Sidebar from "./Sidebar";
import ForgetPassword from "./ForgetPassword";
import ResetPassword from "./ResetPassword";
import Details from "./Details";
import Report from "./Report";



const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:7070/api"; // WildFly proxy

const fetchData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

function AppLayout({ children }) {
  const location = useLocation();
  const pagesWithSidebar = ["/booking", "/transfer", "/register", "/contact", "/report"];
  const showSidebar = pagesWithSidebar.includes(location.pathname);

  return (
    <div className="d-flex">
      {showSidebar && <Sidebar />}
      <div className="flex-grow-1 p-4">{children}</div>
    </div>
  );
}

const App = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  return (
    <HashRouter>
      <Navbar />
      {data && (
        <div>
          <h1>API Response:</h1>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      <AppLayout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/user-details" element={<Details />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
};

export default App;
