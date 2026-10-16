
const ZERO = "🎵";
const ONE = "🎶";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Six bits can represent 64 different values.
// 0–25 = uppercase A–Z
// 26–51 = lowercase a–z
// 52–63 = reserved

function bitsToNotes(bits) {
  return [...bits]
    .map(bit => bit === "0" ? ZERO : ONE)
    .join("");
}

function encodeLetter(letter) {
  const upperIndex = ALPHABET.indexOf(letter.toUpperCase());

  if (upperIndex === -1) return letter;

  const index = letter === letter.toLowerCase()
    ? upperIndex + 26
    : upperIndex;

  return bitsToNotes(index.toString(2).padStart(6, "0"));
}

function encodeDigit(digit) {
  // 63 is the reserved escape marker.
  // The next six bits represent the digit (0–9).
  const marker = "111111";
  const digitBits = Number(digit).toString(2).padStart(6, "0");

  return bitsToNotes(marker + digitBits);
}

function decodeBits(bits) {
  const number = parseInt(bits, 2);

  if (number >= 0 && number < 26) {
    return ALPHABET[number];
  }

  if (number >= 26 && number < 52) {
    return ALPHABET[number - 26].toLowerCase();
  }

  return bitsToNotes(bits);
}

function englishToEridian(text) {
  return Array.from(text)
    .map(character => {
      if (/^[a-z]$/i.test(character)) {
        return encodeLetter(character);
      }

      if (/^[0-9]$/.test(character)) {
        return encodeDigit(character);
      }

      return character;
    })
    .join("");
}

function decodeNoteSequence(bits) {
  let output = "";

  while (bits.length >= 6) {
    const group = bits.slice(0, 6);
    const number = parseInt(group, 2);

    // Escape marker: the following group represents a digit.
    if (number === 63 && bits.length >= 12) {
      const digitBits = bits.slice(6, 12);
      const digit = parseInt(digitBits, 2);

      if (digit >= 0 && digit <= 9) {
        output += String(digit);
        bits = bits.slice(12);
        continue;
      }
    }

    // Preserve reserved or invalid groups as music notes.
    output += decodeBits(group);
    bits = bits.slice(6);
  }

  // Preserve incomplete trailing groups.
  output += bitsToNotes(bits);

  return output;
}


function eridianToEnglish(text) {
  // Remove accidental spaces at the very end,
  // but preserve spaces between words.
  text = text.trimEnd();

  let output = "";
  let bits = "";

  for (const character of Array.from(text)) {
    if (character === ZERO) {
      bits += "0";
    } else if (character === ONE) {
      bits += "1";
    } else {
      output += decodeNoteSequence(bits);
      bits = "";
      output += character;
    }
  }

  output += decodeNoteSequence(bits);

  return output;
}

// Check for accented or non-English letters.
function hasUnsupportedLetters(text) {
  return Array.from(text).some(character =>
    /\p{L}/u.test(character) && !/^[a-z]$/i.test(character)
  );
}





function renderNotePreview(text, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  preview.replaceChildren();

  for (const character of Array.from(text)) {
    if (character === ZERO || character === ONE) {
      const image = document.createElement("img");

      // Give each note its own class.
      image.className = character === ZERO
        ? "eridian-emoji zero"
        : "eridian-emoji one";

      image.src = character === ZERO
        ? "./assets/music-note-zero.svg"
        : "./assets/music-note-one.svg";

      image.alt = character;
      image.draggable = false;
      image.setAttribute("aria-hidden", "true");

      // Show a readable fallback if the SVG file is missing.
      image.onerror = () => {
        image.replaceWith(document.createTextNode(character));
      };

      preview.appendChild(image);
    } else {
      preview.appendChild(document.createTextNode(character));
    }
  }
}

function renderOutputPreview(text) {
  renderNotePreview(text, "outputPreview");
}

function renderInputPreview(text) {
  renderNotePreview(text, "inputPreview");
}

// Connect the translation engine to the website.
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("inputText");
  const output = document.getElementById("outputText");
  const status = document.getElementById("statusMessage");
  const warning = document.getElementById("warningMessage");
  const copyButton = document.getElementById("copyButton");
  const clearButton = document.getElementById("clearButton");
  const directionButtons = document.querySelectorAll(".direction-btn");


  let direction = "english-to-eridian";

  function translate() {
  const text = input.value;

  // Keep the input preview synchronized with the real input.
  renderInputPreview(text);

  output.value =
    direction === "english-to-eridian"
      ? englishToEridian(text)
      : eridianToEnglish(text);

  // Render colored emojis in the output preview.
  renderOutputPreview(output.value);

  warning.textContent = hasUnsupportedLetters(text)
    ? "Some special or accented characters are present. They may not translate as expected."
    : "";

  status.textContent = text.length
    ? `${text.length} characters`
    : "Your translation will appear here.";
}

  directionButtons.forEach(button => {
    button.addEventListener("click", () => {
      direction = button.dataset.direction;

      directionButtons.forEach(item => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      
      // Switching direction starts with a clean translator.
      input.value = "";
      output.value = "";

      renderInputPreview("");
      renderOutputPreview("");

      warning.textContent = "";
      status.textContent = "Your translation will appear here.";

      input.focus();

    });
  });

  
  input.addEventListener("input", translate);

  
  input.addEventListener("scroll", () => {
    const inputPreview = document.getElementById("inputPreview");

    if (inputPreview) {
      inputPreview.scrollTop = input.scrollTop;
      inputPreview.scrollLeft = input.scrollLeft;
    }
  });


  clearButton.addEventListener("click", () => {
  input.value = "";
  output.value = "";

  // Clear both visual previews.
  renderInputPreview("");
  renderOutputPreview("");

  warning.textContent = "";
  status.textContent = "Your translation will appear here.";

  input.focus();
});

  copyButton.addEventListener("click", async () => {
    if (!output.value) {
      status.textContent = "There's nothing to copy yet.";
      return;
    }

    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = "Translation copied! 🎵🎶";
    } catch {
        const temporary = document.createElement("textarea");
        temporary.value = output.value;
        temporary.style.position = "fixed";
        temporary.style.left = "-10000px";

        document.body.appendChild(temporary);
        temporary.select();

        const copied = document.execCommand("copy");
        temporary.remove();

        status.textContent = copied
          ? "Translation copied!"
          : "Copy failed. Please copy the text manually.";
      }
  });

  translate();
});
