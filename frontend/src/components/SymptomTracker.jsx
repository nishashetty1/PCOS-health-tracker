import React, { useState, useEffect } from "react";
import Card from "./common/Card";
import Button from "./common/Button";
import Loading from "./common/Loading";
import {
  calculateBMI,
  getBMICategory,
  getSeverityLabel,
} from "../utils/formatter";
import useApi from "../hooks/useApi";

const SymptomTracker = () => {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [showBmiDetails, setShowBmiDetails] = useState(false);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    age: "",
    weight: "",
    height: "",
  });

  const [symptomForm, setSymptomForm] = useState({
    date: new Date().toISOString().split("T")[0],
    symptoms: [{ name: "", severity: 5 }],
    severity: "moderate",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [userBmi, setUserBmi] = useState(null);

  const symptomOptions = [
    "Irregular periods",
    "Heavy bleeding",
    "Weight gain",
    "Acne",
    "Hair loss",
    "Excess hair growth",
    "Mood changes",
    "Fatigue",
    "Pelvic pain",
    "Headaches",
    "Sleep problems",
    "Insulin resistance",
    "Bloating",
    "Other",
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });

    // Calculate BMI if both weight and height are provided
    if (
      (name === "weight" || name === "height") &&
      userForm.weight &&
      userForm.height
    ) {
      const bmi = calculateBMI(
        name === "weight" ? parseFloat(value) : parseFloat(userForm.weight),
        name === "height" ? parseFloat(value) : parseFloat(userForm.height)
      );
      setUserBmi(bmi);
      setShowBmiDetails(true);
    }
  };

  const handleUserSelect = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);

    if (userId) {
      const user = users.find((u) => u.id === parseInt(userId));
      if (user && user.weight && user.height) {
        const bmi = calculateBMI(
          parseFloat(user.weight),
          parseFloat(user.height)
        );
        setUserBmi(bmi);
        setShowBmiDetails(true);
      } else {
        setShowBmiDetails(false);
      }
    } else {
      setShowBmiDetails(false);
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Explicitly convert values to the right types
      const userData = {
        name: userForm.name,
        email: userForm.email,
        age: userForm.age ? parseInt(userForm.age) : null,
        // Make sure these are numbers, not strings
        weight: userForm.weight ? parseFloat(userForm.weight) : null,
        height: userForm.height ? parseFloat(userForm.height) : null,
      };

      console.log("Submitting user data:", userData);

      const { data } = await api.post("/users", userData);
      console.log("Server response:", data);

      // Check if height and weight were correctly saved in the response
      if (data && (!data.height || !data.weight)) {
        console.warn("Height or weight missing in server response", data);
      }

      setUsers([...users, data]);
      setSelectedUserId(data.id.toString());
      setUserFormOpen(false);

      // Calculate BMI
      if (userData.weight && userData.height) {
        const bmi = calculateBMI(userData.weight, userData.height);
        setUserBmi(bmi);
        setShowBmiDetails(true);
      }

      setSubmitStatus({
        success: true,
        message: "User created successfully!",
      });
    } catch (err) {
      console.error("Error creating user:", err);
      setSubmitStatus({
        success: false,
        message:
          err.response?.data?.message || err.message || "Failed to create user",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Add function to update existing user
  // In the handleUpdateUser function:

  const handleUpdateUser = async () => {
    if (!selectedUserId) {
      setSubmitStatus({
        success: false,
        message: "Please select a user first",
      });
      return;
    }

    try {
      setSubmitting(true);

      const selectedUser = users.find((u) => u.id === parseInt(selectedUserId));
      if (!selectedUser) return;

      // Populate the form with current user data
      setUserForm({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        age: selectedUser.age || "",
        weight: selectedUser.weight || "",
        height: selectedUser.height || "",
      });

      setUserFormOpen(true);
      setSubmitting(false);
    } catch (err) {
      console.error("Error getting user data:", err);
      setSubmitStatus({
        success: false,
        message: err.message || "Failed to get user data",
      });
      setSubmitting(false);
    }
  };

  // New function to handle the actual update
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Explicitly convert values to the right types
      const userData = {
        name: userForm.name,
        email: userForm.email,
        age: userForm.age ? parseInt(userForm.age) : null,
        weight: userForm.weight ? parseFloat(userForm.weight) : null,
        height: userForm.height ? parseFloat(userForm.height) : null,
      };

      console.log("Updating user data:", userData);

      const { data } = await api.put(`/users/${selectedUserId}`, userData);
      console.log("Server response after update:", data);

      // Update users list
      setUsers(
        users.map((u) => (u.id === parseInt(selectedUserId) ? data : u))
      );
      setUserFormOpen(false);

      // Calculate BMI
      if (userData.weight && userData.height) {
        const bmi = calculateBMI(userData.weight, userData.height);
        setUserBmi(bmi);
        setShowBmiDetails(true);
      }

      setSubmitStatus({
        success: true,
        message: "User updated successfully!",
      });
    } catch (err) {
      console.error("Error updating user:", err);
      setSubmitStatus({
        success: false,
        message:
          err.response?.data?.message || err.message || "Failed to update user",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addSymptom = () => {
    setSymptomForm({
      ...symptomForm,
      symptoms: [{ name: "", severity: 5 }, ...symptomForm.symptoms],
    });
  };

  const handleSymptomChange = (index, field, value) => {
    const updatedSymptoms = [...symptomForm.symptoms];

    if (field === "name") {
      updatedSymptoms[index].name = value;
      setSymptomForm({ ...symptomForm, symptoms: updatedSymptoms });
    } else if (field === "severity") {
      const numericValue = parseInt(value);
      updatedSymptoms[index].severity = numericValue;

      // Add category label as a separate property for display only
      const severityLabels = {
        1: "very mild",
        2: "very mild",
        3: "mild",
        4: "mild",
        5: "moderate",
        6: "moderate",
        7: "severe",
        8: "severe",
        9: "very severe",
        10: "very severe",
      };

      updatedSymptoms[index].severityLabel = severityLabels[numericValue];

      setSymptomForm({
        ...symptomForm,
        symptoms: updatedSymptoms,
      });
    }
  };

  const removeSymptom = (index) => {
    const updatedSymptoms = symptomForm.symptoms.filter((_, i) => i !== index);
    setSymptomForm({ ...symptomForm, symptoms: updatedSymptoms });
  };

  const handleSymptomSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      setSubmitStatus({
        success: false,
        message: "Please select or create a user first",
      });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      // Format symptoms as the API expects
      // First, get the array of symptom names for the API
      const symptomNames = symptomForm.symptoms
        .filter((symptom) => symptom.name)
        .map((symptom) => symptom.name.toLowerCase().replace(/ /g, "_"));

      // Then create a separate object with severity information
      const symptomDetails = {};
      symptomForm.symptoms
        .filter((symptom) => symptom.name)
        .forEach((symptom) => {
          const symptomKey = symptom.name.toLowerCase().replace(/ /g, "_");
          symptomDetails[symptomKey] = {
            severity: symptom.severity,
          };
        });

      const submissionData = {
        userId: parseInt(selectedUserId),
        date: symptomForm.date,
        symptoms: symptomNames, // Send just the names as the API expects
        symptomDetails: symptomDetails, // Send additional details in a separate field
        notes: symptomForm.notes,
      };

      console.log("Submitting data:", submissionData);

      const { data } = await api.post("/symptoms", submissionData);

      setSubmitStatus({
        success: true,
        message: "Symptoms submitted successfully!",
      });

      // Reset form
      setSymptomForm({
        date: new Date().toISOString().split("T")[0],
        symptoms: [{ name: "", severity: 5 }],
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting symptoms:", error);
      setSubmitStatus({
        success: false,
        message: error.message || "Failed to submit symptoms",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">
        Track Your Symptoms
      </h1>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>

        {showBmiDetails && userBmi && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Your BMI</h3>
                <div className="flex items-center mt-2">
                  <span className="text-2xl font-bold">{userBmi}</span>
                  <span className={`ml-2 ${getBMICategory(userBmi)?.color}`}>
                    ({getBMICategory(userBmi)?.category})
                  </span>
                </div>
              </div>
              <div className="w-1/2">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      parseFloat(userBmi) < 18.5
                        ? "bg-blue-500"
                        : parseFloat(userBmi) < 25
                        ? "bg-green-500"
                        : parseFloat(userBmi) < 30
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(parseFloat(userBmi) * 2, 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {userFormOpen ? (
          <form
            onSubmit={
              userForm.id ? handleUpdateUserSubmit : handleUserFormSubmit
            }
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={userForm.age}
                  onChange={handleUserFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  min="0"
                  max="120"
                />
              </div>

              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={userForm.weight}
                  onChange={handleUserFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  step="0.1"
                  min="0"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="height"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={userForm.height}
                  onChange={handleUserFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setUserFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} loading={submitting}>
                Save User
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-2/3">
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select User
              </label>
              <select
                id="userId"
                value={selectedUserId}
                onChange={handleUserSelect}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/3 md:self-end flex gap-2">
              <Button
                onClick={() => {
                  setUserFormOpen(true);
                  setUserForm({
                    name: "",
                    email: "",
                    age: "",
                    weight: "",
                    height: "",
                  });
                }}
                className="flex-1"
              >
                Add New User
              </Button>
              {selectedUserId && (
                <Button
                  variant="secondary"
                  onClick={handleUpdateUser}
                  className="flex-1"
                >
                  Update User
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <form onSubmit={handleSymptomSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              value={symptomForm.date}
              onChange={(e) =>
                setSymptomForm({ ...symptomForm, date: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Symptoms</h3>
              <Button
                type="button"
                onClick={addSymptom}
                variant="secondary"
                size="small"
              >
                Add Symptom
              </Button>
            </div>

            {symptomForm.symptoms.map((symptom, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Symptom
                    </label>
                    <select
                      value={symptom.name}
                      onChange={(e) =>
                        handleSymptomChange(index, "name", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select a symptom</option>
                      {symptomOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity (1-10)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={symptom.severity}
                        onChange={(e) =>
                          handleSymptomChange(index, "severity", e.target.value)
                        }
                        className="w-full"
                      />
                      <span className="text-sm font-medium">
                        {symptom.severity}
                      </span>
                    </div>
                  </div>

                  {symptomForm.symptoms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSymptom(index)}
                      className="self-end md:self-center text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={symptomForm.notes}
              onChange={(e) =>
                setSymptomForm({ ...symptomForm, notes: e.target.value })
              }
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder="Add any other details you want to track..."
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !selectedUserId}
              loading={submitting}
            >
              Submit Symptoms
            </Button>
          </div>

          {submitStatus && (
            <div
              className={`p-3 rounded-md ${
                submitStatus.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {submitStatus.message}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default SymptomTracker;
