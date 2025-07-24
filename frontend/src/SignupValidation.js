function Validation(values) {
    let error = {};
    const email_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    // First Name Validation
    if (values.first_name === "") {
        error.first_name = "First Name should not be empty";
    } else {
        error.first_name = "";
    }

    // Last Name Validation
    if (values.last_name === "") {
        error.last_name = "Last Name should not be empty";
    } else {
        error.last_name = "";
    }

    // Email Validation
    if (values.email === "") {
        error.email = "Email should not be empty";
    } else if (!email_pattern.test(values.email)) {
        error.email = "Email format is incorrect";
    } else {
        error.email = "";
    }

    // Password Validation
    if (values.password === "") {
        error.password = "Password should not be empty";
    } else if (!password_pattern.test(values.password)) {
        error.password = "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character";
    } else {
        error.password = "";
    }

    return error;
}

export default Validation;
