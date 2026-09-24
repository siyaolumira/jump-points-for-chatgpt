# Jump Points for ChatGPT

**Keep three places in reach. Jump back instantly.**

Jump Points gives you three movable points inside your ChatGPT conversations.

Place them anywhere in conversations, jump back and forth between them, and move them as your work moves. The selected text marks a position — it isn't being added to a collection.

<img src="docs/overview.png" alt="Jump Points for ChatGPT" width="700">

## What it does

- **Three global Jump Points** — three Jump Points can live **across different chats**, so the places you need are always within reach.
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
<img src="docs/step1.png" alt="Jump Points for ChatGPT" width="700">

### Replace a Jump Point

You always have three slots.

When your focus moves:

4. Select the new position you want within reach.
5. Choose **✎** on the Jump Point you no longer need.
<img src="docs/step2.png" alt="Jump Points for ChatGPT" width="700">

### Jump/Delete

6. Click the name of any Jump Point.

If it belongs to another conversation, Jump Points opens that conversation first and then navigates to the marked position.

For very long conversations, you may see the page travel through older messages while ChatGPT renders them. Once the target becomes available, Jump Points lands on the matching anchor.

If you want to stop an in-progress jump, simply click anywhere. Clicking another Jump Point stops the current jump and starts the new one.

7. Click to remove the existing points
<img src="docs/step3.png" alt="Jump Points for ChatGPT" width="700">

## Why only three?

The limit is intentional.

Jump Points are a **working set, not an archive**. They hold the few positions you are actively moving between while working through long conversations.

When a point stops being useful, move it somewhere else.

> **Jump Points are disposable, not collectible.**

## Install

### Chrome Web Store

Jump Points is available on the Chrome Web Store.

[Install Jump Points for ChatGPT](https://chromewebstore.google.com/detail/jump-points-for-chatgpt/nimboknibfklpgojdheccejojlnekiba)

### Install from source

1. Click Code → Download ZIP on this repository, then unzip the downloaded file.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Choose **Load unpacked**.
5. Select the extension **folder**.
6. Sign in to ChatGPT, open a conversation, select some text, and create your first Jump Point.

## Privacy

Jump Points is designed to work locally.

- No Jump Points account is required.
- No remote backend is required.
- Saved Jump Point data is stored in Chrome extension storage.
- The extension does not intentionally send saved conversation text to an external server.

Because Jump Points needs to create and restore anchors, it operates on ChatGPT page content in your browser.

## Status

**v0.12.4 — Public Beta**

The core **Select → Add → Jump → Replace** interaction is working. Navigation through long conversations is interruptible, repeated text is disambiguated using surrounding context, and same-chat and cross-chat restoration are supported.

v0.12.4 refines the Jump Points panel for a more compact working set, keeps removal available at all times, and improves interaction with long Jump Point names.

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