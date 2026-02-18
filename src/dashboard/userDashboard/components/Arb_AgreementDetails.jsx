// dashboard/userDashboard/components/AgreementDetails.jsx
import { FaHandshake, FaCalendarAlt, FaClock, FaVideo, FaCalendarCheck, FaFilePdf, FaDownload, FaEye, FaCheckCircle, FaTimes, FaInfoCircle, FaExclamationTriangle, FaUserTie } from "react-icons/fa";

const Arb_AgreementDetails = ({ arbitration }) => {
    const isCaseCancelled = arbitration.arbitration_status?.toLowerCase() === 'cancelled';
    const isCasePending = arbitration.arbitration_status?.toLowerCase() === 'pending';
    const isCaseOngoing = arbitration.arbitration_status?.toLowerCase() === 'ongoing';
    const isCaseCompleted = arbitration.arbitration_status?.toLowerCase() === 'completed';

    // Check if session data exists in the database
    const hasSessionData = arbitration.sessionData && arbitration.sessionData.sessionDateTime;
    
    // Check if agreement data exists for ongoing/completed cases
    const hasAgreementData = arbitration.agreementDate || arbitration.justifiRepresentative;

    // Use actual data from arbitration
    const agreementData = {
        sessionDate: hasSessionData ? arbitration.sessionData.sessionDateTime : null,
        meetingLink: hasSessionData ? arbitration.sessionData.meetingLink : null,
        agreementDate: arbitration.agreementDate,
        justifiRepresentative: arbitration.justifiRepresentative,
        pdfUrl: "/documents/arbitration-agreement.pdf" // This would come from actual agreement data
    };

    // Format date and time safely
    const formatDate = (dateString) => {
        if (!dateString) return "Not defined yet";
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return "Invalid date";
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "Not defined yet";
        try {
            return new Date(dateString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return "Invalid time";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center mb-8">
                <div className="w-1 h-8 bg-teal-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                    <FaHandshake className="inline mr-3 text-teal-600" />
                    Agreement Details
                </h2>
            </div>

            {isCaseCancelled ? (
                <div className="text-center py-8">
                    <div className="bg-red-50 rounded-2xl p-6 max-w-md mx-auto">
                        <FaTimes className="mx-auto text-5xl text-red-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Arbitration Cancelled</h3>
                        <p className="text-gray-500 mb-4">
                            Your arbitration has been cancelled. No agreement was created for this case.
                        </p>
                        <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                            <p className="text-red-700 text-sm">
                                <strong>Status:</strong> Case Cancelled
                            </p>
                        </div>
                    </div>
                </div>
            ) : isCasePending ? (
                <div className="space-y-6">
                    <div className={`border-2 rounded-xl p-6 ${
                        hasSessionData 
                            ? "bg-yellow-50 border-yellow-200" 
                            : "bg-gray-50 border-gray-200"
                    }`}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            {hasSessionData ? "Upcoming Agreement Session" : "Awaiting Session Schedule"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <FaCalendarAlt className={`mr-3 text-xl ${
                                        hasSessionData ? "text-yellow-600" : "text-gray-400"
                                    }`} />
                                    <div>
                                        <p className="font-semibold text-gray-900">Session Date</p>
                                        <p className={`${
                                            hasSessionData ? "text-gray-600" : "text-gray-500 italic"
                                        }`}>
                                            {formatDate(agreementData.sessionDate)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaClock className={`mr-3 text-xl ${
                                        hasSessionData ? "text-yellow-600" : "text-gray-400"
                                    }`} />
                                    <div>
                                        <p className="font-semibold text-gray-900">Session Time</p>
                                        <p className={`${
                                            hasSessionData ? "text-gray-600" : "text-gray-500 italic"
                                        }`}>
                                            {formatTime(agreementData.sessionDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <FaVideo className={`mr-3 text-xl ${
                                        hasSessionData ? "text-yellow-600" : "text-gray-400"
                                    }`} />
                                    <div>
                                        <p className="font-semibold text-gray-900">Meeting Link</p>
                                        {hasSessionData && agreementData.meetingLink ? (
                                            <a 
                                                href={agreementData.meetingLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Join Agreement Session
                                            </a>
                                        ) : (
                                            <p className="text-gray-500 italic">Not defined yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!hasSessionData ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <FaInfoCircle className="text-blue-600 mr-3 text-xl mt-0.5" />
                                <div>
                                    <p className="text-blue-700 font-medium mb-1">Session Not Scheduled</p>
                                    <p className="text-blue-600 text-sm">
                                        Your agreement session has not been scheduled yet. Please check back later or contact the arbitration administrator for updates.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <FaExclamationTriangle className="text-yellow-600 mr-3 text-xl mt-0.5" />
                                <div>
                                    <p className="text-yellow-700 font-medium mb-1">Important Notice</p>
                                    <p className="text-yellow-600 text-sm">
                                        Please join the agreement session at the scheduled time to complete the arbitration agreement process. 
                                        Once the agreement is signed, your case status will change to "Ongoing".
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (isCaseOngoing || isCaseCompleted) ? (
                <div className="space-y-6">
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Agreement Executed</h3>
                        
                        {hasAgreementData ? (
                            <div className="space-y-8">
                                {/* Top Row: Agreement Information and Case Summary */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Agreement Information */}
                                    <div className="bg-white rounded-lg border border-green-100 p-4">
                                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Agreement Information</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <FaCalendarCheck className="text-green-600 mr-3 text-xl" />
                                                <div>
                                                    <p className="font-semibold text-gray-900">Agreement Date</p>
                                                    <p className="text-gray-600">
                                                        {formatDate(agreementData.agreementDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {agreementData.justifiRepresentative && (
                                                <div className="flex items-start">
                                                    <FaUserTie className="text-green-600 mr-3 text-xl mt-1" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">JustiFi Representative</p>
                                                        <p className="text-gray-600">
                                                            {agreementData.justifiRepresentative.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {agreementData.justifiRepresentative.designation}
                                                        </p>
                                                        {agreementData.justifiRepresentative.email && (
                                                            <p className="text-sm text-blue-600">
                                                                {agreementData.justifiRepresentative.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Case Summary */}
                                    <div className="bg-white rounded-lg border border-green-100 p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Case Summary</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Case ID</p>
                                                <p className="font-semibold text-gray-900">{arbitration.arbitrationId}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Compliance Days</p>
                                                <p className="font-semibold text-gray-900">{arbitration.complianceDays} days</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Estimated Sittings</p>
                                                <p className="font-semibold text-gray-900">{arbitration.sittings}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Total Cost</p>
                                                <p className="font-semibold text-gray-900">${arbitration.totalCost}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PDF Document at the bottom */}
                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                                    <div className="flex items-center">
                                        <FaFilePdf className="text-red-500 text-2xl mr-3" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Arbitration_Agreement.pdf</p>
                                            <p className="text-sm text-gray-600">Signed agreement document</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Executed on {formatDate(agreementData.agreementDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
                                            <FaEye className="mr-2" />
                                            View
                                        </button>
                                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
                                            <FaDownload className="mr-2" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="bg-yellow-50 rounded-2xl p-6 max-w-md mx-auto">
                                    <FaExclamationTriangle className="mx-auto text-5xl text-yellow-300 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Agreement Processing</h3>
                                    <p className="text-gray-500 mb-4">
                                        Your arbitration agreement is being processed. Details will be available soon.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {hasAgreementData && (
                        <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <FaCheckCircle className="text-green-600 mr-3 text-xl" />
                                <div>
                                    <p className="font-semibold text-green-800">Agreement Successfully Executed</p>
                                    <p className="text-green-700 text-sm mt-1">
                                        The arbitration agreement has been successfully signed and executed by all parties. 
                                        The arbitration process is now {isCaseOngoing ? 'ongoing' : 'completed'}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default Arb_AgreementDetails;