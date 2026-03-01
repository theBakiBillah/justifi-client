import { useState, useEffect } from "react";
import {
    FaHandshake,
    FaFilePdf,
    FaDownload,
    FaEye,
    FaExclamationTriangle,
    FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import useUserData from "../../../hooks/useUserData";

const Arb_AgreementDetails = ({ arbitration }) => {
    const [agreementFiles, setAgreementFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);

    const { currentUser } = useUserData();
    const currentUserEmail = currentUser?.email;

    const isCaseOngoing = arbitration.arbitration_status?.toLowerCase() === "ongoing";
    const isCaseCompleted = arbitration.arbitration_status?.toLowerCase() === "completed";

    // Fetch agreement files when component mounts for ongoing/completed cases
    useEffect(() => {
        if ((isCaseOngoing || isCaseCompleted) && arbitration.arbitrationId) {
            fetchAgreementFiles();
        }
    }, [arbitration.arbitrationId, isCaseOngoing, isCaseCompleted]);

    const fetchAgreementFiles = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/arbitrationFile/allArbitrationFile`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const arbitrationFiles = response.data.find(
                (file) => file.arbitrationId === arbitration.arbitrationId
            );

            if (arbitrationFiles && arbitrationFiles.agreementFiles) {
                const sortedFiles = arbitrationFiles.agreementFiles.sort(
                    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
                );
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

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/arbitrationFile/agreement/file/${arbitration.arbitrationId}?email=${encodeURIComponent(currentUserEmail)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                    timeout: 30000,
                }
            );

            if (response.headers["content-type"]?.includes("application/json")) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        alert(errorData.message || "Failed to view file");
                    } catch {
                        alert("Failed to view file");
                    }
                };
                reader.readAsText(response.data);
                return;
            }

            const contentType = response.headers["content-type"] || "application/pdf";
            const blob = new Blob([response.data], { type: contentType });
            const blobUrl = window.URL.createObjectURL(blob);

            if (contentType.includes("pdf")) {
                window.open(blobUrl, "_blank");
            } else {
                const link = document.createElement("a");
                link.href = blobUrl;
                link.setAttribute("target", "_blank");
                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        } catch (err) {
            console.error("Error viewing file:", err);
            if (err.code === "ECONNABORTED") {
                alert("Request timeout. Please try again.");
            } else if (err.response?.status === 403) {
                alert("You don't have permission to view this agreement file.");
            } else if (err.response?.status === 404) {
                alert("Agreement file not found.");
            } else {
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

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/arbitrationFile/agreement/file/${arbitration.arbitrationId}?email=${encodeURIComponent(currentUserEmail)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                    timeout: 30000,
                }
            );

            if (response.headers["content-type"]?.includes("application/json")) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        alert(errorData.message || "Failed to download file");
                    } catch {
                        alert("Failed to download file");
                    }
                };
                reader.readAsText(response.data);
                return;
            }

            const contentType = response.headers["content-type"] || "application/pdf";
            const blob = new Blob([response.data], { type: contentType });

            const contentDisposition = response.headers["content-disposition"];
            let filename = fileTitle || `agreement_${arbitration.arbitrationId}.pdf`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) filename = match[1].replace(/['"]/g, "");
            }

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } catch (err) {
            console.error("Error downloading file:", err);
            if (err.code === "ECONNABORTED") {
                alert("Request timeout. Please try again.");
            } else if (err.response?.status === 403) {
                alert("You don't have permission to download this agreement file.");
            } else if (err.response?.status === 404) {
                alert("Agreement file not found.");
            } else {
                alert("Failed to download file. Please try again.");
            }
        } finally {
            setDownloading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "Invalid date";
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "Unknown size";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    // Don't render the section at all if case is not ongoing/completed
    if (!isCaseOngoing && !isCaseCompleted) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            {/* Header */}
            <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-teal-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                    <FaHandshake className="inline mr-3 text-teal-600" />
                    Agreement Documents
                </h2>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <FaSpinner className="animate-spin text-4xl text-teal-600" />
                </div>
            )}

            {/* Error */}
            {!loading && error && (
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
            )}

            {/* No documents */}
            {!loading && !error && agreementFiles.length === 0 && (
                <div className="text-center py-8">
                    <div className="bg-yellow-50 rounded-2xl p-6 max-w-md mx-auto">
                        <FaExclamationTriangle className="mx-auto text-5xl text-yellow-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Documents Available</h3>
                        <p className="text-gray-500">
                            The agreement documents are being processed. Please check back later.
                        </p>
                    </div>
                </div>
            )}

            {/* Documents list */}
            {!loading && !error && agreementFiles.length > 0 && (
                <div className="space-y-4">
                    {agreementFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center flex-1">
                                <FaFilePdf className="text-red-500 text-2xl mr-3 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900">{file.fileTitle}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span>Version {file.version || 1}</span>
                                        <span>{formatFileSize(file.fileSize)}</span>
                                        <span>Uploaded: {formatDate(file.uploadedAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                                <button
                                    onClick={() => handleViewFile(file.fileName)}
                                    disabled={viewingFile === file.fileName || downloading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
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
                                    disabled={downloading}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
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
            )}
        </div>
    );
};

export default Arb_AgreementDetails;