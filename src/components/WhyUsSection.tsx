import React from 'react'
import { Link } from 'react-router-dom'
import SectionReveal from './SectionReveal'

interface WhyUsSectionProps {
  companyName?: string
  peakCcu?: string
  ccuGrowth?: string
  engagementIncrease?: string
  className?: string
}

export default function WhyUsSection({
  companyName = 'The Block',
  peakCcu = '20K',
  ccuGrowth = '15',
  engagementIncrease = '40',
  className = '',
}: WhyUsSectionProps) {
  // Extract number and suffix if needed
  const ccuNum = peakCcu.replace(/[^0-9.]/g, '')
  const ccuSuffix = peakCcu.replace(/[0-9.]/g, '') || 'K'

  return (
    <section className={`py-16 md:py-28 px-6 md:px-12 lg:px-16 relative z-10 ${className}`}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* ── Left Content Column ── */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <SectionReveal delay={60}>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading text-white uppercase tracking-tight mb-8 leading-[1.02]"
              style={{ letterSpacing: '-0.035em' }}
            >
              Why {companyName}?
            </h2>
          </SectionReveal>

          <SectionReveal delay={120}>
            <div className="space-y-1 mb-8">
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading text-white tracking-tight leading-snug">
                We partner with ambitious creators.
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading text-white tracking-tight leading-snug">
                We scale <span className="text-[#3B82F6]">great games.</span>
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading text-white tracking-tight leading-snug">
                The results speak for themselves.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={180}>
            <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed mb-10 max-w-xl">
              {companyName} partners with promising Roblox games and gives them the resources, strategy and development support needed to reach their full potential. From stronger updates and live operations to marketing and long-term growth, we work alongside creators to turn great experiences into games built to last.
            </p>
          </SectionReveal>

          <SectionReveal delay={240}>
            <div>
              <Link to="/contact">
                <button className="bg-[#15161b] text-white border border-white/15 hover:bg-white/10 hover:border-white/25 px-8 py-3.5 rounded-xl font-heading font-semibold text-sm tracking-wide transition-all duration-200 shadow-lg">
                  Partner With Us
                </button>
              </Link>
            </div>
          </SectionReveal>
        </div>

        {/* ── Right Metric Grid ── */}
        <div className="lg:col-span-6">
          <SectionReveal delay={150}>
            <div className="rounded-3xl bg-[#101115] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-2">
              
              {/* Extended Top Row: Peak CCU */}
              <div className="col-span-2 p-8 sm:p-10 md:p-12 border-b border-white/[0.07] flex flex-col justify-center">
                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold font-heading text-white tracking-tight">
                  {ccuNum}<span className="text-[#3B82F6]">{ccuSuffix}</span>
                </div>
                <p className="text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.2em] text-gray-400 font-bold mt-3.5">
                  Peak Concurrent Players
                </p>
              </div>

              {/* Bottom Left: CCU Growth */}
              <div className="p-7 sm:p-9 md:p-11 border-r border-white/[0.07] flex flex-col justify-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-heading text-white tracking-tight">
                  {ccuGrowth}<span className="text-[#3B82F6]">×</span>
                </div>
                <p className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.18em] text-gray-400 font-bold mt-3.5">
                  CCU Growth Achieved
                </p>
              </div>

              {/* Bottom Right: Engagement Increase */}
              <div className="p-7 sm:p-9 md:p-11 flex flex-col justify-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-heading text-white tracking-tight">
                  {engagementIncrease}<span className="text-[#3B82F6]">%</span>
                </div>
                <p className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.18em] text-gray-400 font-bold mt-3.5">
                  Engagement Increase
                </p>
              </div>

            </div>
          </SectionReveal>
        </div>

      </div>
    </section>
  )
}
