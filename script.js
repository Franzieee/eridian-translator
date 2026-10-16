
const ZERO = "🎵";
const ONE = "🎶";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Six bits can represent 64 different values.
// 0–25 = uppercase A–Z
// 26–51 = lowercase a–z
// 52–63 = reserved

function encodeLetter(letter) {
  const upperIndex = ALPHABET.indexOf(letter.toUpperCase());

  if (upperIndex === -1) return letter;

  const index = letter === letter.toLowerCase()
    ? upperIndex + 26
    : upperIndex;

  const binary = index.toString(2).padStart(6, "0");

  return [...binary]
    .map(bit => bit === "0" ? ZERO : ONE)
    .join("");
}

function decodeBits(bits) {
  const number = parseInt(bits, 2);

  if (number >= 0 && number < 26) {
    return ALPHABET[number];
  }

  if (number >= 26 && number < 52) {
    return ALPHABET[number - 26].toLowerCase();
  }

  // Preserve invalid groups instead of silently losing them.
  return [...bits]
    .map(bit => bit === "0" ? ZERO : ONE)
    .join("");
}

function englishToEridian(text) {
  return Array.from(text)
    .map(character =>
      /^[a-z]$/i.test(character)
        ? encodeLetter(character)
        : character
    )
    .join("");
}

function eridianToEnglish(text) {
  let output = "";
  let bits = "";

  for (const character of Array.from(text)) {
    if (character === ZERO) {
      bits += "0";
    } else if (character === ONE) {
      bits += "1";
    } else {
      // Preserve incomplete groups instead of discarding them.
      if (bits.length > 0) {
        output += [...bits]
          .map(bit => bit === "0" ? ZERO : ONE)
          .join("");

        bits = "";
      }

      output += character;
      continue;
    }

    if (bits.length === 6) {
      output += decodeBits(bits);
      bits = "";
    }
  }

  if (bits.length > 0) {
    output += [...bits]
      .map(bit => bit === "0" ? ZERO : ONE)
      .join("");
  }

  return output;
}

// Check for accented or non-English letters.
function hasUnsupportedLetters(text) {
  return Array.from(text).some(character =>
    /\p{L}/u.test(character) && !/^[a-z]$/i.test(character)
  );
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

    output.value =
      direction === "english-to-eridian"
        ? englishToEridian(text)
        : eridianToEnglish(text);

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

      // Swap the current text into the new input direction.
      input.value = output.value;
      translate();

      input.focus();
    });
  });

  input.addEventListener("input", translate);

  clearButton.addEventListener("click", () => {
    input.value = "";
    output.value = "";
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
      // Fallback for browsers that block clipboard access.
      output.focus();
      output.select();

      const copied = document.execCommand("copy");
      status.textContent = copied
        ? "Translation copied! 🎵🎶"
        : "Copy failed. Please select and copy the text manually.";
    }
  });

  translate();
});