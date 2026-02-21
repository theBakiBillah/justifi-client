import React, { useState, useEffect } from 'react';
import { 
    FaCalendarAlt, 
    FaCheckCircle, 
    FaClock, 
    FaFilter, 
    FaSearch, 
    FaArrowRight,
    FaVideo,
    FaMapMarkerAlt,
    FaExclamationTriangle,
    FaUserTie,
    FaGavel,
    FaRegCalendarCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Loading from '../../../common/loading/Loading';
import useUserData from "../../../hooks/useUserData";

const UpcomingHearings = () => {
    const { currentUser, loading: userLoading } = useUserData();
    const currentUserEmail = currentUser?.email;
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredHearings, setFilteredHearings] = useState([]);

    // Fetch hearings from backend with email
    useEffect(() => {
        if (currentUserEmail) {
            fetchScheduledHearings();
        }
    }, [currentUserEmail]);

    const fetchScheduledHearings = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('Fetching scheduled hearings for email:', currentUserEmail);
            
            // Email পাঠাচ্ছি query parameter হিসেবে
            const response = await axiosSecure.get('/hearings/status/scheduled', {
                params: {
                    email: currentUserEmail  // Frontend থেকে email পাঠানো
                }
            });
            
            console.log('API Response:', response);
            
            if (response.data.success) {
                setHearings(response.data.data || []);
            } else {
                setError(response.data.message || 'Failed to fetch hearings');
            }
        } catch (err) {
            console.error('Error fetching hearings:', err);
            
            let errorMessage = 'Failed to load hearings. Please try again.';
            
            if (err.response?.status === 401) {
                errorMessage = 'Your session has expired. Please login again.';
            } else if (err.response?.status === 400) {
                errorMessage = err.response?.data?.message || 'Bad request. Please check your data.';
            } else if (err.response?.status === 404) {
                errorMessage = 'No hearings found.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ... rest of the filters and helpers (same as before) ...

    const filterHearings = () => {
        let filtered = hearings.filter(hearing => {
            const matchesFilter = currentFilter === 'all' || 
                (currentFilter === 'thisWeek' && isThisWeek(hearing.date)) ||
                (currentFilter === 'upcoming' && isUpcoming(hearing.date));
            
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' || 
                hearing.arbitrationDetails?.caseTitle?.toLowerCase().includes(searchLower) ||
                hearing.hearingAgenda?.toLowerCase().includes(searchLower) ||
                hearing.arbitrationId?.toLowerCase().includes(searchLower) ||
                hearing.hearingId?.toLowerCase().includes(searchLower);
            
            return matchesFilter && matchesSearch;
        });

        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        setFilteredHearings(filtered);
    };

    const isThisWeek = (date) => {
        const hearingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);
        
        return hearingDate >= today && hearingDate <= nextWeek;
    };

    const isUpcoming = (date) => {
        const hearingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999);
        
        return hearingDate >= today && hearingDate <= threeDaysFromNow;
    };

    useEffect(() => {
        if (hearings.length > 0) {
            filterHearings();
        } else {
            setFilteredHearings([]);
        }
    }, [currentFilter, searchTerm, hearings]);

    const handleFilterChange = (filter) => {
        setCurrentFilter(filter);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleViewDetails = (hearing) => {
        navigate(`/dashboard/hearing-details/${hearing.arbitrationId}/${hearing.hearingId}`);
    };

    const handleRetry = () => {
        fetchScheduledHearings();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLocationIcon = (meetLink) => {
        return meetLink ? <FaVideo className="text-blue-500" /> : <FaMapMarkerAlt className="text-green-500" />;
    };

    const getLocationText = (hearing) => {
        if (hearing.meetLink) {
            try {
                const url = new URL(hearing.meetLink);
                return url.hostname.replace('www.', '');
            } catch {
                return 'Virtual Hearing';
            }
        }
        return 'Physical Location TBD';
    };

    const getUserRoleBadge = (role) => {
        switch(role) {
            case 'presidingArbitrator':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                    <FaGavel className="text-xs" /> Presiding
                </span>;
            case 'arbitrator1':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <FaUserTie className="text-xs" /> Arbitrator 1
                </span>;
            case 'arbitrator2':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                    <FaUserTie className="text-xs" /> Arbitrator 2
                </span>;
            default:
                return null;
        }
    };

    const FilterButton = ({ filter, label, isActive, onClick }) => {
        const baseClasses = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer";
        const activeClasses = "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg";
        const inactiveClasses = "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md";

        return (
            <button
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                onClick={() => onClick(filter)}
            >
                {isActive && <FaCheckCircle className="text-sm" />}
                {label}
            </button>
        );
    };

    const HearingCard = ({ hearing }) => {
        const locationIcon = getLocationIcon(hearing.meetLink);
        const locationText = getLocationText(hearing);
        const hearingDate = new Date(hearing.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isToday = hearingDate.toDateString() === today.toDateString();
        const isTomorrow = hearingDate.toDateString() === new Date(today.getTime() + 24*60*60*1000).toDateString();

        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                 onClick={() => handleViewDetails(hearing)}>
                <div className="p-4">
                    {/* Date Badge */}
                    <div className="mb-2">
                        {isToday ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <FaClock className="text-xs" /> Today
                            </span>
                        ) : isTomorrow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                <FaRegCalendarCheck className="text-xs" /> Tomorrow
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                <FaCalendarAlt className="text-xs" /> {formatDate(hearing.date)}
                            </span>
                        )}
                    </div>

                    {/* Case Title and User Role */}
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 pr-2">
                            {hearing.arbitrationDetails?.caseTitle || 'Untitled Case'}
                        </h3>
                        {getUserRoleBadge(hearing.userRole)}
                    </div>

                    {/* Hearing Number */}
                    <div className="mb-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Hearing #{hearing.hearingNumber || 'N/A'}
                        </span>
                    </div>

                    {/* Time and Duration */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaClock className="text-green-500" />
                            <span className="font-medium">{formatTime(hearing.date)}</span>
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                            {hearing.duration || 60} min
                        </span>
                    </div>

                    {/* Location */}
                    {hearing.meetLink && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            {locationIcon}
                            <span className="truncate text-xs">{locationText}</span>
                        </div>
                    )}

                    {/* Agenda Preview */}
                    {hearing.hearingAgenda && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 line-clamp-2 italic">
                                "{hearing.hearingAgenda}"
                            </p>
                        </div>
                    )}

                    {/* View Details Button */}
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(hearing);
                            }}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group-hover:translate-x-1 duration-300"
                        >
                            View Details
                            <FaArrowRight className="ml-1 text-xs" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Loading states
    if (userLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-6 flex items-center justify-center">
                <div className="text-center">
                    <Loading />
                    <p className="mt-4 text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    if (!currentUserEmail) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-6 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaUserTie className="text-2xl text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Not Logged In
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Please log in to view your scheduled hearings.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-6 flex items-center justify-center">
                <div className="text-center">
                    <Loading />
                    <p className="mt-4 text-gray-600">Fetching your scheduled hearings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaExclamationTriangle className="text-2xl text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Failed to Load Hearings
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {error}
                        </p>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Upcoming Hearings
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                        Manage your scheduled arbitration hearings
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaFilter className="text-blue-600 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Filter Hearings
                                    </label>
                                    <div className="flex flex-wrap gap-1">
                                        <FilterButton
                                            filter="all"
                                            label="All"
                                            isActive={currentFilter === 'all'}
                                            onClick={handleFilterChange}
                                        />
                                        <FilterButton
                                            filter="thisWeek"
                                            label="This Week"
                                            isActive={currentFilter === 'thisWeek'}
                                            onClick={handleFilterChange}
                                        />
                                        <FilterButton
                                            filter="upcoming"
                                            label="Next 3 Days"
                                            isActive={currentFilter === 'upcoming'}
                                            onClick={handleFilterChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaSearch className="text-green-600 text-sm" />
                            </div>
                            <div className="w-full">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        type="text"
                                        placeholder="Search by case title, agenda..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-80 bg-white shadow-sm text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                {hearings.length > 0 && (
                    <div className="mb-4 text-sm text-gray-600">
                        Found <span className="font-bold text-blue-600">{filteredHearings.length}</span> of <span className="font-bold">{hearings.length}</span> scheduled {hearings.length === 1 ? 'hearing' : 'hearings'}
                    </div>
                )}

                {/* Hearings Grid */}
                {filteredHearings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredHearings.map(hearing => (
                            <HearingCard key={hearing.hearingId || hearing._id} hearing={hearing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaCalendarAlt className="text-2xl text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No Scheduled Hearings
                        </h3>
                        <p className="text-gray-600 text-sm max-w-md mx-auto">
                            {currentFilter !== 'all' || searchTerm
                                ? "No hearings match your search criteria. Try adjusting filters."
                                : "You don't have any scheduled hearings at the moment."}
                        </p>
                        {(currentFilter !== 'all' || searchTerm) && (
                            <button
                                onClick={() => {
                                    setCurrentFilter('all');
                                    setSearchTerm('');
                                }}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingHearings;