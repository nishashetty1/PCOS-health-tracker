// Mock symptom tracking data
const symptoms = [
    // Initial data will be empty, as it will be populated through API calls
  ];
  
  // Common PCOS symptoms for validation
  const pcosSymptomsTypes = [
    "irregular_periods",
    "heavy_bleeding",
    "weight_gain",
    "acne",
    "hair_loss",
    "excess_hair_growth",
    "mood_changes",
    "fatigue",
    "pelvic_pain",
    "headaches",
    "sleep_problems",
    "insulin_resistance",
    "bloating",
  ];
  
  // Function to add a new symptom entry
  const addSymptom = (entry) => {
    // Generate an ID for the symptom entry
    const id = symptoms.length > 0 ? Math.max(...symptoms.map(s => s.id)) + 1 : 1;
    
    // Create the new entry with an ID and timestamp
    const newEntry = {
      id,
      ...entry,
      createdAt: new Date().toISOString()
    };
    
    // Add to the symptoms array
    symptoms.push(newEntry);
    return newEntry;
  };
  
  // Function to get symptoms for a specific user
  const getSymptomsByUser = (userId) => {
    return symptoms.filter(symptom => symptom.userId === parseInt(userId));
  };
  
  // Function to get all symptoms
  const getAllSymptoms = () => {
    return symptoms;
  };
  
  module.exports = {
    symptoms,
    pcosSymptomsTypes,
    addSymptom,
    getSymptomsByUser,
    getAllSymptoms
  };