import React, { useState, Component } from 'react';
import { 
    FaArrowLeft, 
    FaGavel, 
    FaUserTie, 
    FaUserShield, 
    FaEnvelope, 
    FaPhone, 
    FaMapMarkerAlt, 
    FaBalanceScale,
    FaExclamationTriangle,
    FaFileAlt,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaClock,
    FaTimes,
    FaPlus,
    FaVideo,
    FaCheckCircle,
    FaCalendarTimes,
    FaSpinner,
    FaEye,
    FaTrash
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Loading from '../../../common/loading/Loading';
import useUserData from "../../../hooks/useUserData";
import ArbitrationAgreement from '../components/ArbitrationAgreement';
import PlaintifDefendantDocument from '../components/PlaintifDefendantDocument';

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaExclamationTriangle className="text-3xl text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-600 mb-4">
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ArbitrationDetail = () => {
    const { currentUser } = useUserData();
    const currentUserEmail = currentUser?.email;
    const navigate = useNavigate();
    const { arbitrationId } = useParams();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [showHearingForm, setShowHearingForm] = useState(false);
    const [hearingForm, setHearingForm] = useState({
        date: '', meetLink: '', hearingAgenda: '', duration: 120
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch arbitration details
    const {
        data: arbitration,
        isLoading,
        error,
        refetch: refetchArbitration
    } = useQuery({
        queryKey: ['arbitrationDetails', arbitrationId],
        queryFn: async () => {
            if (!arbitrationId) throw new Error('Arbitration ID is required');
            const response = await axiosSecure.get(`/arbitrations/details/${arbitrationId}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch arbitration details');
            }
            return response.data.data;
        },
        enabled: !!arbitrationId,
        retry: 2,
    });

    const apiArbitrationId = arbitration?.arbitrationId;

    // Fetch hearings
    const {
        data: hearings = [],
        isLoading: hearingsLoading,
        error: hearingsError,
        refetch: refetchHearings
    } = useQuery({
        queryKey: ['hearings', apiArbitrationId],
        queryFn: async () => {
            if (!apiArbitrationId) return [];
            const response = await axiosSecure.get(`/hearings/arbitration/${apiArbitrationId}`);
            if (response.data.success) return response.data.data;
            return [];
        },
        enabled: !!apiArbitrationId,
        retry: 2,
    });

    // Create hearing mutation
    const createHearingMutation = useMutation({
        mutationFn: async (hearingData) => {
            const response = await axiosSecure.post('/hearings/create', hearingData);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                alert('Hearing scheduled successfully!');
                setShowHearingForm(false);
                setHearingForm({ date: '', meetLink: '', hearingAgenda: '', duration: 120 });
                queryClient.invalidateQueries(['hearings', apiArbitrationId]);
            } else {
                alert('Failed to schedule hearing: ' + data.message);
            }
        },
        onError: () => alert('Failed to schedule hearing. Please try again.'),
        onSettled: () => setIsSubmitting(false),
    });

    // ── Delete hearing mutation ──────────────────────────────────────────────
    const deleteHearingMutation = useMutation({
        mutationFn: async (hearingId) => {
            const response = await axiosSecure.delete(`/hearingsDelete/${hearingId}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                // Instantly remove from cache — no refetch needed
                queryClient.setQueryData(['hearings', apiArbitrationId], (old = []) =>
                    old.filter(h => h.hearingId !== deleteHearingMutation.variables)
                );
            } else {
                alert('Failed to delete hearing: ' + data.message);
            }
        },
        onError: () => alert('Failed to delete hearing. Please try again.'),
    });

    const handleDeleteHearing = (hearing, e) => {
        e.stopPropagation(); // prevent row click / navigation
        if (!window.confirm(
            `Delete Hearing Number ${hearing.hearingNumber}?\n\nThis action cannot be undone.`
        )) return;
        deleteHearingMutation.mutate(hearing.hearingId);
    };

    const handleHearingFormChange = (e) => {
        const { name, value } = e.target;
        setHearingForm(prev => ({ ...prev, [name]: value }));
    };

    const handleHearingSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!apiArbitrationId) throw new Error('Arbitration ID not available');
            const hearingData = {
                arbitrationId: apiArbitrationId,
                date: hearingForm.date,
                meetLink: hearingForm.meetLink,
                hearingAgenda: hearingForm.hearingAgenda,
                duration: parseInt(hearingForm.duration),
                createdBy: currentUserEmail
            };
            await createHearingMutation.mutateAsync(hearingData);
        } catch (error) {
            console.error('Error in hearing submission:', error);
            alert('Failed to schedule hearing. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleHearingRowClick = (hearing) => {
        if (hearing.hearingId && apiArbitrationId) {
            navigate(`/dashboard/hearing-details/${apiArbitrationId}/${hearing.hearingId}`);
        }
    };

    const handleEditHearing = (hearing, e) => {
        e.stopPropagation();
        if (hearing.hearingId && apiArbitrationId) {
            navigate(`/dashboard/edit-hearing/${apiArbitrationId}/${hearing.hearingId}`);
        }
    };

    const isCaseActive = () => {
        const status = arbitration?.arbitration_status?.toLowerCase();
        return status === 'ongoing' || status === 'completed';
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':   return 'bg-yellow-500 text-white';
            case 'ongoing':   return 'bg-blue-500 text-white';
            case 'completed': return 'bg-green-500 text-white';
            case 'cancelled': return 'bg-red-500 text-white';
            default:          return 'bg-gray-500 text-white';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':   return 'Pending Review';
            case 'ongoing':   return 'Proceedings Ongoing';
            case 'completed': return 'Case Concluded';
            case 'cancelled': return 'Case Cancelled';
            default:          return status || 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch { return 'Invalid date'; }
    };

    if (isLoading) return <Loading />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaExclamationTriangle className="text-3xl text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Arbitration</h2>
                    <p className="text-gray-600 mb-4">{error.message || 'Unable to load arbitration details.'}</p>
                    <div className="space-x-4">
                        <button onClick={() => refetchArbitration()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium">
                            Try Again
                        </button>
                        <button onClick={() => navigate('/dashboard/arb-arbitrations')}
                            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium">
                            Back to Arbitrations
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!arbitration) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading arbitration details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Back Button */}
                <div className="mb-6">
                    <button onClick={() => navigate('/dashboard/arb-arbitrations')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        <FaArrowLeft className="mr-2" />
                        Back to My Arbitrations
                    </button>
                </div>

                {/* Header */}
                <div className="text-white rounded-xl shadow-lg p-6 mb-8"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)' }}>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center mb-3">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mr-4 ${getStatusColor(arbitration.arbitration_status)}`}>
                                    {getStatusText(arbitration.arbitration_status)}
                                </span>
                                <span className="font-mono bg-black bg-opacity-20 px-3 py-1 rounded-lg">
                                    {arbitration.arbitrationId || arbitration._id}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold mb-4">{arbitration.caseTitle}</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                                <InfoCard icon={FaMoneyBillWave} label="Suit Value"
                                    value={`BDT ${parseInt(arbitration.suitValue || 0).toLocaleString()}`} />
                                <InfoCard icon={FaGavel} label="Case Category" value={arbitration.caseCategory} />
                                <InfoCard icon={FaClock} label="Number of Sittings" value={arbitration.sittings || 'Not specified'} />
                                <InfoCard icon={FaCalendarAlt} label="Agreement Date" value={formatDate(arbitration.agreementDate)} />
                                <InfoCard icon={FaCalendarAlt} label="Submission Date" value={formatDate(arbitration.submissionDate)} />
                            </div>
                            <div className="mt-6 p-4 bg-white bg-opacity-90 rounded-lg">
                                <div className="flex items-start">
                                    <FaFileAlt className="text-gray-700 mr-3 text-xl mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-700 text-sm font-medium mb-2">Nature of Dispute</p>
                                        <p className="text-gray-900 text-lg leading-relaxed">{arbitration.disputeNature}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Agreement Details */}
                <ArbitrationAgreement arbitration={arbitration} />

                {/* Arbitrators */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Arbitrators Panel</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {arbitration.arbitrators?.map((arbitrator, index) => (
                            <ErrorBoundary key={arbitrator.id || index}>
                                <ArbitratorCard arbitrator={arbitrator} />
                            </ErrorBoundary>
                        )) || (
                            <div className="col-span-3 text-center py-8 text-gray-500">
                                <FaGavel className="text-4xl mx-auto mb-2 text-gray-300" />
                                No arbitrators assigned yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                <FaBalanceScale className="inline mr-3 text-blue-600" />
                                Plaintiffs/Claimants ({arbitration.plaintiffs?.length || 0})
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {arbitration.plaintiffs?.map((party, index) => (
                                <ErrorBoundary key={party.id || index}>
                                    <PartyCard party={party} type="plaintiff" />
                                </ErrorBoundary>
                            )) || (
                                <div className="text-center py-8 text-gray-500">
                                    <FaUserTie className="text-4xl mx-auto mb-2 text-gray-300" />
                                    No plaintiffs listed
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="w-1 h-8 bg-red-600 rounded-full mr-3"></div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                <FaGavel className="inline mr-3 text-red-600" />
                                Defendants/Respondents ({arbitration.defendants?.length || 0})
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {arbitration.defendants?.map((party, index) => (
                                <ErrorBoundary key={party.id || index}>
                                    <PartyCard party={party} type="defendant" />
                                </ErrorBoundary>
                            )) || (
                                <div className="text-center py-8 text-gray-500">
                                    <FaUserShield className="text-4xl mx-auto mb-2 text-gray-300" />
                                    No defendants listed
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Documents */}
                <PlaintifDefendantDocument arbitrationId={arbitration?.arbitrationId} />

                {/* Hearings */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
                            <h2 className="text-2xl font-bold text-gray-900">Hearings & Proceedings</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => refetchHearings()}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center"
                                disabled={hearingsLoading}>
                                {hearingsLoading
                                    ? <FaSpinner className="animate-spin mr-2" />
                                    : <FaCheckCircle className="mr-2" />}
                                Refresh
                            </button>
                            <button onClick={() => setShowHearingForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                                disabled={!apiArbitrationId}>
                                <FaPlus className="mr-2" />
                                Create Hearing
                            </button>
                        </div>
                    </div>

                    {/* Hearing Form */}
                    {showHearingForm && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                            <div className="flex items-center mb-4">
                                <FaCalendarAlt className="text-blue-600 text-xl mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">Schedule New Hearing</h3>
                            </div>
                            <form onSubmit={handleHearingSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hearing Date & Time</label>
                                        <input type="datetime-local" name="date" value={hearingForm.date}
                                            onChange={handleHearingFormChange}
                                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                                        <input type="number" name="duration" value={hearingForm.duration}
                                            onChange={handleHearingFormChange} min="30" max="480"
                                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Link</label>
                                    <input type="url" name="meetLink" value={hearingForm.meetLink}
                                        onChange={handleHearingFormChange} placeholder="https://meet.justifi.com/..."
                                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hearing Agenda & Discussion Points</label>
                                    <textarea name="hearingAgenda" value={hearingForm.hearingAgenda}
                                        onChange={handleHearingFormChange} rows="3"
                                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Brief overview of what will be discussed..." required />
                                </div>
                                <div className="flex justify-end space-x-4 pt-4 border-t border-blue-200">
                                    <button type="button" onClick={() => setShowHearingForm(false)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                        disabled={isSubmitting}>
                                        Cancel
                                    </button>
                                    <button type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSubmitting || !apiArbitrationId}>
                                        {isSubmitting
                                            ? <><FaSpinner className="animate-spin mr-2" />Scheduling...</>
                                            : <><FaCheckCircle className="mr-2" />Schedule Hearing</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Hearings Table */}
                    <HearingsTable
                        hearings={hearings}
                        isLoading={hearingsLoading}
                        error={hearingsError}
                        onRefresh={refetchHearings}
                        onRowClick={handleHearingRowClick}
                        onEditClick={handleEditHearing}
                        onDeleteClick={handleDeleteHearing}
                        deletingHearingId={deleteHearingMutation.isPending ? deleteHearingMutation.variables : null}
                    />
                </div>
            </div>
        </div>
    );
};

// ── Info Card ─────────────────────────────────────────────────────────────────
const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white bg-opacity-90 p-3 rounded-lg backdrop-blur-sm border border-white border-opacity-20">
        <div className="flex items-center mb-1">
            <Icon className="text-gray-700 mr-2 text-sm" />
            <p className="text-gray-700 text-xs font-medium">{label}</p>
        </div>
        <p className="text-gray-900 text-sm font-semibold line-clamp-2">{value}</p>
    </div>
);

// ── Arbitrator Card ───────────────────────────────────────────────────────────
const ArbitratorCard = ({ arbitrator }) => {
    const [showModal, setShowModal] = useState(false);
    if (!arbitrator) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md">
                <div className="text-gray-500">No arbitrator data</div>
            </div>
        );
    }
    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setShowModal(true)}>
                <div className="relative mb-4">
                    <img src={arbitrator.picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                        alt={arbitrator.name}
                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-100 shadow-md"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'; }} />
                    <div className="absolute bottom-0 right-6 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
                        <FaGavel className="text-xs" />
                    </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{arbitrator.name || 'Unknown Arbitrator'}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-1">{arbitrator.designation || 'Arbitrator'}</p>
                {arbitrator.specialization?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mb-2">
                        {arbitrator.specialization.slice(0, 2).map((spec, i) => (
                            <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{spec}</span>
                        ))}
                        {arbitrator.specialization.length > 2 && (
                            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">+{arbitrator.specialization.length - 2}</span>
                        )}
                    </div>
                )}
                <p className="text-gray-500 text-xs mb-3">{arbitrator.experience || 'Experienced Arbitrator'}</p>
                {arbitrator.qualification && <p className="text-gray-700 text-sm mb-2 line-clamp-1">{arbitrator.qualification}</p>}
                <div className="text-center mt-2">
                    <span className="text-blue-600 text-sm font-medium hover:text-blue-800">View Full Profile →</span>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Arbitrator Profile</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0">
                                    <img src={arbitrator.picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                                        alt={arbitrator.name}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 mx-auto"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'; }} />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <h4 className="text-xl font-bold text-gray-900">{arbitrator.name || 'Unknown Arbitrator'}</h4>
                                    <p className="text-blue-600 font-semibold">{arbitrator.designation || 'Arbitrator'}</p>
                                    {arbitrator.qualification && <div><p className="text-sm font-medium text-gray-700">Qualification</p><p className="text-gray-600">{arbitrator.qualification}</p></div>}
                                    {arbitrator.experience && <div><p className="text-sm font-medium text-gray-700">Experience</p><p className="text-gray-600">{arbitrator.experience}</p></div>}
                                    {arbitrator.description && <div><p className="text-sm font-medium text-gray-700">Profile</p><p className="text-gray-600 text-sm">{arbitrator.description}</p></div>}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Contact</p>
                                            <p className="text-gray-600 text-sm">{arbitrator.phone || 'Not provided'}</p>
                                            <p className="text-gray-600 text-sm">{arbitrator.email || 'Not provided'}</p>
                                        </div>
                                        {arbitrator.address && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Address</p>
                                                <p className="text-gray-600 text-sm">{arbitrator.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ── Party Card ────────────────────────────────────────────────────────────────
const PartyCard = ({ party, type }) => {
    if (!party) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-gray-400">
                <div className="text-gray-500">No party data available</div>
            </div>
        );
    }
    const isPlaintiff  = type === 'plaintiff';
    const borderColor  = isPlaintiff ? 'border-blue-600' : 'border-red-600';
    const iconColor    = isPlaintiff ? 'text-blue-500'   : 'text-red-500';
    const badgeColor   = isPlaintiff ? 'bg-blue-600'     : 'bg-red-600';
    const Icon = isPlaintiff ? FaUserTie : FaUserShield;

    return (
        <div className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${borderColor}`}>
            <div className="flex items-start mb-4">
                <div className="relative">
                    <img src={party.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center'}
                        alt={party.name || 'Party'}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center'; }} />
                    <div className={`absolute -top-1 -right-1 ${badgeColor} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs`}>
                        <Icon />
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{party.name || 'Unknown Party'}</h3>
                    <p className="text-gray-600 text-sm mb-1"><FaUserTie className={`inline mr-2 ${iconColor}`} />{party.occupation || 'Legal Representative'}</p>
                    <p className="text-gray-600 text-sm mb-1"><FaEnvelope className={`inline mr-2 ${iconColor}`} />{party.email || 'No email provided'}</p>
                    <p className="text-gray-600 text-sm"><FaPhone className={`inline mr-2 ${iconColor}`} />{party.phone || 'No phone provided'}</p>
                </div>
            </div>
            <div className="mb-3">
                <p className="text-gray-700 text-sm"><FaMapMarkerAlt className={`inline mr-2 ${iconColor}`} />{party.address || 'Address not provided'}</p>
                {party.parentsName && <p className="text-gray-600 text-sm mt-1">Parents: {party.parentsName}</p>}
            </div>
        </div>
    );
};

// ── Hearings Table ────────────────────────────────────────────────────────────
const HearingsTable = ({ hearings, isLoading, error, onRefresh, onRowClick, onEditClick, onDeleteClick, deletingHearingId }) => {

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="flex justify-center items-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 mr-4" />
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Hearings</h3>
                        <p className="text-gray-500">Please wait while we fetch the hearings data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 rounded-2xl p-8 max-w-md mx-auto">
                    <FaExclamationTriangle className="text-4xl text-red-600 mb-4 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Failed to Load Hearings</h3>
                    <p className="text-gray-500 mb-4">{error.message || 'Unable to load hearings data.'}</p>
                    <button onClick={onRefresh}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!hearings || hearings.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                    <FaCalendarTimes className="text-6xl text-gray-300 mb-6 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Hearings Scheduled</h3>
                    <p className="text-gray-500 mb-6">Schedule the first hearing to begin proceedings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        {['Hearing', 'Date & Time', 'Status', 'Duration', 'Agenda', 'Meeting Link', 'Actions'].map(col => (
                            <th key={col} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {hearings.map((hearing, index) => {
                        const isThisDeleting = deletingHearingId === hearing.hearingId;
                        return (
                            <tr key={hearing.hearingId || hearing._id || index}
                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${isThisDeleting ? 'opacity-50' : ''}`}
                                onClick={() => !isThisDeleting && onRowClick && onRowClick(hearing)}>

                                {/* Hearing # */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{hearing.hearingNumber || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">{hearing.hearingId || 'No ID'}</div>
                                </td>

                                {/* Date & Time */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {hearing.date ? new Date(hearing.date).toLocaleDateString() : 'Date not set'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {hearing.date ? new Date(hearing.date).toLocaleTimeString() : ''}
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        hearing.status === 'completed'  ? 'bg-green-100 text-green-800'   :
                                        hearing.status === 'scheduled'  ? 'bg-blue-100 text-blue-800'     :
                                        hearing.status === 'cancelled'  ? 'bg-red-100 text-red-800'       :
                                        hearing.status === 'postponed'  ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {hearing.status
                                            ? hearing.status.charAt(0).toUpperCase() + hearing.status.slice(1)
                                            : 'Scheduled'}
                                    </span>
                                </td>

                                {/* Duration */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {hearing.duration || 0} min
                                </td>

                                {/* Agenda */}
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                    <div className="line-clamp-2">{hearing.hearingAgenda || 'No agenda provided'}</div>
                                </td>

                                {/* Meeting Link */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {hearing.meetLink ? (
                                        <a href={hearing.meetLink} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
                                            onClick={(e) => e.stopPropagation()}>
                                            <FaVideo className="mr-1" /> Join Meeting
                                        </a>
                                    ) : (
                                        <span className="text-gray-500 text-sm">No link provided</span>
                                    )}
                                </td>

                                {/* ── Actions: Details + Delete ── */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">

                                       

                                        {/* Delete */}
                                        <button
                                            className="inline-flex items-center text-red-500 hover:text-red-700 font-medium transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                            onClick={(e) => onDeleteClick && onDeleteClick(hearing, e)}
                                            disabled={isThisDeleting}
                                            title="Delete this hearing"
                                        >
                                            {isThisDeleting
                                                ? <FaSpinner className="animate-spin mr-1" />
                                                : <FaTrash className="mr-1" />}
                                            {isThisDeleting ? 'Deleting...' : 'Delete'}
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ArbitrationDetail;