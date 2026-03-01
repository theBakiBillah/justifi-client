import React, { useState, useMemo } from 'react';
import {
    FaMoneyBillWave,
    FaSearch,
    FaWallet,
    FaCheckCircle,
    FaClock,
    FaSpinner,
    FaTimes,
    FaCalendarAlt,
    FaChartLine,
    FaHourglassHalf,
    FaTimesCircle,
    FaSortAmountDown,
    FaSortAmountUp,
    FaUserTie,
    FaUserShield,
    FaReceipt,
} from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUserData from '../../../hooks/useUserData';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (v) => `৳ ${Number(v || 0).toLocaleString('en-BD')}`;
const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    }) : '—';
const formatTime = (d) =>
    d ? new Date(d).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
    }) : '';

// ── Summary Card ──────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, icon: Icon, gradient, sub }) => (
    <div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{label}</p>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="text-white text-base" />
                </div>
            </div>
            <p className="text-2xl font-bold mb-1">{value}</p>
            {sub && <p className="text-white/60 text-xs">{sub}</p>}
        </div>
    </div>
);

// ── Approval Status Badge ─────────────────────────────────────────────────────
const ApprovalBadge = ({ status }) => {
    const map = {
        pending:  { label: 'Awaiting Approval', cls: 'bg-blue-100 text-blue-700 border-blue-200',   icon: FaHourglassHalf },
        approved: { label: 'Approved',           cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FaCheckCircle },
        rejected: { label: 'Rejected',           cls: 'bg-red-100 text-red-700 border-red-200',     icon: FaTimesCircle },
    };
    const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: FaClock };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
            <s.icon className={`text-xs ${status === 'pending' ? 'animate-pulse' : ''}`} />
            {s.label}
        </span>
    );
};

// ── Method Badge ──────────────────────────────────────────────────────────────
const MethodBadge = ({ method }) => {
    const map = {
        bkash: 'bg-pink-100 text-pink-700 border-pink-200',
        nagad: 'bg-orange-100 text-orange-700 border-orange-200',
        card:  'bg-blue-100 text-blue-700 border-blue-200',
        bank:  'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
            map[method?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200'
        }`}>
            {method || '—'}
        </span>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const UserPaymentHistory = () => {
    const { currentUser } = useUserData();
    const axiosSecure = useAxiosSecure();
    const userEmail = currentUser?.email;

    const [filters, setFilters] = useState({
        search: '',
        minAmount: '',
        maxAmount: '',
        dateFrom: '',
        dateTo: '',
        approvalStatus: 'all',
    });
    const [sortField, setSortField] = useState('paidAt');
    const [sortDir, setSortDir]     = useState('desc');

    // ── Fetch all payments made by this user ──────────────────────────────────
    const { data: payments = [], isLoading, error, refetch } = useQuery({
        queryKey: ['userPaymentHistory', userEmail],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payment-plans/payments/user/me`);
            return res.data.success ? res.data.data : [];
        },
        enabled: !!userEmail,
        refetchOnWindowFocus: false,
    });

    // ── Summary Stats ─────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total      = payments.reduce((s, p) => s + p.amount, 0);
        const approved   = payments.filter(p => p.adminApproval?.status === 'approved').reduce((s, p) => s + p.amount, 0);
        const pending    = payments.filter(p => p.adminApproval?.status === 'pending').reduce((s, p) => s + p.amount, 0);
        const cases      = new Set(payments.map(p => p.arbitrationId)).size;
        return { total, approved, pending, cases, count: payments.length };
    }, [payments]);

    // ── Filter + Sort ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let rows = [...payments];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            rows = rows.filter(r =>
                r.arbitrationId?.toLowerCase().includes(q) ||
                r.paymentId?.toLowerCase().includes(q) ||
                r.installmentId?.toLowerCase().includes(q) ||
                r.paymentMethod?.toLowerCase().includes(q) ||
                r.transactionRef?.toLowerCase().includes(q)
            );
        }
        if (filters.approvalStatus !== 'all') {
            rows = rows.filter(r => r.adminApproval?.status === filters.approvalStatus);
        }
        if (filters.minAmount) {
            rows = rows.filter(r => r.amount >= Number(filters.minAmount));
        }
        if (filters.maxAmount) {
            rows = rows.filter(r => r.amount <= Number(filters.maxAmount));
        }
        if (filters.dateFrom) {
            rows = rows.filter(r => new Date(r.paidAt) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            rows = rows.filter(r => new Date(r.paidAt) <= new Date(filters.dateTo + 'T23:59:59'));
        }

        rows.sort((a, b) => {
            let va = sortField === 'approvalStatus'
                ? a.adminApproval?.status
                : a[sortField];
            let vb = sortField === 'approvalStatus'
                ? b.adminApproval?.status
                : b[sortField];
            if (typeof va === 'string') va = va?.toLowerCase();
            if (typeof vb === 'string') vb = vb?.toLowerCase();
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1  : -1;
            return 0;
        });

        return rows;
    }, [payments, filters, sortField, sortDir]);

    const hasActiveFilters = filters.search || filters.minAmount || filters.maxAmount
        || filters.dateFrom || filters.dateTo || filters.approvalStatus !== 'all';

    const resetFilters = () => setFilters({
        search: '', minAmount: '', maxAmount: '',
        dateFrom: '', dateTo: '', approvalStatus: 'all'
    });

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <FaSortAmountDown className="text-gray-300 text-xs" />;
        return sortDir === 'asc'
            ? <FaSortAmountUp className="text-indigo-500 text-xs" />
            : <FaSortAmountDown className="text-indigo-500 text-xs" />;
    };

    // Determine user's role label (from first payment)
    const userRole = payments[0]?.paidBy?.role || null;

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
                <FaSpinner className="animate-spin text-2xl text-indigo-600" />
                <span className="font-medium">Loading payment history...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-500 font-semibold mb-3">Failed to load payment history</p>
                <button onClick={refetch}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-6">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)' }}>
                        <FaReceipt className="text-white text-base" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                            {userRole && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                                    userRole === 'plaintiff'
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : 'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                    {userRole === 'plaintiff'
                                        ? <><FaUserTie className="inline mr-1" />Plaintiff</>
                                        : <><FaUserShield className="inline mr-1" />Defendant</>
                                    }
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm">All your arbitration payments</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <SummaryCard
                        label="Total Paid"
                        value={formatCurrency(stats.total)}
                        icon={FaWallet}
                        gradient="from-indigo-600 to-blue-700"
                        sub={`${stats.count} payment${stats.count !== 1 ? 's' : ''}`}
                    />
                    <SummaryCard
                        label="Approved"
                        value={formatCurrency(stats.approved)}
                        icon={FaCheckCircle}
                        gradient="from-emerald-500 to-teal-600"
                        sub="admin confirmed"
                    />
                    <SummaryCard
                        label="Awaiting Approval"
                        value={formatCurrency(stats.pending)}
                        icon={FaHourglassHalf}
                        gradient="from-amber-500 to-orange-600"
                        sub="under review"
                    />
                    <SummaryCard
                        label="Cases"
                        value={stats.cases}
                        icon={FaChartLine}
                        gradient="from-violet-600 to-purple-700"
                        sub="unique arbitrations"
                    />
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-3 items-center">

                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search by arbitration ID, payment ID, method..."
                                value={filters.search}
                                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                            />
                            {filters.search && (
                                <button onClick={() => setFilters(f => ({ ...f, search: '' }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <FaTimes className="text-xs" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filters.approvalStatus}
                            onChange={(e) => setFilters(f => ({ ...f, approvalStatus: e.target.value }))}
                            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700">
                            <option value="all">All Status</option>
                            <option value="pending">Awaiting Approval</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* Amount Range */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minAmount}
                                    onChange={(e) => setFilters(f => ({ ...f, minAmount: e.target.value }))}
                                    className="pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-28"
                                />
                            </div>
                            <span className="text-gray-400 text-xs">—</span>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxAmount}
                                    onChange={(e) => setFilters(f => ({ ...f, maxAmount: e.target.value }))}
                                    className="pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-28"
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                                    className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                            <span className="text-gray-400 text-xs">—</span>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>

                        {/* Reset */}
                        {hasActiveFilters && (
                            <button onClick={resetFilters}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition border border-red-200">
                                <FaTimes className="text-xs" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="text-indigo-500" />
                            <h3 className="text-base font-bold text-gray-900">Transaction Records</h3>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <FaReceipt className="text-2xl text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-semibold mb-1">
                                {hasActiveFilters ? 'No results found' : 'No payments yet'}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {hasActiveFilters
                                    ? 'Try adjusting your filters'
                                    : 'Your payment history will appear here'}
                            </p>
                            {hasActiveFilters && (
                                <button onClick={resetFilters}
                                    className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition">
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {[
                                                { label: 'Payment ID',      field: 'paymentId' },
                                                { label: 'Arbitration',     field: 'arbitrationId' },
                                                { label: 'Installment',     field: 'installmentId' },
                                                { label: 'Amount',          field: 'amount' },
                                                { label: 'Method',          field: 'paymentMethod' },
                                                { label: 'Paid On',         field: 'paidAt' },
                                                { label: 'Approval Status', field: 'approvalStatus' },
                                            ].map(col => (
                                                <th key={col.field}
                                                    onClick={() => toggleSort(col.field)}
                                                    className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition select-none">
                                                    <div className="flex items-center gap-1.5">
                                                        {col.label}
                                                        <SortIcon field={col.field} />
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filtered.map((payment) => (
                                            <tr key={payment.paymentId}
                                                className="hover:bg-indigo-50/30 transition">

                                                {/* Payment ID */}
                                                <td className="px-5 py-4">
                                                    <p className="text-xs font-mono text-gray-500 truncate max-w-[130px]">
                                                        {payment.paymentId}
                                                    </p>
                                                    {payment.transactionRef && (
                                                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[130px]">
                                                            Ref: {payment.transactionRef}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Arbitration ID */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {payment.arbitrationId}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                                        {payment.paidBy?.role}
                                                    </p>
                                                </td>

                                                {/* Installment */}
                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                                        {payment.installmentId}
                                                    </span>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-5 py-4">
                                                    <p className="text-base font-bold text-indigo-700">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                </td>

                                                {/* Method */}
                                                <td className="px-5 py-4">
                                                    <MethodBadge method={payment.paymentMethod} />
                                                </td>

                                                {/* Date */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm text-gray-700">
                                                        {formatDate(payment.paidAt)}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatTime(payment.paidAt)}
                                                    </p>
                                                </td>

                                                {/* Approval Status */}
                                                <td className="px-5 py-4">
                                                    <ApprovalBadge status={payment.adminApproval?.status} />
                                                    {payment.adminApproval?.remarks && (
                                                        <p className="text-xs text-gray-400 mt-1 max-w-[150px] truncate">
                                                            {payment.adminApproval.remarks}
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {filtered.map((payment) => (
                                    <div key={payment.paymentId} className="p-4 hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {payment.arbitrationId}
                                                </p>
                                                <p className="text-xs font-mono text-gray-400 mt-0.5">
                                                    {payment.paymentId}
                                                </p>
                                            </div>
                                            <p className="text-base font-bold text-indigo-700">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                            <div>
                                                <p className="text-gray-400 mb-0.5">Installment</p>
                                                <p className="font-mono text-gray-700">{payment.installmentId}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-0.5">Method</p>
                                                <MethodBadge method={payment.paymentMethod} />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-0.5">Paid On</p>
                                                <p className="text-gray-700">{formatDate(payment.paidAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-0.5">Role</p>
                                                <p className="text-gray-700 capitalize">{payment.paidBy?.role}</p>
                                            </div>
                                        </div>
                                        <ApprovalBadge status={payment.adminApproval?.status} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserPaymentHistory;