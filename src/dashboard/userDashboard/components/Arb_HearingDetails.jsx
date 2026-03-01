import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import {
    FaArrowLeft, FaCalendarAlt, FaClock, FaVideo,
    FaUserTie, FaUserShield, FaCheckCircle, FaTimes,
    FaUsers, FaExclamationTriangle, FaClipboardList,
    FaFilm, FaFileAlt, FaPlay, FaDownload, FaCircle,
    FaMicrophone, FaStickyNote
} from "react-icons/fa";

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_MAP = {
    completed: { bg: "bg-emerald-500", label: "Completed" },
    scheduled:  { bg: "bg-blue-500",   label: "Scheduled"  },
    cancelled:  { bg: "bg-red-500",    label: "Cancelled"  },
    postponed:  { bg: "bg-amber-500",  label: "Postponed"  },
    ongoing:    { bg: "bg-violet-500", label: "In Progress"},
};
const getStatus = (s) => STATUS_MAP[s?.toLowerCase()] ?? { bg: "bg-slate-500", label: s || "Unknown" };

const fmt = (d) => d ? new Date(d).toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
}) : "Not specified";

/* ─── Reusable UI ────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-5">{children}</h3>
);

/* ─── Read-only attendance badge ────────────────────────────── */
const AttendanceBadge = ({ value }) => {
    if (value === true) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white">
            <FaCheckCircle className="text-xs" /> Present
        </span>
    );
    if (value === false) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white">
            <FaTimes className="text-xs" /> Absent
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400">
            — Not Recorded
        </span>
    );
};

const makeInitials = (str) =>
    str ? str.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase() : "??";

/* ─── Attendance row (read-only) ─────────────────────────────── */
const AttendanceRow = ({ label, name, initials, avatarBg, avatarText, value }) => (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors">
        <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-full ${avatarBg} flex items-center justify-center font-bold text-sm ${avatarText} flex-shrink-0 ring-2 ring-white shadow-sm select-none`}>
                {initials}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{name || "—"}</p>
            </div>
        </div>
        <AttendanceBadge value={value} />
    </div>
);

/* ─── Tabs ───────────────────────────────────────────────────── */
const TABS = [
    { id: "overview",   label: "Overview",         icon: FaClipboardList },
    { id: "attendance", label: "Attendance",        icon: FaUsers },
    { id: "recording",  label: "Video Recording",   icon: FaFilm },
    { id: "summary",    label: "Recording Summary", icon: FaFileAlt },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
import { useState } from "react";

const Arb_HearingDetails = () => {
    const { arbitrationId, hearingId } = useParams();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    const [activeTab, setActiveTab] = useState("overview");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["hearingDetails", hearingId],
        enabled: !!hearingId,
        queryFn: async () => {
            const res = await axiosPublic.get(`/users/hearings/${hearingId}`);
            return res.data;
        },
    });

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Loading hearing details...</p>
            </div>
        </div>
    );

    if (isError || !data) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="text-2xl text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Hearing</h2>
                <p className="text-slate-500 mb-6">Unable to fetch hearing details. Please try again.</p>
                <button onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
                    Go Back
                </button>
            </div>
        </div>
    );

    const hearing = data.success ? data.data : data;
    if (!hearing) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <p className="text-slate-500">No hearing found.</p>
        </div>
    );

    const status = getStatus(hearing.status);

    // Build attendance data from hearing
    const attendanceParties = {};
    hearing.attendance?.plaintiffs?.forEach(p => {
        const key = p.email || "";
        if (key) attendanceParties[key] = p.present ?? null;
    });
    hearing.attendance?.defendants?.forEach(d => {
        const key = d.email || "";
        if (key) attendanceParties[key] = d.present ?? null;
    });

    const plaintiffs = (hearing.attendance?.plaintiffs || []).map((p, i) => ({
        key: p.email || `p_${i}`,
        email: p.email || "",
        name: p.name || p.email || `Plaintiff ${i + 1}`,
        present: p.present ?? null,
    }));
    const defendants = (hearing.attendance?.defendants || []).map((d, i) => ({
        key: d.email || `d_${i}`,
        email: d.email || "",
        name: d.name || d.email || `Defendant ${i + 1}`,
        present: d.present ?? null,
    }));

    const arbitrators = [
        { key: "presidingArbitrator", label: "Presiding Arbitrator", name: hearing.presidingArbitratorName || "Not Assigned", initials: "PA", avatarBg: "bg-violet-100", avatarText: "text-violet-700", value: hearing.attendance?.presidingArbitrator ?? null },
        { key: "arbitrator1",         label: "Arbitrator 1",         name: hearing.arbitrator1Name || "Not Assigned",         initials: "A1", avatarBg: "bg-blue-100",   avatarText: "text-blue-700",   value: hearing.attendance?.arbitrator1 ?? null },
        { key: "arbitrator2",         label: "Arbitrator 2",         name: hearing.arbitrator2Name || "Not Assigned",         initials: "A2", avatarBg: "bg-indigo-100", avatarText: "text-indigo-700", value: hearing.attendance?.arbitrator2 ?? null },
    ];

    const totalArbitratorPresent = arbitrators.filter(a => a.value === true).length;
    const plaintiffsPresent = plaintiffs.filter(p => p.present === true).length;
    const defendantsPresent = defendants.filter(d => d.present === true).length;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors">
                    <FaArrowLeft /> Back to Arbitration
                </button>

                {/* ── Compact Header Card ── */}
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
                                Hearing :<span className="text-purple-600"> {hearing.hearingNumber || "—"}</span>
                            </h1>
                            <code className="text-xs text-slate-400 font-mono mt-1 block truncate">
                                {hearing.hearingId}
                            </code>
                        </div>

                        {/* Divider */}
                        <div className="hidden lg:block w-px self-stretch bg-slate-200" />

                        {/* RIGHT — info cards */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                <FaCalendarAlt className="text-purple-500 flex-shrink-0 text-base" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Date & Time</p>
                                    <p className="text-sm font-semibold text-slate-800 truncate">{fmt(hearing.date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                <FaClock className="text-emerald-500 flex-shrink-0 text-base" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Duration</p>
                                    <p className="text-sm font-semibold text-slate-800">{hearing.duration ?? "—"} minutes</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                <FaVideo className="text-violet-500 flex-shrink-0 text-base" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Meeting</p>
                                    {hearing.meetLink
                                        ? <a href={hearing.meetLink} target="_blank" rel="noopener noreferrer"
                                            className="text-sm font-semibold text-purple-600 hover:underline block truncate">
                                            Join Meeting →
                                          </a>
                                        : <p className="text-sm text-slate-400">Not provided</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agenda */}
                    {hearing.hearingAgenda && (
                        <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-start gap-3">
                            <FaClipboardList className="text-purple-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-0.5">Agenda</p>
                                <p className="text-slate-700 text-sm leading-relaxed">{hearing.hearingAgenda}</p>
                            </div>
                        </div>
                    )}
                </Card>

                {/* ── Tabbed Panel ── */}
                <Card>
                    {/* Tab bar */}
                    <div className="border-b border-slate-200 px-2">
                        <nav className="flex overflow-x-auto">
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <button key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 py-4 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all
                                        ${activeTab === id
                                            ? "border-purple-500 text-purple-600"
                                            : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300"}`}>
                                    <Icon className="text-xs" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">

                        {/* ══ OVERVIEW TAB ══ */}
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                <SectionTitle>Arbitrator Comments</SectionTitle>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {[
                                        { role: "presidingarbitrator", label: "Presiding Arbitrator", sub: "Lead Arbitrator",  color: "violet"  },
                                        { role: "arbitrator1",          label: "Arbitrator 1",         sub: "Panel Member",     color: "blue"    },
                                        { role: "arbitrator2",          label: "Arbitrator 2",         sub: "Panel Member",     color: "emerald" },
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
                                                    hearing.arbitratorComments[role].map((c, idx) => (
                                                        <div key={c.commentId || idx} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                                            <p className="text-slate-700 text-sm leading-relaxed">{c.comment}</p>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <p className="text-xs text-slate-400">
                                                                    {new Date(c.timestamp).toLocaleString()}
                                                                    {c.edited && " (edited)"}
                                                                </p>
                                                                {c.createdBy && <span className="text-xs text-slate-400">{c.createdBy}</span>}
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

                        {/* ══ ATTENDANCE TAB ══ */}
                        {activeTab === "attendance" && (
                            <div className="space-y-5">
                                <SectionTitle>Attendance Records</SectionTitle>

                                {/* Arbitrators */}
                                <Card className="overflow-hidden">
                                    <div className="bg-slate-700 px-5 py-3 flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <FaUserTie /> Arbitrators
                                        </h4>
                                        <span className="text-xs text-slate-300">{totalArbitratorPresent}/3 present</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {arbitrators.map(a => (
                                            <AttendanceRow
                                                key={a.key}
                                                label={a.label}
                                                name={a.name}
                                                initials={a.name !== "Not Assigned" ? makeInitials(a.name) : a.initials}
                                                avatarBg={a.avatarBg}
                                                avatarText={a.avatarText}
                                                value={a.value}
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
                                                value={p.present}
                                            />
                                        )) : (
                                            <p className="px-5 py-6 text-sm text-slate-400 text-center">No plaintiffs assigned.</p>
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
                                                value={d.present}
                                            />
                                        )) : (
                                            <p className="px-5 py-6 text-sm text-slate-400 text-center">No defendants assigned.</p>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* ══ VIDEO RECORDING TAB ══ */}
                        {activeTab === "recording" && (
                            <div className="space-y-6">
                                <SectionTitle>Video Recordings</SectionTitle>

                                {hearing.recordingStatus === "processing" && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                                        <FaCircle className="text-amber-400 animate-pulse" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Recording Processing</p>
                                            <p className="text-xs text-amber-600">The recording will be available shortly.</p>
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
                                                                {rec.size && <span>{(rec.size / (1024 * 1024)).toFixed(1)} MB</span>}
                                                                {rec.uploadedAt && <span>Uploaded {fmt(rec.uploadedAt)}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {rec.url && (
                                                        <div className="flex items-center gap-2">
                                                            <a href={rec.url} target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors">
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
                                        <p className="text-sm mt-1">Recordings will appear here once uploaded.</p>
                                    </div>
                                )}

                                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
                                    <FaMicrophone className="text-violet-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-violet-800">About Recordings</p>
                                        <p className="text-xs text-violet-600 mt-0.5">Recordings are stored securely and accessible to authorized parties only.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ RECORDING SUMMARY TAB ══ */}
                        {activeTab === "summary" && (
                            <div className="space-y-6">
                                <SectionTitle>Recording Summary</SectionTitle>

                                {hearing.recordingSummary ? (
                                    <Card className="p-5">
                                        <p className="text-slate-600 text-sm leading-relaxed">{hearing.recordingSummary}</p>
                                    </Card>
                                ) : (
                                    <div className="text-center py-16 text-slate-400">
                                        <FaFileAlt className="text-5xl mx-auto mb-4 opacity-20" />
                                        <p className="font-bold text-slate-500 text-lg">No Summary Available</p>
                                        <p className="text-sm mt-1 max-w-sm mx-auto">
                                            A summary will appear here once the recording has been processed.
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

export default Arb_HearingDetails;