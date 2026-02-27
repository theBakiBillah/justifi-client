import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import {
  FaMoneyBillWave,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaBell,
  FaReceipt,
  FaPercentage,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";

const formatCurrency = (v) => `৳ ${Number(v || 0).toLocaleString("en-BD")}`;
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// Normalize plaintiffs/defendants — handles both array and object formats
// Pending cases store as object { "0": {...}, "1": {...} }, Ongoing as array
const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
};

// ── Approval Status Badge ─────────────────────────────────────────────────────
const ApprovalBadge = ({ status }) => {
  const map = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
        map[status] || "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, color = "bg-indigo-600", badge }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      <div className={`w-1 h-8 ${color} rounded-full`} />
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Icon className="text-gray-600" /> {title}
      </h3>
    </div>
    {badge !== undefined && (
      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
        {badge}
      </span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Create Payment Plan
// ─────────────────────────────────────────────────────────────────────────────
const CreatePlanSection = ({ arbitration, existingPlan, onPlanCreated }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [totalCost, setTotalCost] = useState(arbitration?.totalCost || "");
  const [installments, setInstallments] = useState([
    { totalAmount: "", dueDate: "" },
  ]);
  const [error, setError] = useState("");

  const addInstallment = () =>
    setInstallments((prev) => [...prev, { totalAmount: "", dueDate: "" }]);

  const removeInstallment = (idx) =>
    setInstallments((prev) => prev.filter((_, i) => i !== idx));

  const updateInstallment = (idx, field, value) =>
    setInstallments((prev) =>
      prev.map((inst, i) => (i === idx ? { ...inst, [field]: value } : inst))
    );

  const installmentSum = installments.reduce(
    (s, i) => s + Number(i.totalAmount || 0),
    0
  );
  const isBalanced = installmentSum === Number(totalCost);

  const createMutation = useMutation({
    mutationFn: async (body) => {
      const res = await axiosSecure.post("/payment-plans/payment-plans/create", body);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(["paymentPlan", arbitration.arbitrationId]);
        onPlanCreated?.();
      } else {
        setError(data.message);
      }
    },
    onError: (err) =>
      setError(err.response?.data?.message || "Failed to create plan"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!isBalanced) {
      setError(
        `Installment total (${formatCurrency(installmentSum)}) must equal Total Cost (${formatCurrency(totalCost)})`
      );
      return;
    }
    createMutation.mutate({
      arbitrationId: arbitration.arbitrationId,
      totalCost: Number(totalCost),
      createdBy: "admin",
      installments: installments.map((i) => ({
        totalAmount: Number(i.totalAmount),
        dueDate: i.dueDate,
      })),
    });
  };

  // Already has a plan
  if (existingPlan) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <FaCheckCircle className="text-emerald-600 text-xl" />
          <div>
            <p className="font-semibold text-emerald-800">Payment Plan Active</p>
            <p className="text-sm text-emerald-600">{existingPlan.planId}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Total Cost" value={formatCurrency(existingPlan.totalCost)} />
          <Stat label="Total Paid" value={formatCurrency(existingPlan.totalPaid)} color="text-emerald-700" />
          <Stat label="Pending" value={formatCurrency(existingPlan.totalPending)} color="text-amber-700" />
          <Stat label="Installments" value={existingPlan.installments?.length} />
        </div>

        {/* Installments breakdown */}
        <div className="mt-4 overflow-x-auto rounded-lg border border-emerald-200">
          <table className="min-w-full divide-y divide-emerald-100 text-sm">
            <thead className="bg-emerald-100">
              <tr>
                {["#", "Total Amount", "Per Party", "Due Date", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-bold text-emerald-800 uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-emerald-50">
              {existingPlan.installments?.map((inst) => (
                <tr key={inst.installmentId}>
                  <td className="px-4 py-2.5 font-semibold text-gray-700">
                    {inst.installmentNumber}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-gray-900">
                    {formatCurrency(inst.totalAmount)}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {formatCurrency(inst.perPartyAmount)}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {formatDate(inst.dueDate)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        inst.status === "fully_paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {inst.status === "fully_paid" ? "Fully Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Party info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaUsers className="text-blue-500" />
          <p className="text-sm font-semibold text-blue-800">Parties in this case</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {toArray(arbitration?.plaintiffs).map((p, i) => (
            <span key={p.id || i} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              👤 {p.name} (Plaintiff)
            </span>
          ))}
          {toArray(arbitration?.defendants).map((d, i) => (
            <span key={d.id || i} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              👤 {d.name} (Defendant)
            </span>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-2">
          <FaInfoCircle className="inline mr-1" />
          Cost will be split equally among all {toArray(arbitration?.plaintiffs).length + toArray(arbitration?.defendants).length} parties
        </p>
      </div>

      {/* Total Cost */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Total Arbitration Cost (BDT)
        </label>
        <input
          type="number"
          value={totalCost}
          onChange={(e) => setTotalCost(e.target.value)}
          placeholder="e.g. 150000"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition text-lg font-semibold"
          required
        />
      </div>

      {/* Installments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            Installments ({installments.length})
          </label>
          <button
            type="button"
            onClick={addInstallment}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            <FaPlus /> Add Installment
          </button>
        </div>

        <div className="space-y-3">
          {installments.map((inst, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4"
            >
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Amount (BDT) — Installment {idx + 1}
                </label>
                <input
                  type="number"
                  value={inst.totalAmount}
                  onChange={(e) =>
                    updateInstallment(idx, "totalAmount", e.target.value)
                  }
                  placeholder="e.g. 50000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Due Date
                </label>
                <input
                  type="date"
                  value={inst.dueDate}
                  onChange={(e) =>
                    updateInstallment(idx, "dueDate", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
              </div>
              <div className="flex items-end pb-0.5">
                {installments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstallment(idx)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Balance check */}
        {totalCost && (
          <div
            className={`mt-3 flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
              isBalanced
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <span>Installment Total: {formatCurrency(installmentSum)}</span>
            <span>
              {isBalanced
                ? "✓ Matches total cost"
                : `Remaining: ${formatCurrency(Number(totalCost) - installmentSum)}`}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={createMutation.isPending || !isBalanced}
        className="w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)" }}
      >
        {createMutation.isPending ? (
          <>
            <FaSpinner className="animate-spin" /> Creating Plan...
          </>
        ) : (
          <>
            <FaMoneyBillWave /> Create Payment Plan
          </>
        )}
      </button>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Pending Approvals
// ─────────────────────────────────────────────────────────────────────────────
const PendingApprovalsSection = ({ arbitrationId }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [expandedRow, setExpandedRow] = useState(null);
  const [approveModal, setApproveModal] = useState(null); // payment object
  const [platformCut, setPlatformCut] = useState(20);
  const [split, setSplit] = useState({
    presidingArbitrator: 50,
    arbitrator1: 25,
    arbitrator2: 25,
  });
  const [remarks, setRemarks] = useState("");

  // Fetch payments for this arbitration
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["paymentsForArbitration", arbitrationId],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/payment-plans/payments/arbitration/${arbitrationId}`
      );
      return res.data.success ? res.data.data : [];
    },
    enabled: !!arbitrationId,
  });

  const pendingPayments = payments.filter(
    (p) => p.adminApproval?.status === "pending"
  );
  const processedPayments = payments.filter(
    (p) => p.adminApproval?.status !== "pending"
  );

  const splitTotal =
    Number(split.presidingArbitrator) +
    Number(split.arbitrator1) +
    Number(split.arbitrator2);

  const approveMutation = useMutation({
    mutationFn: async ({ paymentId }) => {
      const res = await axiosSecure.post("/payment-plans/payments/admin/approve", {
        paymentId,
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
        queryClient.invalidateQueries(["paymentsForArbitration", arbitrationId]);
        setApproveModal(null);
        setRemarks("");
      }
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ paymentId, remarks }) => {
      const res = await axiosSecure.post("/payment-plans/payments/admin/reject", {
        paymentId,
        rejectedBy: "admin",
        remarks,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["paymentsForArbitration", arbitrationId]);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
        <FaSpinner className="animate-spin text-xl" />
        <span>Loading payments...</span>
      </div>
    );
  }

  const distributablePreview = approveModal
    ? approveModal.amount - Math.round((approveModal.amount * platformCut) / 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Pending payments */}
      {pendingPayments.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <FaBell className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No pending payments</p>
          <p className="text-gray-400 text-sm">
            Payments will appear here once parties submit them
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-amber-50">
              <tr>
                {[
                  "Payment ID",
                  "Paid By",
                  "Installment",
                  "Amount",
                  "Method",
                  "Paid At",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold text-amber-800 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {pendingPayments.map((payment) => (
                <tr key={payment.paymentId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono text-gray-500">{payment.paymentId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {payment.paidBy?.role}
                    </p>
                    <p className="text-xs text-gray-400">{payment.paidBy?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {payment.installmentId}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium capitalize">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(payment.paidAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setApproveModal(payment)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        <FaCheckCircle /> Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Rejection reason:");
                          if (reason !== null) {
                            rejectMutation.mutate({
                              paymentId: payment.paymentId,
                              remarks: reason,
                            });
                          }
                        }}
                        disabled={rejectMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Processed payments history */}
      {processedPayments.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Payment History
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Paid By", "Amount", "Status", "Approved By", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {processedPayments.map((payment) => (
                  <tr key={payment.paymentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 capitalize">
                        {payment.paidBy?.role}
                      </p>
                      <p className="text-xs text-gray-400">{payment.paidBy?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <ApprovalBadge status={payment.adminApproval?.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {payment.adminApproval?.approvedBy || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(payment.adminApproval?.approvedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div
              className="px-6 py-5"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
              }}
            >
              <p className="text-blue-200 text-xs uppercase font-semibold tracking-wider mb-1">
                Approve Payment
              </p>
              <h3 className="text-white text-xl font-bold">
                {formatCurrency(approveModal.amount)}
              </h3>
              <p className="text-blue-200 text-sm mt-0.5">
                {approveModal.paidBy?.role} — {approveModal.paidBy?.email}
              </p>
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
                  Platform keeps: {formatCurrency(Math.round((approveModal.amount * platformCut) / 100))}
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
                    { key: "presidingArbitrator", label: "Presiding Arbitrator" },
                    { key: "arbitrator1", label: "Arbitrator 1" },
                    { key: "arbitrator2", label: "Arbitrator 2" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
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
                        ≈ {formatCurrency(Math.round((distributablePreview * Number(split[key])) / 100))}
                      </span>
                    </div>
                  ))}
                </div>
                {splitTotal !== 100 && (
                  <p className="text-xs text-red-500 mt-2">
                    ⚠ Split must total 100% (currently {splitTotal}%)
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
                  onClick={() => setApproveModal(null)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    approveMutation.mutate({ paymentId: approveModal.paymentId })
                  }
                  disabled={approveMutation.isPending || splitTotal !== 100}
                  className="flex-1 py-3 rounded-xl font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  }}
                >
                  {approveMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin" /> Approving...
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
      )}
    </div>
  );
};

// ── Small Stat ────────────────────────────────────────────────────────────────
const Stat = ({ label, value, color = "text-gray-900" }) => (
  <div className="bg-white rounded-lg p-3 border border-emerald-100">
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT — AdminPaymentManager
// ─────────────────────────────────────────────────────────────────────────────
const AdminPaymentManager = ({ arbitration }) => {
  const axiosSecure = useAxiosSecure();
  const [activeTab, setActiveTab] = useState("plan");

  const arbitrationId = arbitration?.arbitrationId;

  // Fetch existing payment plan
  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ["paymentPlan", arbitrationId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/payment-plans/payment-plans/${arbitrationId}`);
      return res.data.success ? res.data.data : null;
    },
    enabled: !!arbitrationId,
  });

  // Fetch pending count for badge
  const { data: payments = [] } = useQuery({
    queryKey: ["paymentsForArbitration", arbitrationId],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/payment-plans/payments/arbitration/${arbitrationId}`
      );
      return res.data.success ? res.data.data : [];
    },
    enabled: !!arbitrationId,
  });

  const pendingCount = payments.filter(
    (p) => p.adminApproval?.status === "pending"
  ).length;

  const tabs = [
    { id: "plan", label: "Payment Plan", icon: FaReceipt },
    {
      id: "approvals",
      label: "Approvals",
      icon: FaBell,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 mt-8 mb-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)" }}>
            <FaMoneyBillWave className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment Management</h2>
            <p className="text-sm text-gray-500">
              {arbitration?.arbitrationId}
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="ml-auto flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-full">
              <FaBell className="animate-pulse" />
              {pendingCount} Pending Approval{pendingCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition -mb-px ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon />
            {tab.label}
            {tab.badge !== undefined && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "plan" && (
          <>
            <SectionHeader
              icon={FaReceipt}
              title={planData ? "Active Payment Plan" : "Create Payment Plan"}
              color={planData ? "bg-emerald-600" : "bg-indigo-600"}
            />
            {planLoading ? (
              <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                <FaSpinner className="animate-spin text-xl" />
                <span>Loading plan...</span>
              </div>
            ) : (
              <CreatePlanSection
                arbitration={arbitration}
                existingPlan={planData}
              />
            )}
          </>
        )}

        {activeTab === "approvals" && (
          <>
            <SectionHeader
              icon={FaBell}
              title="Payment Approvals"
              color="bg-amber-500"
              badge={pendingCount > 0 ? pendingCount : undefined}
            />
            <PendingApprovalsSection arbitrationId={arbitrationId} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentManager;