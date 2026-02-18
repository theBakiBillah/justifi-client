import { useState, useEffect } from "react";
import { FaUserFriends, FaUserTie, FaCrown, FaGraduationCap, FaBriefcase, FaExclamationTriangle } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ArbitratorsPanel = ({ arbitration }) => {
    const [arbitratorsData, setArbitratorsData] = useState({
        presiding: null,
        plaintiff: null,
        defendant: null
    });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const axiosSecure = useAxiosSecure();

    const shouldShowArbitrators = () => {
        const status = arbitration?.arbitration_status?.toLowerCase();
        return status === 'ongoing' || status === 'completed';
    };

    const getArbitratorEmails = () => {
        if (!arbitration) return null;

        return {
            presiding: arbitration.presidingArbitrator?.email,
            plaintiff: arbitration.arbitrator1?.email,
            defendant: arbitration.arbitrator2?.email
        };
    };

    // Fetch arbitrator details from arbitrator collection
    useEffect(() => {
        const fetchArbitratorsData = async () => {
            if (!arbitration || !shouldShowArbitrators()) {
                setLoading(false);
                return;
            }

            try {
                const emails = getArbitratorEmails();
                const arbitrators = {};
                const errorMessages = {};

                // Fetch presiding arbitrator
                if (emails.presiding) {
                    try {
                        const response = await axiosSecure.get(`/email/${emails.presiding}`);
                        if (response.data.success) {
                            arbitrators.presiding = response.data.arbitrator;
                        } else {
                            errorMessages.presiding = `Presiding arbitrator not found`;
                        }
                    } catch (error) {
                        console.error('Error fetching presiding arbitrator:', error);
                        errorMessages.presiding = `Error loading presiding arbitrator`;
                    }
                }

                // Fetch plaintiff arbitrator
                if (emails.plaintiff) {
                    try {
                        const response = await axiosSecure.get(`/email/${emails.plaintiff}`);
                        if (response.data.success) {
                            arbitrators.plaintiff = response.data.arbitrator;
                        } else {
                            errorMessages.plaintiff = `Plaintiff arbitrator not found`;
                        }
                    } catch (error) {
                        console.error('Error fetching plaintiff arbitrator:', error);
                        errorMessages.plaintiff = `Error loading plaintiff arbitrator`;
                    }
                }

                // Fetch defendant arbitrator
                if (emails.defendant) {
                    try {
                        const response = await axiosSecure.get(`/email/${emails.defendant}`);
                        if (response.data.success) {
                            arbitrators.defendant = response.data.arbitrator;
                        } else {
                            errorMessages.defendant = `Defendant arbitrator not found`;
                        }
                    } catch (error) {
                        console.error('Error fetching defendant arbitrator:', error);
                        errorMessages.defendant = `Error loading defendant arbitrator`;
                    }
                }

                setArbitratorsData(arbitrators);
                setErrors(errorMessages);
            } catch (error) {
                console.error('Error fetching arbitrators data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArbitratorsData();
    }, [arbitration, axiosSecure]);

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'Pending Review';
            case 'ongoing': return 'Proceedings Ongoing';
            case 'completed': return 'Case Concluded';
            case 'cancelled': return 'Case Cancelled';
            default: return status || 'Unknown';
        }
    };

    const ArbitratorCard = ({ arbitrator, type, error }) => {
        if (error) {
            return (
                <div className={`bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 text-center ${
                    type === 'presiding' ? 'relative' : ''
                }`}>
                    {type === 'presiding' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gray-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                                <FaCrown className="mr-2" />
                                Presiding
                            </div>
                        </div>
                    )}
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FaExclamationTriangle className="text-2xl text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                        {type} Arbitrator
                    </h3>
                    <p className="text-red-500 text-sm mb-4">
                        {error}
                    </p>
                    <p className="text-gray-500 text-sm">
                        Arbitrator details not available
                    </p>
                </div>
            );
        }

        if (!arbitrator) return null;

        const getTypeStyles = () => {
            switch (type) {
                case 'presiding':
                    return {
                        gradient: 'from-amber-50 to-amber-100',
                        border: 'border-amber-300',
                        color: 'text-amber-600',
                        bg: 'bg-amber-500'
                    };
                case 'plaintiff':
                    return {
                        gradient: 'from-blue-50 to-blue-100',
                        border: 'border-blue-200',
                        color: 'text-blue-600',
                        bg: 'bg-blue-500'
                    };
                case 'defendant':
                    return {
                        gradient: 'from-green-50 to-green-100',
                        border: 'border-green-200',
                        color: 'text-green-600',
                        bg: 'bg-green-500'
                    };
                default:
                    return {
                        gradient: 'from-gray-50 to-gray-100',
                        border: 'border-gray-200',
                        color: 'text-gray-600',
                        bg: 'bg-gray-500'
                    };
            }
        };

        const styles = getTypeStyles();

        return (
            <div className={`bg-gradient-to-br ${styles.gradient} border-2 ${styles.border} rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 ${
                type === 'presiding' ? 'relative' : ''
            }`}>
                {type === 'presiding' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className={`${styles.bg} text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center`}>
                            <FaCrown className="mr-2" />
                            Presiding
                        </div>
                    </div>
                )}
                <div className={`w-20 h-20 ${styles.bg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden ${
                    type === 'presiding' ? 'mt-2' : ''
                }`}>
                    {arbitrator.image ? (
                        <img 
                            src={arbitrator.image} 
                            alt={arbitrator.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-full ${styles.bg} rounded-full flex items-center justify-center ${
                        arbitrator.image ? 'hidden' : 'flex'
                    }`}>
                        <FaUserTie className="text-3xl text-white" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {arbitrator.name}
                </h3>
                <p className={`${styles.color} font-semibold mb-3 capitalize`}>
                    {type} Arbitrator
                </p>
                
                <div className="text-left space-y-2 mb-4">
                    <p className="text-gray-600 text-sm">
                        <FaGraduationCap className={`inline mr-2 ${styles.color}`} />
                        <strong>Qualification:</strong> {arbitrator.qualification || 'Not specified'}
                    </p>
                    <p className="text-gray-600 text-sm">
                        <FaBriefcase className={`inline mr-2 ${styles.color}`} />
                        <strong>Experience:</strong> {arbitrator.experience ? `${arbitrator.experience} years` : 'Not specified'}
                    </p>
                </div>

                {arbitrator.description && (
                    <p className="text-gray-700 text-sm mb-3 bg-white p-3 rounded-lg border border-gray-200">
                        {arbitrator.description}
                    </p>
                )}
            </div>
        );
    };

    const showArbitrators = shouldShowArbitrators();

    if (!showArbitrators) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-gray-400 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        <FaUserFriends className="inline mr-3 text-gray-400" />
                        Arbitrators Panel
                    </h2>
                </div>
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FaUserFriends className="mx-auto text-6xl text-gray-300 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Arbitrators Not Available</h3>
                    <p className="text-gray-500 mb-6">
                        Arbitrators will be assigned when the case status changes to "Ongoing" or "Completed".
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-blue-700 text-sm">
                            <strong>Current Status:</strong> {getStatusText(arbitration?.arbitration_status)}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="flex items-center mb-8">
                    <div className="w-1 h-8 bg-amber-600 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        <FaUserFriends className="inline mr-3 text-amber-600" />
                        Arbitrators Panel
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-gray-100 border-2 border-gray-200 rounded-xl p-6 text-center animate-pulse">
                            <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
                            <div className="h-6 bg-gray-300 rounded mb-2 mx-auto w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded mb-2 mx-auto w-1/2"></div>
                            <div className="h-4 bg-gray-300 rounded mb-2 mx-auto w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const hasArbitrators = arbitratorsData.presiding || arbitratorsData.plaintiff || arbitratorsData.defendant;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center mb-8">
                <div className="w-1 h-8 bg-amber-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                    <FaUserFriends className="inline mr-3 text-amber-600" />
                    Arbitrators Panel
                </h2>
            </div>

            {hasArbitrators || Object.keys(errors).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ArbitratorCard 
                        arbitrator={arbitratorsData.plaintiff} 
                        type="plaintiff" 
                        error={errors.plaintiff}
                    />
                    <ArbitratorCard 
                        arbitrator={arbitratorsData.presiding} 
                        type="presiding" 
                        error={errors.presiding}
                    />
                    <ArbitratorCard 
                        arbitrator={arbitratorsData.defendant} 
                        type="defendant" 
                        error={errors.defendant}
                    />
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FaUserFriends className="mx-auto text-6xl text-gray-300 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Arbitrators Not Assigned Yet</h3>
                    <p className="text-gray-500 mb-6">
                        Arbitrators will be assigned once the agreement process is completed successfully.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-yellow-700 text-sm">
                            <strong>Note:</strong> Arbitrators are typically assigned within 2-3 business days after successful agreement.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArbitratorsPanel;