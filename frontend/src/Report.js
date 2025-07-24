import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Report.css";

const Report = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportData, setReportData] = useState([]);

    // Fetch report data based on date range
    const fetchReport = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/report", {
                startDate,
                endDate,
            });
            console.log("Fetched Report Data:", response.data);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report:", error);
        }
    };

    // Ensure data is loaded before printing
    const printReport = async () => {
        console.log("Fetching latest report before print...");
        
        await fetchReport(); // Fetch latest report data
    
        setTimeout(() => {
            console.log("Report Data Ready for Printing:", reportData);
            if (reportData.length === 0) {
                alert("No data available to print!");
                return;
            }
            window.print();
        }, 2000); // Give React time to update before printing
    };
    

    useEffect(() => {
        // Fetch initial report data
        axios.get("http://localhost:5000/api/reports")
            .then(response => {
                console.log("Fetched Initial Data:", response.data);
                setReportData(response.data);
            })
            .catch(error => {
                console.error("Error fetching report:", error);
            });
    }, []);

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Booking Report</h2>

            {/* Date Range Inputs */}
            <div style={{ marginBottom: "15px" }}>
                <label style={{ marginRight: "10px" }}>Start Date:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

                <label style={{ marginLeft: "20px", marginRight: "10px" }}>End Date:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            {/* Buttons */}
            <div style={{ marginBottom: "15px" }}>
                <button onClick={fetchReport} style={{ marginRight: "10px", padding: "8px 15px" }}>Get Report</button>
                <button onClick={printReport} style={{ padding: "8px 15px" }}>Print</button>
            </div>

            {/* Report Table */}
            {reportData.length > 0 ? (
                <div id="reportTable">
                <table border="1" style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
                            <th style={{ padding: "10px" }}>Booking ID</th>
                            <th style={{ padding: "10px" }}>Customer Name</th>
                            <th style={{ padding: "10px" }}>Seat Number</th>
                            <th style={{ padding: "10px" }}>Destination</th>
                            <th style={{ padding: "10px" }}>Booking Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => (
                            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                                <td style={{ padding: "10px" }}>{row.id}</td>
                                <td style={{ padding: "10px" }}>{row.full_name}</td>
                                <td style={{ padding: "10px" }}>{row.seat_number}</td>
                                <td style={{ padding: "10px" }}>{row.destination}</td>
                                <td style={{ padding: "10px" }}>{new Date(row.travelDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <p>No report data available.</p>
            )}
        </div>
    );
};

export default Report;
