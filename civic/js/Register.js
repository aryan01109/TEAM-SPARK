// Register form functionality
document.addEventListener('DOMContentLoaded', function() {
  // Clear any existing auth data when page loads
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }

  const registerForm = document.getElementById('registerForm');
  const roleSelect = document.getElementById('role');
  const userFields = document.getElementById('userFields');
  const adminFields = document.getElementById('adminFields');
  const submitBtn = document.getElementById('submitBtn');
  const messageDiv = document.getElementById('message');

  // Toggle fields based on role selection
  roleSelect.addEventListener('change', function() {
    if (this.value === 'Admin') {
      userFields.style.display = 'none';
      adminFields.style.display = 'block';
    } else {
      userFields.style.display = 'block';
      adminFields.style.display = 'none';
    }
  });

  // Handle form submission
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const role = document.getElementById('role').value;
    const fullName = document.getElementById('fullName').value;
    const identifier = document.getElementById('identifier').value;
    const adminEmail = document.getElementById('adminEmail').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;
    const govId = document.getElementById('govId').value;
    const department = document.getElementById('department').value;
    const securityCode = document.getElementById('securityCode').value;

    // Validate form
    const errors = validateForm(role, fullName, identifier, adminEmail, password, confirm, govId);
    
    if (Object.keys(errors).length > 0) {
      displayErrors(errors);
      return;
    }

    // Clear previous messages and show loading state
    hideMessage();
    disableSubmit(true);

    try {
      // Simulate API call - in a real app, this would be an actual API request
      // const response = await registerUser(username, password, role.toLowerCase());
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Store user data
      localStorage.setItem("username", fullName);
      
      showMessage("Registration successful! Redirecting...", true);
      
      // Redirect based on role after delay
      setTimeout(() => {
        if (role === "Admin") {
          window.location.href = "./AdminDashboard.html";
        } else {
          window.location.href = "./UserDashboard.html";
        }
      }, 1500);
      
    } catch (error) {
      console.error("Registration error:", error);
      showMessage(error.message || "Registration failed. Please try again.", false);
    } finally {
      disableSubmit(false);
    }
  });

  // Validation function
  function validateForm(role, fullName, identifier, adminEmail, password, confirm, govId) {
    const errors = {};
    
    if (!fullName.trim()) errors.fullName = "Full name is required";
    
    if (role === "User") {
      if (!identifier.trim()) errors.identifier = "Mobile / Email / Username is required";
    } else { // Admin
      if (!adminEmail.trim()) errors.adminEmail = "Admin email is required";
      else if (!/^\S+@\S+\.\S+$/.test(adminEmail)) errors.adminEmail = "Enter a valid admin email";
      if (!govId.trim()) errors.govId = "Government ID is required for admins";
    }
    
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";
    
    if (confirm !== password) errors.confirm = "Passwords do not match";
    
    return errors;
  }

  // Display errors
  function displayErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.field-error').forEach(el => {
      el.style.display = 'none';
      el.textContent = '';
    });
    
    // Show new errors
    Object.keys(errors).forEach(field => {
      const errorElement = document.getElementById(field + 'Error');
      if (errorElement) {
        errorElement.textContent = errors[field];
        errorElement.style.display = 'block';
      }
    });
  }

  // Show message
  function showMessage(message, isSuccess) {
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.className = `field-error ${isSuccess ? 'success' : ''}`;
  }

  // Hide message
  function hideMessage() {
    messageDiv.style.display = 'none';
  }

  // Disable/enable submit button
  function disableSubmit(disabled) {
    submitBtn.disabled = disabled;
    submitBtn.textContent = disabled ? "Registering..." : "Register";
  }
});

// Mock API function (in a real app, this would make actual API calls)
async function registerUser(username, password, role) {
  // This is a mock implementation
  // In a real application, this would make an actual API call to your backend
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate success
      resolve({
        token: 'mock-token-' + Date.now(),
        user: { role: role }
      });
    }, 1000);
  });
}