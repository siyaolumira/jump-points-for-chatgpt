# Third-Party Notices

Jump Points for ChatGPT includes portions of code adapted from third-party open-source software.

## Threadmark

Portions of the text re-anchoring implementation in Jump Points for ChatGPT were adapted from Threadmark:

https://github.com/ccheney/threadmark

The adapted portions relate to locating selected text within the DOM, reconstructing DOM ranges, handling whitespace-normalized matching, and using surrounding textual context to disambiguate candidate matches.

Jump Points for ChatGPT adds its own navigation and restoration system around this anchoring layer, including scroll-host detection, virtualized-content seeking, bidirectional restoration, continuous cruise, cross-conversation readiness handling, and the three-point working-set interaction model.

Threadmark is licensed under the MIT License.

### Threadmark License

MIT License

Copyright (c) 2025 Threadmark contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.