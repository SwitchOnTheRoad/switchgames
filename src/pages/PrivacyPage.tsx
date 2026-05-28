import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import SectionReveal from '../components/SectionReveal'

export default function PrivacyPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <SEOMeta title="Privacy Policy" description="Privacy policy for Switch services." />
      <Nav />

      <section className="pt-40 pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <p className="text-xs tracking-widest uppercase text-gray-300 mb-3">Legal</p>
            <h1 className="text-4xl md:text-5xl font-normal mb-10" style={{ letterSpacing: '-0.03em' }}>Privacy Policy</h1>
          </SectionReveal>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <SectionReveal delay={100}>
              <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p>
                We may collect personal information such as your name and email address when you sign up for our newsletter or contact us via our website forms.
              </p>
            </SectionReveal>

            <SectionReveal delay={150}>
              <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Information</h2>
              <p>
                We use the information we collect to communicate with you, provide our services, and improve our website performance. We do not sell your personal information to third parties.
              </p>
            </SectionReveal>

            <SectionReveal delay={200}>
              <h2 className="text-xl font-semibold text-white mb-4">3. Cookies</h2>
              <p>
                Our website uses cookies to enhance user experience and analyze site traffic. You can choose to disable cookies through your browser settings.
              </p>
            </SectionReveal>

            <SectionReveal delay={250}>
              <h2 className="text-xl font-semibold text-white mb-4">4. Third-Party Services</h2>
              <p>
                We may use third-party services like Google Analytics to understand how visitors interact with our site. These services have their own privacy policies.
              </p>
            </SectionReveal>

            <SectionReveal delay={300}>
              <h2 className="text-xl font-semibold text-white mb-4">5. Security</h2>
              <p>
                We take reasonable measures to protect your personal information from unauthorized access or disclosure.
              </p>
            </SectionReveal>

            <SectionReveal delay={350}>
              <h2 className="text-xl font-semibold text-white mb-4">6. Contact Us</h2>
              <p>
                If you have any questions about our Privacy Policy, please contact us at hello@playswitchgames.com.
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
