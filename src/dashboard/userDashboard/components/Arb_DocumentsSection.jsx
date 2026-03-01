import { useState, useEffect } from "react";
import useUserData from "../../../hooks/useUserData";
import axios from "axios";

import { 
    FaFolderOpen, FaUpload, FaFileUpload, FaFilePdf, 
    FaCalendarAlt, FaClock, FaEye, FaDownload, FaTrash 
} from "react-icons/fa";
import useAxiosPublic from "../../../hooks/useAxiosPublic";


const Arb_DocumentsSection = ({ arbitrationId ,email}) => {
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [userDocuments, setUserDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
  const axiosPublic = useAxiosPublic();

     const { currentUser } = useUserData();
 const currentUserEmail = currentUser?.email; 
console.log(currentUserEmail); 
console.log(arbitrationId); 
    // Fetch user's documents
    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await axiosPublic.get("/arbitrationFile/files", {
                params: { arbitrationId, email }
            });

            // res.data.files will contain only the logged-in user's files
            setUserDocuments(res.data.files || []);
        } catch (err) {
            console.error(err);
            setUserDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [arbitrationId, email]);

    // Upload file
    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append("arbitrationId", arbitrationId);
        formData.append("email", email);
       
        try {
            setUploading(true);
            await axiosPublic.post("/arbitrationFile/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Document uploaded successfully!");
            setShowUploadForm(false);
            e.target.reset();
            fetchDocuments();
        } catch (err) {
            console.error(err);
            alert("Upload failed: " + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    // View file
    const handleViewFile = async (fileName) => {
    try {
        if (!arbitrationId || !email) {
            alert("Missing arbitration ID or email");
            return;
        }

        const response = await axiosPublic.get(
            `/arbitrationFile/viewFile`,
            {
                params: { arbitrationId, email, fileName },
                responseType: "blob"
            }
        );

        const contentType = response.headers["content-type"] || "application/pdf";

        const blob = new Blob([response.data], { type: contentType });
        const blobUrl = window.URL.createObjectURL(blob);

        window.open(blobUrl, "_blank");

        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 1000);

    } catch (err) {
        console.error("View error:", err);
        alert(err.response?.data?.message || "Failed to view file");
    }
};

    // Download file
    const handleDownloadFile = async (fileName) => {
    try {
        if (!arbitrationId || !email) {
            alert("Missing arbitration ID or email");
            return;
        }

        const response = await axiosPublic.get(
            `/arbitrationFile/downloadFile`,
            {
                params: { arbitrationId, email, fileName },
                responseType: "blob"
            }
        );

        const contentType = response.headers["content-type"] || "application/octet-stream";

        const blob = new Blob([response.data], { type: contentType });

        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 500);

    } catch (err) {
        console.error("Download error:", err);
        alert(err.response?.data?.message || "Failed to download file");
    }
};


    // Delete file
    const handleDeleteFile = async (fileName) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            await axiosPublic.delete("/arbitrationFile/deleteFile", {
                data: { arbitrationId, email, fileName }
            });
            alert("File deleted successfully!");
            fetchDocuments();
        } catch (err) {
            console.error(err);
            alert("Delete failed: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                    <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        <FaFolderOpen className="inline mr-3 text-green-600" />
                        My Documents
                    </h2>
                </div>
                <button 
                    onClick={() => setShowUploadForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    <FaUpload className="inline mr-2" />
                    Upload Document
                </button>
            </div>

            {/* Upload Form */}
            {showUploadForm && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <FaFileUpload className="text-green-600 text-xl mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">Upload New Document</h3>
                    </div>
                    <form onSubmit={handleDocumentUpload} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Document Title</label>
                            <input 
                                type="text" 
                                name="fileTitle"
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
                                placeholder="Enter document title" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File</label>
                            <input 
                                type="file" 
                                name="file"
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
                                required 
                            />
                            <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</p>
                        </div>
                        <div className="flex justify-end space-x-4 pt-4 border-t border-green-200">
                            <button 
                                type="button" 
                                onClick={() => setShowUploadForm(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={uploading}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                            >
                                <FaUpload className="inline mr-2" />
                                {uploading ? "Uploading..." : "Upload Document"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Documents Table */}
            {loading ? (
                <p className="text-center text-gray-500 py-6">Loading documents...</p>
            ) : userDocuments.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                        <FaFolderOpen className="mx-auto text-6xl text-gray-300 mb-6" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Documents Submitted</h3>
                        <p className="text-gray-500 mb-6">Upload your first document to proceed with the case.</p>
                        <button 
                            onClick={() => setShowUploadForm(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            <FaUpload className="inline mr-2" />
                            Upload First Document
                        </button>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Document Title</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submitted Date & Time</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {userDocuments.map((doc) => (
                                <tr key={doc.fileName} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 flex items-center">
                                        <FaFilePdf className="text-red-500 mr-3 text-xl" />
                                        <span className="font-medium text-gray-900">{doc.fileTitle}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FaCalendarAlt className="mr-2 text-gray-400" />
                                            {new Date(doc.uploadedAt).toLocaleDateString()}
                                            <FaClock className="ml-4 mr-2 text-gray-400" />
                                            {new Date(doc.uploadedAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex space-x-3">
                                        <button onClick={() => handleViewFile(doc.fileName)} className="text-blue-600 hover:text-blue-800 transition-colors">
                                            <FaEye className="text-lg" />
                                        </button>
                                        <button onClick={() => handleDownloadFile(doc.fileName)} className="text-green-600 hover:text-green-800 transition-colors">
                                            <FaDownload className="text-lg" />
                                        </button>
                                        <button onClick={() => handleDeleteFile(doc.fileName)} className="text-red-600 hover:text-red-800 transition-colors">
                                            <FaTrash className="text-lg" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Arb_DocumentsSection;
