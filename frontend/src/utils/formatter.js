// Format date to a human-readable string
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return date; // Return original if invalid date
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate BMI from weight (kg) and height (cm)
export const calculateBMI = (weight, height) => {
  // Make sure we're working with numbers
  weight = parseFloat(weight);
  height = parseFloat(height);
  
  // Log values for debugging
  console.log('Calculating BMI with:', { weight, height });
  
  // Check for valid inputs
  if (!weight || !height || isNaN(weight) || isNaN(height) || height <= 0 || weight <= 0) {
    console.warn('Invalid weight or height values for BMI calculation');
    return '—';
  }
  
  // Convert height from cm to meters
  const heightInMeters = height / 100;
  
  // Calculate BMI: weight (kg) / height² (m²)
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Return formatted BMI value with 1 decimal place
  return bmi.toFixed(1);
};

// Get BMI category and color for display
export const getBMICategory = (bmi) => {
  // Convert to number if it's a string
  bmi = parseFloat(bmi);
  
  // Check if BMI is valid
  if (isNaN(bmi) || bmi <= 0) return { category: 'Unknown', color: 'text-gray-500' };
  
  if (bmi < 18.5) {
    return { category: 'Underweight', color: 'text-blue-600' };
  } else if (bmi < 25) {
    return { category: 'Normal', color: 'text-green-600' };
  } else if (bmi < 30) {
    return { category: 'Overweight', color: 'text-yellow-600' };
  } else {
    return { category: 'Obese', color: 'text-red-600' };
  }
};

// Get severity label and color
export const getSeverityLabel = (severityValue) => {
  const severity = parseInt(severityValue);
  
  if (severity <= 3) {
    return { label: 'Mild', color: 'bg-green-100 text-green-800' };
  } else if (severity <= 6) {
    return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
  } else {
    return { label: 'Severe', color: 'bg-red-100 text-red-800' };
  }
};