# NIST SP 800-171 Rev. 3 reference packet

## Official scope

- **Publisher:** NIST CSRC
- **Core publication:** SP 800-171 Rev. 3
- **Assessment companion:** SP 800-171A Rev. 3
- **What this packet covers:** the current NIST Rev. 3 publication set for protecting CUI in nonfederal systems and organizations.

## Primary sources

1. [SP 800-171 Rev. 3](https://csrc.nist.gov/pubs/sp/800/171/r3/final)
   - Core Rev. 3 publication page.
   - Includes PDF and HTML, change analysis, FAQ, CUI overlay, and CPRT references.
2. [SP 800-171A Rev. 3](https://csrc.nist.gov/pubs/sp/800/171/a/r3/final)
   - Assessment procedures for Rev. 3.
3. [SP 800-171 Rev. 3 FAQ](https://csrc.nist.gov/pubs/sp/800/171/r3/final)
   - Linked from the publication page.
4. [SP 800-171 Rev. 3 change analysis](https://csrc.nist.gov/pubs/sp/800/171/r3/final)
   - Linked from the publication page.
5. [SP 800-171 Rev. 3 CUI overlay](https://csrc.nist.gov/pubs/sp/800/171/r3/final)
   - Linked from the publication page.
6. [NIST CUI requirements project / CPRT materials](https://csrc.nist.gov/pubs/sp/800/171/r3/final)
   - Also linked from the publication page.

## Captured notes

- `SP 800-171 Rev. 3` is the current NIST publication for this framework line.
- The publication page provides a richer source set than just the PDF:
  - PDF + HTML,
  - change analysis,
  - FAQ,
  - CUI overlay,
  - CPRT references, and
  - linkage to `SP 800-171A Rev. 3`.
- `SP 800-171A Rev. 3` is the correct assessment companion for Rev. 3 content.

## Implementation notes

- Keep this packet separate from `cmmc-l2`.
- The current DoD CMMC final rule still references `SP 800-171 Rev. 2`, not Rev. 3.
- If Comp AI eventually supports both `NIST SP 800-171 Rev. 3` and `CMMC Level 2`, they should be treated as separate frameworks with explicit crosswalk/mapping logic.
- Preserve publication metadata and the linked change-analysis/FAQ artifacts because they will be useful when reconciling Rev. 2 to Rev. 3 deltas.

## Known gaps

- None for the core publication set.
- A future follow-up could store the linked FAQ / change-analysis / overlay artifacts in deeper detail if we decide to harvest them as separate machine-readable references.
