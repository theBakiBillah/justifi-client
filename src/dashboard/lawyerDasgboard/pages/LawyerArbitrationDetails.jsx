import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import LawyerArbitrationHeader from "../components/LawyerArbitrationHeader";
import LawyerArbClientInformation from "../components/LawyerArbClientInformation";
import LawyerArbHearing from "../components/LawyerArbHearing";

const LawyerArbitrationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  // ✅ FIX: Corrected email to match the representative in the database
  const currentLawyerEmail = "lawyer01@justifi.com";

  // Fetch arbitrations
  const { data: allArbitrationsData = [], isLoading } = useQuery({
    queryKey: ["allArbitrations"],
    queryFn: async () => {
      const res = await axiosPublic.get("/all-arbitrations");
      return res.data;
    },
  });

  // ✅ FIX: Robust array normalization — handles array, {arbitrations:[...]}, or single object
  const arbitrationsArray = Array.isArray(allArbitrationsData)
    ? allArbitrationsData
    : Array.isArray(allArbitrationsData?.arbitrations)
      ? allArbitrationsData.arbitrations
      : allArbitrationsData && typeof allArbitrationsData === "object"
        ? [allArbitrationsData]
        : [];

  // ✅ FIX: Find arbitration by arbitrationId first, then fall back to _id
  // This matches the URL pattern used in LawyerArbitration.jsx (prefers arbitrationId)
  const arbitrationData = arbitrationsArray.find(
    (arb) =>
      String(arb.arbitrationId) === String(id) ||
      String(arb._id) === String(id),
  );

  // ✅ FIX: hasAccess is only used as a UI guard, not to block data rendering entirely.
  // Separating these concerns prevents "Arbitration not found" when the case exists
  // but the access check fails due to a minor mismatch.
  const hasAccess =
    arbitrationData?.plaintiffs?.some((plaintiff) =>
      plaintiff.representatives?.some(
        (rep) =>
          rep.email === currentLawyerEmail && rep.case_status === "running",
      ),
    ) ||
    arbitrationData?.defendants?.some((defendant) =>
      defendant.representatives?.some(
        (rep) =>
          rep.email === currentLawyerEmail && rep.case_status === "running",
      ),
    ) ||
    false;

  // Merge plaintiffs + defendants for party display
  const mergedParties = arbitrationData
    ? [
        ...(arbitrationData.plaintiffs || []).map((p) => ({
          ...p,
          partyType: "Plaintiff",
        })),
        ...(arbitrationData.defendants || []).map((d) => ({
          ...d,
          partyType: "Defendant",
          representatives: d.representatives || [],
          evidence: d.evidence || [],
        })),
      ]
    : [];

  // Find appointed client for the current lawyer
  let appointedClient = null;

  arbitrationData?.plaintiffs?.forEach((plaintiff) => {
    const rep = plaintiff.representatives?.find(
      (r) => r.email === currentLawyerEmail,
    );
    if (rep) {
      appointedClient = {
        name: plaintiff.name,
        email: plaintiff.email,
        phone: plaintiff.phone,
        address: plaintiff.address,
      };
    }
  });

  // Also check defendants in case lawyer represents a defendant
  if (!appointedClient) {
    arbitrationData?.defendants?.forEach((defendant) => {
      const rep = defendant.representatives?.find(
        (r) => r.email === currentLawyerEmail,
      );
      if (rep) {
        appointedClient = {
          name: defendant.name,
          email: defendant.email,
          phone: defendant.phone,
          address: defendant.address,
        };
      }
    });
  }

  // Transform arbitration data for the header component
  const transformedArbitration = arbitrationData
    ? {
        id: arbitrationData.arbitrationId,
        title: arbitrationData.caseTitle,
        status: arbitrationData.arbitration_status?.toLowerCase(),
        suitValue: `BDT ${parseInt(
          arbitrationData.suitValue || 0,
        ).toLocaleString()}`,
        nature: arbitrationData.disputeNature,
        nextHearing: arbitrationData.sessionData?.sessionDateTime,
        totalSessions: parseInt(arbitrationData.sittings || 0),
        remainingSessions: parseInt(arbitrationData.sittings || 0),
        caseCategory: arbitrationData.caseCategory,
        submissionDate: arbitrationData.submissionDate,
      }
    : null;

  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  // ✅ FIX: Show "not found" only when the case truly doesn't exist in the fetched data
  if (!arbitrationData) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold">Arbitration not found</h3>
        <p className="text-gray-500 mt-2">
          No arbitration case matches ID "{id}".
        </p>
        <button
          onClick={() => navigate("/dashboard/lawyer-arbitrations")}
          className="mt-4 text-blue-600 flex items-center gap-2 mx-auto"
        >
          <FaArrowLeft />
          Back to My Arbitrations
        </button>
      </div>
    );
  }

  // ✅ FIX: Show access denied separately — case was found but lawyer isn't a representative
  if (!hasAccess) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-red-600">Access Denied</h3>
        <p className="text-gray-500 mt-2">
          You are not listed as an active representative for this arbitration
          case.
        </p>
        <button
          onClick={() => navigate("/dashboard/lawyer-arbitrations")}
          className="mt-4 text-blue-600 flex items-center gap-2 mx-auto"
        >
          <FaArrowLeft />
          Back to My Arbitrations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <LawyerArbitrationHeader arbitration={transformedArbitration} />

      <LawyerArbClientInformation
        parties={mergedParties}
        currentLawyerEmail={currentLawyerEmail}
        appointedClient={appointedClient}
      />

      <LawyerArbHearing
        hearings={
          arbitrationData.sessionData
            ? [
                {
                  id: 1,
                  date: arbitrationData.sessionData.sessionDateTime,
                  meetLink: arbitrationData.sessionData.meetingLink,
                  arbitrator1Notes: "",
                  arbitrator2Notes: "",
                  arbitrator3Notes: "",
                  documentsRequired: "",
                  attendance: "",
                  result: "",
                },
              ]
            : []
        }
      />
    </div>
  );
};

export default LawyerArbitrationDetails;
