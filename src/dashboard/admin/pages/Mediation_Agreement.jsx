import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import MediationForm from "../components/MediationForm";
import MedAgreementPreview from "../components/MedAgreementPreview";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

function Mediation_Agreement() {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const pdfContainerRef = useRef(null);
  const location = useLocation();
  const axiosSecure = useAxiosSecure();

  // Extract case ID from URL — e.g. /admin/mediation-agreement/69134ecebeac51e6b905d2de
  const getCaseIdFromUrl = () => {
    const pathSegments = location.pathname.split("/");
    return pathSegments[pathSegments.length - 1];
  };

  const caseId = getCaseIdFromUrl();

  const handleFormSubmit = async (data) => {
    // ✅ FIX 1: Always attach caseId so the backend knows which document to update
    const payload = { ...data, caseId };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // ✅ FIX 2: await the request — without this the 404 error is silently lost
      const response = await axiosSecure.patch(`/mediation-agreement`, {
        data: payload,
      });

      if (response.data.success) {
        // ✅ FIX 3: Only show preview AFTER the server confirms success
        setFormData(payload);
        setShowPreview(true);
      } else {
        setSubmitError(response.data.error || "Failed to submit agreement.");
      }
    } catch (error) {
      console.error("Agreement submission error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Server error. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setShowPreview(false);
    setSubmitError(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          JustiFi - Mediation Agreement
        </h1>

        {/* ✅ Show submission error banner above the form */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-center font-medium">
            ⚠️ {submitError}
          </div>
        )}

        {!showPreview ? (
          <MediationForm
            onSubmit={handleFormSubmit}
            caseId={caseId}
            isSubmitting={isSubmitting}
          />
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
