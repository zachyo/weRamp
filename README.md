# No-KYC Fiat → sBTC On-Ramp Aggregator

A web-based application that simplifies onboarding to the Stacks/sBTC ecosystem by aggregating low/no-KYC fiat on-ramp providers.

## Features

- **Aggregation:** Real-time quotes from MoonPay, Ramp, Transak, and Mt Pelerin.
- **No-KYC Focus:** Prioritizes providers and routes that allow small purchases (<$2,000) without mandatory KYC.
- **On-Chain Verification:** Clarity smart contract "Delivery Verifier" confirms sBTC receipt to unlock rewards and badges.
- **Seamless UX:** Connect Leather or Xverse wallet and buy sBTC in one click.

## Project Structure

- `/frontend`: Next.js 16 (TypeScript, Tailwind CSS 4) web application.
- `/contracts`: Clarity smart contracts (Stacks blockchain).
- `/tests`: Unit tests for Clarity contracts using Vitest and Clarinet SDK.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Clarinet](https://github.com/hirosystems/clarinet) (for contract development)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

### Smart Contract Development

```bash
# Run tests
npm install
npm test

# Check contract
clarinet check
```

## Milestone Roadmap

- [x] **Milestone 1:** Research & Planning - Landing page, API mocks, Clarity contract v0.1.
- [ ] **Milestone 2:** Backend Development - Real provider API integration, ranking algorithm.
- [ ] **Milestone 3:** Frontend & Integration - Wallet connect, E2E purchase flow.
- [ ] **Milestone 4:** Testing & Security - 80% coverage, security audit.
- [ ] **Milestone 5:** Deployment & Launch - Mainnet deployment, open-source release.

## License

MIT
