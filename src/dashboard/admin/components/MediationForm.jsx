import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import MedPartySection from "./MedPartySection";
import MedDisputeInformation from "./MedDisputeInformation";
import MediatorDetails from "./MediatorDetails";
import MedCostBreakdown from "./MedCostBreakdown";
import JustifiRepresentative from "./JustifiRepresentative";

const MediationForm = ({ onSubmit, caseId }) => {
  const axiosPublic = useAxiosPublic();

  // Fetch mediation cases
  const { data: mediationCases } = useQuery({
    queryKey: ["all-mediation"],
    queryFn: async () => {
      const response = await axiosPublic.get("/all-mediation");
      return response.data;
    },
  });

  // Fetch mediators
  const { data: mediators } = useQuery({
    queryKey: ["mediators"],
    queryFn: async () => {
      const response = await axiosPublic.get("/mediators");
      return response.data;
    },
  });

  const [plaintiffs, setPlaintiffs] = useState([]);
  const [defendants, setDefendants] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);

  const [disputeInfo, setDisputeInfo] = useState({
    category: "",
    suitValue: "",
    nature: "",
  });

  const [mediatorDetails, setMediatorDetails] = useState({
    sessionsAgreed: "1",
    totalCost: "",
    mediatorName: "",
    mediatorQualification: "",
    mediatorEmail: "",
  });

  const [justifiRep, setJustifiRep] = useState({
    name: "",
    designation: "",
    email: "",
  });

  const [costPerParty, setCostPerParty] = useState(0);

  // Find the specific case by ID when mediation cases are loaded
  useEffect(() => {
    if (mediationCases && mediationCases.length > 0 && caseId) {
      const foundCase = mediationCases.find(
        (caseItem) => caseItem._id === caseId
      );

      if (foundCase) {
        setSelectedCase(foundCase);

        // Convert plaintiffs object to array
        const plaintiffsArray = Object.values(foundCase.plaintiffs || {}).map(
          (plaintiff, index) => ({
            id: `plaintiff-${index + 1}`,
            name: plaintiff.name || "",
            parents: plaintiff.parentsName || "",
            email: plaintiff.email || "",
            phone: plaintiff.phone || "",
            address: plaintiff.address || "",
            occupation: plaintiff.occupation || "",
          })
        );

        // Convert defendants object to array
        const defendantsArray = Object.values(foundCase.defendants || {}).map(
          (defendant, index) => ({
            id: `defendant-${index + 1}`,
            name: defendant.name || "",
            parents: defendant.parentsName || "",
            email: defendant.email || "",
            phone: defendant.phone || "",
            address: defendant.address || "",
            occupation: defendant.occupation || "",
          })
        );

        setPlaintiffs(plaintiffsArray);
        setDefendants(defendantsArray);

        // Set dispute information from the backend
        setDisputeInfo({
          category: foundCase.caseCategory || "",
          suitValue: "",
          nature: foundCase.disputeNature || "",
        });
      }
    }
  }, [mediationCases, caseId]);

  useEffect(() => {
    calculateCosts();
  }, [mediatorDetails.totalCost, plaintiffs.length, defendants.length]);

  const calculateCosts = () => {
    const totalCost = parseFloat(mediatorDetails.totalCost) || 0;
    const partyCount = plaintiffs.length + defendants.length;
    const costPerParty = partyCount > 0 ? totalCost / partyCount : 0;
    setCostPerParty(costPerParty);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create mediator object with name and email
    const mediatorObj = mediatorDetails.mediatorName
      ? {
          name: mediatorDetails.mediatorName,
          qualification: mediatorDetails.mediatorQualification,
          email: mediatorDetails.mediatorEmail,
        }
      : null;

    // Create JustiFi representative object
    const justifiRepresentativeObj = justifiRep.name
      ? {
          name: justifiRep.name,
          designation: justifiRep.designation,
          email: justifiRep.email,
        }
      : null;

    const formData = {
      agreementDate: new Date().toISOString().split("T")[0],
      disputeCategory: disputeInfo.category,
      suitValue: disputeInfo.suitValue,
      plaintiffs: plaintiffs,
      defendants: defendants,
      disputeNature: disputeInfo.nature,
      sessionsAgreed: mediatorDetails.sessionsAgreed,
      totalCost: mediatorDetails.totalCost,
      costPerParty: costPerParty.toFixed(2),
      // Send complete mediator object
      mediator: mediatorObj,
      // Send complete JustiFi representative object
      justifiRepresentative: justifiRepresentativeObj,
      caseId: caseId,
      caseTitle: selectedCase?.caseTitle || "",
    };

    onSubmit(formData);
  };

  const updatePlaintiff = (id, field, value) => {
    setPlaintiffs((prev) =>
      prev.map((plaintiff) =>
        plaintiff.id === id ? { ...plaintiff, [field]: value } : plaintiff
      )
    );
  };

  const updateDefendant = (id, field, value) => {
    setDefendants((prev) =>
      prev.map((defendant) =>
        defendant.id === id ? { ...defendant, [field]: value } : defendant
      )
    );
  };

  return (
    <div id="form-section" className="bg-white rounded-lg shadow-md p-6 mb-8">
      <form id="mediation-form" onSubmit={handleSubmit}>
        {/* Case Information Display */}
        {selectedCase && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">
              Case Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Case ID:</strong> {caseId}
              </div>
              <div>
                <strong>Case Title:</strong> {selectedCase.caseTitle || "N/A"}
              </div>
              <div>
                <strong>Category:</strong> {selectedCase.caseCategory || "N/A"}
              </div>
            </div>
          </div>
        )}

        {/* Party Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Party Information</h2>

          <MedPartySection
            title="Plaintiffs/Claimants"
            type="plaintiff"
            parties={plaintiffs}
            onUpdateParty={updatePlaintiff}
            colorClass="text-blue-600"
          />

          <MedPartySection
            title="Defendants/Respondents"
            type="defendant"
            parties={defendants}
            onUpdateParty={updateDefendant}
            colorClass="text-red-600"
          />
        </div>

        <MedDisputeInformation
          disputeInfo={disputeInfo}
          onUpdateDisputeInfo={setDisputeInfo}
        />

        <MediatorDetails
          mediatorDetails={mediatorDetails}
          onUpdateMediatorDetails={setMediatorDetails}
          mediators={mediators || []}
        />

        <MedCostBreakdown
          totalCost={mediatorDetails.totalCost}
          costPerParty={costPerParty}
        />

        <JustifiRepresentative
          justifiRep={justifiRep}
          onUpdateJustifiRep={setJustifiRep}
        />

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Generate Mediation Agreement
          </button>
        </div>
      </form>
    </div>
  );
};

export default MediationForm;
