export const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return null;
};

export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
};

export const validateRequired = (value, fieldName) => {
    if (!value || String(value).trim() === '') return `${fieldName} is required`;
    return null;
};

export const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(phone)) return 'Invalid phone number format';
    return null;
};
