# Jump Points for ChatGPT

**Keep three places in reach. Jump back instantly.**

Jump Points gives you three movable points inside your ChatGPT conversations.

Place them anywhere in conversations, jump back and forth between them, and move them as your work moves. The selected text marks a position — it isn't being added to a collection.

**Select → Add → Jump → Replace.**

Three points, always within reach. No archive to maintain.

## What it does

- **Three global Jump Points** — keep three positions within reach across your ChatGPT conversations.
- **Movable navigation points** — place them where you're working and replace them as your focus moves.
- **Selection-based anchors** — selected text marks a position rather than becoming part of a saved-content collection.
- **Same-chat and cross-chat jumps** — use ChatGPT's sidebar normally; Jump Points handles the position.
- **Long-distance restoration** — navigates through lazily rendered conversations until the target position becomes available.
- **Context-aware positioning** — uses surrounding text to distinguish between repeated selections and avoid jumping to the wrong occurrence.
- **Interruptible navigation** — click anywhere while a jump is in progress to stop it and take control back.
- **Fast replacement** — select a new position and replace any existing Jump Point.
- **Local storage** — Jump Point data stays in your browser.

## Requirements

Jump Points works with **signed-in ChatGPT conversations**. You must be logged in to ChatGPT before creating or using Jump Points.

Logged-out ChatGPT sessions are not currently supported.

## How to use it

### Add a Jump Point

1. Select text at the position you want to mark.
2. Click **Add selected text**.
3. Give the Jump Point a short name.

The selected text acts as an anchor for that position in the conversation.

### Jump

Click the name of any Jump Point.

If it belongs to another conversation, Jump Points opens that conversation first and then navigates to the marked position.

For very long conversations, you may see the page travel through older messages while ChatGPT renders them. Once the target becomes available, Jump Points lands on the matching anchor.

If you want to stop an in-progress jump, simply click anywhere. Clicking another Jump Point stops the current jump and starts the new one.

### Replace a Jump Point

You always have three slots.

When your focus moves:

1. Select the new position you want within reach.
2. Choose **Replace** on the Jump Point you no longer need.
3. The old point is immediately replaced by the new one.

Jump Points are designed to move with your work rather than accumulate over time.

## Why only three?

The limit is intentional.

Jump Points are a **working set, not an archive**. They hold the few positions you are actively moving between while working through long conversations.

When a point stops being useful, move it somewhere else.

> **Jump Points are disposable, not collectible.**

## Install

### Chrome Web Store

Jump Points is being prepared for distribution through the Chrome Web Store.

### Install from source

1. Click Code → Download ZIP on this repository, then unzip the downloaded file.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Choose **Load unpacked**.
5. Select the extension **folder**.
6. Sign in to ChatGPT, open a conversation, select some text, and create your first Jump Point.

## How it works

A Jump Point uses the selected text and its surrounding context as an anchor for a position in the originating ChatGPT conversation. The text marks where the Jump Point belongs — it is not being added to a saved-content collection.

When you jump back, the extension searches the rendered conversation for the anchor, uses surrounding context to distinguish between repeated matches, and reconstructs the matching DOM range.

Very long ChatGPT conversations may not have older messages rendered yet. In that case, Jump Points continuously navigates through the conversation while periodically checking for the target. Temporary rendering pauses are distinguished from the actual edge of the conversation so that seeking can continue as older content becomes available.

Once the target becomes available:

`conversation → adaptive seek → anchor appears → contextual match → precise landing`

Cross-chat jumps also wait for the destination conversation to finish initializing before position restoration begins.

Automatic seeking remains interruptible: user interaction can stop an active seek without treating the interruption as a failed restoration.

## Privacy

Jump Points is designed to work locally.

- No Jump Points account is required.
- No remote backend is required.
- Saved Jump Point data is stored in Chrome extension storage.
- The extension does not intentionally send saved conversation text to an external server.

Because Jump Points needs to create and restore anchors, it operates on ChatGPT page content in your browser.

## Status

**v0.12.3 — Public Beta**

The core **Select → Add → Jump → Replace** interaction is working. Navigation through long conversations is interruptible, repeated text is disambiguated using surrounding context, and same-chat and cross-chat restoration are supported.

ChatGPT's frontend can change over time. If a ChatGPT UI update breaks navigation, please open an issue with reproduction steps.

For the engineering history, see [docs/evolution.md](docs/evolution.md).

## Roadmap

The current priority is reliability and a fast three-point navigation workflow.

The next milestone is a hardened **v1.0** release. Jump Points will remain focused on navigation rather than growing into a bookmark archive with folders, tags, search, or unlimited saved points.

## Acknowledgements

Portions of the text re-anchoring implementation were adapted from [Threadmark](https://github.com/ccheney/threadmark), an open-source project licensed under the MIT License.

Jump Points builds its own navigation and restoration system around this anchoring layer, including scroll-host detection, virtualized-content seeking, bidirectional restoration, continuous cruise, cross-conversation readiness handling, and the three-point working-set interaction model.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for license and attribution details.

## License

Jump Points for ChatGPT is licensed under the MIT License.

Portions of the code are adapted from third-party open-source software and remain subject to their respective license terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).