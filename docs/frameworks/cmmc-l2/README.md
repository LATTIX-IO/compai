# CMMC Level 2 reference packet

## Official scope

- **Program owner:** U.S. Department of Defense (DoD CIO)
- **Level purpose:** protect **Controlled Unclassified Information (CUI)**
- **Core requirement source in the current rule:** NIST SP 800-171 Rev. 2
- **Assessment modes:** self-assessment or C3PAO certification assessment, depending on the solicitation/contract requirement

## Primary sources

1. [DoD CIO CMMC About page](https://dodcio.defense.gov/cmmc/About/)
   - High-level description of Level 2 and the broader program.
2. [DoD CIO CMMC Resources & Documentation page](https://dodcio.defense.gov/cmmc/Resources-Documentation/)
   - Links model docs, scoping guides, assessment guides, and NIST dependencies.
3. [Federal Register: 32 CFR Part 170 final rule](https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program)
   - Authoritative current rule text.
4. [NIST SP 800-171 Rev. 2](https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final)
   - Current NIST source used by the DoD rule for Level 2.
5. [NIST SP 800-171A](https://csrc.nist.gov/pubs/sp/800/171/a/final)
   - Assessment procedures used with the current rule’s Level 2 requirement set.

## Captured notes

- The current CMMC final rule defines **Level 2** as the **110 security requirements of NIST SP 800-171 Rev. 2**.
- Level 2 applies to contractors that process, store, or transmit **CUI**.
- The final rule distinguishes between:
  - **Level 2 (Self)**, and
  - **Level 2 (C3PAO)**.
- The Federal Register final rule allows **POA&Ms under defined conditions** and requires **180-day closeout** for those conditional statuses.
- The final rule explicitly discusses the existence of **NIST SP 800-171 Rev. 3** but states that **Rev. 3 is not currently applicable to the rule** and that future amendments will be needed to update the rule.
- The NIST `SP 800-171 Rev. 2` and `SP 800-171A` publication pages both say their **PDFs are the authoritative source** when helper formats differ.

## Implementation notes

- Treat `CMMC Level 2` and `NIST SP 800-171 Rev. 3` as separate frameworks.
- Do **not** replace the current Level 2 source set with Rev. 3 content just because Rev. 3 now exists.
- Use `SP 800-171A` alongside `SP 800-171 Rev. 2` when assessment procedures or evidence expectations are needed.
- Preserve the split between self-assessment and certification-assessment states in any future framework metadata.

## Known gaps

- Level-specific CMMC Level 2 guide PDFs were listed on the DoD CIO resources page but were not individually harvested in this session.
