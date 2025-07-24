function Validation(values) {
    let error = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Email validation
    if (!values.email) {
        error.email = "Email should not be empty.";
    } else if (!emailPattern.test(values.email)) {
        error.email = "Invalid email format.";
    } else {
        error.email = "";
    }

    // Password validation
    if (!values.password) {
        error.password = "Password should not be empty.";
    } else {
        error.password = "";
    }

    return error;
}

export default Validation;
