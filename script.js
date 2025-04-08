
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
document.querySelectorAll('a[href^="#fiche"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        $("#search").val(''); // Clear the search input
        $('.fiche').show(); // Show all cards
        e.preventDefault();
        setTimeout(() => {
            const targetNumber = this.getAttribute("href").replace("#fiche", "");
            const targetElement = document.querySelectorAll(".fiche")[targetNumber - 1];
            if (targetElement) {
                targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
                });
            }
        }, 600); // Delay to allow for smooth scrolling
    });
  });
  document.querySelectorAll('.slider-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
const searchInput = document.getElementById('search');
const cards = document.getElementsByClassName('fiche');

searchInput.addEventListener('input', function() {
  const searchText = searchInput.value.trim().toLowerCase(); // Récupère le texte de recherche en minuscule

  for (let card of cards) {
    const cardText = card.textContent.toLowerCase(); // Récupère le texte de chaque carte en minuscule

    // Si le texte de la carte contient une correspondance partielle du texte de recherche
    if (cardText.includes(searchText)) {
      card.style.display = 'block'; // Affiche la carte si correspondance trouvée
    } else {
      card.style.display = 'none'; // Cache la carte sinon
    }
  }
});

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
            if (sentenceIndex < sentences.length -1) {
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
                    speech.rate = 1.1; // Slightly slower rate
                    speech.pitch = 1.4; // A slightly higher pitch for a softer tone
                    speech.volume = 0.9; // Volume level

                    // Clear #prevspeachtext and rebuild it with the current sentence
                    $('#prevspeachtext').empty(); // Remove any previous content
                    const span = $('<span>').text(sentence + '.'); // Add the current sentence wrapped in span
                    span.addClass('highlight'); // Add the highlight class to the current sentence
                    $('#prevspeachtext').append(span); // Add the highlighted sentence

                    // Now scroll the page so the corresponding sentence in .fiche is 100px from the top
                    const highlightedText = $('#prevspeachtext span.highlight').text().trim(); // Get the highlighted sentence text
                    const ficheElement = $('.fiche.active');

                    // Find the matching sentence in the .fiche.active content
                    const matchingSentenceElement = ficheElement.find('p, div, span').filter(function() {
                        return $(this).text().trim() === highlightedText;
                    });

                    // If no exact match is found, find the closest match based on common words
                    let sentenceToScroll = null;
                    if (matchingSentenceElement.length > 0) {
                        sentenceToScroll = matchingSentenceElement;
                    } else {
                        // Fuzzy matching: Find the most similar sentence based on common words
                        sentenceToScroll = findMostResemblingSentence(ficheElement, highlightedText);
                    }

                    // Scroll to the found sentence
                    if (sentenceToScroll) {
                        const elementOffsetTop = sentenceToScroll.offset().top;
                        const scrollToPosition = elementOffsetTop - 100; // Scroll 100px from the top of the screen

                        // Animate the scroll to the calculated position for the body
                        $('html, body').animate({ scrollTop: scrollToPosition }, 300);
                    }

                    // Once the speech ends, move to the next sentence
                    speech.onend = function() {
                        sentenceIndex++;
                        speakNextSentence(); // Recursively speak the next sentence
                    };

                    // Start speaking the current sentence
                    window.speechSynthesis.speak(speech);
                }
            } else {
                $('#prevspeachtext').hide(''); // Optionally update UI after all text is read
                estimateReadingTime('fiche-content', 'reading-time');
            }
        }

        // Start reading the first sentence
        speakNextSentence();
    } else {
        alert('Erreur de lecture!');
    }
});

// Function to find the most resembling sentence in .fiche.active based on common words
function findMostResemblingSentence(ficheElement, highlightedText) {
    let bestMatch = null;
    let highestSimilarity = 0;

    // Convert the highlighted sentence into a set of words (split by spaces)
    const highlightedWords = new Set(highlightedText.split(/\s+/).map(word => word.toLowerCase()));

    ficheElement.find('p, div, span').each(function() {
        const currentSentence = $(this).text().trim();
        const currentWords = new Set(currentSentence.split(/\s+/).map(word => word.toLowerCase()));

        // Calculate the intersection (common words) between highlighted sentence and current sentence
        const commonWords = getCommonWords(highlightedWords, currentWords);

        // If the current sentence has more common words, it's a better match
        if (commonWords.length > highestSimilarity) {
            highestSimilarity = commonWords.length;
            bestMatch = $(this);
        }
    });

    return bestMatch;
}

// Function to get the common words between two sets
function getCommonWords(set1, set2) {
    const commonWords = [];
    set1.forEach(word => {
        if (set2.has(word)) {
            commonWords.push(word);
        }
    });
    return commonWords;
}



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