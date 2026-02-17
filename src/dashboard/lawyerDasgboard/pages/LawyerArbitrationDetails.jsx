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

  const currentLawyerEmail = "lawyer@justifi.com";

  // ✅ Fetch arbitrations
  const { data: allArbitrationsData = [], isLoading } = useQuery({
    queryKey: ["allArbitrations"],
    queryFn: async () => {
      const res = await axiosPublic.get("/all-arbitrations");
      return res.data;
    },
  });

  // Normalize arbitrations safely
  const arbitrationsArray = Array.isArray(allArbitrationsData)
    ? allArbitrationsData
    : allArbitrationsData?.arbitrations || [];

  // Find arbitration by _id or arbitrationId
  const arbitrationData = arbitrationsArray.find(
    (arb) =>
      String(arb._id) === String(id) ||
      String(arb.arbitrationId) === String(id),
  );

  // ✅ Check lawyer access
  const hasAccess =
    arbitrationData?.plaintiffs?.some((plaintiff) =>
      plaintiff.representatives?.some(
        (rep) =>
          rep.email === currentLawyerEmail && rep.case_status === "running",
      ),
    ) || false;

  // ✅ Merge plaintiffs + defendants
  const mergedParties = arbitrationData
    ? [
        ...(arbitrationData.plaintiffs || []).map((p) => ({
          ...p,
          partyType: "Plaintiff",
        })),
        ...(arbitrationData.defendants || []).map((d) => ({
          ...d,
          partyType: "Defendant",
          representatives: [],
          evidence: [],
        })),
      ]
    : [];

  // ✅ Find appointed client
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

  // ✅ Transform arbitration for header
  const transformedArbitration =
    arbitrationData && hasAccess
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

  if (!transformedArbitration) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold">Arbitration not found</h3>
        <p>
          The arbitration case with ID "{id}" does not match the received data.
        </p>
        <button
          onClick={() => navigate("/dashboard/lawyer-arbitrations")}
          className="mt-4 text-blue-600"
        >
          <FaArrowLeft className="inline mr-2" />
          Back
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
