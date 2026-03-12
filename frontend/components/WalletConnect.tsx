// "use client";

// import { useState, useEffect } from "react";
// import {
//   isWalletConnected,
//   connectWallet,
//   disconnectWallet,
//   getStxAddress,
//   getExpectedNetwork,
//   isWrongNetwork,
// } from "@/lib/stacks-session";

// // ─── UI component ─────────────────────────────────────────────────────────────
// export default function WalletConnect() {
//   const [mounted, setMounted] = useState(false);
//   const [address, setAddress] = useState<string | null>(null);
//   const [wrongNetwork, setWrongNetwork] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     if (isWalletConnected()) {
//       setAddress(getStxAddress());
//       setWrongNetwork(isWrongNetwork());
//     }
//   }, []);

//   const handleAuthenticate = () => {
//     connectWallet(() => {
//       setAddress(getStxAddress());
//       setWrongNetwork(isWrongNetwork());
//     });
//   };

//   const disconnect = () => {
//     disconnectWallet();
//     setAddress(null);
//     setWrongNetwork(false);
//   };

//   if (!mounted) return <button className="btn-outline">Connect Wallet</button>;

//   // ── Wrong network warning ──
//   if (address && wrongNetwork) {
//     const expected = getExpectedNetwork();
//     return (
//       <div className="flex items-center gap-2">
//         <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium animate-fade-up">
//           <span>⚠️</span>
//           <span>
//             Wrong network — switch to{" "}
//             <strong className="uppercase">{expected}</strong>
//           </span>
//         </div>
//         <button
//           onClick={disconnect}
//           className="btn-outline border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs px-3 py-1.5"
//         >
//           Disconnect
//         </button>
//       </div>
//     );
//   }

//   // ── Connected ──
//   if (address) {
//     return (
//       <div className="flex items-center gap-2">
//         <span className="badge badge-accent text-[10px] uppercase">
//           {getExpectedNetwork()}
//         </span>
//         <button
//           onClick={disconnect}
//           className="btn-outline border-accent/50 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
//         >
//           {address.substring(0, 5)}...{address.substring(address.length - 4)}
//           <span className="text-xs text-muted ml-2">(Disconnect)</span>
//         </button>
//       </div>
//     );
//   }

//   // ── Not connected ──
//   return (
//     <button onClick={handleAuthenticate} className="btn-outline">
//       <svg
//         width="20"
//         height="20"
//         viewBox="0 0 24 24"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path
//           d="M19 7H5C3.89543 7 3 7.89543 3 9V15C3 16.1046 3.89543 17 5 17H19C20.1046 17 21 16.1046 21 15V9C21 7.89543 20.1046 7 19 7Z"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//         <path
//           d="M16 12H16.01"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>
//       Connect Wallet
//     </button>
//   );
// }

import React from "react";

const WalletConnect = () => {
  return <div>WalletConnect</div>;
};

export default WalletConnect;
