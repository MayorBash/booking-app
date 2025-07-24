import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./Booking.css";

function Booking() {
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [destination, setDestination] = useState("");
    const [travelDate, setTravelDate] = useState("");
    const [departure, setDeparture] = useState("");
    // const [transportType, setTransportType] = useState("bus"); // Default transport type
    const [availableSeats, setAvailableSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [destinations, setDestinations] = useState([]);
    const [message, setMessage] = useState("");
    const [timer, setTimer] = useState(0);
    const [bookingDetails, setBookingDetails] = useState(null);
    const ticketRef = useRef();

    const calculateRemainingTime = () => {
        if (!travelDate || !departure) return 0;
        const now = new Date();
        const departureDateTime = new Date(`${travelDate}T${departure}`);
        const remainingTime = departureDateTime - now;
        return remainingTime > 0 ? Math.floor(remainingTime / 1000) : 0;  // Return time in seconds
    };

    useEffect(() => {
        const fetchUserId = async () => {
            const userEmail = localStorage.getItem("userEmail");
            if (userEmail) {
                try {
                    const response = await axios.post("http://localhost:5000/user-details", { email: userEmail });
                    setUserId(response.data.user_id);
                    setUserName(`${response.data.first_name} ${response.data.last_name}`);
                } catch (err) {
                    setMessage("Error fetching user details.");
                }
            } else {
                setMessage("Please log in.");
            }
        };
        fetchUserId();
    }, []);

    const fetchAvailableSeats = useCallback(async () => {
        if (!travelDate || !departure || !destination) {
            setMessage("Please select all fields before fetching seats.");
            return;
        }
    
        console.log("Fetching seats for:", { travelDate, departure, destination });
    
        try {
            const res = await axios.get("http://localhost:5000/api/available-seats", {
                params: { travelDate, departure, destination }
            });
    
            setAvailableSeats(res.data);
        } catch (err) {
            console.error("Error fetching seats:", err.response?.data || err.message);
            setMessage(err.response?.data?.error || "Error fetching seats.");
        }
    }, [travelDate, departure, destination]);
    
    
    
    useEffect(() => {
        if (travelDate && departure && destination) {
            fetchAvailableSeats();
        }
    }, [travelDate, departure, destination, fetchAvailableSeats]);
    
    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/destinations");
                setDestinations(res.data);
            } catch (err) {
                setMessage("Error fetching destinations.");
            }
        };
        fetchDestinations();
    }, []);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setSelectedSeat(null);
        }
    }, [timer]);

    const reserveSeat = async (seat) => {
        if (!seat || !travelDate || !departure || !destination) {
            alert("Missing reservation details. Please check your inputs.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/reserve-seat", {
                seat_number: seat,
                travelDate,
                departure,
                destination,
                user_id: userId
            });

            if (res.status === 200) {
                setSelectedSeat(seat);
                setTimer(calculateRemainingTime());
                fetchAvailableSeats();
            }
        } catch (err) {
            console.error("Reservation error:", err.response?.data || err.message);
            alert("Seat is already reserved or booked!");
        }
    };

    const handleTravelDateChange = (e) => {
        const selectedDate = e.target.value;
        const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    
        if (selectedDate < today) {
            setMessage("You cannot select a past date.");
            return;
        }
    
        setMessage(""); // Clear any previous error messages
        setTravelDate(selectedDate);
    };
    
    const handleDepartureChange = (e) => {
        const selectedTime = e.target.value;
        const formattedTime = selectedTime.length === 8 ? selectedTime : `${selectedTime}:00`; // Ensure HH:MM:SS format
    
        const now = new Date();
        const selectedDateTime = new Date(`${travelDate}T${formattedTime}`);
        
        if (travelDate === now.toISOString().split("T")[0] && selectedDateTime < now) {
            setMessage("You cannot select a past departure time.");
            return;
        }
    
        setMessage(""); // Clear any previous error messages
        setDeparture(formattedTime);
    };
    
      

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId || !destination || !travelDate || !selectedSeat || !departure) {
        setMessage("Please fill in all fields.");
        return;
    }

    try {
        const response = await axios.post("http://localhost:5000/api/book-transport", {
            user_id: userId,
            // transport_type: transportType, // Include transportType here
            destination,
            travelDate,
            seat_number: selectedSeat,
            departure
        });

        if (response.status === 201) {
            setMessage(`Booking successful! Seat ${selectedSeat} confirmed.`);
            setSelectedSeat(null);
            setTimer(0);
            fetchAvailableSeats();

            setBookingDetails({
                seat_number: selectedSeat,
                destination,
                travelDate,
                departure,
                user_name: userName
            });
        }
    } catch (err) {
        setMessage("Booking failed.");
    }
};

    return (
        <div className="container mt-5">
            <h2>Book Transport</h2>

            {message && <p className="error-message">{message}</p>}


            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label><strong>Destination</strong></label>
                    <select className="form-control" value={destination} onChange={(e) => setDestination(e.target.value)}>
                        <option value="">Select Destination</option>
                        {destinations.map((dest, index) => (
                            <option key={index} value={dest}>{dest}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label><strong>Travel Date</strong></label>
                    <input type="date" className="form-control" value={travelDate} onChange={handleTravelDateChange} />
                </div>

                <div className="mb-3">
                    <label><strong>Departure</strong></label>
                    <select className="form-control" value={departure} onChange={handleDepartureChange}>
                     <option value="">Select Departure</option>
                     <option value="06:00:00">Morning (6 AM)</option>
                     <option value="14:00:00">Afternoon (2 PM)</option>
                     <option value="21:00:00">Evening (9 PM)</option>
                    </select>

                </div>

                <div className="mb-3">
                    <label><strong>Select a Seat</strong></label>
                    <div className="seats">
                        {availableSeats.length > 0 ? (
                            availableSeats.map((seat) => (
                                <button
                                    key={seat}
                                    className={`seat-btn ${seat === selectedSeat ? "selected" : ""}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        reserveSeat(seat);
                                    }}
                                >
                                    {seat}
                                </button>
                            ))
                          ) : (
                            <p>No seats available or departure time is invalid.</p>
                        )}
                    </div>
                </div>

                {selectedSeat && (
                    <div className="reservation-timer">
                        <p>Seat {selectedSeat} reserved. Confirm within {Math.floor(timer / 60)}:{timer % 60} min</p>
                    </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={!selectedSeat || timer === 0}>
                    Book Now
                </button>
            </form>

            {bookingDetails && (
    <div ref={ticketRef} className="ticket">
        <h3>Transport Ticket</h3>
        <p><strong>Name:</strong> {bookingDetails.user_name}</p>
        <p><strong>Seat:</strong> {bookingDetails.seat_number}</p>
        <p><strong>Destination:</strong> {bookingDetails.destination}</p>
        <p><strong>Travel Date:</strong> {bookingDetails.travelDate}</p>
        <p><strong>Departure:</strong> {bookingDetails.departure}</p>
        <button
            onClick={() => {
                // Adding a slight delay to ensure the ticket content is rendered
                setTimeout(() => window.print(), 200);
            }}
            className="btn btn-secondary"
        >
            Print Ticket
        </button>
    </div>
)}

        </div>
    );
}

export default Booking;
