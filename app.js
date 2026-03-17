(function () {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const headerPanel = document.querySelector("[data-header-panel]");
    const languageSelect = document.querySelector("[data-language-select]");
    const siteHeader = document.querySelector(".site-header");
    const storageKey = "myzilla-language";
    const whatsappNumber = "4915563532093";

    function setMenu(open) {
        if (!menuToggle || !headerPanel) {
            return;
        }

        headerPanel.classList.toggle("is-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
    }

    if (menuToggle && headerPanel) {
        menuToggle.addEventListener("click", function () {
            const isOpen = headerPanel.classList.contains("is-open");
            setMenu(!isOpen);
        });

        document.querySelectorAll(".primary-nav a, .service-pill").forEach(function (link) {
            link.addEventListener("click", function () {
                setMenu(false);
            });
        });
    }

    function updateNode(node, lang) {
        const text = node.getAttribute("data-" + lang);

        if (!text) {
            return;
        }

        const mode = node.getAttribute("data-i18n-mode") || "text";

        if (mode === "html") {
            node.innerHTML = text;
            return;
        }

        if (mode === "placeholder") {
            node.setAttribute("placeholder", text);
            return;
        }

        if (node.tagName === "TITLE") {
            document.title = text;
            return;
        }

        node.textContent = text;
    }

    function getFieldValue(id) {
        const field = document.getElementById(id);
        return field ? field.value.trim() : "";
    }

    function getSelectedService() {
        const service = document.getElementById("service");

        if (!service || service.selectedIndex <= 0) {
            return "";
        }

        return service.value.trim();
    }

    function buildWhatsAppMessage() {
        const lang = document.documentElement.lang || "fr";
        const labels = {
            fr: {
                intro: "Bonjour, je souhaite prendre rendez-vous chez Myzila Cosmetics.",
                name: "Nom",
                email: "Email",
                phone: "Téléphone",
                service: "Service",
                date: "Date souhaitée",
                message: "Message"
            },
            en: {
                intro: "Hello, I would like to book an appointment at Myzila Cosmetics.",
                name: "Name",
                email: "Email",
                phone: "Phone",
                service: "Service",
                date: "Preferred date",
                message: "Message"
            },
            de: {
                intro: "Hallo, ich möchte einen Termin bei Myzila Cosmetics buchen.",
                name: "Name",
                email: "E-Mail",
                phone: "Telefon",
                service: "Leistung",
                date: "Wunschtermin",
                message: "Nachricht"
            }
        };
        const copy = labels[lang] || labels.fr;
        const name = getFieldValue("name");
        const email = getFieldValue("email");
        const phone = getFieldValue("phone");
        const service = getSelectedService();
        const date = getFieldValue("date");
        const message = getFieldValue("message");
        const lines = [copy.intro];

        if (name) {
            lines.push(copy.name + ": " + name);
        }

        if (email) {
            lines.push(copy.email + ": " + email);
        }

        if (phone) {
            lines.push(copy.phone + ": " + phone);
        }

        if (service) {
            lines.push(copy.service + ": " + service);
        }

        if (date) {
            lines.push(copy.date + ": " + date);
        }

        if (message) {
            lines.push("");
            lines.push(copy.message + ":");
            lines.push(message);
        }

        return lines.join("\n");
    }

    function buildWhatsAppUrl() {
        return "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(buildWhatsAppMessage());
    }

    function updateWhatsAppLinks() {
        document.querySelectorAll("[data-whatsapp-link]").forEach(function (link) {
            link.setAttribute("href", buildWhatsAppUrl());
        });
    }

    function applyLanguage(lang) {
        document.documentElement.lang = lang;

        document.querySelectorAll("[data-fr]").forEach(function (node) {
            updateNode(node, lang);
        });

        if (languageSelect) {
            languageSelect.value = lang;
        }

        updateWhatsAppLinks();

        try {
            localStorage.setItem(storageKey, lang);
        } catch (error) {
            return;
        }
    }

    const storedLanguage = (function () {
        try {
            return localStorage.getItem(storageKey);
        } catch (error) {
            return null;
        }
    })();

    const defaultLanguage =
        (languageSelect && languageSelect.getAttribute("data-default-lang")) ||
        document.documentElement.lang ||
        "fr";

    applyLanguage(storedLanguage || defaultLanguage);

    if (languageSelect) {
        languageSelect.addEventListener("change", function (event) {
            applyLanguage(event.target.value);
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (event) {
            const targetId = anchor.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();
            const headerOffset = siteHeader ? siteHeader.offsetHeight + 16 : 100;
            const topOffset = target.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: topOffset, behavior: "smooth" });
        });
    });

    const carousel = document.querySelector("[data-carousel]");

    if (carousel) {
        const track = carousel.querySelector("[data-carousel-track]");
        const dots = Array.from(carousel.querySelectorAll("[data-slide]"));
        const previousButton = carousel.querySelector("[data-carousel-prev]");
        const nextButton = carousel.querySelector("[data-carousel-next]");
        let currentSlide = 0;
        let startX = 0;
        let deltaX = 0;

        function setSlide(index) {
            if (!track || !dots.length) {
                return;
            }

            currentSlide = (index + dots.length) % dots.length;
            track.style.transform = "translateX(" + currentSlide * -100 + "%)";

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentSlide);
                dot.setAttribute("aria-current", dotIndex === currentSlide ? "true" : "false");
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const index = Number(dot.getAttribute("data-slide"));

                if (!Number.isNaN(index)) {
                    setSlide(index);
                }
            });
        });

        if (previousButton) {
            previousButton.addEventListener("click", function () {
                setSlide(currentSlide - 1);
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                setSlide(currentSlide + 1);
            });
        }

        carousel.addEventListener("touchstart", function (event) {
            startX = event.touches[0].clientX;
            deltaX = 0;
        }, { passive: true });

        carousel.addEventListener("touchmove", function (event) {
            deltaX = event.touches[0].clientX - startX;
        }, { passive: true });

        carousel.addEventListener("touchend", function () {
            if (Math.abs(deltaX) < 45) {
                return;
            }

            setSlide(currentSlide + (deltaX < 0 ? 1 : -1));
        });

        setSlide(0);
    }

    const appointmentForm = document.getElementById("appointment-form");

    if (appointmentForm) {
        appointmentForm.addEventListener("input", updateWhatsAppLinks);
        appointmentForm.addEventListener("change", updateWhatsAppLinks);
        updateWhatsAppLinks();

        appointmentForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name");
            const email = document.getElementById("email");
            const phone = document.getElementById("phone");
            const date = document.getElementById("date");
            const message = document.getElementById("message");
            const service = getSelectedService();
            const subject = "Appointment request - Myzila Cosmetics";
            const lines = [
                "Name: " + (name ? name.value : ""),
                "Email: " + (email ? email.value : ""),
                "Phone: " + (phone ? phone.value : ""),
                "Service: " + service,
                "Preferred date: " + (date ? date.value : ""),
                "",
                "Message:",
                message ? message.value : ""
            ];

            window.location.href =
                "mailto:info@myzilacosmetics.com?subject=" +
                encodeURIComponent(subject) +
                "&body=" +
                encodeURIComponent(lines.join("\n"));
        });
    }
})();
