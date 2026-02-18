// dashboard/userDashboard/components/AgreementDetails.jsx
import { useState, useEffect } from "react";
import { FaHandshake, FaCalendarAlt, FaClock, FaVideo, FaCalendarCheck, FaFilePdf, FaDownload, FaEye, FaCheckCircle, FaTimes, FaInfoCircle, FaExclamationTriangle, FaUserTie, FaSpinner } from "react-icons/fa";
import axios from "axios";
import useUserData from "../../../hooks/useUserData";

const Arb_AgreementDetails = ({ arbitration, userEmail, userRole }) => {
    const [agreementFiles, setAgreementFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);
    
    const isCaseCancelled = arbitration.arbitration_status?.toLowerCase() === 'cancelled';
    const isCasePending = arbitration.arbitration_status?.toLowerCase() === 'pending';
    const isCaseOngoing = arbitration.arbitration_status?.toLowerCase() === 'ongoing';
    const isCaseCompleted = arbitration.arbitration_status?.toLowerCase() === 'completed';

    const { currentUser } = useUserData();
    const currentUserEmail = currentUser?.email; 

    // Fetch agreement files when component mounts for ongoing/completed cases
    useEffect(() => {
        if ((isCaseOngoing || isCaseCompleted) && arbitration.arbitrationId) {
            fetchAgreementFiles();
        }
    }, [arbitration.arbitrationId, isCaseOngoing, isCaseCompleted]);

    // Fetch agreement files from backend
    const fetchAgreementFiles = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `http://localhost:5000/arbitrationFile/allArbitrationFile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Find the specific arbitration files
            const arbitrationFiles = response.data.find(
                file => file.arbitrationId === arbitration.arbitrationId
            );
            
            if (arbitrationFiles && arbitrationFiles.agreementFiles) {
                // Sort files by upload date (newest first)
                const sortedFiles = arbitrationFiles.agreementFiles.sort((a, b) => {
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
                });
                setAgreementFiles(sortedFiles);
            }
        } catch (err) {
            console.error("Error fetching agreement files:", err);
            setError("Failed to load agreement files");
        } finally {
            setLoading(false);
        }
    };

    // Handle view file
    const handleViewFile = async (fileName) => {
        try {
            if (!currentUserEmail) {
                alert("User email not found. Please log in again.");
                return;
            }

            setViewingFile(fileName);
            
            const token = localStorage.getItem('token');
            
            console.log("Viewing file with:", {
                arbitrationId: arbitration.arbitrationId,
                email: currentUserEmail,
                fileName: fileName
            });
            
            const response = await axios.get(
                `http://localhost:5000/arbitrationFile/agreement/file/${arbitration.arbitrationId}?email=${encodeURIComponent(currentUserEmail)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: 'blob',
                    timeout: 30000
                }
            );
            
            console.log("Response received:", {
                status: response.status,
                contentType: response.headers['content-type'],
                dataSize: response.data?.size
            });
            
            // Check if response is actually an error (JSON) instead of a file
            if (response.headers['content-type']?.includes('application/json')) {
                // This is an error response
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        console.error("Error from server:", errorData);
                        alert(errorData.message || "Failed to view file");
                    } catch (e) {
                        alert("Failed to view file");
                    }
                };
                reader.readAsText(response.data);
                return;
            }
            
            // Get the content type from response headers
            const contentType = response.headers['content-type'] || 'application/pdf';
            
            // Create a blob with the correct type
            const blob = new Blob([response.data], { type: contentType });
            
            // Create blob URL
            const blobUrl = window.URL.createObjectURL(blob);
            
            // For PDF files, open in new tab
            if (contentType.includes('pdf')) {
                window.open(blobUrl, '_blank');
            } else {
                // For other file types, create a link to open
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('target', '_blank');
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
            
            // Clean up after a delay
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 1000);
            
        } catch (err) {
            console.error("Error viewing file:", err);
            
            if (err.code === 'ECONNABORTED') {
                alert("Request timeout. Please try again.");
            } else if (err.response) {
                console.error("Error response:", {
                    status: err.response.status,
                    data: err.response.data,
                    headers: err.response.headers
                });
                
                if (err.response.status === 403) {
                    alert("You don't have permission to view this agreement file.");
                } else if (err.response.status === 404) {
                    alert("Agreement file not found.");
                } else {
                    alert(`Failed to view file: ${err.response.status} error`);
                }
            } else if (err.request) {
                console.error("No response received:", err.request);
                alert("No response from server. Please check your connection.");
            } else {
                console.error("Error setting up request:", err.message);
                alert("Failed to view file. Please try again.");
            }
        } finally {
            setViewingFile(null);
        }
    };

    // Handle download file
    const handleDownloadFile = async (fileName, fileTitle) => {
        try {
            if (!currentUserEmail) {
                alert("User email not found. Please log in again.");
                return;
            }

            setDownloading(true);
            
            const token = localStorage.getItem('token');
            
            console.log("Downloading file with:", {
                arbitrationId: arbitration.arbitrationId,
                email: currentUserEmail,
                fileName: fileName
            });
            
            const response = await axios.get(
                `http://localhost:5000/arbitrationFile/agreement/file/${arbitration.arbitrationId}?email=${encodeURIComponent(currentUserEmail)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: 'blob',
                    timeout: 30000
                }
            );
            
            console.log("Download response received:", {
                status: response.status,
                contentType: response.headers['content-type'],
                dataSize: response.data?.size
            });
            
            // Check if response is actually an error (JSON) instead of a file
            if (response.headers['content-type']?.includes('application/json')) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        console.error("Error from server:", errorData);
                        alert(errorData.message || "Failed to download file");
                    } catch (e) {
                        alert("Failed to download file");
                    }
                };
                reader.readAsText(response.data);
                return;
            }
            
            // Get the content type from response headers
            const contentType = response.headers['content-type'] || 'application/pdf';
            
            // Create a blob with the correct type
            const blob = new Blob([response.data], { type: contentType });
            
            // Get filename from Content-Disposition header or use the provided title
            const contentDisposition = response.headers['content-disposition'];
            let filename = fileTitle || `agreement_${arbitration.arbitrationId}.pdf`;
            
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '');
                }
            }
            
            // Create download link
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Clean up
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 100);
            
        } catch (err) {
            console.error("Error downloading file:", err);
            
            if (err.code === 'ECONNABORTED') {
                alert("Request timeout. Please try again.");
            } else if (err.response) {
                if (err.response.status === 403) {
                    alert("You don't have permission to download this agreement file.");
                } else if (err.response.status === 404) {
                    alert("Agreement file not found.");
                } else {
                    alert(`Failed to download file: ${err.response.status} error`);
                }
            } else if (err.request) {
                alert("No response from server. Please check your connection.");
            } else {
                alert("Failed to download file. Please try again.");
            }
        } finally {
            setDownloading(false);
        }
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

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return "Unknown size";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

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
                        
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <FaSpinner className="animate-spin text-4xl text-teal-600" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <div className="bg-red-50 rounded-2xl p-6 max-w-md mx-auto">
                                    <FaExclamationTriangle className="mx-auto text-5xl text-red-300 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Files</h3>
                                    <p className="text-gray-500 mb-4">{error}</p>
                                    <button 
                                        onClick={fetchAgreementFiles}
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : hasAgreementData || agreementFiles.length > 0 ? (
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
                                                        {formatDate(arbitration.agreementDate || (agreementFiles[0]?.uploadedAt))}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {arbitration.justifiRepresentative && (
                                                <div className="flex items-start">
                                                    <FaUserTie className="text-green-600 mr-3 text-xl mt-1" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">JustiFi Representative</p>
                                                        <p className="text-gray-600">
                                                            {arbitration.justifiRepresentative.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {arbitration.justifiRepresentative.designation}
                                                        </p>
                                                        {arbitration.justifiRepresentative.email && (
                                                            <p className="text-sm text-blue-600">
                                                                {arbitration.justifiRepresentative.email}
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
                                                <p className="font-semibold text-gray-900">{arbitration.complianceDays || 'N/A'} days</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Estimated Sittings</p>
                                                <p className="font-semibold text-gray-900">{arbitration.sittings || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Total Cost</p>
                                                <p className="font-semibold text-gray-900">${arbitration.totalCost || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Agreement Documents */}
                                {agreementFiles.length > 0 ? (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Agreement Documents</h4>
                                        <div className="space-y-4">
                                            {agreementFiles.map((file, index) => (
                                                <div 
                                                    key={index} 
                                                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center flex-1">
                                                        <FaFilePdf className="text-red-500 text-2xl mr-3" />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{file.fileTitle}</p>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                                <p className="text-gray-600">
                                                                    Version {file.version || 1}
                                                                </p>
                                                                <p className="text-gray-500">
                                                                    {formatFileSize(file.fileSize)}
                                                                </p>
                                                                <p className="text-gray-500">
                                                                    Uploaded: {formatDate(file.uploadedAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2 ml-4">
                                                        <button 
                                                            onClick={() => handleViewFile(file.fileName)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                                            disabled={viewingFile === file.fileName || downloading}
                                                        >
                                                            {viewingFile === file.fileName ? (
                                                                <FaSpinner className="animate-spin mr-2" />
                                                            ) : (
                                                                <FaEye className="mr-2" />
                                                            )}
                                                            View
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownloadFile(file.fileName, file.fileTitle)}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                                            disabled={downloading}
                                                        >
                                                            {downloading ? (
                                                                <FaSpinner className="animate-spin mr-2" />
                                                            ) : (
                                                                <FaDownload className="mr-2" />
                                                            )}
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="bg-yellow-50 rounded-2xl p-6 max-w-md mx-auto">
                                            <FaExclamationTriangle className="mx-auto text-5xl text-yellow-300 mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Documents Available</h3>
                                            <p className="text-gray-500 mb-4">
                                                The agreement documents are being processed. Please check back later.
                                            </p>
                                        </div>
                                    </div>
                                )}
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

                    {hasAgreementData && agreementFiles.length > 0 && (
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