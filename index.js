
const form = document.getElementById("search-form");
const input = document.getElementById("word-input");
const message = document.getElementById("message");
const results = document.getElementById("results");
const audioButton = document.getElementById("audio-button");
const audio = new Audio();

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const word = input.value.trim();

    if (!word) {
        message.textContent = "Please enter a word.";
        results.hidden = true;
        return;
    }

    message.textContent = "Searching...";
    results.hidden = true;
    audioButton.hidden = true;
    audio.pause();

    try {
        const response = await fetch(
            "https://api.dictionaryapi.dev/api/v2/entries/en/" +
            encodeURIComponent(word)
        );

        if (!response.ok) {
            throw new Error("Word not found.");
        }

        const data = await response.json();
        showWord(data[0]);
        results.hidden = false;
        message.textContent = "";

    } catch (error) {
        message.textContent = error.message === "Word not found."
            ? error.message
            : "Something went wrong. Check your internet.";
    }
});

function showWord(data) {
    document.getElementById("word").textContent = data.word;

    const phonetics = data.phonetics || [];
    const sound = phonetics.find(item => item.audio);
    const pronunciation = phonetics.find(item => item.text);

    document.getElementById("pronunciation").textContent =
        pronunciation ? pronunciation.text : "No pronunciation available.";

    audioButton.hidden = !sound;

    if (sound) {
        audio.src = sound.audio;
    }

    const definitions = document.getElementById("definitions");
    const synonymsBox = document.getElementById("synonyms");

    definitions.replaceChildren();
    synonymsBox.replaceChildren();

    const synonyms = new Set();

    (data.meanings || []).forEach(meaning => {
        const section = document.createElement("div");
        section.className = "meaning";

        const heading = document.createElement("h3");
        heading.textContent = meaning.partOfSpeech;
        section.appendChild(heading);

        (meaning.definitions || []).slice(0, 3).forEach(item => {
            const paragraph = document.createElement("p");
            paragraph.textContent = item.definition;
            section.appendChild(paragraph);

            if (item.example) {
                const example = document.createElement("p");
                example.className = "example";
                example.textContent = "Example: " + item.example;
                section.appendChild(example);
            }

            (item.synonyms || []).forEach(word => synonyms.add(word));
        });

        (meaning.synonyms || []).forEach(word => synonyms.add(word));
        definitions.appendChild(section);
    });

    const title = document.createElement("h3");
    title.textContent = "Synonyms";
    synonymsBox.appendChild(title);

    if (synonyms.size === 0) {
        synonymsBox.append("No synonyms available.");
    }

    Array.from(synonyms).slice(0, 10).forEach(word => {
        const tag = document.createElement("span");
        tag.className = "synonym";
        tag.textContent = word + " ";
        synonymsBox.appendChild(tag);
    });
}

audioButton.addEventListener("click", function() {
    audio.play().catch(() => {
        message.textContent = "Could not play the audio.";
    });
});
