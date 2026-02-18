import { FaCalendarCheck, FaVideo, FaEye, FaCalendarTimes, FaTimes } from "react-icons/fa";

const Arb_HearingSection = ({ selectedHearing, onHearingSelect, onHearingClose }) => {
    // Sample hearing data - replace with actual data from API
    const hearingData = [
        {
            id: 1,
            date: "2024-10-11T14:00:00",
            documentsRequired: "Complete contract execution documents, payment receipts, communication records",
            meetingLink: "https://meet.justifi.com/abc123",
            overview: {
                arbitrator1Notes: "Initial arguments presented by both parties. Plaintiff's counsel outlined the breach of contract claims.",
                arbitrator2Notes: "Parties mutually agreed to proceed with discovery phase. Defendant acknowledged receipt of initial documents.",
                arbitrator3Notes: "Basic evidence submitted meets preliminary requirements. Additional documentation requested for financial claims.",
                finalResult: "Adjourned for comprehensive document submission",
                attendance: "Present"
            }
        },
        {
            id: 2,
            date: "2024-10-24T15:30:00",
            documentsRequired: "Audited financial statements, bank transaction records, delivery confirmation",
            meetingLink: "https://meet.justifi.com/def456",
            overview: {
                arbitrator1Notes: "Contractual obligations analysis completed. Key clauses regarding delivery timelines discussed.",
                arbitrator2Notes: "Payment schedule discrepancy identified. Parties to provide additional financial records.",
                arbitrator3Notes: "Witness statements reviewed and found consistent. Additional expert testimony may be required.",
                finalResult: "Evidence evaluation phase extended",
                attendance: "Present"
            }
        }
    ];

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="flex items-center mb-8">
                    <div className="w-1 h-8 bg-purple-600 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        <FaCalendarCheck className="inline mr-3 text-purple-600" />
                        Hearing Information
                    </h2>
                </div>

                {/* Hearing Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-purple-50 border-b-2 border-purple-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900 border-r border-purple-200">
                                    HEARING DATE & TIME
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900 border-r border-purple-200">
                                    DOCUMENTS REQUIRED
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900 border-r border-purple-200">
                                    MEET LINK
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                                    HEARING OVERVIEW
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {hearingData.map((hearing) => (
                                <tr key={hearing.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 border-r border-gray-200">
                                        <div className="font-semibold text-gray-900 text-sm">
                                            {new Date(hearing.date).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(hearing.date).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-700 max-w-xs">
                                        {hearing.documentsRequired}
                                    </td>
                                    <td className="px-6 py-4 border-r border-gray-200">
                                        <a 
                                            href={hearing.meetingLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            <FaVideo className="mr-2" />
                                            Join
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => onHearingSelect(hearing)}
                                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                        >
                                            <FaEye className="mr-2" />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State for Hearings */}
                {hearingData.length === 0 && (
                    <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                            <FaCalendarTimes className="mx-auto text-6xl text-gray-300 mb-6" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Hearings Scheduled</h3>
                            <p className="text-gray-500 mb-6">Hearings will be scheduled as the case progresses.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Hearing Overview Modal */}
            {selectedHearing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Hearing Overview - {new Date(selectedHearing.date).toLocaleDateString()}
                            </h3>
                            <button 
                                onClick={onHearingClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Arbitrator 1 Notes */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">Arbitrator 1 Opinion/Notes</h4>
                                <p className="text-gray-700">{selectedHearing.overview.arbitrator1Notes}</p>
                            </div>

                            {/* Arbitrator 2 Notes */}
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                                <h4 className="font-semibold text-amber-900 mb-2">Arbitrator 2 Opinion/Notes</h4>
                                <p className="text-gray-700">{selectedHearing.overview.arbitrator2Notes}</p>
                            </div>

                            {/* Arbitrator 3 Notes */}
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                <h4 className="font-semibold text-green-900 mb-2">Arbitrator 3 Opinion/Notes</h4>
                                <p className="text-gray-700">{selectedHearing.overview.arbitrator3Notes}</p>
                            </div>

                            {/* Final Result */}
                            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                                <h4 className="font-semibold text-purple-900 mb-2">Final Result</h4>
                                <p className="text-gray-700">{selectedHearing.overview.finalResult}</p>
                            </div>

                            {/* Attendance */}
                            <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded-r-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Your Attendance</h4>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedHearing.overview.attendance === 'Present' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {selectedHearing.overview.attendance}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button 
                                onClick={onHearingClose}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Arb_HearingSection;