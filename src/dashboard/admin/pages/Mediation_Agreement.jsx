import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import MediationForm from "../components/MediationForm";
import MedAgreementPreview from "../components/MedAgreementPreview";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

function Mediation_Agreement() {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(null);
  const pdfContainerRef = useRef(null);
  const location = useLocation();
  const axiosSecure = useAxiosSecure();

  // Extract case ID from URL
  const getCaseIdFromUrl = () => {
    const pathSegments = location.pathname.split("/");
    return pathSegments[pathSegments.length - 1];
  };

  const caseId = getCaseIdFromUrl();

  const handleFormSubmit = (data) => {
    setFormData(data);
    console.log("data: ", data);
    const response = axiosSecure.patch(`/mediation-agreement`, { data });
    setShowPreview(true);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          JustiFi - Mediation Agreement
        </h1>

        {!showPreview ? (
          <MediationForm onSubmit={handleFormSubmit} caseId={caseId} />
        ) : (
          <MedAgreementPreview
            formData={formData}
            onBack={handleBackToForm}
            pdfContainerRef={pdfContainerRef}
          />
        )}
      </div>

      {/* Hidden PDF Container */}
      <div
        ref={pdfContainerRef}
        className="absolute left-[-9999px] top-[-9999px] w-[210mm] min-h-[297mm] p-[20mm] bg-white font-['Times_New_Roman',Times,serif] leading-relaxed text-sm"
      >
        {/* PDF content will be inserted here */}
      </div>
    </div>
  );
}

export default Mediation_Agreement;
