# No-KYC Fiat → sBTC On-Ramp Aggregator: Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** March 05, 2026  
**Author:** Grok (Based on chat discussions)  
**Purpose:** This PRD outlines the requirements for building a production-ready MVP of the No-KYC Fiat → sBTC On-Ramp Aggregator. The MVP focuses on aggregating low/no-KYC fiat on-ramp providers to enable seamless, real-time fiat purchases routed directly to users' Stacks wallets as sBTC. It leverages Stacks' Bitcoin-secured ecosystem, with optional Clarity smart contracts for verification. The structure is milestone-based for agent-led development, emphasizing iterative builds, validation, and open-source principles per Ascent checklist.

## 1. Overview

### Product Description

The No-KYC Fiat → sBTC On-Ramp Aggregator is a web-based application that simplifies onboarding to the Stacks/sBTC ecosystem. Users select a fiat amount and currency, connect their Stacks wallet, and the app aggregates real-time quotes from multiple no/low-KYC on-ramp providers (e.g., MoonPay, Ramp Network, Transak, Mt Pelerin). It selects/routes to the best (cheapest, fastest, most reliable) provider, completing the purchase directly to the user's wallet as sBTC (via bridge if needed).

Core value: Reduces friction in buying sBTC without mandatory KYC for small amounts, addressing complaints in Stacks communities (e.g., X threads on cumbersome CEX → bridge flows). MVP targets small purchases (<$2,000) where no-KYC thresholds apply, with fallbacks for KYC-required providers.

Web app aggregating no/low-KYC fiat on-ramps (MoonPay, Ramp, Transak, Mt Pelerin, etc.) for direct fiat → sBTC purchases. Users input fiat details, connect Stacks wallet, get real-time quotes, complete purchase via provider widget/SDK → sBTC delivered. New core feature: Post-purchase, users trigger an on-chain Clarity Delivery Verifier contract to confirm sBTC receipt (via user-submitted proof or oracle hook), unlocking a small refund, verification badge (NFT), or future incentives. This adds Bitcoin-secured trust and creates a reusable primitive for ecosystem tools.

### Goals

- Solve real problem: Fragmented, unreliable fiat entry to sBTC (e.g., CEX withdrawals + bridges).
- Unlock value: One-click fiat to sBTC, leveraging Bitcoin security.
- Ecosystem contribution: Open-source tool for Stacks builders; composable API/widget.
- MVP Scope: Functional aggregator with 3-5 providers, basic UI, wallet integration, and real-time routing.
- Production-ready means secure, scalable, with monitoring.
- Deliver seamless fiat onboarding while contributing an original Clarity primitive for verifiable sBTC deliveries.
- Achieve Ascent "exceptional" status: Full on/off-chain integration, complex contract logic, ecosystem contribution (verifiable on-ramps).
- MVP Scope: Aggregator + Clarity verifier contract (deployed to mainnet/testnet), functional end-to-end flow.

### Assumptions & Risky Validations (From Ascent Process)

- Riskiest: Users prefer aggregated no-KYC options over direct CEX (validate via landing page signups/conversion >10%).
- Assumption: Providers' APIs allow no-KYC for <$1,000-2,000 (per research; e.g., EU/US thresholds).
- Other: sBTC bridge (e.g., via Stacks peg) is reliable; users have Stacks wallets.
  Riskiest (enhanced): Users value on-chain verification for trust in no-KYC ramps (test via landing page: "Would you use verified sBTC buys?" conversion >15%).
  Assumption: sBTC peg/bridge allows verifiable on-chain checks (e.g., via transaction proofs or future oracle integrations).
  Other: Providers deliver BTC/STX reliably for bridging to sBTC.

## 2. Problem Statement

- **Core Problem:** Buying sBTC requires multi-step processes (fiat → CEX → BTC/STX withdrawal → Stacks deposit → sBTC mint), often with KYC, high fees, delays, or failures. No unified, low-friction no-KYC entry exists for Stacks, leading to user drop-off (evidenced by X/Reddit complaints like "how to buy sBTC without KYC" with 100s of engagements).
- **Impact:** Limits Stacks adoption; Bitcoin holders miss DeFi/yield opportunities.
- **Market Evidence:** Similar aggregators (e.g., Moonshot on Solana) see high volume; Stacks forum threads (e.g., credit card on-ramps for sBTC) show demand for MoonPay/Coinbase integrations without "KYC loops."

## 3. Target Users & Personas

- **Primary Users:** Bitcoin/Stacks enthusiasts, DeFi users, newcomers to sBTC (e.g., wanting BTC yield without selling).
  - Persona 1: "Privacy-Focused Bitcoiner" – 25-40yo, holds BTC, avoids KYC; wants quick fiat top-ups for Stacks DeFi.
  - Persona 2: "DeFi Newbie" – 18-30yo, has fiat, seeks easy entry to sBTC for stacking; tolerates minimal KYC for larger buys.
- **User Journey:** Visit site → Enter fiat amount/currency → Connect wallet → View aggregated quotes → Select/Confirm → Provider widget handles payment → sBTC arrives in wallet.

## 4. Features & Requirements

### Functional Requirements

- **Core Flow:**
  - Fiat input (amount, currency: USD, EUR, etc.; 10+ supported).
  - Wallet connect (Stacks wallets: Leather, Xverse).
  - Real-time quote aggregation: Ping APIs for rates, fees, availability; rank by total cost/time.
  - Routing: Auto-select best or manual; embed provider widget (e.g., MoonPay SDK).
  - Post-purchase: If provider delivers BTC/STX, auto-bridge to sBTC via Clarity contract or API.
- **MVP Providers:** MoonPay, Ramp Network, Transak, Mt Pelerin (no-KYC focus), Digitap (optional no-KYC).
- **On-Chain Components:** Clarity contract for verification (e.g., confirm delivery) or simple bridge hook.
- **Off-Chain:** Backend for aggregation logic, frontend for UI.
- **Additional:** Email signup for waitlist/notifications; basic analytics (anonymous).

### Non-Functional Requirements

- **Security:** HTTPS, wallet non-custodial (no private keys stored); comply with provider KYC thresholds.
- **Performance:** <5s quote fetch; scalable to 1,000 daily users (use cloud hosting).
- **UX:** Mobile-responsive; intuitive (one-click where possible); error handling (e.g., "Provider down, try another").
- **Compliance:** Display warnings for no-KYC limits; log for audits (no user data stored).
- **Accessibility:** WCAG 2.1 basics.
- **Reliability:** 99% uptime; fallback to manual provider selection.

Functional Requirements (Enhanced)

Core Flow (unchanged + new step):
... → Purchase completion → sBTC delivery (via provider → bridge).
New: "Verify Delivery" button calls Clarity contract: User submits proof (e.g., tx hash or simple assertion) → contract verifies (basic logic now; oracle/DLC-link future) → if confirmed, releases small STX fee refund or mints soulbound "Verified On-Ramp" badge NFT.

MVP Providers (unchanged; Mt Pelerin emphasized for no-KYC reputation per recent sources).
On-Chain Components (now central):
Clarity Delivery Verifier contract: Original design for initiating verification (small STX deposit), confirming delivery, and rewarding (refund/badge).
Integration: Stacks.js for contract calls from frontend.

Off-Chain (unchanged): Aggregation, UI, real-time quotes.

Non-Functional Requirements (Updated)

Security: Contract audited basics (e.g., reentrancy guards); small deposits only.
Performance: Contract ops low-gas; verification <10s.

## 5. Milestones

Development is phased for an agent (e.g., AI-assisted coder or dev team), with checkpoints for feedback. Total timeline: 4-6 weeks assuming full-time agent. Each milestone includes deliverables, success criteria, and Ascent alignment (e.g., open-source progress).

### Milestone 1: Research & Planning (Week 1)

- **Tasks:**
  - Validate assumptions: Build landing page (e.g., via Carrd/Webflow) with email signup; promote on X (@KenTheRogers tag) for >50 signups.
  - Finalize providers: Sign up for dev APIs (MoonPay, Ramp, Transak); test no-KYC thresholds.
  - Define architecture: Wireframes (Figma), data flows (e.g., fiat input → API pings → quotes).
  - Risk check: Confirm sBTC bridge (use Stacks peg API if live).
- **Deliverables:** Landing page live; API keys secured; wireframes; initial repo setup (GitHub, open-source).
- **Success Criteria:** 10%+ conversion on landing page; checklist: 8/8 must-haves planned.
- **Agent Instructions:** Use tools like Figma for designs; research provider docs.

### Milestone 2: Backend Development (Week 2)

- **Tasks:**
  - Build Node.js backend: API endpoints for quote aggregation (poll/push from providers).
  - Integrate provider APIs: Fetch rates, initiate orders (e.g., MoonPay createOrder).
  - Add logic: Ranking algorithm (cost = fee + FX; filter no-KYC eligible).
  - Optional Clarity: Simple contract for post-delivery verification (deploy to Stacks testnet).
- **Deliverables:** Functional backend (e.g., /getQuotes endpoint); tests (Jest); deployed to Vercel/Heroku.
- **Success Criteria:** End-to-end quote fetch works; checklist: On/off-chain integration.
- **Agent Instructions:** Code manually; use AI for snippets (e.g., API calls); commit to GitHub.

### Milestone 3: Frontend & Integration (Week 3)

- **Tasks:**
  - Build React/Next.js UI: Input form, wallet connect (via @stacks/connect), quote display, provider embed.
  - Integrate backend: Real-time updates (WebSockets via Socket.io if needed).
  - Handle flows: Payment completion → bridge to sBTC (use Stacks.js for tx).
  - Add UX: Loading states, errors, mobile view.
- **Deliverables:** Full MVP app; wallet-to-sBTC flow tested; README with setup instructions.
- **Success Criteria:** E2E test: Fiat input → sBTC in test wallet; checklist: Usable interface.
- **Agent Instructions:** Focus on craft; engage community for feedback (post progress in Ascent forum).

### Milestone 4: Testing & Security (Week 4)

- **Tasks:**
  - Unit/integration tests: Cover 80% code (e.g., quote accuracy, failures).
  - Security audit: Basic (e.g., OWASP checks); no key storage.
  - User testing: Simulate buys with test APIs; gather feedback via community.
  - Analytics: Add Mixpanel (anonymous) for usage.
- **Deliverables:** Test reports; bug-fixed code; production config (env vars for keys).
- **Success Criteria:** No critical bugs; checklist: Functional & secure.
- **Agent Instructions:** Use tools like Cypress for tests; iterate based on feedback.

### Milestone 5: Deployment & Launch (Week 5-6)

- **Tasks:**
  - Deploy: Vercel for frontend/backend; Stacks mainnet for Clarity.
  - Monitoring: Set up Sentry for errors; basic scaling (auto-scale).
  - Documentation: Full README, API docs (Swagger); long-term vision (e.g., add more providers, off-ramps).
  - Launch: Open-source repo; post on X/Stacks forum; monitor initial users.
- **Deliverables:** Live MVP (domain e.g., sbtconramp.com); user guide; analytics dashboard.
- **Success Criteria:** 100+ signups post-launch; checklist: 15+ checks (exceptional).
- **Agent Instructions:** Handle deployment; share for community inspection.

## 6. Tech Stack

- **Frontend:** React.js/Next.js (for UI); Tailwind CSS (styling); @stacks/connect (wallet).
- **Backend:** Node.js/Express (API); Axios (HTTP requests); WebSocket (real-time if needed).
- **Blockchain:** Clarity (smart contracts via @stacks/clarity); Stacks.js (tx handling); sBTC peg bridge API.
- **Database:** None for MVP (stateless); optional PostgreSQL for logs.
- **Hosting:** Vercel (serverless); GitHub (repo).
- **Tools:** Figma (designs); Jest/Cypress (tests); Sentry (monitoring); Mixpanel (analytics).
- **Integrations:** Provider SDKs/APIs (MoonPay, Ramp, Transak); Stacks wallets (Leather/Xverse).

## 7. Resources & Docs

- **Stacks Docs:** https://docs.stacks.co/ (intro, sBTC, Clarity tutorials); https://docs.stacks.co/sbtc (acquisition/bridging).
- **Provider Docs:**
  - MoonPay: https://developers.moonpay.com/docs/onramp (API, widget embed; no-KYC thresholds).
  - Ramp Network: https://docs.ramp.network/ (SDK, real-time rates; non-custodial).
  - Transak: https://docs.transak.com/ (API endpoints, wallet delivery; no-KYC limits).
  - Mt Pelerin: https://www.mtpelerin.com/developers (no-KYC focus).
  - Digitap: https://digitap.app/docs (optional no-KYC).
- **Other:** Ascent resources (Lean Startup); GitHub templates for open-source; OWASP for security.
- **Research Sources:** Web searches on no-KYC ramps; X threads on sBTC buying (e.g., P2P options like Bisq for fallbacks).

## 8. Risks & Mitigations

- **Risk:** Providers change no-KYC policies – Mitigation: Monitor APIs; add fallbacks.
- **Risk:** Regulatory changes (e.g., stricter thresholds) – Mitigation: Focus on small amounts; display disclaimers.
- **Risk:** Bridge failures – Mitigation: Use official Stacks peg; test extensively.
- **Risk:** Low adoption – Mitigation: Validate early; iterate based on community feedback.
- **Dependencies:** Provider API uptime; Stacks network stability.

This PRD ensures the MVP is Ascent-ready (original, functional, open-source) and positions it for growth (e.g., add off-ramps, mobile app). Next: Kick off Milestone 1 with landing page build!

5. Milestones (Updated for Clarity Focus)
   Total timeline still ~4-6 weeks.
   Milestone 1: Research & Planning (Week 1)

Tasks (enhanced):
Landing page + signup for "verified on-ramp" interest.
Finalize providers + research sBTC verification methods (e.g., Bitcoin tx proofs in Clarity).
Design wireframes including "Verify Delivery" flow.
Outline Clarity contract logic.

Deliverables (enhanced): Landing page; provider API keys; Figma with verifier UX; initial GitHub repo.
Success Criteria: Strong signup interest in verification feature.

Milestone 2: Backend + Clarity Contract Development (Week 2)

Tasks (enhanced):
Backend aggregation logic (unchanged).
Core: Write, test, deploy Clarity Delivery Verifier contract to testnet/mainnet.
Features: Initiate (deposit small STX fee), Confirm (basic check or user proof), Reward (refund or mint badge NFT).
Use traits for composability.

Integrate backend with contract (e.g., generate initiate tx).

Deliverables: Backend API; Clarity contract code/tests (deploy script); README section on contract.
Success Criteria: Contract deploys successfully; basic calls work via Clarinet or stacks.js.

Example Clarity Contract Starter (for agent implementation; expand/understand fully):
clarity;; Delivery Verifier v0.1
(define-constant CONTRACT-OWNER tx-sender)
(define-constant VERIFICATION-FEE u1000000) ;; 1 STX in microSTX

(define-map pending-verifications { user: principal } { expected-amount: uint, status: (string-ascii 20) })

(define-public (initiate-verification (expected-sbtc-amount uint))
(begin
(try! (stx-transfer? VERIFICATION-FEE tx-sender CONTRACT-OWNER))
(map-set pending-verifications { user: tx-sender } { expected-amount: expected-sbtc-amount, status: "pending" })
(ok true)))

(define-public (confirm-delivery (tx-proof (buff 32))) ;; Placeholder for proof (tx hash or merkle)
(let ((entry (unwrap! (map-get? pending-verifications { user: tx-sender }) (err u404))))
;; Future: Integrate real oracle/proof check (e.g., via DLC-link or Bitcoin tx verify)
;; For MVP: Assume user honesty or simple amount check
(if (> (get expected-amount entry) u0) ;; Placeholder logic
(begin
(try! (stx-transfer? VERIFICATION-FEE CONTRACT-OWNER tx-sender)) ;; Refund
(map-delete pending-verifications { user: tx-sender })
;; Optional: Mint badge NFT via SIP-013 trait
(ok "verified"))
(err u500))))
Milestone 3: Frontend & Full Integration (Week 3)

Tasks (enhanced):
UI with "Verify Delivery" post-purchase flow.
Use @stacks/connect + @stacks/transactions to call contract.
Handle responses (e.g., show "Verified!" badge).

Deliverables: Full app; E2E flow including contract verification.

Milestone 4: Testing & Security (Week 4)

Tasks (enhanced): Test contract thoroughly (edge cases, fees, refunds); basic security review.

Milestone 5: Deployment & Launch (Week 5-6)

Tasks (enhanced): Deploy contract + app; document verifier primitive for community reuse.

6. Tech Stack (Updated)

Blockchain/Clarity: Clarity (contracts); Clarinet (local testing); @stacks/transactions, @stacks/connect (integration); SIP-013 for optional badge NFTs.
Other (unchanged).

7. Resources & Docs (Updated)

sBTC/Bridging: https://www.stacks.co/sbtc (peg-in dashboard, wallet integration); monitor for 2026 updates (e.g., enhanced verification hooks).
Clarity Examples: https://docs.stacks.co (guides on Bitcoin tx verification); DLC-link GitHub for oracle patterns; forum advanced examples.
Providers: Mt Pelerin (strong no-KYC feedback); MoonPay/Ramp/Transak dev docs (fees/thresholds per 2026 sources).
Ascent/Grants: stacks.org/ascent; ecosystem grants require sBTC/Nakamoto integration path—verifier contract qualifies.

8. Risks & Mitigations (Updated)

Risk: Limited on-chain sBTC verification primitives in 2026 → Mitigation: Start with basic/user-submitted logic; plan oracle upgrade (e.g., DLC-link).
Other (unchanged).
