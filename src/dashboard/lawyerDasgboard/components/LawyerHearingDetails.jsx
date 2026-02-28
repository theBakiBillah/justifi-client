import React from 'react';
import {
    FaArrowLeft, FaCalendarAlt, FaClock, FaVideo,
    FaUserTie, FaExclamationTriangle, FaFilm,
    FaFileAlt, FaClipboardList, FaStickyNote, FaUsers,
    FaCheckCircle, FaTimes, FaPlay, FaDownload, FaCircle
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Loading from '../../../common/loading/Loading';

/* ─── Helpers ────────────────────────────────────────────────── */
const STATUS_MAP = {
    completed: { bg: 'bg-emerald-500', label: 'Completed'   },
    scheduled:  { bg: 'bg-blue-500',   label: 'Scheduled'   },
    cancelled:  { bg: 'bg-red-500',    label: 'Cancelled'   },
    postponed:  { bg: 'bg-amber-500',  label: 'Postponed'   },
    ongoing:    { bg: 'bg-violet-500', label: 'In Progress' },
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

/* ─── Reusable ───────────────────────────────────────────────── */
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const makeInitials = (str) =>
    str ? str.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

/* ─── Attendance view (read-only, no toggles, no save) ──────── */
const AttendanceView = ({ hearing }) => {
    const plaintiffs = hearing.attendance?.plaintiffs || [];
    const defendants = hearing.attendance?.defendants || [];

    const presentIcon = <FaCheckCircle className="text-emerald-500 text-sm" />;
    const absentIcon  = <FaTimes className="text-red-400 text-sm" />;

    const renderRow = ({ name, email, present }, label, avatarBg, avatarText) => (
        <div key={email || name} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full ${avatarBg} flex items-center justify-center font-bold text-sm ${avatarText} flex-shrink-0 ring-2 ring-white shadow-sm select-none`}>
                    {makeInitials(name || email || label)}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{name || email || '—'}</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
                {present === true  && <>{presentIcon}<span className="text-emerald-600">Present</span></>}
                {present === false && <>{absentIcon}<span className="text-red-500">Absent</span></>}
                {present == null   && <span className="text-slate-400 text-xs">Not recorded</span>}
            </div>
        </div>
    );

    const arbitratorRows = [
        { key: 'presidingArbitrator', label: 'Presiding Arbitrator', present: hearing.attendance?.presidingArbitrator, avatarBg: 'bg-violet-100', avatarText: 'text-violet-700' },
        { key: 'arbitrator1',         label: 'Arbitrator 1',         present: hearing.attendance?.arbitrator1,         avatarBg: 'bg-blue-100',   avatarText: 'text-blue-700'   },
        { key: 'arbitrator2',         label: 'Arbitrator 2',         present: hearing.attendance?.arbitrator2,         avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700' },
    ];

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800">Attendance Records</h3>

            {/* Arbitrators */}
            <Card className="overflow-hidden">
                <div className="bg-slate-700 px-5 py-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><FaUserTie /> Arbitrators</h4>
                </div>
                <div className="divide-y divide-slate-100">
                    {arbitratorRows.map(({ key, label, present, avatarBg, avatarText }) =>
                        renderRow({ name: label, present }, label, avatarBg, avatarText)
                    )}
                </div>
            </Card>

            {/* Plaintiffs */}
            <Card className="overflow-hidden">
                <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FaUserTie /> Plaintiffs
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{plaintiffs.length}</span>
                    </h4>
                </div>
                <div className="divide-y divide-slate-100">
                    {plaintiffs.length > 0
                        ? plaintiffs.map((p, i) => renderRow(
                            { name: p.name, email: p.email, present: p.present },
                            `Plaintiff-${i + 1}`, 'bg-blue-100', 'text-blue-700'
                          ))
                        : <p className="px-5 py-6 text-sm text-slate-400 text-center">No plaintiffs assigned.</p>}
                </div>
            </Card>

            {/* Defendants */}
            <Card className="overflow-hidden">
                <div className="bg-red-600 px-5 py-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FaUsers /> Defendants
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{defendants.length}</span>
                    </h4>
                </div>
                <div className="divide-y divide-slate-100">
                    {defendants.length > 0
                        ? defendants.map((d, i) => renderRow(
                            { name: d.name, email: d.email, present: d.present },
                            `Defendant-${i + 1}`, 'bg-red-100', 'text-red-700'
                          ))
                        : <p className="px-5 py-6 text-sm text-slate-400 text-center">No defendants assigned.</p>}
                </div>
            </Card>
        </div>
    );
};

/* ─── Tabs (lawyer sees all 5 but read-only) ─────────────────── */
const TABS = [
    { id: 'overview',   label: 'Overview',         icon: FaClipboardList },
    { id: 'attendance', label: 'Attendance',        icon: FaUsers         },
    { id: 'notes',      label: 'Private Notes',     icon: FaStickyNote    },
    { id: 'recording',  label: 'Video Recording',   icon: FaFilm          },
    { id: 'summary',    label: 'Recording Summary', icon: FaFileAlt       },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const LawyerHearingDetails = () => {
    const navigate = useNavigate();
    const { arbitrationId, hearingId } = useParams();
    const axiosSecure = useAxiosSecure();
    const [activeTab, setActiveTab] = React.useState('overview');

    const { data: hearing, isLoading, error } = useQuery({
        queryKey: ['hearingDetails', hearingId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/hearings/${hearingId}`);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
        enabled: !!hearingId,
    });

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

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    <FaArrowLeft /> Back to Previous
                </button>

                {/* Header Card */}
                <Card className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                        <div className="flex-shrink-0 lg:w-56 xl:w-64">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${status.bg}`}>
                                    {status.label}
                                </span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                Hearing : <span className="text-blue-600">{hearing.hearingNumber}</span>
                            </h1>
                            <code className="text-xs text-slate-400 font-mono mt-1 block truncate">{hearing.hearingId}</code>
                        </div>

                        <div className="hidden lg:block w-px self-stretch bg-slate-200" />

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                <FaCalendarAlt className="text-blue-500 flex-shrink-0 text-base" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Date & Time</p>
                                    <p className="text-sm font-semibold text-slate-800 truncate">{fmt(hearing.date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                <FaClock className="text-emerald-500 flex-shrink-0 text-base" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Duration</p>
                                    <p className="text-sm font-semibold text-slate-800">{hearing.duration ?? '—'} minutes</p>
                                </div>
                            </div>
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
                        <nav className="flex overflow-x-auto">
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <button key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 py-4 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all
                                        ${activeTab === id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'}`}>
                                    <Icon className="text-xs" /> {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">

                        {/* ── OVERVIEW — Comments read-only, no Add button ── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800">Arbitrator Comments</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {[
                                        { role: 'presidingarbitrator', label: 'Presiding Arbitrator', sub: 'Lead Arbitrator', color: 'violet' },
                                        { role: 'arbitrator1',         label: 'Arbitrator 1',         sub: 'Panel Member',    color: 'blue'   },
                                        { role: 'arbitrator2',         label: 'Arbitrator 2',         sub: 'Panel Member',    color: 'emerald'},
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
                                                {hearing.arbitratorComments?.[role]?.length > 0
                                                    ? hearing.arbitratorComments[role].map((c, idx) => (
                                                        <div key={c.commentId || idx} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                                            <p className="text-slate-700 text-sm leading-relaxed">{c.comment}</p>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <p className="text-xs text-slate-400">
                                                                    {new Date(c.timestamp).toLocaleString()}
                                                                    {c.edited && ' (edited)'}
                                                                </p>
                                                                {c.createdBy && <span className="text-xs text-slate-400">{c.createdBy}</span>}
                                                            </div>
                                                        </div>
                                                    ))
                                                    : <p className="text-slate-400 italic text-sm">No comments yet</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── ATTENDANCE — view only, no toggles or save ── */}
                        {activeTab === 'attendance' && (
                            hearing.attendance
                                ? <AttendanceView hearing={hearing} />
                                : <div className="text-center py-16 text-slate-400">
                                    <FaUsers className="text-5xl mx-auto mb-4 opacity-20" />
                                    <p className="font-bold text-slate-500 text-lg">No Attendance Recorded</p>
                                    <p className="text-sm mt-1">Attendance has not been recorded for this hearing yet.</p>
                                  </div>
                        )}

                        {/* ── NOTES — view only, no add button ── */}
                        {activeTab === 'notes' && (
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-slate-800">Private Notes</h3>
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                                    {hearing.privateNotes?.length > 0
                                        ? <div className="space-y-4 max-h-96 overflow-y-auto">
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
                                        : <div className="text-center py-10 text-slate-400">
                                            <FaStickyNote className="text-4xl mx-auto mb-3 opacity-30" />
                                            <p className="font-semibold text-slate-500">No Private Notes</p>
                                            <p className="text-sm mt-1">No notes have been added yet.</p>
                                          </div>}
                                </div>
                            </div>
                        )}

                        {/* ── RECORDING — view only ── */}
                        {activeTab === 'recording' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800">Video Recordings</h3>
                                {hearing.recordingStatus === 'processing' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                                        <FaCircle className="text-amber-400 animate-pulse" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Recording Processing</p>
                                            <p className="text-xs text-amber-600">The recording is being processed and will be available shortly.</p>
                                        </div>
                                    </div>
                                )}
                                {hearing.recordings?.length > 0
                                    ? <div className="space-y-4">
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
                                    : <div className="text-center py-16 text-slate-400">
                                        <FaVideo className="text-5xl mx-auto mb-4 opacity-20" />
                                        <p className="font-bold text-slate-500 text-lg">No Recordings Found</p>
                                      </div>}
                            </div>
                        )}

                        {/* ── SUMMARY — view only ── */}
                        {activeTab === 'summary' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800">Recording Summary & Transcript</h3>
                                {hearing.recordingSummary
                                    ? <Card className="p-5">
                                        <p className="text-slate-600 text-sm leading-relaxed">{hearing.recordingSummary}</p>
                                      </Card>
                                    : <div className="text-center py-16 text-slate-400">
                                        <FaFileAlt className="text-5xl mx-auto mb-4 opacity-20" />
                                        <p className="font-bold text-slate-500 text-lg">No Summary Available</p>
                                        <p className="text-sm mt-1 max-w-sm mx-auto">A summary will appear once the recording has been processed.</p>
                                      </div>}
                            </div>
                        )}

                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LawyerHearingDetails;
