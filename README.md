
# Eridian Translator 🎵🎶

A free, fan-made English ↔ Eridian translator.

## Features

- English-to-Eridian translation
- Eridian-to-English decoding
- Live translation while typing or pasting
- Copy and clear buttons
- Preserves spaces, punctuation, digits, and symbols
- Responsive desktop and mobile layout
- Client-side processing without a backend or database
- FAQ and optional Ko-fi support link

## Encoding rules

- 🎵 represents binary 0.
- 🎶 represents binary 1.
- Every English letter is encoded using exactly six bits.
- Codes 0–25 represent uppercase A–Z.
- Codes 26–51 represent lowercase a–z.
- Spaces, punctuation, numbers, and symbols remain unchanged.
- Accented letters such as ø, é, and ñ are unsupported.
- Do not insert, remove, or alter spaces within note sequences.
- Each letter requires six consecutive music-note emojis.
- Original capitalization is preserved when decoding valid text.
- Messages encoded using the old five-bit format are incompatible.

## Privacy

Translation occurs locally in the visitor's browser.
The core translator does not require a backend or database.
Voluntary Ko-fi tips are appreciated but are never required.


## Run locally

1. Download or clone this repository.
2. Keep index.html, style.css, and script.js in the same folder.
3. Open index.html in a modern web browser.

## Deploy with GitHub Pages

1. Create a GitHub repository named eridian-translator.
2. Upload index.html, style.css, script.js, and README.md.
3. Open the repository's Settings.
4. Select Pages.
5. Under Build and deployment, select Deploy from a branch.
6. Choose the main branch and the root folder (/).
7. Save and wait for deployment to finish.

Your website should be available at:

https://YOURUSERNAME.github.io/eridian-translator/

Replace YOURUSERNAME with your GitHub username.

## Privacy

The translator processes text locally in the browser.
It does not need a server or database to translate text.
Avoid entering sensitive personal information into any public website.

## Support

This is a non-profit fan project. Voluntary Ko-fi tips
are appreciated but are not required.
