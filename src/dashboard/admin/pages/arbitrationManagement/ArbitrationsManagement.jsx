import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useArbData from "../../../../hooks/useArbData";
import ArbitrationCard from "./ArbitrationCard";
import SessionModal from "./SessionModal";

const ArbitrationsManagement = () => {
    const { allArbitrations, refetchArbitrations } = useArbData();
    const navigate = useNavigate();
    const [selectedArbitration, setSelectedArbitration] = useState(null);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");

    const openSessionModal = (arbitration) => {
        setSelectedArbitration(arbitration);
        setIsSessionModalOpen(true);
    };

    const closeSessionModal = () => {
        setIsSessionModalOpen(false);
        setSelectedArbitration(null);
        refetchArbitrations();
    };

    const viewDetails = (arbitration) => {
        navigate(`/admin/arbitrations/${arbitration._id}`, {
            state: { arbitration },
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Filter arbitrations based on selected filters
    const filteredArbitrations = allArbitrations.filter((arbitration) => {
        const statusMatch =
            statusFilter === "All" ||
            arbitration.arbitration_status === statusFilter;
        const paymentMatch =
            paymentFilter === "All" ||
            (paymentFilter === "Paid" && arbitration.payment_status) ||
            (paymentFilter === "Unpaid" && !arbitration.payment_status);
        return statusMatch && paymentMatch;
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Arbitrations Management
            </h1>
            <p className="text-gray-600 mb-6">
                Manage and monitor all arbitration cases
            </p>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">
                        Total Cases
                    </h3>
                    <p className="text-2xl font-bold text-gray-800">
                        {allArbitrations.length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">
                        Pending Cases
                    </h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        {
                            allArbitrations.filter(
                                (item) => item.arbitration_status === "Pending"
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
                            allArbitrations.filter(
                                (item) =>
                                    item.arbitration_status === "Completed"
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
                            allArbitrations.filter(
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
                </div>
            </div>

            {/* Arbitration Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArbitrations.map((arbitration) => (
                    <ArbitrationCard
                        key={arbitration._id}
                        arbitration={arbitration}
                        onViewDetails={viewDetails}
                        onCreateSession={openSessionModal}
                        formatDate={formatDate}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredArbitrations.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No arbitration cases found
                    </h3>
                    <p className="text-gray-500">
                        {allArbitrations.length === 0
                            ? "No arbitration cases have been submitted yet."
                            : "No cases match your current filters."}
                    </p>
                </div>
            )}

            {/* Create Session Modal */}
            {isSessionModalOpen && selectedArbitration && (
                <SessionModal
                    arbitration={selectedArbitration}
                    onClose={closeSessionModal}
                />
            )}
        </div>
    );
};

export default ArbitrationsManagement;
