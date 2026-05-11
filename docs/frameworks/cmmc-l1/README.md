# CMMC Level 1 reference packet

## Official scope

- **Program owner:** U.S. Department of Defense (DoD CIO)
- **Level purpose:** protect **Federal Contract Information (FCI)**
- **Core requirement source:** FAR 52.204-21
- **Assessment mode:** self-assessment

## Primary sources

1. [DoD CIO CMMC landing page](https://dodcio.defense.gov/CMMC/)
   - Top-level program entry point.
2. [DoD CIO CMMC About page](https://dodcio.defense.gov/cmmc/About/)
   - High-level description of Levels 1 through 3 and implementation details.
3. [DoD CIO CMMC Resources & Documentation page](https://dodcio.defense.gov/cmmc/Resources-Documentation/)
   - Index for model docs, scoping guides, assessment guides, and related references.
4. [DoD CIO CMMC Level 1 Assessment Guide](https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf)
   - Official DoD assessment guide for Level 1 self-assessments.
5. [DoD CIO CMMC Level 1 Scoping Guide](https://dodcio.defense.gov/Portals/0/Documents/CMMC/ScopingGuideL1v2.pdf)
   - Official DoD scoping guide for Level 1 environments handling FCI.
6. [Federal Register: 32 CFR Part 170 final rule](https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program)
   - Authoritative rule text and explanatory preamble.
7. [eCFR FAR 52.204-21](https://www.ecfr.gov/current/title-48/section-52.204-21)
   - The 15 basic safeguarding requirements used for Level 1.

## Captured notes

- The current CMMC final rule defines **Level 1** as the **15 security requirements in FAR 52.204-21**.
- Level 1 applies when a contractor or subcontractor processes, stores, or transmits **FCI**.
- Level 1 is a **self-assessment only** level.
- The Federal Register final rule states that **all 15 Level 1 requirements must be met**.
- The final rule also states that **POA&Ms are not allowed** for Level 1.
- The DoD CIO resources page lists level-specific scoping and assessment guidance for follow-up harvesting.

## Implementation notes

- Model CMMC Level 1 as a distinct framework grounded in FAR clause requirements, not as a light version of NIST SP 800-171.
- Keep the relationship to FCI explicit in framework metadata and user-facing summaries.
- If future ingestion needs level-specific examples or assessment aids, harvest the Level 1 scoping/assessment guides linked from the DoD CIO resources page.

## Known gaps

- Direct Level 1 guide URLs are now captured here, but the full PDF text was not extracted into this reference packet in-session.
