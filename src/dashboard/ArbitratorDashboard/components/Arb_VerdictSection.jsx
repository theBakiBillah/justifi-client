import { useState, useEffect } from "react";
import {
    FaDownload,
    FaEye,
    FaExclamationTriangle,
    FaSpinner,
    FaTimes,
    FaGavel,
    FaCheckCircle,
    FaFileAlt,
    FaUserTie,
    FaUserShield,
    FaAward,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaClock,
    FaBalanceScale,
    FaEnvelope,
    FaPhone,
    FaUserGraduate
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useUserData from "../../../hooks/useUserData";

const Arb_VerdictSection = ({ arbitration }) => {
    const navigate = useNavigate();
    const { currentUser } = useUserData();
    const currentUserEmail = currentUser?.email;
    const currentUserRole = currentUser?.role; // ইউজারের রোল নেওয়া
    
    const isCaseCancelled = arbitration?.arbitration_status?.toLowerCase() === 'cancelled';
    const isCasePending = arbitration?.arbitration_status?.toLowerCase() === 'pending';
    const isCaseOngoing = arbitration?.arbitration_status?.toLowerCase() === 'ongoing';
    const isCaseCompleted = arbitration?.arbitration_status?.toLowerCase() === 'completed';
    
    const arbitrationId = arbitration?.arbitrationId || arbitration?._id;
    const caseId = arbitration?.caseId; 
    
    const [verdict, setVerdict] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    // Check if current user is an arbitrator
    const isArbitrator = currentUserRole === 'arbitrator' || currentUserRole === 'ARBITRATOR';

    useEffect(() => {
        if (arbitrationId) {
            fetchVerdict();
        }
    }, [arbitrationId]);

    const fetchVerdict = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `http://localhost:5000/verdict/arbitration/${arbitrationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success && response.data.data?.length > 0) {
                const latestVerdict = response.data.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                )[0];
                setVerdict(latestVerdict);
            }
        } catch (err) {
            console.error("Error fetching verdict:", err);
            setError("Failed to load verdict data");
        } finally {
            setLoading(false);
        }
    };

    const handleProvideVerdict = () => {
        navigate(`/dashboard/verdict/create/${caseId}`);
    };

    const handleViewVerdict = () => {
        setShowModal(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setShowModal(false);
        document.body.style.overflow = 'unset';
    };

    // কালারফুল HTML for PDF
    const generateColorfulPDFHTML = (verdictData, arbitrationData) => {
        const awardDate = verdictData.finalOrder?.awardDate 
            ? new Date(verdictData.finalOrder.awardDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })
            : 'Not specified';

        const plaintiffs = arbitrationData?.snapshot?.plaintiffs || arbitrationData?.plaintiffs || [];
        const defendants = arbitrationData?.snapshot?.defendants || arbitrationData?.defendants || [];
        
        // Arbitrators details - snapshot থেকে নেওয়া
        const presidingArbitrator = arbitrationData?.snapshot?.presidingArbitrator || arbitrationData?.presidingArbitrator || {};
        const arbitrator1 = arbitrationData?.snapshot?.arbitrator1 || arbitrationData?.arbitrator1 || {};
        const arbitrator2 = arbitrationData?.snapshot?.arbitrator2 || arbitrationData?.arbitrator2 || {};
        const justifiRep = arbitrationData?.snapshot?.justifiRepresentative || arbitrationData?.justifiRepresentative || {};

        // Issues HTML
        const issuesHtml = verdictData.issues?.map(issue => `
            <div style="margin-bottom: 15px; padding: 15px; background: #fef9e7; border-left: 4px solid #d4af37; border-radius: 0 8px 8px 0;">
                <h4 style="margin: 0 0 10px 0; color: #b8860b; font-size: 16px;">Issue ${issue.issueNumber}: ${issue.title}</h4>
                <p style="margin: 5px 0;"><strong style="color: #1e3a8a;">Finding:</strong> ${issue.finding || 'Not specified'}</p>
                <p style="margin: 5px 0;"><strong style="color: #1e3a8a;">Decision:</strong> ${issue.decision || 'Not specified'}</p>
            </div>
        `).join('');

        // Proceedings HTML
        const proceedingsHtml = verdictData.proceedings?.hearingDescription ? `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #1e3a8a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; font-size: 18px;">PROCEEDINGS</h3>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                    <p style="line-height: 1.6; color: #334155;">${verdictData.proceedings.hearingDescription}</p>
                </div>
            </div>
        ` : '';

        // Claims HTML - UPDATED: Now stacked vertically
        const claimsHtml = `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #1e3a8a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; font-size: 18px;">SUMMARY OF CLAIMS</h3>
                <div style="margin-top: 20px;">
                    <!-- Claimant's Claim - Top -->
                    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="color: #1e40af; margin: 0 0 10px;">CLAIMANT'S CLAIM</h4>
                        <p style="line-height: 1.6; color: #334155;">${verdictData.claimsSummary?.plaintiffClaim || 'Not specified'}</p>
                    </div>
                    
                    <!-- Respondent's Defense - Bottom -->
                    <div style="background: #fef2f2; padding: 20px; border-radius: 8px;">
                        <h4 style="color: #991b1b; margin: 0 0 10px;">RESPONDENT'S DEFENSE</h4>
                        <p style="line-height: 1.6; color: #334155;">${verdictData.claimsSummary?.defendantDefense || 'Not specified'}</p>
                    </div>
                </div>
            </div>
        `;

        // Additional Conditions
        const additionalConditionsHtml = verdictData.finalOrder?.additionalConditions ? `
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <p style="font-weight: bold; margin: 0 0 5px;">Additional Conditions:</p>
                <p style="margin: 0; color: #374151;">${verdictData.finalOrder.additionalConditions}</p>
            </div>
        ` : '';

        // Dissenting Opinion
        const dissentingHtml = verdictData.finalOrder?.dissentingOpinion?.hasDissent ? `
            <div style="margin-top: 30px; background: #fee2e2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca;">
                <h4 style="color: #991b1b; margin: 0 0 10px;">DISSENTING OPINION</h4>
                <p style="color: #7f1d1d;">${verdictData.finalOrder.dissentingOpinion.details}</p>
            </div>
        ` : '';

        return `
            <div style="max-width: 900px; margin: 0 auto; background: white; padding: 40px; font-family: Arial, sans-serif;">
                
                <!-- COVER PAGE -->
                <div style="background: linear-gradient(135deg, #0a1929 0%, #1a2a3a 100%); color: white; padding: 60px 40px; text-align: center; margin-bottom: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #60a5fa, #2563eb); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px; font-weight: bold; color: white;">J</span>
                    </div>
                    <h1 style="font-size: 48px; margin: 0 0 10px; background: linear-gradient(to right, #93c5fd, white, #fde68a); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">JUSTIFI</h1>
                    <p style="font-size: 18px; color: #93c5fd; margin: 0 0 20px;">ONLINE DISPUTE RESOLUTION</p>
                    <div style="width: 100px; height: 4px; background: linear-gradient(to right, #60a5fa, #fbbf24); margin: 0 auto 30px;"></div>
                    <h2 style="font-size: 36px; margin: 0 0 20px;">ARBITRATION AWARD</h2>
                    <div style="display: inline-block; background: linear-gradient(135deg, #f5e7c8, #d4af37); color: #1a1209; padding: 12px 30px; border-radius: 50px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        ⚖️ FINAL AND BINDING ⚖️
                    </div>
                </div>

                <!-- AWARD HEADER -->
                <div style="background: linear-gradient(to right, #f3f4f6, #ffffff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #d4af37;">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                        <div><span style="color: #4b5563;">Award No:</span> <strong style="color: #1e3a8a;">${verdictData.verdictId}</strong></div>
                        <div><span style="color: #4b5563;">Date:</span> <strong style="color: #1e3a8a;">${awardDate}</strong></div>
                        <div><span style="color: #4b5563;">Case No:</span> <strong style="color: #1e3a8a;">${verdictData.arbitrationId}</strong></div>
                    </div>
                </div>

                <!-- PARTIES -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1e3a8a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; font-size: 18px;">PARTIES TO THE DISPUTE</h3>
                    <div style="display: flex; gap: 20px; margin-top: 20px;">
                        <div style="flex: 1; background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 20px; border-radius: 8px;">
                            <h4 style="color: #166534; margin: 0 0 15px;">CLAIMANT(S)</h4>
                            ${plaintiffs.map(p => `
                                <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #86efac;">
                                    <p style="font-weight: bold; margin: 0 0 5px;">${p.name}</p>
                                    <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">📧 ${p.email}</p>
                                    <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">📞 ${p.phone}</p>
                                    <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">📍 ${p.address || ''}</p>
                                    ${p.representatives?.length > 0 ? `
                                        <p style="font-size: 13px; color: #6b7280; margin: 5px 0 0;">Rep: ${p.representatives[0].name}</p>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <div style="flex: 1; background: linear-gradient(135deg, #fef2f2, #fee2e2); padding: 20px; border-radius: 8px;">
                            <h4 style="color: #991b1b; margin: 0 0 15px;">RESPONDENT(S)</h4>
                            ${defendants.map(d => `
                                <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #fecaca;">
                                    <p style="font-weight: bold; margin: 0 0 5px;">${d.name}</p>
                                    <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">📧 ${d.email}</p>
                                    <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">📞 ${d.phone}</p>
                                    <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">📍 ${d.address || ''}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- ARBITRAL TRIBUNAL - ENHANCED WITH FULL DETAILS -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1e3a8a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; font-size: 18px;">ARBITRAL TRIBUNAL</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
                        <!-- Presiding Arbitrator -->
                        <div style="background: linear-gradient(135deg, #e0e7ff, #c7d2fe); padding: 20px; border-radius: 12px; text-align: center;">
    
                            <h4 style="color: #312e81; margin: 0 0 10px; font-size: 18px;">Presiding Arbitrator</h4>
                            <p style="font-weight: bold; margin: 5px 0; color: #1e1b4b;">${presidingArbitrator.name || 'Arbitrator 01'}</p>
                            <p style="font-size: 14px; color: #4338ca; margin: 5px 0;">📧 ${presidingArbitrator.email || 'arbitrator01@justifi.com'}</p>
                        </div>

                        <!-- Arbitrator 1 -->
                        <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 20px; border-radius: 12px; text-align: center;">
                            
                            <h4 style="color: #1e40af; margin: 0 0 10px; font-size: 18px;">Arbitrator</h4>
                            <p style="font-weight: bold; margin: 5px 0; color: #1e3a8a;">${arbitrator1.name || 'Arbitrator'}</p>
                            <p style="font-size: 14px; color: #2563eb; margin: 5px 0;">📧 ${arbitrator1.email || 'arbitrator@example.com'}</p>
                        </div>

                        <!-- Arbitrator 2 -->
                        <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); padding: 20px; border-radius: 12px; text-align: center;">
                            
                            <h4 style="color: #6b21a8; margin: 0 0 10px; font-size: 18px;">Arbitrator</h4>
                            <p style="font-weight: bold; margin: 5px 0; color: #581c87;">${arbitrator2.name || 'Arbitrator'}</p>
                            <p style="font-size: 14px; color: #9333ea; margin: 5px 0;">📧 ${arbitrator2.email || 'arbitrator@example.com'}</p>
                        </div>
                    </div>

                    <!-- JustiFi Representative -->
                    ${justifiRep.name ? `
                        <div style="margin-top: 20px; background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
                            <p style="color: #4b5563; margin: 0;">
                                <strong>JustiFi Representative:</strong> ${justifiRep.name} 
                                ${justifiRep.designation ? `(${justifiRep.designation})` : ''}
                                ${justifiRep.email ? ` | 📧 ${justifiRep.email}` : ''}
                            </p>
                        </div>
                    ` : ''}
                </div>

                <!-- PROCEEDINGS -->
                ${proceedingsHtml}

                <!-- CLAIMS - UPDATED: Now stacked vertically -->
                ${claimsHtml}

                <!-- ISSUES -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1e3a8a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; font-size: 18px;">ISSUES, FINDINGS & DECISIONS</h3>
                    ${issuesHtml}
                </div>

                <!-- FINAL ORDER -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1e3a8a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; font-size: 18px;">FINAL ORDER / AWARD</h3>
                    <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 25px; border-radius: 12px; border: 2px solid #86efac;">
                        
                        <!-- Award Amount Highlight -->
                        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                            <p style="color: #166534; margin: 0 0 5px;">TOTAL AWARD AMOUNT</p>
                            <p style="font-size: 42px; font-weight: bold; color: #16a34a; margin: 10px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                                BDT ${(verdictData.finalOrder?.awardAmount || 0).toLocaleString()}
                            </p>
                            <p style="color: #166534; font-size: 16px;">${verdictData.finalOrder?.awardAmountWords || ''}</p>
                        </div>

                        <!-- Payment Details -->
                        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div>
                                    <p style="color: #6b7280; margin: 0 0 5px;">Payable By</p>
                                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                        ${verdictData.finalOrder?.payableBy?.map(p => `
                                            <span style="background: #fef2f2; color: #991b1b; padding: 5px 10px; border-radius: 20px; font-size: 13px;">${p}</span>
                                        `).join('')}
                                    </div>
                                </div>
                                <div>
                                    <p style="color: #6b7280; margin: 0 0 5px;">Payable To</p>
                                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                        ${verdictData.finalOrder?.payableTo?.map(p => `
                                            <span style="background: #f0fdf4; color: #166534; padding: 5px 10px; border-radius: 20px; font-size: 13px;">${p}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                            
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                                    <span><strong>Payment Deadline:</strong> Within ${verdictData.finalOrder?.paymentDeadlineDays || 0} days</span>
                                    ${verdictData.finalOrder?.interestRatePercent ? `
                                        <span><strong>Interest:</strong> ${verdictData.finalOrder.interestRatePercent}% per annum</span>
                                    ` : ''}
                                    <span><strong>Arbitration Costs:</strong> BDT ${(verdictData.finalOrder?.arbitrationCost || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Final Orders -->
                        ${verdictData.finalOrder?.finalOrders ? `
                            <div style="background: white; padding: 20px; border-radius: 8px;">
                                <h4 style="color: #166534; margin: 0 0 10px;">FINAL ORDERS</h4>
                                <p style="white-space: pre-line; line-height: 1.6;">${verdictData.finalOrder.finalOrders}</p>
                            </div>
                        ` : ''}

                        <!-- Additional Conditions -->
                        ${additionalConditionsHtml}
                    </div>
                </div>

                <!-- DISSENTING OPINION -->
                ${dissentingHtml}

                <!-- SIGNATURES -->
                <div style="margin-top: 50px;">
                    <h3 style="color: #1e3a8a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; font-size: 18px;">SIGNATURES & ATTESTATION</h3>
                    <div style="display: flex; justify-content: space-between; margin-top: 30px;">
                        <div style="text-align: center; flex: 1;">
                            <div  style=" border-top: 2px solid #1e3a8a; width: 80%; margin: 0 auto 10px;"></div>
                            <p style="font-weight: bold; margin: 0; ">${presidingArbitrator.name || 'Presiding Arbitrator'}</p>
                            <p style="color: #6b7280;">Presiding Arbitrator</p>
                            ${presidingArbitrator.email ? `<p style="font-size: 12px; color: #9ca3af;">${presidingArbitrator.email}</p>` : ''}
                        </div>
                        <div style="text-align: center; flex: 1;">
                            <div style="border-top: 2px solid #1e3a8a; width: 80%; margin: 0 auto 10px;"></div>
                            <p style="font-weight: bold; margin: 0;">${arbitrator1.name || 'Arbitrator'}</p>
                            <p style="color: #6b7280;">Arbitrator</p>
                            ${arbitrator1.email ? `<p style="font-size: 12px; color: #9ca3af;">${arbitrator1.email}</p>` : ''}
                        </div>
                        <div style="text-align: center; flex: 1;">
                            <div style="border-top: 2px solid #1e3a8a; width: 80%; margin: 0 auto 10px;"></div>
                            <p style="font-weight: bold; margin: 0;">${arbitrator2.name || 'Arbitrator'}</p>
                            <p style="color: #6b7280;">Arbitrator</p>
                            ${arbitrator2.email ? `<p style="font-size: 12px; color: #9ca3af;">${arbitrator2.email}</p>` : ''}
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; background: #f9fafb; padding: 15px; border-radius: 8px;">
                        <p><strong>Place of Arbitration:</strong> ${verdictData.finalOrder?.awardPlace || 'Dhaka, Bangladesh'}</p>
                        <p><strong>Date:</strong> ${awardDate}</p>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
                    <div style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #60a5fa, #2563eb); border-radius: 8px; margin-bottom: 10px;"></div>
                    <p style="font-weight: bold; color: #1e3a8a;">JustiFi Online Dispute Resolution Platform</p>
                    <p>Award No: ${verdictData.verdictId} | Generated on ${awardDate}</p>
                    <p style="margin-top: 5px;">Certified true copy of the Final Award</p>
                </div>
            </div>
        `;
    };

    // PDF Download Function
    const handleDownloadPDF = async () => {
        if (!verdict) {
            alert("No verdict data available");
            return;
        }
        
        setGeneratingPDF(true);
        
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert("Popup blocked! Please allow popups for this site.");
                return;
            }
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Arbitration Award - ${verdict.verdictId}</title>
                    <style>
                        body { 
                            font-family: 'Arial', sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                            background: #f3f4f6;
                        }
                        @media print {
                            body { 
                                padding: 0; 
                                background: white;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${generateColorfulPDFHTML(verdict, arbitration)}
                    <script>
                        window.onload = function() { 
                            setTimeout(() => {
                                window.print();
                                setTimeout(() => window.close(), 1000);
                            }, 500);
                        }
                    </script>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
        } finally {
            setGeneratingPDF(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return "Invalid date";
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "Not specified";
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return "Invalid date";
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return "BDT 0";
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'Pending Review';
            case 'ongoing': return 'Proceedings Ongoing';
            case 'completed': return 'Case Concluded';
            case 'cancelled': return 'Case Cancelled';
            default: return status || 'Unknown';
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-7">
                <div className="flex items-center mb-8">
                    <div className="w-1 h-8 bg-yellow-600 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        <FaAward className="inline mr-3 text-yellow-600" />
                        Final Verdict / Final Award
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <FaSpinner className="animate-spin text-4xl text-yellow-600" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="bg-red-50 rounded-2xl p-6 max-w-md mx-auto">
                            <FaExclamationTriangle className="mx-auto text-5xl text-red-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Verdict</h3>
                            <p className="text-gray-500 mb-4">{error}</p>
                            <button 
                                onClick={fetchVerdict}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : isCaseCancelled ? (
                    <div className="text-center py-8">
                        <div className="bg-red-50 rounded-2xl p-6 max-w-md mx-auto">
                            <FaTimes className="mx-auto text-5xl text-red-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Case Cancelled</h3>
                            <p className="text-gray-500 mb-4">
                                This arbitration case has been cancelled. No verdict will be provided.
                            </p>
                            <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                                <p className="text-red-700 text-sm">
                                    <strong>Status:</strong> {getStatusText(arbitration?.arbitration_status)}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : isCasePending || isCaseOngoing ? (
                    <div className="text-center py-8">
                        <div className="bg-yellow-50 rounded-2xl p-6 max-w-md mx-auto">
                            <FaFileAlt className="mx-auto text-5xl text-yellow-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Verdict Yet</h3>
                            <p className="text-gray-500 mb-6">
                                The final verdict and award will be provided when the arbitration process is successfully completed.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-blue-700 text-sm">
                                    <strong>Current Status:</strong> {getStatusText(arbitration?.arbitration_status)}
                                </p>
                            </div>
                            
                            {/* Provide Verdict Button - Only visible to arbitrators */}
                            {isArbitrator ? (
                                <button
                                    onClick={() => navigate(`/dashboard/verdict/create/${caseId}`)}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
                                >
                                    <FaGavel className="mr-2" />
                                    Provide Verdict
                                </button>
                            ) : (
                                <div className="text-sm text-gray-500 italic">
                                    Only arbitrators can provide verdicts
                                </div>
                            )}
                        </div>
                    </div>
                ) : isCaseCompleted && verdict ? (
                    <div className="space-y-6">
                        {/* Award Details - Left Side */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Award Date & Time</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatDateTime(verdict.createdAt)}
                                    </p>
                                </div>
                               
                               {arbitration?.complianceDays && (
                                    <div>
                                        <p className="text-sm text-gray-500">Compliance Days</p>
                                        <p className="text-lg font-semibold text-green-900">
                                            {arbitration.complianceDays} Days
                                        </p>
                                    </div>
                                )}
                                
                            </div>

                            {/* Action Buttons - Right Side */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleViewVerdict}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center shadow-md"
                                >
                                    <FaEye className="mr-2" />
                                    View Full Verdict
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={generatingPDF}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {generatingPDF ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <FaDownload className="mr-2" />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Success Notice */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <FaCheckCircle className="text-green-600 mr-3 text-xl" />
                                <div>
                                    <p className="font-semibold text-green-800">Case Successfully Concluded</p>
                                    <p className="text-green-700 text-sm mt-1">
                                        Published on {formatDate(verdict.publishedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isCaseCompleted && !verdict ? (
                    <div className="text-center py-8">
                        <div className="bg-yellow-50 rounded-2xl p-6 max-w-md mx-auto">
                            <FaExclamationTriangle className="mx-auto text-5xl text-yellow-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Verdict Not Found</h3>
                            <p className="text-gray-500 mb-4">
                                Case is marked as completed but no verdict document was found.
                            </p>
                            
                            {/* Create Verdict Button - Only visible to arbitrators */}
                            {isArbitrator ? (
                                <button
                                    onClick={handleProvideVerdict}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold"
                                >
                                    Create Verdict Now
                                </button>
                            ) : (
                                <p className="text-sm text-gray-500 italic">
                                    Please contact an arbitrator to create the verdict
                                </p>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Verdict Modal */}
            {showModal && verdict && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
                    <div className="min-h-screen px-4 py-8">
                        <div className="bg-white rounded-xl max-w-5xl mx-auto shadow-2xl">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <FaAward className="mr-3 text-yellow-600" />
                                    Final Arbitration Award
                                </h3>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={generatingPDF}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center text-sm disabled:opacity-50"
                                    >
                                        {generatingPDF ? (
                                            <FaSpinner className="animate-spin mr-2" />
                                        ) : (
                                            <FaDownload className="mr-2" />
                                        )}
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={handleCloseModal}
                                        className="text-gray-500 hover:text-gray-700 p-2"
                                    >
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Modal Content */}
                            <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: generateColorfulPDFHTML(verdict, arbitration) }} />
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex justify-end">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Arb_VerdictSection;