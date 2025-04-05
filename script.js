

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