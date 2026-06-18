import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import SectionReveal from '../components/SectionReveal'

export default function TermsPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <SEOMeta title="Terms and Conditions" description="Terms and conditions for using Switch services." />
      <Nav />

      <section className="pt-40 pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <p className="text-xs tracking-widest uppercase text-gray-300 mb-3">Legal</p>
            <h1 className="text-4xl md:text-5xl font-normal mb-10" style={{ letterSpacing: '-0.03em' }}>Terms and Conditions</h1>
          </SectionReveal>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <SectionReveal delay={100}>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using playswitchgames.com and our related services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </SectionReveal>

            <SectionReveal delay={150}>
              <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p>
                Switch is a UGC game development studio that builds experiences on platforms like Roblox. We provide information about our games, studio updates, and live-ops services.
              </p>
            </SectionReveal>

            <SectionReveal delay={200}>
              <h2 className="text-xl font-semibold text-white mb-4">3. Intellectual Property</h2>
              <p>
                All content on this website, including but not limited to text, graphics, logos, and code, is the property of Switch or its content suppliers and is protected by international copyright laws.
              </p>
            </SectionReveal>

            <SectionReveal delay={250}>
              <h2 className="text-xl font-semibold text-white mb-4">4. User Conduct</h2>
              <p>
                Users agree not to use the site for any unlawful purpose or any purpose prohibited under these terms. You agree not to use the site in any way that could damage, disable, or impair the site.
              </p>
            </SectionReveal>

            <SectionReveal delay={300}>
              <h2 className="text-xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
              <p>
                Switch shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
              </p>
            </SectionReveal>

            <SectionReveal delay={350}>
              <h2 className="text-xl font-semibold text-white mb-4">6. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the site after changes are posted constitutes your acceptance of the modified terms.
              </p>
            </SectionReveal>

            <SectionReveal delay={400}>
              <p className="text-sm pt-8 border-top border-white/10">
                Last updated: May 8, 2026
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
