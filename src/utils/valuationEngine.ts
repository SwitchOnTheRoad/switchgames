// ─── Valuation Engine ────────────────────────────────────────────────────────
// Implements the full valuation pipeline described in the Switch Games
// acquisition methodology (26 methods, 5 primary models, 12 multipliers, etc.)

export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export interface ValuationInputs {
  // Revenue (in USD)
  revenue7d: number
  revenue28d: number
  revenue90d: number
  creatorRewardsPct: number      // % of revenue from creator rewards (0-100)

  // Retention
  retentionD1: number            // 0-100
  retentionD7: number            // 0-100
  retentionD30: number           // 0-100
  longTermRetentionScore: number // 0-100 (avg week 3-8 retention %)

  // Traffic
  homeRecPct: number             // % from Home Recommendation (0-100)
  friendsPct: number
  searchPct: number

  // Engagement
  dau: number
  mau: number
  sessionMinutes: number         // avg session length
  likeRatio: number              // 0-100
  qptr7d: number                 // 0-100
  qptr28d: number                // 0-100

  // Game characteristics
  gameAgeMonths: number
  topDevProductPct: number       // % of revenue from single top product (0-100)
  hasIpBrand: boolean
  sellerDependencePct: number    // 0-100, how dependent on seller

  // Manual overrides / context
  technicalQualityScore: number  // 0-10, reviewer-assigned
}

export interface ValuationResult {
  riskTier: RiskTier
  headline: number              // The "High" estimate shown to users
  low: number
  base: number
  high: number
  maxJustifiable: number
  weightedBase: number
  adjustedBase: number
  paybackMonths: number

  // Primary models breakdown
  models: {
    payback: number
    revenueMultiple: number
    dcf: number
    runRate28d: number
    trendWeighted: number
  }

  // Multipliers breakdown
  multipliers: {
    trafficSourceRisk: number
    volatility: number
    growthMomentum: number
    engagement: number
    retentionDurability: number
    longTermRetention: number
    concentration: number
    genreDurability: number    // default neutral - no genre input
    technicalQuality: number
    sellerIndependence: number
    ipBrand: number
    longevity: number
  }

  // Confidence & flags
  dataCompleteness: number       // 0-1
  anomalyFlags: string[]
  tierLabel: string
  confidenceLabel: string

  // Supporting signals
  stickiness: number             // DAU/MAU
  pricePerDau: number
  pricePerCcu: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

// Coefficient of variation of [7d, 28d, 90d] annualised daily rates
function calcVolatilityCV(r7: number, r28: number, r90: number): number {
  const d7 = r7 / 7
  const d28 = r28 / 28
  const d90 = r90 / 90
  const mean = (d7 + d28 + d90) / 3
  if (mean === 0) return 1
  const variance = ((d7 - mean) ** 2 + (d28 - mean) ** 2 + (d90 - mean) ** 2) / 3
  return Math.sqrt(variance) / mean
}

// Observed decay: compare 7d run-rate to 28d run-rate
function observedDecay(r7: number, r28: number): number {
  const rate7 = r7 / 7
  const rate28 = r28 / 28
  if (rate28 === 0) return 1
  return clamp(rate7 / rate28, 0.3, 1.5)
}

// ─── Step 1: Risk Tier ───────────────────────────────────────────────────────

export function inferRiskTier(inputs: ValuationInputs): RiskTier {
  let score = 0 // higher = worse

  // D7 retention
  if (inputs.retentionD7 >= 30) score += 0
  else if (inputs.retentionD7 >= 20) score += 1
  else if (inputs.retentionD7 >= 10) score += 2
  else score += 3

  // Home Rec dependence
  if (inputs.homeRecPct < 30) score += 0
  else if (inputs.homeRecPct < 50) score += 1
  else if (inputs.homeRecPct < 70) score += 2
  else score += 3

  // 7d vs 28d revenue trend
  const decay = observedDecay(inputs.revenue7d, inputs.revenue28d)
  if (decay >= 1.0) score += 0
  else if (decay >= 0.85) score += 1
  else if (decay >= 0.65) score += 2
  else score += 3

  if (score <= 1) return 'LOW'
  if (score <= 3) return 'MODERATE'
  if (score <= 5) return 'HIGH'
  return 'CRITICAL'
}

// ─── Step 2: Primary Models ──────────────────────────────────────────────────

const TIER_PARAMS = {
  LOW:      { targetMonths: 9,  riskFactor: 1.00, multipleBase: 9,  multipleLow: 6,  multipleHigh: 12, monthlyDecay: 0.95, worstRetention: 0.65 },
  MODERATE: { targetMonths: 6,  riskFactor: 0.85, multipleBase: 6,  multipleLow: 4,  multipleHigh: 9,  monthlyDecay: 0.88, worstRetention: 0.45 },
  HIGH:     { targetMonths: 4,  riskFactor: 0.65, multipleBase: 4,  multipleLow: 2.5, multipleHigh: 6, monthlyDecay: 0.78, worstRetention: 0.30 },
  CRITICAL: { targetMonths: 3,  riskFactor: 0.50, multipleBase: 3,  multipleLow: 2,  multipleHigh: 4,  monthlyDecay: 0.65, worstRetention: 0.20 },
}

const MONTHLY_OPEX = 500  // USD

function calcPayback(inputs: ValuationInputs, tier: RiskTier) {
  const p = TIER_PARAMS[tier]
  const monthly28 = (inputs.revenue28d / 28) * 30.4
  const monthlyProfit = Math.max(0, monthly28 - MONTHLY_OPEX)
  return monthlyProfit * p.targetMonths * p.riskFactor
}

function calcRevenueMultiple(inputs: ValuationInputs, tier: RiskTier) {
  const p = TIER_PARAMS[tier]
  const monthly28 = (inputs.revenue28d / 28) * 30.4
  return monthly28 * p.multipleBase
}

function calcDcf(inputs: ValuationInputs, tier: RiskTier): number {
  const p = TIER_PARAMS[tier]
  const monthly28 = (inputs.revenue28d / 28) * 30.4
  const monthlyProfit = Math.max(0, monthly28 - MONTHLY_OPEX)
  const obs = observedDecay(inputs.revenue7d, inputs.revenue28d)
  // Blend: use worse of tier default and observed
  const blendedDecay = Math.min(p.monthlyDecay, (p.monthlyDecay + obs) / 2)
  const r = 0.015
  let dcf = 0
  for (let t = 1; t <= 18; t++) {
    const projectedProfit = monthlyProfit * Math.pow(blendedDecay, t)
    dcf += projectedProfit / Math.pow(1 + r, t)
  }
  return dcf
}

function calcRunRate28d(inputs: ValuationInputs, tier: RiskTier): number {
  const p = TIER_PARAMS[tier]
  const monthly28 = (inputs.revenue28d / 28) * 30.4
  return monthly28 * 12 * (p.multipleBase / 12)
}

function calcTrendWeighted(inputs: ValuationInputs, tier: RiskTier): number {
  const p = TIER_PARAMS[tier]
  const daily7 = inputs.revenue7d / 7
  const daily28 = inputs.revenue28d / 28
  const daily90 = inputs.revenue90d > 0 ? inputs.revenue90d / 90 : daily28
  const blended = daily7 * 0.45 + daily28 * 0.40 + daily90 * 0.15
  const monthly = blended * 30.4
  return monthly * p.multipleBase
}

function calcWorstCase(inputs: ValuationInputs, tier: RiskTier): number {
  const p = TIER_PARAMS[tier]
  const monthly28 = (inputs.revenue28d / 28) * 30.4
  const monthlyProfit = Math.max(0, monthly28 - MONTHLY_OPEX)
  return monthlyProfit * p.worstRetention * 12
}

// ─── Step 3: Adjustment Multipliers ─────────────────────────────────────────

function trafficSourceRisk(inputs: ValuationInputs): number {
  const homeRec = inputs.homeRecPct / 100
  const organic = (inputs.friendsPct + inputs.searchPct) / 100
  let m = 1.0
  if (homeRec > 0.6) m -= 0.25
  else if (homeRec > 0.4) m -= 0.15
  m += organic * 0.2
  return clamp(m, 0.65, 1.25)
}

function volatilityMultiplier(inputs: ValuationInputs): number {
  const cv = calcVolatilityCV(inputs.revenue7d, inputs.revenue28d, inputs.revenue90d)
  if (cv < 0.2) return 1.0
  if (cv < 0.4) return 0.90
  if (cv < 0.6) return 0.80
  if (cv < 0.8) return 0.70
  return 0.60
}

function growthMomentum(inputs: ValuationInputs): number {
  const decay = observedDecay(inputs.revenue7d, inputs.revenue28d)
  if (decay >= 1.25) return 1.50
  if (decay >= 1.10) return 1.25
  if (decay >= 0.95) return 1.00
  if (decay >= 0.80) return 0.85
  if (decay >= 0.65) return 0.70
  return 0.60
}

function engagementMultiplier(inputs: ValuationInputs): number {
  const qptrAvg = (inputs.qptr7d + inputs.qptr28d) / 2
  const qptrScore = clamp(qptrAvg / 60, 0, 1)   // 60% qPTR = neutral
  const sessionScore = clamp(inputs.sessionMinutes / 20, 0, 1) // 20min = neutral
  const stickiness = inputs.mau > 0 ? inputs.dau / inputs.mau : 0
  const stickinessScore = clamp(stickiness / 0.3, 0, 1)
  const likeScore = clamp(inputs.likeRatio / 70, 0, 1)
  const composite = qptrScore * 0.35 + sessionScore * 0.30 + stickinessScore * 0.25 + likeScore * 0.10
  return clamp(0.70 + composite * 0.60, 0.70, 1.30)
}

function retentionDurability(inputs: ValuationInputs): number {
  // Score against rough Roblox benchmarks: D1~35%, D7~20%, D30~10%
  const d1Score = clamp(inputs.retentionD1 / 35, 0.5, 1.5)
  const d7Score = clamp(inputs.retentionD7 / 20, 0.5, 1.5)
  const d30Score = clamp(inputs.retentionD30 / 10, 0.5, 1.5)
  const avg = (d1Score * 0.25 + d7Score * 0.50 + d30Score * 0.25)
  return clamp(avg, 0.60, 1.40)
}

function longTermRetentionMultiplier(inputs: ValuationInputs): number {
  if (inputs.longTermRetentionScore <= 0) return 1.0 // neutral if no data
  // benchmark ~8% week 3-8
  const score = clamp(inputs.longTermRetentionScore / 8, 0.5, 1.8)
  return clamp(score, 0.55, 1.55)
}

function concentrationMultiplier(inputs: ValuationInputs): number {
  const devPct = inputs.topDevProductPct / 100
  const homePct = inputs.homeRecPct / 100
  let m = 1.0
  if (devPct > 0.8) m -= 0.20
  else if (devPct > 0.6) m -= 0.10
  if (homePct > 0.6) m -= 0.10
  return clamp(m, 0.70, 1.00)
}

function technicalQualityMultiplier(inputs: ValuationInputs): number {
  // 0-10 scale: 5 = neutral
  const score = clamp(inputs.technicalQualityScore / 10, 0, 1)
  return clamp(0.50 + score * 0.60, 0.50, 1.10)
}

function sellerIndependenceMultiplier(inputs: ValuationInputs): number {
  const dep = inputs.sellerDependencePct / 100
  return clamp(1.10 - dep * 0.50, 0.60, 1.10)
}

function ipBrandMultiplier(inputs: ValuationInputs): number {
  return inputs.hasIpBrand ? 1.20 : 1.00
}

function longevityMultiplier(inputs: ValuationInputs): number {
  const months = inputs.gameAgeMonths
  if (months < 1) return 0.70
  if (months < 3) return 0.80
  if (months < 6) return 0.90
  if (months < 12) return 1.00
  if (months < 24) return 1.20
  if (months < 48) return 1.50
  if (months < 72) return 1.80
  return 2.20
}

// ─── Anomaly Flags ───────────────────────────────────────────────────────────

function getAnomalyFlags(inputs: ValuationInputs, tier: RiskTier): string[] {
  const flags: string[] = []
  const daily28 = inputs.revenue28d / 28
  if (daily28 * 0.0038 < 4.94) flags.push('Revenue below noise floor — estimates may be imprecise')
  if (inputs.homeRecPct > 60) flags.push('High Home Recommendation dependency (>60%) — traffic concentration risk')
  if (inputs.retentionD7 < 10) flags.push('D7 retention critically low (<10%) — audience not returning')
  if (inputs.creatorRewardsPct > 50) flags.push('Creator Rewards >50% of revenue — platform policy risk')
  if (inputs.topDevProductPct > 80) flags.push('Top dev product >80% of revenue — monetisation concentration risk')
  const decay = observedDecay(inputs.revenue7d, inputs.revenue28d)
  if (decay < 0.70) flags.push('Sharp recent revenue decline — possible trend game or algorithm drop')
  const cv = calcVolatilityCV(inputs.revenue7d, inputs.revenue28d, inputs.revenue90d)
  if (cv > 0.6) flags.push('High revenue volatility — unstable earnings pattern')
  if (tier === 'CRITICAL') flags.push('Critical risk tier — deal requires heavy structuring or passing')
  return flags
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

export function runValuationEngine(inputs: ValuationInputs): ValuationResult {
  const tier = inferRiskTier(inputs)

  // Primary models
  const payback = Math.max(0, calcPayback(inputs, tier))
  const revenueMultiple = Math.max(0, calcRevenueMultiple(inputs, tier))
  const dcf = Math.max(0, calcDcf(inputs, tier))
  const runRate = Math.max(0, calcRunRate28d(inputs, tier))
  const trend = Math.max(0, calcTrendWeighted(inputs, tier))
  const worstCase = Math.max(0, calcWorstCase(inputs, tier))

  const weightedBase =
    payback * 0.32 +
    revenueMultiple * 0.22 +
    dcf * 0.22 +
    runRate * 0.17 +
    trend * 0.07

  // Multipliers
  const mTraffic = trafficSourceRisk(inputs)
  const mVolatility = volatilityMultiplier(inputs)
  const mGrowth = growthMomentum(inputs)
  const mEngagement = engagementMultiplier(inputs)
  const mRetention = retentionDurability(inputs)
  const mLongTerm = longTermRetentionMultiplier(inputs)
  const mConcentration = concentrationMultiplier(inputs)
  const mGenre = 1.0   // neutral — no genre input
  const mTech = technicalQualityMultiplier(inputs)
  const mSeller = sellerIndependenceMultiplier(inputs)
  const mIp = ipBrandMultiplier(inputs)
  const mLongevity = longevityMultiplier(inputs)

  const allMult =
    mTraffic * mVolatility * mGrowth * mEngagement *
    mRetention * mLongTerm * mConcentration * mGenre *
    mTech * mSeller * mIp * mLongevity

  const adjustedBase = weightedBase * allMult

  // Band
  const low = adjustedBase * 0.70
  const base = adjustedBase
  const high = adjustedBase * 1.15
  const maxJustifiable = Math.min(high, worstCase * 1.25)

  // Supporting
  const stickiness = inputs.mau > 0 ? inputs.dau / inputs.mau : 0
  const monthly28 = (inputs.revenue28d / 28) * 30.4
  const pricePerDau = inputs.dau > 0 ? Math.min(high, (monthly28 * 12) / inputs.dau) : 0
  const ccu = inputs.dau * 0.05 // rough CCU estimate if not provided
  const pricePerCcu = ccu > 0 ? Math.min(high, (monthly28 * 12) / ccu) : 0

  const paybackMonths = (monthly28 - MONTHLY_OPEX) > 0
    ? high / (monthly28 - MONTHLY_OPEX)
    : 999

  // Data completeness — count non-zero meaningful fields
  const fields = [
    inputs.revenue7d, inputs.revenue28d, inputs.revenue90d,
    inputs.retentionD1, inputs.retentionD7, inputs.retentionD30,
    inputs.dau, inputs.mau, inputs.sessionMinutes, inputs.qptr7d,
    inputs.gameAgeMonths,
  ]
  const dataCompleteness = fields.filter(f => f > 0).length / fields.length

  // Tier label
  const tierLabel =
    tier === 'LOW' ? 'Top-Tier Game' :
    tier === 'MODERATE' ? 'Mid-Tier Game' :
    tier === 'HIGH' ? 'High-Risk Asset' :
    'Critical-Risk Asset'

  const confidenceLabel =
    dataCompleteness >= 0.9 ? 'High Confidence' :
    dataCompleteness >= 0.7 ? 'Moderate Confidence' :
    'Low Confidence — fill in more data'

  return {
    riskTier: tier,
    headline: Math.max(0, maxJustifiable),
    low: Math.max(0, low),
    base: Math.max(0, base),
    high: Math.max(0, high),
    maxJustifiable: Math.max(0, maxJustifiable),
    weightedBase: Math.max(0, weightedBase),
    adjustedBase: Math.max(0, adjustedBase),
    paybackMonths,
    models: { payback, revenueMultiple, dcf, runRate28d: runRate, trendWeighted: trend },
    multipliers: {
      trafficSourceRisk: mTraffic,
      volatility: mVolatility,
      growthMomentum: mGrowth,
      engagement: mEngagement,
      retentionDurability: mRetention,
      longTermRetention: mLongTerm,
      concentration: mConcentration,
      genreDurability: mGenre,
      technicalQuality: mTech,
      sellerIndependence: mSeller,
      ipBrand: mIp,
      longevity: mLongevity,
    },
    dataCompleteness,
    anomalyFlags: getAnomalyFlags(inputs, tier),
    tierLabel,
    confidenceLabel,
    stickiness,
    pricePerDau,
    pricePerCcu,
  }
}
