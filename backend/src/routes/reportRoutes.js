const express = require('express');
const router = express.Router();
const { getSymptomsByUser } = require('../data/symptoms');
const users = require('../data/users');


router.get('/user/:userId/range', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { startDate, endDate } = req.query;
  
  // Check if user exists
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Get user's symptoms
  const userSymptoms = getSymptomsByUser(userId);
  
  // Filter symptoms by date range if provided
  const filteredSymptoms = startDate && endDate ? userSymptoms.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset times to avoid time zone issues
    entryDate.setHours(12, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return entryDate >= start && entryDate <= end;
  }) : userSymptoms;

  const symptomStats = {};
  
  filteredSymptoms.forEach(entry => {
    if (Array.isArray(entry.symptoms)) {
      entry.symptoms.forEach(symptom => {
        // Get symptom name and severity
        const symptomName = typeof symptom === 'object' ? symptom.name : symptom;
        const severityValue = typeof symptom === 'object' && symptom.severity !== undefined ? 
          parseFloat(symptom.severity) : 5; // Default to 5 if not specified
        
        // Initialize if first occurrence
        if (!symptomStats[symptomName]) {
          symptomStats[symptomName] = {
            count: 0,
            severitySum: 0,
            severities: []
          };
        }
        
        // Update stats
        symptomStats[symptomName].count += 1;
        symptomStats[symptomName].severitySum += severityValue;
        symptomStats[symptomName].severities.push(severityValue);
      });
    }
  });

  const sortedSymptoms = Object.entries(symptomStats)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([symptom, stats]) => {
      const formattedSymptom = symptom.replace(/_/g, ' ');
      const averageSeverity = stats.count > 0 ? 
        stats.severitySum / stats.count : 5;
      
      return {
        symptom: formattedSymptom,
        frequency: stats.count,
        averageSeverity,
        originalValues: stats.severities
      };
    });
    
  // Generate insights based on symptoms
  let insights = [];
  if (sortedSymptoms.length > 0) {
    const mostCommonSymptom = sortedSymptoms[0].symptom;
    insights.push(`Your most common symptom is ${mostCommonSymptom}.`);
    
    // Add more insights based on symptoms if needed
  } else {
    insights.push('No symptoms recorded in the selected time period.');
  }
  
  // Generate recommendations
  let recommendations = [];
  if (sortedSymptoms.length > 0) {
    recommendations.push('Continue tracking your symptoms to identify patterns over time.');
    
    // Add more personalized recommendations based on symptoms
    const highSeveritySymptoms = sortedSymptoms.filter(s => s.averageSeverity >= 7);
    if (highSeveritySymptoms.length > 0) {
      recommendations.push('Consider consulting with a healthcare provider about your high-severity symptoms.');
    }
  } else {
    recommendations.push('Start recording your symptoms regularly for better insights.');
  }
  
  // Prepare the report
  const report = {
    id: Date.now(),
    userId,
    userName: user.name,
    generatedAt: new Date().toISOString(),
    periodCovered: `${startDate || "All time"} to ${endDate || "present"}`,
    userDetails: {
      age: user.age,
      weight: user.weight,
      height: user.height,
      bmi: user.weight && user.height ? 
        (user.weight / Math.pow(user.height/100, 2)).toFixed(1) : null
    },
    symptomSummary: sortedSymptoms,
    filteredSymptomCount: filteredSymptoms.length,
    totalSymptomCount: userSymptoms.length,
    insights,
    recommendations,
    debug: {
      dateRange: { startDate, endDate },
      filteredCount: filteredSymptoms.length,
      totalCount: userSymptoms.length
    }
  };
  
  res.json(report);
});

// Keep your existing route for /user/:userId
router.get('/user/:userId', (req, res) => {
  // Your existing code for this route
  const userId = parseInt(req.params.userId);
  
  // Check if user exists
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Get user's symptoms
  const userSymptoms = getSymptomsByUser(userId);
  
  if (userSymptoms.length === 0) {
    return res.json({
      userId,
      userName: user.name,
      reportDate: new Date().toISOString(),
      message: 'No symptoms have been recorded yet',
      recommendation: 'Start tracking your symptoms for personalized insights'
    });
  }
  

// Generate a basic report for a user
router.get('/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  // Check if user exists
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Get user's symptoms
  const userSymptoms = getSymptomsByUser(userId);
  
  if (userSymptoms.length === 0) {
    return res.json({
      userId,
      userName: user.name,
      reportDate: new Date().toISOString(),
      message: 'No symptoms have been recorded yet',
      recommendation: 'Start tracking your symptoms for personalized insights'
    });
  }
  
  // Analyze symptoms
  const symptomCounts = {};
  let totalSeverity = 0;
  let severityCount = 0;
  
  userSymptoms.forEach(entry => {
    entry.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
    
    if (entry.severity) {
      const severityValue = 
        entry.severity === 'mild' ? 1 : 
        entry.severity === 'moderate' ? 2 : 
        entry.severity === 'severe' ? 3 : 2; // Default to moderate (2)
      
      totalSeverity += severityValue;
      severityCount++;
    }
  });
  
  // Calculate most frequent symptoms
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([symptom, count]) => ({ symptom, count }));
  
  // Calculate average severity
  const avgSeverity = severityCount > 0 ? totalSeverity / severityCount : 0;
  const severityCategory = 
    avgSeverity < 1.5 ? 'mild' : 
    avgSeverity < 2.5 ? 'moderate' : 'severe';
  
  // Generate insights and recommendations based on symptoms
  let insights = [];
  let recommendations = [];
  
  // Basic insights based on top symptoms
  if (sortedSymptoms.length > 0) {
    const topSymptom = sortedSymptoms[0].symptom;
    
    switch (topSymptom) {
      case 'irregular_periods':
        insights.push('Your most frequently reported symptom is irregular periods, which is a common PCOS indicator.');
        recommendations.push('Consider tracking your cycle with a calendar for better pattern recognition.');
        break;
      case 'weight_gain':
        insights.push('You frequently report weight gain, which can be associated with insulin resistance in PCOS.');
        recommendations.push('A low-glycemic diet and regular exercise may help manage this symptom.');
        break;
      case 'acne':
      case 'hair_loss':
      case 'excess_hair_growth':
        insights.push('Your skin and hair symptoms may be related to hormonal imbalances common in PCOS.');
        recommendations.push('Consider consulting with a dermatologist for targeted treatments.');
        break;
      case 'mood_changes':
      case 'fatigue':
        insights.push('Your energy and mood symptoms can significantly impact quality of life.');
        recommendations.push('Regular sleep schedules and stress management techniques may provide relief.');
        break;
      default:
        insights.push(`Your most common symptom is ${topSymptom.replace('_', ' ')}.`);
        recommendations.push('Continue tracking your symptoms to identify patterns over time.');
    }
  }
  
  // Additional general insights
  if (userSymptoms.length >= 3) {
    insights.push('You have been consistently tracking your symptoms, which is excellent for managing PCOS.');
    recommendations.push('Share this report with your healthcare provider at your next appointment.');
  }
  
  // Prepare the report
  const report = {
    id: Date.now(),
    userId,
    userName: user.name,
    generatedAt: new Date().toISOString(),
    periodCovered: `${startDate || "All time"} to ${endDate || "present"}`,
    userDetails: {
      age: user.age,
      weight: user.weight,
      height: user.height,
      bmi: user.weight && user.height ? 
        (user.weight / Math.pow(user.height/100, 2)).toFixed(1) : null
    },
    symptomSummary: sortedSymptoms,
    filteredSymptomCount: filteredSymptoms.length,
    totalSymptomCount: userSymptoms.length,
    insights,
    recommendations,
    debug: {
      dateRange: { startDate, endDate },
      filteredCount: filteredSymptoms.length,
      totalCount: userSymptoms.length
    }
  };
  
  res.json(report);
});

});

module.exports = router;