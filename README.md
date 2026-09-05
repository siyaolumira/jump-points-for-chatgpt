# Jump Points for ChatGPT

**Keep three places in reach. Jump back instantly.**

Long ChatGPT conversations are useful, but getting back to the exact place you were working from can be surprisingly painful.

Jump Points gives you **three temporary positions** you can drop anywhere in your ChatGPT conversations and return to later.

**Select → Add → Jump → Replace.**

When a Jump Point stops being useful, replace it with where you need to be next. No growing bookmark collection to organize or clean up.

## What it does

- **Three global Jump Points** — keep the few places that matter right now.
- **Selection-based anchors** — select the text you want to return to.
- **Same-chat and cross-chat jumps** — use ChatGPT's sidebar normally; Jump Points handles the position.
- **Long-distance restoration** — navigates through lazily rendered conversations until the saved text becomes available.
- **Fast replacement** — when all three slots are full, select new text and replace any existing point.
- **Local storage** — Jump Point data stays in your browser.

## How to use it

### Add a Jump Point

1. Select text anywhere in a ChatGPT conversation.
2. Click **Add selected text**.
3. Give the Jump Point a short name.

### Jump back

Click the name of any saved Jump Point. If it belongs to another conversation, Jump Points opens that conversation first and then restores the saved position.

For very long conversations, you may see the page smoothly travel through older messages while ChatGPT renders them. Once the saved text becomes available, Jump Points lands on the exact anchor.

### Replace a Jump Point

You always have three slots.

When all three are in use:

1. Select the new text you want to keep.
2. Choose **Replace** on the Jump Point you no longer need.
3. The old point is immediately replaced by the new one.

There is no need to delete old bookmarks, create folders, or maintain a growing archive.

## Why only three?

The limit is intentional.

Jump Points are a **working set, not an archive**. They are meant to hold the few places you are actively moving between while working through long conversations.

When a point stops being useful, replace it.

> **Jump Points are disposable, not collectible.**

## Install the public beta

Jump Points is not yet on the Chrome Web Store.

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Choose **Load unpacked**.
5. Select this repository folder.
6. Open ChatGPT, select some text, and create your first Jump Point.

## How it works

A Jump Point stores the selected text together with surrounding context and the originating ChatGPT conversation. When you jump back, the extension searches the rendered DOM for the anchor and reconstructs the matching range.

Very long ChatGPT conversations may not have older messages rendered yet. In that case, Jump Points uses a continuous adaptive seek to move through the conversation while periodically checking for the anchor.

Once the target becomes available:

`conversation → adaptive seek → anchor found → precise landing`

Cross-chat jumps also wait for the destination conversation to finish initializing before position restoration begins.

## Privacy

Jump Points is designed to work locally.

- No Jump Points account is required.
- No remote backend is required.
- Saved Jump Point data is stored in Chrome extension storage.
- The extension does not intentionally send saved conversation text to an external server.

Because Jump Points needs to create and restore anchors, it operates on ChatGPT page content in your browser.

## Status

**v0.12.1 — Public Beta**

The core interaction is working, but ChatGPT's frontend can change over time. If a ChatGPT UI update breaks navigation, please open an issue with reproduction steps.

For the engineering history from the first prototype through continuous adaptive seeking, see [docs/evolution.md](docs/evolution.md).

## Roadmap

The next target is a hardened **v1.0** release for the Chrome Web Store.

The current priority is reliability and a fast three-point workflow—not folders, tags, search, or unlimited bookmarks.

## License

MIT
