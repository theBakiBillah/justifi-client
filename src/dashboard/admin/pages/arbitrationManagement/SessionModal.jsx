import { useState } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const SessionModal = ({
    arbitration,
    onClose,
}) => {
    const axiosSecure = useAxiosSecure();
    const [sessionForm, setSessionForm] = useState({
        date: "",
        time: "",
        meetingLink: "",
    });

    const handleSessionInputChange = (e) => {
        const { name, value } = e.target;
        setSessionForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateSession = async () => {
        if (
            !sessionForm.date ||
            !sessionForm.time ||
            !sessionForm.meetingLink
        ) {
            alert("Please fill in all session details");
            return;
        }

        try {
            // Combine date and time into a single datetime string
            const sessionDateTime = new Date(
                `${sessionForm.date}T${sessionForm.time}`
            );

            console.log( arbitration);

            const response = await axiosSecure.patch(`/create-session/${arbitration._id}`, {
                sessionDateTime,
                meetingLink: sessionForm.meetingLink,
            });

            alert("Session created successfully!");
            onClose();
        } catch (error) {
            console.error("Error creating session:", error);
            alert("Failed to create session from catch");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Create Arbitration Session
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Case: {arbitration.caseTitle}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Schedule a session for this arbitration case
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Date Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Session Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={sessionForm.date}
                                onChange={handleSessionInputChange}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Time Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Session Time *
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={sessionForm.time}
                                onChange={handleSessionInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Meeting Link Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meeting Link *
                            </label>
                            <input
                                type="url"
                                name="meetingLink"
                                value={sessionForm.meetingLink}
                                onChange={handleSessionInputChange}
                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-between space-x-3 mt-6">
                        <button
                            onClick={handleCreateSession}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex-1"
                        >
                            Create Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionModal;
