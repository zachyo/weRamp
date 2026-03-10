Problem 1: High Minimum Purchase Amounts
Current Issue: Providers like MoonPay/Ramp/Transak/Mt Pelerin have mins of $10-50 (per 2026 docs/searches). This limits micro-purchases (<$10-20), reducing accessibility for testing/onboarding in emerging markets or low-stake users.
Solutions & Fixes:

Primary Fix: Integrate Low-Min Providers
Add Paybis (no-KYC up to $1k; mins as low as $1-5 per searches; supports cards/bank).
Steps:
Sign up for Paybis API: https://paybis.com/developers (free dev access).
Backend: Add to aggregation logic – new endpoint in Node.js to ping Paybis rates (use Axios for API calls; rank by fee/min).
Frontend: Update quote display to include Paybis if amount < current mins; embed widget if selected.
Test: Simulate $5 buy → sBTC delivery + Clarity verification.

Add NexaPay (no-KYC; mins $1-10; 1-3% fees; card/Apple Pay).
Steps:
API: https://nexapay.one/developers (quick setup <60s).
Backend: Integrate createOrder API; filter for low-amount eligibility.
Frontend: Add to provider selector; handle non-custodial flow.
Test: $2-5 purchases.

Add Changelly (no KYC under $150; mins ~$1; fiat-to-crypto).
Steps:
API: https://changelly.com/developers (supports low thresholds).
Backend/Frontend as above.

Secondary Fix: Aggregation Enhancements
Update backend ranking algorithm: If user amount < provider min (e.g., $20), auto-filter/exclude and show warning ("Amount too low for X; try Y or increase to $20").
Add P2P fallback for <$10: Integrate simple Binance P2P or Bybit P2P API (low/no mins; no KYC for small).
Steps: Backend – add P2P quote fetch; warn on UX friction.

Validation: Post-update, test E2E with $5-10 amounts; monitor for failures. Update landing page to highlight "Micro-purchases from $1".
Resources: Web searches confirm 2026 lows (e.g., Paybis/Changelly docs); no new deps needed.

Problem 2: Add NGN Support
Current Issue: Existing providers (MoonPay/Ramp/Transak/Mt Pelerin) have spotty NGN support per 2026 docs (e.g., MoonPay/Transak may via third-party, but inconsistent; Ramp/Mt Pelerin no direct NGN).
Solutions & Fixes:

Primary Fix: Integrate NGN-Specialized Providers
Add Yellowcard (Africa/Nigeria-focused; NGN support; low KYC <$500; mins $5-10).
Steps:
API: https://developers.yellowcard.io (sign up; supports NGN bank/mobile money).
Backend: Add to aggregator – fetch NGN quotes; convert to sBTC via bridge.
Frontend: Add currency selector for NGN; embed Yellowcard widget.
Test: NGN → sBTC flow + Clarity verification.

Add Onramp Money (supports NGN/Nigeria; low KYC; mins $10; UPI/PIX-like for Africa).
Steps:
API: https://onramp.money/developers (480+ tokens; NGN rails).
Backend/Frontend as above; auto-route for NGN users.
Test: Simulate NGN purchase.

Secondary Fix: Use Aggregator for Coverage
Integrate Onramper (meta-aggregator; includes Yellowcard/LocalRamp/Onramp Money for Nigeria; 8+ NGN ramps; low KYC for small).
Steps:
API: https://www.onramper.com/developers (14-day free trial; smart routing).
Backend: Replace/redundant to current aggregation – call Onramper for NGN queries.
Frontend: Update input to include NGN; show aggregated options.
Test: Full flow.

Enhancements: In UI, detect user location (optional geo-IP) to suggest NGN; add compliance warning for Nigeria (CBN cautions but allows).
Validation: Test with NGN amounts; aim for <5min delivery. Update docs/README with NGN support.
Resources: 2026 searches confirm (e.g., Onramper/Yellowcard for Nigeria); check CBN regs via quick web search if needed.

Implementation Notes

Timeline: 1-2 weeks (Milestone 2/3 overlap).
Security/Compliance: Stick to no/low-KYC; add disclaimers ("NGN limits per Nigerian regs").
Testing: Use test APIs; simulate with small real funds.
Community: Post progress in Ascent forum/X for feedback.
If Issues: If APIs change, fallback to P2P like Binance for NGN/low mins.
