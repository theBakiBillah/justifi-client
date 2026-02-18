// dashboard/userDashboard/pages/MyArbitrations.jsx
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaAward,
    FaCalendarAlt,
    FaCalendarCheck,
    FaFilter,
    FaFolderOpen,
    FaRegClock,
    FaTimesCircle,
    FaUserTie,
    FaUsers,
    FaCheckCircle,
    FaSpinner,
    FaSearch,
    FaArrowRight,
    FaFileAlt
} from "react-icons/fa";
import { HiOutlineClipboardCheck, HiOutlineUserGroup } from "react-icons/hi";
import { MdPendingActions } from "react-icons/md";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUserData from "../../../hooks/useUserData";
import Loading from "../../../common/loading/Loading";

const MyArbitrations = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("all");
    const [currentSort, setCurrentSort] = useState("date");
    const [searchTerm, setSearchTerm] = useState("");
    const { currentUser } = useUserData();
    const axiosSecure = useAxiosSecure();

    const {
        data: arbitrations = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["presidingArbitrations", currentUser?.email],
        queryFn: async () => {
            try {
                console.log('Fetching arbitrations for:', currentUser?.email);
                const response = await axiosSecure.get(
                    `/arbitrations/presiding?email=${currentUser?.email}`
                );
                
                if (!response.data.success) {
                    throw new Error(response.data.message || 'Failed to fetch arbitrations');
                }
                
                console.log('Arbitrations data received:', response.data.data);
                return response.data.data || [];
            } catch (error) {
                console.error('Error in query function:', error);
                throw error;
            }
        },
        enabled: !!currentUser?.email,
        retry: 2,
    });

    // Safe filtering and sorting with error handling
    const filteredArbitrations = (arbitrations || [])
        .filter((arbitration) => {
            try {
                // Status filter
                const statusMatch = filter === "all" || arbitration.arbitration_status === filter;
                
                // Search filter
                const searchMatch = 
                    arbitration.caseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    arbitration.disputeNature?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    arbitration.arbitrationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    arbitration.caseCategory?.toLowerCase().includes(searchTerm.toLowerCase());

                return statusMatch && searchMatch;
            } catch (filterError) {
                console.error('Error filtering arbitration:', filterError, arbitration);
                return false;
            }
        })
        .sort((a, b) => {
            try {
                switch (currentSort) {
                    case 'date':
                        return new Date(b.submissionDate || 0) - new Date(a.submissionDate || 0);
                    case 'value':
                        const valueA = parseFloat((a.suitValue || '0').replace(/[^\d.]/g, '') || 0);
                        return valueB - valueA;
                    case 'title':
                        return (a.caseTitle || '').localeCompare(b.caseTitle || '');
                    case 'status':
                        return (a.arbitration_status || '').localeCompare(b.arbitration_status || '');
                    default:
                        return 0;
                }
            } catch (sortError) {
                console.error('Error sorting arbitrations:', sortError);
                return 0;
            }
        });

    // Get status color and text based on arbitration_status
    const getStatusColor = (arbitration_status) => {
        switch ((arbitration_status || '').toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ongoing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (arbitration_status) => {
        switch ((arbitration_status || '').toLowerCase()) {
            case 'pending':
                return 'Pending';
            case 'ongoing':
                return 'Ongoing';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const getStatusIcon = (arbitration_status) => {
        switch ((arbitration_status || '').toLowerCase()) {
            case 'pending':
                return <FaRegClock className="text-yellow-600" />;
            case 'ongoing':
                return <FaSpinner className="text-blue-600" />;
            case 'completed':
                return <FaCheckCircle className="text-green-600" />;
            case 'cancelled':
                return <FaTimesCircle className="text-red-600" />;
            default:
                return <FaRegClock className="text-gray-600" />;
        }
    };

    // Helper function to count parties safely
    const countParties = (arbitration) => {
        try {
            let plaintiffCount = 0;
            let defendantCount = 0;

            if (arbitration.plaintiffs && Array.isArray(arbitration.plaintiffs)) {
                plaintiffCount = arbitration.plaintiffs.length;
            }

            if (arbitration.defendants && Array.isArray(arbitration.defendants)) {
                defendantCount = arbitration.defendants.length;
            }

            return { plaintiffCount, defendantCount };
        } catch (error) {
            console.error('Error counting parties:', error);
            return { plaintiffCount: 0, defendantCount: 0 };
        }
    };

    // Stats cards component
    const StatCard = ({ icon: Icon, value, label, color, gradient }) => (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center`}>
                    <Icon className="text-white text-xl" />
                </div>
            </div>
        </div>
    );

    const FilterButton = ({ filter, label, isActive, onClick, icon: Icon }) => {
        const baseClasses = "px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer";
        const activeClasses = "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg";
        const inactiveClasses = "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md";

        return (
            <button
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                onClick={() => onClick(filter)}
            >
                {Icon && <Icon className="text-sm" />}
                {label}
            </button>
        );
    };

    const handleCardClick = (arbitrationId) => {
        if (!arbitrationId) {
            console.error('No arbitration ID provided');
            return;
        }
        navigate(`/dashboard/arbitration-details/${arbitrationId}`);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (e) => {
        setCurrentSort(e.target.value);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaFolderOpen className="text-3xl text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Failed to Load Arbitrations
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error.message || 'Unable to load arbitration cases information.'}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Calculate stats safely
    const totalCount = arbitrations.length || 0;
    const pendingCount = arbitrations.filter(a => a.arbitration_status === 'Pending').length;
    const ongoingCount = arbitrations.filter(a => a.arbitration_status === 'Ongoing').length;
    const completedCount = arbitrations.filter(a => a.arbitration_status === 'Completed').length;

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-6">
                        <FaFileAlt className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">
                            Arbitration Dashboard
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text">
                        My Arbitrations
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                        Manage and track all arbitration cases where you are the presiding arbitrator
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={HiOutlineUserGroup}
                        value={totalCount}
                        label="Total Cases"
                        color="text-gray-900"
                        gradient="from-blue-500 to-purple-600"
                    />
                    <StatCard
                        icon={MdPendingActions}
                        value={pendingCount}
                        label="Pending Cases"
                        color="text-amber-600"
                        gradient="from-amber-500 to-orange-500"
                    />
                    <StatCard
                        icon={FaSpinner}
                        value={ongoingCount}
                        label="Ongoing Cases"
                        color="text-blue-600"
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <StatCard
                        icon={HiOutlineClipboardCheck}
                        value={completedCount}
                        label="Completed Cases"
                        color="text-emerald-600"
                        gradient="from-emerald-500 to-green-500"
                    />
                </div>

                {/* Rest of your component remains the same... */}
                {/* Filters and Search Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        {/* Status Filter */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FaFilter className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">
                                    Filter by Status
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { key: "all", label: "All Cases", icon: FaCalendarCheck },
                                        { key: "Pending", label: "Pending", icon: FaRegClock },
                                        { key: "Ongoing", label: "Ongoing", icon: FaSpinner },
                                        { key: "Completed", label: "Completed", icon: FaCheckCircle },
                                        { key: "Cancelled", label: "Cancelled", icon: FaTimesCircle },
                                    ].map(({ key, label, icon: Icon }) => (
                                        <FilterButton
                                            key={key}
                                            filter={key}
                                            label={label}
                                            icon={Icon}
                                            isActive={filter === key}
                                            onClick={setFilter}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sort and Search */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Sort */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <FaCalendarAlt className="text-purple-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort by
                                    </label>
                                    <select
                                        value={currentSort}
                                        onChange={handleSortChange}
                                        className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm min-w-[140px]"
                                    >
                                        <option value="date">Date</option>
                                        <option value="value">Suit Value</option>
                                        <option value="title">Title</option>
                                        <option value="status">Status</option>
                                    </select>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <FaSearch className="text-green-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Cases
                                    </label>
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by title, nature, or ID..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-80 bg-white shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arbitration Cards Grid */}
                {filteredArbitrations.length === 0 ? (
                    <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaFolderOpen className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No arbitration cases found
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            {filter === "all" && !searchTerm
                                ? "You don't have any arbitration cases as presiding arbitrator yet."
                                : `No arbitration cases match your current filter or search criteria.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArbitrations.map((arbitration) => {
                            try {
                                const statusColor = getStatusColor(arbitration.arbitration_status);
                                const statusText = getStatusText(arbitration.arbitration_status);
                                const statusIcon = getStatusIcon(arbitration.arbitration_status);
                                const { plaintiffCount, defendantCount } = countParties(arbitration);
                                
                                return (
                                    <div 
                                        key={arbitration._id || arbitration.arbitrationId}
                                        onClick={() => handleCardClick(arbitration._id)}
                                        className="bg-white rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border gap-1 ${statusColor}`}>
                                                    {statusIcon}
                                                    {statusText}
                                                </span>
                                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                    {arbitration.arbitrationId}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {arbitration.caseTitle || 'Untitled Case'}
                                            </h3>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {arbitration.disputeNature || 'No description available'}
                                            </p>

                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Suit Value:</span>
                                                    <span className="text-lg font-bold text-green-600">
                                                        BDT {parseInt(arbitration.suitValue || 0).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Fee:</span>
                                                    <span className="text-sm font-medium text-blue-600">
                                                        BDT {arbitration.processingFee || 0}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>Plaintiffs: {plaintiffCount}</span>
                                                    <span>Defendants: {defendantCount}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <span className="text-sm text-gray-500">Filed:</span>
                                                <span className="text-sm font-medium text-gray-600">
                                                    {arbitration.submissionDate ? new Date(arbitration.submissionDate).toLocaleDateString() : 'Unknown'}
                                                </span>
                                            </div>

                                            {/* View Details Button */}
                                            <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                                                <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group-hover:translate-x-1 duration-300">
                                                    View Details
                                                    <FaArrowRight className="ml-2 text-xs" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } catch (cardError) {
                                console.error('Error rendering arbitration card:', cardError, arbitration);
                                return null;
                            }
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MyArbitrations;