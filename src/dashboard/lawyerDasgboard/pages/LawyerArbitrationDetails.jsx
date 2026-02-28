import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import LawyerArbitrationHeader from "../components/LawyerArbitrationHeader";
import LawyerArbClientInformation from "../components/LawyerArbClientInformation";
import LawyerArbHearing from "../components/LawyerArbHearing";
import Arb_VerdictSection from "../../arbitratorDashboard/components/Arb_VerdictSection";

const LawyerArbitrationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  const currentLawyerEmail = "lawyer01@justifi.com";

  // Fetch all arbitrations
  const { data: allArbitrationsData = [], isLoading } = useQuery({
    queryKey: ["allArbitrations"],
    queryFn: async () => {
      const res = await axiosPublic.get("/all-arbitrations");
      return res.data;
    },
  });

  // Robust array normalization
  const arbitrationsArray = Array.isArray(allArbitrationsData)
    ? allArbitrationsData
    : Array.isArray(allArbitrationsData?.arbitrations)
      ? allArbitrationsData.arbitrations
      : allArbitrationsData && typeof allArbitrationsData === "object"
        ? [allArbitrationsData]
        : [];

  // Find arbitration by arbitrationId first, then fall back to _id
  const arbitrationData = arbitrationsArray.find(
    (arb) =>
      String(arb.arbitrationId) === String(id) ||
      String(arb._id) === String(id),
  );

  const apiArbitrationId = arbitrationData?.arbitrationId;

  // Fetch real hearings from the hearings API — same as arbitrator does
  const { data: hearings = [], isLoading: hearingsLoading } = useQuery({
    queryKey: ["hearings", apiArbitrationId],
    queryFn: async () => {
      const res = await axiosPublic.get(
        `/hearings/arbitration/${apiArbitrationId}`,
      );
      if (res.data.success) return res.data.data;
      return [];
    },
    enabled: !!apiArbitrationId,
  });

  // hasAccess: lawyer is listed as a representative (any status)
  const hasAccess =
    arbitrationData?.plaintiffs?.some((plaintiff) =>
      plaintiff.representatives?.some(
        (rep) => rep.email === currentLawyerEmail,
      ),
    ) ||
    arbitrationData?.defendants?.some((defendant) =>
      defendant.representatives?.some(
        (rep) => rep.email === currentLawyerEmail,
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
        arbitrationId={apiArbitrationId}
      />

      <LawyerArbHearing
        hearings={hearings}
        isLoading={hearingsLoading}
        arbitrationId={apiArbitrationId}
      />

      <Arb_VerdictSection arbitration={arbitrationData} />
    </div>
  );
};

export default LawyerArbitrationDetails;
