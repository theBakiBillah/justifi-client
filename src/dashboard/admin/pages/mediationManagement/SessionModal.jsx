import { useState } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const SessionModal = ({ mediation, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const [sessionForm, setSessionForm] = useState({
    date: "",
    time: "",
    meetingLink: "",
    sessionType: "Mediation",
    notes: "",
  });

  const handleSessionInputChange = (e) => {
    const { name, value } = e.target;
    setSessionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSession = async () => {
    if (!sessionForm.date || !sessionForm.time || !sessionForm.meetingLink) {
      alert("Please fill in all required session details");
      return;
    }

    try {
      const sessionDateTime = new Date(
        `${sessionForm.date}T${sessionForm.time}`,
      );

      const participantEmails = [
        mediation.plaintiffs?.[0]?.email,
        mediation.defendants?.[0]?.email,
        mediation.arbitrator1Email,
        mediation.arbitrator2Email,
        mediation.presidingArbitratorEmail,
        mediation.justifiEmail,
      ].filter(Boolean);

      const response = await axiosSecure.patch(
        `/create-mediation-session/${mediation._id}`,
        {
          sessionDateTime,
          meetingLink: sessionForm.meetingLink,
          sessionType: sessionForm.sessionType,
          notes: sessionForm.notes,
          participantEmails,
        },
      );

      if (response.data) {
        alert(
          "Mediation session created successfully! Notifications will be sent to all parties.",
        );
        onClose();
      }
    } catch (error) {
      console.error("Error creating mediation session:", error);
      alert(
        error.response?.data?.message || "Failed to create mediation session",
      );
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Schedule Mediation Session
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Case Information - Compact */}
          <div className="mb-4 bg-blue-50 p-3 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
              {mediation.caseTitle}
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              <span className="font-medium">ID:</span>{" "}
              {mediation.caseId || mediation._id.slice(-8)}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="truncate">
                <span className="font-medium text-gray-700">Plaintiff:</span>
                <p className="text-gray-600 truncate">
                  {mediation.plaintiffs?.[0]?.name}
                </p>
              </div>
              <div className="truncate">
                <span className="font-medium text-gray-700">Defendant:</span>
                <p className="text-gray-600 truncate">
                  {mediation.defendants?.[0]?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Arbitrator Info - Compact */}
          <div className="mb-3 bg-gray-50 p-2 rounded-lg text-xs">
            <span className="font-medium text-gray-700">
              Presiding Arbitrator:
            </span>
            <span className="text-gray-600 ml-1">
              {mediation.presidingArbitrator}
            </span>
            <p className="text-gray-500 mt-1">
              📧 Notifications will be sent to all arbitrators
            </p>
          </div>

          {/* Form Fields - Compact */}
          <div className="space-y-3">
            {/* Session Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Session Type *
              </label>
              <select
                name="sessionType"
                value={sessionForm.sessionType}
                onChange={handleSessionInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Mediation">Mediation</option>
                <option value="Pre-Mediation">Pre-Mediation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Settlement">Settlement</option>
              </select>
            </div>

            {/* Date and Time in one row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={sessionForm.date}
                  onChange={handleSessionInputChange}
                  min={minDate}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={sessionForm.time}
                  onChange={handleSessionInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Meeting Link *
              </label>
              <input
                type="url"
                name="meetingLink"
                value={sessionForm.meetingLink}
                onChange={handleSessionInputChange}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Notes - Compact */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={sessionForm.notes}
                onChange={handleSessionInputChange}
                placeholder="Add special instructions..."
                rows="2"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleCreateSession}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Schedule
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
