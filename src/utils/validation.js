/**
 * Format error message from API response
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error status
    const { data, status } = error.response;

    switch (status) {
      case 400:
        return data?.message || "Dữ liệu không hợp lệ";
      case 401:
        return "Thông tin đăng nhập không chính xác";
      case 403:
        return "Bạn không có quyền truy cập";
      case 404:
        return "Không tìm thấy dữ liệu";
      case 409:
        return data?.message || "Email hoặc số điện thoại đã tồn tại";
      case 500:
        return "Lỗi máy chủ, vui lòng thử lại sau";
      default:
        return data?.message || "Có lỗi xảy ra, vui lòng thử lại";
    }
  } else if (error.request) {
    // Request was made but no response
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
  } else {
    // Something else happened
    return error.message || "Có lỗi xảy ra";
  }
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Vietnamese phone number (10 digits)
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ hoa");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 số");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
