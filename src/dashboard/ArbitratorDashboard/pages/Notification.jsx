import React, { useState, useEffect } from 'react';
import { 
    FaBell, 
    FaCheckCircle, 
    FaFilter,
    FaFileContract,
    FaUserShield,
    FaTimes
} from 'react-icons/fa';

const Notification = () => {
    const [notifications] = useState([
        {
            id: 'NOT-001',
            title: 'New Case Assignment',
            message: 'You have been assigned to Commercial Contract Dispute case',
            type: 'arbitration',
            status: 'unread',
            timestamp: '2024-12-10T10:30:00',
            caseId: 'ARB-001'
        },
        {
            id: 'NOT-002',
            title: 'Hearing Reminder',
            message: 'Upcoming hearing for Property Ownership Conflict tomorrow at 10:00 AM',
            type: 'client',
            status: 'unread',
            timestamp: '2024-12-10T09:15:00',
            caseId: 'ARB-002'
        },
        {
            id: 'NOT-003',
            title: 'Document Submission',
            message: 'New documents uploaded for Business Partnership Dissolution case',
            type: 'client',
            status: 'read',
            timestamp: '2024-12-09T16:45:00',
            caseId: 'ARB-003'
        },
        {
            id: 'NOT-004',
            title: 'System Maintenance',
            message: 'Scheduled system maintenance on December 15th from 2:00 AM to 4:00 AM',
            type: 'admin',
            status: 'read',
            timestamp: '2024-12-09T14:20:00'
        },
        {
            id: 'NOT-005',
            title: 'Profile Update Required',
            message: 'Please update your arbitrator profile information for verification',
            type: 'admin',
            status: 'unread',
            timestamp: '2024-12-09T11:30:00'
        },
        {
            id: 'NOT-006',
            title: 'Decision Deadline',
            message: 'Decision due in 3 days for Construction Contract Breach case',
            type: 'client',
            status: 'unread',
            timestamp: '2024-12-08T17:00:00',
            caseId: 'ARB-006'
        }
    ]);

    const [currentFilter, setCurrentFilter] = useState('all');
    const [filteredNotifications, setFilteredNotifications] = useState([]);

    useEffect(() => {
        filterNotifications();
    }, [currentFilter, notifications]);

    const filterNotifications = () => {
        let filtered = notifications.filter(notif => {
            const matchesStatus = currentFilter === 'all' || notif.type === currentFilter;
            return matchesStatus;
        });

        // Sort by timestamp (newest first)
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setFilteredNotifications(filtered);
    };

    const handleFilterChange = (filter) => {
        setCurrentFilter(filter);
    };

    const markAsRead = (id) => {
        // In real app, you would update the notification status in backend
        console.log(`Marked notification ${id} as read`);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'client': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'client': return <FaFileContract className="text-sm" />;
            case 'admin': return <FaUserShield className="text-sm" />;
            default: return <FaBell className="text-sm" />;
        }
    };

    const FilterButton = ({ filter, label, isActive, onClick }) => {
        const baseClasses = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer";
        const activeClasses = "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md";
        const inactiveClasses = "bg-white text-gray-700 border border-gray-200 hover:border-blue-300";

        return (
            <button
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                onClick={() => onClick(filter)}
            >
                {isActive && <FaCheckCircle className="text-xs" />}
                {label}
            </button>
        );
    };

    const NotificationCard = ({ notification }) => {
        const typeColor = getTypeColor(notification.type);
        const typeIcon = getTypeIcon(notification.type);

        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${typeColor} gap-1`}>
                                {typeIcon}
                                {notification.type}
                            </span>
                            {notification.status === 'unread' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    New
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
                        {notification.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {notification.message}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                            {notification.caseId ? `Case: ${notification.caseId}` : 'System Notification'}
                        </span>
                        <div className="flex gap-2">
                            {notification.status === 'unread' && (
                                <button 
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors"
                                >
                                    Mark Read
                                </button>
                            )}
                            <button className="text-gray-600 hover:text-gray-700 font-medium text-xs transition-colors">
                                View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-6">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-4">
                        <FaBell className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-600">
                            Notifications
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        My Notifications
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Stay updated with important alerts and updates
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaFilter className="text-blue-600 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Filter Notifications
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <FilterButton
                                        filter="all"
                                        label="All Notification"
                                        isActive={currentFilter === 'all'}
                                        onClick={handleFilterChange}
                                    />
                                    <FilterButton
                                        filter="client"
                                        label="Client"
                                        isActive={currentFilter === 'client'}
                                        onClick={handleFilterChange}
                                    />
                                    <FilterButton
                                        filter="admin"
                                        label="Admin"
                                        isActive={currentFilter === 'admin'}
                                        onClick={handleFilterChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredNotifications.map(notification => (
                        <NotificationCard key={notification.id} notification={notification} />
                    ))}
                </div>

                {/* Empty State */}
                {filteredNotifications.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaBell className="text-2xl text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No Notifications
                        </h3>
                        <p className="text-gray-600 text-sm max-w-md mx-auto">
                            {currentFilter !== 'all'
                                ? "No notifications match your current filter."
                                : "You're all caught up! New notifications will appear here."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notification;