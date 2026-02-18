import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import ArbPartySection from "./ArbPartySection";
import ArbDisputeInformation from "./ArbDisputeInformation";
import ArbitratorsInformation from "./ArbitratorsInformation";
import ArbFinancialInformation from "./ArbFinancialInformation";
import JustifiRepresentative from "./JustifiRepresentative";

const ArbitrationForm = ({ onSubmit, caseId }) => {
  const axiosPublic = useAxiosPublic();

  // Fetch all arbitration cases and find the specific one by ID
  const {
    data: arbitrationCases,
    isLoading: casesLoading,
    error: casesError,
  } = useQuery({
    queryKey: ["arbitrationCases"],
    queryFn: async () => {
      const response = await axiosPublic.get("/all-arbitrations");
      return response.data;
    },
  });

  // Fetch arbitrators data
  const { data: arbitrators, isLoading: arbitratorsLoading } = useQuery({
    queryKey: ["arbitrators"],
    queryFn: async () => {
      const response = await axiosPublic.get("/arbitrators");
      return response.data;
    },
  });

  // Find the specific case from the array
  const arbitrationCase = arbitrationCases?.find(
    (caseItem) => caseItem._id === caseId
  );

  // Transform plaintiffs data from backend format to component format
  const transformPlaintiffs = () => {
    if (!arbitrationCase || !arbitrationCase.plaintiffs) return [];

    const plaintiffs = arbitrationCase.plaintiffs;

    return Object.keys(plaintiffs).map((key, index) => ({
      id: `plaintiff-${index + 1}`,
      name: plaintiffs[key].name,
      email: plaintiffs[key].email,
      phone: plaintiffs[key].phone,
      address: plaintiffs[key].address,
      occupation: plaintiffs[key].occupation,
      parentsName: plaintiffs[key].parentsName,
    }));
  };

  // Transform defendants data from backend format to component format
  const transformDefendants = () => {
    if (!arbitrationCase || !arbitrationCase.defendants) return [];

    const defendants = arbitrationCase.defendants;

    return Object.keys(defendants).map((key, index) => ({
      id: `defendant-${index + 1}`,
      name: defendants[key].name,
      email: defendants[key].email,
      phone: defendants[key].phone,
      address: defendants[key].address,
      occupation: defendants[key].occupation,
      parentsName: defendants[key].parentsName,
    }));
  };

  const [plaintiffs, setPlaintiffs] = useState([]);
  const [defendants, setDefendants] = useState([]);
  const [disputeInfo, setDisputeInfo] = useState({
    nature: "",
  });
  const [arbitratorsInfo, setArbitratorsInfo] = useState({
    arbitrator1: "",
    arbitrator2: "",
    presidingArbitrator: "",
  });
  const [financialInfo, setFinancialInfo] = useState({
    suitValue: "",
    sittings: "",
    totalCost: "",
    complianceDays: "",
  });
  const [justifiRep, setJustifiRep] = useState({
    name: "",
    designation: "",
    email: "",
  });

  // Initialize data when API data is loaded
  React.useEffect(() => {
    if (arbitrationCase) {
      setPlaintiffs(transformPlaintiffs());
      setDefendants(transformDefendants());
      setDisputeInfo((prev) => ({
        ...prev,
        nature: arbitrationCase.disputeNature || "",
      }));
      setFinancialInfo((prev) => ({
        ...prev,
        suitValue: arbitrationCase.suitValue || "",
        totalCost: " ",
      }));
    }
  }, [arbitrationCase]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create simplified arbitrator objects with only name and email
    const arbitrator1Obj = arbitrators?.find(
      (arb) => arb.name === arbitratorsInfo.arbitrator1
    )
      ? {
          name: arbitratorsInfo.arbitrator1,
          email:
            arbitrators?.find((arb) => arb.name === arbitratorsInfo.arbitrator1)
              ?.email || "",
        }
      : null;

    const arbitrator2Obj = arbitrators?.find(
      (arb) => arb.name === arbitratorsInfo.arbitrator2
    )
      ? {
          name: arbitratorsInfo.arbitrator2,
          email:
            arbitrators?.find((arb) => arb.name === arbitratorsInfo.arbitrator2)
              ?.email || "",
        }
      : null;

    const presidingArbitratorObj = arbitrators?.find(
      (arb) => arb.name === arbitratorsInfo.presidingArbitrator
    )
      ? {
          name: arbitratorsInfo.presidingArbitrator,
          email:
            arbitrators?.find(
              (arb) => arb.name === arbitratorsInfo.presidingArbitrator
            )?.email || "",
        }
      : null;

    // Create simplified JustiFi representative object
    const justifiRepresentativeObj = justifiRep.name
      ? {
          name: justifiRep.name,
          designation: justifiRep.designation,
          email: justifiRep.email,
        }
      : null;

    const formData = {
      caseId: caseId,
      caseTitle: arbitrationCase?.caseTitle || "",
      caseCategory: arbitrationCase?.caseCategory || "",
      agreementDate: new Date().toISOString().split("T")[0],
      plaintiffs: plaintiffs,
      defendants: defendants,
      disputeNature: disputeInfo.nature,
      // Send simplified arbitrator objects with only name and email
      arbitrator1: arbitrator1Obj,
      arbitrator2: arbitrator2Obj,
      presidingArbitrator: presidingArbitratorObj,
      suitValue: financialInfo.suitValue,
      sittings: financialInfo.sittings,
      totalCost: financialInfo.totalCost,
      complianceDays: financialInfo.complianceDays,
      // Send simplified JustiFi representative object
      justifiRepresentative: justifiRepresentativeObj,
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

  if (casesLoading || arbitratorsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex justify-center items-center h-64">
        <div className="text-lg">Loading arbitration data...</div>
      </div>
    );
  }

  if (casesError) {
    console.error("Error loading cases:", casesError);
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex justify-center items-center h-64">
        <div className="text-lg text-red-600">
          Error loading case data: {casesError.message}
        </div>
      </div>
    );
  }

  if (caseId && !arbitrationCase) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex justify-center items-center h-64">
        <div className="text-lg text-red-600">
          Case not found with ID: {caseId}
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Available cases: {arbitrationCases?.length || 0}
        </div>
      </div>
    );
  }

  return (
    <div id="form-section" className="bg-white rounded-lg shadow-md p-6 mb-8">
      {caseId && arbitrationCase && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Case Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <strong>Case ID:</strong> {caseId}
            </div>
            <div>
              <strong>Case Title:</strong> {arbitrationCase.caseTitle}
            </div>
            <div>
              <strong>Category:</strong> {arbitrationCase.caseCategory}
            </div>
            <div>
              <strong>Suit Value:</strong> BDT {arbitrationCase.suitValue}
            </div>
          </div>
        </div>
      )}

      <form id="arbitration-form" onSubmit={handleSubmit}>
        {/* Party Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Party Information</h2>

          <ArbPartySection
            title="Plaintiffs/Claimants"
            parties={plaintiffs}
            onUpdateParty={updatePlaintiff}
            colorClass="text-blue-600"
          />

          <ArbPartySection
            title="Defendants/Respondents"
            parties={defendants}
            onUpdateParty={updateDefendant}
            colorClass="text-red-600"
          />
        </div>

        <ArbDisputeInformation
          disputeInfo={disputeInfo}
          onUpdateDisputeInfo={setDisputeInfo}
        />

        <ArbitratorsInformation
          arbitrators={arbitratorsInfo}
          onUpdateArbitrators={setArbitratorsInfo}
          arbitratorsList={arbitrators || []}
        />

        <ArbFinancialInformation
          financialInfo={financialInfo}
          onUpdateFinancialInfo={setFinancialInfo}
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
            Generate Arbitration Agreement
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArbitrationForm;
