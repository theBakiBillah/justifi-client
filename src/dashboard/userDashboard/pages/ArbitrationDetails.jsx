// dashboard/userDashboard/pages/ArbitrationDetails.jsx
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFolderOpen } from "react-icons/fa";
import Loading from "../../../common/loading/Loading";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUserData from "../../../hooks/useUserData";

// Import sub-components
import ArbitrationHeader from "../components/ArbitrationHeader";
import Arb_AgreementDetails from "../components/Arb_AgreementDetails";
import Arb_DisputeNature from "../components/Arb_DisputeNature";
import ArbitratorsPanel from "../components/ArbitratorsPanel";
import Arb_PartiesInformation from "../components/Arb_PartiesInformation";
import Arb_RepresentativeSection from "../components/Arb_RepresentativeSection";
import Arb_DocumentsSection from "../components/Arb_DocumentsSection";
import Arb_HearingSection from "../components/Arb_HearingSection";
import Arb_FinalVerdictSection from "../components/Arb_FinalVerdictSection";

const ArbitrationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useUserData();
    const axiosSecure = useAxiosSecure();
    const [selectedHearing, setSelectedHearing] = useState(null);

    const {
        data: arbitration,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ["arbitration", id, currentUser?.email],
        queryFn: async () => {
            const response = await axiosSecure.get(
                `/myArbitrations?email=${currentUser?.email}`
            );
            
            const allArbitrations = response.data;
            
            const isUserInvolved = (arbitration, userEmail) => {
                if (!arbitration || !userEmail) return false;

                // Check plaintiffs
                if (arbitration.plaintiffs) {
                    if (Array.isArray(arbitration.plaintiffs)) {
                        const isPlaintiff = arbitration.plaintiffs.some(plaintiff => 
                            plaintiff && plaintiff.email === userEmail
                        );
                        if (isPlaintiff) return true;
                    } else {
                        const plaintiffEntries = Object.values(arbitration.plaintiffs);
                        const isPlaintiff = plaintiffEntries.some(plaintiff => 
                            plaintiff && plaintiff.email === userEmail
                        );
                        if (isPlaintiff) return true;
                    }
                }

                // Check defendants
                if (arbitration.defendants) {
                    if (Array.isArray(arbitration.defendants)) {
                        const isDefendant = arbitration.defendants.some(defendant => 
                            defendant && defendant.email === userEmail
                        );
                        if (isDefendant) return true;
                    } else {
                        const defendantEntries = Object.values(arbitration.defendants);
                        const isDefendant = defendantEntries.some(defendant => 
                            defendant && defendant.email === userEmail
                        );
                        if (isDefendant) return true;
                    }
                }

                return false;
            };

            const userArbitrations = allArbitrations.filter(arbitration => 
                isUserInvolved(arbitration, currentUser?.email)
            );

            const specificArbitration = userArbitrations.find(arb => arb._id === id);
            
            if (!specificArbitration) {
                throw new Error('Arbitration case not found or you do not have access to this case');
            }
            
            return specificArbitration;
        },
        enabled: !!id && !!currentUser?.email,
    });

    const handleBackClick = () => {
        navigate('/dashboard/my-arbitrations');
    };

    // Handle arbitration data update after representative changes
    const handleUpdateArbitration = (updatedArbitration) => {
        // If you're using a state management that allows direct updates,
        // you can update the cache here. Alternatively, refetch the data.
        refetch();
    };

    // Helper function to check if case is active (Ongoing or Completed)
    const isCaseActive = () => {
        const status = arbitration?.arbitration_status?.toLowerCase();
        return status === 'ongoing' || status === 'completed';
    };

    // Helper function to check if case is pending or cancelled
    const isCasePendingOrCancelled = () => {
        const status = arbitration?.arbitration_status?.toLowerCase();
        return status === 'pending' || status === 'cancelled';
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error || !arbitration) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaFolderOpen className="text-3xl text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Arbitration Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error?.message || "Unable to load arbitration case details."}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        The case may not exist or you may not have permission to view it.
                    </p>
                    <button
                        onClick={handleBackClick}
                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to My Arbitrations
                    </button>
                </div>
            </div>
        );
    }

    const caseActive = isCaseActive();
    const casePendingOrCancelled = isCasePendingOrCancelled();

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <button 
                        onClick={handleBackClick}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to My Arbitrations
                    </button>
                </div>

                <ArbitrationHeader 
                    arbitration={arbitration} 
                    currentUser={currentUser}
                />
                
                {/* Always show these sections regardless of status */}
                <Arb_AgreementDetails arbitration={arbitration} />
                <Arb_DisputeNature arbitration={arbitration} />
                <Arb_PartiesInformation arbitration={arbitration} currentUser={currentUser} />

                {/* Only show these sections for Ongoing or Completed cases */}
                {caseActive && (
                    <>
                        <ArbitratorsPanel arbitration={arbitration} />
                        <Arb_RepresentativeSection 
                            arbitrationData={arbitration}
                            currentUserEmail={currentUser?.email}
                            caseId={arbitration?._id || arbitration?.arbitrationId}
                            onUpdateArbitration={handleUpdateArbitration}
                        />
                        <Arb_DocumentsSection />
                        <Arb_HearingSection 
                            selectedHearing={selectedHearing}
                            onHearingSelect={setSelectedHearing}
                            onHearingClose={() => setSelectedHearing(null)}
                        />
                        <Arb_FinalVerdictSection arbitration={arbitration} />
                    </>
                )}

                {/* Show message for pending or cancelled cases */}
                {casePendingOrCancelled && (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100 text-center">
                        <div className="max-w-2xl mx-auto">
                            <div className="w-24 h-24 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FaFolderOpen className="text-4xl text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {arbitration.arbitration_status?.toLowerCase() === 'pending' 
                                    ? 'Case Under Review' 
                                    : 'Case Cancelled'
                                }
                            </h3>
                            <p className="text-gray-600 text-lg mb-6">
                                {arbitration.arbitration_status?.toLowerCase() === 'pending' 
                                    ? 'Your arbitration case is currently under review. Once the initial review is completed and the case moves to "Ongoing" status, you will be able to access additional features like document upload, hearing information, and representative management.'
                                    : 'This arbitration case has been cancelled. No further actions can be taken on this case.'
                                }
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-700">
                                    <strong>Current Status:</strong> {arbitration.arbitration_status}
                                </p>
                                {arbitration.arbitration_status?.toLowerCase() === 'pending' && (
                                    <p className="text-blue-600 text-sm mt-2">
                                        Please check back later for updates on your case status.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArbitrationDetails;