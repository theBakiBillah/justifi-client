import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useMediationData from "../../../../hooks/useMediationData";
import MediationCard from "./MediationCard";
import SessionModal from "./SessionModal";

const MediationManagement = () => {
    const { allMediations, refetchMediations } = useMediationData();
    const navigate = useNavigate();
    const [selectedMediation, setSelectedMediation] = useState(null);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const openSessionModal = (mediation) => {
        setSelectedMediation(mediation);
        setIsSessionModalOpen(true);
    };

    const closeSessionModal = () => {
        setIsSessionModalOpen(false);
        setSelectedMediation(null);
        refetchMediations();
    };

    const viewDetails = (mediation) => {
        navigate(`/admin/mediations/${mediation._id}`, {
            state: { mediation },
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Get unique categories for filter
    const categories = ["All", ...new Set(allMediations.map(m => m.caseCategory).filter(Boolean))];

    // Filter mediations based on selected filters
    const filteredMediations = allMediations.filter((mediation) => {
        const statusMatch =
            statusFilter === "All" ||
            mediation.mediation_staus === statusFilter;
        
        const paymentMatch =
            paymentFilter === "All" ||
            (paymentFilter === "Paid" && mediation.payment_status) ||
            (paymentFilter === "Unpaid" && !mediation.payment_status);
        
        const categoryMatch =
            categoryFilter === "All" ||
            mediation.caseCategory === categoryFilter;

        return statusMatch && paymentMatch && categoryMatch;
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Mediation Management
            </h1>
            <p className="text-gray-600 mb-6">
                Manage and monitor all mediation cases
            </p>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">
                        Total Cases
                    </h3>
                    <p className="text-2xl font-bold text-gray-800">
                        {allMediations.length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">
                        Pending Cases
                    </h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        {
                            allMediations.filter(
                                (item) => item.mediation_status === "pending"
                            ).length
                        }
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">
                        Completed Cases
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                        {
                            allMediations.filter(
                                (item) => item.mediation_status === "completed"
                            ).length
                        }
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">
                        Pending Payments
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                        {
                            allMediations.filter(
                                (item) => !item.payment_status
                            ).length
                        }
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Payment
                        </label>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Payments</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Category
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Mediation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMediations.map((mediation) => (
                    <MediationCard
                        key={mediation._id}
                        mediation={mediation}
                        onViewDetails={viewDetails}
                        onCreateSession={openSessionModal}
                        formatDate={formatDate}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredMediations.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">⚖️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No mediation cases found
                    </h3>
                    <p className="text-gray-500">
                        {allMediations.length === 0
                            ? "No mediation cases have been submitted yet."
                            : "No cases match your current filters."}
                    </p>
                </div>
            )}

            {/* Create Session Modal */}
            {isSessionModalOpen && selectedMediation && (
                <SessionModal
                    mediation={selectedMediation}
                    onClose={closeSessionModal}
                />
            )}
        </div>
    );
};

export default MediationManagement;