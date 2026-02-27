import React, { useState } from 'react';
import {
    FaMoneyBillWave,
    FaCheckCircle,
    FaSpinner,
    FaChevronDown,
    FaChevronUp,
    FaGavel,
    FaInfoCircle,
    FaWallet,
    FaChartBar,
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

// ── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
    const map = {
        presidingArbitrator: { label: 'Presiding Arbitrator', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        arbitrator1:         { label: 'Arbitrator 1',         cls: 'bg-blue-100 text-blue-700 border-blue-200' },
        arbitrator2:         { label: 'Arbitrator 2',         cls: 'bg-violet-100 text-violet-700 border-violet-200' },
    };
    const r = map[role] || { label: role, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${r.cls}`}>
            {r.label}
        </span>
    );
};

// ── Summary Card ──────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, icon: Icon, color, iconColor, sub }) => (
    <div className={`rounded-xl p-4 border ${color} flex items-center gap-4`}>
        <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Icon className={`text-xl ${iconColor}`} />
        </div>
        <div>
            <p className="text-xs font-medium opacity-60 mb-0.5">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
        </div>
    </div>
);

// ── Distribution Row (expandable) ─────────────────────────────────────────────
const DistributionRow = ({ dist, myShare }) => {
    const [expanded, setExpanded] = useState(false);

    const platformPct = dist.platformCut?.percentage || 0;
    const myPct = myShare?.sharePercentage || 0;

    return (
        <>
            <tr
                className="hover:bg-gray-50/70 transition cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Distribution ID + Date */}
                <td className="px-5 py-4">
                    <p className="text-xs font-mono text-gray-500 truncate max-w-[140px]">
                        {dist.distributionId}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(dist.distributedAt)}
                        <span className="ml-1 text-gray-300">{formatTime(dist.distributedAt)}</span>
                    </p>
                </td>

                {/* Total Collected */}
                <td className="px-5 py-4">
                    <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(dist.totalCollected)}
                    </p>
                    <p className="text-xs text-gray-400">
                        Platform: {formatCurrency(dist.platformCut?.amount)} ({platformPct}%)
                    </p>
                </td>

                {/* My Share */}
                <td className="px-5 py-4">
                    <p className="text-base font-bold text-indigo-700">
                        {formatCurrency(myShare?.amount)}
                    </p>
                    <p className="text-xs text-gray-400">{myPct}% of distributable</p>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200">
                        <FaCheckCircle /> Received
                    </span>
                </td>

                {/* Expand toggle */}
                <td className="px-5 py-4 text-gray-400 text-right">
                    {expanded ? <FaChevronUp /> : <FaChevronDown />}
                </td>
            </tr>

            {/* Expanded: full breakdown */}
            {expanded && (
                <tr>
                    <td colSpan={5} className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Payment source info */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                                    Payment Info
                                </p>
                                <div className="space-y-1.5 text-xs bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Payment ID</span>
                                        <span className="font-mono text-gray-700">{dist.paymentId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Installment</span>
                                        <span className="text-gray-700">{dist.installmentId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Distributable Amount</span>
                                        <span className="font-semibold text-gray-700">
                                            {formatCurrency(dist.distributableAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Distributed by</span>
                                        <span className="text-gray-700">{dist.distributedBy}</span>
                                    </div>
                                </div>
                            </div>

                            {/* All arbitrator shares */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                                    All Arbitrator Shares
                                </p>
                                <div className="space-y-1.5">
                                    {dist.arbitratorShares?.map((share, idx) => (
                                        <div key={idx}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
                                                share.role === myShare?.role
                                                    ? 'bg-indigo-50 border-indigo-200'
                                                    : 'bg-white border-gray-200'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                <FaGavel className={
                                                    share.role === myShare?.role
                                                        ? 'text-indigo-500'
                                                        : 'text-gray-400'
                                                } />
                                                <div>
                                                    <p className={`font-semibold ${
                                                        share.role === myShare?.role
                                                            ? 'text-indigo-700'
                                                            : 'text-gray-700'
                                                    }`}>
                                                        {share.name || share.role}
                                                        {share.role === myShare?.role && (
                                                            <span className="ml-1 text-indigo-400 font-normal">(you)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-gray-400">{share.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800">
                                                    {formatCurrency(share.amount)}
                                                </p>
                                                <p className="text-gray-400">{share.sharePercentage}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ArbitratorEarningsSection = ({ arbitration }) => {
    const { currentUser } = useUserData();
    const axiosSecure = useAxiosSecure();

    const arbitrationId = arbitration?.arbitrationId;
    const userEmail = currentUser?.email;

    // Determine this arbitrator's role in the case
    const myRole = (() => {
        if (arbitration?.presidingArbitrator?.email === userEmail) return 'presidingArbitrator';
        if (arbitration?.arbitrator1?.email === userEmail) return 'arbitrator1';
        if (arbitration?.arbitrator2?.email === userEmail) return 'arbitrator2';
        return null;
    })();

    // Fetch all distributions for this arbitration
    const { data: distributions = [], isLoading, error, refetch } = useQuery({
        queryKey: ['distributions', arbitrationId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payment-plans/distributions/${arbitrationId}`);
            return res.data.success ? res.data.data : [];
        },
        enabled: !!arbitrationId && !!myRole,
        refetchOnWindowFocus: false,
    });

    // Not an arbitrator in this case — render nothing
    if (!myRole) return null;

    // Extract my share from a distribution
    const getMyShare = (dist) =>
        dist.arbitratorShares?.find(s => s.role === myRole);

    // Summary stats — admin approves = money received, so all = received
    const stats = (() => {
        let totalEarned = 0;
        distributions.forEach(dist => {
            const share = getMyShare(dist);
            if (share) totalEarned += share.amount;
        });
        return { totalEarned, count: distributions.length };
    })();

    if (isLoading) return (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 flex items-center justify-center gap-3 mb-8">
            <FaSpinner className="animate-spin text-2xl text-indigo-600" />
            <span className="text-gray-600 font-medium">Loading earnings...</span>
        </div>
    );

    if (error) return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8 text-center">
            <p className="text-red-500 font-medium mb-2">Failed to load earnings</p>
            <button onClick={refetch} className="text-sm text-blue-600 underline">Try again</button>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Earnings</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{arbitrationId}</p>
                    </div>
                </div>
                <RoleBadge role={myRole} />
            </div>

            <div className="p-6">

                {/* Summary Cards — Total Earned + Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                    <SummaryCard
                        label="Total Earned"
                        value={formatCurrency(stats.totalEarned)}
                        icon={FaWallet}
                        color="bg-indigo-50 border-indigo-200 text-indigo-800"
                        iconColor="text-indigo-500"
                        sub={`from ${stats.count} distribution${stats.count !== 1 ? 's' : ''}`}
                    />
                    <SummaryCard
                        label="Total Received"
                        value={formatCurrency(stats.totalEarned)}
                        icon={FaCheckCircle}
                        color="bg-emerald-50 border-emerald-200 text-emerald-800"
                        iconColor="text-emerald-500"
                        sub="admin approved"
                    />
                </div>

                {/* No distributions yet */}
                {distributions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <FaChartBar className="text-2xl text-gray-300" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-600 mb-1">No Earnings Yet</h3>
                        <p className="text-gray-400 text-sm">
                            Earnings will appear here once admin approves party payments.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Distribution History Table */}
                        <div>
                            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FaMoneyBillWave className="text-gray-400" /> Distribution History
                            </p>
                            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            {['Distribution', 'Total Collected', 'My Share', 'Status', ''].map(col => (
                                                <th key={col}
                                                    className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {distributions.map((dist) => (
                                            <DistributionRow
                                                key={dist.distributionId}
                                                dist={dist}
                                                myShare={getMyShare(dist)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-3 text-xs text-gray-400 text-center">
                                <FaInfoCircle className="inline mr-1" />
                                Click any row to see full breakdown including all arbitrators' shares
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ArbitratorEarningsSection;