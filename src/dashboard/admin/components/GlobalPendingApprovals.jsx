import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import {
    FaBell,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaExternalLinkAlt,
    FaPercentage,
    FaGavel,
    FaTimes,
    FaChevronDown,
    FaChevronUp,
    FaMoneyBillWave,
} from "react-icons/fa";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (v) => `৳ ${Number(v || 0).toLocaleString("en-BD")}`;
const formatDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "—";

// ── Approve Modal ─────────────────────────────────────────────────────────────
const ApproveModal = ({ payment, onClose, onApproved }) => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [platformCut, setPlatformCut] = useState(20);
    const [split, setSplit] = useState({
        presidingArbitrator: 50,
        arbitrator1: 25,
        arbitrator2: 25,
    });
    const [remarks, setRemarks] = useState("");

    const splitTotal =
        Number(split.presidingArbitrator) +
        Number(split.arbitrator1) +
        Number(split.arbitrator2);

    const distributablePreview =
        payment.amount - Math.round((payment.amount * platformCut) / 100);

    const approveMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosSecure.post("/payment-plans/payments/admin/approve", {
                paymentId: payment.paymentId,
                approvedBy: "admin",
                platformCutPercentage: Number(platformCut),
                arbitratorSplit: {
                    presidingArbitrator: Number(split.presidingArbitrator),
                    arbitrator1: Number(split.arbitrator1),
                    arbitrator2: Number(split.arbitrator2),
                },
                remarks,
            });
            return res.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries(["allPendingPayments"]);
                onApproved?.();
                onClose();
            }
        },
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div
                    className="px-6 py-5"
                    style={{
                        background:
                            "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
                    }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-200 text-xs uppercase font-semibold tracking-wider mb-1">
                                Approve Payment
                            </p>
                            <h3 className="text-white text-xl font-bold">
                                {formatCurrency(payment.amount)}
                            </h3>
                            <p className="text-blue-200 text-sm mt-0.5 capitalize">
                                {payment.paidBy?.role} — {payment.paidBy?.email}
                            </p>
                            <p className="text-blue-300 text-xs mt-1 font-mono">
                                {payment.arbitrationId} · {payment.installmentId}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-blue-200 hover:text-white transition mt-1"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Platform cut */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FaPercentage className="text-gray-400" />
                            Platform Cut (%)
                        </label>
                        <input
                            type="number"
                            value={platformCut}
                            onChange={(e) => setPlatformCut(e.target.value)}
                            min="0"
                            max="100"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Platform keeps:{" "}
                            {formatCurrency(
                                Math.round(
                                    (payment.amount * platformCut) / 100
                                )
                            )}
                        </p>
                    </div>

                    {/* Arbitrator split */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Arbitrator Split (%) — Distributable:{" "}
                            <span className="text-indigo-700 font-bold">
                                {formatCurrency(distributablePreview)}
                            </span>
                        </label>
                        <div className="space-y-2">
                            {[
                                {
                                    key: "presidingArbitrator",
                                    label: "Presiding Arbitrator",
                                },
                                { key: "arbitrator1", label: "Arbitrator 1" },
                                { key: "arbitrator2", label: "Arbitrator 2" },
                            ].map(({ key, label }) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-3"
                                >
                                    <span className="text-sm text-gray-600 w-44 flex-shrink-0">
                                        {label}
                                    </span>
                                    <input
                                        type="number"
                                        value={split[key]}
                                        onChange={(e) =>
                                            setSplit((prev) => ({
                                                ...prev,
                                                [key]: e.target.value,
                                            }))
                                        }
                                        min="0"
                                        max="100"
                                        className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-semibold"
                                    />
                                    <span className="text-xs text-gray-400">
                                        ≈{" "}
                                        {formatCurrency(
                                            Math.round(
                                                (distributablePreview *
                                                    Number(split[key])) /
                                                    100
                                            )
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {splitTotal !== 100 && (
                            <p className="text-xs text-red-500 mt-2">
                                ⚠ Split must total 100% (currently {splitTotal}
                                %)
                            </p>
                        )}
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Remarks (optional)
                        </label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={2}
                            placeholder="Add a note..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => approveMutation.mutate()}
                            disabled={
                                approveMutation.isPending || splitTotal !== 100
                            }
                            className="flex-1 py-3 rounded-xl font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{
                                background:
                                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                            }}
                        >
                            {approveMutation.isPending ? (
                                <>
                                    <FaSpinner className="animate-spin" />{" "}
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle /> Confirm & Distribute
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ payment, onClose, onRejected }) => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [remarks, setRemarks] = useState("");

    const rejectMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosSecure.post("/payment-plans/payments/admin/reject", {
                paymentId: payment.paymentId,
                rejectedBy: "admin",
                remarks,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["allPendingPayments"]);
            onRejected?.();
            onClose();
        },
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="px-6 py-5 bg-red-600">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-red-200 text-xs uppercase font-semibold tracking-wider mb-1">
                                Reject Payment
                            </p>
                            <h3 className="text-white text-xl font-bold">
                                {formatCurrency(payment.amount)}
                            </h3>
                            <p className="text-red-200 text-sm mt-0.5 capitalize">
                                {payment.paidBy?.role} — {payment.paidBy?.email}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-red-200 hover:text-white transition mt-1"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Reason for Rejection{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={3}
                            placeholder="Explain why this payment is being rejected..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => rejectMutation.mutate()}
                            disabled={rejectMutation.isPending || !remarks.trim()}
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {rejectMutation.isPending ? (
                                <>
                                    <FaSpinner className="animate-spin" />{" "}
                                    Rejecting...
                                </>
                            ) : (
                                <>
                                    <FaTimesCircle /> Confirm Reject
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const GlobalPendingApprovals = ({ allArbitrations }) => {
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const [collapsed, setCollapsed] = useState(false);
    const [approveModal, setApproveModal] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);

    // Fetch all pending payments across all arbitrations
    const { data: pendingPayments = [], isLoading, refetch } = useQuery({
        queryKey: ["allPendingPayments"],
        queryFn: async () => {
            const res = await axiosSecure.get("/payment-plans/payments/pending");
            return res.data.success ? res.data.data : [];
        },
        refetchInterval: 30000, // auto-refresh every 30s
    });

    // Build a lookup map: arbitrationId → arbitration object
    const arbMap = {};
    (allArbitrations || []).forEach((arb) => {
        arbMap[arb.arbitrationId] = arb;
    });

    const goToDetails = (arbitrationId) => {
        const arb = arbMap[arbitrationId];
        if (arb) {
            navigate(`/admin/arbitrations/${arb._id}`, {
                state: { arbitration: arb },
            });
        }
    };

    if (isLoading) return null; // silent load — don't block the page
    if (pendingPayments.length === 0) return null; // nothing to show

    return (
        <>
            <div className="mb-6 bg-white rounded-2xl border border-amber-200 shadow-lg overflow-hidden">
                {/* Header */}
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 hover:from-amber-100 hover:to-orange-100 transition"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                            <FaBell className="text-amber-600 animate-pulse" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-base font-bold text-gray-900">
                                Pending Payment Approvals
                            </h2>
                            <p className="text-xs text-amber-700">
                                {pendingPayments.length} payment
                                {pendingPayments.length !== 1 ? "s" : ""}{" "}
                                awaiting your review
                            </p>
                        </div>
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {pendingPayments.length}
                        </span>
                    </div>
                    <div className="text-gray-400">
                        {collapsed ? <FaChevronDown /> : <FaChevronUp />}
                    </div>
                </button>

                {/* Table */}
                {!collapsed && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-amber-50">
                                <tr>
                                    {[
                                        "Payment ID",
                                        "Arbitration",
                                        "Amount",
                                        "Method",
                                        "Paid On",
                                        "Actions",
                                        "Details",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-xs font-bold text-amber-800 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {pendingPayments.map((payment) => {
                                    const arb = arbMap[payment.arbitrationId];
                                    return (
                                        <tr
                                            key={payment.paymentId}
                                            className="hover:bg-amber-50/40 transition"
                                        >
                                            {/* Payment ID */}
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-mono text-gray-500 truncate max-w-[110px]">
                                                    {payment.paymentId}
                                                </p>
                                                {payment.transactionRef && (
                                                    <p className="text-xs text-gray-400 truncate max-w-[110px]">
                                                        Ref:{" "}
                                                        {payment.transactionRef}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Arbitration */}
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {payment.arbitrationId}
                                                </p>
                                                {arb && (
                                                    <p className="text-xs text-gray-400 truncate max-w-[140px]">
                                                        {arb.caseTitle}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {formatCurrency(
                                                        payment.amount
                                                    )}
                                                </p>
                                            </td>

                                            {/* Method */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                                                        payment.paymentMethod ===
                                                        "bkash"
                                                            ? "bg-pink-100 text-pink-700 border-pink-200"
                                                            : payment.paymentMethod ===
                                                              "nagad"
                                                            ? "bg-orange-100 text-orange-700 border-orange-200"
                                                            : "bg-blue-100 text-blue-700 border-blue-200"
                                                    }`}
                                                >
                                                    {payment.paymentMethod}
                                                </span>
                                            </td>

                                            {/* Paid On */}
                                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                {formatDate(payment.paidAt)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setApproveModal(
                                                                payment
                                                            )
                                                        }
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition whitespace-nowrap"
                                                    >
                                                        <FaCheckCircle />{" "}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setRejectModal(
                                                                payment
                                                            )
                                                        }
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition whitespace-nowrap"
                                                    >
                                                        <FaTimesCircle /> Reject
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Details link */}
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() =>
                                                        goToDetails(
                                                            payment.arbitrationId
                                                        )
                                                    }
                                                    disabled={!arb}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition border border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    <FaExternalLinkAlt className="text-xs" />{" "}
                                                    View Case
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {approveModal && (
                <ApproveModal
                    payment={approveModal}
                    onClose={() => setApproveModal(null)}
                    onApproved={() => setApproveModal(null)}
                />
            )}
            {rejectModal && (
                <RejectModal
                    payment={rejectModal}
                    onClose={() => setRejectModal(null)}
                    onRejected={() => setRejectModal(null)}
                />
            )}
        </>
    );
};

export default GlobalPendingApprovals;