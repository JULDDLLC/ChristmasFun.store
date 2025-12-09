import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo_(2).png" alt="JULDD" className="h-12 w-auto" />
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/90 hover:text-amber-300 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
            <h1 className="text-5xl font-serif text-white mb-8">Privacy Policy</h1>
            <p className="text-white/60 text-sm mb-12">Last Updated: December 7, 2024</p>

            <div className="space-y-8 text-white/80">
              <section>
                <h2 className="text-2xl font-serif text-white mb-4">1. Introduction</h2>
                <p className="leading-relaxed">
                  JULDD ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit ChristmasMagicDesigns.com.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">2. Information We Collect</h2>
                <p className="leading-relaxed mb-4">We collect the following types of information:</p>

                <h3 className="text-xl text-white mb-3 mt-4">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email address (provided when making a purchase or subscribing to free content)</li>
                  <li>Payment information (processed securely through Stripe - we do not store credit card details)</li>
                  <li>Name (if provided during checkout)</li>
                </ul>

                <h3 className="text-xl text-white mb-3 mt-4">Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website addresses</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">3. How We Use Your Information</h2>
                <p className="leading-relaxed mb-4">We use your information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>To process and deliver your digital product purchases</li>
                  <li>To send you download links and purchase confirmations</li>
                  <li>To provide customer support and respond to your inquiries</li>
                  <li>To send promotional emails about new products (you can opt-out anytime)</li>
                  <li>To improve our website and customer experience</li>
                  <li>To prevent fraud and ensure website security</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">4. Information Sharing</h2>
                <p className="leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information with:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Payment Processors:</strong> Stripe processes all payments securely</li>
                  <li><strong>Email Service Providers:</strong> To send product deliveries and communications</li>
                  <li><strong>Analytics Services:</strong> To understand how our site is used (anonymized data)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">5. Cookies and Tracking</h2>
                <p className="leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your experience. Cookies are small files stored on your device. We use:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                  <li><strong>Analytics Cookies:</strong> To understand site usage and improve performance</li>
                  <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  You can control cookies through your browser settings, but disabling them may affect site functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">6. Data Security</h2>
                <p className="leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">7. Data Retention</h2>
                <p className="leading-relaxed">
                  We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Purchase records are retained for tax and accounting purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">8. Your Rights</h2>
                <p className="leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Request data portability</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  To exercise these rights, please contact us at ChristmasMagicDesigns@juldd.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">9. Children's Privacy</h2>
                <p className="leading-relaxed">
                  Our website is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">10. Third-Party Links</h2>
                <p className="leading-relaxed">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">11. International Data Transfers</h2>
                <p className="leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in compliance with applicable laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">12. Email Communications</h2>
                <p className="leading-relaxed">
                  By providing your email address, you consent to receive:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Transactional emails (order confirmations, download links)</li>
                  <li>Marketing emails about new products and promotions</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  You can unsubscribe from marketing emails at any time by clicking the unsubscribe link in any email.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">13. Changes to This Policy</h2>
                <p className="leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">14. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
                  <br />
                  <a href="mailto:ChristmasMagicDesigns@juldd.com" className="text-amber-300 hover:text-amber-400 transition-colors">
                    ChristmasMagicDesigns@juldd.com
                  </a>
                </p>
              </section>

              <section className="pt-8 border-t border-white/10">
                <p className="text-sm text-white/60 leading-relaxed">
                  By using ChristmasMagicDesigns.com, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
