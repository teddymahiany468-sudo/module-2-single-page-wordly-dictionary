
const form = document.getElementById("search-form");
const input = document.getElementById("word-input");
const message = document.getElementById("message");
const results = document.getElementById("results");
const audioBtn = document.getElementById("audio-button");
const audio = new Audio();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const word = input.value.trim();

    if (!word) {
        message.textContent = "Please enter a word.";
        results.hidden = true;
        return;
    }

    message.textContent = "Searching...";
    results.hidden = true;
    audioBtn.hidden = true;
    audio.pause();
    audio.removeAttribute("src");

    try {
        const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );

        if (!res.ok) throw new Error("Word not found. Try another word.");

        const data = (await res.json())[0];
        if (!data) throw new Error("No results found.");

        document.getElementById("word").textContent = data.word;

        const phonetics = data.phonetics || [];
        document.getElementById("pronunciation").textContent =
            phonetics.find(p => p.text)?.text || "No pronunciation available.";

        const sound = phonetics.find(p => p.audio)?.audio;
        audioBtn.hidden = !sound;
        if (sound) audio.src = sound;

        const defs = document.getElementById("definitions");
        const syns = document.getElementById("synonyms");
        defs.replaceChildren();
        syns.replaceChildren();
        const synonyms = new Set();

        (data.meanings || []).forEach(m => {
            const section = document.createElement("div");
            section.className = "meaning";

            const heading = document.createElement("h3");
            heading.textContent = m.partOfSpeech || "Meaning";
            section.appendChild(heading);

            (m.definitions || []).slice(0, 3).forEach(d => {
                const p = document.createElement("p");
                p.textContent = d.definition;
                section.appendChild(p);

                if (d.example) {
                    const ex = document.createElement("p");
                    ex.className = "example";
                    ex.textContent = "Example: " + d.example;
                    section.appendChild(ex);
                }
                (d.synonyms || []).forEach(s => synonyms.add(s));
            });

            (m.synonyms || []).forEach(s => synonyms.add(s));
            defs.appendChild(section);
        });

        if (!defs.hasChildNodes()) {
            defs.textContent = "No definitions available.";
        }

        const title = document.createElement("h3");
        title.textContent = "Synonyms";
        syns.appendChild(title);
        syns.append(synonyms.size
            ? [...synonyms].slice(0, 10).join(", ")
            : "No synonyms available.");

        results.hidden = false;
        message.textContent = "";
    } catch (error) {
        message.textContent = error.message === "Failed to fetch"
            ? "Connection failed. Check your internet."
            : error.message || "Something went wrong. Try again.";
    }
});

audioBtn.addEventListener("click", () => {
    audio.play().catch(() => {
        message.textContent = "Could not play audio.";
    });
});
