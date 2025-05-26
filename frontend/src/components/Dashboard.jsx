import React, { useState, useEffect } from "react";
import Card from "./common/Card";
import Loading from "./common/Loading";
import Button from "./common/Button";
import { calculateBMI, getBMICategory } from "../utils/formatter";
import useApi from "../hooks/useApi";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSymptoms, setUserSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserSymptoms(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");

      // Log the user data to inspect the structure
      console.log("User data received:", data);

      setUsers(data);
      if (data.length > 0) {
        setSelectedUser(data[0]);
      }
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSymptoms = async (userId) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/symptoms/user/${userId}`);
      setUserSymptoms(data);
    } catch (err) {
      console.error("Error fetching user symptoms:", err);
      setUserSymptoms([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if a value exists and is valid (not null, undefined, or empty string)
  const hasValue = (value) => {
    return value !== null && value !== undefined && value !== "";
  };

  if (loading && !users.length) return <Loading />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">
        User Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card title="Users">
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 cursor-pointer rounded-md ${
                    selectedUser?.id === user.id
                      ? "bg-purple-100"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="md:col-span-3">
          {selectedUser ? (
            <div className="space-y-6">
              <Card title="User Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="text-lg">{selectedUser.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-lg">{selectedUser.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Age</h3>
                    <p className="text-lg">
                      {hasValue(selectedUser.age)
                        ? selectedUser.age
                        : "Not provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Weight
                    </h3>
                    <p className="text-lg">
                      {hasValue(selectedUser.weight)
                        ? `${selectedUser.weight} kg`
                        : "Not provided"}
                    </p>
                    {/* Debug info */}
                    <p className="text-xs text-gray-400">
                      Debug: {typeof selectedUser.weight} -{" "}
                      {JSON.stringify(selectedUser.weight)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Height
                    </h3>
                    <p className="text-lg">
                      {hasValue(selectedUser.height)
                        ? `${selectedUser.height} cm`
                        : "Not provided"}
                    </p>
                    {/* Debug info */}
                    <p className="text-xs text-gray-400">
                      Debug: {typeof selectedUser.height} -{" "}
                      {JSON.stringify(selectedUser.height)}
                    </p>
                  </div>

                  {hasValue(selectedUser.weight) &&
                    hasValue(selectedUser.height) && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          BMI
                        </h3>
                        <div className="flex items-center">
                          <p className="text-lg mr-2">
                            {calculateBMI(
                              parseFloat(selectedUser.weight),
                              parseFloat(selectedUser.height)
                            )}
                          </p>
                          <span
                            className={`text-sm ${
                              getBMICategory(
                                calculateBMI(
                                  parseFloat(selectedUser.weight),
                                  parseFloat(selectedUser.height)
                                )
                              )?.color
                            }`}
                          >
                            (
                            {
                              getBMICategory(
                                calculateBMI(
                                  parseFloat(selectedUser.weight),
                                  parseFloat(selectedUser.height)
                                )
                              )?.category
                            }
                            )
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                  <Link to="/symptoms">
                    <Button>Track Symptoms</Button>
                  </Link>
                </div>
              </Card>

              <Card title="Recent Symptoms">
                {userSymptoms.length > 0 ? (
                  <div className="space-y-3">
                    {userSymptoms
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 5)
                      .map((entry, index) => (
                        <div
                          key={index}
                          className="p-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                entry.severity === "mild"
                                  ? "bg-green-100 text-green-800"
                                  : entry.severity === "moderate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {entry.severity}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-sm text-gray-600">
                              Symptoms:{" "}
                            </span>
                            <span className="text-sm">
                              {Array.isArray(entry.symptoms)
                                ? entry.symptoms
                                    .map((s) => {
                                      // Handle different formats of symptoms
                                      if (typeof s === "string") {
                                        return s.replace(/_/g, " ");
                                      } else if (
                                        typeof s === "object" &&
                                        s !== null &&
                                        s.name
                                      ) {
                                        return s.name.replace(/_/g, " ");
                                      } else {
                                        return String(s); // Convert to string as fallback
                                      }
                                    })
                                    .join(", ")
                                : "No symptoms listed"}
                            </span>
                          </div>
                          {entry.notes && (
                            <div className="mt-1 text-sm text-gray-600">
                              Notes: {entry.notes}
                            </div>
                          )}
                        </div>
                      ))}

                    <div className="flex justify-end">
                      <Link to="/reports">
                        <Button variant="secondary">View Full Report</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">
                      No symptoms recorded for this user
                    </p>
                    <Link to="/symptoms">
                      <Button>Track Symptoms</Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card>
              <div className="text-center p-6">
                <p className="text-gray-500">Select a user to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
