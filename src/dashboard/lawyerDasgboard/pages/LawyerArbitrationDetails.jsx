import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import LawyerArbitrationHeader from "../components/LawyerArbitrationHeader";
import LawyerArbitratorsPanel from "../components/LawyerArbitratorsPanel";
import LawyerArbClientInformation from "../components/LawyerArbClientInformation";
import LawyerArbHearing from "../components/LawyerArbHearing";

const LawyerArbitrationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  // Current lawyer email
  const currentLawyerEmail = "lawyer@justifi.com";

  // Fetch all arbitrations and find the specific one
  const { data: allArbitrationsData, isLoading } = useQuery({
    queryKey: ["allArbitrations"],
    queryFn: async () => {
      const response = await axiosPublic.get("/all-arbitrations");
      return response.data;
    },
  });

  // Fetch arbitrators data
  const { data: arbitratorsData = [] } = useQuery({
    queryKey: ["arbitrators"],
    queryFn: async () => {
      const response = await axiosPublic.get("/arbitrators");
      return response.data;
    },
  });

  // Convert to array and find the specific arbitration
  const arbitrationsArray = Array.isArray(allArbitrationsData)
    ? allArbitrationsData
    : [allArbitrationsData];

  const arbitrationData = arbitrationsArray.find(
    (arb) => arb.arbitrationId === id || arb._id === id,
  );

  // Check if lawyer has access to this arbitration
  const hasAccess =
    arbitrationData &&
    arbitrationData.plaintiffs?.some((plaintiff) => {
      if (
        plaintiff.representatives &&
        Array.isArray(plaintiff.representatives)
      ) {
        return plaintiff.representatives.some(
          (rep) =>
            rep.email === currentLawyerEmail && rep.case_status === "running",
        );
      }
      return false;
    });

  // Helper function to get enriched arbitrator data
  const getEnrichedArbitrators = (arbitrationData, arbitratorsData) => {
    const arbitrators = [
      arbitrationData.presidingArbitrator,
      arbitrationData.arbitrator1,
      arbitrationData.arbitrator2,
    ].filter((arb) => arb && arb.name);

    return arbitrators.map((arbitrator, index) => {
      // Find matching arbitrator in the database
      const dbArbitrator = arbitratorsData.find(
        (dbArb) =>
          dbArb.email === arbitrator.email || dbArb.name === arbitrator.name,
      );

      return {
        id: index + 1,
        name: arbitrator.name,
        email: arbitrator.email,
        designation: index === 0 ? "Presiding Arbitrator" : "Arbitrator",
        // Use database data if available
        picture:
          dbArbitrator?.image ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        experience: dbArbitrator?.experience
          ? `${dbArbitrator.experience} years`
          : "10+ years",
        qualification: dbArbitrator?.qualification || "Legal Professional",
        description:
          dbArbitrator?.description ||
          "Experienced legal professional specializing in dispute resolution and arbitration matters.",
      };
    });
  };

  // Transform data for the frontend components
  const transformedArbitration = hasAccess
    ? {
        id: arbitrationData.arbitrationId || arbitrationData._id,
        title: arbitrationData.caseTitle,
        status: arbitrationData.arbitration_status?.toLowerCase() || "ongoing",
        suitValue: `BDT ${parseInt(
          arbitrationData.suitValue || 0,
        ).toLocaleString()}`,
        nature: arbitrationData.disputeNature,
        nextHearing: arbitrationData.sessionData?.sessionDateTime,
        totalSessions: parseInt(arbitrationData.sittings || 0),
        completedSessions: 0,
        remainingSessions: parseInt(arbitrationData.sittings || 0),
        caseCategory: arbitrationData.caseCategory,
        submissionDate: arbitrationData.submissionDate,

        // Enriched arbitrators data
        arbitrators: getEnrichedArbitrators(arbitrationData, arbitratorsData),

        // Plaintiffs data - filter to show only the client who added this lawyer
        plaintiffs:
          arbitrationData.plaintiffs
            ?.filter((plaintiff) => {
              if (
                plaintiff.representatives &&
                Array.isArray(plaintiff.representatives)
              ) {
                return plaintiff.representatives.some(
                  (rep) =>
                    rep.email === currentLawyerEmail &&
                    rep.case_status === "running",
                );
              }
              return false;
            })
            .map((plaintiff) => ({
              id: plaintiff.id,
              name: plaintiff.name,
              email: plaintiff.email,
              contact: plaintiff.phone,
              address: plaintiff.address,
              picture:
                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center",
              representative: plaintiff.representative?.name || "Legal Counsel",
              evidence: [],
            })) || [],

        // Hearings data
        hearings: arbitrationData.sessionData
          ? [
              {
                id: 1,
                date: arbitrationData.sessionData.sessionDateTime,
                arbitrator1Notes: "Initial hearing scheduled",
                arbitrator2Notes: "Parties presented their positions",
                arbitrator3Notes: "Preliminary documents reviewed",
                result: "Adjourned for further documentation",
                documentsRequired: "Complete contract and financial records",
                meetLink: arbitrationData.sessionData.meetingLink,
                attendance: "All parties present",
              },
            ]
          : [],
      }
    : null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading arbitration details...</p>
        </div>
      </div>
    );
  }

  if (!transformedArbitration) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Arbitration not found
          </h3>
          <p className="text-gray-500">
            The arbitration case you're looking for doesn't exist or you don't
            have access to it.
          </p>
          <button
            onClick={() => navigate("/dashboard/lawyer-arbitrations")}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Arbitrations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard/lawyer-arbitrations")}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <FaArrowLeft className="mr-2" />
          Back to My Arbitrations
        </button>
      </div>

      {/* Main Components */}
      <LawyerArbitrationHeader arbitration={transformedArbitration} />
      <LawyerArbitratorsPanel
        arbitrators={transformedArbitration.arbitrators}
      />
      <LawyerArbClientInformation
        plaintiffs={transformedArbitration.plaintiffs}
      />
      <LawyerArbHearing hearings={transformedArbitration.hearings} />
    </div>
  );
};

export default LawyerArbitrationDetails;
