import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import { runValuationEngine, type ValuationInputs, type ValuationResult } from '../utils/valuationEngine'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  BarChart2,
  Users,
  Clock,
  Star,
  CheckCircle2,
  Info,
  DollarSign,
  Activity,
  ArrowRight,
} from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function fmtMult(n: number) {
  return `${n.toFixed(2)}×`
}

function pct(n: number) {
  return `${(n * 100).toFixed(0)}%`
}

const TIER_COLORS: Record<string, string> = {
  LOW:      'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  MODERATE: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  HIGH:     'text-orange-400 border-orange-400/30 bg-orange-400/10',
  CRITICAL: 'text-red-400 border-red-400/30 bg-red-400/10',
}

const TIER_BAR_COLORS: Record<string, string> = {
  LOW:      'bg-emerald-400',
  MODERATE: 'bg-yellow-400',
  HIGH:     'bg-orange-400',
  CRITICAL: 'bg-red-400',
}

// ─── Input field ─────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  type = 'number',
  min = 0,
}: {
  label: string
  hint?: string
  value: number | string
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
  type?: string
  min?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[11px] text-gray-500 leading-relaxed">{hint}</p>}
      <div className="flex items-center gap-0">
        {prefix && (
          <span className="px-3 py-2.5 text-sm text-gray-400 bg-white/5 border border-white/10 border-r-0 rounded-l-lg">
            {prefix}
          </span>
        )}
        <input
          type={type}
          min={min}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-[#1e60ff]/60 focus:bg-white/8 transition-all
            ${prefix ? 'rounded-r-lg' : suffix ? 'rounded-l-lg' : 'rounded-lg'}`}
        />
        {suffix && (
          <span className="px-3 py-2.5 text-sm text-gray-400 bg-white/5 border border-white/10 border-l-0 rounded-r-lg">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${value ? 'bg-[#1e60ff]' : 'bg-white/15'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon, title: string, subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-lg bg-[#1e60ff]/15 border border-[#1e60ff]/20 flex items-center justify-center flex-shrink-0">
        <Icon size={17} className="text-[#1e60ff]" />
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'revenue',    label: 'Revenue',    icon: DollarSign },
  { id: 'retention',  label: 'Retention',  icon: Users },
  { id: 'traffic',    label: 'Traffic',    icon: Activity },
  { id: 'engagement', label: 'Engagement', icon: BarChart2 },
  { id: 'game',       label: 'Game Info',  icon: Star },
]

// ─── MultiplierBar ────────────────────────────────────────────────────────────

function MultiplierBar({ label, value, tier }: { label: string; value: number; tier: string }) {
  const pctVal = Math.min(Math.max(((value - 0.5) / 1.0) * 100, 0), 100)
  const color = value >= 1.05 ? 'bg-emerald-400' : value >= 0.90 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-gray-400 w-36 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pctVal}%` }} />
      </div>
      <span className={`text-[11px] font-mono w-12 text-right ${value >= 1.05 ? 'text-emerald-400' : value >= 0.90 ? 'text-yellow-400' : 'text-red-400'}`}>
        {fmtMult(value)}
      </span>
    </div>
  )
}

// ─── Results Panel ────────────────────────────────────────────────────────────

function Results({ result }: { result: ValuationResult }) {
  const monthly = result.headline / Math.max(result.paybackMonths, 1)
  const paybackDisplay = result.paybackMonths > 500 ? '—' : `${result.paybackMonths.toFixed(1)} months`

  return (
    <div className="space-y-6">
      {/* Headline */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e60ff]/8 via-transparent to-transparent p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1e60ff] mb-3">Automated Valuation Estimate</p>
        <div className="text-7xl md:text-8xl font-medium text-white tracking-tight mb-2 tabular-nums">
          {fmt(result.headline)}
        </div>
        <p className="text-gray-400 text-sm">
          {result.paybackMonths < 500 ? `≈ ${result.paybackMonths.toFixed(1)} months of revenue at current run-rate` : 'Insufficient revenue data for payback estimate'}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${TIER_COLORS[result.riskTier]}`}>
            {result.tierLabel}
          </span>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            result.dataCompleteness >= 0.8 ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' :
            result.dataCompleteness >= 0.6 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
            'text-red-400 border-red-400/30 bg-red-400/10'
          }`}>
            {result.confidenceLabel}
          </span>
        </div>
      </div>

      {/* Valuation band */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Low', value: result.low, sub: 'Conservative' },
          { label: 'Base', value: result.base, sub: 'Expected' },
          { label: 'High', value: result.high, sub: 'Optimistic' },
          { label: 'Max', value: result.maxJustifiable, sub: 'Ceiling' },
        ].map(b => (
          <div key={b.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{b.label}</p>
            <p className="text-lg font-bold text-white tabular-nums">{fmt(b.value)}</p>
            <p className="text-[10px] text-gray-500 mt-1">{b.sub}</p>
          </div>
        ))}
      </div>

      {/* Anomaly flags */}
      {result.anomalyFlags.length > 0 && (
        <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Anomaly Flags</span>
          </div>
          {result.anomalyFlags.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-yellow-300/80">
              <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>
              {f}
            </div>
          ))}
        </div>
      )}

      {/* Primary models */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Primary Models (Weighted)</p>
        <div className="space-y-3">
          {[
            { label: 'Risk-Adjusted Payback', value: result.models.payback, weight: '32%' },
            { label: 'Revenue Multiple',       value: result.models.revenueMultiple, weight: '22%' },
            { label: 'Decay-Based DCF',        value: result.models.dcf, weight: '22%' },
            { label: '28-Day Run Rate',        value: result.models.runRate28d, weight: '17%' },
            { label: 'Trend-Weighted Revenue', value: result.models.trendWeighted, weight: '7%' },
          ].map(m => {
            const w = parseInt(m.weight) / 100
            const maxVal = Math.max(...[result.models.payback, result.models.revenueMultiple, result.models.dcf, result.models.runRate28d, result.models.trendWeighted])
            const barPct = maxVal > 0 ? (m.value / maxVal) * 100 : 0
            return (
              <div key={m.label} className="flex items-center gap-3">
                <span className="text-[11px] text-gray-400 w-44 flex-shrink-0">{m.label}</span>
                <span className="text-[10px] text-gray-500 w-8 flex-shrink-0">{m.weight}</span>
                <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1e60ff] rounded-full transition-all" style={{ width: `${barPct}%` }} />
                </div>
                <span className="text-[11px] font-mono text-white w-16 text-right tabular-nums">{fmt(m.value)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Multipliers */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Adjustment Multipliers</p>
        <p className="text-[11px] text-gray-500 mb-4">Net multiplier: <span className="font-mono text-white">{fmtMult(result.adjustedBase / Math.max(result.weightedBase, 1))}</span></p>
        <div className="space-y-2">
          {Object.entries({
            'Traffic Source Risk':   result.multipliers.trafficSourceRisk,
            'Volatility':            result.multipliers.volatility,
            'Growth Momentum':       result.multipliers.growthMomentum,
            'Engagement':            result.multipliers.engagement,
            'Retention Durability':  result.multipliers.retentionDurability,
            'Long-Term Retention':   result.multipliers.longTermRetention,
            'Concentration':         result.multipliers.concentration,
            'Technical Quality':     result.multipliers.technicalQuality,
            'Seller Independence':   result.multipliers.sellerIndependence,
            'IP / Brand Premium':    result.multipliers.ipBrand,
            'Longevity':             result.multipliers.longevity,
          }).map(([label, val]) => (
            <MultiplierBar key={label} label={label} value={val} tier={result.riskTier} />
          ))}
        </div>
      </div>

      {/* Supporting signals */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'DAU/MAU Stickiness', value: pct(result.stickiness), icon: Users },
          { label: 'Price Per DAU',      value: fmt(result.pricePerDau), icon: DollarSign },
          { label: 'Risk Tier',          value: result.riskTier,         icon: Shield },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
            <s.icon size={14} className="text-[#1e60ff] mx-auto mb-2" />
            <p className="text-base font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl border border-white/6 bg-white/2 p-4">
        <Info size={13} className="text-gray-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-500 leading-relaxed">
          This is an automated estimate based on the inputs provided. It is <strong className="text-gray-400">not an offer</strong>.
          The final offer comes after human review — playing the game, inspecting the codebase, verifying traffic, and assessing operator fit.
          The math keeps us honest. Intuition keeps us sharp.
        </p>
      </div>

      <Link to="/contact">
        <button className="w-full py-4 rounded-xl bg-[#1e60ff] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#004ce6] transition-colors flex items-center justify-center gap-2 mt-2">
          Submit for Human Review <ArrowRight size={15} />
        </button>
      </Link>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: ValuationInputs = {
  revenue7d: 0,
  revenue28d: 0,
  revenue90d: 0,
  creatorRewardsPct: 0,
  retentionD1: 0,
  retentionD7: 0,
  retentionD30: 0,
  longTermRetentionScore: 0,
  homeRecPct: 0,
  friendsPct: 0,
  searchPct: 0,
  dau: 0,
  mau: 0,
  sessionMinutes: 0,
  likeRatio: 0,
  qptr7d: 0,
  qptr28d: 0,
  gameAgeMonths: 0,
  topDevProductPct: 0,
  hasIpBrand: false,
  sellerDependencePct: 50,
  technicalQualityScore: 5,
}

export default function ValuationPage() {
  const [step, setStep] = useState(0)
  const [inputs, setInputs] = useState<ValuationInputs>(DEFAULT_INPUTS)
  const [showResults, setShowResults] = useState(false)

  function set(key: keyof ValuationInputs, value: number | boolean) {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const result = useMemo(() => {
    if (inputs.revenue28d > 0) return runValuationEngine(inputs)
    return null
  }, [inputs])

  const stepContent = [
    // Step 0 — Revenue
    <div key="revenue" className="space-y-5">
      <SectionHeader icon={DollarSign} title="Revenue Data" subtitle="Enter USD revenue figures from your Creator Dashboard" />
      <Field label="Revenue — Last 7 Days" hint="Total USD earned in the past 7 days (Sales + Creator Rewards)" prefix="$" value={inputs.revenue7d} onChange={v => set('revenue7d', v)} />
      <Field label="Revenue — Last 28 Days" hint="Total USD earned in the past 28 days" prefix="$" value={inputs.revenue28d} onChange={v => set('revenue28d', v)} />
      <Field label="Revenue — Last 90 Days" hint="Total USD earned in the past 90 days (optional, improves DCF accuracy)" prefix="$" value={inputs.revenue90d} onChange={v => set('revenue90d', v)} />
      <Field label="Creator Rewards % of Revenue" hint="What % of your total revenue comes from Creator Rewards payouts vs. direct player spending?" suffix="%" value={inputs.creatorRewardsPct} onChange={v => set('creatorRewardsPct', Math.min(100, v))} />
      <Field label="Top Dev Product % of Revenue" hint="What % of revenue does your single biggest dev product generate?" suffix="%" value={inputs.topDevProductPct} onChange={v => set('topDevProductPct', Math.min(100, v))} />
    </div>,

    // Step 1 — Retention
    <div key="retention" className="space-y-5">
      <SectionHeader icon={Users} title="Retention" subtitle="Day 1, 7, and 30 retention rates from your Creator Dashboard" />
      <Field label="Day 1 Retention" hint="% of players who return the day after their first session. Roblox benchmark ≈ 35%" suffix="%" value={inputs.retentionD1} onChange={v => set('retentionD1', Math.min(100, v))} />
      <Field label="Day 7 Retention" hint="% of players who return 7 days after first session. Most important retention metric. Benchmark ≈ 20%" suffix="%" value={inputs.retentionD7} onChange={v => set('retentionD7', Math.min(100, v))} />
      <Field label="Day 30 Retention" hint="% of players who return 30 days after first session. Benchmark ≈ 10%" suffix="%" value={inputs.retentionD30} onChange={v => set('retentionD30', Math.min(100, v))} />
      <Field label="Long-Term Retention Score (Wk 3–8)" hint="Average % of players still playing across weeks 3–8 from your weekly cohort data. Leave 0 if you don't have this." suffix="%" value={inputs.longTermRetentionScore} onChange={v => set('longTermRetentionScore', Math.min(100, v))} />
    </div>,

    // Step 2 — Traffic
    <div key="traffic" className="space-y-5">
      <SectionHeader icon={Activity} title="Traffic Sources" subtitle="Where your players are coming from (percentages should total ≤ 100%)" />
      <Field label="Home Recommendation %" hint="% of plays coming from Roblox's home page / algorithm. High dependence = higher risk." suffix="%" value={inputs.homeRecPct} onChange={v => set('homeRecPct', Math.min(100, v))} />
      <Field label="Friends %" hint="% of plays from friends' activity feeds and referrals" suffix="%" value={inputs.friendsPct} onChange={v => set('friendsPct', Math.min(100, v))} />
      <Field label="Search %" hint="% of plays from direct search. Strong organic signal." suffix="%" value={inputs.searchPct} onChange={v => set('searchPct', Math.min(100, v))} />
    </div>,

    // Step 3 — Engagement
    <div key="engagement" className="space-y-5">
      <SectionHeader icon={BarChart2} title="Engagement" subtitle="DAU, MAU, and session quality from your Creator Dashboard" />
      <Field label="Daily Active Users (DAU)" hint="Average daily active users over the past 28 days" value={inputs.dau} onChange={v => set('dau', v)} />
      <Field label="Monthly Active Users (MAU)" hint="Unique players in the last 30 days" value={inputs.mau} onChange={v => set('mau', v)} />
      <Field label="Average Session Length" hint="Average minutes per session over 28 days" suffix="min" value={inputs.sessionMinutes} onChange={v => set('sessionMinutes', v)} />
      <Field label="Like Ratio" hint="% of ratings that are positive (thumbs up)" suffix="%" value={inputs.likeRatio} onChange={v => set('likeRatio', Math.min(100, v))} />
      <Field label="qPTR (7-day)" hint="Qualified play-through rate for the last 7 days" suffix="%" value={inputs.qptr7d} onChange={v => set('qptr7d', Math.min(100, v))} />
      <Field label="qPTR (28-day)" hint="Qualified play-through rate for the last 28 days" suffix="%" value={inputs.qptr28d} onChange={v => set('qptr28d', Math.min(100, v))} />
    </div>,

    // Step 4 — Game Info
    <div key="game" className="space-y-5">
      <SectionHeader icon={Star} title="Game Info" subtitle="Context about the game and its situation" />
      <Field label="Game Age" hint="How many months has the game been live on Roblox?" suffix="months" value={inputs.gameAgeMonths} onChange={v => set('gameAgeMonths', v)} />
      <Field label="Technical Quality" hint="Rate the codebase & game quality from 0 (disaster) to 10 (excellent)" suffix="/ 10" value={inputs.technicalQualityScore} onChange={v => set('technicalQualityScore', Math.min(10, v))} />
      <Field label="Seller Dependence %" hint="How much does the game depend on the current owner? (0 = fully autonomous, 100 = owner is everything)" suffix="%" value={inputs.sellerDependencePct} onChange={v => set('sellerDependencePct', Math.min(100, v))} />
      <Toggle label="IP / Brand Premium" hint="Does the game have recognisable IP, brand value, or strong creator brand?" value={inputs.hasIpBrand} onChange={v => set('hasIpBrand', v)} />
    </div>,
  ]

  if (showResults && result) {
    return (
      <div className="bg-black text-white min-h-screen">
        <Nav />
        <SEOMeta />
        <div className="max-w-3xl mx-auto px-6 py-28">
          <button
            onClick={() => setShowResults(false)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to inputs
          </button>
          <Results result={result} />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />
      <SEOMeta />

      <div className="max-w-3xl mx-auto px-6 py-28">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 bg-[#1e60ff]/10 border border-[#1e60ff]/20 rounded-full px-4 py-1.5 text-xs font-semibold text-[#1e60ff] uppercase tracking-wider mb-6">
            <Zap size={11} />
            Game Valuation Engine
          </div>
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
            What's your<br />game worth?
          </h1>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            Fill in your game's metrics and our valuation engine runs 26 methods — risk tiers, 5 primary models, 12 adjustment multipliers — to generate a defensible headline number.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  i === step
                    ? 'bg-[#1e60ff] text-white'
                    : i < step
                    ? 'bg-[#1e60ff]/20 text-[#1e60ff]'
                    : 'bg-white/5 text-gray-500'
                }`}
              >
                <s.icon size={11} />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 min-w-[12px] ${i < step ? 'bg-[#1e60ff]/40' : 'bg-white/8'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step card */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-7 mb-6">
          {stepContent[step]}
        </div>

        {/* Live preview while editing */}
        {result && !showResults && (
          <div className="rounded-xl border border-[#1e60ff]/20 bg-[#1e60ff]/5 p-4 flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-[#1e60ff] uppercase tracking-wider font-bold mb-1">Live Estimate</p>
              <p className="text-3xl font-medium text-white tabular-nums">{fmt(result.headline)}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${TIER_COLORS[result.riskTier]}`}>
                {result.tierLabel}
              </span>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} /> Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/8 border border-white/10 text-sm text-white hover:bg-white/12 transition-all"
            >
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={() => {
                if (inputs.revenue28d > 0) setShowResults(true)
              }}
              disabled={inputs.revenue28d <= 0}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#1e60ff] text-white font-bold text-sm hover:bg-[#004ce6] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={15} /> Run Valuation
            </button>
          )}
        </div>

        {/* Info footer */}
        <div className="mt-12 border-t border-white/6 pt-8 grid md:grid-cols-3 gap-6">
          {([
            { icon: BarChart2 as LucideIcon, title: '5 Primary Models', desc: 'Payback, Revenue Multiple, DCF, Run Rate, Trend-Weighted — blended by weight.' },
            { icon: TrendingUp as LucideIcon, title: '12 Multipliers', desc: 'Traffic risk, volatility, retention, engagement, longevity and more applied multiplicatively.' },
            { icon: Shield as LucideIcon, title: 'Downside Cap', desc: 'Max Justifiable ceiling prevents paying more than worst-case recovery can support.' },
          ] as Array<{ icon: LucideIcon; title: string; desc: string }>).map(item => (
            <div key={item.title} className="flex gap-3">
              <item.icon size={16} className="text-[#1e60ff] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
