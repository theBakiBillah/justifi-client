// ─────────────────────────────────────────────────────────────────────────────
// VerdictInputForm.jsx
// Route:  /dashboard/verdict/create/:arbitrationId
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';

import {
  FaArrowLeft, FaPlus, FaTrash, FaSave, FaEye,
  FaSpinner, FaExclamationTriangle, FaPaperPlane, FaTimes,
  FaCheckCircle,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUserData from '../../../hooks/useUserData';
import Loading from '../../../common/loading/Loading';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

const toWords = (n) => {
  const num = parseInt(n);
  if (!num) return '';
  if (num >= 10000000) return (num / 10000000).toFixed(1).replace(/\.0$/, '') + ' Crore';
  if (num >= 100000)   return (num / 100000).toFixed(1).replace(/\.0$/, '') + ' Lakh';
  if (num >= 1000)     return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' Thousand';
  return '';
};

// ─── Reusable UI atoms ────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Input = ({ type = 'text', value, onChange, placeholder, className = '' }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    className={`w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none
      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${className}`} />
);

const Textarea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none
      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y" />
);

const SectionHead = ({ num, title, sub, color = 'bg-gray-700' }) => (
  <div className={`${color} px-6 py-4 flex items-center gap-3`}>
    <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center
      text-white font-bold text-sm flex-shrink-0">{num}</span>
    <div>
      <p className="text-white font-semibold">{title}</p>
      {sub && <p className="text-white/60 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AutoBadge = ({ children }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
    <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">Auto-filled from System</p>
    {children}
  </div>
);

const PartyTag = ({ name, onRemove, variant = 'red' }) => (
  <span className={`inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1 text-xs
    font-medium mr-1.5 mb-1.5 ${variant === 'red'
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-green-50 border-green-200 text-green-800'}`}>
    {name}
    <button onClick={() => onRemove(name)} className="hover:opacity-60"><FaTimes size={9} /></button>
  </span>
);

// ─── Publish Success Modal ────────────────────────────────────────────────────
const PublishSuccessModal = ({ verdictId, arbitrationId, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FaCheckCircle className="text-4xl text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verdict Published!</h2>
        <p className="text-gray-500 mb-1 text-sm">The arbitration award has been successfully created and stored.</p>
        <div className="bg-gray-50 rounded-lg px-4 py-2 inline-block mt-2 mb-6">
          <p className="text-xs text-gray-400">Verdict ID</p>
          <p className="font-mono font-semibold text-gray-800">{verdictId}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/dashboard/arbitration-detail/${arbitrationId}`)}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm transition"
          >
            Back to Case
          </button>
          <button
            onClick={() => navigate(`/dashboard/verdict/${verdictId}`)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition"
          >
            View Verdict
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FORM COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const VerdictInputForm = () => {
  const { arbitrationId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { currentUser } = useUserData();

  // ── form state ──
  const [hearingDesc,    setHearingDesc]    = useState('');
  const [plaintiffClaim, setPlaintiffClaim] = useState('');
  const [defendantClaim, setDefendantClaim] = useState('');
  const [issues, setIssues]                = useState([{ id: 1, title: '', finding: '', decision: '' }]);
  const [issueCtr, setIssueCtr]            = useState(2);
  const [awardAmount,    setAwardAmount]    = useState('');
  const [awardWords,     setAwardWords]     = useState('');
  const [payableByList,  setPayableByList]  = useState([]);
  const [payableToList,  setPayableToList]  = useState([]);
  const [payableByInput, setPayableByInput] = useState('');
  const [payableToInput, setPayableToInput] = useState('');
  const [paymentDays,    setPaymentDays]    = useState('');
  const [interestRate,   setInterestRate]   = useState('');
  const [arbCost,        setArbCost]        = useState('');
  const [finalOrders,    setFinalOrders]    = useState('');
  const [extraCond,      setExtraCond]      = useState('');
  const [awardDate,      setAwardDate]      = useState(new Date().toISOString().split('T')[0]);
  const [awardPlace,     setAwardPlace]     = useState('Dhaka, Bangladesh');
  const [hasDissent,     setHasDissent]     = useState(false);
  const [dissentText,    setDissentText]    = useState('');
  const [showPreview,    setShowPreview]    = useState(false);
  const [publishedVerdict, setPublishedVerdict] = useState(null); // for success modal

  // ── fetch arbitration ──
  const { data: arbitration, isLoading: arbLoading, error: arbError } = useQuery({
    queryKey: ['arbitrationDetails', arbitrationId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/arbitrations/details/${arbitrationId}`);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to load arbitration');
      return res.data.data;
    },
    enabled: !!arbitrationId,
    retry: 2,
  });

  const apiArbitrationId = arbitration?.arbitrationId;

  // ── fetch hearings ──
  const { data: hearings = [], isLoading: hearingsLoading } = useQuery({
    queryKey: ['hearings', apiArbitrationId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/hearings/arbitration/${apiArbitrationId}`);
      return res.data.success ? res.data.data : [];
    },
    enabled: !!apiArbitrationId,
  });

  // ── fetch existing draft ──
  const { data: draft } = useQuery({
    queryKey: ['verdict-draft', apiArbitrationId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/verdict/draft/${apiArbitrationId}`);
      return res.data.success ? res.data.data : null;
    },
    enabled: !!apiArbitrationId,
  });

  // Pre-fill from draft
  useEffect(() => {
    if (!draft) return;
    draft.proceedings?.hearingDescription   && setHearingDesc(draft.proceedings.hearingDescription);
    draft.claimsSummary?.plaintiffClaim     && setPlaintiffClaim(draft.claimsSummary.plaintiffClaim);
    draft.claimsSummary?.defendantDefense   && setDefendantClaim(draft.claimsSummary.defendantDefense);
    draft.issues?.length                    && setIssues(draft.issues.map((x, i) => ({ id: i + 1, ...x })));
    const fo = draft.finalOrder;
    if (!fo) return;
    fo.awardAmount          && setAwardAmount(String(fo.awardAmount));
    fo.awardAmountWords     && setAwardWords(fo.awardAmountWords);
    fo.payableBy            && setPayableByList(fo.payableBy);
    fo.payableTo            && setPayableToList(fo.payableTo);
    fo.paymentDeadlineDays  && setPaymentDays(String(fo.paymentDeadlineDays));
    fo.interestRatePercent  && setInterestRate(String(fo.interestRatePercent));
    fo.arbitrationCost      && setArbCost(String(fo.arbitrationCost));
    fo.finalOrders          && setFinalOrders(fo.finalOrders);
    fo.additionalConditions && setExtraCond(fo.additionalConditions);
    fo.awardDate            && setAwardDate(fo.awardDate);
    fo.awardPlace           && setAwardPlace(fo.awardPlace);
    if (fo.dissentingOpinion?.hasDissent) {
      setHasDissent(true);
      setDissentText(fo.dissentingOpinion.details || '');
    }
  }, [draft]);

  useEffect(() => {
    if (arbitration && !arbCost) {
      const c = (parseInt(arbitration.processingFee || 0) + parseInt(arbitration.totalCost || 0));
      if (c) setArbCost(String(c));
    }
  }, [arbitration]);

  useEffect(() => {
    const w = toWords(awardAmount);
    if (w && !awardWords) setAwardWords(w + ' Taka Only');
  }, [awardAmount]);

  // ── issue helpers ──
  const addIssue    = () => { setIssues(p => [...p, { id: issueCtr, title: '', finding: '', decision: '' }]); setIssueCtr(c => c + 1); };
  const removeIssue = (id) => setIssues(p => p.filter(i => i.id !== id));
  const updateIssue = (id, field, val) => setIssues(p => p.map(i => i.id === id ? { ...i, [field]: val } : i));

  // ── party helpers ──
  const pushBy = () => { const v = payableByInput.trim(); if (!v || payableByList.includes(v)) return; setPayableByList(p => [...p, v]); setPayableByInput(''); };
  const pushTo = () => { const v = payableToInput.trim(); if (!v || payableToList.includes(v)) return; setPayableToList(p => [...p, v]); setPayableToInput(''); };

  // ── build payload ──
  const buildPayload = () => ({
    arbitrationId: apiArbitrationId,
    caseId:        arbitration?._id,
    createdBy:     currentUser?.email,
    proceedings:   { hearingDescription: hearingDesc },
    claimsSummary: { plaintiffClaim, defendantDefense: defendantClaim },
    issues: issues.map((x, i) => ({ issueNumber: i + 1, title: x.title, finding: x.finding, decision: x.decision })),
    finalOrder: {
      awardAmount:          parseInt(awardAmount) || 0,
      awardAmountWords:     awardWords,
      payableBy:            payableByList,
      payableTo:            payableToList,
      paymentDeadlineDays:  parseInt(paymentDays) || 0,
      interestRatePercent:  parseFloat(interestRate) || 0,
      arbitrationCost:      parseInt(arbCost) || 0,
      finalOrders,
      additionalConditions: extraCond,
      awardDate,
      awardPlace,
      dissentingOpinion: { hasDissent, details: hasDissent ? dissentText : '' },
    },
  });

  // ── validate ──
  const validate = () => {
    const checks = [
      [!hearingDesc.trim(),             'Hearing Description (Section 1)'],
      [!plaintiffClaim.trim(),          "Claimant's Claim Summary (Section 2)"],
      [!defendantClaim.trim(),          "Respondent's Defense Summary (Section 2)"],
      [issues.some(i => !i.title.trim()), 'All Issue titles (Section 3)'],
      [!awardAmount,                    'Award Amount (Section 4)'],
      [!awardWords.trim(),              'Amount in Words (Section 4)'],
      [payableByList.length === 0,      '"Payable By" — add at least one party (Section 4)'],
      [payableToList.length === 0,      '"Payable To" — add at least one party (Section 4)'],
      [!paymentDays,                    'Payment Deadline (Section 4)'],
      [!awardDate,                      'Date of Award (Section 4)'],
    ];
    for (const [failed, msg] of checks) {
      if (failed) { alert(`⚠️  Required: ${msg}`); return false; }
    }
    return true;
  };

  // ── mutations ──
  const saveDraftMutation = useMutation({
    mutationFn: (payload) => axiosSecure.post('/verdict/save-draft', payload),
    onSuccess:  (res) => res.data.success ? alert('✓ Draft saved!') : alert('Save failed: ' + res.data.message),
    onError:    () => alert('Network error — draft not saved.'),
  });

  const publishMutation = useMutation({
    mutationFn: (payload) => axiosSecure.post('/verdict/publish', payload),
    onSuccess: (res) => {
      if (res.data.success) {
        // white page নয় — success modal দেখাব
        setPublishedVerdict(res.data.verdictId);
        setShowPreview(false);
      } else {
        alert('Publish failed: ' + res.data.message);
      }
    },
    onError: () => alert('Network error — verdict not published.'),
  });

  const handleSaveDraft = () => saveDraftMutation.mutate(buildPayload());
  const handlePreview   = () => { if (validate()) { setShowPreview(true); window.scrollTo(0, 0); } };
  const handlePublish   = () => {
    if (!validate()) return;
    if (!window.confirm('Publish this verdict? This action cannot be undone.')) return;
    publishMutation.mutate(buildPayload());
  };

  if (arbLoading) return <Loading />;
  if (arbError) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load case</h2>
        <p className="text-gray-600">{arbError.message}</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Go Back</button>
      </div>
    </div>
  );

  // ── Publish success modal (preview বা form যেকোনো অবস্থায়) ──
  if (publishedVerdict) return (
    <PublishSuccessModal
      verdictId={publishedVerdict}
      arbitrationId={arbitrationId}
      onClose={() => setPublishedVerdict(null)}
    />
  );

  if (showPreview) return (
    <PreviewPage
      arbitration={arbitration}
      hearings={hearings}
      form={{ hearingDesc, plaintiffClaim, defendantClaim, issues, awardAmount, awardWords,
              payableByList, payableToList, paymentDays, interestRate, arbCost, finalOrders,
              extraCond, awardDate, awardPlace, hasDissent, dissentText }}
      onBack={() => setShowPreview(false)}
      onPublish={handlePublish}
      isPublishing={publishMutation.isPending}
      caseTitle={arbitration?.caseTitle}
    />
  );

  // ─── FORM ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-300 hover:text-white font-medium transition text-sm">
            <FaArrowLeft className="mr-2" size={13} /> Back to Case
          </button>
          <div className="w-px h-5 bg-gray-600" />
          <div>
            <p className="font-semibold text-sm">Draft Award — {apiArbitrationId}</p>
            <p className="text-gray-400 text-xs">{arbitration?.caseTitle} · {arbitration?.caseCategory}</p>
          </div>
        </div>
        <span className="hidden md:block text-xs text-gray-400">{currentUser?.email}</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 pb-32">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Award Input Form</h1>
          <p className="text-gray-500 text-sm mt-1">Fill all required fields. System data is shown as reference.</p>
        </div>

        {/* ── SECTION 1 ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <SectionHead num="1" title="Proceedings Description" sub="Hearing summary" />
          <div className="p-6">
            {hearingsLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4"><FaSpinner className="animate-spin" /> Loading hearings…</div>
            ) : hearings.length > 0 && (
              <AutoBadge>
                <div className="space-y-2">
                  {hearings.map(h => (
                    <div key={h.hearingId} className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white rounded-md px-3 py-2 border border-green-100 text-sm">
                      <div><span className="text-gray-400 text-xs block">Hearing #</span>{h.hearingNumber}</div>
                      <div><span className="text-gray-400 text-xs block">Date</span>{fmt(h.date)}</div>
                      <div><span className="text-gray-400 text-xs block">Duration</span>{h.duration} min</div>
                      <div><span className="text-gray-400 text-xs block">Status</span>
                        <span className={`capitalize font-medium ${h.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{h.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AutoBadge>
            )}
            <Label required>Hearing Description / Summary</Label>
            <Textarea value={hearingDesc} onChange={e => setHearingDesc(e.target.value)} rows={4}
              placeholder="Describe what happened in the hearing..." />
          </div>
        </div>

        {/* ── SECTION 2 ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <SectionHead num="2" title="Summary of Claims" sub="Enter positions of both parties" />
          <div className="p-6">
            <AutoBadge>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-green-700 mb-1.5">Claimant(s)</p>
                  {arbitration?.plaintiffs?.map(p => <p key={p.id} className="text-gray-600 text-xs mb-0.5">• {p.name} ({p.email})</p>)}
                </div>
                <div>
                  <p className="font-semibold text-red-600 mb-1.5">Respondent(s)</p>
                  {arbitration?.defendants?.map(d => <p key={d.id} className="text-gray-600 text-xs mb-0.5">• {d.name} ({d.email})</p>)}
                </div>
              </div>
            </AutoBadge>
            <div className="mb-4">
              <Label required><span className="text-green-700">Claimant's Claim Summary (Arji)</span></Label>
              <Textarea value={plaintiffClaim} onChange={e => setPlaintiffClaim(e.target.value)} rows={5}
                placeholder="Summarize the claimant's position..." />
            </div>
            <div>
              <Label required><span className="text-red-700">Respondent's Defense Summary</span></Label>
              <Textarea value={defendantClaim} onChange={e => setDefendantClaim(e.target.value)} rows={5}
                placeholder="Summarize the respondent's defense..." />
            </div>
          </div>
        </div>

        {/* ── SECTION 3 ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <SectionHead num="3" title="Issues, Findings & Decisions" sub="Define each issue" />
          <div className="p-6">
            <div className="space-y-4">
              {issues.map((issue, idx) => (
                <div key={issue.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{idx + 1}</span>
                      <span className="font-semibold text-amber-900 text-sm">Issue {idx + 1}</span>
                    </div>
                    {issues.length > 1 && (
                      <button onClick={() => removeIssue(issue.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium transition">
                        <FaTrash size={11} /> Remove
                      </button>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <Label required>Issue / Question</Label>
                      <Input value={issue.title} onChange={e => updateIssue(issue.id, 'title', e.target.value)}
                        placeholder="E.g., Whether a valid agreement existed between the parties?" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Finding</Label>
                        <Textarea value={issue.finding} onChange={e => updateIssue(issue.id, 'finding', e.target.value)}
                          placeholder="What the Tribunal found..." rows={4} />
                      </div>
                      <div>
                        <Label>Decision</Label>
                        <Textarea value={issue.decision} onChange={e => updateIssue(issue.id, 'decision', e.target.value)}
                          placeholder="Decision and in whose favor..." rows={4} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addIssue}
              className="mt-4 w-full border-2 border-dashed border-amber-400 text-amber-700 rounded-xl py-3 text-sm font-semibold hover:bg-amber-50 transition flex items-center justify-center gap-2">
              <FaPlus size={12} /> Add Another Issue
            </button>
          </div>
        </div>

        {/* ── SECTION 4 ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <SectionHead num="4" title="Final Order / Award" sub="Amount, parties, payment terms" color="bg-gray-800" />
          <div className="p-6">

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Award Amount</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label required>Award Amount (Tk)</Label>
                <Input type="number" value={awardAmount} onChange={e => setAwardAmount(e.target.value)} placeholder="e.g. 500000" />
              </div>
              <div>
                <Label required>Amount in Words</Label>
                <Input value={awardWords} onChange={e => setAwardWords(e.target.value)} placeholder="e.g. Five Lakh Taka Only" />
              </div>
            </div>

            {/* Payable By */}
            <div className="border-t border-gray-100 pt-5 mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payable By <span className="text-red-400 font-normal normal-case">(required)</span></p>
              <div className="flex flex-wrap min-h-[30px] mb-2">
                {payableByList.map(n => <PartyTag key={n} name={n} onRemove={nm => setPayableByList(p => p.filter(v => v !== nm))} variant="red" />)}
              </div>
              <div className="flex gap-2 mb-2">
                <input type="text" value={payableByInput} onChange={e => setPayableByInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); pushBy(); } }}
                  placeholder="Type name then press Enter or Add"
                  className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition" />
                <button onClick={pushBy} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition flex items-center gap-1">
                  <FaPlus size={11} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {arbitration?.defendants?.map(d => (
                  <button key={d.id} onClick={() => { if (!payableByList.includes(d.name)) setPayableByList(p => [...p, d.name]); }}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded px-2 py-0.5 transition">+ {d.name}</button>
                ))}
              </div>
            </div>

            {/* Payable To */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payable To <span className="text-red-400 font-normal normal-case">(required)</span></p>
              <div className="flex flex-wrap min-h-[30px] mb-2">
                {payableToList.map(n => <PartyTag key={n} name={n} onRemove={nm => setPayableToList(p => p.filter(v => v !== nm))} variant="green" />)}
              </div>
              <div className="flex gap-2 mb-2">
                <input type="text" value={payableToInput} onChange={e => setPayableToInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); pushTo(); } }}
                  placeholder="Type name then press Enter or Add"
                  className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                <button onClick={pushTo} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center gap-1">
                  <FaPlus size={11} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {arbitration?.plaintiffs?.map(p => (
                  <button key={p.id} onClick={() => { if (!payableToList.includes(p.name)) setPayableToList(prev => [...prev, p.name]); }}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded px-2 py-0.5 transition">+ {p.name}</button>
                ))}
              </div>
            </div>

            {/* Payment Terms */}
            <div className="border-t border-gray-100 pt-5 mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Terms</p>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <Label required>Payment Deadline (days)</Label>
                  <Input type="number" value={paymentDays} onChange={e => setPaymentDays(e.target.value)} placeholder="e.g. 30" />
                  <p className="text-xs text-gray-400 mt-1">From the date of this award</p>
                </div>
                <div>
                  <Label>Interest Rate on Delay (% p.a.)</Label>
                  <Input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="e.g. 10" />
                </div>
              </div>
              <div>
                <Label>Arbitration Costs (Tk)</Label>
                <Input type="number" value={arbCost} onChange={e => setArbCost(e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Processing: Tk {Number(arbitration?.processingFee || 0).toLocaleString()} + Admin: Tk {arbitration?.totalCost || 0}</p>
              </div>
            </div>

            {/* Final Orders */}
            <div className="border-t border-gray-100 pt-5 mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Final Orders</p>
              <div className="mb-3">
                <Label>Write Final Orders</Label>
                <Textarea value={finalOrders} onChange={e => setFinalOrders(e.target.value)} rows={3}
                  placeholder="E.g., 'Respondent must hand over all original files within 30 days...'" />
              </div>
              <div>
                <Label>Additional Conditions (optional)</Label>
                <Textarea value={extraCond} onChange={e => setExtraCond(e.target.value)} rows={3}
                  placeholder="Any other directions or conditions..." />
              </div>
            </div>

            {/* Award Details */}
            <div className="border-t border-gray-100 pt-5 mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Award Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label required>Date of Award</Label>
                  <Input type="date" value={awardDate} onChange={e => setAwardDate(e.target.value)} />
                </div>
                <div>
                  <Label>Place of Award</Label>
                  <Input value={awardPlace} onChange={e => setAwardPlace(e.target.value)} placeholder="Dhaka, Bangladesh" />
                </div>
              </div>
            </div>

            {/* Dissenting Opinion */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">Any Dissenting Opinion?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={hasDissent} onChange={e => setHasDissent(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                    after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              <p className="text-xs text-gray-400 mb-3">If off, "Unanimous decision" will appear in the award.</p>
              {hasDissent && (
                <>
                  <Label>Dissenting Opinion Details</Label>
                  <Textarea value={dissentText} onChange={e => setDissentText(e.target.value)} rows={3}
                    placeholder="Enter the dissenting arbitrator's name and opinion..." />
                </>
              )}
            </div>

          </div>
        </div>

        {/* ── Bottom Buttons ── */}
        <div className="flex items-center justify-between mt-4">
          <button onClick={handleSaveDraft} disabled={saveDraftMutation.isPending}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg
              hover:bg-gray-200 font-semibold text-sm border border-gray-200 transition disabled:opacity-50">
            {saveDraftMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saveDraftMutation.isPending ? 'Saving…' : 'Save Draft'}
          </button>
          <button onClick={handlePreview}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-2.5 rounded-lg
              hover:bg-blue-700 font-semibold text-sm shadow transition">
            <FaEye /> Preview Award
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW PAGE
// ─────────────────────────────────────────────────────────────────────────────
const PreviewPage = ({ arbitration, hearings, form, onBack, onPublish, isPublishing, caseTitle }) => {
  const {
    hearingDesc, plaintiffClaim, defendantClaim, issues,
    awardAmount, awardWords, payableByList, payableToList,
    paymentDays, interestRate, arbCost, finalOrders,
    extraCond, awardDate, awardPlace, hasDissent, dissentText,
  } = form;

  const payByStr = payableByList.join(', ');
  const payToStr = payableToList.join(', ');

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Top bar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <button onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition text-sm font-medium">
          <FaArrowLeft size={13} /> Back to Edit
        </button>
        <p className="text-sm font-semibold text-gray-200">Award Preview — {arbitration?.arbitrationId}</p>
        <button onClick={onPublish} disabled={isPublishing}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium text-sm
            flex items-center gap-2 transition disabled:opacity-50">
          {isPublishing ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          {isPublishing ? 'Publishing…' : 'Publish Award'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">

          {/* ── COVER ── */}
          <div className="text-white px-8 py-16 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#0a1929 0%,#1a2a3a 100%)' }}>
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-blue-400/10 -translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-yellow-400/10 translate-x-24 translate-y-24" />
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl font-bold shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#60a5fa,#2563eb)' }}>J</div>
            <h1 className="text-5xl font-bold mb-2"
              style={{ background: 'linear-gradient(to right,#93c5fd,#fff,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              JUSTIFI
            </h1>
            <p className="text-xl tracking-widest mb-2 text-blue-200">ONLINE DISPUTE RESOLUTION</p>
            <div className="w-24 h-1 mx-auto my-5 rounded-full" style={{ background: 'linear-gradient(to right,#60a5fa,#fbbf24)' }} />
            <h2 className="text-4xl font-bold mb-4">ARBITRATION AWARD</h2>
            <div className="inline-block px-8 py-3 rounded-full font-bold text-xl shadow-lg mb-8 text-gray-900"
              style={{ background: 'linear-gradient(135deg,#f5e7c8,#d4af37)' }}>⚖️ FINAL AND BINDING ⚖️</div>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto text-sm p-4 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="text-right text-blue-200">Case No.:</div><div className="text-left font-mono">{arbitration?.arbitrationId}</div>
              <div className="text-right text-blue-200">Date of Award:</div><div className="text-left">{fmt(awardDate)}</div>
              <div className="text-right text-blue-200">Category:</div><div className="text-left">{arbitration?.caseCategory}</div>
              <div className="text-right text-blue-200">Suit Value:</div><div className="text-left">Tk {Number(arbitration?.suitValue || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-gray-50 border-b border-gray-200 px-8 py-2.5 flex justify-between text-xs text-gray-500">
            <span>International Arbitration Center, Dhaka</span>
            <span>Under the International Arbitration Act, 2001</span>
          </div>

          {/* ── S1: Tribunal ── */}
          <PSection n={1} title="Arbitral Tribunal" color="#2563eb" bg="bg-blue-50/20">
            <div className="grid grid-cols-3 gap-4 mb-3">
              {[
                { label: 'Presiding Arbitrator', d: arbitration?.presidingArbitrator, b: '#2563eb' },
                { label: 'Arbitrator',            d: arbitration?.arbitrator1,         b: '#60a5fa' },
                { label: 'Arbitrator',            d: arbitration?.arbitrator2,         b: '#60a5fa' },
              ].map((a, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm text-sm" style={{ borderLeft: `4px solid ${a.b}` }}>
                  <p className="text-xs text-gray-400">{a.label}</p>
                  <p className="font-semibold mt-1">{a.d?.name || '—'}</p>
                  <p className="text-xs text-gray-500">{a.d?.email || ''}</p>
                </div>
              ))}
            </div>
            <div className="text-sm bg-white px-4 py-2 rounded border border-blue-100 inline-block">
              <span className="font-medium">JustiFi Rep:</span>{' '}
              {arbitration?.justifiRepresentative?.name} — {arbitration?.justifiRepresentative?.designation}
            </div>
          </PSection>

          {/* ── S2: Parties ── */}
          <PSection n={2} title="Parties to the Dispute" color="#16a34a">
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="font-bold text-green-800 text-xs uppercase mb-2">Claimant(s)</p>
                {arbitration?.plaintiffs?.map(p => (
                  <div key={p.id} className="mb-3 text-sm">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.email} · {p.phone}</p>
                    <p className="text-xs text-gray-500">{p.address}</p>
                    {p.representatives?.length > 0 && (
                      <div className="mt-1.5 pl-2 border-l-2 border-blue-300">
                        <p className="text-xs font-semibold text-blue-600 mb-0.5">Representatives:</p>
                        {p.representatives.map((r, ri) => (
                          <div key={ri} className="text-xs text-gray-600 mb-0.5">
                            <span className="font-medium">{r.name}</span>
                            {r.designation && <span className="text-gray-400"> · {r.designation}</span>}
                            {r.email && <span className="text-gray-400 block">{r.email}</span>}
                            {r.phone && <span className="text-gray-400"> · {r.phone}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="font-bold text-red-800 text-xs uppercase mb-2">Respondent(s)</p>
                {arbitration?.defendants?.map(d => (
                  <div key={d.id} className="mb-3 text-sm">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.email} · {d.phone}</p>
                    <p className="text-xs text-gray-500">{d.address}</p>
                    {d.representatives?.length > 0 && (
                      <div className="mt-1.5 pl-2 border-l-2 border-red-300">
                        <p className="text-xs font-semibold text-red-600 mb-0.5">Representatives:</p>
                        {d.representatives.map((r, ri) => (
                          <div key={ri} className="text-xs text-gray-600 mb-0.5">
                            <span className="font-medium">{r.name}</span>
                            {r.designation && <span className="text-gray-400"> · {r.designation}</span>}
                            {r.email && <span className="text-gray-400 block">{r.email}</span>}
                            {r.phone && <span className="text-gray-400"> · {r.phone}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </PSection>

          {/* ── S3: Legal Reps ── */}
          <PSection n={3} title="Legal Representatives" color="#7c3aed" bg="bg-gray-50">
            <div className="grid grid-cols-2 gap-5 text-sm">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="font-bold text-purple-700 text-xs uppercase mb-3">Claimant's Representative(s)</p>
                {arbitration?.plaintiffs?.some(p => p.representatives?.length > 0)
                  ? arbitration.plaintiffs.map(p =>
                      p.representatives?.length > 0 ? (
                        <div key={p.id} className="mb-3">
                          <p className="text-xs text-gray-400 mb-1">For: <span className="font-medium text-gray-600">{p.name}</span></p>
                          {p.representatives.map((r, ri) => (
                            <div key={ri} className="bg-purple-50 rounded-md px-3 py-2 mb-1.5">
                              <p className="font-semibold text-gray-800">{r.name}</p>
                              {r.designation && <p className="text-xs text-purple-600">{r.designation}</p>}
                              {r.email && <p className="text-xs text-gray-500 mt-0.5">{r.email}</p>}
                              {r.phone && <p className="text-xs text-gray-500">{r.phone}</p>}
                              {r.address && <p className="text-xs text-gray-500">{r.address}</p>}
                            </div>
                          ))}
                        </div>
                      ) : null
                    )
                  : <p className="text-gray-500 text-sm italic">Not Appointed / Self-represented</p>}
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="font-bold text-purple-700 text-xs uppercase mb-3">Respondent's Representative(s)</p>
                {arbitration?.defendants?.some(d => d.representatives?.length > 0)
                  ? arbitration.defendants.map(d =>
                      d.representatives?.length > 0 ? (
                        <div key={d.id} className="mb-3">
                          <p className="text-xs text-gray-400 mb-1">For: <span className="font-medium text-gray-600">{d.name}</span></p>
                          {d.representatives.map((r, ri) => (
                            <div key={ri} className="bg-purple-50 rounded-md px-3 py-2 mb-1.5">
                              <p className="font-semibold text-gray-800">{r.name}</p>
                              {r.designation && <p className="text-xs text-purple-600">{r.designation}</p>}
                              {r.email && <p className="text-xs text-gray-500 mt-0.5">{r.email}</p>}
                              {r.phone && <p className="text-xs text-gray-500">{r.phone}</p>}
                              {r.address && <p className="text-xs text-gray-500">{r.address}</p>}
                            </div>
                          ))}
                        </div>
                      ) : null
                    )
                  : <p className="text-gray-500 text-sm italic">Not Appointed / Self-represented</p>}
              </div>
            </div>
          </PSection>

          {/* ── S4: Proceedings ── */}
          <PSection n={4} title="Proceedings at a Glance" color="#ea580c">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                ['Hearings', hearings.length],
                ['Sittings', arbitration?.sittings || '—'],
                ['Total Minutes', hearings.reduce((s, h) => s + (h.duration || 0), 0)],
                ['Compliance Days', arbitration?.complianceDays || '—'],
              ].map(([label, val]) => (
                <div key={label} className="bg-orange-50 p-3 rounded-lg text-center border border-orange-100">
                  <p className="text-2xl font-bold text-orange-600">{val}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            {hearings.map(h => (
              <div key={h.hearingId} className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm mb-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-semibold">Hearing #{h.hearingNumber}</span>
                    <p className="font-medium text-sm mt-1.5">{fmt(h.date)} at {fmtTime(h.date)} · {h.duration} min</p>
                    {h.hearingAgenda && <p className="text-xs text-gray-500 mt-0.5">Agenda: {h.hearingAgenda}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${h.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{h.status}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {h.attendance?.presidingArbitrator && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">✅ Presiding Arbitrator</span>}
                  {h.attendance?.arbitrator1 && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">✅ Arbitrator 1</span>}
                  {h.attendance?.arbitrator2 && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">✅ Arbitrator 2</span>}
                  {h.attendance?.plaintiffs?.filter(p => p.present).map(p => <span key={p.email} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">✅ {p.email}</span>)}
                  {h.attendance?.defendants?.filter(d => d.present).map(d => <span key={d.email} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">✅ {d.email}</span>)}
                </div>
              </div>
            ))}
            {hearingDesc && (
              <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-orange-700 mb-1">Arbitrator's Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed">{hearingDesc}</p>
              </div>
            )}
          </PSection>

          {/* ── S5: Claims ── */}
          <PSection n={5} title="Summary of Claims" color="#4f46e5" bg="bg-indigo-50/20">
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white p-4 rounded-lg border border-indigo-200">
                <p className="font-bold text-indigo-700 text-xs uppercase mb-2">Claimant's Claim</p>
                <p className="text-sm text-gray-700 leading-relaxed">{plaintiffClaim}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <p className="font-bold text-red-600 text-xs uppercase mb-2">Respondent's Defense</p>
                <p className="text-sm text-gray-700 leading-relaxed">{defendantClaim}</p>
              </div>
            </div>
          </PSection>

          {/* ── S6 + S7 ── */}
          <PSection n={6} title="Key Issues for Determination" color="#d97706" bg="bg-yellow-50/20">
            <div className="space-y-2 mb-6">
              {issues.map((iss, i) => (
                <div key={iss.id} className="bg-white p-3 rounded-lg border-l-4 border-yellow-500 text-sm">
                  <span className="font-semibold">Issue {i + 1}:</span> {iss.title}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#db2777' }}>7</div>
              <h3 className="text-xl font-semibold text-gray-800">Findings &amp; Decisions</h3>
            </div>
            <div className="space-y-3">
              {issues.map((iss, i) => (
                <div key={iss.id} className="bg-white p-5 rounded-lg border border-pink-200">
                  <p className="font-semibold text-pink-800 mb-2 text-sm">Issue {i + 1}: {iss.title}</p>
                  {iss.finding  && <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Finding:</span> {iss.finding}</p>}
                  {iss.decision && <p className="text-sm text-gray-700"><span className="font-medium">Decision:</span> {iss.decision}</p>}
                </div>
              ))}
            </div>
          </PSection>

          {/* ── S8: Final Order ── */}
          <PSection n={8} title="Final Order / Award" color="#15803d">
            <div className="bg-green-50 p-6 rounded-xl border-2 border-green-300">
              <p className="text-center font-bold text-green-800 mb-5 uppercase tracking-wide text-xs">
                In the Name of the International Arbitration Center, Dhaka
              </p>
              <div className="bg-white rounded-xl p-5 mb-4 text-center border border-green-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Total Award Amount</p>
                <p className="text-4xl font-bold text-green-700">Tk {Number(awardAmount || 0).toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-500 mt-1">{awardWords}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-left">
                  <div>
                    <p className="text-gray-400 font-bold uppercase mb-1">Payable By</p>
                    {payableByList.map(n => <span key={n} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-medium mr-1 mb-1">{n}</span>)}
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase mb-1">Payable To</p>
                    {payableToList.map(n => <span key={n} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium mr-1 mb-1">{n}</span>)}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <OBlock n={1} title="Compensation">
                  {payByStr} is ordered to pay <strong className="text-green-700">Tk {Number(awardAmount || 0).toLocaleString('en-IN')} ({awardWords})</strong> to {payToStr} within <strong>{paymentDays} days</strong> from the date of this Award.
                </OBlock>
                <OBlock n={2} title="Arbitration Costs">
                  The Respondent(s) shall bear arbitration costs of <strong>Tk {Number(arbCost || 0).toLocaleString('en-IN')}</strong>.
                </OBlock>
                {interestRate && <OBlock n={3} title="Interest on Delay">Failure to pay within {paymentDays} days shall attract interest at <strong>{interestRate}% per annum</strong> until full realization.</OBlock>}
                {finalOrders  && <OBlock n={interestRate ? 4 : 3} title="Final Orders">{finalOrders}</OBlock>}
                {extraCond    && <OBlock n="+" title="Additional Conditions">{extraCond}</OBlock>}
              </div>
              <p className="text-center text-sm text-gray-500 mt-4 font-medium">This award is final and binding on all parties.</p>
            </div>
            {hasDissent && dissentText
              ? <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"><p className="font-semibold text-red-800 text-sm mb-1">Dissenting Opinion</p><p className="text-sm text-gray-700">{dissentText}</p></div>
              : <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-400 italic">No dissenting opinion filed. This Award is unanimous.</div>}
          </PSection>

          {/* ── S9: Signatures ── */}
          <PSection n={9} title="Signatures & Attestation" color="#4b5563">
            <div className="flex justify-between text-sm text-gray-600 mb-8 flex-wrap gap-3">
              <p>Place: <strong className="text-gray-800">{awardPlace}</strong></p>
              <p>Date: <strong className="text-gray-800">{fmt(awardDate)}</strong></p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-center mb-10">
              <SigBlock name={arbitration?.presidingArbitrator?.name} role="Presiding Arbitrator" signed />
              <SigBlock name={arbitration?.arbitrator1?.name} role="Arbitrator" />
              <SigBlock name={arbitration?.arbitrator2?.name} role="Arbitrator" />
            </div>
            <div className="text-center">
              <SigBlock name={arbitration?.justifiRepresentative?.name}
                role={`${arbitration?.justifiRepresentative?.designation}, JustiFi`} />
            </div>
          </PSection>

          {/* Footer */}
          <div className="bg-gray-800 px-8 py-5 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center font-bold text-lg text-white"
              style={{ background: 'linear-gradient(135deg,#60a5fa,#2563eb)' }}>J</div>
            <p className="text-white font-semibold text-sm">JustiFi Online Dispute Resolution Platform</p>
            <p className="text-gray-400 text-xs mt-1">Case: {arbitration?.arbitrationId}</p>
            <p className="text-gray-500 text-xs mt-1">Generated on {fmt(awardDate)} — Certified true copy of the Final Award</p>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Preview section wrapper ──────────────────────────────────────────────────
const PSection = ({ n, title, color, bg = '', children }) => (
  <div className={`px-8 py-6 border-b border-gray-200 ${bg}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ background: color }}>{n}</div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const OBlock = ({ n, title, children }) => (
  <div className="bg-white p-4 rounded-lg border border-green-100">
    <p className="font-semibold text-sm mb-1">{n}. {title}</p>
    <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
  </div>
);

const SigBlock = ({ name, role, signed }) => (
  <div className="inline-block text-center">
    <div className="h-12 border-b-2 border-gray-400 w-44 mb-2 mx-auto" />
    <p className="font-semibold text-sm">{name || '—'}</p>
    <p className="text-xs text-gray-500">{role}</p>
    <p className="text-xs text-gray-400 mt-0.5">{signed ? 'Digitally Signed' : 'Signature Pending'}</p>
  </div>
);

export default VerdictInputForm;