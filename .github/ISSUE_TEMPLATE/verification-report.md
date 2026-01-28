---
name: Verification Report
about: Report results from verifying a provider's x402 endpoint
title: "[Verify] "
labels: verification
assignees: ''
---

## Provider

**Provider Name:**
<!-- Link to existing provider issue if applicable -->

**Endpoint URL:**
<!-- The endpoint that was tested -->

## Verification Results

**Date:** YYYY-MM-DD

**Probe Result:**
- [ ] Returned 402 with valid x402 response
- [ ] Returned 402 but missing x402 headers
- [ ] Returned different status code: ___
- [ ] Connection failed

**x402 Protocol:**
- Version: v1 / v2
- Token Type: sBTC / STX / Other
- Amount: ___ sats

**Payment Result:** (if attempted)
- [ ] Payment succeeded, resource delivered
- [ ] Payment failed: ___
- [ ] Not attempted

**Transaction ID:** (if applicable)
<!-- e.g., 0x... -->

## Logs/Details

```
<!-- Paste relevant logs or error messages -->
```

## Next Steps

<!-- Any follow-up actions needed -->
