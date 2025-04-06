function getBestVoice(language) {
    const voices = window.speechSynthesis.getVoices();
    // Attempt to find a voice based on the language (French)
    const voice = voices.find(v => v.lang === language && v.name.toLowerCase().includes('google'));
    
    // If no good voice found, fall back to a default French voice
    if (voice) {
      return voice;
    }
    
    // If no Google voice, try any French voice as fallback
    return voices.find(v => v.lang === language) || null;
}

$('#readaloud').click(function() {
    const textElement = $('.fiche.active'); // Get the active text element
    const text = textElement.text();
    
    if (text !== "") {
      const speech = new SpeechSynthesisUtterance();
      speech.text = text;
      
      // Set language to French
      speech.lang = 'fr-FR'; // French (France) - You can try 'fr-CA' for Canadian French or others if needed.
      
      const voice = getBestVoice('fr-FR'); // Adjust language as needed
      if (voice) {
        speech.voice = voice; // Use the selected voice
      }
      speech.rate = 1.2; // Adjust the rate of speech (1 is normal speed)
        $('#prevspeachtext').text(text); // Clear previous text
        var words = text.split(' '); // Split the text into words
        let currentWordIndex = 0; // Initialize current word index

        // Function to highlight text
        const highlightText = () => {
            $('#prevspeachtext').empty(); // Clear the previous highlighted text
            // Loop through the words starting from the current word index
            words.slice(currentWordIndex).forEach((word, index) => {
                const span = $('<span>').text(word + ' ');
                if (index === 0) {
                    span.addClass('highlight'); // Add a CSS class to the current word
                }
                $('#prevspeachtext').append(span); // Append the word to the element
            });
        };

        // Set the event for word boundaries
        speech.onboundary = function(event) {
            if (event.name === 'word') {
                currentWordIndex = words.indexOf(event.char); // Find the index of the word being spoken
                highlightText(); // Call the highlightText function to update the display
            }
        };


      speech.onend = function() {
        // Optionally restore the text or update it after reading finishes
        $('#currently-reading').text('Finished reading the text');
        };
      // Start reading the text aloud in French
      window.speechSynthesis.speak(speech);
      
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