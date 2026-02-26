import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFolderOpen } from "react-icons/fa";
import Loading from "../../../common/loading/Loading";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUserData from "../../../hooks/useUserData";

// Import sub-components
import MediationHeader from "../components/MediationHeader";
import Med_AgreementDetails from "../components/Med_AgreementDetails";
import Med_DisputeNature from "../components/Med_DisputeNature";
import MediatorsPanel from "../components/MediatorsPanel";
import Med_PartiesInformation from "../components/Med_PartiesInformation";
import Med_HearingSection from "../components/Med_HearingSection";
import Med_FinalVerdictSection from "../components/Med_FinalVerdictSection";

const MediationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUserData();
  const axiosSecure = useAxiosSecure();

  const {
    data: mediation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mediation-details", id],
    enabled: !!id && !!currentUser?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/my-mediations/${id}?email=${encodeURIComponent(currentUser.email)}`,
      );

      if (!res.data.success) {
        throw new Error(res.data.error || "Failed to load mediation");
      }

      return res.data.data;
    },
  });

  const handleBackClick = () => {
    navigate("/dashboard/my-mediations");
  };

  const isCaseActive = () => {
    const status = mediation?.mediation_status?.toLowerCase();
    return status === "ongoing" || status === "completed";
  };

  const isCasePendingOrCancelled = () => {
    const status = mediation?.mediation_status?.toLowerCase();
    return status === "pending" || status === "cancelled";
  };

  if (isLoading) return <Loading />;

  if (error || !mediation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaFolderOpen className="text-3xl text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Mediation Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "Unable to load mediation case details."}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The case may not exist or you may not have permission to view it.
          </p>
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Mediations
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
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Mediations
          </button>
        </div>

        <MediationHeader mediation={mediation} currentUser={currentUser} />

        <Med_AgreementDetails mediation={mediation} />
        <Med_DisputeNature mediation={mediation} />
        <Med_PartiesInformation
          mediation={mediation}
          currentUser={currentUser}
        />

        {caseActive && (
          <>
            <MediatorsPanel mediation={mediation} />
            {/* ✅ Removed: Med_RepresentativeSection */}
            {/* ✅ Removed: Med_DocumentsSection */}
            <Med_HearingSection mediation={mediation} />
            <Med_FinalVerdictSection mediation={mediation} />
          </>
        )}

        {casePendingOrCancelled && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaFolderOpen className="text-4xl text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {mediation.mediation_status?.toLowerCase() === "pending"
                  ? "Case Under Review"
                  : "Case Cancelled"}
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                {mediation.mediation_status?.toLowerCase() === "pending"
                  ? "Your mediation case is currently under review. You will be notified once a mediator is assigned."
                  : "This mediation case has been cancelled."}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700">
                  <strong>Current Status:</strong> {mediation.mediation_status}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediationDetails;
