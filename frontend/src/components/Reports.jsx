import React, { useState, useEffect } from "react";
import Card from "./common/Card";
import Button from "./common/Button";
import Loading from "./common/Loading";
import useApi from "../hooks/useApi";
import { formatDate, calculateBMI, getBMICategory } from "../utils/formatter";

const Reports = () => {
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [userSymptoms, setUserSymptoms] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find((u) => u.id === parseInt(selectedUserId));
      setSelectedUser(user);
      fetchUserSymptoms(parseInt(selectedUserId));
    }
  }, [selectedUserId, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      setUsers(data);
      if (data.length > 0) {
        setSelectedUserId(data[0].id.toString());
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
      console.log("Raw user symptoms from API:", data);

      // Important: Check if the data is an empty array or invalid
      if (!Array.isArray(data)) {
        console.error("Invalid symptoms data:", data);
        setUserSymptoms([]);
        return;
      }

      // Format the data to ensure it has the right structure
      const formattedData = data.map((symptom) => {
        // Create a deep copy to avoid modifying the original data
        const formattedSymptom = { ...symptom };

        // Make sure symptoms is an array
        if (!Array.isArray(formattedSymptom.symptoms)) {
          formattedSymptom.symptoms = formattedSymptom.symptoms
            ? [formattedSymptom.symptoms]
            : [];
        }

        // Ensure date is consistent
        if (
          formattedSymptom.date &&
          typeof formattedSymptom.date === "string"
        ) {
          formattedSymptom.date = formattedSymptom.date.split("T")[0];
        } else {
          formattedSymptom.date = new Date().toISOString().split("T")[0];
        }

        // Extract severity from symptoms
        if (formattedSymptom.symptoms && formattedSymptom.symptoms.length > 0) {
          // Convert string symptoms to objects with proper severity
          formattedSymptom.symptoms = formattedSymptom.symptoms.map((s) => {
            // If it's already an object
            if (typeof s === "object" && s !== null) {
              return s;
            }
            // If it's a string, convert to object with default severity
            return {
              name: s,
              severity: formattedSymptom.severity || 5, // Use entry severity or default to 5
            };
          });
        }

        return formattedSymptom;
      });

      console.log("Formatted symptom data:", formattedData);
      setUserSymptoms(formattedData);
      setDebugInfo({
        rawData: data,
        formattedData,
      });
    } catch (err) {
      console.error("Error fetching user symptoms:", err);
      setUserSymptoms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (userId) => {
    if (!userId) return;

    try {
      setLoading(true);

      // Call the backend API with the date range
      const { data } = await api.get(`/reports/user/${userId}/range`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });

      // Set the report data
      setReports([data]);
      setSelectedReport(data);
    } catch (err) {
      setError(err.message || "Failed to fetch reports");
      console.error("Error fetching reports:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedUserId) return;
    fetchReports(selectedUserId);
  };

  if (loading && !users.length) return <Loading />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">
        Health Reports
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Generate Report</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select User
                </label>
                <select
                  id="userId"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  min={dateRange.startDate}
                />
              </div>

              <Button
                onClick={handleGenerateReport}
                loading={loading}
                disabled={loading || !selectedUserId}
                className="w-full"
              >
                Generate Report
              </Button>
            </div>

            {reports.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-2">
                  Available Reports
                </h3>
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? "bg-purple-100 border border-purple-300"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <p className="font-medium">{report.title}</p>
                      <p className="text-xs text-gray-500">
                        {report.generatedAt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {debugInfo && process.env.NODE_ENV === "development" && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <h3 className="font-medium text-sm mb-2">Debug Info</h3>
                <p className="text-xs text-gray-500 mb-1">
                  Total symptoms: {userSymptoms.length}
                </p>
                {selectedReport?.debug && (
                  <>
                    <p className="text-xs text-gray-500 mb-1">
                      Date range: {selectedReport.debug.startDateObj} to{" "}
                      {selectedReport.debug.endDateObj}
                    </p>
                    <p className="text-xs text-gray-500">
                      Filtered symptoms: {selectedReport.debug.filteredCount}/
                      {selectedReport.debug.totalCount}
                    </p>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card>
            {selectedReport ? (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-purple-800">
                      {selectedReport.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Generated on {selectedReport.generatedAt}
                    </p>
                    <p className="text-sm text-gray-500">
                      Period covered: {selectedReport.periodCovered}
                    </p>

                    {selectedReport.userDetails && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Age: </span>
                          <span className="font-medium">
                            {selectedReport.userDetails.age || "N/A"}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Weight: </span>
                          <span className="font-medium">
                            {selectedReport.userDetails.weight
                              ? `${selectedReport.userDetails.weight} kg`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Height: </span>
                          <span className="font-medium">
                            {selectedReport.userDetails.height
                              ? `${selectedReport.userDetails.height} cm`
                              : "N/A"}
                          </span>
                        </div>
                        {selectedReport.userDetails.bmi && (
                          <div className="text-sm">
                            <span className="text-gray-500">BMI: </span>
                            <span className="font-medium">
                              {selectedReport.userDetails.bmi}
                              <span
                                className={`ml-1 text-xs ${
                                  getBMICategory(selectedReport.userDetails.bmi)
                                    ?.color
                                }`}
                              >
                                (
                                {
                                  getBMICategory(selectedReport.userDetails.bmi)
                                    ?.category
                                }
                                )
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => window.print()}
                  >
                    Print Report
                  </Button>
                </div>

                <div className="space-y-8">
                  {selectedReport.totalSymptomCount > 0 ? (
                    <div>
                      {selectedReport.symptomSummary &&
                      selectedReport.symptomSummary.length > 0 ? (
                        <>
                          <h3 className="text-xl font-semibold mb-3 text-gray-800">
                            Symptom Summary
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({selectedReport.filteredSymptomCount} entries in
                              selected date range)
                            </span>
                          </h3>
                          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Symptom
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Frequency
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Severity
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedReport.symptomSummary.map(
                                  (item, index) => (
                                    <tr key={index}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.symptom}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.frequency}{" "}
                                        {item.frequency === 1
                                          ? "time"
                                          : "times"}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <span className="text-sm text-gray-900 mr-2">
                                            {parseFloat(
                                              item.averageSeverity
                                            ).toFixed(1)}
                                            /10
                                          </span>
                                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                            <div
                                              className={`h-2.5 rounded-full ${
                                                item.averageSeverity <= 3
                                                  ? "bg-green-500"
                                                  : item.averageSeverity <= 6
                                                  ? "bg-yellow-500"
                                                  : "bg-red-500"
                                              }`}
                                              style={{
                                                width: `${Math.min(
                                                  item.averageSeverity * 10,
                                                  100
                                                )}%`,
                                              }}
                                            ></div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-gray-500">
                            No symptoms recorded between{" "}
                            {selectedReport.periodCovered}
                          </p>
                          <p className="text-gray-500 mt-1">
                            Try selecting a different date range or add symptoms
                            for this period
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-500">
                        No symptoms have been recorded for this user yet
                      </p>
                    </div>
                  )}

                  {selectedReport.insights &&
                    selectedReport.insights.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">
                          Key Insights
                        </h3>
                        <div className="bg-blue-50 rounded-lg p-5">
                          <ul className="space-y-3 list-disc pl-5">
                            {selectedReport.insights.map((insight, index) => (
                              <li key={index} className="text-blue-800">
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                  {selectedReport.recommendations &&
                    selectedReport.recommendations.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">
                          Recommendations
                        </h3>
                        <div className="bg-purple-50 rounded-lg p-5">
                          <ul className="space-y-4">
                            {selectedReport.recommendations.map(
                              (recommendation, index) => (
                                <li key={index} className="flex">
                                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm mr-3 mt-0.5">
                                    {index + 1}
                                  </div>
                                  <p className="text-purple-900">
                                    {recommendation}
                                  </p>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No report selected
                </h3>
                <p className="mt-1 text-gray-500">
                  Select a user and generate a report to view insights
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
