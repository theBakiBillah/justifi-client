import { useState } from "react";
import { FaFolderOpen, FaUpload, FaFileUpload, FaFilePdf, FaCalendarAlt, FaClock, FaEye, FaDownload } from "react-icons/fa";

const Arb_DocumentsSection = () => {
    const [showUploadForm, setShowUploadForm] = useState(false);

    // Sample documents data - replace with actual data from API
    const userDocuments = [
        {
            id: 1,
            title: "Initial Complaint Document",
            submittedDate: "2024-10-11T10:30:00"
        },
        {
            id: 2,
            title: "Evidence - Contract Agreement",
            submittedDate: "2024-10-12T14:20:00"
        },
        {
            id: 3,
            title: "Witness Statement",
            submittedDate: "2024-10-15T09:15:00"
        }
    ];

    const handleDocumentUpload = (e) => {
        e.preventDefault();
        // Handle document upload logic here
        alert('Document uploaded successfully!');
        setShowUploadForm(false);
        e.target.reset();
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
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

            {/* Upload Document Form */}
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
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors" 
                                placeholder="Enter document title" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File</label>
                            <input 
                                type="file" 
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
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                            >
                                <FaUpload className="inline mr-2" />
                                Upload Document
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Documents List */}
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
                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <FaFilePdf className="text-red-500 mr-3 text-xl" />
                                        <span className="font-medium text-gray-900">{doc.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FaCalendarAlt className="mr-2 text-gray-400" />
                                        {new Date(doc.submittedDate).toLocaleDateString()}
                                        <FaClock className="ml-4 mr-2 text-gray-400" />
                                        {new Date(doc.submittedDate).toLocaleTimeString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                            <FaEye className="text-lg" />
                                        </button>
                                        <button className="text-green-600 hover:text-green-800 transition-colors">
                                            <FaDownload className="text-lg" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {userDocuments.length === 0 && (
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
            )}
        </div>
    );
};

export default Arb_DocumentsSection;