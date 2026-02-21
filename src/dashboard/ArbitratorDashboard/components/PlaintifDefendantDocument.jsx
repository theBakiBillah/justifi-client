import { useState, useEffect } from "react";
import {
    FaUserTie, FaFolderOpen, FaFilePdf,
    FaCalendarAlt, FaClock, FaEye, FaDownload
} from "react-icons/fa";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

// ─── Single party card with its documents ────────────────────────────────────
const PartyCard = ({ party, color, arbitrationId, axiosPublic }) => {

    const palette = {
        blue: {
            cardBorder: "border-blue-300",
            cardHeaderBg: "bg-blue-50",
            cardHeaderBorder: "border-blue-200",
            iconColor: "text-blue-600",
            avatarBorder: "border-blue-300",
            folderIcon: "text-blue-500",
            countBadge: "bg-blue-100 text-blue-700 border-blue-200",
            hoverDoc: "hover:border-blue-300 hover:bg-blue-50",
            scrollHint: "text-blue-400",
        },
        red: {
            cardBorder: "border-red-300",
            cardHeaderBg: "bg-red-50",
            cardHeaderBorder: "border-red-200",
            iconColor: "text-red-600",
            avatarBorder: "border-red-300",
            folderIcon: "text-red-500",
            countBadge: "bg-red-100 text-red-700 border-red-200",
            hoverDoc: "hover:border-red-300 hover:bg-red-50",
            scrollHint: "text-red-400",
        },
    }[color];

    const handleViewFile = async (fileName) => {
        try {
            const response = await axiosPublic.get(`/arbitrationFile/viewFile`, {
                params: { arbitrationId, email: party.email, fileName },
                responseType: "blob",
            });
            const contentType = response.headers["content-type"] || "application/pdf";
            const blob = new Blob([response.data], { type: contentType });
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, "_blank");
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to view file");
        }
    };

    const handleDownloadFile = async (fileName) => {
        try {
            const response = await axiosPublic.get(`/arbitrationFile/downloadFile`, {
                params: { arbitrationId, email: party.email, fileName },
                responseType: "blob",
            });
            const contentType = response.headers["content-type"] || "application/octet-stream";
            const blob = new Blob([response.data], { type: contentType });
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 500);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to download file");
        }
    };

    return (
        <div className={`border-2 ${palette.cardBorder} rounded-xl shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow`}>

            {/* Party Header */}
            <div className={`${palette.cardHeaderBg} px-4 py-3 border-b-2 ${palette.cardHeaderBorder}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 ${palette.avatarBorder}`}>
                            <FaUserTie className={`${palette.iconColor} text-base`} />
                        </div>
                        <div className="ml-3">
                            <h3 className="font-bold text-gray-800">{party.name}</h3>
                            <p className="text-xs text-gray-500">{party.email}</p>
                        </div>
                    </div>
                    <span className={`${palette.countBadge} border text-xs font-semibold px-3 py-1 rounded-full`}>
                        {party.files.length} doc{party.files.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Documents */}
            <div className="p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                    <FaFolderOpen className={`${palette.folderIcon} mr-2`} />
                    Documents
                </h4>

                {party.files.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <FaFolderOpen className="mx-auto text-3xl text-gray-200 mb-2" />
                        <p className="text-gray-400 text-xs">No documents submitted</p>
                    </div>
                ) : (
                    <>
                        <div className={`${party.files.length > 3 ? "max-h-52 overflow-y-auto pr-1" : ""} space-y-2`}>
                            {party.files.map((doc) => (
                                <div
                                    key={doc.fileName}
                                    className={`flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 ${palette.hoverDoc} transition-colors`}
                                >
                                    {/* File info */}
                                    <div className="flex items-center flex-1 min-w-0">
                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                            <FaFilePdf className="text-red-500 text-sm" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {doc.fileTitle}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <FaCalendarAlt />
                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaClock />
                                                    {new Date(doc.uploadedAt).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleViewFile(doc.fileName)}
                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="View"
                                        >
                                            <FaEye className="text-sm" />
                                        </button>
                                        <button
                                            onClick={() => handleDownloadFile(doc.fileName)}
                                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-100 rounded-lg transition-colors"
                                            title="Download"
                                        >
                                            <FaDownload className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {party.files.length > 3 && (
                            <p className={`text-xs ${palette.scrollHint} text-right mt-2`}>
                                ↓ Scroll for more
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Left or Right Panel (Plaintiffs / Defendants) ───────────────────────────
const PartyPanel = ({ title, parties, color, arbitrationId, axiosPublic }) => {

    const palette = {
        blue: {
            gradient: "from-blue-600 to-blue-700",
            badge: "bg-white text-blue-600",
        },
        red: {
            gradient: "from-red-600 to-red-700",
            badge: "bg-white text-red-600",
        },
    }[color];

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1">

            {/* Panel Header */}
            <div className={`bg-gradient-to-r ${palette.gradient} px-6 py-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <FaUserTie className="text-white text-xl" />
                        </div>
                        <h2 className="text-xl font-bold text-white ml-3">{title}</h2>
                    </div>
                    <span className={`${palette.badge} text-sm font-bold px-3 py-1 rounded-full`}>
                        {parties.length} {parties.length === 1 ? "Party" : "Parties"}
                    </span>
                </div>
            </div>

            {/* Party Cards */}
            <div className="p-4 space-y-4">
                {parties.length === 0 ? (
                    <div className="text-center py-12">
                        <FaFolderOpen className="mx-auto text-5xl text-gray-200 mb-3" />
                        <p className="text-gray-400 text-sm">No {title.toLowerCase()} found</p>
                    </div>
                ) : (
                    parties.map((party, idx) => (
                        <PartyCard
                            key={party.partyId || idx}
                            party={party}
                            color={color}
                            arbitrationId={arbitrationId}
                            axiosPublic={axiosPublic}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PlaintifDefendantDocument = ({ arbitrationId }) => {
    const axiosPublic = useAxiosPublic();
    const [plaintiffs, setPlaintiffs] = useState([]);
    const [defendants, setDefendants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllPartyFiles = async () => {
            if (!arbitrationId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // ✅ matches your Postman test: /allPartyFiles?arbitrationId=...
                const res = await axiosPublic.get("/allPartyFiles", {
                    params: { arbitrationId },
                });
                setPlaintiffs(res.data.plaintiffs || []);
                setDefendants(res.data.defendants || []);
            } catch (err) {
                console.error("Failed to fetch party files:", err);
                setError("Failed to load documents. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllPartyFiles();
    }, [arbitrationId]);

    return (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">

            {/* Section Title */}
            <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                    <FaFolderOpen className="inline mr-3 text-indigo-600" />
                    Case Documents
                </h2>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-16 text-gray-400">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    Loading documents...
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl">
                    {error}
                </div>
            )}

            {/* Two Panels */}
            {!loading && !error && (
                <div className="flex flex-col lg:flex-row gap-6">
                    <PartyPanel
                        title="Plaintiffs"
                        parties={plaintiffs}
                        color="blue"
                        arbitrationId={arbitrationId}
                        axiosPublic={axiosPublic}
                    />
                    <PartyPanel
                        title="Defendants"
                        parties={defendants}
                        color="red"
                        arbitrationId={arbitrationId}
                        axiosPublic={axiosPublic}
                    />
                </div>
            )}
        </div>
    );
};

export default PlaintifDefendantDocument;