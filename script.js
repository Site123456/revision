
$('#prevspeachtext').hide('');
function getBestVoice(language) {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === language && v.name.toLowerCase().includes('google'));

    // If no good voice found, fall back to a default French voice
    if (voice) {
        return voice;
    }

    return voices.find(v => v.lang === language) || null;
}

$('#readaloud').click(function() {
    const textElement = $('.fiche.active'); // Get the active text element
    var text = textElement.text();
    $('#prevspeachtext').show('');
    
    if (text !== "") {
        const sentences = text.split(/[.?!]/); // Split the text into sentences based on punctuation marks
        let sentenceIndex = 0; // Start at the first sentence

        // Calculate the number of words in the text
        const wordCount = text.split(/\s+/).length;
        
        // Estimate the reading time
        const wordsPerMinute = 150; // Standard reading speed (adjustable)
        const readingTimeInMinutes = wordCount / wordsPerMinute;
        const readingTimeInSeconds = Math.round(readingTimeInMinutes * 60);

        // Display the estimated reading time
        $('#reading-time').text(`Lecture auto: ${readingTimeInSeconds} seconds`);

        // Function to speak the next sentence
        function speakNextSentence() {
            if (sentenceIndex < sentences.length) {
                const sentence = sentences[sentenceIndex].trim();
                if (sentence) {
                    const speech = new SpeechSynthesisUtterance();
                    speech.text = sentence + "."; // Add the punctuation mark back for proper tone
                    speech.lang = 'fr-FR'; // Set language to French
                    
                    const voice = getBestVoice('fr-FR'); // Adjust language as needed
                    if (voice) {
                        speech.voice = voice; // Use the selected voice
                    }

                    // Natural Speech Settings
                    speech.rate = 0.9; // Slightly slower rate
                    speech.pitch = 1.2; // A slightly higher pitch for a softer tone
                    speech.volume = 0.9; // Volume level

                    // Clear #prevspeachtext and rebuild it with the current sentence
                    $('#prevspeachtext').empty(); // Remove any previous content
                    const span = $('<span>').text(sentence + '.'); // Add the current sentence wrapped in span
                    span.addClass('highlight'); // Add the highlight class to the current sentence
                    $('#prevspeachtext').append(span); // Add the highlighted sentence

                    // Once the speech ends, move to the next sentence
                    speech.onend = function() {
                        sentenceIndex++;
                        speakNextSentence(); // Recursively speak the next sentence
                    };

                    // Start speaking the current sentence
                    window.speechSynthesis.speak(speech);
                }
            } else {
                $('#prevspeachtext').hide('');
                estimateReadingTime('fiche-content', 'reading-time');
            }
        }

        // Start reading the first sentence
        speakNextSentence();
    } else {
        alert('Please enter some text!');
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Function to set a cookie
  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

$(document).ready(function () {
    const themeToggle = document.getElementById('theme-toggle');
    const themeLink = document.getElementById('theme-style');
    const savedTheme = getCookie('theme');
    if (savedTheme === 'light') {
        themeLink.href = 'light.css';
        themeToggle.classList.replace('bx-moon', 'bx-sun');
    }
    if (savedTheme === 'dark') {
        themeLink.href = 'style.css';
        themeToggle.classList.replace('bx-sun', 'bx-moon');
    }
    themeToggle.addEventListener('click', () => {
        const isDark = themeLink.href.includes('style.css');
        const newTheme = isDark ? 'light' : 'dark';

        themeLink.href = isDark ? 'light.css' : 'style.css';
        themeToggle.classList.toggle('bx-sun');
        themeToggle.classList.toggle('bx-moon');
        setCookie('theme', newTheme);
    });
    const $fiches = $(".fiche");

    function setActiveFiche($fiche) {
        $fiches.removeClass("active");
        if ($fiche && $fiche.length) {
            $fiche.addClass("active");
        }
        document.title = $fiche.find("h3").text() + " - Philosophie";
        var estimatedcurrentfichereadtime = Math.ceil($fiche.text().trim().split(/\s+/).length / 60);
        document.getElementById("activefichedetails").innerHTML = " " + $fiche.find("h3").text() + " - " + estimatedcurrentfichereadtime + " min";
    }

    // Set first fiche as active if none
    if ($(".fiche.active").length === 0 && $fiches.length > 0) {
        setActiveFiche($fiches.first());
    }

    function scrollToFiche($fiche) {
        if ($fiche && $fiche.length) {
            $("html, body").animate({
                scrollTop: $fiche.offset().top + 20 // adjust as needed
            }, 60);
        }
    }

    $("#prevfiche").on("click", function () {
        const $current = $(".fiche.active");
        const $prev = $current.prevAll(".fiche").first();
        if ($prev.length) {
            setActiveFiche($prev);
            scrollToFiche($prev);
        }
    });

    $("#nextfiche").on("click", function () {
        const $current = $(".fiche.active");
        const $next = $current.nextAll(".fiche").first();
        if ($next.length) {
            setActiveFiche($next);
            scrollToFiche($next);
        }
    });

    $(window).on("scroll", function () {
        const scrollTop = $(this).scrollTop();
        let docHeight = $(document).height();
        let winHeight = $(window).height();
        let scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
        $("#scroll-progress-bar").css("width", scrollPercent + "%");

        $fiches.each(function () {
            const $fiche = $(this);
            const offsetTop = $fiche.offset().top;
            const offsetBottom = offsetTop + $fiche.outerHeight();

            if (scrollTop >= offsetTop - 20 && scrollTop < offsetBottom - 20) {
                setActiveFiche($fiche);
                return false; // break loop once active one is found
            }
        });
    });
});
document.getElementById("print").addEventListener("click", function () {
    window.print();
});

function estimateReadingTime(containerId, displayId) {
    const container = document.getElementById(containerId);
    const display = document.getElementById(displayId);
    const wordsPerMinute = 60;

    if (container) {
        const text = container.innerText || container.textContent;
        const wordCount = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        
        display.textContent = `⏱️ Estimation: ${minutes} min`;
    }
}

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
    estimateReadingTime('fiche-content', 'reading-time');
});