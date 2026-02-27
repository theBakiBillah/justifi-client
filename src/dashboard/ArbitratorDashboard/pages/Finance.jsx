import React, { useState, useMemo } from 'react';
import {
    FaMoneyBillWave,
    FaSearch,
    FaWallet,
    FaCheckCircle,
    FaFilter,
    FaTimes,
    FaChevronDown,
    FaGavel,
    FaCalendarAlt,
    FaSpinner,
    FaSortAmountDown,
    FaSortAmountUp,
    FaChartLine,
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

const ROLE_LABEL = {
    presidingArbitrator: 'Presiding Arbitrator',
    arbitrator1: 'Arbitrator 1',
    arbitrator2: 'Arbitrator 2',
};

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

// ── Filter Bar ────────────────────────────────────────────────────────────────
const FilterBar = ({ filters, setFilters, onReset, hasActive }) => {
    const [showDateRange, setShowDateRange] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">

                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                        type="text"
                        placeholder="Search by arbitration ID, case, payer..."
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

                {/* Amount Range */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                        <input
                            type="number"
                            placeholder="Min amount"
                            value={filters.minAmount}
                            onChange={(e) => setFilters(f => ({ ...f, minAmount: e.target.value }))}
                            className="pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-32"
                        />
                    </div>
                    <span className="text-gray-400 text-xs">—</span>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                        <input
                            type="number"
                            placeholder="Max amount"
                            value={filters.maxAmount}
                            onChange={(e) => setFilters(f => ({ ...f, maxAmount: e.target.value }))}
                            className="pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-32"
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
                {hasActive && (
                    <button onClick={onReset}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition border border-red-200">
                        <FaTimes className="text-xs" /> Clear
                    </button>
                )}
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Finance = () => {
    const { currentUser } = useUserData();
    const axiosSecure = useAxiosSecure();
    const userEmail = currentUser?.email;

    const [filters, setFilters] = useState({
        search: '',
        minAmount: '',
        maxAmount: '',
        dateFrom: '',
        dateTo: '',
    });
    const [sortField, setSortField] = useState('distributedAt');
    const [sortDir, setSortDir] = useState('desc');

    // ── Fetch all distributions where this arbitrator has a share ─────────────
    const { data: allDistributions = [], isLoading, error, refetch } = useQuery({
        queryKey: ['myAllEarnings', userEmail],
        queryFn: async () => {
            // Fetch all distributions across all arbitrations for this arbitrator
            const res = await axiosSecure.get(`/payment-plans/distributions/arbitrator/me`);
            return res.data.success ? res.data.data : [];
        },
        enabled: !!userEmail,
        refetchOnWindowFocus: false,
    });

    // Each row = one distribution entry where this arbitrator has a share
    // Flatten: per distribution, find myShare, attach arbitrationId etc.
    const myEarnings = useMemo(() => {
        return allDistributions.map(dist => {
            const myShare = dist.arbitratorShares?.find(s => s.email === userEmail);
            if (!myShare) return null;
            return {
                distributionId: dist.distributionId,
                arbitrationId: dist.arbitrationId,
                installmentId: dist.installmentId,
                paymentId: dist.paymentId,
                totalCollected: dist.totalCollected,
                platformCut: dist.platformCut?.amount || 0,
                distributableAmount: dist.distributableAmount,
                myRole: myShare.role,
                myAmount: myShare.amount,
                myPct: myShare.sharePercentage,
                status: myShare.status,
                paidAt: myShare.paidAt,
                distributedAt: dist.distributedAt,
                distributedBy: dist.distributedBy,
                allShares: dist.arbitratorShares,
            };
        }).filter(Boolean);
    }, [allDistributions, userEmail]);

    // ── Summary Stats ─────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const totalEarned = myEarnings.reduce((s, r) => s + r.myAmount, 0);
        const totalReceived = myEarnings.filter(r => r.status === 'paid').reduce((s, r) => s + r.myAmount, 0);
        const uniqueCases = new Set(myEarnings.map(r => r.arbitrationId)).size;
        return { totalEarned, totalReceived, uniqueCases, count: myEarnings.length };
    }, [myEarnings]);

    // ── Filter + Sort ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let rows = [...myEarnings];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            rows = rows.filter(r =>
                r.arbitrationId?.toLowerCase().includes(q) ||
                r.distributionId?.toLowerCase().includes(q) ||
                r.installmentId?.toLowerCase().includes(q) ||
                r.paymentId?.toLowerCase().includes(q) ||
                ROLE_LABEL[r.myRole]?.toLowerCase().includes(q)
            );
        }
        if (filters.minAmount) {
            rows = rows.filter(r => r.myAmount >= Number(filters.minAmount));
        }
        if (filters.maxAmount) {
            rows = rows.filter(r => r.myAmount <= Number(filters.maxAmount));
        }
        if (filters.dateFrom) {
            rows = rows.filter(r => new Date(r.distributedAt) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            rows = rows.filter(r => new Date(r.distributedAt) <= new Date(filters.dateTo + 'T23:59:59'));
        }

        // Sort
        rows.sort((a, b) => {
            let va = a[sortField], vb = b[sortField];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return rows;
    }, [myEarnings, filters, sortField, sortDir]);

    const hasActiveFilters = filters.search || filters.minAmount || filters.maxAmount || filters.dateFrom || filters.dateTo;

    const resetFilters = () => setFilters({ search: '', minAmount: '', maxAmount: '', dateFrom: '', dateTo: '' });

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

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
                <FaSpinner className="animate-spin text-2xl text-indigo-600" />
                <span className="font-medium">Loading earnings...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-500 font-semibold mb-3">Failed to load earnings</p>
                <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-6">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)' }}>
                            <FaChartLine className="text-white text-base" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
                            <p className="text-gray-400 text-sm">All arbitration payment distributions</p>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <SummaryCard
                        label="Total Earned"
                        value={formatCurrency(stats.totalEarned)}
                        icon={FaWallet}
                        gradient="from-indigo-600 to-blue-700"
                        sub={`${stats.count} payment${stats.count !== 1 ? 's' : ''} received`}
                    />
                    <SummaryCard
                        label="Total Received"
                        value={formatCurrency(stats.totalReceived)}
                        icon={FaCheckCircle}
                        gradient="from-emerald-500 to-teal-600"
                        sub="admin approved & released"
                    />
                    <SummaryCard
                        label="Cases Worked"
                        value={stats.uniqueCases}
                        icon={FaGavel}
                        gradient="from-violet-600 to-purple-700"
                        sub="unique arbitration cases"
                    />
                </div>

                {/* Filter Bar */}
                <FilterBar
                    filters={filters}
                    setFilters={setFilters}
                    onReset={resetFilters}
                    hasActive={hasActiveFilters}
                />

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="text-indigo-500" />
                            <h3 className="text-base font-bold text-gray-900">Payment History</h3>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <FaMoneyBillWave className="text-2xl text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-semibold mb-1">
                                {hasActiveFilters ? 'No results found' : 'No earnings yet'}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {hasActiveFilters
                                    ? 'Try adjusting your filters'
                                    : 'Earnings will appear here once admin approves payments'}
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
                                                { label: 'Arbitration', field: 'arbitrationId' },
                                                { label: 'Installment', field: 'installmentId' },
                                                { label: 'My Role', field: 'myRole' },
                                                { label: 'Total Collected', field: 'totalCollected' },
                                                { label: 'My Share', field: 'myAmount' },
                                                { label: 'Date', field: 'distributedAt' },
                                                { label: 'Status', field: 'status' },
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
                                        {filtered.map((row) => (
                                            <tr key={row.distributionId} className="hover:bg-indigo-50/30 transition group">
                                                {/* Arbitration ID */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {row.arbitrationId}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                        {row.distributionId}
                                                    </p>
                                                </td>

                                                {/* Installment */}
                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                                        {row.installmentId}
                                                    </span>
                                                </td>

                                                {/* Role */}
                                                <td className="px-5 py-4">
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                                                        row.myRole === 'presidingArbitrator'
                                                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                                            : row.myRole === 'arbitrator1'
                                                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                                : 'bg-violet-100 text-violet-700 border-violet-200'
                                                    }`}>
                                                        {ROLE_LABEL[row.myRole] || row.myRole}
                                                    </span>
                                                </td>

                                                {/* Total Collected */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {formatCurrency(row.totalCollected)}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Platform: {formatCurrency(row.platformCut)}
                                                    </p>
                                                </td>

                                                {/* My Share */}
                                                <td className="px-5 py-4">
                                                    <p className="text-base font-bold text-indigo-700">
                                                        {formatCurrency(row.myAmount)}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{row.myPct}% share</p>
                                                </td>

                                                {/* Date */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm text-gray-700">
                                                        {formatDate(row.distributedAt)}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatTime(row.distributedAt)}
                                                    </p>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200">
                                                        <FaCheckCircle className="text-xs" /> Received
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {filtered.map((row) => (
                                    <div key={row.distributionId} className="p-4 hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{row.arbitrationId}</p>
                                                <p className="text-xs text-gray-400 font-mono">{row.distributionId}</p>
                                            </div>
                                            <p className="text-base font-bold text-indigo-700">
                                                {formatCurrency(row.myAmount)}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <p className="text-gray-400 mb-0.5">Installment</p>
                                                <p className="font-mono text-gray-700">{row.installmentId}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-0.5">Role</p>
                                                <p className="font-semibold text-gray-700">{ROLE_LABEL[row.myRole]}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-0.5">Total Collected</p>
                                                <p className="font-semibold text-gray-700">{formatCurrency(row.totalCollected)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-0.5">Date</p>
                                                <p className="text-gray-700">{formatDate(row.distributedAt)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                <FaCheckCircle className="text-xs" /> Received
                                            </span>
                                        </div>
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

export default Finance;