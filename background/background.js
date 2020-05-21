browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { word, lang } = request,
        url = `https://www.wordnik.com/words/${word}`

    fetch(url, { method: 'GET'})
        .then((response) => response.text())
        .then((text) => {
            const document = new DOMParser().parseFromString(text, 'text/html'),
                content = extractMeaning(document, { word, lang });

            if (content) { saveWord(content); }

            sendResponse({ content });
        })

    return true;
});

function extractMeaning (document, context) {
    var definitions = document.querySelectorAll('div.guts.active ul li')

    if (definitions.length === 0) { return null; }

    var meaning = definitions[0].textContent

    var audio = document.querySelectorAll('div.pronunciations.sounds ul li')
    var audioSrc;

    if (audio && audio.length > 0) {
      let player;

      // use the second audio src if available
      if (audio.length > 1) {
        player = audio[0].getElementsByClassName('player')[0]
      } else {
        player = audio[0].getElementsByClassName('player')[1]
      }

      let sound = player.getElementsByClassName('play_sound')[0]
      audioSrc = sound.getAttribute('doc-fileurl')
    }

    return { word: context.word, meaning: meaning, audioSrc: audioSrc };
};
