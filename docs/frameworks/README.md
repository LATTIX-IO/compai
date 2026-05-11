# Framework reference packets

This directory stores source-oriented reference packets for frameworks we plan to ingest, normalize, or map inside Comp AI.

Each folder is intentionally lightweight:

- a short working summary,
- official/public source links,
- notes about what the source set actually covers,
- implementation/import notes, and
- any gaps that still need manual follow-up.

## Included packets

| Folder               | Framework                 | Notes                                                                              |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| `nist-800-53-r5`     | NIST SP 800-53 Rev. 5     | Core catalog + assessment + baseline references.                                   |
| `nist-800-53-r5-nss` | NIST SP 800-53 Rev. 5 NSS | Overlay/tailoring source packet for NSS-specific work; not fully import-ready yet. |
| `nist-800-171-r3`    | NIST SP 800-171 Rev. 3    | Current NIST Rev. 3 source packet.                                                 |
| `fedramp-low`        | FedRAMP Low               | Legacy Low baseline packet with modern FedRAMP transition notes.                   |
| `fedramp-high`       | FedRAMP High              | Legacy High baseline packet with modern FedRAMP transition notes.                  |
| `cmmc-l1`            | CMMC Level 1              | FCI / FAR 52.204-21 packet.                                                        |
| `cmmc-l2`            | CMMC Level 2              | Current DoD rule packet based on NIST SP 800-171 Rev. 2.                           |
| `cmmc-l3`            | CMMC Level 3              | Current DoD rule packet based on selected NIST SP 800-172 requirements.            |

## Working conventions

- Prefer official publisher pages first: NIST CSRC, DoD CIO, FedRAMP, eCFR, and the Federal Register.
- When NIST says the PDF is the authoritative or normative source, treat the PDF/publication page as canonical and CSV/XLSX as convenience formats.
- Keep current program reality separate from future or superseding publications. For example:
  - `nist-800-171-r3` tracks the current NIST Rev. 3 publication set.
  - `cmmc-l2` still tracks the current DoD final rule, which remains anchored to NIST SP 800-171 Rev. 2 / SP 800-171A.
- FedRAMP public documentation changed materially after the FedRAMP Authorization Act and OMB Memorandum M-24-15. These packets keep legacy `Low` and `High` names because they remain common procurement shorthand, but the notes also capture the newer certification-class transition.
- The `nist-800-53-r5-nss` folder should be treated as a sourcing packet, not as a finished NSS overlay dataset.
- As of the public SCOR pages updated on `2026-02-10`, the visible government-wide overlays are `Closed Isolated Network`, `Physical Access Control Systems`, and `Federal PKI Systems`; the visible NIST-developed overlays are `Operational Technology (OT)`, `Email Messaging Systems`, `Cybersecurity Supply Chain Risk Management`, `Controlled Unclassified Information (CUI)`, and `Control Overlays for Securing AI Systems`.
- The public SCOR submissions page did not surface a dedicated NSS overlay, and the public-submissions page appeared empty during the latest check.

## Known gaps called out on purpose

- The old public FedRAMP `/baselines/` page now returns `404`; the current source trail lives in FedRAMP authority/process docs, Rev5 playbooks, notices, and the official `FedRAMP/docs` repository.
- Official CNSS/NSS material is partially harder to extract automatically than NIST/FedRAMP material. The NSS packet includes the public CNSSI No. 1253 link we found, but manual verification is still recommended before deriving machine-readable NSS content.
- Because public SCOR inventory still does not list an NSS-specific overlay, treat NSS work as a documented sourcing and normalization task rather than a ready-to-seed framework import.
