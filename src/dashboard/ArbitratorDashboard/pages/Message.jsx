import React, { useState, useEffect } from 'react';
import { 
    FaEnvelope, 
    FaCheckCircle, 
    FaClock, 
    FaFilter, 
    FaSearch, 
    FaUserCircle,
    FaPaperPlane,
    FaReply,
    FaTrash,
    FaArrowRight
} from 'react-icons/fa';
import { HiOutlineMail, HiOutlineUserGroup } from 'react-icons/hi';
import { MdMarkEmailRead, MdOutlineMarkEmailUnread } from 'react-icons/md';

const Messages = () => {
    const [messages] = useState([
        {
            id: 'MSG-001',
            from: 'plaintiff1@email.com',
            fromName: 'John Smith',
            subject: 'Document Submission for ARB-001',
            preview: 'I have uploaded the requested documents for the commercial contract dispute case...',
            caseId: 'ARB-001',
            caseTitle: 'Commercial Contract Dispute',
            timestamp: '2024-12-10T14:30:00',
            status: 'unread',
            type: 'case_related'
        },
        {
            id: 'MSG-002',
            from: 'defendant2@email.com',
            fromName: 'Sarah Johnson',
            subject: 'Clarification Request',
            preview: 'Could you please clarify the hearing schedule for next week?',
            caseId: 'ARB-002',
            caseTitle: 'Property Ownership Conflict',
            timestamp: '2024-12-10T11:15:00',
            status: 'read',
            type: 'inquiry'
        },
        {
            id: 'MSG-003',
            from: 'co-arbitrator@email.com',
            fromName: 'Dr. Michael Chen',
            subject: 'Case Discussion - ARB-003',
            preview: 'Let\'s schedule a meeting to discuss the partnership dissolution case...',
            caseId: 'ARB-003',
            caseTitle: 'Business Partnership Dissolution',
            timestamp: '2024-12-09T16:45:00',
            status: 'read',
            type: 'internal'
        },
        {
            id: 'MSG-004',
            from: 'admin@adr-system.com',
            fromName: 'System Administrator',
            subject: 'New Case Assignment',
            preview: 'You have been assigned to a new arbitration case. Please review the details...',
            caseId: 'ARB-004',
            caseTitle: 'Employment Termination Dispute',
            timestamp: '2024-12-09T10:20:00',
            status: 'unread',
            type: 'system'
        },
        {
            id: 'MSG-005',
            from: 'plaintiff3@email.com',
            fromName: 'Robert Wilson',
            subject: 'Evidence Submission',
            preview: 'Additional evidence has been submitted for the intellectual property case...',
            caseId: 'ARB-005',
            caseTitle: 'Intellectual Property Rights',
            timestamp: '2024-12-08T15:30:00',
            status: 'read',
            type: 'case_related'
        },
        {
            id: 'MSG-006',
            from: 'defendant4@email.com',
            fromName: 'Emily Davis',
            subject: 'Settlement Proposal',
            preview: 'We would like to propose a settlement for the construction contract case...',
            caseId: 'ARB-006',
            caseTitle: 'Construction Contract Breach',
            timestamp: '2024-12-08T09:45:00',
            status: 'unread',
            type: 'settlement'
        }
    ]);

    const [currentFilter, setCurrentFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMessages, setFilteredMessages] = useState([]);

    // Stats calculation
    const stats = {
        total: messages.length,
        unread: messages.filter(msg => msg.status === 'unread').length,
        caseRelated: messages.filter(msg => msg.type === 'case_related').length,
        today: messages.filter(msg => new Date(msg.timestamp).toDateString() === new Date().toDateString()).length,
    };

    useEffect(() => {
        filterMessages();
    }, [currentFilter, searchTerm, messages]);

    const filterMessages = () => {
        let filtered = messages.filter(msg => {
            const matchesStatus = currentFilter === 'all' || msg.type === currentFilter;
            const matchesSearch = 
                msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.caseTitle.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        // Sort by timestamp (newest first)
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setFilteredMessages(filtered);
    };

    const handleFilterChange = (filter) => {
        setCurrentFilter(filter);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const markAsRead = (id) => {
        // In real app, you would update the message status in backend
        console.log(`Marked message ${id} as read`);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'case_related': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'inquiry': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'internal': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'system': return 'bg-green-100 text-green-800 border-green-200';
            case 'settlement': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
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

    const FilterButton = ({ filter, label, isActive, onClick }) => {
        const baseClasses = "px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer";
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

    const MessageCard = ({ message }) => {
        const typeColor = getTypeColor(message.type);

        return (
            <div className="bg-white rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${typeColor}`}>
                                {message.type.replace('_', ' ')}
                            </span>
                            {message.status === 'unread' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    New
                                </span>
                            )}
                        </div>
                        <span className="text-sm text-gray-500">
                            {new Date(message.timestamp).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaUserCircle className="text-blue-600 text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {message.subject}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                                From: <span className="font-medium">{message.fromName}</span> • Case: {message.caseId}
                            </p>
                            <p className="text-gray-600 text-sm line-clamp-2">
                                {message.preview}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">{message.caseTitle}</span>
                        <div className="flex gap-3">
                            {message.status === 'unread' && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(message.id);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center gap-1"
                                >
                                    <MdMarkEmailRead />
                                    Mark Read
                                </button>
                            )}
                            <button className="text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors flex items-center gap-1">
                                <FaReply />
                                Reply
                            </button>
                            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300">
                                View Details
                                <FaArrowRight className="text-xs" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-6">
                        <FaEnvelope className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">
                            Messages Center
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        My Messages
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Communicate with parties and manage all case-related correspondence
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        icon={HiOutlineMail}
                        label="Total Messages"
                        value={stats.total}
                        color="text-gray-900"
                        gradient="from-blue-500 to-purple-600"
                    />
                    <StatCard
                        icon={MdOutlineMarkEmailUnread}
                        label="Unread"
                        value={stats.unread}
                        color="text-amber-600"
                        gradient="from-amber-500 to-orange-500"
                    />
                    <StatCard
                        icon={HiOutlineUserGroup}
                        label="Case Related"
                        value={stats.caseRelated}
                        color="text-blue-600"
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <StatCard
                        icon={FaPaperPlane}
                        label="Today"
                        value={stats.today}
                        color="text-emerald-600"
                        gradient="from-emerald-500 to-green-500"
                    />
                </div>

                {/* Filters and Search */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            {/* Type Filter */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <FaFilter className="text-blue-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Type
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <FilterButton
                                            filter="all"
                                            label="All Messages"
                                            isActive={currentFilter === 'all'}
                                            onClick={handleFilterChange}
                                        />
                                        <FilterButton
                                            filter="case_related"
                                            label="Case Related"
                                            isActive={currentFilter === 'case_related'}
                                            onClick={handleFilterChange}
                                        />
                                        <FilterButton
                                            filter="inquiry"
                                            label="Inquiries"
                                            isActive={currentFilter === 'inquiry'}
                                            onClick={handleFilterChange}
                                        />
                                        <FilterButton
                                            filter="internal"
                                            label="Internal"
                                            isActive={currentFilter === 'internal'}
                                            onClick={handleFilterChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <FaSearch className="text-green-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Messages
                                </label>
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by subject, sender, or case..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-80 bg-white shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredMessages.map(message => (
                        <MessageCard key={message.id} message={message} />
                    ))}
                </div>

                {/* Empty State */}
                {filteredMessages.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <FaEnvelope className="text-4xl text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            No Messages Found
                        </h3>
                        <p className="text-gray-600 text-lg max-w-md mx-auto">
                            {currentFilter !== 'all' || searchTerm
                                ? "No messages match your current search criteria. Try adjusting your filters."
                                : "You don't have any messages yet. New messages will appear here."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;