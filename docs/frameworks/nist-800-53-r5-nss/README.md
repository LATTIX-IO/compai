# NIST SP 800-53 Rev. 5 NSS reference packet

## Official scope

- **Publisher set:** primarily NIST CSRC for the `SP 800-53` family and overlay model; CNSS/NSS guidance is a separate source trail.
- **What this packet covers:** the public source trail needed to derive an NSS-oriented reference set for `SP 800-53 Rev. 5`.
- **Important caveat:** this is **not** a finished NSS overlay dataset. It is a curated source packet for follow-on normalization work.

## Primary sources

1. [SP 800-53 Rev. 5, Update 1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
   - Core catalog that NSS tailoring starts from.
2. [SP 800-53B, Update 1](https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final)
   - Baselines, tailoring guidance, and links to overlay resources.
3. [Security and Privacy Control Overlay Overview](https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/overlay-repository/overlay-overview)
   - Explains what overlays are and how they add, modify, eliminate, or parameterize baseline controls.
4. [NIST Security and Privacy Control Overlay Repository (SCOR)](https://csrc.nist.gov/projects/risk-management/scor)
   - NIST’s public repository for voluntary control overlays.
5. [Government-wide overlay submissions](https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/overlay-repository/government-wide-overlay-submissions)
   - Shows public government overlay examples available in SCOR.
6. [CNSSI No. 1253 public PDF link (DCSA mirror)](https://www.dcsa.mil/portals/91/documents/ctp/nao/CNSSI_No1253.pdf)
   - Public URL located during research.
   - Automated extraction failed in this session, so this link is stored as an official follow-up artifact rather than a fully summarized source.

## Captured notes

- NIST’s overlay overview describes an overlay as a mechanism to:
  - add, modify, or eliminate controls from a baseline,
  - define applicability/interpretation for specific technologies or environments, and
  - set parameter values for controls and control enhancements.
- The SCOR page describes the repository as a platform for stakeholders to **voluntarily share control overlays** and reduce duplicated effort.
- The fetched government-wide overlay page surfaced examples such as:
  - Closed Isolated Network,
  - Physical Access Control Systems, and
  - Federal PKI Systems.
- The fetched NIST-developed overlay page surfaced examples such as:
   - Operational Technology (OT),
   - Email Messaging Systems,
   - Cybersecurity Supply Chain Risk Management,
   - Controlled Unclassified Information (CUI), and
   - Control Overlays for Securing AI Systems.
- The fetched public overlay submissions page appeared empty during the latest review.
- The fetched government-wide page did **not** surface an obvious dedicated NSS-specific overlay in the visible public listing.
- Practically, that means an NSS packet should be treated as:
  - `SP 800-53 Rev. 5` catalog content,
  - `SP 800-53B` baseline/tailoring guidance,
  - overlay logic, and
  - CNSS/NSS-specific control-selection guidance.

## Implementation notes

- Do **not** clone a civilian/federal baseline and label it `NSS` without explicit overlay or NSS guidance.
- Use this folder as the staging area for a later manual review of:
  - `CNSSI No. 1253`, and
  - any current CNSS/NSS successor or supplement that explicitly ties into `SP 800-53 Rev. 5`.
- If machine-readable NSS import is needed later, derive it from documented overlay/tailoring rules rather than from assumptions about federal baselines.

## Known gaps

- We did not get direct automated extraction from the public `CNSSI No. 1253` PDF link in this session.
- The CNSS website itself was not extractable enough to confirm whether a newer public NSS/Rev5 replacement or supplement should supersede `CNSSI No. 1253`.
- The visible SCOR inventory pages were updated on `2026-02-10`, but they still did not list a dedicated NSS overlay that could be safely converted into machine-readable seed data.
- Manual verification is recommended before any automated import or production mapping work uses this packet.
