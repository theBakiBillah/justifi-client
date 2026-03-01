import React, { useState } from 'react';
import { 
    FaArrowLeft, FaCalendarAlt, FaClock, FaVideo, FaUserTie, FaUserShield,
    FaCheckCircle, FaTimes, FaUsers, FaExclamationTriangle, FaEye, FaSave,
    FaTimesCircle, FaStickyNote, FaComment, FaEdit, FaPlay, FaDownload,
    FaFileAlt, FaMicrophone, FaCircle, FaFilm, FaChevronDown, FaChevronUp,
    FaCalendarCheck, FaClipboardList, FaSearch, FaFilter
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Loading from '../../../common/loading/Loading';
import useUserData from "../../../hooks/useUserData";

/* ─── Toast Notification ─────────────────────────────────────── */
const Toast = ({ message, type = 'success', onClose }) => {
    const colors = {
        success: 'bg-emerald-500',
        error:   'bg-red-500',
    };
    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-semibold ${colors[type]} animate-bounce-in`}
            style={{ animation: 'slideDown 0.3s ease' }}>
            {type === 'success'
                ? <FaCheckCircle className="text-lg flex-shrink-0" />
                : <FaExclamationTriangle className="text-lg flex-shrink-0" />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
                <FaTimes />
            </button>
            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0);     }
                }
            `}</style>
        </div>
    );
};

/* ─── Tab configuration ─────────────────────────────────────── */
const TABS = [
    { id: 'overview',  label: 'Overview',          icon: FaClipboardList },
    { id: 'attendance',label: 'Attendance',         icon: FaUsers },
    { id: 'notes',     label: 'Private Notes',      icon: FaStickyNote },
    { id: 'recording', label: 'Video Recording',    icon: FaFilm },
    { id: 'summary',   label: 'Recording Summary',  icon: FaFileAlt },
];

/* ─── Status helpers ─────────────────────────────────────────── */
const STATUS_MAP = {
    completed: { bg: 'bg-emerald-500', label: 'Completed' },
    scheduled:  { bg: 'bg-blue-500',   label: 'Scheduled'  },
    cancelled:  { bg: 'bg-red-500',    label: 'Cancelled'  },
    postponed:  { bg: 'bg-amber-500',  label: 'Postponed'  },
    ongoing:    { bg: 'bg-violet-500', label: 'In Progress'},
};

const getStatus = (s) => STATUS_MAP[s?.toLowerCase()] ?? { bg: 'bg-slate-500', label: s || 'Unknown' };

const fmt = (d) => d ? new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
}) : 'Not specified';

const fmtDuration = (sec) => {
    if (!sec) return '—';
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return [h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(' ');
};

/* ─── Small reusable components ─────────────────────────────── */
const Badge = ({ children, color = 'bg-slate-100 text-slate-700' }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
        {children}
    </span>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ children, action }) => (
    <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{children}</h3>
        {action}
    </div>
);

const AttendanceToggle = ({ value, onChange }) => (
    <div className="flex gap-1">
        <button
            onClick={() => onChange(value === true ? null : true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                ${value === true
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}`}
        >
            <FaCheckCircle className="text-xs" /> Present
        </button>
        <button
            onClick={() => onChange(value === false ? null : false)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                ${value === false
                    ? 'bg-red-500 text-white border-red-500 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-600'}`}
        >
            <FaTimes className="text-xs" /> Absent
        </button>
    </div>
);

const makeInitials = (str) => str ? str.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

/* ─── Single attendance row ──────────────────────────────────── */
const AttendanceRow = ({ label, name, initials, avatarBg, avatarText, value, onChange }) => (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors">
        <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-full ${avatarBg} flex items-center justify-center font-bold text-sm ${avatarText} flex-shrink-0 ring-2 ring-white shadow-sm select-none`}>
                {initials}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{name || '—'}</p>
            </div>
        </div>
        <AttendanceToggle value={value} onChange={onChange} />
    </div>
);

/* ─── AttendanceTab component ────────────────────────────────── */
const AttendanceTab = ({
    hearing, attendanceData, setAttendanceData,
    setPartyAttendance, totalArbitratorPresent,
    attendanceSaved, handleAttendanceSave, submitting
}) => {
    const plaintiffs = (hearing.attendance?.plaintiffs || []).map((p, i) => {
        const email = p.email || (typeof p === 'string' ? p : '');
        return { key: email || `plaintiff_${i}`, email, name: p.name || email || `Plaintiff ${i + 1}` };
    });

    const defendants = (hearing.attendance?.defendants || []).map((p, i) => {
        const email = p.email || (typeof p === 'string' ? p : '');
        return { key: email || `defendant_${i}`, email, name: p.name || email || `Defendant ${i + 1}` };
    });

    const arbitrators = [
        { stateKey: 'presidingArbitrator', label: 'Presiding Arbitrator', name: hearing.presidingArbitratorName || 'Not Assigned', fallbackInitials: 'PA', avatarBg: 'bg-violet-100', avatarText: 'text-violet-700' },
        { stateKey: 'arbitrator1',         label: 'Arbitrator 1',         name: hearing.arbitrator1Name || 'Not Assigned',         fallbackInitials: 'A1', avatarBg: 'bg-blue-100',   avatarText: 'text-blue-700'   },
        { stateKey: 'arbitrator2',         label: 'Arbitrator 2',         name: hearing.arbitrator2Name || 'Not Assigned',         fallbackInitials: 'A2', avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700' },
    ];

    const plaintiffsPresent = plaintiffs.filter(p => attendanceData.parties[p.key] === true).length;
    const defendantsPresent = defendants.filter(d => attendanceData.parties[d.key] === true).length;

    return (
        <div className="space-y-5">
            <SectionTitle>Attendance Records</SectionTitle>

            {/* Arbitrators */}
            <Card className="overflow-hidden">
                <div className="bg-slate-700 px-5 py-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><FaUserTie /> Arbitrators</h4>
                    <span className="text-xs text-slate-300">{totalArbitratorPresent}/3 present</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {arbitrators.map(({ stateKey, label, name, fallbackInitials, avatarBg, avatarText }) => (
                        <AttendanceRow
                            key={stateKey}
                            label={label}
                            name={name}
                            initials={name !== 'Not Assigned' ? makeInitials(name) : fallbackInitials}
                            avatarBg={avatarBg}
                            avatarText={avatarText}
                            value={attendanceData[stateKey]}
                            onChange={val => setAttendanceData(p => ({ ...p, [stateKey]: val }))}
                        />
                    ))}
                </div>
            </Card>

            {/* Plaintiffs */}
            <Card className="overflow-hidden">
                <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FaUserTie /> Plaintiffs
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{plaintiffs.length}</span>
                    </h4>
                    <span className="text-xs text-blue-200">{plaintiffsPresent} present</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {plaintiffs.length > 0 ? plaintiffs.map((p, i) => (
                        <AttendanceRow
                            key={p.key}
                            label={`Plaintiff-${i + 1}`}
                            name={p.name}
                            initials={makeInitials(p.name)}
                            avatarBg="bg-blue-100"
                            avatarText="text-blue-700"
                            value={attendanceData.parties[p.key]}
                            onChange={val => setPartyAttendance(p.key, val)}
                        />
                    )) : (
                        <p className="px-5 py-6 text-sm text-slate-400 text-center">No plaintiffs assigned to this hearing.</p>
                    )}
                </div>
            </Card>

            {/* Defendants */}
            <Card className="overflow-hidden">
                <div className="bg-red-600 px-5 py-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FaUserShield /> Defendants
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{defendants.length}</span>
                    </h4>
                    <span className="text-xs text-red-200">{defendantsPresent} present</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {defendants.length > 0 ? defendants.map((d, i) => (
                        <AttendanceRow
                            key={d.key}
                            label={`Defendant-${i + 1}`}
                            name={d.name}
                            initials={makeInitials(d.name)}
                            avatarBg="bg-red-100"
                            avatarText="text-red-700"
                            value={attendanceData.parties[d.key]}
                            onChange={val => setPartyAttendance(d.key, val)}
                        />
                    )) : (
                        <p className="px-5 py-6 text-sm text-slate-400 text-center">No defendants assigned to this hearing.</p>
                    )}
                </div>
            </Card>

            {/* Save button */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    onClick={handleAttendanceSave}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting
                        ? <><FaCircle className="animate-pulse text-xs" /> Saving...</>
                        : <><FaSave className="text-xs" /> Save Attendance</>
                    }
                </button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const HearingDetails = () => {
    const { currentUser } = useUserData();
    const currentUserEmail = currentUser?.email;
    const navigate = useNavigate();
    const { arbitrationId, hearingId } = useParams();
    const axiosSecure = useAxiosSecure();

    const [activeTab, setActiveTab] = useState('overview');
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [commentForm, setCommentForm] = useState({ comment: '', arbitratorRole: 'presidingarbitrator' });
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [noteForm, setNoteForm] = useState({ note: '', arbitratorRole: 'presidingArbitrator' });
    const [attendanceSaved, setAttendanceSaved] = useState(false);
    const [searchSummary, setSearchSummary] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ── Toast state ──────────────────────────────────────────────
    const [toast, setToast] = useState(null); // { message, type }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500); // auto-dismiss after 3.5s
    };

    const [attendanceData, setAttendanceData] = useState({
        presidingArbitrator: null,
        arbitrator1: null,
        arbitrator2: null,
        parties: {}
    });

    /* ── Data fetch ── */
    const { data: hearing, isLoading, error, refetch } = useQuery({
        queryKey: ['hearingDetails', hearingId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/hearings/${hearingId}`);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
        enabled: !!hearingId,
    });

    // Load attendance data from hearing
    React.useEffect(() => {
        if (!hearing) return;
        const parties = {};
        if (hearing.attendance?.plaintiffs) {
            hearing.attendance.plaintiffs.forEach(p => {
                const key = p.email || (typeof p === 'string' ? p : '');
                if (key) parties[key] = p.present ?? null;
            });
        }
        if (hearing.attendance?.defendants) {
            hearing.attendance.defendants.forEach(d => {
                const key = d.email || (typeof d === 'string' ? d : '');
                if (key) parties[key] = d.present ?? null;
            });
        }
        setAttendanceData({
            presidingArbitrator: hearing.attendance?.presidingArbitrator ?? null,
            arbitrator1: hearing.attendance?.arbitrator1 ?? null,
            arbitrator2: hearing.attendance?.arbitrator2 ?? null,
            parties
        });
        if (hearing.attendance) setAttendanceSaved(true);
    }, [hearing]);

    /* ── Handlers ── */
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axiosSecure.post(`/hearings/${hearingId}/comments`, {
                currentUserEmail,
                comment: commentForm.comment
            });
            setShowCommentForm(false);
            setCommentForm({ comment: '', arbitratorRole: 'presidingarbitrator' });
            refetch();
            showToast('Comment added successfully!');
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Failed to add comment. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axiosSecure.post(`/hearings/${hearingId}/notes`, {
                currentUserEmail,
                note: noteForm.note
            });
            setShowNoteForm(false);
            setNoteForm({ note: '', arbitratorRole: 'presidingArbitrator' });
            refetch();
            showToast('Note saved successfully!');
        } catch (error) {
            console.error('Error adding note:', error);
            showToast('Failed to add note. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Attendance save with toast ───────────────────────────────
    const handleAttendanceSave = async () => {
        setSubmitting(true);
        try {
            const plaintiffs = [];
            const defendants = [];

            if (hearing.attendance?.plaintiffs) {
                hearing.attendance.plaintiffs.forEach(p => {
                    const email = p.email || (typeof p === 'string' ? p : '');
                    if (email) plaintiffs.push({ email, present: attendanceData.parties[email] === true });
                });
            }
            if (hearing.attendance?.defendants) {
                hearing.attendance.defendants.forEach(d => {
                    const email = d.email || (typeof d === 'string' ? d : '');
                    if (email) defendants.push({ email, present: attendanceData.parties[email] === true });
                });
            }

            const attendancePayload = {
                presidingArbitrator: attendanceData.presidingArbitrator === true,
                arbitrator1: attendanceData.arbitrator1 === true,
                arbitrator2: attendanceData.arbitrator2 === true,
                plaintiffs,
                defendants
            };

            const response = await axiosSecure.patch(`/hearings/${hearingId}/attendance`, {
                attendance: attendancePayload
            });

            if (response.data.success) {
                setAttendanceSaved(true);
                // ✅ Show toast at top of page
                showToast('Attendance saved successfully!');
                // ✅ Scroll to top so user sees the toast
                window.scrollTo({ top: 0, behavior: 'smooth' });
                refetch();
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            showToast('Failed to save attendance. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const setPartyAttendance = (email, val) =>
        setAttendanceData(prev => ({ ...prev, parties: { ...prev.parties, [email]: val } }));

    const totalArbitratorPresent =
        (attendanceData.presidingArbitrator ? 1 : 0) +
        (attendanceData.arbitrator1 ? 1 : 0) +
        (attendanceData.arbitrator2 ? 1 : 0);

    /* ── Loading / error states ── */
    if (isLoading) return <Loading />;

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="text-2xl text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Hearing</h2>
                <p className="text-slate-500 mb-6">{error.message}</p>
                <button onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Go Back
                </button>
            </div>
        </div>
    );

    if (!hearing) return null;

    const status = getStatus(hearing.status);

    /* ─────────────────────────── RENDER ─────────────────────── */
    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* ── Toast Notification (fixed top center) ── */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    <FaArrowLeft /> Back to Previous
                </button>

                {/* Header Card */}
                <Card className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                        {/* LEFT — title + status */}
                        <div className="flex-shrink-0 lg:w-56 xl:w-64">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${status.bg}`}>
                                    {status.label}
                                </span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                Hearing :<span className="text-blue-600"> {hearing.hearingNumber}</span>
                            </h1>
                            <code className="text-xs text-slate-400 font-mono mt-1 block truncate">
                                {hearing.hearingId}
                            </code>
                        </div>

                        {/* DIVIDER */}
                        <div className="hidden lg:block w-px self-stretch bg-slate-200" />

                        {/* RIGHT — info cards in one row */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Date & Time */}
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                <FaCalendarAlt className="text-blue-500 flex-shrink-0 text-base" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Date & Time</p>
                                    <p className="text-sm font-semibold text-slate-800 truncate">{fmt(hearing.date)}</p>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                <FaClock className="text-emerald-500 flex-shrink-0 text-base" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Duration</p>
                                    <p className="text-sm font-semibold text-slate-800">{hearing.duration ?? '—'} minutes</p>
                                </div>
                            </div>

                            {/* Meeting Link */}
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                <FaVideo className="text-violet-500 flex-shrink-0 text-base" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Meeting</p>
                                    {hearing.meetLink
                                        ? <a href={hearing.meetLink} target="_blank" rel="noopener noreferrer"
                                            className="text-sm font-semibold text-blue-600 hover:underline block truncate">
                                            Join Meeting →
                                          </a>
                                        : <p className="text-sm text-slate-400">Not provided</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agenda — below, compact */}
                    {hearing.hearingAgenda && (
                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
                            <FaClipboardList className="text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-0.5">Agenda</p>
                                <p className="text-slate-700 text-sm leading-relaxed">{hearing.hearingAgenda}</p>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Tabbed Panel */}
                <Card>
                    <div className="border-b border-slate-200 px-2">
                        <nav className="flex overflow-x-auto scrollbar-none">
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <button key={id}
                                    onClick={() => { setActiveTab(id); setShowCommentForm(false); setShowNoteForm(false); }}
                                    className={`flex items-center gap-2 py-4 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all
                                        ${activeTab === id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'}`}>
                                    <Icon className="text-xs" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <SectionTitle
                                    action={!showCommentForm && (
                                        <button onClick={() => setShowCommentForm(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                                            <FaComment className="text-xs" /> Add Comment
                                        </button>
                                    )}>
                                    Arbitrator Comments
                                </SectionTitle>

                                {showCommentForm && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-2">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-slate-800">New Comment</h4>
                                            <button onClick={() => { setShowCommentForm(false); setCommentForm({ comment: '', arbitratorRole: 'presidingarbitrator' }); }}
                                                className="text-slate-400 hover:text-slate-600">
                                                <FaTimesCircle />
                                            </button>
                                        </div>
                                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                                            <textarea
                                                value={commentForm.comment}
                                                onChange={e => setCommentForm(p => ({ ...p, comment: e.target.value }))}
                                                rows={4} required placeholder="Write your comment…"
                                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                            <div className="flex justify-end gap-3">
                                                <button type="button" onClick={() => setShowCommentForm(false)}
                                                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
                                                <button type="submit" disabled={submitting}
                                                    className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <FaSave className="text-xs" /> {submitting ? 'Saving...' : 'Save Comment'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {[
                                        { role: 'presidingarbitrator', label: 'Presiding Arbitrator', sub: 'Lead Arbitrator', color: 'violet' },
                                        { role: 'arbitrator1', label: 'Arbitrator 1', sub: 'Panel Member', color: 'blue' },
                                        { role: 'arbitrator2', label: 'Arbitrator 2', sub: 'Panel Member', color: 'emerald' },
                                    ].map(({ role, label, sub, color }) => (
                                        <div key={role} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-5`}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`w-9 h-9 bg-${color}-100 rounded-full flex items-center justify-center`}>
                                                    <FaUserTie className={`text-${color}-600 text-sm`} />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold text-${color}-800`}>{label}</p>
                                                    <p className={`text-xs text-${color}-500`}>{sub}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-white/80 space-y-3 max-h-60 overflow-y-auto">
                                                {hearing.arbitratorComments?.[role]?.length > 0 ? (
                                                    hearing.arbitratorComments[role].map((comment, idx) => (
                                                        <div key={comment.commentId || idx} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                                            <p className="text-slate-700 text-sm leading-relaxed">{comment.comment}</p>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <p className="text-xs text-slate-400">
                                                                    {new Date(comment.timestamp).toLocaleString()}
                                                                    {comment.edited && ' (edited)'}
                                                                </p>
                                                                {comment.createdBy && <span className="text-xs text-slate-400">{comment.createdBy}</span>}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-slate-400 italic text-sm">No comment added yet</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ATTENDANCE TAB */}
                        {activeTab === 'attendance' && (
                            <AttendanceTab
                                hearing={hearing}
                                attendanceData={attendanceData}
                                setAttendanceData={setAttendanceData}
                                setPartyAttendance={setPartyAttendance}
                                totalArbitratorPresent={totalArbitratorPresent}
                                attendanceSaved={attendanceSaved}
                                handleAttendanceSave={handleAttendanceSave}
                                submitting={submitting}
                            />
                        )}

                        {/* NOTES TAB */}
                        {activeTab === 'notes' && (
                            <div className="space-y-6">
                                <SectionTitle
                                    action={!showNoteForm && (
                                        <button onClick={() => setShowNoteForm(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors">
                                            <FaStickyNote className="text-xs" /> Add Note
                                        </button>
                                    )}>
                                    Private Notes
                                </SectionTitle>

                                {showNoteForm && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-slate-800">New Private Note</h4>
                                            <button onClick={() => { setShowNoteForm(false); setNoteForm({ note: '', arbitratorRole: 'presidingArbitrator' }); }}
                                                className="text-slate-400 hover:text-slate-600"><FaTimesCircle /></button>
                                        </div>
                                        <form onSubmit={handleNoteSubmit} className="space-y-4">
                                            <textarea
                                                value={noteForm.note}
                                                onChange={e => setNoteForm(p => ({ ...p, note: e.target.value }))}
                                                rows={6} required
                                                placeholder="Private notes are only visible to arbitrators and administrators…"
                                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                                            <div className="flex justify-end gap-3">
                                                <button type="button" onClick={() => setShowNoteForm(false)}
                                                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
                                                <button type="submit" disabled={submitting}
                                                    className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <FaSave className="text-xs" /> {submitting ? 'Saving...' : 'Save Note'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaStickyNote className="text-amber-500" />
                                        <h4 className="font-bold text-amber-800">Private Notes</h4>
                                    </div>
                                    {hearing.privateNotes?.length > 0 ? (
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {hearing.privateNotes.map((note, idx) => (
                                                <div key={note.noteId || idx} className="bg-white rounded-xl p-4 border border-amber-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{note.arbitratorRole}</span>
                                                        <span className="text-xs text-slate-400">{new Date(note.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{note.note}</p>
                                                    {note.edited && <p className="text-xs text-slate-400 mt-2">(edited)</p>}
                                                    {note.createdBy && <p className="text-xs text-slate-400 mt-1">by {note.createdBy}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-slate-400">
                                            <FaStickyNote className="text-4xl mx-auto mb-3 opacity-30" />
                                            <p className="font-semibold text-slate-500">No Private Notes</p>
                                            <p className="text-sm mt-1">Add notes for internal reference only.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                                    <FaEye className="text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-blue-700 text-sm">
                                        <strong>Visibility: </strong>Private notes are only visible to arbitrators and administrators.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* VIDEO RECORDING TAB */}
                        {activeTab === 'recording' && (
                            <div className="space-y-6">
                                <SectionTitle>Video Recordings</SectionTitle>
                                {hearing.recordingStatus === 'processing' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                                        <FaCircle className="text-amber-400 animate-pulse" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Recording Processing</p>
                                            <p className="text-xs text-amber-600">The recording is being processed and will be available shortly.</p>
                                        </div>
                                    </div>
                                )}
                                {hearing.recordings?.length > 0 ? (
                                    <div className="space-y-4">
                                        {hearing.recordings.map((rec, i) => (
                                            <Card key={rec.id || i} className="p-5">
                                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                            <FaFilm className="text-violet-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{rec.title || `Recording ${i + 1}`}</p>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                                                                {rec.duration && <span><FaClock className="inline mr-1" />{fmtDuration(rec.duration)}</span>}
                                                                {rec.size && <span>{(rec.size / (1024 * 1024)).toFixed(1)} MB</span>}
                                                                {rec.uploadedAt && <span>Uploaded {fmt(rec.uploadedAt)}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {rec.url && (
                                                        <div className="flex items-center gap-2">
                                                            <a href={rec.url} target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                                                                <FaPlay className="text-xs" /> Play
                                                            </a>
                                                            <a href={rec.url} download
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors">
                                                                <FaDownload className="text-xs" /> Download
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-slate-400">
                                        <FaVideo className="text-5xl mx-auto mb-4 opacity-20" />
                                        <p className="font-bold text-slate-500 text-lg">No Recordings Found</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* RECORDING SUMMARY TAB */}
                        {activeTab === 'summary' && (
                            <div className="space-y-6">
                                <SectionTitle>Recording Summary & Transcript</SectionTitle>
                                {hearing.recordingSummary ? (
                                    <Card className="p-5">
                                        <p className="text-slate-600 text-sm leading-relaxed">{hearing.recordingSummary}</p>
                                    </Card>
                                ) : (
                                    <div className="text-center py-16 text-slate-400">
                                        <FaFileAlt className="text-5xl mx-auto mb-4 opacity-20" />
                                        <p className="font-bold text-slate-500 text-lg">No Summary Available</p>
                                        <p className="text-sm mt-1 max-w-sm mx-auto">
                                            A recording summary will appear here once the recording has been processed.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </Card>
            </div>
        </div>
    );
};

export default HearingDetails;