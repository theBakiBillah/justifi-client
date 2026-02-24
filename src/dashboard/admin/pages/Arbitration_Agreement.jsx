import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import ArbAgreementPreview from "../components/ArbAgreementPreview";
import ArbitrationForm from "../components/ArbitrationForm";

function Arbitration_Agreement() {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(null);
  const [arbitrationId, setArbitrationId] = useState(null);
  const pdfContainerRef = useRef(null);
  const axiosSecure = useAxiosSecure();

  // Get caseId from URL parameters
  const { caseId } = useParams();

  const handleFormSubmit = async (data) => {
    setFormData(data);

    try {
      // Save agreement form data — backend now returns arbitrationId
      const response = await axiosSecure.patch(`/arbitration-agreement`, {
        data,
      });
      const resolvedArbitrationId = response?.data?.arbitrationId || null;
      console.log("Resolved arbitrationId:", resolvedArbitrationId);
      setArbitrationId(resolvedArbitrationId);
    } catch (error) {
      console.error("Failed to save agreement data:", error);
    }

    setShowPreview(true);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Arbitration Agreement Form
        </h1>

        {!showPreview ? (
          <ArbitrationForm onSubmit={handleFormSubmit} caseId={caseId} />
        ) : (
          <ArbAgreementPreview
            formData={formData}
            onBack={handleBackToForm}
            pdfContainerRef={pdfContainerRef}
            caseId={caseId}
            arbitrationId={arbitrationId}
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

export default Arbitration_Agreement;
