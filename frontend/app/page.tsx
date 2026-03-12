"use client";
import WaitlistForm from "@/components/WaitlistForm";
import WalletConnect from "@/components/WalletConnect";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent-primary rounded-xl flex items-center justify-center animate-pulse-glow">
            <span className="text-bg-base font-bold text-xl">s</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            sBTC <span className="text-accent-primary">Ramp</span>
          </span>
        </div>
        <WalletConnect />
      </nav>

      {/* Hero Section */}
      <section className="section pt-20 pb-32 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-dim blur-[120px] rounded-full pointer-events-none -z-10 opacity-30"></div>

        <div className="animate-fade-up max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent-dim border-accent px-3 py-1 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
            </span>
            <span className="text-xs font-semibold text-accent-secondary uppercase tracking-widest">
              Bridging Bitcoin & Stacks
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Buy sBTC, <br />
            <span className="gradient-text">No KYC. No Hassle.</span>
          </h1>

          <p className="text-xl text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
            The simplest way to onboard to the Stacks ecosystem. Aggregate the
            best no-KYC fiat on-ramps and get sBTC delivered directly to your
            wallet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <a href="/app" className="btn-primary text-base px-8 py-4">
              🚀 Launch App
            </a>
            <a href="#waitlist" className="btn-outline text-base px-8 py-4">
              Join Waitlist
            </a>
          </div>

          <div id="waitlist">
            <WaitlistForm />
          </div>

          <p className="mt-8 text-sm text-muted">
            Launch expected Q2 2026. Join 500+ early adopters.
          </p>
        </div>
      </section>

      {/* Providers Strip */}
      <div className="border-y border-default flex flex-wrap justify-center gap-8 md:gap-16 py-10 opacity-50 grayscale hover:grayscale-0 transition-all">
        {["MoonPay", "Ramp", "Transak", "Mt Pelerin"].map((brand) => (
          <span
            key={brand}
            className="text-xl font-bold tracking-tighter text-secondary"
          >
            {brand.toUpperCase()}
          </span>
        ))}
      </div>

      {/* How it works */}
      <section className="section bg-surface/50">
        <h2 className="text-3xl font-bold text-center mb-16">
          Direct On-Ramp in{" "}
          <span className="text-accent-primary">3 Easy Steps</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Enter Amount",
              desc: "Select your fiat currency and how much sBTC you want to buy.",
              icon: "💰",
            },
            {
              step: "02",
              title: "Connect Wallet",
              desc: "Link your Leather or Xverse wallet to receive your sBTC securely.",
              icon: "🛡️",
            },
            {
              step: "03",
              title: "Get Best Quote",
              desc: "We route you to the best provider and verify your delivery on-chain.",
              icon: "🚀",
            },
          ].map((item, i) => (
            <div key={i} className="card p-8 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 font-black italic">
                {item.step}
              </div>
              <div className="text-4xl mb-6 bg-accent-dim w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 leading-tight">
              Verified Delivery, <br />
              <span className="text-accent-primary">Powered by Clarity.</span>
            </h2>
            <p className="text-secondary text-lg mb-8 leading-relaxed">
              Our unique on-chain verifier confirms sBTC receipt via smart
              contracts. Successfully verified deliveries earn you a small fee
              refund and a limited-edition badge.
            </p>
            <ul className="space-y-4">
              {[
                "No-KYC thresholds up to $2,000",
                "Real-time rate aggregation across 10+ providers",
                "Non-custodial, peer-to-peer delivery",
                "Bitcoin-secured trust",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-accent-dim rounded-full flex items-center justify-center text-[10px] text-accent-primary">
                    ✓
                  </span>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="card aspect-square flex flex-col items-center justify-center p-12 text-center animate-float overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-accent-primary/20 to-transparent"></div>
              <div className="w-32 h-32 bg-accent-primary rounded-full mb-8 flex items-center justify-center shadow-[0_0_80px_rgba(247,147,26,0.5)]">
                <span className="text-6xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">On-Chain Verifier</h3>
              <p className="text-secondary">
                Smart contract proof of delivery is live on testnet.
              </p>
              <div className="mt-8 flex gap-2">
                <span className="badge badge-accent">SIP-013 Badge</span>
                <span className="badge badge-success">Verified</span>
              </div>
            </div>
            {/* Decorative dots */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 grid grid-cols-4 gap-2 opacity-20">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-accent-primary rounded-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section pb-40">
        <div className="card bg-linear-to-r from-accent-primary/10 to-accent-secondary/5 p-16 text-center border-accent/20">
          <h2 className="text-4xl font-bold mb-6">
            Ready to skip the KYC loop?
          </h2>
          <p className="text-secondary text-xl mb-12 max-w-xl mx-auto">
            Join the waitlist to be among the first to experience friction-less
            sBTC onboarding.
          </p>
          <div className="max-w-md mx-auto">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-default py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 grayscale brightness-50">
            <div className="w-6 h-6 bg-accent-primary rounded-lg flex items-center justify-center">
              <span className="text-bg-base font-bold text-xs">s</span>
            </div>
            <span className="font-bold tracking-tight">sBTC Ramp</span>
          </div>

          <div className="flex gap-12 text-sm font-medium text-muted">
            <a href="#" className="hover:text-accent-primary transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-accent-primary transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-accent-primary transition-colors">
              Discord
            </a>
            <a href="#" className="hover:text-accent-primary transition-colors">
              Docs
            </a>
          </div>

          <p className="text-xs text-muted">
            © 2026 sBTC On-Ramp Aggregator. Open Source under MIT.
          </p>
        </div>
      </footer>
    </main>
  );
}
