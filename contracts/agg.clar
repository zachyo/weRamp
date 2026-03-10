
;; Delivery Verifier v0.1
;; This contract allows users to initiate a verification for an sBTC delivery
;; and confirm it on-chain to receive a potential reward/refund.

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-PENDING (err u101))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-STX-TRANSFER-FAILED (err u102))

(define-constant VERIFICATION-FEE u1000000) ;; 1 STX in microSTX

;; Data Maps
(define-map pending-verifications 
  { user: principal } 
  { expected-amount: uint, status: (string-ascii 20), timestamp: uint }
)

;; Public Functions

;; Initiate a verification request by sending the verification fee
(define-public (initiate-verification (expected-sbtc-amount uint))
  (let
    (
      (user tx-sender)
    )
    ;; Check if already pending
    (asserts! (is-none (map-get? pending-verifications { user: user })) ERR-ALREADY-PENDING)
    
    ;; Transfer verification fee to contract (escrow)
    (try! (stx-transfer? VERIFICATION-FEE user (as-contract tx-sender)))
    
    ;; Set pending status
    (map-set pending-verifications 
      { user: user } 
      { 
        expected-amount: expected-sbtc-amount, 
        status: "pending", 
        timestamp: stacks-block-height 
      }
    )
    
    (ok true)
  )
)

;; Confirm delivery - in MVP this is a simple call, in future it would require proof
(define-public (confirm-delivery (tx-proof (buff 32)))
  (let
    (
      (user tx-sender)
      (entry (unwrap! (map-get? pending-verifications { user: user }) ERR-NOT-FOUND))
    )
    
    ;; Future: Integrate real oracle/proof check (e.g., via DLC-link or Bitcoin tx verify)
    ;; For MVP: Assume user honesty or simplified validation
    
    ;; Refund the verification fee to the user as a reward
    (try! (as-contract (stx-transfer? VERIFICATION-FEE (as-contract tx-sender) user)))
    
    ;; Clean up map
    (map-delete pending-verifications { user: user })
    
    ;; Optional: Mint badge NFT (SIP-009/SIP-013) - to be added in Milestone 3
    
    (ok "verified")
  )
)

;; Read-only Functions

;; Get verification status for a specific user
(define-read-only (get-verification-status (user principal))
  (map-get? pending-verifications { user: user })
)

;; Get the contract owner
(define-read-only (get-contract-owner)
  CONTRACT-OWNER
)
