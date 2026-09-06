# Jump Points for ChatGPT

**Keep three places in reach. Jump back instantly.**

Jump Points gives you three temporary positions you can return to while working in long ChatGPT conversations.

**Select → Add → Jump → Replace.**

When a Jump Point stops being useful, replace it with where you need to be next. No growing bookmark collection to organize or clean up.

## What it does

- Keep up to **3 global Jump Points**
- Create a point from selected text
- Jump back within the same conversation
- Jump across ChatGPT conversations
- Restore positions even in long, virtualized conversations
- Replace old Jump Points quickly as your focus changes
- Store Jump Points locally in your browser

## How to use

### Add

Select some text in a ChatGPT conversation, then click **+ Add selected text** and give the Jump Point a name.

### Jump

Click any saved Jump Point to return to it.

For distant positions in long conversations, Jump Points automatically navigates through the conversation until the target becomes available, then lands on the selected text.

### Replace

Select a new piece of text while your three slots are full.

Each existing Jump Point will show a **Replace** action. Choose the point you no longer need, and the new location takes its place.

## Why only three?

Jump Points is designed as a **working set**, not an archive.

The goal is not to build a permanent collection of bookmarks. It is to keep the few places you are actively moving between immediately available.

**Jump Points are disposable, not collectible.**

## Install — Public Beta

1. Click **Code → Download ZIP** on this repository, then unzip the downloaded file.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the unzipped repository folder.
6. Open ChatGPT, select some text, and create your first Jump Point.

## How it works

Restoring a position in a long ChatGPT conversation is more complicated than scrolling to a saved percentage.

Older parts of a conversation may not currently exist in the DOM. Jump Points therefore separates restoration into two problems:

1. **Navigation** — move through the conversation until the relevant content is rendered.
2. **Re-anchoring** — locate the selected text and surrounding context, reconstruct its DOM range, and land precisely on it.

The navigation layer handles scroll-host detection, virtualized content, long-distance bidirectional seeking, cross-conversation restoration, and continuous adaptive scrolling.

More details are available in [`docs/evolution.md`](docs/evolution.md).

## Privacy

Jump Points reads user-selected text and nearby textual context from ChatGPT pages solely to create and restore navigation anchors.

This data is stored locally using Chrome extension storage and is not intentionally transmitted to an external server.

## Acknowledgements

Portions of the text re-anchoring implementation were adapted from [Threadmark](https://github.com/ccheney/threadmark), an open-source project licensed under the MIT License.

Jump Points builds its own navigation and restoration system around this anchoring layer to handle virtualized ChatGPT conversations, long-distance bidirectional seeking, cross-conversation restoration, and continuous scrolling.

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for attribution and license details.

## Status

**v0.12.1 — Public Beta**

The current release focuses on the core interaction:

**Select → Add → Jump → Replace.**

The next milestone is a stable **v1.0** release for the Chrome Web Store.

## License

Jump Points for ChatGPT is licensed under the MIT License. See [`LICENSE`](LICENSE).

Third-party components and adapted code remain subject to their respective licenses. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).