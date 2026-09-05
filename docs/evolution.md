# Evolution

Jump Points began as a tiny experiment: can a Chrome extension reliably return to an arbitrary position inside a very long ChatGPT conversation?

| Version | Main change | Result / lesson |
|---|---|---|
| v0 | Initial concept: three global temporary positions | Established the working-set model rather than a permanent bookmark archive. |
| v0.1 | Stored nearby text, relative position, conversation identity, and cross-chat pending navigation | Saving worked, restoration did not. |
| v0.2 | Improved conversation identity and retry behavior | Revealed that ChatGPT scrolls an internal container rather than the browser window. |
| v0.3 | Used a DOM marker and `scrollIntoView()` | First successful jump; proved the core mechanism. |
| v0.4 | Point-to-bookmark caret capture | More precise, but the interaction was awkward. |
| v0.5 | Click-first capture | Still too imprecise. |
| v0.6 | Selection-first capture | Established the final creation interaction, but restoration was unreliable. |
| v0.7 | Flattened DOM text nodes, exact/fallback matching, context scoring, DOM Range reconstruction | Anchoring worked when the target content was rendered. |
| v0.8 | Progressive seek plus replaceable slots | Began actively bringing lazily rendered content into the DOM. |
| v0.9 | Seek-until-edge rather than a fixed number of steps | Showed that iteration count alone was not the problem. |
| v0.10 | Verified scroll-host discovery and bidirectional exhaustive seek | Correct direction, but introduced a missing-helper regression. |
| v0.10.1 | Experimental selection fix | Wrong diagnosis; reinforced the need to protect the creation flow from regressions. |
| v0.10.2 | Restored the missing helper while keeping verified scroll-host seeking | First reliable long-distance same-chat restoration. |
| v0.11 | Added cross-chat readiness gating and smoother segmented seek | Correct architecture, but introduced another missing-helper regression. |
| v0.11.1 | Restored creation logic and added static regression checks | Known-good reliability milestone. |
| v0.12 | Replaced segmented seeking with continuous adaptive cruise | Much smoother long-distance navigation. |
| v0.12.1 | Increased cruise speed while preserving adaptive slowdown | Current public-beta interaction milestone. |

## The key discovery

A saved anchor could appear to be missing simply because ChatGPT had not rendered that older part of the conversation. Manually scrolling toward the target made the same anchor suddenly resolvable.

That separated the problem into two layers:

1. **Navigation / virtualization:** bring the relevant content into the rendered DOM.
2. **Anchoring:** find the selected text, reconstruct its DOM Range, and land precisely.

The current implementation follows that separation:

`conversation navigation → readiness gate → adaptive seek → anchor appears → range match → precise landing`
