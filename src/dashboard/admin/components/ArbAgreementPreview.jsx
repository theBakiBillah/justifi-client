// components/ArbAgreementPreview.jsx
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { jsPDF } from "jspdf";

const ArbAgreementPreview = ({ formData, onBack, pdfContainerRef, caseId }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (formData && pdfContainerRef.current) {
      generatePDFContent();
    }
  }, [formData, pdfContainerRef]);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      return `${day} ${month}, ${year}`;
    } catch (error) {
      return error.message;
    }
  };

  const generatePDFContent = () => {
    if (!formData || !pdfContainerRef.current) return;
    pdfContainerRef.current.innerHTML = "<div>PDF Content Ready</div>";
  };

  // Helper function to get arbitrator name safely
  const getArbitratorName = (arbitratorObj) => {
    if (!arbitratorObj) return "N/A";
    return arbitratorObj.name || "N/A";
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

  const generatePDF = async () => {
    if (!formData) {
      alert("No form data available");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      let yPos = margin;

      // Set font styles
      const setHeaderFont = () => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
      };

      const setSubHeaderFont = () => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
      };

      const setNormalFont = () => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
      };

      const setSmallFont = () => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
      };

      const checkPageBreak = (requiredSpace = 25) => {
        if (yPos > pageHeight - requiredSpace) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      const addText = (
        text,
        x = margin,
        customYPos = null,
        maxWidth = contentWidth,
        align = "left",
        lineHeight = 5
      ) => {
        const currentY = customYPos !== null ? customYPos : yPos;
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, currentY, { align });
        return lines.length * lineHeight;
      };

      // Title Section - Fixed center alignment
      setHeaderFont();
      pdf.text("ARBITRATION AGREEMENT", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 8;

      setNormalFont();
      const agreementDateDisplay = formatDateForDisplay(formData.agreementDate);
      pdf.text(`Date: ${agreementDateDisplay}`, pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 6;

      if (caseId) {
        pdf.text(`Case ID: ${caseId}`, pageWidth / 2, yPos, {
          align: "center",
        });
        yPos += 6;
      }

      yPos += 10;

      // THIS ARBITRATION AGREEMENT Section
      setSubHeaderFont();
      yPos += addText(
        "THIS ARBITRATION AGREEMENT",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 3;

      setNormalFont();
      yPos += addText(
        '(Here in after referred to as the "Agreement") is made and entered into by and between:',
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 10;

      // Parties Information - Side by side layout
      const partyWidth = contentWidth / 2 - 5;

      // Party 1 - Plaintiffs
      const party1X = margin;
      let party1Y = yPos;

      setSubHeaderFont();
      party1Y += addText(
        "Party 1 – Claimant(s)/Plaintiff(s)",
        party1X,
        party1Y,
        partyWidth,
        "left",
        5
      );
      party1Y += 5;

      setNormalFont();
      formData.plaintiffs.forEach((plaintiff, index) => {
        checkPageBreak(35);

        // Plaintiff number
        party1Y += addText(
          `Plaintiff-${index + 1}`,
          party1X,
          party1Y,
          partyWidth,
          "left",
          4
        );

        // Plaintiff details with proper indentation
        party1Y += addText(
          ` Name: ${plaintiff.name || "N/A"}`,
          party1X,
          party1Y,
          partyWidth,
          "left",
          4
        );
        party1Y += addText(
          ` Parent: ${plaintiff.parentsName || "N/A"}`,
          party1X,
          party1Y,
          partyWidth,
          "left",
          4
        );
        party1Y += addText(
          ` Email: ${plaintiff.email || "N/A"}`,
          party1X,
          party1Y,
          partyWidth,
          "left",
          4
        );
        party1Y += addText(
          ` Phone: ${plaintiff.phone || "N/A"}`,
          party1X,
          party1Y,
          partyWidth,
          "left",
          4
        );
        party1Y += addText(
          ` Address: ${plaintiff.address || "N/A"}`,
          party1X,
          party1Y,
          partyWidth,
          "left",
          4
        );
        party1Y += addText(
          ` Occupation: ${plaintiff.occupation || "N/A"}`,
          party1X,
          party1Y,
          partyWidth,
          "left",
          4
        );
        party1Y += 5; // Extra space between plaintiffs
      });

      party1Y += addText(
        "(Here in after referred to as the First Party)",
        party1X,
        party1Y,
        partyWidth,
        "left",
        5
      );

      // Party 2 - Defendants
      const party2X = margin + partyWidth + 10;
      let party2Y = yPos;

      setSubHeaderFont();
      party2Y += addText(
        "Party 2 – Respondent(s)/Defendant(s)",
        party2X,
        party2Y,
        partyWidth,
        "left",
        5
      );
      party2Y += 5;

      setNormalFont();
      formData.defendants.forEach((defendant, index) => {
        checkPageBreak(35);

        // Defendant number
        party2Y += addText(
          `Defendant-${index + 1}`,
          party2X,
          party2Y,
          partyWidth,
          "left",
          4
        );

        // Defendant details with proper indentation
        party2Y += addText(
          ` Name: ${defendant.name || "N/A"}`,
          party2X,
          party2Y,
          partyWidth,
          "left",
          4
        );
        party2Y += addText(
          ` Parent: ${defendant.parentsName || "N/A"}`,
          party2X,
          party2Y,
          partyWidth,
          "left",
          4
        );
        party2Y += addText(
          ` Email: ${defendant.email || "N/A"}`,
          party2X,
          party2Y,
          partyWidth,
          "left",
          4
        );
        party2Y += addText(
          ` Phone: ${defendant.phone || "N/A"}`,
          party2X,
          party2Y,
          partyWidth,
          "left",
          4
        );
        party2Y += addText(
          ` Address: ${defendant.address || "N/A"}`,
          party2X,
          party2Y,
          partyWidth,
          "left",
          4
        );
        party2Y += addText(
          ` Occupation: ${defendant.occupation || "N/A"}`,
          party2X,
          party2Y,
          partyWidth,
          "left",
          4
        );
        party2Y += 5; // Extra space between defendants
      });

      party2Y += addText(
        "(Here in after referred to as the Second Party)",
        party2X,
        party2Y,
        partyWidth,
        "left",
        5
      );

      // Use the maximum Y position from both parties
      yPos = Math.max(party1Y, party2Y) + 10;

      checkPageBreak();
      yPos += addText(
        "Collectively referred to as the Parties, and individually as a Party.",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 10;

      // WHEREAS Section
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText("WHEREAS:", margin, yPos, contentWidth, "left", 5);
      yPos += 5;

      setNormalFont();
      const whereasPoints = [
        `1. The Parties are involved in a legal dispute arising out of ${
          formData.disputeNature || "N/A"
        } ("Dispute");`,
        `2. The Parties have mutually agreed to refer the said Dispute to arbitration, to be conducted through the JustiFi – Online Legal Aid & Arbitration Platform, under its established rules and procedures;`,
        `3. The Parties desire to record their mutual understanding and agreement to the terms, conditions, and procedures governing such arbitration.`,
      ];

      whereasPoints.forEach((point) => {
        checkPageBreak(10);
        yPos += addText(point, margin, yPos, contentWidth, "left", 4);
        yPos += 2;
      });

      yPos += 10;

      // Section 1: Arbitration Reference
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText(
        "1. Arbitration Reference",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 5;

      setNormalFont();
      const section1Points = [
        "1.1 The Parties voluntarily and irrevocably agree to submit the Dispute to arbitration in accordance with the provisions of the Arbitration Act, 2001 (Bangladesh).",
        "1.2 The arbitration proceedings shall be conducted primarily through Online Dispute Resolution (ODR) using the JustiFi Platform.",
        "1.3 In exceptional cases, where physical/offline hearings are deemed necessary, the Arbitrator(s) may order the same. All associated costs shall be borne equally (50%-50%) by both Parties.",
      ];

      section1Points.forEach((point) => {
        checkPageBreak(10);
        yPos += addText(point, margin, yPos, contentWidth, "left", 4);
        yPos += 2;
      });

      yPos += 10;

      // Section 2: Constitution of the Arbitral Tribunal
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText(
        "2. Constitution of the Arbitral Tribunal",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 5;

      setNormalFont();
      yPos += addText(
        "2.1 Number of Arbitrators: Three (3)",
        margin,
        yPos,
        contentWidth,
        "left",
        4
      );
      yPos += 4;

      const arbitrators = [
        `• Arbitrator 1: ${getArbitratorName(formData.arbitrator1)}`,
        `• Arbitrator 2: ${getArbitratorName(formData.arbitrator2)}`,
        `• Arbitrator 3 (Presiding Arbitrator): ${getArbitratorName(
          formData.presidingArbitrator
        )}`,
      ];

      arbitrators.forEach((arbitrator) => {
        yPos += addText(
          arbitrator,
          margin + 5,
          yPos,
          contentWidth - 5,
          "left",
          4
        );
      });

      yPos += 4;
      yPos += addText(
        "2.2 The Arbitrators shall be neutral and independent, in accordance with Section 12 of the Arbitration Act, 2001, and their decision shall be final and binding upon the Parties.",
        margin,
        yPos,
        contentWidth,
        "left",
        4
      );
      yPos += 10;

      // Section 3: Seat, Venue & Language
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText(
        "3. Seat, Venue & Language",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 5;

      setNormalFont();
      const section3Points = [
        "3.1 Seat of Arbitration: Dhaka, Bangladesh (unless otherwise mutually agreed).",
        "3.2 Mode: Online (virtual hearings) via the JustiFi ODR System.",
        "3.3 Language: English and/or Bangla, as agreed between the Parties.",
      ];

      section3Points.forEach((point) => {
        checkPageBreak(10);
        yPos += addText(point, margin, yPos, contentWidth, "left", 4);
        yPos += 2;
      });

      yPos += 10;

      // Section 4: Suit Value, Costs & Fees
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText(
        "4. Suit Value, Costs & Fees",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 5;

      setNormalFont();
      const section4Points = [
        `4.1 Suit Value (Dispute Amount): BDT ${formData.suitValue || "N/A"}`,
        `4.2 Number of Sittings (Initially Agreed): ${
          formData.sittings || "N/A"
        }`,
        `4.3 Total Arbitration Cost (Administrative + Arbitrator Fees): BDT ${
          formData.totalCost || "N/A"
        }`,
        "4.4 All costs of arbitration shall be shared equally between the Parties.",
        "4.5 If additional sittings are deemed necessary for fair adjudication, the Arbitrator(s) may extend proceedings, and any additional costs shall also be borne equally by both Parties.",
        "4.6 Each Party shall individually bear the cost of its own lawyers, representatives, advisors, or personal expenses.",
      ];

      section4Points.forEach((point) => {
        checkPageBreak(10);
        yPos += addText(point, margin, yPos, contentWidth, "left", 4);
        yPos += 2;
      });

      yPos += 10;

      // Section 5: Premature Termination / Withdrawal
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText(
        "5. Premature Termination / Withdrawal",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 5;

      setNormalFont();
      yPos += addText(
        "5.1 Should either Party withdraw or terminate participation before conclusion:",
        margin,
        yPos,
        contentWidth,
        "left",
        4
      );
      yPos += 4;

      const terminationPoints = [
        "• That Party must pay all costs incurred up to the date of termination; and",
        "• An additional lump-sum penalty as determined by the Arbitrator(s) or JustiFi to cover administrative expenses.",
      ];

      terminationPoints.forEach((point) => {
        yPos += addText(point, margin + 5, yPos, contentWidth - 5, "left", 4);
      });

      yPos += 4;
      yPos += addText(
        "5.2 The arbitration may continue ex parte if one Party fails to participate, at the discretion of the Arbitrator(s).",
        margin,
        yPos,
        contentWidth,
        "left",
        4
      );
      yPos += 10;

      // Section 6: Conduct & Confidentiality
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText(
        "6. Conduct & Confidentiality",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 5;

      setNormalFont();
      const section6Points = [
        "6.1 Both Parties shall maintain professional conduct and respect toward the Arbitrator(s) and the JustiFi platform.",
        "6.2 Any form of abuse, misconduct, or defamatory act towards the Tribunal or platform shall constitute a breach of this Agreement.",
        "6.3 All proceedings, documents, evidence, and awards shall remain strictly confidential.",
        "6.4 No Party shall disclose or publish any part of the arbitration process unless required by law or upon written consent of the other Party.",
      ];

      section6Points.forEach((point) => {
        checkPageBreak(10);
        yPos += addText(point, margin, yPos, contentWidth, "left", 4);
        yPos += 2;
      });

      yPos += 10;

      // Section 7: Powers & Duties of Arbitrators
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText(
        "7. Powers & Duties of Arbitrators",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 5;

      setNormalFont();
      yPos += addText(
        "The Arbitrator(s) shall have the power to:",
        margin,
        yPos,
        contentWidth,
        "left",
        4
      );
      yPos += 4;

      const powers = [
        "• Decide all procedural and evidentiary matters;",
        "• Request additional hearings, documents, or witnesses;",
        "• Extend the number of sittings as necessary;",
        "• Prohibit any unilateral or ex parte communications;",
        "• Interpret contractual obligations to reach a fair and lawful resolution.",
      ];

      powers.forEach((power) => {
        yPos += addText(power, margin + 5, yPos, contentWidth - 5, "left", 4);
      });

      yPos += 10;

      // Section 8: Applicable Law & Jurisdiction
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText(
        "8. Applicable Law & Jurisdiction",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 5;

      setNormalFont();
      yPos += addText(
        "This Agreement and all arbitration proceedings shall be governed by:",
        margin,
        yPos,
        contentWidth,
        "left",
        4
      );
      yPos += 4;

      const lawPoints = [
        "• The Arbitration Act, 2001 (Bangladesh); and",
        "• The laws of the People's Republic of Bangladesh.",
      ];

      lawPoints.forEach((point) => {
        yPos += addText(point, margin + 5, yPos, contentWidth - 5, "left", 4);
      });

      yPos += 4;
      yPos += addText(
        "Courts situated in Dhaka, Bangladesh shall have exclusive jurisdiction for enforcement, setting aside, or any judicial assistance concerning the arbitral award.",
        margin,
        yPos,
        contentWidth,
        "left",
        4
      );
      yPos += 10;

      // Section 9: Binding Nature of Award
      checkPageBreak();
      setSubHeaderFont();
      yPos += addText(
        "9. Binding Nature of Award",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 5;

      setNormalFont();
      yPos += addText(
        "The Award rendered by the Arbitral Tribunal shall be:",
        margin,
        yPos,
        contentWidth,
        "left",
        4
      );
      yPos += 4;

      const awardPoints = [
        "• Final and binding upon both Parties, under Section 44 of the Arbitration Act, 2001;",
        "• Enforceable as a decree or court order within Bangladesh; and",
        `• Obligatory to be complied with within ${
          formData.complianceDays || "N/A"
        } days from the date of issuance.`,
      ];

      awardPoints.forEach((point) => {
        yPos += addText(point, margin + 5, yPos, contentWidth - 5, "left", 4);
      });

      yPos += 15;

      // EXECUTION & SIGNATURES Section - Fixed alignment
      checkPageBreak(80);
      setSubHeaderFont();
      pdf.text("EXECUTION & SIGNATURES", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 8;

      setNormalFont();
      const witnessText =
        "IN WITNESS WHEREOF, the Parties have executed this Arbitration Agreement on the date first written above.";
      const witnessLines = pdf.splitTextToSize(witnessText, contentWidth);
      pdf.text(witnessLines, pageWidth / 2, yPos, { align: "center" });
      yPos += witnessLines.length * 5 + 10;

      // Signatures Table - Fixed alignment
      const signatureSectionWidth = contentWidth / 3;
      const signatureStartY = yPos;

      // Party 1 Signatures
      setSubHeaderFont();
      pdf.text(
        "Party 1 (First Party)",
        margin + signatureSectionWidth / 2,
        signatureStartY,
        { align: "center" }
      );
      setNormalFont();
      pdf.text(
        "Plaintiffs/Claimants",
        margin + signatureSectionWidth / 2,
        signatureStartY + 6,
        { align: "center" }
      );

      let currentSigY = signatureStartY + 15;
      formData.plaintiffs.forEach((plaintiff, index) => {
        checkPageBreak(25);
        pdf.text(
          `Plaintiff-${index + 1}: ${plaintiff.name || "N/A"}`,
          margin + signatureSectionWidth / 2,
          currentSigY,
          { align: "center" }
        );
        // Signature line
        pdf.line(
          margin + 10,
          currentSigY + 8,
          margin + signatureSectionWidth - 10,
          currentSigY + 8
        );
        currentSigY += 15;
      });

      // Party 2 Signatures
      setSubHeaderFont();
      pdf.text(
        "Party 2 (Second Party)",
        margin + signatureSectionWidth + signatureSectionWidth / 2,
        signatureStartY,
        { align: "center" }
      );
      setNormalFont();
      pdf.text(
        "Defendants/Respondents",
        margin + signatureSectionWidth + signatureSectionWidth / 2,
        signatureStartY + 6,
        { align: "center" }
      );

      let currentSigY2 = signatureStartY + 15;
      formData.defendants.forEach((defendant, index) => {
        checkPageBreak(25);
        pdf.text(
          `Defendant-${index + 1}: ${defendant.name || "N/A"}`,
          margin + signatureSectionWidth + signatureSectionWidth / 2,
          currentSigY2,
          { align: "center" }
        );
        // Signature line
        pdf.line(
          margin + signatureSectionWidth + 10,
          currentSigY2 + 8,
          margin + 2 * signatureSectionWidth - 10,
          currentSigY2 + 8
        );
        currentSigY2 += 15;
      });

      // JustiFi Signature
      setSubHeaderFont();
      pdf.text(
        "On behalf of JustiFi",
        margin + 2 * signatureSectionWidth + signatureSectionWidth / 2,
        signatureStartY,
        { align: "center" }
      );
      setNormalFont();
      pdf.text(
        "(Witness & Record Keeper)",
        margin + 2 * signatureSectionWidth + signatureSectionWidth / 2,
        signatureStartY + 6,
        { align: "center" }
      );
      pdf.text(
        `Name: ${getJustifiName()}`,
        margin + 2 * signatureSectionWidth + signatureSectionWidth / 2,
        signatureStartY + 15,
        { align: "center" }
      );
      pdf.text(
        `Designation: ${getJustifiDesignation()}`,
        margin + 2 * signatureSectionWidth + signatureSectionWidth / 2,
        signatureStartY + 22,
        { align: "center" }
      );
      // Signature line
      pdf.line(
        margin + 2 * signatureSectionWidth + 10,
        signatureStartY + 30,
        margin + 3 * signatureSectionWidth - 10,
        signatureStartY + 30
      );
      pdf.text(
        `Date: ${agreementDateDisplay}`,
        margin + 2 * signatureSectionWidth + signatureSectionWidth / 2,
        signatureStartY + 37,
        { align: "center" }
      );

      yPos = Math.max(currentSigY, currentSigY2, signatureStartY + 45) + 20;

      // Legal References Table - Fixed alignment
      checkPageBreak(50);
      setSubHeaderFont();
      yPos += addText(
        "Legal References Incorporated",
        margin,
        yPos,
        contentWidth,
        "left",
        5
      );
      yPos += 8;

      // Create table for legal references with proper formatting
      const tableTop = yPos;
      const col1Width = 20;
      const col2Width = 50;
      const col3Width = contentWidth - col1Width - col2Width - 5;

      // Table headers with background and proper alignment
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, tableTop, contentWidth, 8, "F");

      setSubHeaderFont();
      pdf.setFontSize(9);
      pdf.text("Clause", margin + col1Width / 2, tableTop + 5, {
        align: "center",
      });
      pdf.text("Reference", margin + col1Width + col2Width / 2, tableTop + 5, {
        align: "center",
      });
      pdf.text(
        "Purpose",
        margin + col1Width + col2Width + col3Width / 2,
        tableTop + 5,
        { align: "center" }
      );

      yPos = tableTop + 8;

      const references = [
        {
          clause: "1, 2, 8, 9",
          reference: "Arbitration Act, 2001 (Bangladesh)",
          purpose:
            "Legal foundation for arbitration procedure, award, and enforcement",
        },
        {
          clause: "2.2",
          reference: "Section 12, Arbitration Act 2001",
          purpose: "Independence and neutrality of arbitrators",
        },
        {
          clause: "9",
          reference: "Section 44, Arbitration Act 2001",
          purpose: "Binding nature and enforcement of award",
        },
        {
          clause: "8",
          reference: "Civil Procedure Code (CPC), Bangladesh",
          purpose: "Court jurisdiction for award enforcement",
        },
        {
          clause: "General",
          reference: "JustiFi ODR Rules",
          purpose: "Platform's procedural framework",
        },
      ];

      setSmallFont();
      references.forEach((ref, index) => {
        checkPageBreak(15);

        // Draw row background for better readability
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
        } else {
          pdf.setFillColor(255, 255, 255);
        }
        pdf.rect(margin, yPos, contentWidth, 12, "F");

        // Draw borders
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos, margin + contentWidth, yPos);
        pdf.line(margin, yPos + 12, margin + contentWidth, yPos + 12);
        pdf.line(margin, yPos, margin, yPos + 12);
        pdf.line(margin + col1Width, yPos, margin + col1Width, yPos + 12);
        pdf.line(
          margin + col1Width + col2Width,
          yPos,
          margin + col1Width + col2Width,
          yPos + 12
        );
        pdf.line(margin + contentWidth, yPos, margin + contentWidth, yPos + 12);

        // Add text content with proper alignment
        const clauseLines = pdf.splitTextToSize(ref.clause, col1Width - 4);
        const referenceLines = pdf.splitTextToSize(
          ref.reference,
          col2Width - 4
        );
        const purposeLines = pdf.splitTextToSize(ref.purpose, col3Width - 4);

        const maxLines = Math.max(
          clauseLines.length,
          referenceLines.length,
          purposeLines.length
        );
        const rowHeight = Math.max(12, maxLines * 4);

        // Center text vertically in cells
        const textY = yPos + rowHeight / 2 - maxLines * 2 + 2;

        // Center align clause text
        clauseLines.forEach((line, lineIndex) => {
          pdf.text(line, margin + col1Width / 2, textY + lineIndex * 4, {
            align: "center",
          });
        });

        // Left align reference text
        referenceLines.forEach((line, lineIndex) => {
          pdf.text(line, margin + col1Width + 2, textY + lineIndex * 4, {
            align: "left",
          });
        });

        // Left align purpose text
        purposeLines.forEach((line, lineIndex) => {
          pdf.text(
            line,
            margin + col1Width + col2Width + 2,
            textY + lineIndex * 4,
            { align: "left" }
          );
        });

        yPos += rowHeight;
      });

      yPos += 15;

      // Footer
      checkPageBreak();
      setNormalFont();
      pdf.text(
        "JustiFi - Fair Dispute Resolution Through Equal Partnership",
        pageWidth / 2,
        yPos,
        { align: "center" }
      );
      yPos += 6;
      pdf.text(
        "This document constitutes a legally binding agreement between all signing parties.",
        pageWidth / 2,
        yPos,
        { align: "center" }
      );

      const fileName = caseId
        ? `arbitration-agreement-${caseId}.pdf`
        : `arbitration-agreement-${new Date().getTime()}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF. Please try again or contact support.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!formData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p>
          No form data available. Please go back and generate the agreement
          first.
        </p>
        <button
          onClick={onBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <FaArrowLeft />
          Back to Form
        </button>
      </div>
    );
  }

  const agreementDateDisplay = formatDateForDisplay(formData.agreementDate);

  return (
    <div id="output-section" className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-2xl font-bold">Generated Arbitration Agreement</h2>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to Form
        </button>
      </div>

      {/* Hidden PDF container */}
      <div
        ref={pdfContainerRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "210mm",
          minHeight: "297mm",
        }}
      />

      {/* Preview content */}
      <div className="agreement-output border border-gray-200 rounded-md p-6 bg-gray-50 mb-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">⚖️ ARBITRATION AGREEMENT</h1>
          <p className="text-lg">
            <strong>Date:</strong> {agreementDateDisplay}
          </p>
          {caseId && (
            <p className="text-sm text-gray-600 mt-1">
              <strong>Case ID:</strong> {caseId}
            </p>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            THIS ARBITRATION AGREEMENT
          </h2>
          <p className="mb-4">
            (Here in after referred to as the "Agreement") is made and entered
            into by and between:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-300 p-4 rounded">
              <h3 className="font-bold mb-2 text-blue-600">
                Party 1 – Claimant(s)/Plaintiff(s)
              </h3>
              {formData.plaintiffs.map((plaintiff, index) => (
                <div key={index} className="mb-4">
                  <p>
                    <strong>Plaintiff-{index + 1}:</strong> {plaintiff.name}
                  </p>
                  <p>
                    <strong>Parent:</strong> {plaintiff.parentsName}
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
                  {index < formData.plaintiffs.length - 1 && (
                    <hr className="my-4" />
                  )}
                </div>
              ))}
              <p className="mt-4">
                (Here in after referred to as the <strong>First Party</strong>)
              </p>
            </div>

            <div className="border border-gray-300 p-4 rounded">
              <h3 className="font-bold mb-2 text-red-600">
                Party 2 – Respondent(s)/Defendant(s)
              </h3>
              {formData.defendants.map((defendant, index) => (
                <div key={index} className="mb-4">
                  <p>
                    <strong>Defendant-{index + 1}:</strong> {defendant.name}
                  </p>
                  <p>
                    <strong>Parent:</strong> {defendant.parentsName}
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
                  {index < formData.defendants.length - 1 && (
                    <hr className="my-4" />
                  )}
                </div>
              ))}
              <p className="mt-4">
                (Here in after referred to as the <strong>Second Party</strong>)
              </p>
            </div>
          </div>

          <p>
            Collectively referred to as the <strong>Parties</strong>, and
            individually as a <strong>Party</strong>.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">WHEREAS:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              The Parties are involved in a legal dispute arising out of{" "}
              {formData.disputeNature} ("Dispute");
            </li>
            <li>
              The Parties have mutually agreed to refer the said Dispute to{" "}
              <strong>arbitration</strong>, to be conducted through the{" "}
              <strong>JustiFi – Online Legal Aid & Arbitration Platform</strong>
              , under its established rules and procedures;
            </li>
            <li>
              The Parties desire to record their mutual understanding and
              agreement to the terms, conditions, and procedures governing such
              arbitration.
            </li>
          </ol>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            1. Arbitration Reference
          </h2>
          <p className="mb-2">
            1.1 The Parties voluntarily and irrevocably agree to submit the
            Dispute to arbitration in accordance with the provisions of the{" "}
            <strong>Arbitration Act, 2001 (Bangladesh)</strong>.
          </p>
          <p className="mb-2">
            1.2 The arbitration proceedings shall be conducted primarily through{" "}
            <strong>Online Dispute Resolution (ODR)</strong> using the{" "}
            <strong>JustiFi Platform</strong>.
          </p>
          <p className="mb-2">
            1.3 In exceptional cases, where physical/offline hearings are deemed
            necessary, the <strong>Arbitrator(s)</strong> may order the same.
            All associated costs shall be borne{" "}
            <strong>equally (50%-50%)</strong> by both Parties.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            2. Constitution of the Arbitral Tribunal
          </h2>
          <p className="mb-2">
            2.1 <strong>Number of Arbitrators:</strong> Three (3)
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              <strong>Arbitrator 1:</strong>{" "}
              {getArbitratorName(formData.arbitrator1)}
            </li>
            <li>
              <strong>Arbitrator 2:</strong>{" "}
              {getArbitratorName(formData.arbitrator2)}
            </li>
            <li>
              <strong>Arbitrator 3 (Presiding Arbitrator):</strong>{" "}
              {getArbitratorName(formData.presidingArbitrator)}
            </li>
          </ul>
          <p className="mt-2">
            2.2 The Arbitrators shall be{" "}
            <strong>neutral and independent</strong>, in accordance with{" "}
            <strong>Section 12 of the Arbitration Act, 2001</strong>, and their
            decision shall be <strong>final and binding</strong> upon the
            Parties.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            3. Seat, Venue & Language
          </h2>
          <p className="mb-2">
            3.1 <strong>Seat of Arbitration:</strong> Dhaka, Bangladesh (unless
            otherwise mutually agreed).
          </p>
          <p className="mb-2">
            3.2 <strong>Mode:</strong> Online (virtual hearings) via the{" "}
            <strong>JustiFi ODR System</strong>.
          </p>
          <p className="mb-2">
            3.3 <strong>Language:</strong> English and/or Bangla, as agreed
            between the Parties.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            4. Suit Value, Costs & Fees
          </h2>
          <p className="mb-2">
            4.1 <strong>Suit Value (Dispute Amount):</strong> BDT{" "}
            {formData.suitValue}
          </p>
          <p className="mb-2">
            4.2 <strong>Number of Sittings (Initially Agreed):</strong>{" "}
            {formData.sittings}
          </p>
          <p className="mb-2">
            4.3{" "}
            <strong>
              Total Arbitration Cost (Administrative + Arbitrator Fees):
            </strong>{" "}
            BDT {formData.totalCost}
          </p>
          <p className="mb-2">
            4.4 All costs of arbitration shall be shared{" "}
            <strong>equally</strong> between the Parties.
          </p>
          <p className="mb-2">
            4.5 If additional sittings are deemed necessary for fair
            adjudication, the Arbitrator(s) may extend proceedings, and any
            additional costs shall also be borne equally by both Parties.
          </p>
          <p className="mb-2">
            4.6 Each Party shall individually bear the cost of its own{" "}
            <strong>
              lawyers, representatives, advisors, or personal expenses
            </strong>
            .
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            5. Premature Termination / Withdrawal
          </h2>
          <p className="mb-2">
            5.1 Should either Party withdraw or terminate participation before
            conclusion:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              That Party must pay all costs incurred up to the date of
              termination; and
            </li>
            <li>
              An additional <strong>lump-sum penalty</strong> as determined by
              the Arbitrator(s) or JustiFi to cover administrative expenses.
            </li>
          </ul>
          <p className="mt-2">
            5.2 The arbitration may continue <strong>ex parte</strong> if one
            Party fails to participate, at the discretion of the Arbitrator(s).
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            6. Conduct & Confidentiality
          </h2>
          <p className="mb-2">
            6.1 Both Parties shall maintain professional conduct and respect
            toward the Arbitrator(s) and the <strong>JustiFi platform</strong>.
          </p>
          <p className="mb-2">
            6.2 Any form of abuse, misconduct, or defamatory act towards the
            Tribunal or platform shall constitute a{" "}
            <strong>breach of this Agreement</strong>.
          </p>
          <p className="mb-2">
            6.3 All proceedings, documents, evidence, and awards shall remain{" "}
            <strong>strictly confidential</strong>.
          </p>
          <p className="mb-2">
            6.4 No Party shall disclose or publish any part of the arbitration
            process unless required by law or upon written consent of the other
            Party.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            7. Powers & Duties of Arbitrators
          </h2>
          <p className="mb-2">The Arbitrator(s) shall have the power to:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Decide all procedural and evidentiary matters;</li>
            <li>Request additional hearings, documents, or witnesses;</li>
            <li>Extend the number of sittings as necessary;</li>
            <li>Prohibit any unilateral or ex parte communications;</li>
            <li>
              Interpret contractual obligations to reach a fair and lawful
              resolution.
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            8. Applicable Law & Jurisdiction
          </h2>
          <p className="mb-2">
            This Agreement and all arbitration proceedings shall be governed by:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              The <strong>Arbitration Act, 2001 (Bangladesh)</strong>; and
            </li>
            <li>
              The <strong>laws of the People's Republic of Bangladesh</strong>.
            </li>
          </ul>
          <p className="mt-2">
            Courts situated in <strong>Dhaka, Bangladesh</strong> shall have{" "}
            <strong>exclusive jurisdiction</strong> for enforcement, setting
            aside, or any judicial assistance concerning the arbitral award.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            9. Binding Nature of Award
          </h2>
          <p className="mb-2">
            The Award rendered by the Arbitral Tribunal shall be:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              <strong>Final and binding</strong> upon both Parties, under{" "}
              <strong>Section 44 of the Arbitration Act, 2001</strong>;
            </li>
            <li>
              <strong>Enforceable as a decree or court order</strong> within
              Bangladesh; and
            </li>
            <li>
              Obligatory to be complied with within{" "}
              <strong>{formData.complianceDays} days</strong> from the date of
              issuance.
            </li>
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">
            ⚖️ Legal References Incorporated
          </h2>
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Clause</th>
                <th className="border border-gray-300 p-2 text-left">
                  Reference
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">1, 2, 8, 9</td>
                <td className="border border-gray-300 p-2">
                  Arbitration Act, 2001 (Bangladesh)
                </td>
                <td className="border border-gray-300 p-2">
                  Legal foundation for arbitration procedure, award, and
                  enforcement
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">2.2</td>
                <td className="border border-gray-300 p-2">
                  Section 12, Arbitration Act 2001
                </td>
                <td className="border border-gray-300 p-2">
                  Independence and neutrality of arbitrators
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">9</td>
                <td className="border border-gray-300 p-2">
                  Section 44, Arbitration Act 2001
                </td>
                <td className="border border-gray-300 p-2">
                  Binding nature and enforcement of award
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">8</td>
                <td className="border border-gray-300 p-2">
                  Civil Procedure Code (CPC), Bangladesh
                </td>
                <td className="border border-gray-300 p-2">
                  Court jurisdiction for award enforcement
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">General</td>
                <td className="border border-gray-300 p-2">
                  JustiFi ODR Rules
                </td>
                <td className="border border-gray-300 p-2">
                  Platform's procedural framework
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 mb-6 text-center text-sm text-gray-600 border-t pt-4">
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

      <div className="mt-4 flex justify-center no-print">
        <button
          id="download-pdf"
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          <FaDownload />
          {isGeneratingPDF ? "Generating PDF..." : "Download as PDF"}
        </button>
      </div>
    </div>
  );
};

export default ArbAgreementPreview;
