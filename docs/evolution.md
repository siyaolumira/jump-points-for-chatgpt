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
| v0.12.1 | Increased cruise speed while preserving adaptive slowdown | Established the public-beta navigation baseline. |
| v0.12.2 | Added interruptible seeking and further cruise tuning | Automatic navigation no longer takes control away from the user: any pointer interaction can stop an active seek, and selecting another Jump Point immediately starts a new one. |
| v0.12.3 | Improved ambiguous-anchor matching and strengthened edge detection during long-distance seeking | Repeated short text is resolved using surrounding-context similarity instead of coarse exact-match scoring, while temporary virtualization stalls are less likely to be mistaken for the real end of a conversation. |
| v0.12.4 | Fixed point-removal state bugs and improved panel responsiveness | Fixed cases where the delete icon could disappear after extended use or when all three Jump Points were filled. Added dynamic panel width to reduce obstruction, with full Jump Point names shown on hover when truncated. |
| v0.12.5 | Adapted selection capture to ChatGPT's updated message DOM | A ChatGPT frontend change broke the previous message-root detection and caused valid selections to be rejected. Added support for the new message-selection attributes while retaining legacy selectors for backward compatibility. |

## Frontend compatibility

Jump Points depends on ChatGPT's rendered DOM to identify message boundaries and restore positions. A frontend update can therefore break navigation even when the underlying anchoring logic remains valid.

v0.12.5 addressed one such change by supporting ChatGPT's newer message-selection attributes while retaining legacy selectors as fallbacks.

This reinforced a broader engineering lesson:
`browser selection → message boundary → anchor capture`
Each layer should be diagnosed independently before changing the restoration logic.


## The key discovery

A saved anchor could appear to be missing simply because ChatGPT had not rendered that older part of the conversation. Manually scrolling toward the target made the same anchor suddenly resolvable.

That separated the problem into two layers:

1. **Navigation / virtualization:** bring the relevant content into the rendered DOM.
2. **Anchoring:** find the selected text, reconstruct its DOM Range, and land precisely.

The current implementation follows that separation:

`conversation navigation → readiness gate → adaptive seek → anchor appears → range match → precise landing`

## Anchor ambiguity

Finding the saved text is not always enough.

Short selections such as "yes", "okay" may appear many times in the same conversation. Earlier versions could find all matching candidates but still choose the wrong occurrence when surrounding context did not match exactly.

v0.12.3 changed contextual matching from coarse exact/partial scores to character-level prefix and suffix similarity. When repeated text cannot be resolved with enough contextual evidence, Jump Points now prefers not to jump rather than confidently land on the wrong occurrence.

This reinforced another separation in the restoration problem:

`text match → contextual disambiguation → precise anchor`

## Current scope

Jump Points currently works with **signed-in ChatGPT conversations**. Logged-out sessions are not supported.

The extension intentionally maintains only **three global Jump Points**. They can be placed within the same chat or across different chats, forming a temporary working set rather than a permanent bookmark collection.

Selected text acts only as a position anchor. Jump Points can be moved and replaced as the user's focus changes.

Automatic seeking is interruptible: user interaction immediately stops an active seek and returns control to the user.