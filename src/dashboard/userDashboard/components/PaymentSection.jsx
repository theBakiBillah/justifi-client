import React, { useState } from 'react';
import {
    FaMoneyBillWave,
    FaCheckCircle,
    FaClock,
    FaExclamationCircle,
    FaReceipt,
    FaCalendarAlt,
    FaUserTie,
    FaUserShield,
    FaSpinner,
    FaInfoCircle,
    FaTimes,
    FaHourglassHalf,
} from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUserData from '../../../hooks/useUserData';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
    `৳ ${Number(amount || 0).toLocaleString('en-BD')}`;

const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

const isOverdue = (dueDate, status) => {
    if (status === 'paid') return false;
    return new Date(dueDate) < new Date();
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status, dueDate, approvalStatus }) => {
    // paid but waiting admin approval
    if (status === 'paid' && approvalStatus === 'pending') return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <FaHourglassHalf className="text-xs animate-pulse" /> Awaiting Approval
        </span>
    );
    if (status === 'paid') return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <FaCheckCircle className="text-xs" /> Paid
        </span>
    );
    if (isOverdue(dueDate, status)) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <FaExclamationCircle className="text-xs" /> Overdue
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <FaClock className="text-xs" /> Unpaid
        </span>
    );
};

// ── Pay Now Modal ─────────────────────────────────────────────────────────────
const PayNowModal = ({ installment, plan, userRole, userEmail, arbitrationId, onClose, onSuccess }) => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [method, setMethod] = useState('bkash');
    const [transactionRef, setTransactionRef] = useState('');
    const [error, setError] = useState('');

    // Find this user's payment entry
    const myPayment = installment.partyPayments?.find(p => p.email === userEmail);

    const payMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosSecure.post('/payment-plans/payments/pay', {
                arbitrationId,
                planId: plan.planId,
                installmentId: installment.installmentId,
                payerEmail: userEmail,
                payerRole: userRole,
                amount: myPayment?.amountDue,
                paymentMethod: method,
                transactionRef: transactionRef || null,
            });
            return res.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                // Refresh payment plan data
                queryClient.invalidateQueries(['paymentPlan', arbitrationId]);
                onSuccess?.();
            } else {
                setError(data.message || 'Payment failed');
            }
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Payment failed. Please try again.');
        },
    });

    const step = payMutation.isSuccess ? 'done'
        : payMutation.isPending ? 'processing'
        : 'confirm';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)' }}>
                    <div>
                        <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">
                            Installment #{installment.installmentNumber}
                        </p>
                        <h3 className="text-white text-xl font-bold mt-0.5">
                            {formatCurrency(myPayment?.amountDue)}
                        </h3>
                        <p className="text-blue-300 text-xs mt-0.5 capitalize">{userRole}</p>
                    </div>
                    {step !== 'processing' && (
                        <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
                            <FaTimes className="text-xl" />
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {step === 'confirm' && (
                        <>
                            {/* Summary */}
                            <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
                                <p className="text-sm font-semibold text-blue-800 mb-2">Payment Summary</p>
                                <div className="space-y-1.5 text-sm text-blue-700">
                                    <div className="flex justify-between">
                                        <span>Your share</span>
                                        <span className="font-bold">{formatCurrency(myPayment?.amountDue)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Installment total</span>
                                        <span className="font-semibold">{formatCurrency(installment.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Due date</span>
                                        <span className={`font-semibold ${isOverdue(installment.dueDate, 'unpaid') ? 'text-red-600' : ''}`}>
                                            {formatDate(installment.dueDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment method */}
                            <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[
                                    { id: 'bkash', label: 'bKash', color: 'bg-pink-50 border-pink-300 text-pink-700' },
                                    { id: 'nagad', label: 'Nagad', color: 'bg-orange-50 border-orange-300 text-orange-700' },
                                    { id: 'card', label: 'Card', color: 'bg-blue-50 border-blue-300 text-blue-700' },
                                ].map(m => (
                                    <button key={m.id}
                                        onClick={() => setMethod(m.id)}
                                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                            method === m.id
                                                ? `${m.color} scale-105 shadow-sm`
                                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}>
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {/* Transaction reference */}
                            <div className="mb-5">
                                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                    Transaction ID / Reference <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                    placeholder={`e.g. ${method === 'bkash' ? 'BKH8NQ7ZJ3' : method === 'nagad' ? 'NGD123456' : 'TXN-XXXXXXXX'}`}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                                />
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={() => payMutation.mutate()}
                                className="w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)' }}>
                                Confirm Payment — {formatCurrency(myPayment?.amountDue)}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-3">
                                <FaInfoCircle className="inline mr-1" />
                                Payment will be reviewed by admin before confirmation
                            </p>
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-10">
                            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold">Submitting Payment...</p>
                            <p className="text-gray-400 text-sm mt-1">Please don't close this window</p>
                        </div>
                    )}

                    {step === 'done' && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCheckCircle className="text-3xl text-emerald-600" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">Payment Submitted!</h4>
                            <p className="text-gray-500 text-sm mb-1">
                                Your payment request has been sent to admin.
                            </p>
                            <p className="text-xs text-gray-400 mb-6">
                                Status will update once admin approves it.
                            </p>
                            <button onClick={onClose}
                                className="px-8 py-2.5 rounded-xl font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)' }}>
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Summary Card ──────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, icon: Icon, color, iconColor }) => (
    <div className={`rounded-xl p-4 border ${color} flex items-center gap-4`}>
        <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
            <Icon className={`text-lg ${iconColor}`} />
        </div>
        <div>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const PaymentSection = ({ arbitration }) => {
    const { currentUser } = useUserData();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    const arbitrationId = arbitration?.arbitrationId;
    const userEmail = currentUser?.email;

    // Determine current user's role in this arbitration
    const userRole = (() => {
        if (arbitration?.plaintiffs?.some(p => p.email === userEmail)) return 'plaintiff';
        if (arbitration?.defendants?.some(d => d.email === userEmail)) return 'defendant';
        return null;
    })();

    // Fetch payment plan — real API
    const { data: plan, isLoading, error } = useQuery({
        queryKey: ['paymentPlan', arbitrationId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payment-plans/payment-plans/${arbitrationId}`);
            return res.data.success ? res.data.data : null;
        },
        enabled: !!arbitrationId && !!userRole,
        refetchOnWindowFocus: false,
    });

    // Fetch payments for this arbitration (to know approval status per payment)
    const { data: myPayments = [] } = useQuery({
        queryKey: ['myPayments', arbitrationId, userEmail],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payment-plans/payments/arbitration/${arbitrationId}`);
            if (!res.data.success) return [];
            // Filter only this user's payments
            return res.data.data.filter(p => p.paidBy?.email === userEmail);
        },
        enabled: !!arbitrationId && !!userEmail,
        refetchOnWindowFocus: false,
    });

    // Helper: find this user's payment entry in an installment
    const getUserPayment = (installment) =>
        installment.partyPayments?.find(p => p.email === userEmail);

    // Helper: get approval status for a paid installment
    const getApprovalStatus = (installmentId) => {
        const payment = myPayments.find(p => p.installmentId === installmentId);
        return payment?.adminApproval?.status || null;
    };

    // Summary stats
    const myStats = (() => {
        if (!plan) return null;
        let paid = 0, pending = 0, total = 0;
        plan.installments.forEach(inst => {
            const myPayment = getUserPayment(inst);
            if (!myPayment) return;
            total += myPayment.amountDue;
            if (myPayment.status === 'paid') paid += myPayment.amountDue;
            else pending += myPayment.amountDue;
        });
        return { paid, pending, total };
    })();

    const progressPct = myStats
        ? Math.round((myStats.paid / (myStats.total || 1)) * 100)
        : 0;

    // Not a party in this case — don't render
    if (!userRole) return null;

    if (isLoading) return (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 flex items-center justify-center gap-3 mb-8">
            <FaSpinner className="animate-spin text-2xl text-blue-600" />
            <span className="text-gray-600 font-medium">Loading payment details...</span>
        </div>
    );

    if (error) return (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8 text-center">
            <p className="text-red-500 font-medium">Failed to load payment plan</p>
            <button
                onClick={() => queryClient.invalidateQueries(['paymentPlan', arbitrationId])}
                className="mt-3 text-sm text-blue-600 underline">
                Try again
            </button>
        </div>
    );

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                        <h2 className="text-2xl font-bold text-gray-900">Payment Plan</h2>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            userRole === 'plaintiff'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {userRole === 'plaintiff'
                                ? <><FaUserTie className="inline mr-1" />Plaintiff</>
                                : <><FaUserShield className="inline mr-1" />Defendant</>
                            }
                        </span>
                    </div>
                    {plan?.planStatus && (
                        <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                            {plan.planStatus}
                        </span>
                    )}
                </div>

                {/* No plan yet */}
                {!plan ? (
                    <div className="py-14 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaMoneyBillWave className="text-2xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No Payment Plan Yet</h3>
                        <p className="text-gray-400 text-sm">Admin will create your payment schedule soon.</p>
                    </div>
                ) : (
                    <div className="p-6">

                        {/* Summary Cards */}
                        {myStats && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <SummaryCard
                                    label="Total (Your Share)"
                                    value={formatCurrency(myStats.total)}
                                    icon={FaReceipt}
                                    color="bg-slate-50 border-slate-200 text-slate-700"
                                    iconColor="text-slate-500"
                                />
                                <SummaryCard
                                    label="Amount Paid"
                                    value={formatCurrency(myStats.paid)}
                                    icon={FaCheckCircle}
                                    color="bg-emerald-50 border-emerald-200 text-emerald-700"
                                    iconColor="text-emerald-500"
                                />
                                <SummaryCard
                                    label="Amount Pending"
                                    value={formatCurrency(myStats.pending)}
                                    icon={FaClock}
                                    color="bg-amber-50 border-amber-200 text-amber-700"
                                    iconColor="text-amber-500"
                                />
                            </div>
                        )}

                        {/* Progress Bar */}
                        {myStats && myStats.total > 0 && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm font-semibold text-gray-600">Payment Progress</span>
                                    <span className="text-sm font-bold text-indigo-700">{progressPct}%</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${progressPct}%`,
                                            background: 'linear-gradient(90deg, #1e3a8a, #6366f1)'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Installments Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gray-50">
                                        {['Installment', 'Your Amount', 'Due Date', 'Status', 'Paid On', 'Action'].map(col => (
                                            <th key={col}
                                                className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {plan.installments.map((installment) => {
                                        const myPayment = getUserPayment(installment);
                                        if (!myPayment) return null;

                                        const overdue = isOverdue(installment.dueDate, myPayment.status);
                                        const approvalStatus = getApprovalStatus(installment.installmentId);
                                        const isExpanded = expandedRow === installment.installmentId;

                                        return (
                                            <React.Fragment key={installment.installmentId}>
                                                <tr className={`transition-colors ${
                                                    overdue && myPayment.status !== 'paid'
                                                        ? 'bg-red-50/40'
                                                        : 'hover:bg-gray-50/60'
                                                }`}>
                                                    {/* # */}
                                                    <td className="px-5 py-4">
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : installment.installmentId)}
                                                            className="flex items-center gap-3 hover:opacity-80 transition text-left">
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                                                myPayment.status === 'paid'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : overdue
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-indigo-100 text-indigo-700'
                                                            }`}>
                                                                {installment.installmentNumber}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    Installment #{installment.installmentNumber}
                                                                </p>
                                                                <p className="text-xs text-gray-400">{installment.installmentId}</p>
                                                            </div>
                                                        </button>
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {formatCurrency(myPayment.amountDue)}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Total: {formatCurrency(installment.totalAmount)}
                                                        </p>
                                                    </td>

                                                    {/* Due Date */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <FaCalendarAlt className={`text-xs ${
                                                                overdue && myPayment.status !== 'paid'
                                                                    ? 'text-red-400' : 'text-gray-400'
                                                            }`} />
                                                            <span className={
                                                                overdue && myPayment.status !== 'paid'
                                                                    ? 'text-red-600 font-semibold' : 'text-gray-700'
                                                            }>
                                                                {formatDate(installment.dueDate)}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            status={myPayment.status}
                                                            dueDate={installment.dueDate}
                                                            approvalStatus={approvalStatus}
                                                        />
                                                    </td>

                                                    {/* Paid On */}
                                                    <td className="px-5 py-4 text-sm text-gray-500">
                                                        {myPayment.status === 'paid' && myPayment.paidAt
                                                            ? formatDate(myPayment.paidAt)
                                                            : <span className="text-gray-300">—</span>}
                                                    </td>

                                                    {/* Action */}
                                                    <td className="px-5 py-4">
                                                        {myPayment.status === 'paid' ? (
                                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                                                approvalStatus === 'approved'
                                                                    ? 'text-emerald-600'
                                                                    : approvalStatus === 'pending'
                                                                        ? 'text-blue-500'
                                                                        : 'text-emerald-600'
                                                            }`}>
                                                                {approvalStatus === 'pending'
                                                                    ? <><FaHourglassHalf className="animate-pulse" /> Pending Review</>
                                                                    : <><FaCheckCircle /> Completed</>
                                                                }
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => setSelectedInstallment(installment)}
                                                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow hover:shadow-md active:scale-95 ${
                                                                    overdue
                                                                        ? 'bg-red-600 hover:bg-red-700'
                                                                        : 'hover:opacity-90'
                                                                }`}
                                                                style={!overdue ? {
                                                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)'
                                                                } : {}}>
                                                                <FaMoneyBillWave />
                                                                {overdue ? 'Pay Now (Overdue)' : 'Pay Now'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Expanded: all parties */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={6} className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                                                All Parties — Installment #{installment.installmentNumber}
                                                            </p>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                {installment.partyPayments.map((pp, idx) => (
                                                                    <div key={idx} className={`rounded-lg p-3 border text-xs ${
                                                                        pp.status === 'paid'
                                                                            ? 'bg-emerald-50 border-emerald-200'
                                                                            : 'bg-white border-gray-200'
                                                                    }`}>
                                                                        <p className={`font-semibold capitalize mb-0.5 ${
                                                                            pp.role === 'plaintiff' ? 'text-blue-700' : 'text-red-700'
                                                                        }`}>
                                                                            {pp.role}
                                                                        </p>
                                                                        <p className="text-gray-500 truncate text-xs">{pp.email}</p>
                                                                        <p className={`font-bold mt-1 ${
                                                                            pp.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                                                                        }`}>
                                                                            {pp.status === 'paid' ? '✓ Paid' : 'Pending'}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <p className="mt-3 text-xs text-gray-400 text-center">
                            <FaInfoCircle className="inline mr-1" />
                            Click an installment row to view all parties' payment status
                        </p>
                    </div>
                )}
            </div>

            {/* Pay Now Modal */}
            {selectedInstallment && (
                <PayNowModal
                    installment={selectedInstallment}
                    plan={plan}
                    userRole={userRole}
                    userEmail={userEmail}
                    arbitrationId={arbitrationId}
                    onClose={() => setSelectedInstallment(null)}
                    onSuccess={() => setSelectedInstallment(null)}
                />
            )}
        </>
    );
};

export default PaymentSection;