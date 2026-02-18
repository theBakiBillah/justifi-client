import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import LawyerArbitrationHeader from "../components/LawyerArbitrationHeader";
import LawyerArbitratorsPanel from "../components/LawyerArbitratorsPanel";
import LawyerArbClientInformation from "../components/LawyerArbClientInformation";
import LawyerArbHearing from "../components/LawyerArbHearing";

const LawyerArbitrationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const LawyerarbitrationDetails = {
    "ARB-001": {
      id: "ARB-001",
      title: "Commercial Contract Dispute - ABC Corp vs XYZ Services",
      status: "ongoing",
      suitValue: "BDT 50,00,000",
      nature:
        "Breach of contract between business entities regarding service delivery timelines and payment terms with additional claims of consequential damages.",
      nextHearing: "2024-12-15T10:00",
      totalSessions: 8,
      completedSessions: 3,
      remainingSessions: 5,
      arbitrators: [
        {
          id: 1,
          name: "Dr. Ahmed Rahman",
          email: "ahmed.rahman@example.com",
          designation: "Senior Arbitrator",
          picture:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          specialization: "Commercial Law",
          experience: "15+ years",
        },
        {
          id: 2,
          name: "Prof. Fatima Begum",
          email: "fatima.begum@example.com",
          designation: "Presiding Arbitrator",
          picture:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          specialization: "Contract Law",
          experience: "12+ years",
        },
        {
          id: 3,
          name: "Adv. Rahim Khan",
          email: "rahim.khan@example.com",
          designation: "Arbitrator",
          picture:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          specialization: "Business Law",
          experience: "10+ years",
        },
      ],
      plaintiffs: [
        {
          id: 1,
          name: "ABC Corporation Ltd.",
          email: "legal@abccorp.com",
          contact: "+880 1712-345678",
          address: "123 Business Avenue, Commercial District, Dhaka 1205",
          picture:
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center",
          representative: "Mr. Kamal Hossain, Legal Counsel",
          evidence: [
            {
              id: 1,
              name: "Master Service Agreement.pdf",
              date: "2023-01-15",
              type: "Contract",
            },
            {
              id: 2,
              name: "Payment Records & Invoices.xlsx",
              date: "2023-03-20",
              type: "Financial",
            },
            {
              id: 3,
              name: "Email Correspondence Archive.zip",
              date: "2023-02-10",
              type: "Communication",
            },
            {
              id: 4,
              name: "Service Delivery Reports.pdf",
              date: "2023-04-05",
              type: "Performance",
            },
            {
              id: 5,
              name: "Damages Calculation Report.pdf",
              date: "2023-05-12",
              type: "Assessment",
            },
          ],
        },
      ],
      hearings: [
        {
          id: 1,
          date: "2024-11-10T10:00",
          arbitrator1Notes:
            "Initial arguments presented by both parties. Need detailed contract execution timeline.",
          arbitrator2Notes:
            "Parties mutually agreed to arbitration process. Preliminary jurisdiction established.",
          arbitrator3Notes:
            "Basic evidence submitted. Require complete financial transaction records.",
          result: "Adjourned for comprehensive document submission",
          documentsRequired:
            "Complete contract execution history, all payment records, communication logs",
          meetLink: "https://meet.justifi.com/arb-001-session1",
          attendance: "All parties present",
        },
        {
          id: 2,
          date: "2024-11-24T14:00",
          arbitrator1Notes:
            "Contractual obligations analysis completed. Identified several breach points.",
          arbitrator2Notes:
            "Payment schedule discrepancies quantified. Additional financial audit required.",
          arbitrator3Notes:
            "Witness statements reviewed and cross-referenced with documentary evidence.",
          result: "Evidence evaluation phase extended",
          documentsRequired:
            "Audited financial statements, expert witness reports, quality control documents",
          meetLink: "https://meet.justifi.com/arb-001-session2",
          attendance: "All parties present",
        },
        {
          id: 3,
          date: "2024-12-08T11:00",
          arbitrator1Notes:
            "Financial impact assessment underway. Damages calculation methodology reviewed.",
          arbitrator2Notes:
            "Expert testimony scheduled for next session. Technical evaluation pending.",
          arbitrator3Notes:
            "Settlement negotiation possibilities explored. Parties showed willingness to discuss.",
          result: "Adjourned for expert technical review",
          documentsRequired:
            "Expert evaluation reports, technical specifications, market analysis data",
          meetLink: "https://meet.justifi.com/arb-001-session3",
          attendance: "All parties present",
        },
      ],
    },
  };

  const arbitration =
    LawyerarbitrationDetails[id] || LawyerarbitrationDetails["ARB-001"];

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
      <LawyerArbitrationHeader arbitration={arbitration} />
      <LawyerArbitratorsPanel arbitrators={arbitration.arbitrators} />
      <LawyerArbClientInformation plaintiffs={arbitration.plaintiffs} />
      <LawyerArbHearing hearings={arbitration.hearings} />
    </div>
  );
};

export default LawyerArbitrationDetails;
