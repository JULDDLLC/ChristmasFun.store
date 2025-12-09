import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
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
            <h1 className="text-5xl font-serif text-white mb-8">Terms of Service</h1>
            <p className="text-white/60 text-sm mb-12">Last Updated: December 7, 2024</p>

            <div className="space-y-8 text-white/80">
              <section>
                <h2 className="text-2xl font-serif text-white mb-4">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing and using ChristmasFun.store (the "Site"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use this Site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">2. Use License</h2>
                <p className="leading-relaxed mb-4">
                  Permission is granted to download and print materials from ChristmasFun.store for personal, non-commercial use only. This license shall automatically terminate if you violate any of these restrictions.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Personal use includes printing for your own household and family</li>
                  <li>Teacher License holders may print unlimited copies for their classroom use</li>
                  <li>You may not modify or copy the materials</li>
                  <li>You may not use the materials for any commercial purpose</li>
                  <li>You may not redistribute or resell digital files</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">3. Digital Products</h2>
                <p className="leading-relaxed mb-4">
                  All purchases are for digital products delivered via email. No physical products will be shipped.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Digital downloads are delivered instantly upon payment confirmation</li>
                  <li>Files are provided in PDF format optimized for 8.5" x 11" printing</li>
                  <li>You are responsible for downloading and saving your files</li>
                  <li>Download links are valid for 30 days after purchase</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">4. Refund Policy</h2>
                <p className="leading-relaxed">
                  Due to the digital nature of our products, all sales are final. No refunds will be provided after files have been downloaded. If you experience technical issues with your download, please contact us at ChristmasMagicDesigns@juldd.com within 7 days of purchase.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">5. Intellectual Property</h2>
                <p className="leading-relaxed">
                  All content on this Site, including designs, text, graphics, and logos, is the property of JULDD and is protected by copyright laws. Unauthorized use of any materials may violate copyright, trademark, and other laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">6. Prohibited Uses</h2>
                <p className="leading-relaxed mb-4">You may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Resell, redistribute, or share digital files</li>
                  <li>Claim our designs as your own work</li>
                  <li>Use designs for commercial purposes without proper licensing</li>
                  <li>Remove watermarks or copyright information from files</li>
                  <li>Upload designs to print-on-demand services or file-sharing sites</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">7. Teacher License</h2>
                <p className="leading-relaxed">
                  The Teacher License grants educators the right to print unlimited copies of purchased designs for use within their own classroom. The license does not permit sharing digital files with other teachers or schools.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">8. Disclaimer</h2>
                <p className="leading-relaxed">
                  The materials on ChristmasMagicDesigns.com are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">9. Limitations</h2>
                <p className="leading-relaxed">
                  In no event shall JULDD or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on ChristmasMagicDesigns.com.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">10. Modifications</h2>
                <p className="leading-relaxed">
                  JULDD may revise these terms of service at any time without notice. By using this Site you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif text-white mb-4">11. Contact Information</h2>
                <p className="leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                  <br />
                  <a href="mailto:ChristmasMagicDesigns@juldd.com" className="text-amber-300 hover:text-amber-400 transition-colors">
                    ChristmasMagicDesigns@juldd.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
