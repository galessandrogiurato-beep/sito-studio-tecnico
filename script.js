(() => {
  const header = document.getElementById("header");
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const year = document.getElementById("year");
  const WHATSAPP_NUMBER = "393516543517";

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const closeNav = () => {
    nav?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Apri il menu");
  };

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const buildWhatsAppUrl = (text) => {
    const message = encodeURIComponent(text);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    status.className = "form-status";

    const data = new FormData(form);
    const nome = String(data.get("nome") || "").trim();
    const email = String(data.get("email") || "").trim();
    const telefono = String(data.get("telefono") || "").trim();
    const servizio = String(data.get("servizio") || "").trim();
    const messaggio = String(data.get("messaggio") || "").trim();
    const privacy = data.get("privacy");

    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));

    const required = [
      form.elements.namedItem("nome"),
      form.elements.namedItem("email"),
      form.elements.namedItem("servizio"),
      form.elements.namedItem("messaggio"),
    ];

    let valid = true;
    required.forEach((field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        if (!String(field.value).trim()) {
          field.classList.add("invalid");
          valid = false;
        }
      }
    });

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      form.elements.namedItem("email")?.classList.add("invalid");
      valid = false;
    }

    if (!privacy) valid = false;

    if (!valid) {
      status.textContent = "Controlla i campi obbligatori e riprova.";
      status.classList.add("err");
      return;
    }

    const summary = [
      `Buongiorno, sono ${nome}.`,
      `Email: ${email}`,
      telefono ? `Telefono: ${telefono}` : null,
      `Servizio: ${servizio}`,
      "",
      messaggio,
    ]
      .filter(Boolean)
      .join("\n");

    status.textContent = "Richiesta pronta. Ti apro WhatsApp per l’invio diretto.";
    status.classList.add("ok");
    form.reset();
    window.open(buildWhatsAppUrl(summary), "_blank", "noopener,noreferrer");
  });

  // Cadastral Map Viewer Layer Switcher & Query Form
  const mapIframe = document.getElementById("catastralMapIframe");
  const layerBtns = document.querySelectorAll(".map-layer-btn");
  const catastralForm = document.getElementById("catastralForm");
  const foglioInput = document.getElementById("foglioInput");
  const particellaInput = document.getElementById("particellaInput");

  layerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      layerBtns.forEach((b) => {
        b.classList.remove("btn-gold");
        b.classList.add("btn-ghost");
        b.style.color = "var(--navy)";
        b.style.borderColor = "#d7d2c8";
      });
      btn.classList.remove("btn-ghost");
      btn.classList.add("btn-gold");
      btn.style.color = "var(--navy)";
      btn.style.borderColor = "transparent";

      const type = btn.getAttribute("data-type") || "m";
      if (mapIframe) {
        mapIframe.src = `https://maps.google.com/maps?q=Corso+Savoia+46,+96019+Rosolini+SR&t=${type}&z=17&ie=UTF8&iwloc=&output=embed`;
      }
    });
  });

  catastralForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const foglio = foglioInput?.value.trim() || "";
    const particella = particellaInput?.value.trim() || "";

    const msg = [
      "Buongiorno, vorrei richiedere una verifica catastale / rilievo per:",
      `Comune: Rosolini (SR)`,
      `Foglio: ${foglio}`,
      `Particella: ${particella}`,
    ].join("\n");

    window.open(buildWhatsAppUrl(msg), "_blank", "noopener,noreferrer");
  });
})();
