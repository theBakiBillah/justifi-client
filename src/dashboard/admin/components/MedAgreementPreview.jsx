import React from "react";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { jsPDF } from "jspdf";

const MedAgreementPreview = ({ formData, onBack }) => {
  // Helper function to get mediator data safely
  const getMediatorName = () => {
    if (!formData.mediator) return "N/A";
    return formData.mediator.name || "N/A";
  };

  const getMediatorQualification = () => {
    if (!formData.mediator) return "N/A";
    return formData.mediator.qualification || "N/A";
  };

  // Helper function to get JustiFi representative data safely
  const getJustifiName = () => {
    if (!formData.justifiRepresentative) return "N/A";
    return formData.justifiRepresentative.name || "N/A";
  };

  const getJustifiDesignation = () => {
    if (!formData.justifiRepresentative) return "N/A";
    return formData.justifiRepresentative.designation || "N/A";
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const generatePDF = () => {
    if (!formData) return;

    const downloadBtn = document.getElementById("download-pdf");
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = "Generating PDF...";
    downloadBtn.disabled = true;

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;
      const lineHeight = 6;
      const sectionSpacing = 8;

      // Header
      pdf.setFont("times", "bold");
      pdf.setFontSize(18);
      pdf.text("JustiFi - Mediation Agreement", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += lineHeight;

      pdf.setFontSize(12);
      pdf.setFont("times", "normal");
      const agreementDateDisplay = formatDateForDisplay(formData.agreementDate);
      pdf.text(`Date: ${agreementDateDisplay}`, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += sectionSpacing * 2;

      // THIS MEDIATION AGREEMENT section
      pdf.setFontSize(14);
      pdf.setFont("times", "bold");
      pdf.text("THIS MEDIATION AGREEMENT", margin, yPosition);
      yPosition += lineHeight;

      pdf.setFont("times", "normal");
      pdf.setFontSize(11);
      const agreementText =
        '(Here in after referred to as the "Agreement") is made and entered into by and between the following parties:';
      const agreementLines = pdf.splitTextToSize(
        agreementText,
        pageWidth - 2 * margin
      );
      pdf.text(agreementLines, margin, yPosition);
      yPosition += agreementLines.length * lineHeight + sectionSpacing;

      // Parties information - Side by side layout
      const partyWidth = (pageWidth - 2 * margin - 10) / 2;
      const plaintiffsStartY = yPosition;

      // Plaintiffs Column
      pdf.setFont("times", "bold");
      pdf.setTextColor(0, 0, 255);
      pdf.text("PLAINTIFFS", margin, yPosition);
      yPosition += lineHeight;

      let maxPlaintiffHeight = 0;
      formData.plaintiffs.forEach((plaintiff, index) => {
        pdf.setFont("times", "bold");
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Plaintiff ${index + 1}:`, margin, yPosition);
        yPosition += lineHeight;

        pdf.setFont("times", "normal");
        const plaintiffDetails = [
          `Name: ${plaintiff.name}`,
          `Parents: ${plaintiff.parents}`,
          `Email: ${plaintiff.email}`,
          `Phone: ${plaintiff.phone}`,
          `Address: ${plaintiff.address}`,
          `Occupation: ${plaintiff.occupation}`,
        ];

        plaintiffDetails.forEach((detail) => {
          pdf.text(detail, margin + 5, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 2;
        maxPlaintiffHeight = yPosition - plaintiffsStartY;
      });

      // Defendants Column - Start at same Y position
      yPosition = plaintiffsStartY;
      pdf.setFont("times", "bold");
      pdf.setTextColor(255, 0, 0);
      pdf.text("DEFENDANTS", margin + partyWidth + 10, yPosition);
      yPosition += lineHeight;

      formData.defendants.forEach((defendant, index) => {
        pdf.setFont("times", "bold");
        pdf.setTextColor(0, 0, 0);
        pdf.text(
          `Defendant ${index + 1}:`,
          margin + partyWidth + 10,
          yPosition
        );
        yPosition += lineHeight;

        pdf.setFont("times", "normal");
        const defendantDetails = [
          `Name: ${defendant.name}`,
          `Parents: ${defendant.parents}`,
          `Email: ${defendant.email}`,
          `Phone: ${defendant.phone}`,
          `Address: ${defendant.address}`,
          `Occupation: ${defendant.occupation}`,
        ];

        defendantDetails.forEach((detail) => {
          pdf.text(detail, margin + partyWidth + 15, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 2;
      });

      // Move to the maximum height of both columns
      yPosition =
        plaintiffsStartY +
        Math.max(maxPlaintiffHeight, yPosition - plaintiffsStartY) +
        sectionSpacing;

      // Collective reference
      pdf.setTextColor(0, 0, 0);
      const collectiveText =
        'Collectively referred to as the "Parties", and individually as a "Party".';
      pdf.text(collectiveText, margin, yPosition);
      yPosition += sectionSpacing * 2;

      // Check for page break
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }

      // WHEREAS section
      pdf.setFont("times", "bold");
      pdf.setFontSize(14);
      pdf.text("WHEREAS:", margin, yPosition);
      yPosition += lineHeight;

      pdf.setFont("times", "normal");
      pdf.setFontSize(11);
      const whereasPoints = [
        `1. The Parties are involved in a dispute of category ${formData.disputeCategory} with suit value ${formData.suitValue} arising out of: ${formData.disputeNature};`,
        `2. The Parties have mutually agreed to refer the said dispute to mediation through the JustiFi – Online Legal Aid & Mediation Platform;`,
        `3. The Parties desire to record their mutual understanding and agreement to the terms, conditions, and procedures governing such mediation.`,
      ];

      whereasPoints.forEach((point) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        const lines = pdf.splitTextToSize(point, pageWidth - 2 * margin);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * lineHeight + 2;
      });
      yPosition += sectionSpacing;

      // Articles
      const articles = [
        {
          title: "ARTICLE 1: MEDIATION TERMS",
          content: [
            "1.1 Mediation Process: The Parties have agreed to resolve their dispute through mediation.",
            `1.2 Session Agreement: The Parties have agreed to ${formData.sessionsAgreed} mediation session(s).`,
            `1.3 Assigned Mediator: ${getMediatorName()} (${getMediatorQualification()}) has been assigned as the mediator.`,
          ],
        },
        {
          title: "ARTICLE 2: COST DISTRIBUTION",
          content: [
            "2.1 Equal Cost Sharing: All mediation costs shall be divided equally among all parties.",
            "2.2 Cost Breakdown:",
            `   • Total Mediation Cost: BDT ${parseFloat(
              formData.totalCost || 0
            ).toFixed(2)}`,
            `   • Number of Parties: ${
              formData.plaintiffs.length + formData.defendants.length
            }`,
            `   • Cost per Party: BDT ${parseFloat(
              formData.costPerParty || 0
            ).toFixed(2)}`,
            "2.3 Payment Responsibility: Parties are jointly and severally responsible for full payment.",
          ],
        },
        {
          title: "ARTICLE 3: CONFIDENTIALITY",
          content: [
            "3.1 Strict Confidentiality: All mediation proceedings, documents, discussions, and offers remain strictly confidential.",
            "3.2 Legal Protection: Mediation communications are privileged and cannot be used as evidence in legal proceedings.",
          ],
        },
        {
          title: "ARTICLE 4: PARTY RESPONSIBILITIES",
          content: [
            "4.1 Financial Obligations: Each Party agrees to pay their equal share of all mediation costs according to the agreed schedule.",
            "4.2 Participation Requirements: Each Party agrees to:",
            "   • Attend all scheduled mediation sessions",
            "   • Participate in good faith throughout the process",
            "   • Maintain respectful and professional conduct",
            "   • Respect the mediator and other parties",
          ],
        },
        {
          title: "ARTICLE 5: ACKNOWLEDGMENT AND ACCEPTANCE",
          content: [
            "By signing this Agreement, the Parties acknowledge and agree to:",
            "• Bear equal share of all mediation costs",
            "• Participate in good faith throughout the mediation process",
            "• Maintain strict confidentiality of all proceedings",
            `• Accept the mediation session limits (${formData.sessionsAgreed} session(s))`,
            "• Be bound by the mediator's decisions and procedures",
          ],
        },
      ];

      articles.forEach((article) => {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFont("times", "bold");
        pdf.setFontSize(14);
        pdf.text(article.title, margin, yPosition);
        yPosition += lineHeight + 2;

        pdf.setFont("times", "normal");
        pdf.setFontSize(11);

        article.content.forEach((line) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          const lines = pdf.splitTextToSize(line, pageWidth - 2 * margin);
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * lineHeight + 2;
        });

        yPosition += sectionSpacing;
      });

      // Signatures section
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFont("times", "bold");
      pdf.setFontSize(14);
      pdf.text("EXECUTION & SIGNATURES", margin, yPosition);
      yPosition += lineHeight + 2;

      pdf.setFont("times", "normal");
      pdf.setFontSize(11);
      const witnessText =
        "IN WITNESS WHEREOF, the Parties have executed this Mediation Agreement on the date first written above.";
      const witnessLines = pdf.splitTextToSize(
        witnessText,
        pageWidth - 2 * margin
      );
      pdf.text(witnessLines, margin, yPosition);
      yPosition += witnessLines.length * lineHeight + sectionSpacing;

      // Signatures - Side by side layout
      const signatureWidth = (pageWidth - 2 * margin - 10) / 2;
      const signatureStartY = yPosition;

      // Plaintiffs Signatures
      pdf.setFont("times", "bold");
      pdf.text("PLAINTIFFS", margin, yPosition);
      yPosition += lineHeight;

      formData.plaintiffs.forEach((plaintiff) => {
        pdf.setFont("times", "normal");
        pdf.text(plaintiff.name, margin, yPosition);
        yPosition += lineHeight;

        // Signature line
        pdf.line(margin, yPosition, margin + 60, yPosition);
        yPosition += lineHeight + sectionSpacing; // Removed date line
      });

      const plaintiffsSignatureHeight = yPosition - signatureStartY;

      // Defendants Signatures
      yPosition = signatureStartY;
      pdf.setFont("times", "bold");
      pdf.text("DEFENDANTS", margin + signatureWidth + 10, yPosition);
      yPosition += lineHeight;

      formData.defendants.forEach((defendant) => {
        pdf.setFont("times", "normal");
        pdf.text(defendant.name, margin + signatureWidth + 10, yPosition);
        yPosition += lineHeight;

        // Signature line
        pdf.line(
          margin + signatureWidth + 10,
          yPosition,
          margin + signatureWidth + 70,
          yPosition
        );
        yPosition += lineHeight + sectionSpacing; // Removed date line
      });

      const defendantsSignatureHeight = yPosition - signatureStartY;
      yPosition =
        signatureStartY +
        Math.max(plaintiffsSignatureHeight, defendantsSignatureHeight) +
        sectionSpacing;

      // JustiFi Representative
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFont("times", "bold");
      pdf.text("ON BEHALF OF JUSTIFI", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += lineHeight;

      pdf.setFont("times", "normal");
      pdf.text(`Name: ${getJustifiName()}`, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += lineHeight;
      pdf.text(
        `Designation: ${getJustifiDesignation()}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += lineHeight;

      // Signature line
      pdf.line(pageWidth / 2 - 30, yPosition, pageWidth / 2 + 30, yPosition);
      yPosition += lineHeight;

      pdf.text(`Date: ${agreementDateDisplay}`, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += sectionSpacing * 2;

      // Footer
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFont("times", "bold");
      pdf.setFontSize(10);
      pdf.text(
        "JustiFi - Fair Dispute Resolution Through Equal Partnership",
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += lineHeight;

      pdf.setFont("times", "normal");
      const footerText =
        "This document constitutes a legally binding agreement between all signing parties.";
      const footerLines = pdf.splitTextToSize(
        footerText,
        pageWidth - 2 * margin
      );
      pdf.text(footerLines, pageWidth / 2, yPosition, { align: "center" });

      // Save the PDF
      pdf.save("mediation-agreement.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      downloadBtn.textContent = originalText;
      downloadBtn.disabled = false;
    }
  };

  if (!formData) return null;

  const agreementDateDisplay = formatDateForDisplay(formData.agreementDate);

  return (
    <div id="output-section" className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Generated Mediation Agreement</h2>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to Form
        </button>
      </div>

      {/* Agreement Preview */}
      <div
        id="agreement-preview"
        className="font-['Times_New_Roman',Times,serif] leading-relaxed text-sm bg-white p-8 border border-gray-300 rounded-lg"
      >
        <div className="text-center border-b-2 border-blue-800 pb-4 mb-8">
          <h1 className="text-2xl font-bold mb-2">
            JustiFi - Mediation Agreement
          </h1>
          <p className="text-lg">
            <strong>Date:</strong> {agreementDateDisplay}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            THIS MEDIATION AGREEMENT
          </h2>
          <p className="mb-4 text-justify">
            (Here in after referred to as the "Agreement") is made and entered
            into by and between the following parties:
          </p>

          {/* Parties information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-3 text-blue-600">
                PLAINTIFFS
              </h3>
              {formData.plaintiffs.map((plaintiff, index) => (
                <div
                  key={index}
                  className="mb-4 p-3 border border-gray-200 rounded"
                >
                  <p className="font-semibold">Plaintiff {index + 1}</p>
                  <p>
                    <strong>Name:</strong> {plaintiff.name}
                  </p>
                  <p>
                    <strong>Parents:</strong> {plaintiff.parents}
                  </p>
                  <p>
                    <strong>Email:</strong> {plaintiff.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {plaintiff.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {plaintiff.address}
                  </p>
                  <p>
                    <strong>Occupation:</strong> {plaintiff.occupation}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-red-600">
                DEFENDANTS
              </h3>
              {formData.defendants.map((defendant, index) => (
                <div
                  key={index}
                  className="mb-4 p-3 border border-gray-200 rounded"
                >
                  <p className="font-semibold">Defendant {index + 1}</p>
                  <p>
                    <strong>Name:</strong> {defendant.name}
                  </p>
                  <p>
                    <strong>Parents:</strong> {defendant.parents}
                  </p>
                  <p>
                    <strong>Email:</strong> {defendant.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {defendant.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {defendant.address}
                  </p>
                  <p>
                    <strong>Occupation:</strong> {defendant.occupation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-justify">
            Collectively referred to as the <strong>Parties</strong>, and
            individually as a <strong>Party</strong>.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">WHEREAS:</h2>
          <ol className="list-decimal pl-6 space-y-3">
            <li className="text-justify">
              The Parties are involved in a dispute of category{" "}
              <strong>{formData.disputeCategory}</strong> with suit value{" "}
              <strong>{formData.suitValue}</strong> arising out of:{" "}
              <strong>{formData.disputeNature}</strong>;
            </li>
            <li className="text-justify">
              The Parties have mutually agreed to refer the said dispute to
              mediation through the{" "}
              <strong>JustiFi – Online Legal Aid & Mediation Platform</strong>;
            </li>
            <li className="text-justify">
              The Parties desire to record their mutual understanding and
              agreement to the terms, conditions, and procedures governing such
              mediation.
            </li>
          </ol>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            ARTICLE 1: MEDIATION TERMS
          </h2>
          <div className="text-justify">
            <p className="mb-2">
              <strong>1.1 Mediation Process:</strong> The Parties have agreed to
              resolve their dispute through mediation.
            </p>
            <p className="mb-2">
              <strong>1.2 Session Agreement:</strong> The Parties have agreed to{" "}
              <strong>{formData.sessionsAgreed} mediation session(s)</strong>.
            </p>
            <p className="mb-2">
              <strong>1.3 Assigned Mediator:</strong> {getMediatorName()} (
              {getMediatorQualification()}) has been assigned as the mediator.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            ARTICLE 2: COST DISTRIBUTION
          </h2>
          <div className="text-justify">
            <p className="mb-2">
              <strong>2.1 Equal Cost Sharing:</strong> All mediation costs shall
              be divided equally among all parties.
            </p>
            <p className="mb-2">
              <strong>2.2 Cost Breakdown:</strong>
            </p>
            <ul className="list-disc pl-6 mt-2 mb-3">
              <li>
                Total Mediation Cost:{" "}
                <strong>
                  BDT {parseFloat(formData.totalCost || 0).toFixed(2)}
                </strong>
              </li>
              <li>
                Number of Parties:{" "}
                <strong>
                  {formData.plaintiffs.length + formData.defendants.length}
                </strong>
              </li>
              <li>
                Cost per Party:{" "}
                <strong>
                  BDT {parseFloat(formData.costPerParty || 0).toFixed(2)}
                </strong>
              </li>
            </ul>
            <p className="mt-3">
              <strong>2.3 Payment Responsibility:</strong> Parties are jointly
              and severally responsible for full payment.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            ARTICLE 3: CONFIDENTIALITY
          </h2>
          <div className="text-justify">
            <p className="mb-2">
              <strong>3.1 Strict Confidentiality:</strong> All mediation
              proceedings, documents, discussions, and offers remain strictly
              confidential.
            </p>
            <p className="mb-2">
              <strong>3.2 Legal Protection:</strong> Mediation communications
              are privileged and cannot be used as evidence in legal
              proceedings.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            ARTICLE 4: PARTY RESPONSIBILITIES
          </h2>
          <div className="text-justify">
            <p className="mb-2">
              <strong>4.1 Financial Obligations:</strong> Each Party agrees to
              pay their equal share of all mediation costs according to the
              agreed schedule.
            </p>
            <p className="mb-2">
              <strong>4.2 Participation Requirements:</strong> Each Party agrees
              to:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-3">
              <li>Attend all scheduled mediation sessions</li>
              <li>Participate in good faith throughout the process</li>
              <li>Maintain respectful and professional conduct</li>
              <li>Respect the mediator and other parties</li>
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            ARTICLE 5: ACKNOWLEDGMENT AND ACCEPTANCE
          </h2>
          <div className="text-justify">
            <p className="mb-2">
              By signing this Agreement, the Parties acknowledge and agree to:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-3">
              <li>Bear equal share of all mediation costs</li>
              <li>
                Participate in good faith throughout the mediation process
              </li>
              <li>Maintain strict confidentiality of all proceedings</li>
              <li>
                Accept the mediation session limits ({formData.sessionsAgreed}{" "}
                session(s))
              </li>
              <li>Be bound by the mediator's decisions and procedures</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 border-t pt-4">
          <p>
            <strong>
              JustiFi - Fair Dispute Resolution Through Equal Partnership
            </strong>
          </p>
          <p className="mt-2">
            This document constitutes a legally binding agreement between all
            signing parties.
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          id="download-pdf"
          onClick={generatePDF}
          className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaDownload />
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default MedAgreementPreview;
