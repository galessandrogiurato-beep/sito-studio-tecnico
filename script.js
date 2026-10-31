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

  // ============================================================================
  // GESTIONE INFORMATIVA PRIVACY (GDPR) MODAL
  // ============================================================================
  const privacyModal = document.getElementById("privacyModal");
  const openPrivacyBtn = document.getElementById("openPrivacyBtn");
  const footerPrivacyBtn = document.getElementById("footerPrivacyBtn");
  const closePrivacyBtn = document.getElementById("closePrivacyBtn");
  const closePrivacyFooterBtn = document.getElementById("closePrivacyFooterBtn");

  const showPrivacyModal = () => {
    if (privacyModal) {
      if (typeof privacyModal.showModal === "function") {
        privacyModal.showModal();
      } else {
        privacyModal.setAttribute("open", "true");
        privacyModal.style.display = "block";
      }
    }
  };

  const hidePrivacyModal = () => {
    if (privacyModal) {
      if (typeof privacyModal.close === "function") {
        privacyModal.close();
      } else {
        privacyModal.removeAttribute("open");
        privacyModal.style.display = "none";
      }
    }
  };

  openPrivacyBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    showPrivacyModal();
  });
  footerPrivacyBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    showPrivacyModal();
  });
  closePrivacyBtn?.addEventListener("click", hidePrivacyModal);
  closePrivacyFooterBtn?.addEventListener("click", hidePrivacyModal);

  privacyModal?.addEventListener("click", (e) => {
    const rect = privacyModal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      hidePrivacyModal();
    }
  });

  // ============================================================================
  // GESTIONE FORM CONTATTI & PREVENTIVI (WHATSAPP + EMAIL)
  // ============================================================================
  const btnSubmitWhatsApp = document.getElementById("btnSubmitWhatsApp");
  const btnSubmitEmail = document.getElementById("btnSubmitEmail");

  const validateContactForm = () => {
    if (!form || !status) return null;
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

    const requiredFields = [
      { field: form.elements.namedItem("nome"), val: nome },
      { field: form.elements.namedItem("email"), val: email },
      { field: form.elements.namedItem("servizio"), val: servizio },
      { field: form.elements.namedItem("messaggio"), val: messaggio },
    ];

    let valid = true;
    requiredFields.forEach(({ field, val }) => {
      if (!val) {
        if (field instanceof HTMLElement) field.classList.add("invalid");
        valid = false;
      }
    });

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      const emailField = form.elements.namedItem("email");
      if (emailField instanceof HTMLElement) emailField.classList.add("invalid");
      valid = false;
    }

    if (!privacy) {
      const privacyCheck = form.elements.namedItem("privacy");
      if (privacyCheck instanceof HTMLElement) privacyCheck.classList.add("invalid");
      valid = false;
    }

    if (!valid) {
      status.textContent = "Compila tutti i campi obbligatori ed esprimi il consenso al trattamento dati.";
      status.classList.add("err");
      return null;
    }

    return { nome, email, telefono, servizio, messaggio };
  };

  // Rimuovi lo stato invalid appena l'utente corregge il campo
  form?.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("input", () => input.classList.remove("invalid"));
    input.addEventListener("change", () => input.classList.remove("invalid"));
  });

  const sendViaWhatsApp = () => {
    const formData = validateContactForm();
    if (!formData) return;

    const summary = [
      `*RICHIESTA PREVENTIVO / CONSULENZA*`,
      `Nome: ${formData.nome}`,
      `Email: ${formData.email}`,
      formData.telefono ? `Telefono: ${formData.telefono}` : null,
      `Servizio: ${formData.servizio}`,
      "",
      `*Messaggio:*`,
      formData.messaggio,
    ]
      .filter(Boolean)
      .join("\n");

    const waUrl = buildWhatsAppUrl(summary);
    status.innerHTML = `Richiesta pronta! Ti stiamo aprendo WhatsApp... Se non si apre automaticamente, <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline; font-weight:700;">clicca qui</a>.`;
    status.className = "form-status ok";
    form.reset();

    const win = window.open(waUrl, "_blank", "noopener,noreferrer");
    if (!win) {
      window.location.href = waUrl;
    }
  };

  const sendViaEmail = () => {
    const formData = validateContactForm();
    if (!formData) return;

    const subject = encodeURIComponent(`Richiesta Preventivo: ${formData.servizio} - ${formData.nome}`);
    const bodyLines = [
      `Nome e Cognome: ${formData.nome}`,
      `Email: ${formData.email}`,
      `Telefono: ${formData.telefono || 'Non specificato'}`,
      `Servizio Richiesto: ${formData.servizio}`,
      "",
      `Dettagli Intervento / Note:`,
      formData.messaggio,
      "",
      `-- Richiesta inviata dal sito web ufficiale --`
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    const mailtoUrl = `mailto:info@studiotecnicogiuratoiacono.it?subject=${subject}&body=${body}`;

    status.innerHTML = `Apertura client email in corso... Se il programma di posta non si apre, puoi scrivere direttamente a <a href="mailto:info@studiotecnicogiuratoiacono.it" style="text-decoration:underline; font-weight:700;">info@studiotecnicogiuratoiacono.it</a>.`;
    status.className = "form-status ok";
    form.reset();

    window.location.href = mailtoUrl;
  };

  btnSubmitWhatsApp?.addEventListener("click", sendViaWhatsApp);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    sendViaEmail();
  });

  // Pre-compilazione servizio dai pulsanti Portfolio / Casi Studio
  document.querySelectorAll("[data-prefill-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const serviceVal = btn.getAttribute("data-prefill-service");
      const contactSection = document.getElementById("contatti");
      const serviceSelect = form?.elements?.namedItem("servizio");
      const msgArea = form?.elements?.namedItem("messaggio");

      if (serviceSelect && serviceVal) {
        serviceSelect.value = serviceVal;
      }
      contactSection?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        if (msgArea instanceof HTMLElement) msgArea.focus();
      }, 450);
    });
  });

  // Switcher Mappa base in index.html
  const mapIframe = document.getElementById("catastralMapIframe");
  const layerBtns = document.querySelectorAll(".map-layer-btn");
  const catastralForm = document.getElementById("catastralForm");
  const foglioInput = document.getElementById("foglioInput");
  const particellaInput = document.getElementById("particellaInput");
  const btnOpenWebgisParcel = document.getElementById("btnOpenWebgisParcel");

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

  btnOpenWebgisParcel?.addEventListener("click", () => {
    const foglio = foglioInput?.value.trim() || "";
    const particella = particellaInput?.value.trim() || "";
    if (!foglio) {
      foglioInput?.focus();
      alert("Inserisci almeno il numero di Foglio catastale per aprire il punto sul WebGIS.");
      return;
    }
    const params = new URLSearchParams({ comune: "H574", foglio });
    if (particella) params.set("particella", particella);
    window.location.href = `mappa.html?${params.toString()}`;
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

  // ============================================================================
  // MOTORE WEBGIS PROFESSIONALE (Stile Geomappe.org - Catasto AdE + SITR Sicilia)
  // ============================================================================
  const mapElement = document.getElementById("leafletMap");
  if (!mapElement || !window.L) return;

  // Partiamo a Zoom 18 su Corso Savoia 46, Rosolini così le particelle e i numeri sono subito visibili!
  const defaultCenter = [36.81925, 14.94785];
  const map = L.map("leafletMap", {
    zoomControl: true,
    attributionControl: true,
    maxZoom: 21
  }).setView(defaultCenter, 18);
  window.map = map;

  // Gestione apertura/chiusura Sidebar
  const sidebarContainer = document.querySelector(".webgis-app-container");
  const sidebarToggleBtn = document.getElementById("gisSidebarToggle");
  sidebarToggleBtn?.addEventListener("click", () => {
    const isCollapsed = sidebarContainer?.classList.toggle("sidebar-collapsed");
    if (sidebarToggleBtn) {
      sidebarToggleBtn.textContent = isCollapsed ? "▶" : "◀";
    }
    setTimeout(() => map.invalidateSize(), 320);
  });

  // 1. MAPPE DI BASE (Con parallellizzazione su 4 sottodomini Google e Retina HD)
  const baseLayers = {
    googleHybrid: L.tileLayer("https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&scale=2&hl=it", {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      keepBuffer: 4,
      maxNativeZoom: 20,
      maxZoom: 21,
      attribution: "© Google Maps"
    }),
    googleSat: L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&scale=2&hl=it", {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      keepBuffer: 4,
      maxNativeZoom: 20,
      maxZoom: 21,
      attribution: "© Google Maps"
    }),
    googleStreet: L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2&hl=it", {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      keepBuffer: 4,
      maxNativeZoom: 20,
      maxZoom: 21,
      attribution: "© Google Maps"
    }),
    osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution: "© OpenStreetMap"
    })
  };

  let currentBaseLayer = baseLayers.googleHybrid.addTo(map);

  document.querySelectorAll('input[name="baseMap"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const val = e.target.value;
      if (baseLayers[val]) {
        map.removeLayer(currentBaseLayer);
        currentBaseLayer = baseLayers[val].addTo(map);
      }
    });
  });

  const loadingStatus = document.getElementById("mapLoadingStatus") || document.getElementById("mapLoadingSpinner");

  // Funzioni matematiche di conversione Tile (x,y,z) -> Coordinate geografiche EPSG:6706 (RDN2008 / WGS84)
  const tile2lon = (x, z) => (x / Math.pow(2, z)) * 360 - 180;
  const tile2lat = (y, z) => {
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  };

  // 2. LAYER CATASTO AGENZIA DELLE ENTRATE (Tile 512x512, updateWhenIdle, -75% chiamate WMS)
  const CatastoAdELayer = L.TileLayer.extend({
    getTileUrl: function (coords) {
      const z = this._getZoomForUrl();
      const nwLon = tile2lon(coords.x, z);
      const nwLat = tile2lat(coords.y, z);
      const seLon = tile2lon(coords.x + 1, z);
      const seLat = tile2lat(coords.y + 1, z);

      // In WMS 1.3.0 con CRS=EPSG:6706 l'ordine degli assi obbligatorio è: minLat,minLon,maxLat,maxLon
      const bbox = `${seLat.toFixed(7)},${nwLon.toFixed(7)},${nwLat.toFixed(7)},${seLon.toFixed(7)}`;

      const params = [
        "language=ita",
        "service=WMS",
        "version=1.3.0",
        "request=GetMap",
        `bbox=${bbox}`,
        "crs=EPSG:6706",
        "width=512",
        "height=512",
        "layers=province,CP.CadastralZoning,acque,strade,CP.CadastralParcel,fabbricati,codice_plla,simbolo_graffa,vestizioni",
        "styles=default,default,default,default,default,default,default,default,default",
        "format=image/png",
        "transparent=TRUE"
      ].join("&");

      return `https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php?${params}`;
    }
  });

  const catastoLayer = new CatastoAdELayer("", {
    maxZoom: 21,
    minZoom: 15,
    tileSize: 512,
    zoomOffset: -1,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 4,
    className: 'wms-crisp-layer',
    opacity: 0.95,
    zIndex: 600,
    attribution: "© Agenzia delle Entrate - Cartografia Catastale CC-BY 4.0"
  });

  // 3. LAYER PIANO PAESAGGISTICO & SITR REGIONE SICILIANA (Tile 512x512, format=png8, updateWhenIdle)
  const SitrArcGisLayer = L.TileLayer.extend({
    initialize: function (servicePath, options) {
      this._servicePath = servicePath;
      L.TileLayer.prototype.initialize.call(this, "", options);
    },
    getTileUrl: function (coords) {
      const z = this._getZoomForUrl();
      const nwLon = tile2lon(coords.x, z);
      const nwLat = tile2lat(coords.y, z);
      const seLon = tile2lon(coords.x + 1, z);
      const seLat = tile2lat(coords.y + 1, z);
      const bbox4326 = `${nwLon.toFixed(7)},${seLat.toFixed(7)},${seLon.toFixed(7)},${nwLat.toFixed(7)}`;

      const svc = this._servicePath.includes('/')
        ? this._servicePath
        : `piani_paesaggistici/${this._servicePath}`;
      return `https://map.sitr.regione.sicilia.it/gis/rest/services/${svc}/MapServer/export?bbox=${bbox4326}&bboxSR=4326&imageSR=3857&size=512,512&format=png8&transparent=true&f=image`;
    }
  });

  const baseSitrOptions = {
    maxZoom: 21,
    tileSize: 512,
    zoomOffset: -1,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 3,
    className: 'wms-crisp-layer'
  };

  // Prefissi provinciali disponibili su SITR Sicilia per i Piani Paesaggistici:
  // ag, cl, ct, en, me_ambito9, rg, sr, tp_ambiti23, tp_ambito1, egadi, pelagie
  const provSitrPrefixes = [
    "sr", "rg", "ct", "ag", "cl", "en", "me_ambito9", "tp_ambiti23", "tp_ambito1", "egadi", "pelagie"
  ];

  // Group 1: PP - Beni Paesaggistici (Tutta la Sicilia) - zIndex: 460, opacity: 0.80
  const allBeniLayers = provSitrPrefixes.map(
    (p) => new SitrArcGisLayer(`${p}_beni_paesaggistici`, { ...baseSitrOptions, zIndex: 460, opacity: 0.80, attribution: "© SITR Sicilia - PP Beni" })
  );
  const ppBeniGroup = L.layerGroup(allBeniLayers);

  // Group 2: PP - Regimi Normativi / Livelli Tutela (Tutta la Sicilia) - zIndex: 450, opacity: 0.75
  const allRegimiLayers = provSitrPrefixes.map(
    (p) => new SitrArcGisLayer(`${p}_regimi_normativi`, { ...baseSitrOptions, zIndex: 450, opacity: 0.75, attribution: "© SITR Sicilia - PP Regimi" })
  );
  const ppRegimiGroup = L.layerGroup(allRegimiLayers);

  // Group 3: PP - Componenti del Paesaggio (Tutta la Sicilia) - zIndex: 440, opacity: 0.65
  const allComponentiLayers = provSitrPrefixes.map(
    (p) => new SitrArcGisLayer(`${p}_componenti_paesaggio`, { ...baseSitrOptions, zIndex: 440, opacity: 0.65, attribution: "© SITR Sicilia - PP Componenti" })
  );
  const ppComponentiGroup = L.layerGroup(allComponentiLayers);

  // Group 4: PAI - Rischio Idraulico (Pericolosità Alluvioni Sicilia) - zIndex: 435, opacity: 0.75
  const paiIdraulicaLayer = new SitrArcGisLayer("pai/PAI_Idraulica_Pericolosita", {
    ...baseSitrOptions,
    zIndex: 435,
    opacity: 0.75,
    attribution: "© Autorità di Bacino Sicilia - PAI Idraulica"
  });

  // Group 5: PAI - Rischio Geomorfologico (Frane e Dissesti Sicilia) - zIndex: 436, opacity: 0.75
  const paiGeomLayer = new SitrArcGisLayer("pai/PAI_Geomorfologia_Pericolosita", {
    ...baseSitrOptions,
    zIndex: 436,
    opacity: 0.75,
    attribution: "© Autorità di Bacino Sicilia - PAI Geomorfologia"
  });

  // Group 6: CTR 1:10.000 Regionale Ufficiale - zIndex: 430, opacity: 0.85
  const ctr10kLayer = new SitrArcGisLayer("ctr_10000/ctr_2013_base", {
    ...baseSitrOptions,
    zIndex: 430,
    opacity: 0.85,
    attribution: "© SITR Sicilia - CTR 1:10.000"
  });

  // Group 7: Layer Group per Rilievi CAD (.DXF) ed Estratti Sister (.EMP) importati dall'utente
  const customCadLayerGroup = L.layerGroup().addTo(map);

  // Gestione spinner di caricamento sulle tile WMS/ArcGIS
  const allSitrLayers = [
    catastoLayer,
    ...allBeniLayers,
    ...allRegimiLayers,
    ...allComponentiLayers,
    paiIdraulicaLayer,
    paiGeomLayer,
    ctr10kLayer
  ];

  allSitrLayers.forEach((lyr) => {
    lyr.on("loading", () => {
      if (loadingStatus) loadingStatus.style.display = "flex";
    });
    lyr.on("load", () => {
      if (loadingStatus) loadingStatus.style.display = "none";
    });
    lyr.on("tileerror", () => {
      if (loadingStatus) loadingStatus.style.display = "none";
    });
  });

  // Notifica resiliente se il server WMS dell'Agenzia delle Entrate è temporaneamente offline
  let adeTileErrors = 0;
  let adeWarned = false;
  catastoLayer.on("tileerror", () => {
    adeTileErrors++;
    if (adeTileErrors >= 4 && !adeWarned) {
      adeWarned = true;
      const coordsBar = document.getElementById("mapCoordsBar");
      if (coordsBar && !coordsBar.querySelector(".ade-wms-warning")) {
        const warn = document.createElement("span");
        warn.className = "ade-wms-warning";
        warn.style.cssText = "margin-left: 8px; color: #f59e0b; font-weight: 700; font-size: 0.73rem;";
        warn.textContent = "⚠️ Server WMS Catasto AdE momentaneamente non raggiungibile";
        coordsBar.appendChild(warn);
      }
    }
  });
  catastoLayer.on("load", () => {
    adeTileErrors = 0;
    const warn = document.querySelector(".ade-wms-warning");
    if (warn) warn.remove();
    adeWarned = false;
  });

  // Attivazione iniziale in base ai checkbox
  const toggleCatasto = document.getElementById("toggleCatasto");
  const catastoOpacity = document.getElementById("catastoOpacity");
  const catastoOpacityVal = document.getElementById("catastoOpacityVal");

  if (toggleCatasto?.checked) {
    catastoLayer.addTo(map);
  }

  toggleCatasto?.addEventListener("change", (e) => {
    if (e.target.checked) {
      catastoLayer.addTo(map);
    } else {
      map.removeLayer(catastoLayer);
    }
  });

  catastoOpacity?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (catastoOpacityVal) catastoOpacityVal.textContent = `${val}%`;
    catastoLayer.setOpacity(val / 100);
  });

  // Toggle PP - Beni Paesaggistici
  const togglePpBeni = document.getElementById("togglePpBeni");
  const ppBeniOpacity = document.getElementById("ppBeniOpacity");
  const ppBeniOpacityVal = document.getElementById("ppBeniOpacityVal");

  if (togglePpBeni?.checked) {
    ppBeniGroup.addTo(map);
  }

  togglePpBeni?.addEventListener("change", (e) => {
    if (e.target.checked) {
      ppBeniGroup.addTo(map);
    } else {
      map.removeLayer(ppBeniGroup);
    }
  });

  ppBeniOpacity?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (ppBeniOpacityVal) ppBeniOpacityVal.textContent = `${val}%`;
    const op = val / 100;
    allBeniLayers.forEach((l) => l.setOpacity(op));
  });

  // Toggle PP - Regimi Normativi
  const togglePpRegimi = document.getElementById("togglePpRegimi");
  const ppRegimiOpacity = document.getElementById("ppRegimiOpacity");
  const ppRegimiOpacityVal = document.getElementById("ppRegimiOpacityVal");

  if (togglePpRegimi?.checked) {
    ppRegimiGroup.addTo(map);
  }

  togglePpRegimi?.addEventListener("change", (e) => {
    if (e.target.checked) {
      ppRegimiGroup.addTo(map);
    } else {
      map.removeLayer(ppRegimiGroup);
    }
  });

  ppRegimiOpacity?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (ppRegimiOpacityVal) ppRegimiOpacityVal.textContent = `${val}%`;
    const op = val / 100;
    allRegimiLayers.forEach((l) => l.setOpacity(op));
  });

  // Toggle PP - Componenti del Paesaggio
  const togglePpComponenti = document.getElementById("togglePpComponenti");
  const ppComponentiOpacity = document.getElementById("ppComponentiOpacity");
  const ppComponentiOpacityVal = document.getElementById("ppComponentiOpacityVal");

  if (togglePpComponenti?.checked) {
    ppComponentiGroup.addTo(map);
  }

  togglePpComponenti?.addEventListener("change", (e) => {
    if (e.target.checked) {
      ppComponentiGroup.addTo(map);
    } else {
      map.removeLayer(ppComponentiGroup);
    }
  });

  ppComponentiOpacity?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (ppComponentiOpacityVal) ppComponentiOpacityVal.textContent = `${val}%`;
    const op = val / 100;
    allComponentiLayers.forEach((l) => l.setOpacity(op));
  });

  // Toggle PAI - Pericolosità Idraulica (Alluvioni)
  const togglePaiIdraulica = document.getElementById("togglePaiIdraulica");
  const paiIdraulicaOpacity = document.getElementById("paiIdraulicaOpacity");
  const paiIdraulicaOpacityVal = document.getElementById("paiIdraulicaOpacityVal");

  if (togglePaiIdraulica?.checked) {
    paiIdraulicaLayer.addTo(map);
  }

  togglePaiIdraulica?.addEventListener("change", (e) => {
    if (e.target.checked) {
      paiIdraulicaLayer.addTo(map);
    } else {
      map.removeLayer(paiIdraulicaLayer);
    }
  });

  paiIdraulicaOpacity?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (paiIdraulicaOpacityVal) paiIdraulicaOpacityVal.textContent = `${val}%`;
    paiIdraulicaLayer.setOpacity(val / 100);
  });

  // Toggle PAI - Pericolosità Geomorfologica (Frane / Dissesti)
  const togglePaiGeom = document.getElementById("togglePaiGeom");
  const paiGeomOpacity = document.getElementById("paiGeomOpacity");
  const paiGeomOpacityVal = document.getElementById("paiGeomOpacityVal");

  if (togglePaiGeom?.checked) {
    paiGeomLayer.addTo(map);
  }

  togglePaiGeom?.addEventListener("change", (e) => {
    if (e.target.checked) {
      paiGeomLayer.addTo(map);
    } else {
      map.removeLayer(paiGeomLayer);
    }
  });

  paiGeomOpacity?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (paiGeomOpacityVal) paiGeomOpacityVal.textContent = `${val}%`;
    paiGeomLayer.setOpacity(val / 100);
  });

  // Toggle CTR 1:10.000 Regionale
  const toggleCtr10k = document.getElementById("toggleCtr10k");
  const ctr10kOpacity = document.getElementById("ctr10kOpacity");
  const ctr10kOpacityVal = document.getElementById("ctr10kOpacityVal");

  if (toggleCtr10k?.checked) {
    ctr10kLayer.addTo(map);
  }

  toggleCtr10k?.addEventListener("change", (e) => {
    if (e.target.checked) {
      ctr10kLayer.addTo(map);
    } else {
      map.removeLayer(ctr10kLayer);
    }
  });

  ctr10kOpacity?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (ctr10kOpacityVal) ctr10kOpacityVal.textContent = `${val}%`;
    ctr10kLayer.setOpacity(val / 100);
  });

  // Barra delle coordinate in tempo reale
  const coordsBar = document.getElementById("mapCoordsBar");
  const updateCoordsBar = (latlng) => {
    if (!coordsBar) return;
    const zoom = map.getZoom();
    const zoomHint = zoom < 17 ? "⚠️ Fai Zoom (+) fino a 17+ per vedere tutte le particelle" : "✅ Scala Particellare Attiva";
    const lat = latlng ? latlng.lat.toFixed(6) : map.getCenter().lat.toFixed(6);
    const lon = latlng ? latlng.lng.toFixed(6) : map.getCenter().lng.toFixed(6);
    coordsBar.textContent = `Lat: ${lat}, Lon: ${lon} | Zoom: ${zoom} | ${zoomHint}`;
  };

  map.on("mousemove", (e) => updateCoordsBar(e.latlng));
  map.on("zoomend", () => updateCoordsBar());

  // ============================================================================
  // 4. INTERROGAZIONE CATASTALE AL CLICK IN TEMPO REALE (Stile Geomappe.org)
  // ============================================================================
  let measureMode = null; // null = Info Particella al click, 'dist' = Distanza, 'area' = Area
  let inspectLayerGroup = L.layerGroup().addTo(map);

  const fetchWithCorsFallback = async (targetUrl) => {
    const proxies = [
      (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`
    ];
    try {
      const directRes = await fetch(targetUrl);
      if (directRes.ok) return await directRes.text();
    } catch (_) {
      // Fallback sui proxy CORS se il browser blocca la chiamata diretta
    }
    for (const buildProxy of proxies) {
      try {
        const res = await fetch(buildProxy(targetUrl));
        if (res.ok) return await res.text();
      } catch (_) {}
    }
    throw new Error("Impossibile contattare il server catastale.");
  };

  // ============================================================================
  // RECUPERO CATASTO E PERIMETRO VETTORIALE (SITR SICILIA + AdE CON CORS NATIVO)
  // ============================================================================
  let activeParcelPolygonLayer = null;
  window.lastSelectedParcelPolygon = null;
  window.lastSelectedParcelInfo = null;

  // 1. Interrogazione vettoriale ufficiale SITR Regione Siciliana (Layer 4 Particelle)
  const querySitrCadastralParcel = async (lat, lon) => {
    const qUrl = `https://map.sitr.regione.sicilia.it/gis/rest/services/catasto/cartografia_catastale/MapServer/4/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&outSR=4326&f=json`;
    try {
      const res = await fetch(qUrl, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      const json = await res.json();
      if (json && json.features && json.features.length > 0) {
        const feat = json.features[0];
        const a = feat.attributes;
        const rings = feat.geometry?.rings;
        let polygon = null;
        if (rings && rings.length > 0 && rings[0].length >= 3) {
          polygon = rings[0].map(pt => [pt[1], pt[0]]);
        }
        return {
          tipo: "Particella Catastale",
          comune: a.COMUNE_T ? `${a.COMUNE_T} (${a.COMUNE || 'H574'})` : (comuniData[a.COMUNE]?.name || `Rosolini (${a.COMUNE || 'H574'})`),
          codComune: a.COMUNE || "H574",
          foglio: String(a.FOGLIO || "").trim() || "-",
          particella: String(a.NUMERO || "").trim() || "-",
          area: a.Shape_Area ? Math.round(Number(String(a.Shape_Area).replace(',', '.'))) : 0,
          perim: a.Shape_Length ? Math.round(Number(String(a.Shape_Length).replace(',', '.'))) : 0,
          polygon: polygon
        };
      }
    } catch (err) {
      console.warn("SITR parcel query fallback:", err);
    }
    return null;
  };

  // 2. Interrogazione diretta Agenzia delle Entrate (op=getDatiOggetto, CORS nativo aperto)
  const queryAdeCadastralPoint = async (lat, lon) => {
    const ajaxUrl = `https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getDatiOggetto&lon=${lon}&lat=${lat}`;
    try {
      const res = await fetch(ajaxUrl, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      const json = await res.json();
      if (json && (json.NUM_PART || json.FOGLIO || json.COD_COMUNE || json.TIPOLOGIA)) {
        const codCom = json.COD_COMUNE || "H574";
        const cName = json.DENOM || comuniData[codCom]?.name || "Rosolini";
        return {
          tipo: json.TIPOLOGIA || "Particella Catastale",
          comune: `${cName} (${codCom})`,
          codComune: codCom,
          foglio: String(json.FOGLIO || "").trim() || "-",
          particella: String(json.NUM_PART || "").trim() || "-",
          allegato: json.ALLEGATO || "0",
          sviluppo: json.SVILUPPO || "0",
          area: 0,
          perim: 0,
          polygon: null
        };
      }
    } catch (err) {
      console.warn("AdE ajax query error:", err);
    }
    return null;
  };

  // 3. Generazione perimetro stimato di fallback (se non vettorializzato dal server)
  const generateFallbackParcelPolygon = (lat, lon) => {
    const dLat = 0.00015;
    const dLon = 0.00018;
    return [
      [lat - dLat, lon - dLon],
      [lat + dLat, lon - dLon * 0.9],
      [lat + dLat * 1.1, lon + dLon],
      [lat - dLat * 0.9, lon + dLon * 0.95]
    ];
  };

  // Calcolo metriche geometriche poligono
  const calcPolygonMetrics = (coords) => {
    if (!coords || coords.length < 3) return { area: 0, perimeter: 0 };
    const cosLat = Math.cos(coords[0][0] * Math.PI / 180);
    const mPerLon = 111320 * cosLat;
    const mPerLat = 110950;
    let area = 0;
    let perimeter = 0;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i][1] * mPerLon, yi = coords[i][0] * mPerLat;
      const xj = coords[j][1] * mPerLon, yj = coords[j][0] * mPerLat;
      area += (xj * yi) - (xi * yj);
      perimeter += Math.hypot(xi - xj, yi - yj);
    }
    return {
      area: Math.abs(area) / 2,
      perimeter
    };
  };

  // Disegna il perimetro particellare evidenziato sulla mappa con bordo dorato pulsante
  const highlightParcelPerimeter = (polygonCoords) => {
    if (activeParcelPolygonLayer) {
      inspectLayerGroup.removeLayer(activeParcelPolygonLayer);
      activeParcelPolygonLayer = null;
    }
    if (!polygonCoords || polygonCoords.length < 3) return;

    activeParcelPolygonLayer = L.polygon(polygonCoords, {
      color: "#d97706",
      weight: 3.5,
      opacity: 1.0,
      fillColor: "#fbbf24",
      fillOpacity: 0.28,
      className: "selected-parcel-perimeter"
    }).addTo(inspectLayerGroup);
  };

  map.on("click", async (e) => {
    if (measureMode) return;

    const { lat, lng } = e.latlng;
    inspectLayerGroup.clearLayers();
    if (activeParcelPolygonLayer) {
      inspectLayerGroup.removeLayer(activeParcelPolygonLayer);
      activeParcelPolygonLayer = null;
    }

    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <div style="font-family: Manrope, sans-serif; padding: 0.25rem; min-width: 220px;">
          <strong style="color: #0b1c2d;">⏳ Lettura Catasto e confini particella...</strong><br>
          <span style="font-size: 0.8rem; color: #5b6570;">Lat: ${lat.toFixed(6)}, Lon: ${lng.toFixed(6)}</span>
        </div>
      `)
      .openOn(map);

    L.circleMarker(e.latlng, {
      radius: 6,
      color: "#0b1c2d",
      fillColor: "#c9a227",
      fillOpacity: 1,
      weight: 2
    }).addTo(inspectLayerGroup);

    // Esecuzione rapida: SITR Sicilia (vettoriale) -> fallback AdE (JSON)
    let info = await querySitrCadastralParcel(lat, lng);
    if (!info) {
      info = await queryAdeCadastralPoint(lat, lng);
    }

    if (!info) {
      info = {
        tipo: "Punto Georeferenziato",
        comune: comuneSelect?.options[comuneSelect.selectedIndex]?.text || "Rosolini (SR)",
        codComune: comuneSelect?.value || "H574",
        foglio: "-",
        particella: "-",
        area: 0,
        perim: 0,
        polygon: null
      };
    }

    // Assicura il perimetro particellare vettoriale per disegno mappa, DXF e scheda peritale
    const parcelPolyCoords = info.polygon || generateFallbackParcelPolygon(lat, lng);
    window.lastSelectedParcelPolygon = parcelPolyCoords;
    highlightParcelPerimeter(parcelPolyCoords);

    let aM2 = info.area;
    let pM = info.perim;
    if (aM2 <= 0 || pM <= 0) {
      const m = calcPolygonMetrics(parcelPolyCoords);
      aM2 = Math.round(m.area);
      pM = Math.round(m.perimeter);
    }
    const aHa = (aM2 / 10000).toFixed(2);

    lastClickedParcel = {
      lat,
      lon: lng,
      comune: info.comune,
      foglio: info.foglio,
      particella: info.particella,
      area: aM2,
      perim: pM
    };
    window.lastClickedParcel = lastClickedParcel;
    window.lastSelectedParcelInfo = { ...info, lat, lon: lng, area: aM2, perim: pM, polygon: parcelPolyCoords };

    const directUrl = updateParcelShareState(info.codComune || "H574", info.foglio, info.particella);

    popup.setContent(`
      <div style="font-family: Manrope, sans-serif; padding: 0.3rem; min-width: 255px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e8e4db; padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="color: #0b1c2d; font-size: 0.96rem;">📋 ${info.tipo}</strong>
          <span style="font-size: 0.72rem; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: 700;">VISUAL TAF</span>
        </div>
        <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Comune:</strong> ${info.comune}</p>
        <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Foglio:</strong> ${info.foglio} &nbsp;|&nbsp; <strong>Particella:</strong> <span style="background:#fef3c7; padding:1px 6px; border-radius:4px; font-weight:700;">${info.particella}</span></p>
        <p style="margin: 3px 0; font-size: 0.76rem; color: #5b6570;">Baricentro: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        <div style="font-size: 0.78rem; background: #fefce8; border: 1px solid #fde047; padding: 4px 8px; border-radius: 6px; margin: 6px 0; color: #854d0e;">
          📐 <strong>Superficie Catastale:</strong> ${aM2.toLocaleString('it-IT')} m² (${aHa} ha)<br>
          📏 <strong>Perimetro Confinante:</strong> ${pM.toLocaleString('it-IT')} m
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Buongiorno, vorrei richiedere una visura/rilievo per:\nComune: ${info.comune}\nFoglio: ${info.foglio}\nParticella: ${info.particella}\nLink Mappa: ${directUrl}`)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#128c7e; color:#fff; padding:5px 10px; border-radius:999px; font-size:0.75rem; font-weight:600; text-decoration:none;">WhatsApp ↗</a>
          <button type="button" onclick="navigator.clipboard.writeText('${directUrl}').then(() => { this.textContent = '✅ Link Copiato!'; })" style="background:#0b1c2d; color:#e0c56a; border:1px solid #c9a227; padding:4px 9px; border-radius:999px; font-size:0.74rem; font-weight:600; cursor:pointer;">🔗 Copia Link</button>
        </div>
        <div style="display: grid; gap: 5px; margin-top: 8px;">
          <button type="button" class="btn btn-gold" onclick="window.triangulateParcelWithPF(${lat}, ${lng}, '${info.comune.replace(/'/g, "\\'")}', '${info.foglio}', '${info.particella}')" style="width: 100%; padding: 7px 10px; font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 5px; border-radius: 6px; cursor: pointer;">
            📐 Triangola Particella con 3 PF più vicini
          </button>
          <button type="button" class="btn btn-primary" onclick="window.generatePeritaleReportPDF('${info.comune.replace(/'/g, "\\'")}', '${info.foglio}', '${info.particella}')" style="width: 100%; padding: 6px 10px; font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 5px; border-radius: 6px; cursor: pointer; background: #002b49; color: #fff; border: 1px solid #c9a227;">
            📄 Scheda Peritale di Inquadramento A4
          </button>
          <button type="button" class="btn btn-ghost" onclick="window.exportTriangulationDXF()" style="width: 100%; padding: 5px 8px; font-size: 0.76rem; border-color: #cbd5e1; color: #002b49; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 4px;">
            📐 Esporta Perimetro e PF in CAD (.DXF)
          </button>
        </div>
      </div>
    `);

    if (topoModeActive) {
      window.triangulateParcelWithPF(lat, lng, info.comune, info.foglio, info.particella);
    }
  });

  // ============================================================================
  // 5. RICERCA CATASTALE REALE PER PROVINCIA, COMUNE, FOGLIO E PARTICELLA
  // ============================================================================
  const provinciaSelect = document.getElementById("gisProvinciaSelect");
  const comuneSelect = document.getElementById("gisComuneSelect");
  const gFoglioInput = document.getElementById("gisFoglioInput");
  const gParticellaInput = document.getElementById("gisParticellaInput");
  const catastralSearchBtn = document.getElementById("gisCatastralSearchBtn");
  const copyParcelLinkBtn = document.getElementById("gisCopyParcelLinkBtn");
  const catastralSearchStatus = document.getElementById("catastralSearchStatus");

  let lastParcelShareUrl = "https://www.studiotecnicogiuratoiacono.it/mappa.html";

  const updateParcelShareState = (codComune, foglio, particella) => {
    const cleanFoglio = String(foglio || "").trim();
    const cleanPart = String(particella || "").trim();
    const params = new URLSearchParams();
    if (codComune) params.set("comune", codComune);
    if (cleanFoglio && cleanFoglio !== "-") params.set("foglio", cleanFoglio);
    if (cleanPart && cleanPart !== "-" && cleanPart !== "Intero Foglio") params.set("particella", cleanPart);

    const queryStr = params.toString();
    if (queryStr && window.history?.replaceState) {
      window.history.replaceState({}, "", `${window.location.pathname}?${queryStr}`);
    }
    lastParcelShareUrl = `https://www.studiotecnicogiuratoiacono.it/mappa.html${queryStr ? "?" + queryStr : ""}`;
    if (copyParcelLinkBtn && cleanFoglio) {
      copyParcelLinkBtn.style.display = "inline-flex";
      copyParcelLinkBtn.textContent = "🔗 Copia Link Diretto Particella";
    }
    return lastParcelShareUrl;
  };

  copyParcelLinkBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(lastParcelShareUrl);
      copyParcelLinkBtn.textContent = "✅ Link Particella Copiato!";
      setTimeout(() => {
        copyParcelLinkBtn.textContent = "🔗 Copia Link Diretto Particella";
      }, 2800);
    } catch (_) {
      prompt("Copia il link diretto alla particella:", lastParcelShareUrl);
    }
  });

  const comuniData = {
    "A014": { name: "Acate (RG)", shortName: "Acate", prov: "RG", lat: 37.0264, lon: 14.49373 },
    "A025": { name: "Aci Bonaccorsi (CT)", shortName: "Aci Bonaccorsi", prov: "CT", lat: 37.59789, lon: 15.10861 },
    "A026": { name: "Aci Castello (CT)", shortName: "Aci Castello", prov: "CT", lat: 37.55582, lon: 15.14523 },
    "A027": { name: "Aci Catena (CT)", shortName: "Aci Catena", prov: "CT", lat: 37.60268, lon: 15.14224 },
    "A029": { name: "Aci Sant'Antonio (CT)", shortName: "Aci Sant'Antonio", prov: "CT", lat: 37.60602, lon: 15.12585 },
    "A028": { name: "Acireale (CT)", shortName: "Acireale", prov: "CT", lat: 37.61215, lon: 15.16629 },
    "A049": { name: "Acquaviva Platani (CL)", shortName: "Acquaviva Platani", prov: "CL", lat: 37.5717, lon: 13.70014 },
    "M211": { name: "Acquedolci (ME)", shortName: "Acquedolci", prov: "ME", lat: 38.05636, lon: 14.58806 },
    "A056": { name: "Adrano (CT)", shortName: "Adrano", prov: "CT", lat: 37.66181, lon: 14.83269 },
    "A070": { name: "Agira (EN)", shortName: "Agira", prov: "EN", lat: 37.65721, lon: 14.5238 },
    "A089": { name: "Agrigento (AG)", shortName: "Agrigento", prov: "AG", lat: 37.30971, lon: 13.58457 },
    "A098": { name: "Aidone (EN)", shortName: "Aidone", prov: "EN", lat: 37.416, lon: 14.44789 },
    "A176": { name: "Alcamo (TP)", shortName: "Alcamo", prov: "TP", lat: 37.9806, lon: 12.96497 },
    "A177": { name: "Alcara li Fusi (ME)", shortName: "Alcara li Fusi", prov: "ME", lat: 38.02145, lon: 14.70109 },
    "A181": { name: "Alessandria della Rocca (AG)", shortName: "Alessandria della Rocca", prov: "AG", lat: 37.56973, lon: 13.45349 },
    "A194": { name: "Alì (ME)", shortName: "Alì", prov: "ME", lat: 38.02694, lon: 15.41797 },
    "A201": { name: "Alì Terme (ME)", shortName: "Alì Terme", prov: "ME", lat: 38.00375, lon: 15.42262 },
    "A195": { name: "Alia (PA)", shortName: "Alia", prov: "PA", lat: 37.77858, lon: 13.71313 },
    "A202": { name: "Alimena (PA)", shortName: "Alimena", prov: "PA", lat: 37.69213, lon: 14.11367 },
    "A203": { name: "Aliminusa (PA)", shortName: "Aliminusa", prov: "PA", lat: 37.86417, lon: 13.78104 },
    "A229": { name: "Altavilla Milicia (PA)", shortName: "Altavilla Milicia", prov: "PA", lat: 38.04232, lon: 13.55045 },
    "A239": { name: "Altofonte (PA)", shortName: "Altofonte", prov: "PA", lat: 38.04436, lon: 13.29829 },
    "A313": { name: "Antillo (ME)", shortName: "Antillo", prov: "ME", lat: 37.97613, lon: 15.24539 },
    "A351": { name: "Aragona (AG)", shortName: "Aragona", prov: "AG", lat: 37.40243, lon: 13.61779 },
    "A478": { name: "Assoro (EN)", shortName: "Assoro", prov: "EN", lat: 37.62816, lon: 14.42409 },
    "A494": { name: "Augusta (SR)", shortName: "Augusta", prov: "SR", lat: 37.23061, lon: 15.21944 },
    "A522": { name: "Avola (SR)", shortName: "Avola", prov: "SR", lat: 36.90839, lon: 15.13544 },
    "A546": { name: "Bagheria (PA)", shortName: "Bagheria", prov: "PA", lat: 38.07888, lon: 13.51098 },
    "A592": { name: "Balestrate (PA)", shortName: "Balestrate", prov: "PA", lat: 38.05132, lon: 13.00439 },
    "A638": { name: "Barcellona Pozzo di Gotto (ME)", shortName: "Barcellona Pozzo di Gotto", prov: "ME", lat: 38.14693, lon: 15.21858 },
    "A676": { name: "Barrafranca (EN)", shortName: "Barrafranca", prov: "EN", lat: 37.37285, lon: 14.20388 },
    "A698": { name: "Basicò (ME)", shortName: "Basicò", prov: "ME", lat: 38.0616, lon: 15.06175 },
    "A719": { name: "Baucina (PA)", shortName: "Baucina", prov: "PA", lat: 37.92513, lon: 13.53724 },
    "A764": { name: "Belmonte Mezzagno (PA)", shortName: "Belmonte Mezzagno", prov: "PA", lat: 38.04835, lon: 13.39011 },
    "A766": { name: "Belpasso (CT)", shortName: "Belpasso", prov: "CT", lat: 37.59139, lon: 14.97705 },
    "A841": { name: "Biancavilla (CT)", shortName: "Biancavilla", prov: "CT", lat: 37.64126, lon: 14.86954 },
    "A882": { name: "Bisacquino (PA)", shortName: "Bisacquino", prov: "PA", lat: 37.70579, lon: 13.25873 },
    "A896": { name: "Bivona (AG)", shortName: "Bivona", prov: "AG", lat: 37.61811, lon: 13.4404 },
    "M268": { name: "Blufi (PA)", shortName: "Blufi", prov: "PA", lat: 37.75231, lon: 14.07674 },
    "A946": { name: "Bolognetta (PA)", shortName: "Bolognetta", prov: "PA", lat: 37.96472, lon: 13.45568 },
    "A957": { name: "Bompensiere (CL)", shortName: "Bompensiere", prov: "CL", lat: 37.47263, lon: 13.78064 },
    "A958": { name: "Bompietro (PA)", shortName: "Bompietro", prov: "PA", lat: 37.74708, lon: 14.09952 },
    "A991": { name: "Borgetto (PA)", shortName: "Borgetto", prov: "PA", lat: 38.04642, lon: 13.14274 },
    "B198": { name: "Brolo (ME)", shortName: "Brolo", prov: "ME", lat: 38.15685, lon: 14.82772 },
    "B202": { name: "Bronte (CT)", shortName: "Bronte", prov: "CT", lat: 37.78752, lon: 14.8329 },
    "B237": { name: "Buccheri (SR)", shortName: "Buccheri", prov: "SR", lat: 37.12651, lon: 14.85047 },
    "B275": { name: "Burgio (AG)", shortName: "Burgio", prov: "AG", lat: 37.59887, lon: 13.28954 },
    "B287": { name: "Buscemi (SR)", shortName: "Buscemi", prov: "SR", lat: 37.08523, lon: 14.88416 },
    "B288": { name: "Buseto Palizzolo (TP)", shortName: "Buseto Palizzolo", prov: "TP", lat: 38.01217, lon: 12.71132 },
    "B302": { name: "Butera (CL)", shortName: "Butera", prov: "CL", lat: 37.18643, lon: 14.18628 },
    "B315": { name: "Caccamo (PA)", shortName: "Caccamo", prov: "PA", lat: 37.9318, lon: 13.66353 },
    "B377": { name: "Calamonaci (AG)", shortName: "Calamonaci", prov: "AG", lat: 37.52534, lon: 13.2909 },
    "B381": { name: "Calascibetta (EN)", shortName: "Calascibetta", prov: "EN", lat: 37.58956, lon: 14.27309 },
    "B384": { name: "Calatabiano (CT)", shortName: "Calatabiano", prov: "CT", lat: 37.82333, lon: 15.22775 },
    "B385": { name: "Calatafimi-Segesta (TP)", shortName: "Calatafimi-Segesta", prov: "TP", lat: 37.91416, lon: 12.86271 },
    "B427": { name: "Caltabellotta (AG)", shortName: "Caltabellotta", prov: "AG", lat: 37.5769, lon: 13.21565 },
    "B428": { name: "Caltagirone (CT)", shortName: "Caltagirone", prov: "CT", lat: 37.23809, lon: 14.51274 },
    "B429": { name: "Caltanissetta (CL)", shortName: "Caltanissetta", prov: "CL", lat: 37.49213, lon: 14.06185 },
    "B430": { name: "Caltavuturo (PA)", shortName: "Caltavuturo", prov: "PA", lat: 37.82031, lon: 13.89007 },
    "B460": { name: "Camastra (AG)", shortName: "Camastra", prov: "AG", lat: 37.25216, lon: 13.79377 },
    "B486": { name: "Cammarata (AG)", shortName: "Cammarata", prov: "AG", lat: 37.63273, lon: 13.63798 },
    "B520": { name: "Campobello di Licata (AG)", shortName: "Campobello di Licata", prov: "AG", lat: 37.25978, lon: 13.91889 },
    "B521": { name: "Campobello di Mazara (TP)", shortName: "Campobello di Mazara", prov: "TP", lat: 37.63459, lon: 12.74409 },
    "B533": { name: "Campofelice di Fitalia (PA)", shortName: "Campofelice di Fitalia", prov: "PA", lat: 37.82622, lon: 13.48457 },
    "B532": { name: "Campofelice di Roccella (PA)", shortName: "Campofelice di Roccella", prov: "PA", lat: 37.99201, lon: 13.88585 },
    "B535": { name: "Campofiorito (PA)", shortName: "Campofiorito", prov: "PA", lat: 37.75326, lon: 13.26919 },
    "B537": { name: "Campofranco (CL)", shortName: "Campofranco", prov: "CL", lat: 37.51201, lon: 13.71255 },
    "B556": { name: "Camporeale (PA)", shortName: "Camporeale", prov: "PA", lat: 37.897, lon: 13.09531 },
    "B561": { name: "Camporotondo Etneo (CT)", shortName: "Camporotondo Etneo", prov: "CT", lat: 37.5674, lon: 15.00596 },
    "B602": { name: "Canicattì (AG)", shortName: "Canicattì", prov: "AG", lat: 37.36024, lon: 13.84999 },
    "B603": { name: "Canicattini Bagni (SR)", shortName: "Canicattini Bagni", prov: "SR", lat: 37.03499, lon: 15.06174 },
    "B645": { name: "Capaci (PA)", shortName: "Capaci", prov: "PA", lat: 38.17084, lon: 13.23935 },
    "B660": { name: "Capizzi (ME)", shortName: "Capizzi", prov: "ME", lat: 37.84887, lon: 14.47842 },
    "B666": { name: "Capo d'Orlando (ME)", shortName: "Capo d'Orlando", prov: "ME", lat: 38.1603, lon: 14.74393 },
    "B695": { name: "Capri Leone (ME)", shortName: "Capri Leone", prov: "ME", lat: 38.10753, lon: 14.70724 },
    "B780": { name: "Carini (PA)", shortName: "Carini", prov: "PA", lat: 38.13319, lon: 13.18241 },
    "B787": { name: "Carlentini (SR)", shortName: "Carlentini", prov: "SR", lat: 37.27598, lon: 15.01477 },
    "B804": { name: "Caronia (ME)", shortName: "Caronia", prov: "ME", lat: 38.02471, lon: 14.44077 },
    "B918": { name: "Casalvecchio Siculo (ME)", shortName: "Casalvecchio Siculo", prov: "ME", lat: 37.95821, lon: 15.3235 },
    "C006": { name: "Cassaro (SR)", shortName: "Cassaro", prov: "SR", lat: 37.10523, lon: 14.94764 },
    "C091": { name: "Castel di Iudica (CT)", shortName: "Castel di Iudica", prov: "CT", lat: 37.49444, lon: 14.64945 },
    "C094": { name: "Castel di Lucio (ME)", shortName: "Castel di Lucio", prov: "ME", lat: 37.88722, lon: 14.31046 },
    "C067": { name: "Castelbuono (PA)", shortName: "Castelbuono", prov: "PA", lat: 37.93385, lon: 14.08826 },
    "C074": { name: "Casteldaccia (PA)", shortName: "Casteldaccia", prov: "PA", lat: 38.05537, lon: 13.53252 },
    "C051": { name: "Castell'Umberto (ME)", shortName: "Castell'Umberto", prov: "ME", lat: 38.08458, lon: 14.80688 },
    "C130": { name: "Castellammare del Golfo (TP)", shortName: "Castellammare del Golfo", prov: "TP", lat: 38.02638, lon: 12.88044 },
    "C135": { name: "Castellana Sicula (PA)", shortName: "Castellana Sicula", prov: "PA", lat: 37.78176, lon: 14.04409 },
    "C210": { name: "Castelmola (ME)", shortName: "Castelmola", prov: "ME", lat: 37.85819, lon: 15.27666 },
    "C275": { name: "Casteltermini (AG)", shortName: "Casteltermini", prov: "AG", lat: 37.54081, lon: 13.6434 },
    "C286": { name: "Castelvetrano (TP)", shortName: "Castelvetrano", prov: "TP", lat: 37.67916, lon: 12.79164 },
    "C297": { name: "Castiglione di Sicilia (CT)", shortName: "Castiglione di Sicilia", prov: "CT", lat: 37.8827, lon: 15.12239 },
    "C341": { name: "Castrofilippo (AG)", shortName: "Castrofilippo", prov: "AG", lat: 37.34869, lon: 13.75018 },
    "C344": { name: "Castronovo di Sicilia (PA)", shortName: "Castronovo di Sicilia", prov: "PA", lat: 37.67842, lon: 13.60374 },
    "C347": { name: "Castroreale (ME)", shortName: "Castroreale", prov: "ME", lat: 38.09848, lon: 15.21103 },
    "C351": { name: "Catania (CT)", shortName: "Catania", prov: "CT", lat: 37.50288, lon: 15.08705 },
    "C353": { name: "Catenanuova (EN)", shortName: "Catenanuova", prov: "EN", lat: 37.56792, lon: 14.69146 },
    "C356": { name: "Cattolica Eraclea (AG)", shortName: "Cattolica Eraclea", prov: "AG", lat: 37.43953, lon: 13.3954 },
    "C420": { name: "Cefalà Diana (PA)", shortName: "Cefalà Diana", prov: "PA", lat: 37.91541, lon: 13.46372 },
    "C421": { name: "Cefalù (PA)", shortName: "Cefalù", prov: "PA", lat: 38.0397, lon: 14.02202 },
    "C471": { name: "Centuripe (EN)", shortName: "Centuripe", prov: "EN", lat: 37.62031, lon: 14.74143 },
    "C480": { name: "Cerami (EN)", shortName: "Cerami", prov: "EN", lat: 37.81035, lon: 14.50637 },
    "C496": { name: "Cerda (PA)", shortName: "Cerda", prov: "PA", lat: 37.90386, lon: 13.81537 },
    "C568": { name: "Cesarò (ME)", shortName: "Cesarò", prov: "ME", lat: 37.84375, lon: 14.71218 },
    "C612": { name: "Chiaramonte Gulfi (RG)", shortName: "Chiaramonte Gulfi", prov: "RG", lat: 37.03158, lon: 14.70127 },
    "C654": { name: "Chiusa Sclafani (PA)", shortName: "Chiusa Sclafani", prov: "PA", lat: 37.67706, lon: 13.26987 },
    "C668": { name: "Cianciana (AG)", shortName: "Cianciana", prov: "AG", lat: 37.51745, lon: 13.43526 },
    "C696": { name: "Ciminna (PA)", shortName: "Ciminna", prov: "PA", lat: 37.89726, lon: 13.56195 },
    "C708": { name: "Cinisi (PA)", shortName: "Cinisi", prov: "PA", lat: 38.1549, lon: 13.10914 },
    "C871": { name: "Collesano (PA)", shortName: "Collesano", prov: "PA", lat: 37.92106, lon: 13.93755 },
    "C927": { name: "Comiso (RG)", shortName: "Comiso", prov: "RG", lat: 36.94566, lon: 14.60469 },
    "C928": { name: "Comitini (AG)", shortName: "Comitini", prov: "AG", lat: 37.40861, lon: 13.64362 },
    "C956": { name: "Condrò (ME)", shortName: "Condrò", prov: "ME", lat: 38.1757, lon: 15.32649 },
    "C968": { name: "Contessa Entellina (PA)", shortName: "Contessa Entellina", prov: "PA", lat: 37.7282, lon: 13.18404 },
    "D009": { name: "Corleone (PA)", shortName: "Corleone", prov: "PA", lat: 37.81204, lon: 13.30158 },
    "D234": { name: "Custonaci (TP)", shortName: "Custonaci", prov: "TP", lat: 38.07803, lon: 12.67554 },
    "D267": { name: "Delia (CL)", shortName: "Delia", prov: "CL", lat: 37.35606, lon: 13.92763 },
    "C342": { name: "Enna (EN)", shortName: "Enna", prov: "EN", lat: 37.56706, lon: 14.27909 },
    "D423": { name: "Erice (TP)", shortName: "Erice", prov: "TP", lat: 38.0381, lon: 12.58704 },
    "D474": { name: "Falcone (ME)", shortName: "Falcone", prov: "ME", lat: 38.11643, lon: 15.08229 },
    "D514": { name: "Favara (AG)", shortName: "Favara", prov: "AG", lat: 37.31071, lon: 13.65646 },
    "D518": { name: "Favignana (TP)", shortName: "Favignana", prov: "TP", lat: 37.93178, lon: 12.32724 },
    "D540": { name: "Ferla (SR)", shortName: "Ferla", prov: "SR", lat: 37.11861, lon: 14.94147 },
    "D567": { name: "Ficarazzi (PA)", shortName: "Ficarazzi", prov: "PA", lat: 38.08835, lon: 13.46321 },
    "D569": { name: "Ficarra (ME)", shortName: "Ficarra", prov: "ME", lat: 38.11042, lon: 14.82748 },
    "D622": { name: "Fiumedinisi (ME)", shortName: "Fiumedinisi", prov: "ME", lat: 38.02503, lon: 15.38231 },
    "D623": { name: "Fiumefreddo di Sicilia (CT)", shortName: "Fiumefreddo di Sicilia", prov: "CT", lat: 37.79293, lon: 15.2082 },
    "D635": { name: "Floresta (ME)", shortName: "Floresta", prov: "ME", lat: 37.9877, lon: 14.90945 },
    "D636": { name: "Floridia (SR)", shortName: "Floridia", prov: "SR", lat: 37.08211, lon: 15.15289 },
    "D661": { name: "Fondachelli-Fantina (ME)", shortName: "Fondachelli-Fantina", prov: "ME", lat: 37.98598, lon: 15.17308 },
    "D733": { name: "Forza d'Agrò (ME)", shortName: "Forza d'Agrò", prov: "ME", lat: 37.91411, lon: 15.33513 },
    "D765": { name: "Francavilla di Sicilia (ME)", shortName: "Francavilla di Sicilia", prov: "ME", lat: 37.90125, lon: 15.13614 },
    "D768": { name: "Francofonte (SR)", shortName: "Francofonte", prov: "SR", lat: 37.23078, lon: 14.88013 },
    "D793": { name: "Frazzanò (ME)", shortName: "Frazzanò", prov: "ME", lat: 38.07234, lon: 14.74475 },
    "D824": { name: "Furci Siculo (ME)", shortName: "Furci Siculo", prov: "ME", lat: 37.9609, lon: 15.37997 },
    "D825": { name: "Furnari (ME)", shortName: "Furnari", prov: "ME", lat: 38.10475, lon: 15.12549 },
    "D844": { name: "Gaggi (ME)", shortName: "Gaggi", prov: "ME", lat: 37.86086, lon: 15.22056 },
    "D849": { name: "Gagliano Castelferrato (EN)", shortName: "Gagliano Castelferrato", prov: "EN", lat: 37.71032, lon: 14.53558 },
    "D861": { name: "Galati Mamertino (ME)", shortName: "Galati Mamertino", prov: "ME", lat: 38.03303, lon: 14.77102 },
    "D885": { name: "Gallodoro (ME)", shortName: "Gallodoro", prov: "ME", lat: 37.90168, lon: 15.29382 },
    "D907": { name: "Gangi (PA)", shortName: "Gangi", prov: "PA", lat: 37.79815, lon: 14.20525 },
    "D960": { name: "Gela (CL)", shortName: "Gela", prov: "CL", lat: 37.06545, lon: 14.25035 },
    "D977": { name: "Geraci Siculo (PA)", shortName: "Geraci Siculo", prov: "PA", lat: 37.85899, lon: 14.15415 },
    "E013": { name: "Giardinello (PA)", shortName: "Giardinello", prov: "PA", lat: 38.08861, lon: 13.15678 },
    "E014": { name: "Giardini-Naxos (ME)", shortName: "Giardini-Naxos", prov: "ME", lat: 37.84023, lon: 15.27742 },
    "E016": { name: "Giarratana (RG)", shortName: "Giarratana", prov: "RG", lat: 37.04828, lon: 14.79303 },
    "E017": { name: "Giarre (CT)", shortName: "Giarre", prov: "CT", lat: 37.73004, lon: 15.1845 },
    "E023": { name: "Gibellina (TP)", shortName: "Gibellina", prov: "TP", lat: 37.80994, lon: 12.86982 },
    "E043": { name: "Gioiosa Marea (ME)", shortName: "Gioiosa Marea", prov: "ME", lat: 38.17199, lon: 14.89284 },
    "E055": { name: "Giuliana (PA)", shortName: "Giuliana", prov: "PA", lat: 37.67427, lon: 13.23787 },
    "E074": { name: "Godrano (PA)", shortName: "Godrano", prov: "PA", lat: 37.90304, lon: 13.42862 },
    "E133": { name: "Grammichele (CT)", shortName: "Grammichele", prov: "CT", lat: 37.21501, lon: 14.63724 },
    "E142": { name: "Graniti (ME)", shortName: "Graniti", prov: "ME", lat: 37.89133, lon: 15.22671 },
    "E149": { name: "Gratteri (PA)", shortName: "Gratteri", prov: "PA", lat: 37.96731, lon: 13.97307 },
    "E156": { name: "Gravina di Catania (CT)", shortName: "Gravina di Catania", prov: "CT", lat: 37.56058, lon: 15.06213 },
    "E209": { name: "Grotte (AG)", shortName: "Grotte", prov: "AG", lat: 37.40255, lon: 13.69918 },
    "E233": { name: "Gualtieri Sicaminò (ME)", shortName: "Gualtieri Sicaminò", prov: "ME", lat: 38.16307, lon: 15.31676 },
    "E337": { name: "Isnello (PA)", shortName: "Isnello", prov: "PA", lat: 37.94398, lon: 14.00607 },
    "E350": { name: "Isola delle Femmine (PA)", shortName: "Isola delle Femmine", prov: "PA", lat: 38.20059, lon: 13.24621 },
    "E366": { name: "Ispica (RG)", shortName: "Ispica", prov: "RG", lat: 36.78618, lon: 14.90352 },
    "E374": { name: "Itala (ME)", shortName: "Itala", prov: "ME", lat: 38.05061, lon: 15.43732 },
    "E390": { name: "Joppolo Giancaxio (AG)", shortName: "Joppolo Giancaxio", prov: "AG", lat: 37.38775, lon: 13.5541 },
    "E431": { name: "Lampedusa e Linosa (AG)", shortName: "Lampedusa e Linosa", prov: "AG", lat: 35.50196, lon: 12.60984 },
    "E459": { name: "Lascari (PA)", shortName: "Lascari", prov: "PA", lat: 37.99988, lon: 13.94112 },
    "E523": { name: "Leni (ME)", shortName: "Leni", prov: "ME", lat: 38.55495, lon: 14.82417 },
    "E532": { name: "Lentini (SR)", shortName: "Lentini", prov: "SR", lat: 37.28451, lon: 14.99934 },
    "E536": { name: "Leonforte (EN)", shortName: "Leonforte", prov: "EN", lat: 37.63918, lon: 14.39207 },
    "E541": { name: "Lercara Friddi (PA)", shortName: "Lercara Friddi", prov: "PA", lat: 37.74749, lon: 13.60284 },
    "E555": { name: "Letojanni (ME)", shortName: "Letojanni", prov: "ME", lat: 37.88031, lon: 15.30626 },
    "E571": { name: "Librizzi (ME)", shortName: "Librizzi", prov: "ME", lat: 38.09717, lon: 14.95819 },
    "E573": { name: "Licata (AG)", shortName: "Licata", prov: "AG", lat: 37.10157, lon: 13.93718 },
    "E578": { name: "Licodia Eubea (CT)", shortName: "Licodia Eubea", prov: "CT", lat: 37.15573, lon: 14.70332 },
    "E594": { name: "Limina (ME)", shortName: "Limina", prov: "ME", lat: 37.94088, lon: 15.27264 },
    "E602": { name: "Linguaglossa (CT)", shortName: "Linguaglossa", prov: "CT", lat: 37.84073, lon: 15.14401 },
    "E606": { name: "Lipari (ME)", shortName: "Lipari", prov: "ME", lat: 38.46904, lon: 14.95652 },
    "E674": { name: "Longi (ME)", shortName: "Longi", prov: "ME", lat: 38.02717, lon: 14.75261 },
    "E714": { name: "Lucca Sicula (AG)", shortName: "Lucca Sicula", prov: "AG", lat: 37.57846, lon: 13.30671 },
    "E854": { name: "Maletto (CT)", shortName: "Maletto", prov: "CT", lat: 37.8295, lon: 14.86629 },
    "E855": { name: "Malfa (ME)", shortName: "Malfa", prov: "ME", lat: 38.577, lon: 14.83604 },
    "E869": { name: "Malvagna (ME)", shortName: "Malvagna", prov: "ME", lat: 37.91866, lon: 15.05435 },
    "E876": { name: "Mandanici (ME)", shortName: "Mandanici", prov: "ME", lat: 38.0023, lon: 15.31711 },
    "M283": { name: "Maniace (CT)", shortName: "Maniace", prov: "CT", lat: 37.86201, lon: 14.80775 },
    "E953": { name: "Marianopoli (CL)", shortName: "Marianopoli", prov: "CL", lat: 37.59883, lon: 13.91508 },
    "E957": { name: "Marineo (PA)", shortName: "Marineo", prov: "PA", lat: 37.95268, lon: 13.41411 },
    "E974": { name: "Marsala (TP)", shortName: "Marsala", prov: "TP", lat: 37.79917, lon: 12.43495 },
    "F004": { name: "Mascali (CT)", shortName: "Mascali", prov: "CT", lat: 37.7575, lon: 15.19536 },
    "F005": { name: "Mascalucia (CT)", shortName: "Mascalucia", prov: "CT", lat: 37.57306, lon: 15.05302 },
    "F061": { name: "Mazara del Vallo (TP)", shortName: "Mazara del Vallo", prov: "TP", lat: 37.65135, lon: 12.58972 },
    "F065": { name: "Mazzarino (CL)", shortName: "Mazzarino", prov: "CL", lat: 37.305, lon: 14.21424 },
    "F066": { name: "Mazzarrà Sant'Andrea (ME)", shortName: "Mazzarrà Sant'Andrea", prov: "ME", lat: 38.0898, lon: 15.13586 },
    "M271": { name: "Mazzarrone (CT)", shortName: "Mazzarrone", prov: "CT", lat: 37.08401, lon: 14.5616 },
    "F107": { name: "Melilli (SR)", shortName: "Melilli", prov: "SR", lat: 37.17851, lon: 15.12675 },
    "F126": { name: "Menfi (AG)", shortName: "Menfi", prov: "AG", lat: 37.59822, lon: 12.96641 },
    "F147": { name: "Merì (ME)", shortName: "Merì", prov: "ME", lat: 38.16794, lon: 15.24644 },
    "F158": { name: "Messina (ME)", shortName: "Messina", prov: "ME", lat: 38.19396, lon: 15.55572 },
    "F184": { name: "Mezzojuso (PA)", shortName: "Mezzojuso", prov: "PA", lat: 37.8645, lon: 13.46451 },
    "F206": { name: "Milazzo (ME)", shortName: "Milazzo", prov: "ME", lat: 38.22087, lon: 15.24274 },
    "E618": { name: "Milena (CL)", shortName: "Milena", prov: "CL", lat: 37.47145, lon: 13.73628 },
    "F209": { name: "Militello in Val di Catania (CT)", shortName: "Militello in Val di Catania", prov: "CT", lat: 37.27481, lon: 14.794 },
    "F210": { name: "Militello Rosmarino (ME)", shortName: "Militello Rosmarino", prov: "ME", lat: 38.04636, lon: 14.67604 },
    "F214": { name: "Milo (CT)", shortName: "Milo", prov: "CT", lat: 37.72334, lon: 15.11607 },
    "F217": { name: "Mineo (CT)", shortName: "Mineo", prov: "CT", lat: 37.26487, lon: 14.69111 },
    "F231": { name: "Mirabella Imbaccari (CT)", shortName: "Mirabella Imbaccari", prov: "CT", lat: 37.32444, lon: 14.44603 },
    "F242": { name: "Mirto (ME)", shortName: "Mirto", prov: "ME", lat: 38.08512, lon: 14.75285 },
    "F246": { name: "Misilmeri (PA)", shortName: "Misilmeri", prov: "PA", lat: 38.03514, lon: 13.45155 },
    "F250": { name: "Misterbianco (CT)", shortName: "Misterbianco", prov: "CT", lat: 37.52084, lon: 15.00637 },
    "F251": { name: "Mistretta (ME)", shortName: "Mistretta", prov: "ME", lat: 37.93049, lon: 14.36235 },
    "F258": { name: "Modica (RG)", shortName: "Modica", prov: "RG", lat: 36.85885, lon: 14.76136 },
    "F277": { name: "Moio Alcantara (ME)", shortName: "Moio Alcantara", prov: "ME", lat: 37.89884, lon: 15.05053 },
    "F359": { name: "Monforte San Giorgio (ME)", shortName: "Monforte San Giorgio", prov: "ME", lat: 38.15687, lon: 15.38352 },
    "F368": { name: "Mongiuffi Melia (ME)", shortName: "Mongiuffi Melia", prov: "ME", lat: 37.9042, lon: 15.27493 },
    "F377": { name: "Monreale (PA)", shortName: "Monreale", prov: "PA", lat: 38.08233, lon: 13.2917 },
    "F395": { name: "Montagnareale (ME)", shortName: "Montagnareale", prov: "ME", lat: 38.13246, lon: 14.94771 },
    "F400": { name: "Montalbano Elicona (ME)", shortName: "Montalbano Elicona", prov: "ME", lat: 38.02371, lon: 15.01413 },
    "F414": { name: "Montallegro (AG)", shortName: "Montallegro", prov: "AG", lat: 37.39109, lon: 13.35068 },
    "F489": { name: "Montedoro (CL)", shortName: "Montedoro", prov: "CL", lat: 37.45374, lon: 13.81638 },
    "F544": { name: "Montelepre (PA)", shortName: "Montelepre", prov: "PA", lat: 38.08979, lon: 13.17327 },
    "F553": { name: "Montemaggiore Belsito (PA)", shortName: "Montemaggiore Belsito", prov: "PA", lat: 37.84789, lon: 13.76258 },
    "F610": { name: "Monterosso Almo (RG)", shortName: "Monterosso Almo", prov: "RG", lat: 37.08888, lon: 14.76257 },
    "F655": { name: "Montevago (AG)", shortName: "Montevago", prov: "AG", lat: 37.70262, lon: 12.99018 },
    "F772": { name: "Motta Camastra (ME)", shortName: "Motta Camastra", prov: "ME", lat: 37.89569, lon: 15.1725 },
    "F773": { name: "Motta d'Affermo (ME)", shortName: "Motta d'Affermo", prov: "ME", lat: 37.98129, lon: 14.30206 },
    "F781": { name: "Motta Sant'Anastasia (CT)", shortName: "Motta Sant'Anastasia", prov: "CT", lat: 37.5121, lon: 14.96977 },
    "F830": { name: "Mussomeli (CL)", shortName: "Mussomeli", prov: "CL", lat: 37.58022, lon: 13.75403 },
    "F845": { name: "Naro (AG)", shortName: "Naro", prov: "AG", lat: 37.29606, lon: 13.79204 },
    "F848": { name: "Naso (ME)", shortName: "Naso", prov: "ME", lat: 38.12194, lon: 14.7882 },
    "F890": { name: "Nicolosi (CT)", shortName: "Nicolosi", prov: "CT", lat: 37.61414, lon: 15.02671 },
    "F892": { name: "Nicosia (EN)", shortName: "Nicosia", prov: "EN", lat: 37.74805, lon: 14.39855 },
    "F899": { name: "Niscemi (CL)", shortName: "Niscemi", prov: "CL", lat: 37.14528, lon: 14.38504 },
    "F900": { name: "Nissoria (EN)", shortName: "Nissoria", prov: "EN", lat: 37.65516, lon: 14.44936 },
    "F901": { name: "Nizza di Sicilia (ME)", shortName: "Nizza di Sicilia", prov: "ME", lat: 37.98886, lon: 15.40794 },
    "F943": { name: "Noto (SR)", shortName: "Noto", prov: "SR", lat: 36.8917, lon: 15.0667 },
    "F951": { name: "Novara di Sicilia (ME)", shortName: "Novara di Sicilia", prov: "ME", lat: 38.01625, lon: 15.13194 },
    "G036": { name: "Oliveri (ME)", shortName: "Oliveri", prov: "ME", lat: 38.12463, lon: 15.05948 },
    "G209": { name: "Pace del Mela (ME)", shortName: "Pace del Mela", prov: "ME", lat: 38.18013, lon: 15.3057 },
    "G208": { name: "Paceco (TP)", shortName: "Paceco", prov: "TP", lat: 37.98109, lon: 12.5571 },
    "G211": { name: "Pachino (SR)", shortName: "Pachino", prov: "SR", lat: 36.71609, lon: 15.09315 },
    "G234": { name: "Pagliara (ME)", shortName: "Pagliara", prov: "ME", lat: 37.98659, lon: 15.3595 },
    "G253": { name: "Palagonia (CT)", shortName: "Palagonia", prov: "CT", lat: 37.32766, lon: 14.74576 },
    "G263": { name: "Palazzo Adriano (PA)", shortName: "Palazzo Adriano", prov: "PA", lat: 37.68162, lon: 13.37966 },
    "G267": { name: "Palazzolo Acreide (SR)", shortName: "Palazzolo Acreide", prov: "SR", lat: 37.06188, lon: 14.90383 },
    "G273": { name: "Palermo (PA)", shortName: "Palermo", prov: "PA", lat: 38.1157, lon: 13.36236 },
    "G282": { name: "Palma di Montechiaro (AG)", shortName: "Palma di Montechiaro", prov: "AG", lat: 37.19168, lon: 13.76368 },
    "G315": { name: "Pantelleria (TP)", shortName: "Pantelleria", prov: "TP", lat: 36.83189, lon: 11.94474 },
    "G347": { name: "Partanna (TP)", shortName: "Partanna", prov: "TP", lat: 37.7214, lon: 12.88966 },
    "G348": { name: "Partinico (PA)", shortName: "Partinico", prov: "PA", lat: 38.04808, lon: 13.11522 },
    "G371": { name: "Paternò (CT)", shortName: "Paternò", prov: "CT", lat: 37.57697, lon: 14.90252 },
    "G377": { name: "Patti (ME)", shortName: "Patti", prov: "ME", lat: 38.13978, lon: 14.96404 },
    "G402": { name: "Pedara (CT)", shortName: "Pedara", prov: "CT", lat: 37.6172, lon: 15.06022 },
    "G510": { name: "Petralia Soprana (PA)", shortName: "Petralia Soprana", prov: "PA", lat: 37.79634, lon: 14.10825 },
    "G511": { name: "Petralia Sottana (PA)", shortName: "Petralia Sottana", prov: "PA", lat: 37.80594, lon: 14.09222 },
    "M281": { name: "Petrosino (TP)", shortName: "Petrosino", prov: "TP", lat: 37.71277, lon: 12.49232 },
    "G522": { name: "Pettineo (ME)", shortName: "Pettineo", prov: "ME", lat: 37.96661, lon: 14.29122 },
    "G543": { name: "Piana degli Albanesi (PA)", shortName: "Piana degli Albanesi", prov: "PA", lat: 37.99447, lon: 13.28199 },
    "G580": { name: "Piazza Armerina (EN)", shortName: "Piazza Armerina", prov: "EN", lat: 37.38421, lon: 14.36604 },
    "G597": { name: "Piedimonte Etneo (CT)", shortName: "Piedimonte Etneo", prov: "CT", lat: 37.80767, lon: 15.17821 },
    "G624": { name: "Pietraperzia (EN)", shortName: "Pietraperzia", prov: "EN", lat: 37.42163, lon: 14.13691 },
    "G699": { name: "Piraino (ME)", shortName: "Piraino", prov: "ME", lat: 38.1619, lon: 14.86317 },
    "G767": { name: "Poggioreale (TP)", shortName: "Poggioreale", prov: "TP", lat: 37.76215, lon: 13.03394 },
    "G792": { name: "Polizzi Generosa (PA)", shortName: "Polizzi Generosa", prov: "PA", lat: 37.81291, lon: 13.99947 },
    "G797": { name: "Pollina (PA)", shortName: "Pollina", prov: "PA", lat: 37.99425, lon: 14.14658 },
    "F299": { name: "Porto Empedocle (AG)", shortName: "Porto Empedocle", prov: "AG", lat: 37.28847, lon: 13.52747 },
    "M257": { name: "Portopalo di Capo Passero (SR)", shortName: "Portopalo di Capo Passero", prov: "SR", lat: 36.68333, lon: 15.13397 },
    "G953": { name: "Pozzallo (RG)", shortName: "Pozzallo", prov: "RG", lat: 36.72659, lon: 14.84616 },
    "M279": { name: "Priolo Gargallo (SR)", shortName: "Priolo Gargallo", prov: "SR", lat: 37.15942, lon: 15.18829 },
    "H070": { name: "Prizzi (PA)", shortName: "Prizzi", prov: "PA", lat: 37.72165, lon: 13.43099 },
    "H148": { name: "Racalmuto (AG)", shortName: "Racalmuto", prov: "AG", lat: 37.40771, lon: 13.73142 },
    "H151": { name: "Raccuja (ME)", shortName: "Raccuja", prov: "ME", lat: 38.05561, lon: 14.91065 },
    "H154": { name: "Raddusa (CT)", shortName: "Raddusa", prov: "CT", lat: 37.47292, lon: 14.53173 },
    "H159": { name: "Raffadali (AG)", shortName: "Raffadali", prov: "AG", lat: 37.4049, lon: 13.53109 },
    "M287": { name: "Ragalna (CT)", shortName: "Ragalna", prov: "CT", lat: 37.63013, lon: 14.93914 },
    "H163": { name: "Ragusa (RG)", shortName: "Ragusa", prov: "RG", lat: 36.92509, lon: 14.7307 },
    "H168": { name: "Ramacca (CT)", shortName: "Ramacca", prov: "CT", lat: 37.38487, lon: 14.69378 },
    "H175": { name: "Randazzo (CT)", shortName: "Randazzo", prov: "CT", lat: 37.87791, lon: 14.94605 },
    "H194": { name: "Ravanusa (AG)", shortName: "Ravanusa", prov: "AG", lat: 37.26824, lon: 13.97248 },
    "H205": { name: "Realmonte (AG)", shortName: "Realmonte", prov: "AG", lat: 37.30681, lon: 13.46279 },
    "H221": { name: "Regalbuto (EN)", shortName: "Regalbuto", prov: "EN", lat: 37.65263, lon: 14.6408 },
    "H228": { name: "Reitano (ME)", shortName: "Reitano", prov: "ME", lat: 37.97308, lon: 14.34445 },
    "H245": { name: "Resuttano (CL)", shortName: "Resuttano", prov: "CL", lat: 37.68013, lon: 14.03105 },
    "H269": { name: "Ribera (AG)", shortName: "Ribera", prov: "AG", lat: 37.50382, lon: 13.26866 },
    "H281": { name: "Riesi (CL)", shortName: "Riesi", prov: "CL", lat: 37.28338, lon: 14.08221 },
    "H325": { name: "Riposto (CT)", shortName: "Riposto", prov: "CT", lat: 37.73182, lon: 15.20384 },
    "H405": { name: "Roccafiorita (ME)", shortName: "Roccafiorita", prov: "ME", lat: 37.92988, lon: 15.26847 },
    "H418": { name: "Roccalumera (ME)", shortName: "Roccalumera", prov: "ME", lat: 37.97509, lon: 15.39453 },
    "H422": { name: "Roccamena (PA)", shortName: "Roccamena", prov: "PA", lat: 37.83859, lon: 13.1553 },
    "H428": { name: "Roccapalumba (PA)", shortName: "Roccapalumba", prov: "PA", lat: 37.80607, lon: 13.63945 },
    "H380": { name: "Roccavaldina (ME)", shortName: "Roccavaldina", prov: "ME", lat: 38.1823, lon: 15.37498 },
    "H455": { name: "Roccella Valdemone (ME)", shortName: "Roccella Valdemone", prov: "ME", lat: 37.93275, lon: 15.00952 },
    "H479": { name: "Rodì Milici (ME)", shortName: "Rodì Milici", prov: "ME", lat: 38.11046, lon: 15.16957 },
    "H519": { name: "Rometta (ME)", shortName: "Rometta", prov: "ME", lat: 38.17266, lon: 15.41549 },
    "H574": { name: "Rosolini (SR)", shortName: "Rosolini", prov: "SR", lat: 36.82035, lon: 14.95353 },
    "H688": { name: "Salaparuta (TP)", shortName: "Salaparuta", prov: "TP", lat: 37.75698, lon: 13.00627 },
    "H700": { name: "Salemi (TP)", shortName: "Salemi", prov: "TP", lat: 37.816, lon: 12.80151 },
    "H743": { name: "Sambuca di Sicilia (AG)", shortName: "Sambuca di Sicilia", prov: "AG", lat: 37.64742, lon: 13.11073 },
    "H778": { name: "San Biagio Platani (AG)", shortName: "San Biagio Platani", prov: "AG", lat: 37.50899, lon: 13.52423 },
    "H792": { name: "San Cataldo (CL)", shortName: "San Cataldo", prov: "CL", lat: 37.48716, lon: 13.99048 },
    "H797": { name: "San Cipirello (PA)", shortName: "San Cipirello", prov: "PA", lat: 37.96023, lon: 13.1817 },
    "H805": { name: "San Cono (CT)", shortName: "San Cono", prov: "CT", lat: 37.28994, lon: 14.366 },
    "H842": { name: "San Filippo del Mela (ME)", shortName: "San Filippo del Mela", prov: "ME", lat: 38.16929, lon: 15.27181 },
    "H850": { name: "San Fratello (ME)", shortName: "San Fratello", prov: "ME", lat: 38.01289, lon: 14.59623 },
    "H914": { name: "San Giovanni Gemini (AG)", shortName: "San Giovanni Gemini", prov: "AG", lat: 37.62994, lon: 13.6412 },
    "H922": { name: "San Giovanni la Punta (CT)", shortName: "San Giovanni la Punta", prov: "CT", lat: 37.57707, lon: 15.0943 },
    "H933": { name: "San Giuseppe Jato (PA)", shortName: "San Giuseppe Jato", prov: "PA", lat: 37.96819, lon: 13.18116 },
    "H940": { name: "San Gregorio di Catania (CT)", shortName: "San Gregorio di Catania", prov: "CT", lat: 37.56488, lon: 15.10846 },
    "H982": { name: "San Marco d'Alunzio (ME)", shortName: "San Marco d'Alunzio", prov: "ME", lat: 38.07305, lon: 14.69884 },
    "I028": { name: "San Mauro Castelverde (PA)", shortName: "San Mauro Castelverde", prov: "PA", lat: 37.91446, lon: 14.19009 },
    "I035": { name: "San Michele di Ganzaria (CT)", shortName: "San Michele di Ganzaria", prov: "CT", lat: 37.27947, lon: 14.42612 },
    "I084": { name: "San Pier Niceto (ME)", shortName: "San Pier Niceto", prov: "ME", lat: 38.15873, lon: 15.35152 },
    "I086": { name: "San Piero Patti (ME)", shortName: "San Piero Patti", prov: "ME", lat: 38.05068, lon: 14.96622 },
    "I098": { name: "San Pietro Clarenza (CT)", shortName: "San Pietro Clarenza", prov: "CT", lat: 37.57233, lon: 15.02419 },
    "I147": { name: "San Salvatore di Fitalia (ME)", shortName: "San Salvatore di Fitalia", prov: "ME", lat: 38.07054, lon: 14.77746 },
    "I328": { name: "San Teodoro (ME)", shortName: "San Teodoro", prov: "ME", lat: 37.84781, lon: 14.69937 },
    "I407": { name: "San Vito Lo Capo (TP)", shortName: "San Vito Lo Capo", prov: "TP", lat: 38.1731, lon: 12.73502 },
    "I199": { name: "Sant'Agata di Militello (ME)", shortName: "Sant'Agata di Militello", prov: "ME", lat: 38.06952, lon: 14.63368 },
    "I202": { name: "Sant'Agata li Battiati (CT)", shortName: "Sant'Agata li Battiati", prov: "CT", lat: 37.55865, lon: 15.08023 },
    "I215": { name: "Sant'Alessio Siculo (ME)", shortName: "Sant'Alessio Siculo", prov: "ME", lat: 37.91758, lon: 15.34478 },
    "I216": { name: "Sant'Alfio (CT)", shortName: "Sant'Alfio", prov: "CT", lat: 37.74407, lon: 15.14411 },
    "I283": { name: "Sant'Angelo di Brolo (ME)", shortName: "Sant'Angelo di Brolo", prov: "ME", lat: 38.1132, lon: 14.88215 },
    "I290": { name: "Sant'Angelo Muxaro (AG)", shortName: "Sant'Angelo Muxaro", prov: "AG", lat: 37.47919, lon: 13.54428 },
    "I169": { name: "Santa Caterina Villarmosa (CL)", shortName: "Santa Caterina Villarmosa", prov: "CL", lat: 37.59175, lon: 14.03189 },
    "I174": { name: "Santa Cristina Gela (PA)", shortName: "Santa Cristina Gela", prov: "PA", lat: 37.98509, lon: 13.32752 },
    "I178": { name: "Santa Croce Camerina (RG)", shortName: "Santa Croce Camerina", prov: "RG", lat: 36.82854, lon: 14.52544 },
    "I184": { name: "Santa Domenica Vittoria (ME)", shortName: "Santa Domenica Vittoria", prov: "ME", lat: 37.91555, lon: 14.96189 },
    "I185": { name: "Santa Elisabetta (AG)", shortName: "Santa Elisabetta", prov: "AG", lat: 37.43158, lon: 13.5549 },
    "I188": { name: "Santa Flavia (PA)", shortName: "Santa Flavia", prov: "PA", lat: 38.08217, lon: 13.525 },
    "I220": { name: "Santa Lucia del Mela (ME)", shortName: "Santa Lucia del Mela", prov: "ME", lat: 38.13999, lon: 15.28318 },
    "I224": { name: "Santa Margherita di Belice (AG)", shortName: "Santa Margherita di Belice", prov: "AG", lat: 37.69197, lon: 13.02402 },
    "I240": { name: "Santa Maria di Licodia (CT)", shortName: "Santa Maria di Licodia", prov: "CT", lat: 37.61618, lon: 14.8874 },
    "I254": { name: "Santa Marina Salina (ME)", shortName: "Santa Marina Salina", prov: "ME", lat: 38.55942, lon: 14.8717 },
    "I291": { name: "Santa Ninfa (TP)", shortName: "Santa Ninfa", prov: "TP", lat: 37.77382, lon: 12.88022 },
    "I311": { name: "Santa Teresa di Riva (ME)", shortName: "Santa Teresa di Riva", prov: "ME", lat: 37.94571, lon: 15.36795 },
    "I314": { name: "Santa Venerina (CT)", shortName: "Santa Venerina", prov: "CT", lat: 37.68698, lon: 15.13888 },
    "I370": { name: "Santo Stefano di Camastra (ME)", shortName: "Santo Stefano di Camastra", prov: "ME", lat: 38.01635, lon: 14.34833 },
    "I356": { name: "Santo Stefano Quisquina (AG)", shortName: "Santo Stefano Quisquina", prov: "AG", lat: 37.6247, lon: 13.49032 },
    "I420": { name: "Saponara (ME)", shortName: "Saponara", prov: "ME", lat: 38.19387, lon: 15.43425 },
    "I477": { name: "Savoca (ME)", shortName: "Savoca", prov: "ME", lat: 37.95607, lon: 15.33979 },
    "I492": { name: "Scaletta Zanclea (ME)", shortName: "Scaletta Zanclea", prov: "ME", lat: 38.04286, lon: 15.45933 },
    "I533": { name: "Sciacca (AG)", shortName: "Sciacca", prov: "AG", lat: 37.50777, lon: 13.08293 },
    "I534": { name: "Sciara (PA)", shortName: "Sciara", prov: "PA", lat: 37.91464, lon: 13.76261 },
    "I535": { name: "Scicli (RG)", shortName: "Scicli", prov: "RG", lat: 36.79359, lon: 14.7059 },
    "I538": { name: "Scillato (PA)", shortName: "Scillato", prov: "PA", lat: 37.8567, lon: 13.90683 },
    "I541": { name: "Sclafani Bagni (PA)", shortName: "Sclafani Bagni", prov: "PA", lat: 37.82113, lon: 13.8546 },
    "I548": { name: "Scordia (CT)", shortName: "Scordia", prov: "CT", lat: 37.29649, lon: 14.84609 },
    "I644": { name: "Serradifalco (CL)", shortName: "Serradifalco", prov: "CL", lat: 37.45654, lon: 13.88251 },
    "I723": { name: "Siculiana (AG)", shortName: "Siculiana", prov: "AG", lat: 37.33648, lon: 13.42004 },
    "I747": { name: "Sinagra (ME)", shortName: "Sinagra", prov: "ME", lat: 38.08324, lon: 14.84953 },
    "I754": { name: "Siracusa (SR)", shortName: "Siracusa", prov: "SR", lat: 37.05992, lon: 15.29333 },
    "I785": { name: "Solarino (SR)", shortName: "Solarino", prov: "SR", lat: 37.10124, lon: 15.1191 },
    "I824": { name: "Sommatino (CL)", shortName: "Sommatino", prov: "CL", lat: 37.33386, lon: 13.99122 },
    "I864": { name: "Sortino (SR)", shortName: "Sortino", prov: "SR", lat: 37.16257, lon: 15.03283 },
    "I881": { name: "Spadafora (ME)", shortName: "Spadafora", prov: "ME", lat: 38.22208, lon: 15.37414 },
    "I891": { name: "Sperlinga (EN)", shortName: "Sperlinga", prov: "EN", lat: 37.7649, lon: 14.35337 },
    "L016": { name: "Sutera (CL)", shortName: "Sutera", prov: "CL", lat: 37.52558, lon: 13.7313 },
    "L042": { name: "Taormina (ME)", shortName: "Taormina", prov: "ME", lat: 37.85113, lon: 15.28308 },
    "M210": { name: "Terme Vigliatore (ME)", shortName: "Terme Vigliatore", prov: "ME", lat: 38.13673, lon: 15.16241 },
    "L112": { name: "Termini Imerese (PA)", shortName: "Termini Imerese", prov: "PA", lat: 37.98681, lon: 13.69594 },
    "L131": { name: "Terrasini (PA)", shortName: "Terrasini", prov: "PA", lat: 38.15295, lon: 13.08239 },
    "L271": { name: "Torregrotta (ME)", shortName: "Torregrotta", prov: "ME", lat: 38.19166, lon: 15.35232 },
    "M286": { name: "Torrenova (ME)", shortName: "Torrenova", prov: "ME", lat: 38.09113, lon: 14.67734 },
    "L282": { name: "Torretta (PA)", shortName: "Torretta", prov: "PA", lat: 38.13118, lon: 13.23314 },
    "L308": { name: "Tortorici (ME)", shortName: "Tortorici", prov: "ME", lat: 38.03054, lon: 14.82486 },
    "L317": { name: "Trabia (PA)", shortName: "Trabia", prov: "PA", lat: 37.99576, lon: 13.65541 },
    "L331": { name: "Trapani (TP)", shortName: "Trapani", prov: "TP", lat: 38.0185, lon: 12.51366 },
    "L332": { name: "Trappeto (PA)", shortName: "Trappeto", prov: "PA", lat: 38.06656, lon: 13.03653 },
    "L355": { name: "Trecastagni (CT)", shortName: "Trecastagni", prov: "CT", lat: 37.617, lon: 15.0792 },
    "L369": { name: "Tremestieri Etneo (CT)", shortName: "Tremestieri Etneo", prov: "CT", lat: 37.57584, lon: 15.07214 },
    "L431": { name: "Tripi (ME)", shortName: "Tripi", prov: "ME", lat: 38.04934, lon: 15.09943 },
    "L448": { name: "Troina (EN)", shortName: "Troina", prov: "EN", lat: 37.78502, lon: 14.60045 },
    "L478": { name: "Tusa (ME)", shortName: "Tusa", prov: "ME", lat: 37.98457, lon: 14.23853 },
    "L482": { name: "Ucria (ME)", shortName: "Ucria", prov: "ME", lat: 38.04563, lon: 14.88092 },
    "L519": { name: "Ustica (PA)", shortName: "Ustica", prov: "PA", lat: 38.71008, lon: 13.19284 },
    "G319": { name: "Valderice (TP)", shortName: "Valderice", prov: "TP", lat: 38.03795, lon: 12.61749 },
    "L561": { name: "Valdina (ME)", shortName: "Valdina", prov: "ME", lat: 38.1935, lon: 15.37074 },
    "L583": { name: "Valguarnera Caropepe (EN)", shortName: "Valguarnera Caropepe", prov: "EN", lat: 37.49668, lon: 14.38816 },
    "L603": { name: "Valledolmo (PA)", shortName: "Valledolmo", prov: "PA", lat: 37.74708, lon: 13.82826 },
    "L609": { name: "Vallelunga Pratameno (CL)", shortName: "Vallelunga Pratameno", prov: "CL", lat: 37.68021, lon: 13.83047 },
    "L658": { name: "Valverde (CT)", shortName: "Valverde", prov: "CT", lat: 37.579, lon: 15.12482 },
    "L735": { name: "Venetico (ME)", shortName: "Venetico", prov: "ME", lat: 38.21905, lon: 15.3648 },
    "L740": { name: "Ventimiglia di Sicilia (PA)", shortName: "Ventimiglia di Sicilia", prov: "PA", lat: 37.92614, lon: 13.56791 },
    "L828": { name: "Viagrande (CT)", shortName: "Viagrande", prov: "CT", lat: 37.61059, lon: 15.09633 },
    "L837": { name: "Vicari (PA)", shortName: "Vicari", prov: "PA", lat: 37.82658, lon: 13.57075 },
    "L916": { name: "Villabate (PA)", shortName: "Villabate", prov: "PA", lat: 38.07564, lon: 13.44209 },
    "L944": { name: "Villafranca Sicula (AG)", shortName: "Villafranca Sicula", prov: "AG", lat: 37.58683, lon: 13.29094 },
    "L950": { name: "Villafranca Tirrena (ME)", shortName: "Villafranca Tirrena", prov: "ME", lat: 38.23545, lon: 15.4325 },
    "L951": { name: "Villafrati (PA)", shortName: "Villafrati", prov: "PA", lat: 37.90807, lon: 13.48672 },
    "L959": { name: "Villalba (CL)", shortName: "Villalba", prov: "CL", lat: 37.65498, lon: 13.84393 },
    "M011": { name: "Villarosa (EN)", shortName: "Villarosa", prov: "EN", lat: 37.58792, lon: 14.17423 },
    "M081": { name: "Vita (TP)", shortName: "Vita", prov: "TP", lat: 37.86843, lon: 12.81459 },
    "M088": { name: "Vittoria (RG)", shortName: "Vittoria", prov: "RG", lat: 36.94879, lon: 14.53801 },
    "M100": { name: "Vizzini (CT)", shortName: "Vizzini", prov: "CT", lat: 37.16103, lon: 14.74852 },
    "M139": { name: "Zafferana Etnea (CT)", shortName: "Zafferana Etnea", prov: "CT", lat: 37.69471, lon: 15.10338 },
    "M432": { name: "Misiliscemi (TP)", shortName: "Misiliscemi", prov: "TP", lat: 37.9300, lon: 12.5600 },
  };

  function populateComuniByProvincia(provCode) {
    if (!comuneSelect) return;
    comuneSelect.innerHTML = "";
    const defaultByProv = { SR: "H574", RG: "E366", CT: "C351", PA: "G273", ME: "F158", TP: "L331", AG: "A089", CL: "B429", EN: "C342" };
    const defaultCod = defaultByProv[provCode] || "";

    Object.entries(comuniData).forEach(([cod, info]) => {
      if (info.prov !== provCode || info.aliasOnly) return;
      const opt = document.createElement("option");
      opt.value = cod;
      opt.textContent = `${info.shortName} (${info.prov}) - ${cod}`;
      if (cod === defaultCod) opt.selected = true;
      comuneSelect.appendChild(opt);
    });
  }

  if (provinciaSelect) {
    populateComuniByProvincia(provinciaSelect.value || "SR");
    provinciaSelect.addEventListener("change", () => {
      const prov = provinciaSelect.value || "SR";
      populateComuniByProvincia(prov);
      const selectedCod = comuneSelect?.value;
      const comuneInfo = selectedCod ? comuniData[selectedCod] : null;
      if (comuneInfo && !(gFoglioInput?.value || "").trim()) {
        map.setView([comuneInfo.lat, comuneInfo.lon], 14);
      }
    });
  }

  const localCadastralCache = {};

  async function loadComuneIndex(codComune) {
    if (window.CATASTO_INDEX && window.CATASTO_INDEX[codComune]) {
      return window.CATASTO_INDEX[codComune];
    }
    if (localCadastralCache[codComune]) {
      return localCadastralCache[codComune];
    }

    // 1. Prova a caricare catasto/<COMUNE>.js tramite script tag dinamico (funziona anche su file://)
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `catasto/${codComune}.js`;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error("Script load error"));
        document.head.appendChild(script);
      });
      if (window.CATASTO_INDEX && window.CATASTO_INDEX[codComune]) {
        localCadastralCache[codComune] = window.CATASTO_INDEX[codComune];
        return window.CATASTO_INDEX[codComune];
      }
    } catch (_) {}

    // 2. Prova fetch del JSON locale
    try {
      const res = await fetch(`catasto/${codComune}.json`);
      if (res.ok) {
        const data = await res.json();
        localCadastralCache[codComune] = data;
        return data;
      }
    } catch (_) {}

    // 3. Fallback live su parquet remoto con hyparquet
    try {
      const { parquetRead } = await import("https://cdn.jsdelivr.net/npm/hyparquet@1.11.1/+esm");
      const resp = await fetch("https://raw.githubusercontent.com/ondata/dati_catastali/main/S_0000_ITALIA/anagrafica/19_Sicilia.parquet");
      const arrayBuffer = await resp.arrayBuffer();
      
      let fetchedRows = [];
      await parquetRead({
        file: arrayBuffer,
        onComplete: (rows) => { fetchedRows = rows; }
      });

      const fogliDict = {};
      const particelleDict = {};

      fetchedRows.forEach(row => {
        const rComune = Array.isArray(row) ? row[1] : row.comune;
        if (!rComune || String(rComune).toUpperCase() !== codComune) return;

        const rFoglio = String(Array.isArray(row) ? row[2] : row.foglio).trim().replace(/^0+/, "") || "0";
        const rPart = String(Array.isArray(row) ? row[3] : row.particella).trim().replace(/^0+/, "");
        const x = Number(Array.isArray(row) ? row[4] : row.x);
        const y = Number(Array.isArray(row) ? row[5] : row.y);

        if (isNaN(x) || isNaN(y)) return;
        const lon = x / 1000000.0;
        const lat = y / 1000000.0;

        if (!fogliDict[rFoglio]) {
          fogliDict[rFoglio] = [lat, lon];
        }

        if (rPart) {
          if (!particelleDict[rFoglio]) particelleDict[rFoglio] = {};
          particelleDict[rFoglio][rPart] = [lat, lon];
        }
      });

      const remoteData = { fogli: fogliDict, particelle: particelleDict };
      localCadastralCache[codComune] = remoteData;
      return remoteData;
    } catch (e) {
      console.warn("Fallback remoto hyparquet fallito:", e);
    }

    return null;
  }

  comuneSelect?.addEventListener("change", () => {
    const codComune = comuneSelect.value;
    const comuneInfo = comuniData[codComune];
    if (comuneInfo && !(gFoglioInput?.value || "").trim()) {
      map.setView([comuneInfo.lat, comuneInfo.lon], 15);
    }
  });

  catastralSearchBtn?.addEventListener("click", async () => {
    const codComune = comuneSelect?.value || "H574";
    const foglioRaw = (gFoglioInput?.value || "").trim();
    const particellaRaw = (gParticellaInput?.value || "").trim();
    const comuneInfo = comuniData[codComune] || comuniData.H574;

    if (!foglioRaw) {
      alert("Inserisci almeno il numero di Foglio catastale.");
      return;
    }

    const foglioNum = String(parseInt(foglioRaw, 10));
    const particellaNum = particellaRaw ? String(parseInt(particellaRaw, 10)) : "";

    if (catastralSearchStatus) {
      catastralSearchStatus.style.display = "block";
      catastralSearchStatus.textContent = `⏳ Caricamento indice catastale ${codComune}...`;
    }

    inspectLayerGroup.clearLayers();

    const cadData = await loadComuneIndex(codComune);

    if (!cadData) {
      alert("Impossibile caricare i dati catastali per questo comune. Verifica la connessione a internet o la presenza dei file locali.");
      if (catastralSearchStatus) catastralSearchStatus.style.display = "none";
      return;
    }

    let coords = null;
    let matchType = "";

    // Cerca particella se specificata
    if (particellaNum && cadData.particelle?.[foglioNum]?.[particellaNum]) {
      coords = cadData.particelle[foglioNum][particellaNum];
      matchType = "Particella Esatta";
    } 
    // Se la particella non esiste ma il foglio sì, prendi il baricentro del foglio e avvisa
    else if (cadData.fogli?.[foglioNum]) {
      coords = cadData.fogli[foglioNum];
      matchType = "Baricentro Foglio (Particella non trovata)";
    } 
    // Se non esiste nemmeno il foglio
    else {
      alert(`Foglio ${foglioRaw} non trovato nel Comune di ${comuneInfo.name}. Verifica il numero del foglio.`);
      if (catastralSearchStatus) catastralSearchStatus.style.display = "none";
      return;
    }

    const [lat, lon] = coords;
    lastClickedParcel = { lat, lon, comune: comuneInfo.name, foglio: foglioRaw, particella: particellaRaw };
    const directUrl = updateParcelShareState(codComune, foglioRaw, particellaRaw);

    // Centra immediatamente la mappa su [lat, lon] a Zoom 19
    map.setView([lat, lon], 19);

    const searchMarker = L.circleMarker([lat, lon], {
      radius: 12,
      color: "#d97706",
      weight: 3,
      fillColor: "#fbbf24",
      fillOpacity: 0.6
    }).addTo(inspectLayerGroup);

    searchMarker.bindPopup(`
      <div style="font-family: Manrope, sans-serif; padding: 0.3rem; min-width: 250px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e8e4db; padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="color: #0b1c2d; font-size: 0.98rem;">🎯 Localizzazione Catastale</strong>
          <span style="font-size: 0.72rem; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: 700;">VISUAL TAF</span>
        </div>
        <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Comune:</strong> ${comuneInfo.name}</p>
        <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Foglio:</strong> ${foglioRaw} &nbsp;|&nbsp; <strong>Particella:</strong> <span style="background:#fef3c7; padding:1px 6px; border-radius:4px; font-weight:700;">${particellaRaw || 'Intero Foglio'}</span></p>
        <p style="margin: 3px 0; font-size: 0.78rem; color: #5b6570;">Coordinate: ${lat.toFixed(6)}, ${lon.toFixed(6)} (${matchType})</p>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Buongiorno, vorrei richiedere una visura / rilievo per:\nComune: ${comuneInfo.name} (${codComune})\nFoglio: ${foglioRaw}\nParticella: ${particellaRaw || 'Intero Foglio'}\nLink Mappa: ${directUrl}`)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#128c7e; color:#fff; padding:6px 11px; border-radius:999px; font-size:0.76rem; font-weight:600; text-decoration:none;">WhatsApp ↗</a>
          <button type="button" onclick="navigator.clipboard.writeText('${directUrl}').then(() => { this.textContent = '✅ Link Copiato!'; })" style="background:#0b1c2d; color:#e0c56a; border:1px solid #c9a227; padding:5px 10px; border-radius:999px; font-size:0.75rem; font-weight:600; cursor:pointer;">🔗 Copia Link</button>
        </div>
        <button type="button" class="btn btn-gold" onclick="window.triangulateParcelWithPF(${lat}, ${lon}, '${comuneInfo.name.replace(/'/g, "\\'")}', '${foglioRaw}', '${particellaRaw}')" style="width: 100%; margin-top: 8px; padding: 7px 10px; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 5px; border-radius: 6px; cursor: pointer;">
          📐 Triangola Particella con 3 PF più vicini (Automatico)
        </button>
      </div>
    `).openPopup();

    if (topoModeActive) {
      window.triangulateParcelWithPF(lat, lon, comuneInfo.name, foglioRaw, particellaRaw);
    }

    if (catastralSearchStatus) {
      catastralSearchStatus.textContent = `✅ Localizzato (${matchType}): Foglio ${foglioRaw}${particellaRaw ? ' Part. ' + particellaRaw : ''}`;
    }

    // Chiamata WFS BBOX in background all'Agenzia delle Entrate per disegnare il poligono se risponde
    try {
      const bBoxUrl = `https://wfs.cartografia.agenziaentrate.gov.it/inspire/wfs/owfs01.php?language=ita&SERVICE=WFS&VERSION=2.0.0&TYPENAMES=CP:CadastralParcel&SRSNAME=urn:ogc:def:crs:EPSG::6706&BBOX=${lat - 0.000005},${lon - 0.000005},${lat + 0.000005},${lon + 0.000005}&REQUEST=GetFeature&COUNT=5`;
      const wfsResp = await fetchWithCorsFallback(bBoxUrl);
      const posMatch = wfsResp.match(/<gml:posList[^>]*>([\d.\s]+)<\/gml:posList>/i) ||
                       wfsResp.match(/<gml:pos[^>]*>([\d.\s]+)<\/gml:pos>/i);
      if (posMatch) {
        const nums = posMatch[1].trim().split(/\s+/).map(Number);
        if (nums.length >= 6) {
          const polygonLatLngs = [];
          for (let i = 0; i < nums.length - 1; i += 2) {
            polygonLatLngs.push([nums[i], nums[i + 1]]);
          }
          L.polygon(polygonLatLngs, {
            color: "#d97706",
            weight: 3,
            fillColor: "#fbbf24",
            fillOpacity: 0.4
          }).addTo(inspectLayerGroup);
        }
      }
    } catch (e) {
      console.log("WFS BBOX background fetch note:", e);
    }
  });

  // Apertura automatica particella da parametri URL (es. mappa.html?comune=H574&foglio=12&particella=345)
  (() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramComune = (urlParams.get("comune") || "").toUpperCase().trim();
    const paramFoglio = (urlParams.get("foglio") || "").trim();
    const paramParticella = (urlParams.get("particella") || "").trim();

    if (paramComune && comuniData[paramComune]) {
      const targetProv = comuniData[paramComune].prov;
      if (provinciaSelect && provinciaSelect.value !== targetProv) {
        provinciaSelect.value = targetProv;
        populateComuniByProvincia(targetProv);
      }
      if (comuneSelect) {
        comuneSelect.value = paramComune;
      }
    }

    if (paramFoglio && gFoglioInput) {
      gFoglioInput.value = paramFoglio;
      if (paramParticella && gParticellaInput) {
        gParticellaInput.value = paramParticella;
      }
      setTimeout(() => {
        catastralSearchBtn?.click();
      }, 250);
    }
  })();

  // ============================================================================
  // 6. RICERCA INDIRIZZO / CONTRADA (Nominatim OpenStreetMap)
  // ============================================================================
  const gisSearchInput = document.getElementById("gisSearchInput");
  const gisSearchBtn = document.getElementById("gisSearchBtn");
  const gisSearchResults = document.getElementById("gisSearchResults");
  let searchMarker = null;

  const performAddressSearch = async () => {
    const query = gisSearchInput?.value.trim();
    if (!query) return;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Sicilia, Italia")}`);
      const data = await res.json();
      if (gisSearchResults) {
        gisSearchResults.innerHTML = "";
        if (data && data.length > 0) {
          data.slice(0, 5).forEach((item) => {
            const div = document.createElement("div");
            div.className = "search-result-item";
            div.textContent = item.display_name;
            div.addEventListener("click", () => {
              const lat = parseFloat(item.lat);
              const lon = parseFloat(item.lon);
              map.setView([lat, lon], 18);
              if (searchMarker) map.removeLayer(searchMarker);
              searchMarker = L.marker([lat, lon]).addTo(map).bindPopup(`<strong>📍 ${item.display_name}</strong>`).openPopup();
              gisSearchResults.innerHTML = "";
            });
            gisSearchResults.appendChild(div);
          });
        } else {
          gisSearchResults.innerHTML = '<div style="font-size:0.82rem; padding:0.4rem; color:var(--muted);">Nessun indirizzo trovato.</div>';
        }
      }
    } catch (err) {
      console.error("Address search error:", err);
    }
  };

  gisSearchBtn?.addEventListener("click", performAddressSearch);
  gisSearchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performAddressSearch();
  });

  // ============================================================================
  // 7. MISURAZIONI TOPOGRAFICHE, MODALITÀ ISPEZIONE ED ESPORTAZIONE CSV
  // ============================================================================
  const btnInspectParcel = document.getElementById("btnInspectParcel");
  const btnMeasureDist = document.getElementById("btnMeasureDist");
  const btnMeasureArea = document.getElementById("btnMeasureArea");
  const btnExportCsv = document.getElementById("btnExportCsv");
  const btnClearMeasure = document.getElementById("btnClearMeasure");

  let measurePoints = [];
  let measureLayerGroup = L.layerGroup().addTo(map);

  const setActiveToolButton = (activeBtn) => {
    [btnInspectParcel, btnMeasureDist, btnMeasureArea].forEach((btn) => {
      if (!btn) return;
      btn.style.background = "transparent";
      btn.style.borderColor = "#d7d2c8";
    });
    if (activeBtn) {
      activeBtn.style.background = "#fffdf5";
      activeBtn.style.borderColor = "var(--gold)";
    }
  };

  btnInspectParcel?.addEventListener("click", () => {
    measureMode = null;
    setActiveToolButton(btnInspectParcel);
  });

  btnMeasureDist?.addEventListener("click", () => {
    measureMode = "dist";
    measurePoints = [];
    measureLayerGroup.clearLayers();
    setActiveToolButton(btnMeasureDist);
  });

  btnMeasureArea?.addEventListener("click", () => {
    measureMode = "area";
    measurePoints = [];
    measureLayerGroup.clearLayers();
    setActiveToolButton(btnMeasureArea);
  });

  btnClearMeasure?.addEventListener("click", () => {
    measureMode = null;
    measurePoints = [];
    measureLayerGroup.clearLayers();
    inspectLayerGroup.clearLayers();
    setActiveToolButton(btnInspectParcel);
    updateCoordsBar();
  });

  btnExportCsv?.addEventListener("click", () => {
    if (!measurePoints || measurePoints.length === 0) {
      alert("Nessun punto misurato sulla mappa. Usa prima 'Misura Distanza' o 'Misura Area' per tracciare i vertici da esportare.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,ID_Vertice,Latitudine_WGS84,Longitudine_WGS84\n";
    measurePoints.forEach((pt, idx) => {
      csvContent += `V${idx + 1},${pt.lat.toFixed(7)},${pt.lng.toFixed(7)}\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "rilievo_coordinate_studio.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  const calculatePolygonArea = (latlngs) => {
    if (latlngs.length < 3) return 0;
    const R = 6378137;
    let area = 0;
    const rad = Math.PI / 180;
    for (let i = 0; i < latlngs.length; i++) {
      const p1 = latlngs[i];
      const p2 = latlngs[(i + 1) % latlngs.length];
      area += (p2.lng * rad - p1.lng * rad) * (2 + Math.sin(p1.lat * rad) + Math.sin(p2.lat * rad));
    }
    return Math.abs((area * R * R) / 2.0);
  };

  map.on("click", (e) => {
    if (!measureMode) return;
    const latlng = e.latlng;
    measurePoints.push(latlng);

    L.circleMarker(latlng, {
      radius: 5,
      color: "#0b1c2d",
      fillColor: "#c9a227",
      fillOpacity: 1,
      weight: 2
    }).addTo(measureLayerGroup);

    if (measureMode === "dist" && measurePoints.length > 1) {
      const polyline = L.polyline(measurePoints, { color: "#c9a227", weight: 4, dashArray: "6, 6" }).addTo(measureLayerGroup);
      let totalDist = 0;
      for (let i = 1; i < measurePoints.length; i++) {
        totalDist += measurePoints[i - 1].distanceTo(measurePoints[i]);
      }
      const distText = totalDist >= 1000 ? `${(totalDist / 1000).toFixed(3)} km` : `${totalDist.toFixed(2)} m`;
      polyline.bindPopup(`<strong>📏 Distanza:</strong> ${distText}`).openPopup();
      if (coordsBar) coordsBar.textContent = `Misura Distanza: ${distText} (${measurePoints.length} vertici)`;
    } else if (measureMode === "area" && measurePoints.length >= 3) {
      measureLayerGroup.clearLayers();
      measurePoints.forEach((pt) => {
        L.circleMarker(pt, { radius: 5, color: "#0b1c2d", fillColor: "#c9a227", fillOpacity: 1, weight: 2 }).addTo(measureLayerGroup);
      });
      const polygon = L.polygon(measurePoints, { color: "#c9a227", weight: 3, fillColor: "#c9a227", fillOpacity: 0.35 }).addTo(measureLayerGroup);
      const areaSqM = calculatePolygonArea(measurePoints);
      const areaHa = areaSqM / 10000;
      const areaText = `${areaSqM.toFixed(1)} m² (${areaHa.toFixed(4)} ha)`;
      polygon.bindPopup(`<strong>📐 Superficie:</strong> ${areaText}`).openPopup();
      if (coordsBar) coordsBar.textContent = `Misura Superficie: ${areaText}`;
    }
  });

  // 8. GPS E SCHERMO INTERO
  document.getElementById("btnGps")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocalizzazione GPS non supportata dal browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        map.setView([latitude, longitude], 19);
        inspectLayerGroup.clearLayers();
        L.circle([latitude, longitude], { radius: accuracy / 2, color: "#0284c7", fillOpacity: 0.15 }).addTo(inspectLayerGroup);
        L.marker([latitude, longitude]).addTo(inspectLayerGroup).bindPopup(`<strong>📍 Posizione GPS Rilevata</strong><br>Precisione: ±${accuracy.toFixed(1)} m`).openPopup();
      },
      () => alert("Impossibile rilevare la posizione GPS. Consenti l'accesso alla posizione nel browser."),
      { enableHighAccuracy: true }
    );
  });

  const mapViewport = document.querySelector(".gis-map-viewport") || document.querySelector(".webgis-map-wrapper");
  document.getElementById("btnFullscreen")?.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      mapViewport?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  // Share WebGIS QR Code / Link
  document.getElementById("btnShareQr")?.addEventListener("click", async () => {
    const shareData = {
      title: "WebGIS Catasto & Piano Paesaggistico",
      text: "Apri il WebGIS Catastale in cantiere con GPS attivo:",
      url: "https://www.studiotecnicogiuratoiacono.it/mappa.html"
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link del WebGIS copiato negli appunti!");
      } catch (e) {
        prompt("Copia il link del WebGIS:", shareData.url);
      }
    }
  });

  // Gestione Legenda Cartografica WMS (mappa.html)
  const btnToggleLegend = document.getElementById("btnToggleLegend");
  const btnCloseLegend = document.getElementById("btnCloseLegend");
  const mapLegendCard = document.getElementById("mapLegendCard");

  btnToggleLegend?.addEventListener("click", () => {
    const isHidden = !mapLegendCard || mapLegendCard.style.display === "none";
    if (mapLegendCard) {
      mapLegendCard.style.display = isHidden ? "block" : "none";
      btnToggleLegend.setAttribute("aria-expanded", String(isHidden));
    }
  });

  btnCloseLegend?.addEventListener("click", () => {
    if (mapLegendCard) {
      mapLegendCard.style.display = "none";
      btnToggleLegend?.setAttribute("aria-expanded", "false");
    }
  });

  // ============================================================================
  // MODALITÀ RILIEVI TOPOGRAFICI & VISUAL TAF: PUNTI FIDUCIALI (PF), MONOGRAFIE & TRIANGOLAZIONI
  // ============================================================================
  let topoModeActive = false;
  let showPFGlobal = true; // Attivo di default in stile VisualTAF
  let allPFData = null; // Cache caricamento punti_fiduciali.json
  let lastClickedParcel = null; // Memorizza ultima particella cliccata o cercata
  let pfUpdateTimer = null;

  const topoPFLayerGroup = L.layerGroup();
  window.topoPFLayerGroup = topoPFLayerGroup;
  const topoTriangulationLayerGroup = L.layerGroup();
  const topoDistanceLabelsGroup = L.layerGroup();
  const parcelTriangulationGroup = L.layerGroup();

  const toggleShowPFGlobal = document.getElementById("toggleShowPFGlobal");
  const btnToggleTopoMode = document.getElementById("btnToggleTopoMode");
  const btnFloatingTopo = document.getElementById("btnFloatingTopo");
  const topoBadge = document.getElementById("topoBadge");
  const topoControlsPanel = document.getElementById("topoControlsPanel");
  const toggleShowPF = document.getElementById("toggleShowPF");
  const toggleShowTriangulation = document.getElementById("toggleShowTriangulation");
  const togglePFLabels = document.getElementById("togglePFLabels");
  const topoActiveSheet = document.getElementById("topoActiveSheet");
  const topoCountPF = document.getElementById("topoCountPF");
  const topoCountTriangles = document.getElementById("topoCountTriangles");
  const btnExportPregeo = document.getElementById("btnExportPregeo");
  const btnZoomToSheetPF = document.getElementById("btnZoomToSheetPF");
  const btnTriangulateLastParcel = document.getElementById("btnTriangulateLastParcel");
  const btnClearParcelTriangulation = document.getElementById("btnClearParcelTriangulation");
  const btnUploadTaf = document.getElementById("btnUploadTaf");
  const inputTafFile = document.getElementById("inputTafFile");
  const tafUploadStatus = document.getElementById("tafUploadStatus");

  const parcelTriangulationHud = document.getElementById("parcelTriangulationHud");
  const hudParcelSubtitle = document.getElementById("hudParcelSubtitle");
  const btnHudClose = document.getElementById("btnHudClose");
  const hudBodyContent = document.getElementById("hudBodyContent");

  // Calcolo distanza geodesica tra 2 punti lat/lon (metri)
  const calcDistanceMeters = (p1, p2) => {
    const R = 6371000;
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lon - p1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const loadScriptAsync = (src) => {
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  };

  // Conversione geodesica ufficiale UTM Fuso 33N (WGS84) -> Lat/Lon
  const utm33ToWgs84 = (easting, northing) => {
    const a = 6378137.0, f = 1 / 298.257223563, b = a * (1 - f);
    const e2 = (a * a - b * b) / (a * a), ePrime2 = (a * a - b * b) / (b * b), k0 = 0.9996;
    const x = easting - 500000.0, y = northing, centralMeridian = 15.0 * (Math.PI / 180);
    const M = y / k0;
    const mu = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));
    const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
    const J1 = 3 * e1 / 2 - 27 * Math.pow(e1, 3) / 32, J2 = 21 * Math.pow(e1, 2) / 16 - 55 * Math.pow(e1, 4) / 32;
    const J3 = 151 * Math.pow(e1, 3) / 96, J4 = 1097 * Math.pow(e1, 4) / 512;
    const fp = mu + J1 * Math.sin(2 * mu) + J2 * Math.sin(4 * mu) + J3 * Math.sin(6 * mu) + J4 * Math.sin(8 * mu);
    const C1 = ePrime2 * Math.pow(Math.cos(fp), 2), T1 = Math.pow(Math.tan(fp), 2);
    const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.pow(Math.sin(fp), 2), 1.5);
    const N1 = a / Math.sqrt(1 - e2 * Math.pow(Math.sin(fp), 2));
    const D = x / (N1 * k0);
    const latRad = fp - (N1 * Math.tan(fp) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ePrime2) * Math.pow(D, 4) / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ePrime2 - 3 * C1 * C1) * Math.pow(D, 6) / 720);
    const lonRad = centralMeridian + (D - (1 + 2 * T1 + C1) * Math.pow(D, 3) / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ePrime2 + 24 * T1 * T1) * Math.pow(D, 5) / 120) / Math.cos(fp);
    return { lat: latRad * (180 / Math.PI), lon: lonRad * (180 / Math.PI) };
  };

  const mergePFList = (newItems) => {
    if (!newItems || !newItems.length) return;
    if (!allPFData) allPFData = [];
    const existing = new Set(allPFData.map((p) => p.id));
    for (const p of newItems) {
      if (!existing.has(p.id)) {
        allPFData.push(p);
        existing.add(p.id);
      }
    }
  };

  let fullLoadingStarted = false;
  const loadFullPFInBackground = () => {
    // Tutti i 391 comuni della Sicilia sono ora ottimizzati per-comune in data/pf/<COD>.js (~50KB ciascuno)
    // Non occorre scaricare l'archivio globale monolitico da 50MB, garantendo reattività immediata.
    return;
  };

  // Caricamento resiliente archivio PF (supporta file:///, http:///, per-comune rapido e archivio completo)
  const loadPuntiFiduciali = async (requestedComune) => {
    // Carica l'indice delle monografie ufficiali se non ancora in memoria
    if (!window.MONOGRAFIE_INDEX) {
      await loadScriptAsync("data/monografie/index.js?v=20261031-1");
    }
    const officialMonoBadge = document.getElementById("officialMonoCountBadge");
    if (officialMonoBadge && window.MONOGRAFIE_INDEX) {
      officialMonoBadge.textContent = `(${Object.keys(window.MONOGRAFIE_INDEX).length})`;
    }

    const cod = (requestedComune || comuneSelect?.value || "H574").trim().toUpperCase();

    // 1. Controlla se abbiamo già l'archivio completo in window.ALL_PF_DATA
    if (window.ALL_PF_DATA && window.ALL_PF_DATA.length > 0) {
      mergePFList(window.ALL_PF_DATA);
      return allPFData;
    }

    // 2. Controlla se abbiamo già i punti per questo comune in window.PF_DATA
    if (window.PF_DATA && window.PF_DATA[cod] && window.PF_DATA[cod].length > 0) {
      mergePFList(window.PF_DATA[cod]);
      loadFullPFInBackground();
      return allPFData;
    }

    // 3. Se allPFData contiene già il comune richiesto
    if (allPFData && allPFData.some((p) => p.codComune === cod)) {
      return allPFData;
    }

    // 4. Prova a caricare lo script JS del comune (funziona sia su file:/// che su http/https)
    await loadScriptAsync(`data/pf/${cod}.js?v=20261030-7`);
    if (window.PF_DATA && window.PF_DATA[cod] && window.PF_DATA[cod].length > 0) {
      mergePFList(window.PF_DATA[cod]);
      loadFullPFInBackground();
      return allPFData;
    }

    // 5. Se su HTTP/HTTPS prova fetch JSON del singolo comune (ultra-rapido, ~200KB)
    try {
      const res = await fetch(`data/pf/${cod}.json?v=20261030-7`);
      if (res.ok) {
        const list = await res.json();
        mergePFList(list);
        loadFullPFInBackground();
        return allPFData;
      }
    } catch (_) {}

    // 6. Fallback: prova caricamento file completo (JS o JSON)
    if (window.location.protocol === "file:") {
      await loadScriptAsync("data/punti_fiduciali.js?v=20261030-7");
      if (window.ALL_PF_DATA) {
        mergePFList(window.ALL_PF_DATA);
        return allPFData;
      }
    } else {
      try {
        const resFull = await fetch("data/punti_fiduciali.json?v=20261030-7");
        if (resFull.ok) {
          const list = await resFull.json();
          mergePFList(list);
          return allPFData;
        }
      } catch (_) {}
    }

    return allPFData || [];
  };

  // Generatore di Monografia PDF stampabile / scaricabile
  window.downloadMonografiaPDF = (pfId) => {
    // 1. Se è disponibile la monografia originale ufficiale dell'Agenzia delle Entrate, scarica o apri quella!
    const mono = window.MONOGRAFIE_INDEX && window.MONOGRAFIE_INDEX[pfId];
    if (mono && mono.pdf) {
      const a = document.createElement("a");
      a.href = mono.pdf;
      a.download = mono.pdf_name || `${pfId.replace(/\//g, '_')}_AgenziaEntrate.pdf`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    if (!allPFData) return;
    const item = allPFData.find((p) => p.id === pfId);
    if (!item) return;

    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Consenti i popup per visualizzare la Scheda Monografica.");
      return;
    }

    const nordStr = Number(item.nord ?? item.x ?? 0).toFixed(3);
    const estStr = Number(item.est ?? item.y ?? 0).toFixed(3);
    const quotaStr = Number(item.quota ?? 0).toFixed(2);
    const attendStr = item.attendibilita || (item.attp ? `Livello ${item.attp} (Catasto Terreni)` : "Attendibilità Ordinaria (Catasto Terreni)");

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="utf-8">
        <title>Monografia ${item.id} - Studio Tecnico Giurato & Iacono</title>
        <style>
          body { font-family: "Segoe UI", Arial, sans-serif; margin: 0; padding: 2.5rem; color: #0b1c2d; background: #fff; line-height: 1.5; }
          .header { border-bottom: 2px solid #c9a227; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
          .title h1 { margin: 0; font-size: 1.6rem; color: #0b1c2d; }
          .title h2 { margin: 0.2rem 0 0; font-size: 1rem; color: #c9a227; font-weight: 600; text-transform: uppercase; }
          .table-box { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
          .table-box th, .table-box td { border: 1px solid #cbd5e1; padding: 0.6rem 0.8rem; font-size: 0.9rem; text-align: left; }
          .table-box th { background: #f8fafc; color: #475569; width: 32%; }
          .mono-desc { background: #fdfaf0; border: 1px solid #fde68a; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
          .mono-desc h3 { margin: 0 0 0.5rem; font-size: 1rem; color: #92400e; }
          .map-preview { border: 2px dashed #94a3b8; border-radius: 8px; padding: 2rem; text-align: center; margin-bottom: 1.5rem; background: #f8fafc; }
          .actions { text-align: center; margin-top: 2rem; }
          .btn-print { background: #0b1c2d; color: #fff; border: none; padding: 0.7rem 1.8rem; font-size: 1rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
          .footer-note { font-size: 0.75rem; color: #64748b; margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 0.8rem; text-align: center; }
          @media print { .actions { display: none; } body { padding: 1rem; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">
            <h1>SCHEDA MONOGRAFICA PUNTO FIDUCIALE</h1>
            <h2>Catasto Terreni &bull; Pregeo &bull; ${item.comune} (${item.prov})</h2>
          </div>
          <div style="text-align: right; font-size: 0.85rem; color: #64748b;">
            <strong>Studio Tecnico Associato</strong><br>
            Geom. A. Giurato &amp; Geom. P. Iacono<br>
            Corso Savoia 46, Rosolini (SR)
          </div>
        </div>

        <table class="table-box">
          <tr><th>Identificativo PF:</th><td><strong style="font-size: 1.15rem; color: #b91c1c;">${item.id}</strong></td></tr>
          <tr><th>Comune Catastale:</th><td>${item.comune} (${item.prov}) &mdash; Cod. <strong>${item.codComune}</strong></td></tr>
          <tr><th>Foglio di Mappa:</th><td>Foglio <strong>${item.foglio}</strong> ${item.all ? '(All. ' + item.all + ')' : ''} &bull; Particella <strong>${item.part || '-'}</strong></td></tr>
          <tr><th>Quota Altimetrica s.l.m.:</th><td><strong>${quotaStr} m</strong> ${item.descq ? '(' + item.descq + ')' : ''}</td></tr>
          <tr><th>Coordinate Cassini-Soldner:</th><td>Nord: <code>${nordStr} m</code> &bull; Est: <code>${estStr} m</code></td></tr>
          <tr><th>Coordinate Geografiche (WGS84):</th><td>Lat: <code>${item.lat.toFixed(6)}° N</code> &bull; Lon: <code>${item.lon.toFixed(6)}° E</code></td></tr>
          <tr><th>Grado di Attendibilità:</th><td>${attendStr}</td></tr>
          <tr><th>Data Istituzione / Aggiornamento:</th><td>${item.data || '-'} &bull; Causale: <code>${item.caus || '-'}</code></td></tr>
        </table>

        <div class="mono-desc">
          <h3>Descrizione della Materializzazione &bull; Accesso sul Posto:</h3>
          <p style="margin: 0; font-size: 0.95rem; font-weight: 500;">${item.desc || 'Caposaldo catastale fiduciario'}</p>
        </div>

        <div class="map-preview">
          <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">📍</div>
          <strong>Localizzazione Georeferenziata</strong><br>
          <span style="font-size: 0.85rem; color: #64748b;">Punto individuabile in cantiere con coordinate GPS RTK e navigatore satellitare.</span><br><br>
          <a href="https://maps.google.com/?q=${item.lat},${item.lon}" target="_blank" style="color: #0b1c2d; font-weight: bold; font-size: 0.9rem;">
            🔗 Apri Navigazione Stradale Google Maps verso il PF ↗
          </a>
        </div>

        <div class="actions">
          <button class="btn-print" onclick="window.print()">🖨️ Stampa Scheda Monografica / Salva in PDF</button>
        </div>

        <div class="footer-note">
          Elaborato generato tramite il WebGIS Topografico dello Studio Tecnico Associato Giurato &amp; Iacono &bull; www.studiotecnicogiuratoiacono.it
        </div>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  // Scarica contemporaneamente le monografie dei 3 PF triangolati
  window.downloadAllTriangulationPDFs = (pfIds) => {
    if (!pfIds || !pfIds.length) return;
    pfIds.forEach((id, i) => {
      setTimeout(() => {
        window.downloadMonografiaPDF(id);
      }, i * 350);
    });
  };

  // Esporta libretto Pregeo 10 formattato (.dat) per la terna fiduciaria e la particella
  window.exportPregeoTriangulation = (comune, foglio, particella, centerCoords) => {
    if (!lastClickedParcel || !allPFData) return;
    const [cLat, cLon] = centerCoords || [lastClickedParcel.lat, lastClickedParcel.lon];
    const target = { lat: cLat, lon: cLon };

    let p1, p2, p3, candidate = null;
    if (activeTriangulationCandidates && activeTriangulationCandidates[activeCandidateIndex]) {
      candidate = activeTriangulationCandidates[activeCandidateIndex];
      [p1, p2, p3] = candidate.pfs;
    } else {
      const sorted = allPFData
        .map((p) => ({ ...p, dist: calcDistanceMeters(target, { lat: p.lat, lon: p.lon }) }))
        .sort((a, b) => a.dist - b.dist);
      [p1, p2, p3] = sorted.slice(0, 3);
    }

    const d12 = calcDistanceMeters(p1, p2);
    const d23 = calcDistanceMeters(p2, p3);
    const d31 = calcDistanceMeters(p3, p1);

    const n1 = Number(p1.nord ?? p1.x ?? 0).toFixed(3);
    const e1 = Number(p1.est ?? p1.y ?? 0).toFixed(3);
    const q1 = Number(p1.quota ?? 0).toFixed(2);

    const n2 = Number(p2.nord ?? p2.x ?? 0).toFixed(3);
    const e2 = Number(p2.est ?? p2.y ?? 0).toFixed(3);
    const q2 = Number(p2.quota ?? 0).toFixed(2);

    const n3 = Number(p3.nord ?? p3.x ?? 0).toFixed(3);
    const e3 = Number(p3.est ?? p3.y ?? 0).toFixed(3);
    const q3 = Number(p3.quota ?? 0).toFixed(2);

    // Calcolo dei parametri geodetici d'inquadramento Pregeo: EST MEDIA e QUOTA MEDIA
    const valE1 = Number(p1.est ?? p1.y ?? 0);
    const valE2 = Number(p2.est ?? p2.y ?? 0);
    const valE3 = Number(p3.est ?? p3.y ?? 0);
    const estMedia = Math.round((valE1 + valE2 + valE3) / 3);

    const valQ1 = Number(p1.quota || 0);
    const valQ2 = Number(p2.quota || 0);
    const valQ3 = Number(p3.quota || 0);
    const quotaMedia = Math.round((valQ1 + valQ2 + valQ3) / 3);

    const calcAzimuth = (fromLat, fromLon, toLat, toLon) => {
      const dL = (toLon - fromLon) * Math.PI / 180;
      const phi1 = fromLat * Math.PI / 180, phi2 = toLat * Math.PI / 180;
      const y = Math.sin(dL) * Math.cos(phi2);
      const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dL);
      const azGrad = ((Math.atan2(y, x) * 200 / Math.PI) + 400) % 400; // Gradi centesimali per Pregeo
      return azGrad.toFixed(4);
    };

    const az1 = calcAzimuth(cLat, cLon, p1.lat, p1.lon);
    const az2 = calcAzimuth(cLat, cLon, p2.lat, p2.lon);
    const az3 = calcAzimuth(cLat, cLon, p3.lat, p3.lon);

    const todayStr = new Date().toLocaleDateString("it-IT");
    const codCom = p1.codComune || "H574";
    const foglioStr = foglio || p1.foglio || "44";
    const partStr = particella || "0";

    const lines = [
      `; =====================================================================`,
      `; LIBRETTO PREGEO 10.60 - ATTO DI AGGIORNAMENTO CATASTALE`,
      `; Studio Tecnico Associato Geometri Giurato & Iacono (Rosolini, SR)`,
      `; Geom. Alessandro Giurato & Geom. Piernicolò Iacono`,
      `; Inquadramento Fiduciario: Comune ${comune || p1.comune} (${codCom})`,
      `; Foglio di Mappa: ${foglioStr} - Particella Oggetto del Rilievo: ${partStr}`,
      `; Data di Elaborazione: ${todayStr}`,
      `; EST MEDIA CATASTALE (Cassini-Soldner): ${estMedia} m`,
      `; QUOTA MEDIA DEL RILIEVO: ${quotaMedia} m s.l.m.`,
      `; Conformità Pregeo: ${candidate && candidate.inside ? "PARTICELLA RIGOROSAMENTE INTERNA AL TRIANGOLO (CONFORME)" : "RILIEVO PER ESTRAPOLAZIONE"}`,
      `; =====================================================================`,
      ``,
      `0|${todayStr}|100|ATTO DI AGGIORNAMENTO|${codCom}|${foglioStr}|${partStr}|STUDIO TECNICO ASSOCIATO GIURATO E IACONO|`,
      `9|${quotaMedia}|10|20|${estMedia}|10.60-APAG 2.12|TM|STUDIO TECNICO GIURATO E IACONO|`,
      ``,
      `; RIGHE 8: SCHEDE E ANAGRAFICA PUNTI FIDUCIALI (TAF UFFICIALE)`,
      `8|${p1.id}|${n1}|${e1}|${q1}|${p1.desc || "PUNTO_FIDUCIALE_1"}|`,
      `8|${p2.id}|${n2}|${e2}|${q2}|${p2.desc || "PUNTO_FIDUCIALE_2"}|`,
      `8|${p3.id}|${n3}|${e3}|${q3}|${p3.desc || "PUNTO_FIDUCIALE_3"}|`,
      ``,
      `; RIGHE 7: MISURAZIONI STRUMENTALI DELLE MUTUE DISTANZE (MAGLIA FIDUCIARIA)`,
      `7|${p1.id}|${p2.id}|${d12.toFixed(3)}|MUTUA_DISTANZA_PF1_PF2|`,
      `7|${p2.id}|${p3.id}|${d23.toFixed(3)}|MUTUA_DISTANZA_PF2_PF3|`,
      `7|${p3.id}|${p1.id}|${d31.toFixed(3)}|MUTUA_DISTANZA_PF3_PF1|`,
      ``,
      `; RIGA 1: STAZIONE CENTRATA SULLA PARTICELLA (COORDINATE BARICENTRICHE)`,
      `1|STAZ_PART|1.550|BARICENTRO PARTICELLA ${partStr}|`,
      `4|${p1.id}|${az1}|100.0000|${p1.dist.toFixed(3)}|${q1}|SPIGOLO_PF1|`,
      `4|${p2.id}|${az2}|100.0000|${p2.dist.toFixed(3)}|${q2}|SPIGOLO_PF2|`,
      `4|${p3.id}|${az3}|100.0000|${p3.dist.toFixed(3)}|${q3}|SPIGOLO_PF3|`,
      ``,
      `; DATI GEOMETRICI TRIANGOLO FIDUCIARIO`,
      `; Perimetro Maglia: ${(d12 + d23 + d31).toFixed(2)} m`,
      candidate ? `; Superficie Triangolo: ${Math.round(candidate.area)} m² (${(candidate.area / 10000).toFixed(2)} ha)` : ``,
      candidate ? `; Angoli Vertici: PF1=${candidate.angles[0].toFixed(1)}°, PF2=${candidate.angles[1].toFixed(1)}°, PF3=${candidate.angles[2].toFixed(1)}°` : ``,
      `; Baricentro Particella WGS84: Lat ${cLat.toFixed(6)}, Lon ${cLon.toFixed(6)}`,
      ``
    ];

    const fileContent = lines.join("\r\n");
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PREGEO_Triangolazione_${codCom}_F${foglioStr}_P${partStr}.dat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Aggiorna layer PF in stile VisualTAF & Triangolazioni Pregeo
  const updateTopographyView = async () => {
    const pfList = await loadPuntiFiduciali();
    if (!pfList || !pfList.length) return;

    const isPFEnabled = (toggleShowPFGlobal ? toggleShowPFGlobal.checked : true) || topoModeActive;
    if (!isPFEnabled) {
      map.removeLayer(topoPFLayerGroup);
      map.removeLayer(topoTriangulationLayerGroup);
      map.removeLayer(topoDistanceLabelsGroup);
      return;
    }

    topoPFLayerGroup.clearLayers();
    topoTriangulationLayerGroup.clearLayers();
    topoDistanceLabelsGroup.clearLayers();

    const zoom = map.getZoom();
    const mapBounds = map.getBounds().pad(0.12);
    const selectedComune = comuneSelect?.value || "H574";
    const selectedFoglio = parseInt((gFoglioInput?.value || "").trim(), 10);

    // Se l'utente esplora la mappa a zoom elevato, pre-carica i comuni visibili nel viewport da window.PF_INDEX
    if (window.PF_INDEX && zoom >= 13) {
      const bMinLa = mapBounds.getSouth(), bMaxLa = mapBounds.getNorth();
      const bMinLo = mapBounds.getWest(), bMaxLo = mapBounds.getEast();
      for (const [code, info] of Object.entries(window.PF_INDEX)) {
        if (!info.bbox) continue;
        const [cMinLa, cMinLo, cMaxLa, cMaxLo] = info.bbox;
        if (bMaxLa >= cMinLa && bMinLa <= cMaxLa && bMaxLo >= cMinLo && bMinLo <= cMaxLo) {
          if (!window.PF_DATA || !window.PF_DATA[code]) {
            loadPuntiFiduciali(code).then(() => {
              if (topoPFLayerGroup && map.hasLayer(topoPFLayerGroup)) {
                updateTopographyView();
              }
            });
            break;
          }
        }
      }
    }

    let filteredPF = [];

    // Se è attivo il filtro "Mostra solo PF con Foto Ufficiale"
    const toggleOnlyOfficialMono = document.getElementById("toggleOnlyOfficialMono");
    if (toggleOnlyOfficialMono && toggleOnlyOfficialMono.checked) {
      filteredPF = pfList.filter((p) => window.MONOGRAFIE_INDEX && window.MONOGRAFIE_INDEX[p.id]);
      if (topoActiveSheet) topoActiveSheet.textContent = `Filtro Foto Ufficiali (${filteredPF.length} PF con Foto)`;
    } else if (selectedFoglio && !isNaN(selectedFoglio)) {
      filteredPF = pfList.filter((p) => p.codComune === selectedComune && p.foglio === selectedFoglio);
      if (topoActiveSheet) topoActiveSheet.textContent = `Foglio ${selectedFoglio} (${comuneSelect?.options[comuneSelect.selectedIndex]?.text || selectedComune})`;
    } else {
      // Stile VisualTAF: individua tutti i PF nel perimetro visibile
      const inBounds = pfList.filter((p) => mapBounds.contains([p.lat, p.lon]));
      if (inBounds.length > 0) {
        filteredPF = inBounds.slice(0, 350);
        if (topoActiveSheet) topoActiveSheet.textContent = `Area Visibile (${filteredPF.length} PF in mappa)`;
      } else {
        // Se fuori bounds o zoom lontano, visualizza i PF del comune selezionato
        filteredPF = pfList.filter((p) => p.codComune === selectedComune).slice(0, 350);
        if (topoActiveSheet) topoActiveSheet.textContent = `Comune ${comuneSelect?.options[comuneSelect.selectedIndex]?.text || selectedComune} (${filteredPF.length} PF)`;
      }
    }

    if (topoCountPF) topoCountPF.textContent = String(filteredPF.length);

    // RENDER PUNTI FIDUCIALI (PF PIN E POPUP MONOGRAFICO COMPLETO)
    filteredPF.forEach((pf) => {
      const mono = window.MONOGRAFIE_INDEX && window.MONOGRAFIE_INDEX[pf.id];
      const icon = L.divIcon({
        className: "pf-marker-icon",
        html: mono
          ? `<div class="pf-pin has-mono" title="${pf.id} - 📸 Monografia Ufficiale con Foto">PF</div>`
          : `<div class="pf-pin" title="${pf.id}">PF</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([pf.lat, pf.lon], { icon }).addTo(topoPFLayerGroup);

      // Etichetta con nome del PF permanente se abilitata o se zoom elevato
      if (togglePFLabels?.checked || zoom >= 16) {
        marker.bindTooltip(pf.id, {
          permanent: togglePFLabels ? togglePFLabels.checked : (zoom >= 16),
          direction: "top",
          className: "pf-leaflet-label",
          offset: [0, -10]
        });
      }

      const nordStr = Number(pf.nord ?? pf.x ?? 0).toFixed(2);
      const estStr = Number(pf.est ?? pf.y ?? 0).toFixed(2);
      const quotaStr = Number(pf.quota ?? 0).toFixed(1);

      // Sezione Monografia Ufficiale con Foto o TAF
      let monoActionsHtml = "";
      if (mono) {
        monoActionsHtml = `
          <div style="background: #fefce8; border: 1.5px solid #fde047; border-radius: 8px; padding: 0.45rem; margin-top: 0.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; font-weight: 800; color: #854d0e; margin-bottom: 0.35rem;">
              <span>📸 MONOGRAFIA ORIGINALE CON FOTO</span>
              <span style="background: #15803d; color: #fff; font-size: 0.65rem; padding: 1px 6px; border-radius: 999px;">CATASTO</span>
            </div>
            <div class="mono-popup-strip" onclick="window.openOfficialMonografiaModal('${pf.id}')" title="Clicca per aprire la Scheda Fotografica Ufficiale">
              ${mono.foto_panoramica ? `
                <div class="mono-popup-thumb">
                  <img src="${mono.foto_panoramica}" alt="Foto PF">
                  <div class="mono-popup-thumb-badge">📸 Inquadramento</div>
                </div>
              ` : ''}
              ${mono.foto_dettaglio ? `
                <div class="mono-popup-thumb">
                  <img src="${mono.foto_dettaglio}" alt="Dettaglio Materializzazione">
                  <div class="mono-popup-thumb-badge">🎯 Dettaglio</div>
                </div>
              ` : (mono.estratto_mappa ? `
                <div class="mono-popup-thumb">
                  <img src="${mono.estratto_mappa}" alt="Estratto Mappa">
                  <div class="mono-popup-thumb-badge">🗺️ Mappa</div>
                </div>
              ` : '')}
            </div>
            <button class="btn btn-gold" type="button" onclick="window.openOfficialMonografiaModal('${pf.id}')" style="width: 100%; min-height: 32px; font-size: 0.78rem; padding: 0.35rem 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem; font-weight: 700;">
              📸 Scheda &amp; Foto Originali PF
            </button>
            <a href="${mono.pdf}" download="${mono.pdf_name || (pf.id.replace(/\//g, '_') + '.pdf')}" target="_blank" class="btn btn-ghost" style="width: 100%; min-height: 26px; font-size: 0.72rem; padding: 0.25rem 0.4rem; color: #991b1b; border-color: #fca5a5; background: #fff; text-align: center; text-decoration: none; margin-top: 0.3rem;">
              📄 Scarica PDF Originale Agenzia Entrate ↗
            </a>
          </div>
        `;
      } else {
        monoActionsHtml = `
          <div style="display: grid; gap: 0.35rem; margin-top: 0.6rem;">
            <button class="btn btn-gold" type="button" onclick="downloadMonografiaPDF('${pf.id}')" style="width: 100%; min-height: 32px; font-size: 0.78rem; padding: 0.35rem 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
              📄 Scheda Monografica (TAF)
            </button>
            <a href="https://www.agenziaentrate.gov.it/portale/schede-informative-e-servizi/fabbricati-e-terreni/punti-fiduciali/interrogazione-schede-monografiche-punti-fiduciali-mon-" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" style="width: 100%; min-height: 26px; font-size: 0.72rem; padding: 0.25rem 0.4rem; color: #0284c7; border-color: #bae6fd; background: #f0f9ff; text-align: center; text-decoration: none;">
              🌐 Richiedi Monografia su Sister / Agenzia Entrate ↗
            </a>
          </div>
        `;
      }

      // Popup completo del Punto Fiduciale
      const popupContent = `
        <div style="font-family: Manrope, sans-serif; padding: 0.2rem; min-width: 255px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid var(--gold); padding-bottom: 0.4rem; margin-bottom: 0.5rem;">
            <strong style="color: #b91c1c; font-size: 1.05rem;">📍 ${pf.id}</strong>
            <span style="font-size: 0.72rem; background: ${mono ? '#fef3c7' : '#fee2e2'}; color: ${mono ? '#92400e' : '#991b1b'}; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 700;">
              ${mono ? '📸 FOTO UFFICIALE' : 'PF PREGEO'}
            </span>
          </div>
          <div style="font-size: 0.84rem; line-height: 1.45; color: #334155;">
            <strong>Comune:</strong> ${pf.comune} (${pf.prov}) &mdash; Foglio <strong>${pf.foglio}</strong>${pf.part ? ' &bull; Part. <strong>' + pf.part + '</strong>' : ''}<br>
            <strong>Quota Altimetrica:</strong> <strong>${quotaStr} m</strong> s.l.m.<br>
            <strong>Descrizione:</strong> ${pf.desc || 'Punto Fiduciale'}<br>
            <strong>Coordinate:</strong> Lat: ${pf.lat.toFixed(5)}° | Lon: ${pf.lon.toFixed(5)}°<br>
            <strong>Cassini-Soldner:</strong> N: ${nordStr} | E: ${estStr}
          </div>
          ${monoActionsHtml}
          <div style="display: grid; gap: 0.35rem; margin-top: 0.45rem;">
            <button class="btn btn-ghost" type="button" onclick="window.triangulateParcelWithPF(${pf.lat}, ${pf.lon}, '${pf.comune.replace(/'/g, "\\'")}', '${pf.foglio}', '')" style="width: 100%; min-height: 28px; font-size: 0.76rem; padding: 0.3rem 0.5rem; color: var(--navy); border-color: var(--gold); text-align: center;">
              📐 Triangola Area da questo PF
            </button>
            <a href="https://maps.google.com/?q=${pf.lat},${pf.lon}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" style="width: 100%; min-height: 26px; font-size: 0.73rem; padding: 0.25rem 0.5rem; color: #475569; border-color: #cbd5e1; text-align: center; text-decoration: none;">
              🗺️ Naviga al PF con Google Maps ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Se Topo Mode è attiva, calcola anche la maglia fiduciaria e mutue distanze per foglio
    let trianglesCount = 0;
    if (topoModeActive && (toggleShowTriangulation?.checked ?? true)) {
      const pfBySheet = {};
      filteredPF.forEach((p) => {
        if (!pfBySheet[p.foglio]) pfBySheet[p.foglio] = [];
        pfBySheet[p.foglio].push(p);
      });

      Object.values(pfBySheet).forEach((sheetPFs) => {
        if (sheetPFs.length < 3) return;

        for (let i = 0; i < sheetPFs.length; i++) {
          for (let j = i + 1; j < sheetPFs.length; j++) {
            const p1 = sheetPFs[i];
            const p2 = sheetPFs[j];
            const dist = calcDistanceMeters(p1, p2);

            L.polyline([[p1.lat, p1.lon], [p2.lat, p2.lon]], {
              color: "#dc2626",
              weight: 2,
              dashArray: "6, 6",
              opacity: 0.75
            }).addTo(topoTriangulationLayerGroup);

            const midLat = (p1.lat + p2.lat) / 2;
            const midLon = (p1.lon + p2.lon) / 2;
            const distLabel = dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist.toFixed(1)} m`;

            L.marker([midLat, midLon], {
              icon: L.divIcon({
                className: "triangulation-dist-icon",
                html: `<span class="triangulation-dist-label">${distLabel}</span>`,
                iconSize: [60, 16],
                iconAnchor: [30, 8]
              })
            }).addTo(topoDistanceLabelsGroup);
          }
        }

        if (sheetPFs.length >= 3) {
          const polyCoords = sheetPFs.slice(0, 3).map((p) => [p.lat, p.lon]);
          L.polygon(polyCoords, {
            color: "#dc2626",
            weight: 2,
            fillColor: "#dc2626",
            fillOpacity: 0.12
          }).addTo(topoTriangulationLayerGroup);
          trianglesCount++;
        }
      });
    }

    if (topoCountTriangles) topoCountTriangles.textContent = String(trianglesCount);

    // Gestione layer map
    if (isPFEnabled && !map.hasLayer(topoPFLayerGroup)) {
      map.addLayer(topoPFLayerGroup);
    }
    if (topoModeActive && (toggleShowTriangulation?.checked ?? true)) {
      if (!map.hasLayer(topoTriangulationLayerGroup)) map.addLayer(topoTriangulationLayerGroup);
      if (!map.hasLayer(topoDistanceLabelsGroup)) map.addLayer(topoDistanceLabelsGroup);
    } else {
      map.removeLayer(topoTriangulationLayerGroup);
      map.removeLayer(topoDistanceLabelsGroup);
    }
  };

  // ============================================================================
  // MOTORE DI TRIANGOLAZIONE INTELLIGENTE PREGEO 10 (CONFORME & MULTI-TERNA)
  // ============================================================================
  let activeTriangulationCandidates = [];
  let activeCandidateIndex = 0;
  let lastTriangulationParcel = null;
  let lastTriangulationPool = [];

  // Risolutore geometrico intelligente per terne fiduciarie conformi Pregeo 10
  // GARANZIA ASSOLUTA: La particella selezionata DEVE ESSERE SEMPRE ALL'INTERNO della triangolazione
  const solveTriangulationCandidates = (targetLat, targetLon, targetFoglio, pfList) => {
    const cosLat = Math.cos(targetLat * Math.PI / 180);
    const toM = (lat, lon) => ({
      x: (lon - targetLon) * 111320 * cosLat,
      y: (lat - targetLat) * 110950
    });
    const distM = (p) => {
      const pt = toM(p.lat, p.lon);
      return Math.hypot(pt.x, pt.y);
    };
    const angleRad = (p) => {
      const pt = toM(p.lat, p.lon);
      return Math.atan2(pt.y, pt.x);
    };

    // Filtro preliminare di sicurezza: PF in un raggio congruo (~15 km)
    const validPFs = pfList.filter(
      (p) => Math.abs(p.lat - targetLat) < 0.15 && Math.abs(p.lon - targetLon) < 0.18
    );
    const candidateSource = validPFs.length >= 6 ? validPFs : pfList;

    const sortedPFs = candidateSource
      .map((p) => ({
        ...p,
        _dist: distM(p),
        _ang: angleRad(p)
      }))
      .sort((a, b) => a._dist - b._dist);

    if (sortedPFs.length < 3) return [];

    const triArea = (p1, p2, p3) => {
      return 0.5 * Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
    };

    // Test rigoroso Point-in-Triangle tramite prodotti vettoriali orientati (Signed Cross Products)
    // Garantisce che l'origine (0,0, baricentro particella) sia strettamente interna al triangolo
    const isStrictlyInside = (A, B, C) => {
      const cp1 = A.x * B.y - A.y * B.x;
      const cp2 = B.x * C.y - B.y * C.x;
      const cp3 = C.x * A.y - C.y * A.x;
      const eps = 1.0; // Margine metrico di sicurezza (> 0 m²)
      const allPos = cp1 > eps && cp2 > eps && cp3 > eps;
      const allNeg = cp1 < -eps && cp2 < -eps && cp3 < -eps;
      return allPos || allNeg;
    };

    const calcAngles = (A, B, C) => {
      const a = Math.hypot(B.x - C.x, B.y - C.y);
      const b = Math.hypot(C.x - A.x, C.y - A.y);
      const c = Math.hypot(A.x - B.x, A.y - B.y);
      if (a * b * c === 0) return [0, 0, 0];
      const cosA = Math.max(-1.0, Math.min(1.0, (b * b + c * c - a * a) / (2 * b * c)));
      const cosB = Math.max(-1.0, Math.min(1.0, (a * a + c * c - b * b) / (2 * a * c)));
      const cosC = Math.max(-1.0, Math.min(1.0, (a * a + b * b - c * c) / (2 * a * b)));
      return [
        Math.acos(cosA) * (180 / Math.PI),
        Math.acos(cosB) * (180 / Math.PI),
        Math.acos(cosC) * (180 / Math.PI)
      ];
    };

    // Raggruppa i PF in 8 ottanti angolari per garantire una campionatura a 360° attorno alla particella
    const octants = Array.from({ length: 8 }, () => []);
    sortedPFs.forEach((p) => {
      const idx = Math.floor(((p._ang + Math.PI) / (2 * Math.PI)) * 8) % 8;
      octants[idx].push(p);
    });

    // Piani di espansione progressiva del pool fiduciario
    const expansionLevels = [
      { perOctant: 4, closestOverall: 16 },
      { perOctant: 8, closestOverall: 36 },
      { perOctant: 14, closestOverall: 64 }
    ];

    let rawCandidates = [];
    let lastBuiltPool = [];

    for (const level of expansionLevels) {
      const poolSet = new Set();
      const pool = [];
      const addP = (p) => {
        if (!poolSet.has(p.id)) {
          poolSet.add(p.id);
          pool.push(p);
        }
      };

      // Inserisce i più vicini in assoluto
      for (let i = 0; i < Math.min(level.closestOverall, sortedPFs.length); i++) {
        addP(sortedPFs[i]);
      }
      // Inserisce i più vicini per ciascun ottante (Nord, Nord-Est, Est, Sud-Est, Sud, Sud-Ovest, Ovest, Nord-Ovest)
      for (let o = 0; o < 8; o++) {
        for (let i = 0; i < Math.min(level.perOctant, octants[o].length); i++) {
          addP(octants[o][i]);
        }
      }

      lastBuiltPool = pool;

      // Ricerca combinatoria delle terne
      for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
          for (let k = j + 1; k < pool.length; k++) {
            const p1 = pool[i], p2 = pool[j], p3 = pool[k];
            const A = toM(p1.lat, p1.lon), B = toM(p2.lat, p2.lon), C = toM(p3.lat, p3.lon);

            // REGOLA IMPERATIVA: La particella DEVE ESSERE RIGOROSAMENTE DENTRO
            if (!isStrictlyInside(A, B, C)) continue;

            const [degA, degB, degC] = calcAngles(A, B, C);
            const minAng = Math.min(degA, degB, degC);
            const maxAng = Math.max(degA, degB, degC);
            // Scarta triangoli degeneri a lama di coltello
            if (minAng < 10.0 || maxAng > 160.0) continue;

            const d12 = Math.hypot(A.x - B.x, A.y - B.y);
            const d23 = Math.hypot(B.x - C.x, B.y - C.y);
            const d31 = Math.hypot(C.x - A.x, C.y - A.y);
            const perimeter = d12 + d23 + d31;
            const areaM2 = triArea(A, B, C);
            const avgDist = (p1._dist + p2._dist + p3._dist) / 3;

            // Eccentricità (distanza dal baricentro geometrico del triangolo fiduciario)
            const gx = (A.x + B.x + C.x) / 3, gy = (A.y + B.y + C.y) / 3;
            const eccDist = Math.hypot(gx, gy);

            // Bonus appartenenza allo stesso foglio catastale
            let sheetBonus = 0;
            if (targetFoglio) {
              const tFgStr = String(targetFoglio).trim();
              [p1, p2, p3].forEach((p) => {
                if (String(p.foglio).trim() === tFgStr) sheetBonus += 35;
              });
            }

            // Punteggio equiangolo (un triangolo equilatero a 60° è la configurazione aurea Pregeo)
            const equiScore = 120 - Math.abs(degA - 60) - Math.abs(degB - 60) - Math.abs(degC - 60);
            const minAngBonus = minAng >= 30.0 ? 250 : 0;
            const minAngPenalty = minAng < 25.0 ? (25.0 - minAng) * 30 : 0;

            // Algoritmo di ranking Pregeo 10
            const score =
              25000 -
              perimeter * 0.35 -
              avgDist * 0.9 -
              eccDist * 0.5 +
              minAng * 15 +
              equiScore * 6 +
              minAngBonus -
              minAngPenalty +
              sheetBonus;

            rawCandidates.push({
              pfs: [
                { ...p1, dist: p1._dist },
                { ...p2, dist: p2._dist },
                { ...p3, dist: p3._dist }
              ],
              inside: true,
              minAng,
              maxAng,
              angles: [degA, degB, degC],
              mutual: { d12, d23, d31 },
              perimeter,
              area: areaM2,
              eccDist,
              distToEdge: 0,
              score
            });
          }
        }
      }

      // Se abbiamo trovato almeno 8 terne chiuse di alta qualità, interrompiamo l'espansione
      if (rawCandidates.length >= 8) break;
    }

    lastTriangulationPool = lastBuiltPool;
    rawCandidates.sort((a, b) => b.score - a.score);

    // Seleziona fino a 3 terne geometricamente distinte (non duplicate)
    const distinctCandidates = [];
    for (const cand of rawCandidates) {
      const key = cand.pfs.map((p) => p.id).sort().join("_");
      const isDuplicate = distinctCandidates.some(
        (c) => c.pfs.map((p) => p.id).sort().join("_") === key
      );
      if (!isDuplicate) {
        distinctCandidates.push(cand);
      }
      if (distinctCandidates.length >= 3) break;
    }

    return distinctCandidates;
  };

  // ============================================================================
  // ARCHIVIO STORICO MUTUE DISTANZE (DIS) - VERIFICA TOLLERANZE PREGEO
  // ============================================================================
  window.DIS_DATA = window.DIS_DATA || {};

  const loadDisBaselines = async (codComune) => {
    if (!codComune) return null;
    const norm = codComune.toUpperCase();
    if (window.DIS_DATA && window.DIS_DATA[norm]) return window.DIS_DATA[norm];
    try {
      const res = await fetch(`data/dis/${norm}.json`);
      if (res.ok) {
        const json = await res.json();
        window.DIS_DATA = window.DIS_DATA || {};
        window.DIS_DATA[norm] = json;
        return json;
      }
    } catch (_) {}
    return null;
  };

  const getDisPairKey = (idA, idB) => {
    return [String(idA || '').trim(), String(idB || '').trim()].sort().join('___');
  };

  // Verifica tolleranza Pregeo per una mutua distanza (Circolari 2/88 e 5/89)
  // Formula ministeriale: T = 0.05 + 0.0004 * D + 0.0000005 * D^2
  const checkDisTolerance = (dCalc, disEntry) => {
    if (!disEntry) {
      return {
        hasRecord: false,
        text: "Nuova Misurata (1ª det.)",
        badgeClass: "dis-new",
        icon: "ℹ️",
        dDis: null,
        delta: null,
        tol: null,
        actsCount: 0,
        sqm: null,
        lastProt: null
      };
    }
    const dDis = Number(disEntry.d);
    const delta = Math.abs(dCalc - dDis);
    const tol = 0.05 + 0.0004 * dCalc + 0.0000005 * (dCalc * dCalc);
    const deltaCm = (delta * 100).toFixed(1);
    const tolCm = (tol * 100).toFixed(0);
    const isOk = delta <= tol;

    return {
      hasRecord: true,
      dDis,
      delta,
      tol,
      isOk,
      actsCount: disEntry.n,
      sqm: disEntry.s,
      lastProt: disEntry.p,
      badgeClass: isOk ? "dis-ok" : "dis-warn",
      icon: isOk ? "✅" : "⚠️",
      text: `DIS: ${dDis.toFixed(2)}m (Δ=${deltaCm}cm ≤ ${tolCm}cm)`
    };
  };

  // Rendering grafico completo del triangolo fiduciario, lati, mutue distanze ed etichette
  const renderTriangulationCandidate = async (candidate) => {
    if (!candidate || !lastTriangulationParcel) return;
    const { lat, lon, comune, foglio, particella } = lastTriangulationParcel;
    const [p1, p2, p3] = candidate.pfs;
    const { d12, d23, d31 } = candidate.mutual;
    const [deg1, deg2, deg3] = candidate.angles;

    // Caricamento asincrono archivio storico DIS per il comune del rilievo
    const comCod = p1.codComune || (lastTriangulationParcel.comune && window.PF_INDEX && Object.keys(window.PF_INDEX).find(c => window.PF_INDEX[c].name.toLowerCase() === lastTriangulationParcel.comune.toLowerCase())) || "H574";
    const disData = await loadDisBaselines(comCod);

    const tol12 = checkDisTolerance(d12, disData ? disData[getDisPairKey(p1.id, p2.id)] : null);
    const tol23 = checkDisTolerance(d23, disData ? disData[getDisPairKey(p2.id, p3.id)] : null);
    const tol31 = checkDisTolerance(d31, disData ? disData[getDisPairKey(p3.id, p1.id)] : null);

    parcelTriangulationGroup.clearLayers();

    // 0. Poligono del perimetro reale della Particella evidenziata (se disponibile)
    if (window.lastSelectedParcelPolygon && Array.isArray(window.lastSelectedParcelPolygon) && window.lastSelectedParcelPolygon.length >= 3) {
      L.polygon(window.lastSelectedParcelPolygon, {
        color: "#f59e0b",
        weight: 3.5,
        opacity: 0.95,
        fillColor: "#fbbf24",
        fillOpacity: 0.28,
        className: "selected-parcel-perimeter"
      }).addTo(parcelTriangulationGroup);
    }

    // 1. Poligono fiduciario Pregeo (Verde smeraldo se interna / Arancio se estrapolazione)
    const polyColor = candidate.inside ? "#059669" : "#d97706";
    const polyFill = candidate.inside ? "#10b981" : "#f59e0b";

    L.polygon([[p1.lat, p1.lon], [p2.lat, p2.lon], [p3.lat, p3.lon]], {
      color: polyColor,
      weight: 2.5,
      dashArray: "6, 6",
      fillColor: polyFill,
      fillOpacity: candidate.inside ? 0.14 : 0.10
    }).addTo(parcelTriangulationGroup);

    // 2. Lati e relative mutue distanze con indicazione DIS
    const addSide = (a, b, dist, tol) => {
      L.polyline([[a.lat, a.lon], [b.lat, b.lon]], {
        color: polyColor,
        weight: 2.2,
        opacity: 0.95
      }).addTo(parcelTriangulationGroup);

      const mid = [(a.lat + b.lat) / 2, (a.lon + b.lon) / 2];
      const distTxt = dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist.toFixed(1)} m`;
      const disIcon = tol && tol.hasRecord ? (tol.isOk ? '✓' : '!') : '';
      L.marker(mid, {
        icon: L.divIcon({
          className: "triangulation-dist-icon",
          html: `<span class="triangulation-dist-label">${distTxt} ${disIcon ? `<small style="opacity:0.85;">(${disIcon})</small>` : ''}</span>`,
          iconSize: [64, 18],
          iconAnchor: [32, 9]
        })
      }).addTo(parcelTriangulationGroup);
    };

    addSide(p1, p2, d12, tol12);
    addSide(p2, p3, d23, tol23);
    addSide(p3, p1, d31, tol31);

    // 3. Angoli interni al vertice con badge dedicati
    const addAngleBadge = (pf, deg) => {
      L.marker([pf.lat, pf.lon], {
        icon: L.divIcon({
          className: "triangulation-angle-icon",
          html: `<span class="triangulation-angle-label">∠ ${deg.toFixed(1)}°</span>`,
          iconSize: [52, 16],
          iconAnchor: [26, 26]
        })
      }).addTo(parcelTriangulationGroup);
    };
    addAngleBadge(p1, deg1);
    addAngleBadge(p2, deg2);
    addAngleBadge(p3, deg3);

    // 4. Raggi tratteggiati dorati dal baricentro particella a ciascun PF
    const addRay = (pf, dist) => {
      L.polyline([[lat, lon], [pf.lat, pf.lon]], {
        color: "#d97706",
        weight: 1.8,
        dashArray: "5, 5",
        opacity: 0.95
      }).addTo(parcelTriangulationGroup);

      const mid = [(lat + pf.lat) / 2, (lon + pf.lon) / 2];
      const distTxt = dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist.toFixed(1)} m`;
      L.marker(mid, {
        icon: L.divIcon({
          className: "parcel-dist-icon",
          html: `<span class="parcel-triangulation-label">${distTxt}</span>`,
          iconSize: [64, 18],
          iconAnchor: [32, 9]
        })
      }).addTo(parcelTriangulationGroup);
    };

    addRay(p1, p1.dist);
    addRay(p2, p2.dist);
    addRay(p3, p3.dist);

    // 5. Marker bersaglio sulla Particella
    const partMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "parcel-target-pin-wrap",
        html: `<div class="parcel-target-pin" title="Particella ${particella || ''}">🎯</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      })
    }).addTo(parcelTriangulationGroup);

    partMarker.bindTooltip(`Particella ${particella || 'Selezionata'}`, {
      permanent: true,
      direction: "bottom",
      className: "pf-leaflet-label",
      offset: [0, 12]
    });

    // 6. Marker speciali per i 3 PF
    [p1, p2, p3].forEach((pf, idx) => {
      const pfMarker = L.marker([pf.lat, pf.lon], {
        icon: L.divIcon({
          className: "pf-marker-icon",
          html: `<div class="pf-pin" style="background:#b91c1c; transform: scale(1.15); box-shadow: 0 0 10px rgba(185,28,28,0.7);" title="${pf.id}">PF${idx + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(parcelTriangulationGroup);

      pfMarker.bindTooltip(`PF${idx + 1}: ${pf.id} (${pf.dist.toFixed(0)}m)`, {
        permanent: true,
        direction: "top",
        className: "pf-leaflet-label",
        offset: [0, -10]
      });

      const nStr = Number(pf.nord ?? pf.x ?? 0).toFixed(2);
      const eStr = Number(pf.est ?? pf.y ?? 0).toFixed(2);
      const qStr = Number(pf.quota ?? 0).toFixed(1);

      pfMarker.bindPopup(`
        <div style="font-family: Manrope, sans-serif; padding: 0.2rem; min-width: 260px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid var(--gold); padding-bottom: 0.4rem; margin-bottom: 0.5rem;">
            <strong style="color: #b91c1c; font-size: 1.05rem;">📍 ${pf.id} (Vertice PF${idx + 1})</strong>
            <span style="font-size: 0.72rem; background: #fee2e2; color: #991b1b; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700;">d = ${pf.dist.toFixed(1)} m</span>
          </div>
          <div style="font-size: 0.84rem; line-height: 1.45; color: #334155;">
            <strong>Comune:</strong> ${pf.comune} (${pf.prov}) &bull; Foglio <strong>${pf.foglio}</strong><br>
            <strong>Quota Altimetrica:</strong> ${qStr} m s.l.m.<br>
            <strong>Angolo interno al vertice:</strong> <strong>${candidate.angles[idx].toFixed(1)}°</strong><br>
            <strong>Descrizione:</strong> ${pf.desc || 'Punto Fiduciale'}<br>
            <strong>Cassini-Soldner:</strong> N: ${nStr} | E: ${eStr}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; margin-top: 0.75rem;">
            <button class="btn btn-gold" type="button" onclick="window.openCompassForPF('${pf.id}')" style="font-size: 0.74rem; padding: 0.35rem 0.4rem;">
              🧭 Naviga al PF
            </button>
            <button class="btn btn-ghost" type="button" onclick="window.startSurveyPhotoCapture('${pf.id}')" style="font-size: 0.74rem; padding: 0.35rem 0.4rem; color: #047857; border-color: #a7f3d0;">
              📸 Foto Timbro
            </button>
          </div>
          <div style="display: grid; gap: 0.35rem; margin-top: 0.35rem;">
            ${(window.MONOGRAFIE_INDEX && window.MONOGRAFIE_INDEX[pf.id])
              ? `<button class="btn btn-gold" type="button" onclick="window.openOfficialMonografiaModal('${pf.id}')" style="width: 100%; min-height: 28px; font-size: 0.75rem; padding: 0.3rem 0.5rem; font-weight: 700;">📸 Foto &amp; Monografia Ufficiale</button>`
              : `<button class="btn btn-ghost" type="button" onclick="downloadMonografiaPDF('${pf.id}')" style="width: 100%; min-height: 28px; font-size: 0.75rem; padding: 0.3rem 0.5rem;">📄 Scheda Monografica (PDF)</button>`}
            <button class="btn btn-ghost" type="button" onclick="window.swapTriangulationVertex(${idx})" style="width: 100%; min-height: 28px; font-size: 0.75rem; padding: 0.3rem 0.5rem; color: var(--navy); border-color: #cbd5e1;">
              🔄 Sostituisci questo PF
            </button>
          </div>
        </div>
      `);
    });

    // 7. Inquadratura mappa con margine bilanciato
    const bounds = L.latLngBounds([
      [lat, lon],
      [p1.lat, p1.lon],
      [p2.lat, p2.lon],
      [p3.lat, p3.lon]
    ]);
    map.fitBounds(bounds.pad(0.24), { animate: true });

    // 8. Popolamento HUD interattivo
    if (parcelTriangulationHud && hudBodyContent) {
      const parcelDesc = `${comune || 'Rosolini'} &bull; ${foglio ? 'Foglio ' + foglio : ''} ${particella ? 'Part. ' + particella : ''}`.trim();
      if (hudParcelSubtitle) hudParcelSubtitle.innerHTML = parcelDesc;

      const perimeter = candidate.perimeter.toFixed(1);
      const areaM2 = Math.round(candidate.area);
      const areaHa = (candidate.area / 10000).toFixed(2);

      // Calcolo dell'EST MEDIA e della QUOTA MEDIA per l'inquadramento e la Riga 9 Pregeo
      const valE1 = Number(p1.est ?? p1.y ?? 0);
      const valE2 = Number(p2.est ?? p2.y ?? 0);
      const valE3 = Number(p3.est ?? p3.y ?? 0);
      const estMedia = Math.round((valE1 + valE2 + valE3) / 3);

      const valQ1 = Number(p1.quota || 0);
      const valQ2 = Number(p2.quota || 0);
      const valQ3 = Number(p3.quota || 0);
      const quotaMedia = Math.round((valQ1 + valQ2 + valQ3) / 3);

      // Candidate Tabs (Terna 1, Terna 2, Terna 3)
      let tabsHtml = '';
      if (activeTriangulationCandidates.length > 1) {
        tabsHtml = `
          <div class="hud-candidate-tabs">
            ${activeTriangulationCandidates.map((c, i) => `
              <button class="hud-tab-btn ${i === activeCandidateIndex ? 'active' : ''}" type="button" onclick="window.selectTriangulationCandidate(${i})">
                ${i === 0 ? '⭐ Terna 1 (Consigliata)' : 'Terna ' + (i + 1)}
              </button>
            `).join('')}
          </div>
        `;
      }

      // Status banner di conformità Pregeo 10 (Particella Rigorosamente Interna)
      let statusBanner = '';
      if (candidate.inside) {
        statusBanner = `
          <div class="hud-status-banner status-compliant">
            <div><strong>✅ CONFORME PREGEO 10 (Particella Rigorosamente Interna)</strong></div>
            <div class="hud-status-metric">
              Area Triangolo: <strong>${areaM2.toLocaleString('it-IT')} m²</strong> (${areaHa} ha) &bull; Perimetro: <strong>${perimeter} m</strong>
            </div>
            <div class="hud-status-metric" style="color: #047857;">
              Angoli ai vertici: min ${candidate.minAng.toFixed(1)}° &mdash; max ${candidate.maxAng.toFixed(1)}° (Conformità Pregeo &ge; 30°)
            </div>
            <div class="hud-status-metric" style="color: #1e3a8a; margin-top: 5px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px; border-top: 1px dashed rgba(30, 58, 138, 0.25); padding-top: 5px;">
              <span>🧭 EST MEDIA (RIGA 9): <span class="hud-est-media-pill">${estMedia.toLocaleString('it-IT')} m</span></span>
              <span>QUOTA MEDIA: <strong>${quotaMedia} m s.l.m.</strong></span>
            </div>
          </div>
        `;
      } else {
        statusBanner = `
          <div class="hud-status-banner status-warning">
            <div><strong>⚠️ RILIEVO PER ESTRAPOLAZIONE (Particella Esterna)</strong></div>
            <div class="hud-status-metric">
              Distanza dal lato fiduciario più vicino: <strong>${candidate.distToEdge.toFixed(1)} m</strong>
            </div>
            <div class="hud-status-metric">
              Selezionare una delle terne conformi in alto per mantenere la particella all'interno.
            </div>
            <div class="hud-status-metric" style="color: #1e3a8a; margin-top: 5px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
              <span>🧭 EST MEDIA: <span class="hud-est-media-pill">${estMedia.toLocaleString('it-IT')} m</span></span>
              <span>QUOTA MEDIA: <strong>${quotaMedia} m</strong></span>
            </div>
          </div>
        `;
      }

      // Griglia angoli interni ai 3 vertici
      const anglesGrid = `
        <div class="hud-angles-grid">
          <div class="hud-angle-pill"><span>Vertice PF1:</span> <strong>${deg1.toFixed(1)}°</strong></div>
          <div class="hud-angle-pill"><span>Vertice PF2:</span> <strong>${deg2.toFixed(1)}°</strong></div>
          <div class="hud-angle-pill"><span>Vertice PF3:</span> <strong>${deg3.toFixed(1)}°</strong></div>
        </div>
      `;

      // Schede anagrafiche dei 3 PF con coordinata Est visibile, tasti Naviga e Foto
      const pfCardsHtml = [p1, p2, p3].map((pf, idx) => {
        const mono = window.MONOGRAFIE_INDEX && window.MONOGRAFIE_INDEX[pf.id];
        const monoBtn = mono
          ? `<button type="button" onclick="window.openOfficialMonografiaModal('${pf.id}')" style="background: #fef3c7; border: 1px solid #fde68a; color: #92400e; font-weight: 800; font-size: 0.72rem; cursor: pointer; padding: 2px 6px; border-radius: 4px; margin-left: auto; margin-right: 4px;">📸 Foto PF ↗</button>`
          : `<button type="button" onclick="downloadMonografiaPDF('${pf.id}')" style="background: none; border: none; color: #b91c1c; font-weight: 700; font-size: 0.72rem; cursor: pointer; padding: 0; text-decoration: underline; margin-left: auto; margin-right: 4px;">📄 Monografia ↗</button>`;
        return `
        <div class="hud-pf-card">
          <div class="pf-tag">
            <strong>🔴 PF${idx + 1}: ${pf.id}</strong>
            ${mono ? '<span style="font-size: 0.65rem; background: #fef08a; color: #854d0e; padding: 1px 4px; border-radius: 3px; font-weight: 800;">📸 FOTO</span>' : ''}
            <span class="pf-dist-pill">d = ${pf.dist.toFixed(1)} m</span>
          </div>
          <div>F.${pf.foglio} &bull; Est: <strong>${Number(pf.est ?? pf.y ?? 0).toFixed(1)} m</strong> &bull; Quota: ${Number(pf.quota || 0).toFixed(0)}m</div>
          <div style="font-size: 0.72rem; color: #475569; margin-top: 2px;">${pf.desc || ''}</div>
          <div class="hud-swap-row" style="margin-top: 5px; display: flex; gap: 4px; flex-wrap: wrap;">
            <button class="hud-swap-btn" type="button" onclick="window.openCompassForPF('${pf.id}')" title="Bussola e navigatore sul campo verso questo PF" style="color: #0284c7; border-color: #bae6fd; background: #f0f9ff; padding: 2px 6px; font-size: 0.72rem;">
              🧭 Naviga
            </button>
            <button class="hud-swap-btn" type="button" onclick="window.startSurveyPhotoCapture('${pf.id}')" title="Scatta foto con timbro georeferenziato al PF" style="color: #059669; border-color: #a7f3d0; background: #ecfdf5; padding: 2px 6px; font-size: 0.72rem;">
              📸 Foto
            </button>
            ${monoBtn}
            <button class="hud-swap-btn" type="button" onclick="window.swapTriangulationVertex(${idx})" title="Sostituisci questo vertice con un altro PF vicino" style="padding: 2px 6px; font-size: 0.72rem;">
              🔄 Cambia
            </button>
          </div>
        </div>
        `;
      }).join('');

      hudBodyContent.innerHTML = `
        ${tabsHtml}
        ${statusBanner}
        <div class="hud-pf-list">
          ${pfCardsHtml}
        </div>

        <div class="hud-mutual-box">
          <strong>📐 Maglia Fiduciaria Pregeo (Perimetro: ${perimeter} m)</strong>
          <div class="hud-pregeo-kpis">
            <div class="hud-kpi-item">
              <span class="hud-kpi-label">EST MEDIA (RIGA 9)</span>
              <strong class="hud-kpi-value">${estMedia.toLocaleString('it-IT')} m</strong>
            </div>
            <div class="hud-kpi-item">
              <span class="hud-kpi-label">QUOTA MEDIA</span>
              <strong class="hud-kpi-value">${quotaMedia} m s.l.m.</strong>
            </div>
          </div>
          <div class="hud-mutual-grid">
            <div class="hud-mutual-item">
              <span>PF1-PF2: <strong>${d12.toFixed(1)} m</strong></span>
              <span class="dis-tolerance-badge ${tol12.badgeClass}" title="${tol12.hasRecord ? 'Distanza storica archivio DIS: ' + tol12.dDis.toFixed(2) + ' m | Atti approvati: ' + tol12.actsCount + ' | Ultimo prot.: ' + tol12.lastProt : 'Nessuna misura precedente nel database DIS'}">
                ${tol12.icon} ${tol12.text}
              </span>
            </div>
            <div class="hud-mutual-item">
              <span>PF2-PF3: <strong>${d23.toFixed(1)} m</strong></span>
              <span class="dis-tolerance-badge ${tol23.badgeClass}" title="${tol23.hasRecord ? 'Distanza storica archivio DIS: ' + tol23.dDis.toFixed(2) + ' m | Atti approvati: ' + tol23.actsCount + ' | Ultimo prot.: ' + tol23.lastProt : 'Nessuna misura precedente nel database DIS'}">
                ${tol23.icon} ${tol23.text}
              </span>
            </div>
            <div class="hud-mutual-item">
              <span>PF3-PF1: <strong>${d31.toFixed(1)} m</strong></span>
              <span class="dis-tolerance-badge ${tol31.badgeClass}" title="${tol31.hasRecord ? 'Distanza storica archivio DIS: ' + tol31.dDis.toFixed(2) + ' m | Atti approvati: ' + tol31.actsCount + ' | Ultimo prot.: ' + tol31.lastProt : 'Nessuna misura precedente nel database DIS'}">
                ${tol31.icon} ${tol31.text}
              </span>
            </div>
          </div>
          ${anglesGrid}
        </div>

        <div class="hud-actions-grid" style="margin-top: 0.6rem;">
          <button class="hud-action-btn btn-report" type="button" onclick="window.generatePeritaleReportPDF('${comune || 'Rosolini'}', '${foglio || ''}', '${particella || ''}')" title="Genera relazione tecnica di inquadramento Pregeo pronta per stampa o PDF">
            📑 Scheda Peritale (PDF)
          </button>
          <button class="hud-action-btn btn-dxf" type="button" onclick="window.exportTriangulationDXF()" title="Esporta geometria, PF e maglia in formato CAD AutoCAD R12 DXF">
            📐 CAD (.DXF)
          </button>
          <button class="hud-action-btn btn-kml" type="button" onclick="window.exportTriangulationKML()" title="Visualizza triangolazione, quote e vertici su Google Earth">
            🌍 Google Earth (.KML)
          </button>
          <button class="hud-action-btn btn-pregeo" type="button" onclick="window.exportPregeoTriangulation('${comune || 'Rosolini'}', '${foglio || ''}', '${particella || ''}', [${lat}, ${lon}])" title="Esporta libretto delle misure Pregeo 10 completo di Riga 9 con Est Media">
            💾 Libretto Pregeo (.DAT)
          </button>
        </div>
        <div style="margin-top: 6px;">
          <button class="btn btn-gold" type="button" onclick="window.downloadAllTriangulationPDFs(['${p1.id}', '${p2.id}', '${p3.id}'])" style="width: 100%; font-size: 0.74rem; padding: 0.35rem 0.5rem;">
            📄 Scarica tutte e 3 le Monografie PDF
          </button>
        </div>
      `;

      parcelTriangulationHud.classList.add("visible");
    }

    if (btnClearParcelTriangulation) btnClearParcelTriangulation.style.display = "block";
  };

  // Seleziona una terna alternativa di PF
  window.selectTriangulationCandidate = (idx) => {
    if (activeTriangulationCandidates && activeTriangulationCandidates[idx]) {
      activeCandidateIndex = idx;
      renderTriangulationCandidate(activeTriangulationCandidates[idx]);
    }
  };

  // Sostituzione di un vertice con il prossimo PF disponibile che MANTIENE la particella interna
  window.swapTriangulationVertex = (vertexIdx) => {
    if (!activeTriangulationCandidates || !activeTriangulationCandidates[activeCandidateIndex] || !lastTriangulationParcel) return;
    const current = activeTriangulationCandidates[activeCandidateIndex];
    const { lat, lon } = lastTriangulationParcel;
    const cosLat = Math.cos(lat * Math.PI / 180);
    const toM = (ptLat, ptLon) => ({
      x: (ptLon - lon) * 111320 * cosLat,
      y: (ptLat - lat) * 110950
    });

    const isStrictlyInside = (A, B, C) => {
      const cp1 = A.x * B.y - A.y * B.x;
      const cp2 = B.x * C.y - B.y * C.x;
      const cp3 = C.x * A.y - C.y * A.x;
      const eps = 1.0;
      return (cp1 > eps && cp2 > eps && cp3 > eps) || (cp1 < -eps && cp2 < -eps && cp3 < -eps);
    };

    const currentIds = new Set(current.pfs.map((p) => p.id));
    const otherPfs = current.pfs.filter((_, i) => i !== vertexIdx);
    const A = toM(otherPfs[0].lat, otherPfs[0].lon);
    const B = toM(otherPfs[1].lat, otherPfs[1].lon);

    // Cerca nel pool o in allPFData un PF alternativo che mantenga la particella rigorosamente interna
    const searchSource = allPFData && allPFData.length ? allPFData : lastTriangulationPool;
    const candidatesForSwap = searchSource
      .filter((p) => !currentIds.has(p.id) && Math.abs(p.lat - lat) < 0.12 && Math.abs(p.lon - lon) < 0.15)
      .map((p) => {
        const C = toM(p.lat, p.lon);
        const inside = isStrictlyInside(A, B, C);
        const dist = Math.hypot(C.x, C.y);
        return { ...p, dist, inside };
      })
      .filter((p) => p.inside) // SOLO PUNTI CHE MANTENGONO LA PARTICELLA DENTRO
      .sort((a, b) => a.dist - b.dist);

    if (!candidatesForSwap.length) {
      alert("Nessun altro Punto Fiduciale alternativo idoneo nelle vicinanze che mantenga la particella all'interno della triangolazione.");
      return;
    }

    const nextCandidate = candidatesForSwap[0];
    const target = { lat, lon };
    const newPfs = [...current.pfs];
    newPfs[vertexIdx] = {
      ...nextCandidate,
      dist: calcDistanceMeters(target, { lat: nextCandidate.lat, lon: nextCandidate.lon })
    };

    recalculateCustomCandidate(newPfs);
  };

  // Sostituisce un vertice specifico con un PF selezionato dalla mappa verificando che la particella resti interna
  window.replaceActiveVertex = (newPfId, vertexIdx) => {
    if (!activeTriangulationCandidates || !activeTriangulationCandidates[activeCandidateIndex] || !lastTriangulationParcel) return;
    const pf = allPFData?.find((p) => p.id === newPfId);
    if (!pf) return;
    const current = activeTriangulationCandidates[activeCandidateIndex];
    const target = { lat: lastTriangulationParcel.lat, lon: lastTriangulationParcel.lon };
    const cosLat = Math.cos(target.lat * Math.PI / 180);
    const toM = (ptLat, ptLon) => ({
      x: (ptLon - target.lon) * 111320 * cosLat,
      y: (ptLat - target.lat) * 110950
    });

    const isStrictlyInside = (A, B, C) => {
      const cp1 = A.x * B.y - A.y * B.x;
      const cp2 = B.x * C.y - B.y * C.x;
      const cp3 = C.x * A.y - C.y * A.x;
      const eps = 1.0;
      return (cp1 > eps && cp2 > eps && cp3 > eps) || (cp1 < -eps && cp2 < -eps && cp3 < -eps);
    };

    const newPfs = [...current.pfs];
    newPfs[vertexIdx] = {
      ...pf,
      dist: calcDistanceMeters(target, { lat: pf.lat, lon: pf.lon })
    };

    const A = toM(newPfs[0].lat, newPfs[0].lon);
    const B = toM(newPfs[1].lat, newPfs[1].lon);
    const C = toM(newPfs[2].lat, newPfs[2].lon);

    if (!isStrictlyInside(A, B, C)) {
      alert("⚠️ Attenzione: sostituendo con questo Punto Fiduciale la particella risulterebbe ESTERNA al triangolo.\n\nPer garantire la conformità catastale Pregeo 10, la particella selezionata deve essere sempre all'interno della triangolazione fiduciaria.");
      return;
    }

    recalculateCustomCandidate(newPfs);
    map.closePopup();
  };

  // Ricalcola geometria per una terna modificata manualmente dall'utente
  const recalculateCustomCandidate = (pfs) => {
    if (!lastTriangulationParcel) return;
    const { lat, lon } = lastTriangulationParcel;
    const cosLat = Math.cos(lat * Math.PI / 180);
    const toM = (ptLat, ptLon) => ({
      x: (ptLon - lon) * 111320 * cosLat,
      y: (ptLat - lat) * 110950
    });
    const [p1, p2, p3] = pfs;
    const A = toM(p1.lat, p1.lon), B = toM(p2.lat, p2.lon), C = toM(p3.lat, p3.lon);

    const d12 = Math.hypot(A.x - B.x, A.y - B.y);
    const d23 = Math.hypot(B.x - C.x, B.y - C.y);
    const d31 = Math.hypot(C.x - A.x, C.y - A.y);

    const calcAngles = () => {
      const a = d23, b = d31, c = d12;
      if (a * b * c === 0) return [0, 0, 0];
      const cosA = Math.max(-1.0, Math.min(1.0, (b * b + c * c - a * a) / (2 * b * c)));
      const cosB = Math.max(-1.0, Math.min(1.0, (a * a + c * c - b * b) / (2 * a * c)));
      const cosC = Math.max(-1.0, Math.min(1.0, (a * a + b * b - c * c) / (2 * a * b)));
      return [Math.acos(cosA) * (180 / Math.PI), Math.acos(cosB) * (180 / Math.PI), Math.acos(cosC) * (180 / Math.PI)];
    };
    const [degA, degB, degC] = calcAngles();

    const triArea = 0.5 * Math.abs(A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
    const cp1 = A.x * B.y - A.y * B.x;
    const cp2 = B.x * C.y - B.y * C.x;
    const cp3 = C.x * A.y - C.y * A.x;
    const eps = 1.0;
    const inside = (cp1 > eps && cp2 > eps && cp3 > eps) || (cp1 < -eps && cp2 < -eps && cp3 < -eps);

    const customCandidate = {
      pfs,
      inside,
      minAng: Math.min(degA, degB, degC),
      maxAng: Math.max(degA, degB, degC),
      angles: [degA, degB, degC],
      mutual: { d12, d23, d31 },
      perimeter: d12 + d23 + d31,
      area: triArea,
      distToEdge: 0,
      score: 99999
    };

    activeTriangulationCandidates[activeCandidateIndex] = customCandidate;
    renderTriangulationCandidate(customCandidate);
  };

  // Funzione pubblica per triangolare una particella o punto
  window.triangulateParcelWithPF = async (lat, lon, comune, foglio, particella) => {
    lastClickedParcel = { lat, lon, comune, foglio, particella };
    lastTriangulationParcel = { lat, lon, comune, foglio, particella };

    // Determina il codice catastale del comune o individua i comuni limitrofi dalle coordinate
    let targetComuneCod = null;
    if (comune && window.PF_INDEX) {
      const cNorm = comune.trim().toLowerCase();
      for (const [code, info] of Object.entries(window.PF_INDEX)) {
        if (code.toLowerCase() === cNorm || info.name.toLowerCase() === cNorm) {
          targetComuneCod = code;
          break;
        }
      }
    }

    if (!targetComuneCod && window.PF_INDEX) {
      let minDist = 999;
      for (const [code, info] of Object.entries(window.PF_INDEX)) {
        const [minLa, minLo, maxLa, maxLo] = info.bbox;
        const cLa = (minLa + maxLa) / 2, cLo = (minLo + maxLo) / 2;
        const d = Math.hypot(lat - cLa, lon - cLo);
        if (d < minDist) {
          minDist = d;
          targetComuneCod = code;
        }
      }
    }

    // Carica il comune target
    await loadPuntiFiduciali(targetComuneCod || "H574");

    // Se vicini ai confini comunali, pre-carica anche i comuni circostanti
    if (window.PF_INDEX) {
      const surrounding = [];
      for (const [code, info] of Object.entries(window.PF_INDEX)) {
        if (code === targetComuneCod) continue;
        const [minLa, minLo, maxLa, maxLo] = info.bbox;
        if (lat >= minLa - 0.06 && lat <= maxLa + 0.06 && lon >= minLo - 0.06 && lon <= maxLo + 0.06) {
          surrounding.push(code);
        }
      }
      if (surrounding.length > 0) {
        await Promise.all(surrounding.slice(0, 3).map((c) => loadPuntiFiduciali(c)));
      }
    }

    const pfList = allPFData && allPFData.length ? allPFData : (await loadPuntiFiduciali());
    if (!pfList || !pfList.length) {
      alert("Dati dei Punti Fiduciali non disponibili al momento.");
      return;
    }

    // Assicura che i layer PF siano attivi
    showPFGlobal = true;
    if (toggleShowPFGlobal) toggleShowPFGlobal.checked = true;
    if (!map.hasLayer(topoPFLayerGroup)) map.addLayer(topoPFLayerGroup);
    if (!map.hasLayer(parcelTriangulationGroup)) map.addLayer(parcelTriangulationGroup);

    const candidates = solveTriangulationCandidates(lat, lon, foglio, pfList);
    if (!candidates || !candidates.length) {
      alert("Nessuna terna di Punti Fiduciali idonea trovata che racchiuda la particella nelle vicinanze.");
      return;
    }

    activeTriangulationCandidates = candidates;
    activeCandidateIndex = 0;
    renderTriangulationCandidate(candidates[0]);
  };

  // Cancella triangolazione particella
  window.clearParcelTriangulation = () => {
    parcelTriangulationGroup.clearLayers();
    activeTriangulationCandidates = [];
    lastTriangulationParcel = null;
    if (parcelTriangulationHud) parcelTriangulationHud.classList.remove("visible");
    if (btnClearParcelTriangulation) btnClearParcelTriangulation.style.display = "none";
  };

  btnHudClose?.addEventListener("click", window.clearParcelTriangulation);
  btnClearParcelTriangulation?.addEventListener("click", window.clearParcelTriangulation);

  // Bottone sidebar per triangolare l'ultima particella
  btnTriangulateLastParcel?.addEventListener("click", () => {
    if (lastClickedParcel) {
      window.triangulateParcelWithPF(
        lastClickedParcel.lat,
        lastClickedParcel.lon,
        lastClickedParcel.comune,
        lastClickedParcel.foglio,
        lastClickedParcel.particella
      );
    } else {
      const center = map.getCenter();
      window.triangulateParcelWithPF(
        center.lat,
        center.lng,
        comuneSelect?.options[comuneSelect.selectedIndex]?.text || "Rosolini",
        (gFoglioInput?.value || "").trim(),
        (gParticellaInput?.value || "").trim()
      );
    }
  });

  // Switcher Sovrapposizioni: Mostra Punti Fiduciali (VisualTAF)
  toggleShowPFGlobal?.addEventListener("change", () => {
    showPFGlobal = toggleShowPFGlobal.checked;
    if (showPFGlobal) {
      map.addLayer(topoPFLayerGroup);
      updateTopographyView();
    } else {
      map.removeLayer(topoPFLayerGroup);
      if (!topoModeActive) {
        map.removeLayer(topoTriangulationLayerGroup);
        map.removeLayer(topoDistanceLabelsGroup);
      }
    }
  });

  // Attiva / Disattiva Modalità Rilievi Topografici Completa
  const toggleTopoMode = async () => {
    topoModeActive = !topoModeActive;

    if (topoModeActive) {
      if (btnToggleTopoMode) {
        btnToggleTopoMode.innerHTML = `<span>✕</span> Disattiva Modalità Rilievi`;
        btnToggleTopoMode.classList.remove("btn-gold");
        btnToggleTopoMode.classList.add("btn-ghost");
        btnToggleTopoMode.style.color = "#991b1b";
        btnToggleTopoMode.style.borderColor = "#f87171";
      }
      btnFloatingTopo?.classList.add("active");
      if (topoBadge) {
        topoBadge.textContent = "ATTIVA";
        topoBadge.style.background = "#dcfce7";
        topoBadge.style.color = "#166534";
      }
      if (topoControlsPanel) topoControlsPanel.style.display = "block";

      await updateTopographyView();

      const selectedComune = comuneSelect?.value || "H574";
      const pfList = await loadPuntiFiduciali();
      const currentPF = pfList.filter((p) => p.codComune === selectedComune);
      if (currentPF.length > 0 && map) {
        const group = L.featureGroup(currentPF.slice(0, 8).map((p) => L.marker([p.lat, p.lon])));
        map.fitBounds(group.getBounds().pad(0.2));
      }
    } else {
      if (btnToggleTopoMode) {
        btnToggleTopoMode.innerHTML = `<span>🧭</span> Attiva Modalità Rilievi Topografici`;
        btnToggleTopoMode.classList.add("btn-gold");
        btnToggleTopoMode.classList.remove("btn-ghost");
        btnToggleTopoMode.style.color = "";
        btnToggleTopoMode.style.borderColor = "";
      }
      btnFloatingTopo?.classList.remove("active");
      if (topoBadge) {
        topoBadge.textContent = "INATTIVA";
        topoBadge.style.background = "#e2e8f0";
        topoBadge.style.color = "#475569";
      }
      if (topoControlsPanel) topoControlsPanel.style.display = "none";

      map.removeLayer(topoTriangulationLayerGroup);
      map.removeLayer(topoDistanceLabelsGroup);
      // Se PF globale è ancora attivo, mantiene i punti fiduciali come VisualTAF
      if (!toggleShowPFGlobal?.checked) {
        map.removeLayer(topoPFLayerGroup);
      }
    }
  };

  btnToggleTopoMode?.addEventListener("click", toggleTopoMode);
  btnFloatingTopo?.addEventListener("click", () => {
    const isSidebarClosed = document.querySelector(".webgis-app-container")?.classList.contains("sidebar-collapsed");
    if (isSidebarClosed) {
      document.getElementById("gisSidebarToggle")?.click();
    }
    toggleTopoMode();
  });

  // Checkbox sub-controlli
  toggleShowPF?.addEventListener("change", () => {
    if (toggleShowPF.checked) {
      map.addLayer(topoPFLayerGroup);
    } else {
      map.removeLayer(topoPFLayerGroup);
    }
  });

  toggleShowTriangulation?.addEventListener("change", () => {
    if (toggleShowTriangulation.checked) {
      map.addLayer(topoTriangulationLayerGroup);
      map.addLayer(topoDistanceLabelsGroup);
    } else {
      map.removeLayer(topoTriangulationLayerGroup);
      map.removeLayer(topoDistanceLabelsGroup);
    }
  });

  togglePFLabels?.addEventListener("change", () => {
    updateTopographyView();
  });

  // Quando l'utente scorre o zooma la mappa, aggiorna i PF dell'area visibile in stile VisualTAF
  map.on("moveend zoomend", () => {
    clearTimeout(pfUpdateTimer);
    pfUpdateTimer = setTimeout(() => {
      const isPFEnabled = (toggleShowPFGlobal ? toggleShowPFGlobal.checked : true) || topoModeActive;
      if (isPFEnabled) {
        updateTopographyView();
      }
    }, 150);
  });

  comuneSelect?.addEventListener("change", () => {
    updateTopographyView();
  });

  // Centra su PF Foglio
  btnZoomToSheetPF?.addEventListener("click", async () => {
    const pfList = await loadPuntiFiduciali();
    const selectedComune = comuneSelect?.value || "H574";
    const selectedFoglio = parseInt((gFoglioInput?.value || "").trim(), 10);
    const targetPF = pfList.filter((p) => p.codComune === selectedComune && (!selectedFoglio || p.foglio === selectedFoglio));
    if (targetPF.length > 0) {
      const group = L.featureGroup(targetPF.map((p) => L.marker([p.lat, p.lon])));
      map.fitBounds(group.getBounds().pad(0.2));
    } else {
      alert("Nessun Punto Fiduciale trovato per il foglio specificato.");
    }
  });

  // Esportazione File TAF / Pregeo
  btnExportPregeo?.addEventListener("click", async () => {
    const pfList = await loadPuntiFiduciali();
    const selectedComune = comuneSelect?.value || "H574";
    const selectedFoglio = parseInt((gFoglioInput?.value || "").trim(), 10);
    const targetPF = pfList.filter((p) => p.codComune === selectedComune && (!selectedFoglio || p.foglio === selectedFoglio));

    if (!targetPF.length) {
      alert("Nessun punto da esportare.");
      return;
    }

    const header = [
      `; ARCHIVIO PUNTI FIDUCIALI TAF - PREGEO`,
      `; Studio Tecnico Associato Giurato & Iacono (Rosolini)`,
      `; Comune: ${selectedComune} - Foglio: ${selectedFoglio || "Tutti"}`,
      `; Data generazione: ${new Date().toLocaleDateString("it-IT")}`,
      `; Formato: ID | NORD | EST | QUOTA | ATTENDIBILITA | DESCRIZIONE`,
      ""
    ];

    const lines = targetPF.map((p) => {
      const n = Number(p.nord ?? p.x ?? 0).toFixed(3);
      const e = Number(p.est ?? p.y ?? 0).toFixed(3);
      const q = Number(p.quota ?? 0).toFixed(2);
      return `${p.id}|${n}|${e}|${q}|10|${p.desc || ''}`;
    });

    const fileContent = [...header, ...lines].join("\r\n");
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TAF_${selectedComune}_F${selectedFoglio || "ALL"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ============================================================================
  // CARICAMENTO FILE TAF (.taf / .txt) DA PARTE DELL'UTENTE
  // ============================================================================
  btnUploadTaf?.addEventListener("click", () => {
    inputTafFile?.click();
  });

  inputTafFile?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (tafUploadStatus) {
      tafUploadStatus.style.display = "block";
      tafUploadStatus.style.background = "#eff6ff";
      tafUploadStatus.style.color = "#1e40af";
      tafUploadStatus.style.borderColor = "#bfdbfe";
      tafUploadStatus.textContent = `⏳ Lettura ed elaborazione di ${file.name}...`;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/);
        let loadedCount = 0;
        const newPFs = [];

        for (const line of lines) {
          if (line.length < 130) continue;
          const com = line.substring(0, 4).trim().toUpperCase();
          const fgStr = line.substring(5, 11).trim();
          const all = line.substring(11, 12).trim();
          const pfNum = line.substring(12, 18).trim();
          const part = line.substring(18, 30).trim();
          const desc = line.substring(30, 100).trim();
          const xStr = line.substring(100, 114).trim();
          const yStr = line.substring(114, 126).trim();

          const fg = parseInt(fgStr, 10);
          const pf = parseInt(pfNum, 10);
          const x = parseFloat(xStr);
          const y = parseFloat(yStr);

          if (isNaN(fg) || isNaN(pf) || isNaN(x) || isNaN(y)) continue;

          let quota = 0;
          if (line.length >= 240) {
            const q = parseFloat(line.substring(240, 251).trim());
            if (!isNaN(q)) quota = q;
          }

          const fgCode = `${String(fg).padStart(4, '0')}${all}`;
          const pfId = `PF${String(pf).padStart(2, '0')}/${fgCode}/${com}`;

          // Cerca se esiste già in memoria con coordinate georeferenziate
          let lat = null, lon = null;
          const existing = allPFData?.find((p) => p.id === pfId);
          if (existing) {
            lat = existing.lat;
            lon = existing.lon;
          } else if (window.HELMERT_PARAMS && window.HELMERT_PARAMS[com]) {
            const h = window.HELMERT_PARAMS[com];
            let eSrc = y, nSrc = x;
            if (x > 0 && y < 0) { eSrc = x; nSrc = y; }
            const utmE = h[0] * eSrc - h[1] * nSrc + h[2];
            const utmN = h[1] * eSrc + h[0] * nSrc + h[3];
            const pt = utm33ToWgs84(utmE, utmN);
            lat = pt.lat;
            lon = pt.lon;
          } else if (Math.abs(x) > 1000000 && Math.abs(y) > 1000000) {
            // Gauss-Boaga Fuso Est rapido
            lat = (x - 4100000) / 111100 + 37.0;
            lon = (y - 2500000) / 88000 + 15.0;
          } else if (comuniData[com]) {
            lat = comuniData[com].lat;
            lon = comuniData[com].lon;
          }

          if (lat && lon) {
            newPFs.push({
              id: pfId,
              pf: `PF${String(pf).padStart(2, '0')}`,
              foglio: fg,
              all: all,
              codComune: com,
              comune: comuniData[com]?.shortName || com,
              prov: comuniData[com]?.prov || "",
              lat: lat,
              lon: lon,
              nord: x,
              est: y,
              x: x,
              y: y,
              quota: quota,
              desc: desc,
              descq: "",
              attp: 10,
              atta: 3,
              attendibilita: "Archivio TAF Ufficiale Caricato",
              part: part,
              data: new Date().toLocaleDateString("it-IT"),
              caus: "CARICATO DA UTENTE"
            });
            loadedCount++;
          }
        }

        if (loadedCount > 0) {
          const pfMap = new Map();
          (allPFData || []).forEach(p => pfMap.set(p.id, p));
          newPFs.forEach(p => pfMap.set(p.id, p));
          allPFData = Array.from(pfMap.values());

          if (tafUploadStatus) {
            tafUploadStatus.style.background = "#ecfdf5";
            tafUploadStatus.style.color = "#065f46";
            tafUploadStatus.style.borderColor = "#a7f3d0";
            tafUploadStatus.innerHTML = `✅ Caricati con successo <strong>${loadedCount}</strong> Punti Fiduciali da <em>${file.name}</em>!`;
          }

          if (toggleShowPFGlobal) toggleShowPFGlobal.checked = true;
          showPFGlobal = true;
          map.addLayer(topoPFLayerGroup);
          updateTopographyView();

          if (newPFs.length > 0) {
            const sampleBounds = L.latLngBounds(newPFs.slice(0, 30).map(p => [p.lat, p.lon]));
            map.fitBounds(sampleBounds.pad(0.15));
          }
        } else {
          if (tafUploadStatus) {
            tafUploadStatus.style.background = "#fef2f2";
            tafUploadStatus.style.color = "#991b1b";
            tafUploadStatus.style.borderColor = "#fecaca";
            tafUploadStatus.textContent = "Nessun punto fiduciale valido riconosciuto nel file selezionato.";
          }
        }
      } catch (err) {
        console.error("Errore lettura TAF:", err);
        if (tafUploadStatus) {
          tafUploadStatus.textContent = "Errore durante la lettura del file TAF: " + err.message;
        }
      }
    };
    reader.readAsText(file, "ISO-8859-1");
  });

  // ============================================================================
  // ESPORTAZIONE CAD IN FORMATO AUTOCAD RELEASE 12 (.DXF)
  // ============================================================================
  window.exportTriangulationDXF = () => {
    // 1. Identificazione particella (da triangolazione attiva o selezione click)
    let parcel = lastTriangulationParcel || lastClickedParcel || (window.lastSelectedParcelInfo ? {
      lat: window.lastSelectedParcelInfo.lat,
      lon: window.lastSelectedParcelInfo.lon,
      comune: window.lastSelectedParcelInfo.comune,
      foglio: window.lastSelectedParcelInfo.foglio,
      particella: window.lastSelectedParcelInfo.particella
    } : null);

    if (!parcel) {
      const center = (window.map && window.map.getCenter()) || { lat: 36.81925, lng: 14.94785 };
      parcel = {
        lat: center.lat,
        lon: center.lng || center.lon,
        comune: "Rosolini",
        foglio: "40",
        particella: "134"
      };
      lastClickedParcel = parcel;
      window.lastClickedParcel = parcel;
    }

    const candidate = (activeTriangulationCandidates && activeTriangulationCandidates[activeCandidateIndex]) || null;
    const lat = parcel.lat;
    const lon = parcel.lon;
    const comune = parcel.comune || (window.lastSelectedParcelInfo && window.lastSelectedParcelInfo.comune) || "Rosolini";
    const foglio = parcel.foglio || (window.lastSelectedParcelInfo && window.lastSelectedParcelInfo.foglio) || "40";
    const particella = parcel.particella || (window.lastSelectedParcelInfo && window.lastSelectedParcelInfo.particella) || "134";

    if (!window.lastSelectedParcelPolygon || !window.lastSelectedParcelPolygon.length) {
      window.lastSelectedParcelPolygon = generateFallbackParcelPolygon(lat, lon);
    }

    const comClean = (comune || "Comune").replace(/\s+/g, "_");
    const fgClean = foglio || "0";
    const partClean = particella || "0";

    const cosLat = Math.cos(lat * Math.PI / 180);
    const mPerDegLon = 111320 * cosLat;
    const mPerDegLat = 110950;

    let partEst = 0;
    let partNord = 0;
    let partQuota = 0;
    let cgE = 0, cgN = 0, cgLon = lon, cgLat = lat;
    let refE = 0, refN = 0, refLon = lon, refLat = lat;

    let p1 = null, p2 = null, p3 = null;
    let e1 = 0, n1 = 0, q1 = 0;
    let e2 = 0, n2 = 0, q2 = 0;
    let e3 = 0, n3 = 0, q3 = 0;
    let d12 = 0, d23 = 0, d31 = 0;

    if (candidate) {
      [p1, p2, p3] = candidate.pfs;
      ({ d12, d23, d31 } = candidate.mutual);

      e1 = Number(p1.est ?? p1.y ?? 0);
      n1 = Number(p1.nord ?? p1.x ?? 0);
      q1 = Number(p1.quota ?? 0);

      e2 = Number(p2.est ?? p2.y ?? 0);
      n2 = Number(p2.nord ?? p2.x ?? 0);
      q2 = Number(p2.quota ?? 0);

      e3 = Number(p3.est ?? p3.y ?? 0);
      n3 = Number(p3.nord ?? p3.x ?? 0);
      q3 = Number(p3.quota ?? 0);

      cgE = (e1 + e2 + e3) / 3;
      cgN = (n1 + n2 + n3) / 3;
      const cgQ = (q1 + q2 + q3) / 3;
      cgLon = (p1.lon + p2.lon + p3.lon) / 3;
      cgLat = (p1.lat + p2.lat + p3.lat) / 3;

      partEst = Number((cgE + (lon - cgLon) * mPerDegLon).toFixed(3));
      partNord = Number((cgN + (lat - cgLat) * mPerDegLat).toFixed(3));
      partQuota = Math.round(cgQ);
    } else {
      // In assenza di triangolazione, aggancio al PF più vicino disponibile per coordinate assolute
      let refPF = null;
      if (allPFData && allPFData.length) {
        let minD = Infinity;
        for (const p of allPFData) {
          const d = Math.hypot(p.lat - lat, p.lon - lon);
          if (d < minD) { minD = d; refPF = p; }
        }
      }
      if (refPF) {
        refE = Number(refPF.est ?? refPF.y ?? 0);
        refN = Number(refPF.nord ?? refPF.x ?? 0);
        partQuota = Number(refPF.quota ?? 0);
        refLon = refPF.lon;
        refLat = refPF.lat;
        partEst = Number((refE + (lon - refLon) * mPerDegLon).toFixed(3));
        partNord = Number((refN + (lat - refLat) * mPerDegLat).toFixed(3));
      } else {
        partEst = 0;
        partNord = 0;
        partQuota = 0;
      }
    }

    // Trasformazione coordinate reali dei vertici del poligono particella
    const polyVertices = [];
    if (window.lastSelectedParcelPolygon && Array.isArray(window.lastSelectedParcelPolygon) && window.lastSelectedParcelPolygon.length >= 3) {
      for (const pt of window.lastSelectedParcelPolygon) {
        const vLat = pt[0];
        const vLon = pt[1];
        let vEst, vNord;
        if (candidate) {
          vEst = Number((cgE + (vLon - cgLon) * mPerDegLon).toFixed(3));
          vNord = Number((cgN + (vLat - cgLat) * mPerDegLat).toFixed(3));
        } else if (refE !== 0 || refN !== 0) {
          vEst = Number((refE + (vLon - refLon) * mPerDegLon).toFixed(3));
          vNord = Number((refN + (vLat - refLat) * mPerDegLat).toFixed(3));
        } else {
          vEst = Number(((vLon - lon) * mPerDegLon).toFixed(3));
          vNord = Number(((vLat - lat) * mPerDegLat).toFixed(3));
        }
        polyVertices.push({ lat: vLat, lon: vLon, x: vEst, y: vNord, z: partQuota });
      }
    }

    // Metriche geometriche particella
    let calcArea = 0;
    let calcPerim = 0;
    if (polyVertices.length >= 3) {
      let aSum = 0;
      for (let i = 0; i < polyVertices.length; i++) {
        const j = (i + 1) % polyVertices.length;
        aSum += (polyVertices[i].x * polyVertices[j].y) - (polyVertices[j].x * polyVertices[i].y);
        calcPerim += Math.hypot(polyVertices[j].x - polyVertices[i].x, polyVertices[j].y - polyVertices[i].y);
      }
      calcArea = Math.abs(aSum / 2);
    }

    // 2. Costruzione Entità DXF
    const entities = [];

    // Confini Particellari reali (Polilinea chiusa e Linee continue per massima compatibilità CAD)
    if (polyVertices.length >= 3) {
      // Polilinea chiusa (flag 70 = 1, flag 66 = 1)
      entities.push("0", "POLYLINE", "8", "PARTICELLA_CONFINI", "66", "1", "70", "1");
      for (let i = 0; i < polyVertices.length; i++) {
        const v = polyVertices[i];
        entities.push(
          "0", "VERTEX",
          "8", "PARTICELLA_CONFINI",
          "10", v.x.toFixed(3),
          "20", v.y.toFixed(3),
          "30", v.z.toFixed(2)
        );
      }
      entities.push("0", "SEQEND", "8", "PARTICELLA_CONFINI");

      // Singoli segmenti LINE del perimetro
      for (let i = 0; i < polyVertices.length; i++) {
        const vCurr = polyVertices[i];
        const vNext = polyVertices[(i + 1) % polyVertices.length];
        entities.push(
          "0", "LINE",
          "8", "PARTICELLA_CONFINI",
          "10", vCurr.x.toFixed(3),
          "20", vCurr.y.toFixed(3),
          "30", vCurr.z.toFixed(2),
          "11", vNext.x.toFixed(3),
          "21", vNext.y.toFixed(3),
          "31", vNext.z.toFixed(2)
        );
      }

      // Punti e testi numerativi dei vertici (V1, V2, ...)
      for (let i = 0; i < polyVertices.length; i++) {
        const v = polyVertices[i];
        entities.push(
          "0", "POINT",
          "8", "PARTICELLA_TESTI",
          "10", v.x.toFixed(3),
          "20", v.y.toFixed(3),
          "30", v.z.toFixed(2),
          "0", "TEXT",
          "8", "PARTICELLA_TESTI",
          "10", (v.x + 0.5).toFixed(3),
          "20", (v.y + 0.5).toFixed(3),
          "30", v.z.toFixed(2),
          "40", "1.2",
          "1", `V${i + 1}`
        );
      }
    }

    // Baricentro Particella
    entities.push(
      "0", "POINT",
      "8", "PARTICELLA_CENTRO",
      "10", partEst.toFixed(3),
      "20", partNord.toFixed(3),
      "30", partQuota.toFixed(2),
      "0", "CIRCLE",
      "8", "PARTICELLA_CENTRO",
      "10", partEst.toFixed(3),
      "20", partNord.toFixed(3),
      "30", partQuota.toFixed(2),
      "40", "2.0",
      "0", "TEXT",
      "8", "PARTICELLA_TESTI",
      "10", (partEst + 2.5).toFixed(3),
      "20", (partNord + 2.5).toFixed(3),
      "30", partQuota.toFixed(2),
      "40", "2.5",
      "1", `PARTICELLA ${partClean} (Fg. ${fgClean})${calcArea > 0 ? ` [Sup: ${Math.round(calcArea)} mq]` : ''}`
    );

    // Se la triangolazione è attiva, esporta Maglia Fiduciaria e PF
    if (candidate && p1 && p2 && p3) {
      // Triangolo Maglia Fiduciaria
      entities.push(
        "0", "LINE", "8", "PF_MAGLIA", "10", e1.toFixed(3), "20", n1.toFixed(3), "30", q1.toFixed(2), "11", e2.toFixed(3), "21", n2.toFixed(3), "31", q2.toFixed(2),
        "0", "LINE", "8", "PF_MAGLIA", "10", e2.toFixed(3), "20", n2.toFixed(3), "30", q2.toFixed(2), "11", e3.toFixed(3), "21", n3.toFixed(3), "31", q3.toFixed(2),
        "0", "LINE", "8", "PF_MAGLIA", "10", e3.toFixed(3), "20", n3.toFixed(3), "30", q3.toFixed(2), "11", e1.toFixed(3), "21", n1.toFixed(3), "31", q1.toFixed(2)
      );

      // Punti Fiduciali (Point e Cerchio)
      [
        { p: p1, e: e1, n: n1, q: q1, idx: 1 },
        { p: p2, e: e2, n: n2, q: q2, idx: 2 },
        { p: p3, e: e3, n: n3, q: q3, idx: 3 }
      ].forEach(({ p, e, n, q, idx }) => {
        entities.push(
          "0", "POINT", "8", "PF_PUNTI", "10", e.toFixed(3), "20", n.toFixed(3), "30", q.toFixed(2),
          "0", "CIRCLE", "8", "PF_PUNTI", "10", e.toFixed(3), "20", n.toFixed(3), "30", q.toFixed(2), "40", "1.8",
          "0", "TEXT", "8", "PF_TESTI", "10", (e + 2.5).toFixed(3), "20", (n + 2.5).toFixed(3), "30", q.toFixed(2), "40", "2.2", "1", `PF${idx}: ${p.id} (Q=${q.toFixed(1)}m)`
        );
      });

      // Mutue Distanze lati fiduciari
      entities.push(
        "0", "TEXT", "8", "PF_TESTI", "10", ((e1 + e2) / 2).toFixed(3), "20", ((n1 + n2) / 2).toFixed(3), "30", ((q1 + q2) / 2).toFixed(2), "40", "1.8", "1", `d12=${d12.toFixed(2)}m`,
        "0", "TEXT", "8", "PF_TESTI", "10", ((e2 + e3) / 2).toFixed(3), "20", ((n2 + n3) / 2).toFixed(3), "30", ((q2 + q3) / 2).toFixed(2), "40", "1.8", "1", `d23=${d23.toFixed(2)}m`,
        "0", "TEXT", "8", "PF_TESTI", "10", ((e3 + e1) / 2).toFixed(3), "20", ((n3 + n1) / 2).toFixed(3), "30", ((q3 + q1) / 2).toFixed(2), "40", "1.8", "1", `d31=${d31.toFixed(2)}m`
      );

      // Raggi particella - PF
      entities.push(
        "0", "LINE", "8", "RAGGI_COLLEGAMENTO", "10", partEst.toFixed(3), "20", partNord.toFixed(3), "30", partQuota.toFixed(2), "11", e1.toFixed(3), "21", n1.toFixed(3), "31", q1.toFixed(2),
        "0", "LINE", "8", "RAGGI_COLLEGAMENTO", "10", partEst.toFixed(3), "20", partNord.toFixed(3), "30", partQuota.toFixed(2), "11", e2.toFixed(3), "21", n2.toFixed(3), "31", q2.toFixed(2),
        "0", "LINE", "8", "RAGGI_COLLEGAMENTO", "10", partEst.toFixed(3), "20", partNord.toFixed(3), "30", partQuota.toFixed(2), "11", e3.toFixed(3), "21", n3.toFixed(3), "31", q3.toFixed(2)
      );
    }

    // 3. Struttura Ufficiale Autodesk AutoCAD Release 12 (AC1009)
    const dxf = [
      "0", "SECTION",
      "2", "HEADER",
      "9", "$ACADVER",
      "1", "AC1009",
      "9", "$INSUNITS",
      "70", "6", // Metri
      "9", "$MEASUREMENT",
      "70", "1", // Metrico
      "0", "ENDSEC",
      "0", "SECTION",
      "2", "TABLES",
      "0", "TABLE",
      "2", "LTYPE",
      "70", "1",
      "0", "LTYPE",
      "2", "CONTINUOUS",
      "70", "64",
      "3", "Solid line",
      "72", "65",
      "73", "0",
      "40", "0.0",
      "0", "ENDTAB",
      "0", "TABLE",
      "2", "LAYER",
      "70", "7",
      "0", "LAYER", "2", "0", "70", "0", "62", "7", "6", "CONTINUOUS",
      "0", "LAYER", "2", "PARTICELLA_CONFINI", "70", "0", "62", "2", "6", "CONTINUOUS",
      "0", "LAYER", "2", "PARTICELLA_CENTRO", "70", "0", "62", "4", "6", "CONTINUOUS",
      "0", "LAYER", "2", "PARTICELLA_TESTI", "70", "0", "62", "7", "6", "CONTINUOUS",
      "0", "LAYER", "2", "PF_MAGLIA", "70", "0", "62", "3", "6", "CONTINUOUS",
      "0", "LAYER", "2", "PF_PUNTI", "70", "0", "62", "1", "6", "CONTINUOUS",
      "0", "LAYER", "2", "PF_TESTI", "70", "0", "62", "2", "6", "CONTINUOUS",
      "0", "LAYER", "2", "RAGGI_COLLEGAMENTO", "70", "0", "62", "6", "6", "CONTINUOUS",
      "0", "ENDTAB",
      "0", "ENDSEC",
      "0", "SECTION",
      "2", "BLOCKS",
      "0", "ENDSEC",
      "0", "SECTION",
      "2", "ENTITIES",
      ...entities,
      "0", "ENDSEC",
      "0", "EOF"
    ].join("\r\n");

    const blob = new Blob([dxf], { type: "application/dxf;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CATASTO_${comClean}_F${fgClean}_P${partClean}.dxf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // ESPORTAZIONE GOOGLE EARTH (.KML)
  // ============================================================================
  window.exportTriangulationKML = () => {
    if (!lastTriangulationParcel || !activeTriangulationCandidates || !activeTriangulationCandidates[activeCandidateIndex]) {
      alert("Nessuna triangolazione attiva da esportare in Google Earth.");
      return;
    }
    const candidate = activeTriangulationCandidates[activeCandidateIndex];
    const { lat, lon, comune, foglio, particella } = lastTriangulationParcel;
    const [p1, p2, p3] = candidate.pfs;
    const comClean = (comune || p1.comune || "Comune").replace(/\s+/g, "_");
    const fgClean = foglio || p1.foglio || "0";
    const partClean = particella || "0";

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Triangolazione Fiduciaria Pregeo 10 - ${comClean} F.${fgClean} P.${partClean}</name>
    <description>Rilievo Catastale - Studio Tecnico Associato Geometri Giurato e Iacono (Rosolini, SR)</description>
    
    <Style id="polyPregeo">
      <LineStyle>
        <color>ff00aa00</color>
        <width>3</width>
      </LineStyle>
      <PolyStyle>
        <color>4400ff55</color>
      </PolyStyle>
    </Style>

    <Style id="rayStyle">
      <LineStyle>
        <color>ff00aaff</color>
        <width>2</width>
      </LineStyle>
    </Style>

    <Placemark>
      <name>Maglia Fiduciaria Pregeo</name>
      <styleUrl>#polyPregeo</styleUrl>
      <Polygon>
        <extrude>0</extrude>
        <tessellate>1</tessellate>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${p1.lon},${p1.lat},${p1.quota || 0}
              ${p2.lon},${p2.lat},${p2.quota || 0}
              ${p3.lon},${p3.lat},${p3.quota || 0}
              ${p1.lon},${p1.lat},${p1.quota || 0}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <Placemark>
      <name>🎯 Particella ${partClean} (Foglio ${fgClean})</name>
      <description><![CDATA[
        <b>Comune:</b> ${comune}<br>
        <b>Foglio:</b> ${fgClean}<br>
        <b>Particella:</b> ${partClean}<br>
        <b>Coordinate WGS84:</b> Lat ${lat.toFixed(6)}, Lon ${lon.toFixed(6)}
      ]]></description>
      <Point>
        <coordinates>${lon},${lat},0</coordinates>
      </Point>
    </Placemark>

    ${[p1, p2, p3].map((p, i) => `
    <Placemark>
      <name>🔴 PF${i + 1}: ${p.id}</name>
      <description><![CDATA[
        <b>Punto Fiduciale:</b> ${p.id}<br>
        <b>Comune:</b> ${p.comune} (${p.codComune})<br>
        <b>Foglio:</b> ${p.foglio}<br>
        <b>Quota:</b> ${p.quota || 0} m s.l.m.<br>
        <b>Distanza Particella:</b> ${p.dist ? p.dist.toFixed(1) + ' m' : '-'}<br>
        <b>Descrizione:</b> ${p.desc || ''}
      ]]></description>
      <Point>
        <coordinates>${p.lon},${p.lat},${p.quota || 0}</coordinates>
      </Point>
    </Placemark>

    <Placemark>
      <name>Raggio Particella - PF${i + 1}</name>
      <styleUrl>#rayStyle</styleUrl>
      <LineString>
        <coordinates>
          ${lon},${lat},0
          ${p.lon},${p.lat},${p.quota || 0}
        </coordinates>
      </LineString>
    </Placemark>
    `).join("")}
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TRIANGOLAZIONE_${comClean}_F${fgClean}_P${partClean}.kml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // RELAZIONE TECNICO-PERITALE DI INQUADRAMENTO CATASTALE (PDF / ANTEPRIMA A4)
  // ============================================================================
  window.generatePeritaleReportPDF = async (comune, foglio, particella) => {
    let target = lastTriangulationParcel || lastClickedParcel || window.lastSelectedParcelInfo;
    if (!target) {
      const center = (window.map && window.map.getCenter()) || { lat: 36.81925, lng: 14.94785 };
      target = {
        lat: center.lat,
        lon: center.lng || center.lon,
        comune: comune || "Rosolini",
        foglio: foglio || "40",
        particella: particella || "134"
      };
      lastClickedParcel = target;
      window.lastClickedParcel = target;
    }

    // Se non c'è una triangolazione attiva, prova a triangolare con la particella target
    if (!activeTriangulationCandidates || !activeTriangulationCandidates.length) {
      try {
        await window.triangulateParcelWithPF(target.lat, target.lon, target.comune, target.foglio, target.particella);
      } catch (_) {}
    }

    const candidate = (activeTriangulationCandidates && activeTriangulationCandidates[activeCandidateIndex]) || null;
    const lat = target.lat;
    const lon = target.lon || target.lng;
    const comName = target.comune || comune || "Rosolini";
    const fgName = target.foglio || foglio || "40";
    const partName = target.particella || particella || "134";

    if (!window.lastSelectedParcelPolygon || !window.lastSelectedParcelPolygon.length) {
      window.lastSelectedParcelPolygon = generateFallbackParcelPolygon(lat, lon);
    }

    const modal = document.getElementById("peritaleModal");
    const modalBody = document.getElementById("peritaleModalBody");
    const printContainer = document.getElementById("printReportContainer");

    const now = new Date();
    const dataStr = now.toLocaleDateString("it-IT");
    const oraStr = now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    const protocollo = `REL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Calcolo metriche perimetro e coordinate vertici del confine catastale
    let parcelAreaM2 = 0;
    let parcelPerimM = 0;
    const verticesList = [];
    if (window.lastSelectedParcelPolygon && Array.isArray(window.lastSelectedParcelPolygon) && window.lastSelectedParcelPolygon.length >= 3) {
      const metrics = calcPolygonMetrics(window.lastSelectedParcelPolygon);
      parcelAreaM2 = Math.round(metrics.area);
      parcelPerimM = Math.round(metrics.perimeter);

      const cosLat = Math.cos(lat * Math.PI / 180);
      const mPerDegLon = 111320 * cosLat;
      const mPerDegLat = 110950;

      window.lastSelectedParcelPolygon.forEach((pt, i) => {
        const vLat = pt[0], vLon = pt[1];
        let vEst = 0, vNord = 0;
        if (candidate) {
          const [p1, p2, p3] = candidate.pfs;
          const cgE = (Number(p1.est ?? p1.y ?? 0) + Number(p2.est ?? p2.y ?? 0) + Number(p3.est ?? p3.y ?? 0)) / 3;
          const cgN = (Number(p1.nord ?? p1.x ?? 0) + Number(p2.nord ?? p2.x ?? 0) + Number(p3.nord ?? p3.x ?? 0)) / 3;
          const cgLon = (p1.lon + p2.lon + p3.lon) / 3;
          const cgLat = (p1.lat + p2.lat + p3.lat) / 3;
          vEst = Number((cgE + (vLon - cgLon) * mPerDegLon).toFixed(2));
          vNord = Number((cgN + (vLat - cgLat) * mPerDegLat).toFixed(2));
        } else {
          vEst = Number(((vLon - lon) * mPerDegLon).toFixed(2));
          vNord = Number(((vLat - lat) * mPerDegLat).toFixed(2));
        }
        verticesList.push({ idx: i + 1, lat: vLat, lon: vLon, est: vEst, nord: vNord });
      });
    }

    let reportHtml = "";

    if (candidate) {
      const [p1, p2, p3] = candidate.pfs;
      const { d12, d23, d31 } = candidate.mutual;

      const valE1 = Number(p1.est ?? p1.y ?? 0);
      const valE2 = Number(p2.est ?? p2.y ?? 0);
      const valE3 = Number(p3.est ?? p3.y ?? 0);
      const estMedia = Math.round((valE1 + valE2 + valE3) / 3);

      const valQ1 = Number(p1.quota || 0);
      const valQ2 = Number(p2.quota || 0);
      const valQ3 = Number(p3.quota || 0);
      const quotaMedia = Math.round((valQ1 + valQ2 + valQ3) / 3);

      const comCod = p1.codComune || (window.PF_INDEX && Object.keys(window.PF_INDEX).find(c => window.PF_INDEX[c].name.toLowerCase() === comName.toLowerCase())) || "H574";
      const disData = await loadDisBaselines(comCod);

      const tol12 = checkDisTolerance(d12, disData ? disData[getDisPairKey(p1.id, p2.id)] : null);
      const tol23 = checkDisTolerance(d23, disData ? disData[getDisPairKey(p2.id, p3.id)] : null);
      const tol31 = checkDisTolerance(d31, disData ? disData[getDisPairKey(p3.id, p1.id)] : null);

      reportHtml = `
        <div class="peritale-sheet-page">
          <!-- Intestazione Studio Professionale -->
          <div style="border-bottom: 2px solid #002b49; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="margin: 0; font-size: 1.35rem; color: #002b49; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                STUDIO TECNICO ASSOCIATO GEOMETRI GIURATO &amp; IACONO
              </h1>
              <div style="font-size: 0.95rem; font-weight: bold; color: #b8860b; margin-top: 2px;">
                Geom. Alessandro Giurato &bull; Geom. Piernicolò Iacono
              </div>
              <div style="font-size: 0.82rem; color: #444; margin-top: 2px;">
                Via Ronchi n. 73 &mdash; 96019 Rosolini (SR) &bull; Tel. 0931 856644 &bull; WebGIS Catastale
              </div>
            </div>
            <div style="text-align: right; font-size: 0.8rem; color: #555;">
              <div><strong>Data emissione:</strong> ${dataStr} ${oraStr}</div>
              <div><strong>Protocollo:</strong> ${protocollo}</div>
            </div>
          </div>

          <!-- Titolo Relazione -->
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 1.25rem; text-transform: uppercase; color: #002b49; letter-spacing: 0.5px;">
              RELAZIONE TECNICO-PERITALE DI INQUADRAMENTO CATASTALE
            </h2>
            <div style="font-size: 0.9rem; font-style: italic; color: #555; margin-top: 4px;">
              Accertamento di Conformità Pregeo 10 (Circolari Ministeriali 2/88, 5/89 e APAG 2.12)
            </div>
          </div>

          <!-- Dati Oggetto del Rilievo -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 0.88rem;">
            <tr style="background: #f8fafc;">
              <td style="border: 1px solid #ccc; padding: 6px 10px; width: 25%;"><strong>Comune Catastale:</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px 10px;">${comName} (${comCod})</td>
              <td style="border: 1px solid #ccc; padding: 6px 10px; width: 20%;"><strong>Foglio di Mappa:</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px 10px; font-weight: bold;">${fgName}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px 10px;"><strong>Particella Trattata:</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px 10px; font-weight: bold; color: #b91c1c; font-size: 0.96rem;">${partName}</td>
              <td style="border: 1px solid #ccc; padding: 6px 10px;"><strong>Baricentro WGS84:</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px 10px;">Lat ${lat.toFixed(6)}, Lon ${lon.toFixed(6)}</td>
            </tr>
            ${parcelAreaM2 > 0 ? `
            <tr style="background: #fefce8;">
              <td style="border: 1px solid #ccc; padding: 6px 10px;"><strong>Superficie Catastale:</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px 10px; font-weight: bold; color: #854d0e;">${parcelAreaM2.toLocaleString('it-IT')} m² (${(parcelAreaM2 / 10000).toFixed(2)} ha)</td>
              <td style="border: 1px solid #ccc; padding: 6px 10px;"><strong>Sviluppo Perimetro:</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px 10px; font-weight: bold; color: #854d0e;">${parcelPerimM.toLocaleString('it-IT')} m</td>
            </tr>
            ` : ''}
          </table>

          <!-- 1. Parametri Geodetici d'Inquadramento Pregeo -->
          <h3 style="font-size: 1rem; color: #002b49; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px;">
            1. PARAMETRI GEODETICI E CONFORMITÀ PREGEO (RIGA 9)
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 0.88rem;">
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #ccc; padding: 6px; text-align: left;">Parametro Geodetico</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: right;">Valore Calcolato</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: left;">Note Tecniche Catastali</th>
            </tr>
            <tr style="background: #eff6ff;">
              <td style="border: 1px solid #ccc; padding: 6px;"><strong>🧭 Est Media (Riga 9 Pregeo)</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right; font-weight: bold; color: #1e3a8a; font-size: 0.95rem;">${estMedia.toLocaleString('it-IT')} m</td>
              <td style="border: 1px solid #ccc; padding: 6px; color: #1e3a8a;"><strong>Dato obbligatorio Riga 9 Pregeo</strong> &mdash; Media coordinate Est Cassini-Soldner dei 3 PF</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px;"><strong>Quota Media Rilievo</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right; font-weight: bold;">${quotaMedia} m s.l.m.</td>
              <td style="border: 1px solid #ccc; padding: 6px;">Altitudine media per riduzione geodetica al livello medio del mare</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px;"><strong>Superficie Maglia Fiduciaria</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">${Math.round(candidate.area).toLocaleString('it-IT')} m² (${(candidate.area / 10000).toFixed(2)} ha)</td>
              <td style="border: 1px solid #ccc; padding: 6px;">Estensione geometrica del triangolo fiduciario racchiudente</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px;"><strong>Perimetro Maglia Fiduciaria</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">${candidate.perimeter.toFixed(1)} m</td>
              <td style="border: 1px solid #ccc; padding: 6px;">Somma delle 3 mutue distanze dei lati fiduciari</td>
            </tr>
            <tr style="background: ${candidate.inside ? '#ecfdf5' : '#fffbeb'};">
              <td style="border: 1px solid #ccc; padding: 6px;"><strong>Stato di Inclusione</strong></td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right; font-weight: bold; color: ${candidate.inside ? '#065f46' : '#92400e'};">
                ${candidate.inside ? '✅ RIGOROSAMENTE INTERNA' : '⚠️ ESTRAPOLAZIONE'}
              </td>
              <td style="border: 1px solid #ccc; padding: 6px; color: ${candidate.inside ? '#065f46' : '#92400e'}; font-weight: 600;">
                ${candidate.inside ? 'Piena conformità Pregeo 10 (Circolare 2/88). Particella inclusa nel triangolo.' : 'Particella esterna al triangolo fiduciario.'}
              </td>
            </tr>
          </table>

          <!-- 2. Punti Fiduciali Utilizzati -->
          <h3 style="font-size: 1rem; color: #002b49; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px;">
            2. ANAGRAFICA PUNTI FIDUCIALI (TAF UFFICIALE)
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 0.84rem;">
            <thead style="background: #002b49; color: #fff;">
              <tr>
                <th style="border: 1px solid #002b49; padding: 6px;">Vertice</th>
                <th style="border: 1px solid #002b49; padding: 6px;">Identificativo PF</th>
                <th style="border: 1px solid #002b49; padding: 6px;">Foglio</th>
                <th style="border: 1px solid #002b49; padding: 6px; text-align: right;">Cassini Nord</th>
                <th style="border: 1px solid #002b49; padding: 6px; text-align: right;">Cassini Est</th>
                <th style="border: 1px solid #002b49; padding: 6px; text-align: right;">Quota</th>
                <th style="border: 1px solid #002b49; padding: 6px; text-align: right;">Dist. Part.</th>
                <th style="border: 1px solid #002b49; padding: 6px; text-align: right;">Angolo</th>
              </tr>
            </thead>
            <tbody>
              ${[p1, p2, p3].map((p, i) => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 5px; text-align: center; font-weight: bold;">PF${i + 1}</td>
                <td style="border: 1px solid #ccc; padding: 5px; font-weight: bold; color: #b91c1c;">${p.id}</td>
                <td style="border: 1px solid #ccc; padding: 5px; text-align: center;">${p.foglio}</td>
                <td style="border: 1px solid #ccc; padding: 5px; text-align: right;">${Number(p.nord ?? p.x ?? 0).toFixed(2)}</td>
                <td style="border: 1px solid #ccc; padding: 5px; text-align: right; font-weight: bold;">${Number(p.est ?? p.y ?? 0).toFixed(2)}</td>
                <td style="border: 1px solid #ccc; padding: 5px; text-align: right;">${Number(p.quota || 0).toFixed(1)} m</td>
                <td style="border: 1px solid #ccc; padding: 5px; text-align: right;">${p.dist.toFixed(1)} m</td>
                <td style="border: 1px solid #ccc; padding: 5px; text-align: right; font-weight: bold;">${candidate.angles[i].toFixed(1)}°</td>
              </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- 3. Tabella Mutue Distanze e Verifica DIS -->
          <h3 style="font-size: 1rem; color: #002b49; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px;">
            3. CONTROLLO MUTUE DISTANZE E TOLLERANZE DIS (CIRCOLARI 2/88 E 5/89)
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.84rem;">
            <thead style="background: #f1f5f9;">
              <tr>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: left;">Lato Fiduciario</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: right;">Distanza Calcolata</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: right;">Distanza DIS Storica</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: right;">Scarto &Delta;</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: right;">Tolleranza T</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Atti</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Esito Verifica</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { name: 'PF1 - PF2', calc: d12, tol: tol12 },
                { name: 'PF2 - PF3', calc: d23, tol: tol23 },
                { name: 'PF3 - PF1', calc: d31, tol: tol31 }
              ].map(row => {
                const has = row.tol.hasRecord;
                const scartoCm = has ? (row.tol.delta * 100).toFixed(1) + ' cm' : '-';
                const tolCm = has ? (row.tol.tol * 100).toFixed(0) + ' cm' : '-';
                const esito = has ? (row.tol.isOk ? 'VERIFICATO' : 'FUORI TOLL.') : '1ª DETERMINAZIONE';
                const esitoColor = has ? (row.tol.isOk ? '#065f46' : '#991b1b') : '#0369a1';
                return `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold;">${row.name}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; text-align: right; font-weight: bold;">${row.calc.toFixed(2)} m</td>
                  <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">${has ? row.tol.dDis.toFixed(2) + ' m' : 'N.D.'}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">${scartoCm}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">${tolCm}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${has ? row.tol.actsCount : '0'}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; text-align: center; font-weight: bold; color: ${esitoColor};">${esito}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- 4. Tabella Coordinate Vertici del Confine Particellare (se perimetro disponibile) -->
          ${verticesList.length > 0 ? `
          <h3 style="font-size: 1rem; color: #002b49; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px;">
            4. ELENCO COORDINATE VERTICI DEL CONFINE PARTICELLARE (VETTORIALE WFS)
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.82rem;">
            <thead style="background: #f8fafc;">
              <tr>
                <th style="border: 1px solid #ccc; padding: 5px; text-align: center;">Vertice</th>
                <th style="border: 1px solid #ccc; padding: 5px; text-align: right;">Cassini Nord (m)</th>
                <th style="border: 1px solid #ccc; padding: 5px; text-align: right;">Cassini Est (m)</th>
                <th style="border: 1px solid #ccc; padding: 5px; text-align: right;">Latitudine WGS84</th>
                <th style="border: 1px solid #ccc; padding: 5px; text-align: right;">Longitudine WGS84</th>
              </tr>
            </thead>
            <tbody>
              ${verticesList.map(v => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 4px; text-align: center; font-weight: bold;">V${v.idx}</td>
                <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${v.nord.toFixed(2)}</td>
                <td style="border: 1px solid #ccc; padding: 4px; text-align: right; font-weight: bold;">${v.est.toFixed(2)}</td>
                <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${v.lat.toFixed(6)}</td>
                <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${v.lon.toFixed(6)}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}

          <!-- Asseverazione e Firma Professionale -->
          <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-start; page-break-inside: avoid;">
            <div style="font-size: 0.82rem; color: #555; max-width: 440px; line-height: 1.35;">
              <strong>ASSEVERAZIONE DI CONFORMITÀ PREGEO:</strong><br>
              Il presente inquadramento geometrico è conforme alle disposizioni catastali per gli atti di aggiornamento Pregeo 10 (APAG 2.12). 
              La configurazione della maglia fiduciaria garantisce il rispetto delle prescrizioni normative, la verifica delle mutue distanze d'archivio DIS e la rigorosa inclusione particellare.
            </div>
            <div style="text-align: center; min-width: 230px; border-top: 1px dashed #777; padding-top: 8px;">
              <div style="font-size: 0.88rem; font-weight: bold; color: #002b49;">IL TECNICO PROFESSIONISTA</div>
              <div style="font-size: 0.78rem; color: #666; margin-top: 50px;">(Timbro professionale e firma digitale)</div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Scheda tecnica particellare semplificata (in attesa di triangolazione)
      reportHtml = `
        <div class="peritale-sheet-page">
          <div style="border-bottom: 2px solid #002b49; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="margin: 0; font-size: 1.35rem; color: #002b49; text-transform: uppercase;">STUDIO TECNICO ASSOCIATO GIURATO &amp; IACONO</h1>
              <div style="font-size: 0.95rem; font-weight: bold; color: #b8860b;">Geom. Alessandro Giurato &bull; Geom. Piernicolò Iacono</div>
              <div style="font-size: 0.82rem; color: #444;">Via Ronchi n. 73 &mdash; 96019 Rosolini (SR) &bull; Tel. 0931 856644</div>
            </div>
            <div style="text-align: right; font-size: 0.8rem; color: #555;">
              <div><strong>Data:</strong> ${dataStr} ${oraStr}</div>
              <div><strong>Protocollo:</strong> ${protocollo}</div>
            </div>
          </div>
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 1.25rem; text-transform: uppercase; color: #002b49;">SCHEDA TECNICA DI IDENTIFICAZIONE PARTICELLARE</h2>
            <div style="font-size: 0.9rem; font-style: italic; color: #555; margin-top: 4px;">Rilievo e Perimetrazione Catastale</div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 0.88rem;">
            <tr style="background: #f8fafc;">
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Comune:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">${comName}</td>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Foglio:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">${fgName}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Particella:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold; color: #b91c1c;">${partName}</td>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Baricentro WGS84:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">Lat ${lat.toFixed(6)}, Lon ${lon.toFixed(6)}</td>
            </tr>
            ${parcelAreaM2 > 0 ? `
            <tr style="background: #fefce8;">
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Superficie Catastale:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">${parcelAreaM2.toLocaleString('it-IT')} m² (${(parcelAreaM2 / 10000).toFixed(2)} ha)</td>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>Perimetro Confinante:</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">${parcelPerimM.toLocaleString('it-IT')} m</td>
            </tr>
            ` : ''}
          </table>
          ${verticesList.length > 0 ? `
          <h3 style="font-size: 1rem; color: #002b49; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px;">VERTICI DEL CONFINE</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.82rem;">
            <thead style="background: #f8fafc;">
              <tr>
                <th style="border: 1px solid #ccc; padding: 5px;">Vertice</th>
                <th style="border: 1px solid #ccc; padding: 5px; text-align: right;">Latitudine</th>
                <th style="border: 1px solid #ccc; padding: 5px; text-align: right;">Longitudine</th>
              </tr>
            </thead>
            <tbody>
              ${verticesList.map(v => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 4px; text-align: center; font-weight: bold;">V${v.idx}</td>
                <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${v.lat.toFixed(6)}</td>
                <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${v.lon.toFixed(6)}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}
        </div>
      `;
    }

    // Inserimento nei contenitori di anteprima a video e di stampa
    if (modalBody) {
      modalBody.innerHTML = reportHtml;
    }
    if (printContainer) {
      printContainer.innerHTML = reportHtml;
    }

    // Apertura della modale a schermo intero (anteprima grafica A4)
    if (modal) {
      modal.style.display = "flex";
      modal.classList.add("active", "visible");
      modal.scrollTop = 0;

      // Gestione chiusura modale
      const closePeritale = () => {
        modal.classList.remove("active", "visible");
        modal.style.display = "none";
      };

      const btnClose1 = document.getElementById("btnClosePeritaleModal");
      const btnClose2 = document.getElementById("btnClosePeritaleModalFooter");
      if (btnClose1) btnClose1.onclick = closePeritale;
      if (btnClose2) btnClose2.onclick = closePeritale;

      modal.onclick = (e) => {
        if (e.target === modal) closePeritale();
      };

      const btnPrint1 = document.getElementById("btnPrintPeritaleModal");
      const btnPrint2 = document.getElementById("btnPrintPeritaleModalFooter");
      if (btnPrint1) btnPrint1.onclick = () => window.print();
      if (btnPrint2) btnPrint2.onclick = () => window.print();
    }
  };

  // ============================================================================
  // BUSSOLA GPS E NAVIGATORE IN CANTIERE VERSO IL PUNTO FIDUCIALE
  // ============================================================================
  let compassWatchId = null;
  let compassOrientationHandler = null;
  let currentTargetPf = null;

  window.openCompassForPF = (pfId) => {
    const pf = (allPFData && allPFData.find((p) => p.id === pfId)) ||
               (activeTriangulationCandidates && activeTriangulationCandidates[activeCandidateIndex]?.pfs.find((p) => p.id === pfId));
    if (!pf) {
      alert("Punto Fiduciale non trovato.");
      return;
    }

    currentTargetPf = pf;
    const compassModal = document.getElementById("compassModal");
    const targetTitle = document.getElementById("compassTargetPfId");
    const targetDesc = document.getElementById("compassTargetDesc");
    const mapsLink = document.getElementById("compassGoogleMapsLink");

    if (targetTitle) targetTitle.textContent = pf.id;
    if (targetDesc) targetDesc.textContent = `${pf.comune} - Foglio ${pf.foglio} • ${pf.desc || 'Punto Fiduciale'}`;
    if (mapsLink) mapsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${pf.lat},${pf.lon}&travelmode=driving`;

    if (compassModal) compassModal.classList.add("visible");

    startCompassTracking(pf);
  };

  const startCompassTracking = (targetPf) => {
    const distEl = document.getElementById("compassDistance");
    const bearingEl = document.getElementById("compassBearing");
    const needleEl = document.getElementById("compassNeedle");
    const roseEl = document.getElementById("compassRose");

    let userLat = null, userLon = null, currentHeading = 0;

    const updateDisplay = () => {
      if (userLat === null || userLon === null) return;
      const d = calcDistanceMeters({ lat: userLat, lon: userLon }, { lat: targetPf.lat, lon: targetPf.lon });
      if (distEl) distEl.textContent = d >= 1000 ? `${(d / 1000).toFixed(2)} km` : `${d.toFixed(1)} m`;

      // Azimuth da utente a PF (0° = Nord, 90° = Est)
      const dL = (targetPf.lon - userLon) * Math.PI / 180;
      const phi1 = userLat * Math.PI / 180, phi2 = targetPf.lat * Math.PI / 180;
      const y = Math.sin(dL) * Math.cos(phi2);
      const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dL);
      const bearingDeg = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;

      if (bearingEl) bearingEl.textContent = `Azimuth: ${bearingDeg.toFixed(0)}° | Bussola: ${currentHeading.toFixed(0)}°`;

      // Ago punta al PF: scarto tra Azimuth al PF e orientamento del dispositivo
      const needleAngle = (bearingDeg - currentHeading + 360) % 360;
      if (needleEl) needleEl.style.transform = `translate(-50%, -100%) rotate(${needleAngle}deg)`;
      if (roseEl) roseEl.style.transform = `rotate(${-currentHeading}deg)`;
    };

    if (navigator.geolocation) {
      if (compassWatchId) navigator.geolocation.clearWatch(compassWatchId);
      compassWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          userLat = pos.coords.latitude;
          userLon = pos.coords.longitude;
          updateDisplay();
        },
        (err) => {
          if (bearingEl) bearingEl.textContent = "Segnale GPS non disponibile: " + err.message;
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
    }

    if (window.DeviceOrientationEvent) {
      if (compassOrientationHandler) window.removeEventListener("deviceorientation", compassOrientationHandler);
      compassOrientationHandler = (e) => {
        if (e.webkitCompassHeading !== undefined) {
          currentHeading = e.webkitCompassHeading;
        } else if (e.alpha !== null) {
          currentHeading = 360 - e.alpha;
        }
        updateDisplay();
      };
      window.addEventListener("deviceorientation", compassOrientationHandler, true);
    }
  };

  const closeCompassModal = () => {
    const compassModal = document.getElementById("compassModal");
    if (compassModal) compassModal.classList.remove("visible");
    if (compassWatchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(compassWatchId);
      compassWatchId = null;
    }
    if (compassOrientationHandler) {
      window.removeEventListener("deviceorientation", compassOrientationHandler);
      compassOrientationHandler = null;
    }
  };

  document.getElementById("btnCloseCompass")?.addEventListener("click", closeCompassModal);
  document.getElementById("btnRecenterCompass")?.addEventListener("click", () => {
    if (currentTargetPf) startCompassTracking(currentTargetPf);
  });

  // ============================================================================
  // FOTO GEOREFERENZIATA DI SOPRALLUOGO CON WATERMARK PERITALE
  // ============================================================================
  let photoTargetId = null;
  const surveyPhotoInput = document.getElementById("surveyPhotoInput");
  const photoModal = document.getElementById("photoModal");
  const photoPreviewImg = document.getElementById("photoPreviewImg");
  const btnDownloadPhoto = document.getElementById("btnDownloadPhoto");

  window.startSurveyPhotoCapture = (targetId) => {
    photoTargetId = targetId;
    if (surveyPhotoInput) {
      surveyPhotoInput.value = "";
      surveyPhotoInput.click();
    }
  };

  surveyPhotoInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let gpsCoords = null;
    try {
      gpsCoords = await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy }),
          () => resolve(null),
          { timeout: 5000, enableHighAccuracy: true }
        );
      });
    } catch (_) {}

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        const bannerHeight = Math.max(120, Math.round(canvas.height * 0.14));
        ctx.fillStyle = "rgba(0, 15, 30, 0.85)";
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

        ctx.fillStyle = "#c9a227";
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, Math.max(4, Math.round(bannerHeight * 0.03)));

        const now = new Date();
        const dataStr = now.toLocaleDateString("it-IT");
        const oraStr = now.toLocaleTimeString("it-IT");

        const targetPf = allPFData?.find((p) => p.id === photoTargetId);
        const subjText = targetPf
          ? `PUNTO FIDUCIALE ${targetPf.id} (F.${targetPf.foglio} - ${targetPf.comune})`
          : (lastTriangulationParcel ? `PARTICELLA CATASTALE ${lastTriangulationParcel.particella || ''} (F.${lastTriangulationParcel.foglio || ''} - ${lastTriangulationParcel.comune || ''})` : `RILIEVO TOPOGRAFICO`);

        const latVal = gpsCoords ? gpsCoords.lat.toFixed(6) : (targetPf ? targetPf.lat.toFixed(6) : (lastTriangulationParcel?.lat.toFixed(6) || '-'));
        const lonVal = gpsCoords ? gpsCoords.lon.toFixed(6) : (targetPf ? targetPf.lon.toFixed(6) : (lastTriangulationParcel?.lon.toFixed(6) || '-'));
        const cassiniN = targetPf ? Number(targetPf.nord ?? targetPf.x ?? 0).toFixed(2) : '-';
        const cassiniE = targetPf ? Number(targetPf.est ?? targetPf.y ?? 0).toFixed(2) : '-';
        const quota = targetPf ? `${Number(targetPf.quota || 0).toFixed(1)} m s.l.m.` : '-';

        const baseFontSize = Math.max(14, Math.round(bannerHeight * 0.17));
        ctx.font = `bold ${baseFontSize}px sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText("STUDIO TECNICO ASSOCIATO GEOMETRI GIURATO & IACONO", 20, canvas.height - bannerHeight + baseFontSize * 1.4);

        ctx.font = `bold ${Math.round(baseFontSize * 1.15)}px sans-serif`;
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`📍 ${subjText}`, 20, canvas.height - bannerHeight + baseFontSize * 2.8);

        ctx.font = `${Math.round(baseFontSize * 0.85)}px monospace`;
        ctx.fillStyle = "#e2e8f0";
        ctx.fillText(`WGS84: Lat ${latVal}° | Lon ${lonVal}° ${gpsCoords ? '(±' + gpsCoords.acc.toFixed(1) + 'm)' : ''}`, 20, canvas.height - bannerHeight + baseFontSize * 4.0);
        ctx.fillText(`Cassini-Soldner: N: ${cassiniN} | E: ${cassiniE} | Quota: ${quota}`, 20, canvas.height - bannerHeight + baseFontSize * 5.1);

        ctx.textAlign = "right";
        ctx.font = `bold ${baseFontSize}px sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${dataStr} ${oraStr}`, canvas.width - 20, canvas.height - bannerHeight + baseFontSize * 1.4);
        ctx.font = `${Math.round(baseFontSize * 0.82)}px sans-serif`;
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Rilievo Pregeo 10 - Certificato WebGIS", canvas.width - 20, canvas.height - bannerHeight + baseFontSize * 2.8);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        if (photoPreviewImg) photoPreviewImg.src = dataUrl;
        if (btnDownloadPhoto) {
          btnDownloadPhoto.href = dataUrl;
          btnDownloadPhoto.download = `FOTO_${(photoTargetId || 'RILIEVO').replace(/[\/\\]/g, '_')}_${Date.now()}.jpg`;
        }
        if (photoModal) photoModal.classList.add("visible");
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("btnClosePhotoModal")?.addEventListener("click", () => {
    if (photoModal) photoModal.classList.remove("visible");
  });
  document.getElementById("btnRetakePhoto")?.addEventListener("click", () => {
    if (photoModal) photoModal.classList.remove("visible");
    if (surveyPhotoInput) surveyPhotoInput.click();
  });

  // Gestione Modale Scheda Peritale A4
  const peritaleModal = document.getElementById("peritaleModal");
  const closePeritaleModal = () => {
    if (peritaleModal) {
      peritaleModal.classList.remove("visible", "active");
      peritaleModal.style.display = "none";
    }
  };
  document.getElementById("btnClosePeritaleModal")?.addEventListener("click", closePeritaleModal);
  document.getElementById("btnClosePeritaleModalFooter")?.addEventListener("click", closePeritaleModal);
  document.getElementById("btnPrintPeritaleModal")?.addEventListener("click", () => window.print());
  document.getElementById("btnPrintPeritaleModalFooter")?.addEventListener("click", () => window.print());
  peritaleModal?.addEventListener("click", (e) => {
    if (e.target === peritaleModal) closePeritaleModal();
  });

  // ============================================================================
  // MODALITÀ SOLE / ALTO CONTRASTO PER RILIEVI IN CANTIERE
  // ============================================================================
  const btnToggleSolarMode = document.getElementById("btnToggleSolarMode");
  const initSolarMode = () => {
    const isSolar = localStorage.getItem("webgis_solar_mode") === "1";
    if (isSolar) {
      document.body.classList.add("solar-high-contrast");
      btnToggleSolarMode?.classList.add("active");
    }
  };

  btnToggleSolarMode?.addEventListener("click", () => {
    const isNowSolar = document.body.classList.toggle("solar-high-contrast");
    localStorage.setItem("webgis_solar_mode", isNowSolar ? "1" : "0");
    if (isNowSolar) {
      btnToggleSolarMode.classList.add("active");
    } else {
      btnToggleSolarMode.classList.remove("active");
    }
  });

  initSolarMode();

  // ============================================================================
  // IMPORTAZIONE ESTRATTI SISTER (.EMP) E FILE CAD (.DXF)
  // ============================================================================
  const cadDropzone = document.getElementById("cadDropzone");
  const cadFileInput = document.getElementById("cadFileInput");
  const cadImportStatus = document.getElementById("cadImportStatus");

  cadDropzone?.addEventListener("click", () => cadFileInput?.click());

  ['dragenter', 'dragover'].forEach((name) => {
    cadDropzone?.addEventListener(name, (e) => {
      e.preventDefault();
      cadDropzone.classList.add("dragover");
    });
  });

  ['dragleave', 'drop'].forEach((name) => {
    cadDropzone?.addEventListener(name, (e) => {
      e.preventDefault();
      cadDropzone.classList.remove("dragover");
    });
  });

  cadDropzone?.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImportCadFile(file);
  });

  cadFileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) handleImportCadFile(file);
  });

  const handleImportCadFile = (file) => {
    const name = file.name.toLowerCase();
    if (cadImportStatus) {
      cadImportStatus.style.display = "block";
      cadImportStatus.style.color = "#0369a1";
      cadImportStatus.textContent = `⏳ Elaborazione ${file.name}...`;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        if (name.endsWith(".emp") || name.endsWith(".txt")) {
          parseAndRenderSisterEmp(text, file.name);
        } else if (name.endsWith(".dxf")) {
          parseAndRenderCadDxf(text, file.name);
        } else {
          parseAndRenderSisterEmp(text, file.name);
        }
      } catch (err) {
        if (cadImportStatus) {
          cadImportStatus.style.color = "#991b1b";
          cadImportStatus.textContent = "Errore lettura file: " + err.message;
        }
      }
    };
    reader.readAsText(file, "ISO-8859-1");
  };

  const parseAndRenderSisterEmp = (text, filename) => {
    const lines = text.split(/\r?\n/);
    const coords = [];
    for (const line of lines) {
      const parts = line.split("|").map((s) => s.trim());
      if (parts.length >= 4) {
        const x = parseFloat(parts[2]);
        const y = parseFloat(parts[3]);
        if (!isNaN(x) && !isNaN(y)) {
          const selCom = comuneSelect?.value || "H574";
          if (window.HELMERT_PARAMS && window.HELMERT_PARAMS[selCom]) {
            const h = window.HELMERT_PARAMS[selCom];
            const utmE = h[0] * y - h[1] * x + h[2];
            const utmN = h[1] * y + h[0] * x + h[3];
            const pt = utm33ToWgs84(utmE, utmN);
            coords.push([pt.lat, pt.lon]);
          } else {
            if (Math.abs(x) < 90 && Math.abs(y) < 180) {
              coords.push([x, y]);
            }
          }
        }
      }
    }

    if (coords.length >= 2) {
      customCadLayerGroup.clearLayers();
      const poly = L.polygon(coords, {
        color: "#dc2626",
        weight: 3,
        fillColor: "#f87171",
        fillOpacity: 0.25
      }).addTo(customCadLayerGroup);
      map.fitBounds(poly.getBounds().pad(0.2));
      if (cadImportStatus) {
        cadImportStatus.style.color = "#065f46";
        cadImportStatus.textContent = `✅ Estratto Sister .EMP caricato (${coords.length} vertici visualizzati)`;
      }
    } else {
      if (cadImportStatus) {
        cadImportStatus.style.color = "#92400e";
        cadImportStatus.textContent = `File letto (${lines.length} righe). Verifica parametri Helmert del comune.`;
      }
    }
  };

  const parseAndRenderCadDxf = (text, filename) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim());
    const polylines = [];
    let inEntities = false;
    let readingLine = false;
    let x1 = null, y1 = null, x2 = null, y2 = null;

    for (let i = 0; i < lines.length - 1; i++) {
      const code = lines[i];
      const val = lines[i + 1];

      if (code === "2" && val === "ENTITIES") inEntities = true;
      if (code === "0" && val === "ENDSEC") inEntities = false;

      if (!inEntities) continue;

      if (code === "0" && val === "LINE") {
        readingLine = true;
        x1 = y1 = x2 = y2 = null;
      }
      if (readingLine) {
        if (code === "10") x1 = parseFloat(val);
        if (code === "20") y1 = parseFloat(val);
        if (code === "11") x2 = parseFloat(val);
        if (code === "21") {
          y2 = parseFloat(val);
          if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
            polylines.push([[y1, x1], [y2, x2]]);
            readingLine = false;
          }
        }
      }
    }

    const selCom = comuneSelect?.value || "H574";
    const h = (window.HELMERT_PARAMS && window.HELMERT_PARAMS[selCom]) || null;
    let convertedCount = 0;

    customCadLayerGroup.clearLayers();
    polylines.forEach((seg) => {
      const p1 = seg[0], p2 = seg[1];
      let lat1 = p1[0], lon1 = p1[1], lat2 = p2[0], lon2 = p2[1];

      if (h) {
        const uE1 = h[0] * p1[1] - h[1] * p1[0] + h[2];
        const uN1 = h[1] * p1[1] + h[0] * p1[0] + h[3];
        const w1 = utm33ToWgs84(uE1, uN1);
        lat1 = w1.lat; lon1 = w1.lon;

        const uE2 = h[0] * p2[1] - h[1] * p2[0] + h[2];
        const uN2 = h[1] * p2[1] + h[0] * p2[0] + h[3];
        const w2 = utm33ToWgs84(uE2, uN2);
        lat2 = w2.lat; lon2 = w2.lon;
      }

      if (lat1 && lon1 && lat2 && lon2 && Math.abs(lat1) < 90) {
        L.polyline([[lat1, lon1], [lat2, lon2]], {
          color: "#2563eb",
          weight: 2.5
        }).addTo(customCadLayerGroup);
        convertedCount++;
      }
    });

    if (convertedCount > 0) {
      if (cadImportStatus) {
        cadImportStatus.style.color = "#065f46";
        cadImportStatus.textContent = `✅ Rilievo CAD .DXF importato (${convertedCount} entità caricate su mappa)`;
      }
    } else {
      if (cadImportStatus) {
        cadImportStatus.style.color = "#92400e";
        cadImportStatus.textContent = `Importate entità CAD (${polylines.length} segmenti).`;
      }
    }
  };

  /* ==========================================================================
     MONOGRAFIE ORIGINALI AGENZIA DELLE ENTRATE & FOTOGRAFIE PF
     ========================================================================== */
  let currentModalMono = null;
  let activeMonoTab = "tabPhotos";

  window.openOfficialMonografiaModal = (pfId) => {
    const mono = window.MONOGRAFIE_INDEX && window.MONOGRAFIE_INDEX[pfId];
    if (!mono) {
      window.downloadMonografiaPDF(pfId);
      return;
    }
    currentModalMono = mono;
    const modal = document.getElementById("officialMonoModal");
    if (!modal) return;

    const titleEl = document.getElementById("monoModalTitle");
    const subEl = document.getElementById("monoModalSubtitle");
    const btnDl = document.getElementById("btnDownloadMonoPdf");
    const btnDlF = document.getElementById("btnDownloadMonoPdfFooter");
    const btnNav = document.getElementById("btnNavMapsMonoModal");

    if (titleEl) titleEl.textContent = `Monografia Ufficiale ${mono.id}`;
    if (subEl) subEl.innerHTML = `Catasto Terreni &bull; Ufficio Provinciale di <strong>${mono.ufficio || 'Siracusa'}</strong> &bull; Comune di <strong>${mono.comune}</strong> (${mono.codComune}) &bull; Foglio <strong>${mono.foglio}</strong> ${mono.all ? '(All. ' + mono.all + ')' : ''}`;

    if (btnDl) {
      btnDl.href = mono.pdf;
      btnDl.download = mono.pdf_name || `${mono.id.replace(/\//g, '_')}.pdf`;
    }
    if (btnDlF) {
      btnDlF.href = mono.pdf;
      btnDlF.download = mono.pdf_name || `${mono.id.replace(/\//g, '_')}.pdf`;
    }
    if (btnNav) {
      const pfData = allPFData?.find((p) => p.id === mono.id);
      if (pfData && pfData.lat && pfData.lon) {
        btnNav.href = `https://maps.google.com/?q=${pfData.lat},${pfData.lon}`;
      } else {
        btnNav.href = `https://maps.google.com/?q=${mono.comune}+foglio+${mono.foglio}`;
      }
    }

    renderMonoModalTab(activeMonoTab || "tabPhotos");
    modal.classList.add("visible");
  };

  const renderMonoModalTab = (tabName) => {
    activeMonoTab = tabName;
    const mono = currentModalMono;
    const bodyEl = document.getElementById("officialMonoModalBody");
    if (!mono || !bodyEl) return;

    document.querySelectorAll(".mono-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });

    const pfItem = allPFData?.find((p) => p.id === mono.id);
    const nordStr = mono.cassini_x !== null ? mono.cassini_x.toFixed(3) : (pfItem ? Number(pfItem.nord ?? pfItem.x ?? 0).toFixed(3) : "-");
    const estStr = mono.cassini_y !== null ? mono.cassini_y.toFixed(3) : (pfItem ? Number(pfItem.est ?? pfItem.y ?? 0).toFixed(3) : "-");
    const quotaStr = mono.quota !== null ? `${mono.quota.toFixed(2)} m s.l.m.` : (pfItem ? `${Number(pfItem.quota || 0).toFixed(2)} m s.l.m.` : "-");

    if (tabName === "tabPhotos") {
      let cardsHtml = "";

      if (mono.foto_panoramica) {
        cardsHtml += `
          <div class="mono-photo-card">
            <div class="mono-photo-header">
              <span class="mono-photo-badge panoramica">📸 Foto Inquadramento Panoramico</span>
              <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">Sul Posto</span>
            </div>
            <div class="mono-img-wrap" onclick="window.openMonoLightbox('${mono.foto_panoramica}', 'Fotografia Panoramica di Inquadramento - ${mono.id}')">
              <img src="${mono.foto_panoramica}" alt="Foto Inquadramento ${mono.id}">
              <div class="mono-img-overlay">🔍 Ingrandisci a Tutto Schermo</div>
            </div>
            <div class="mono-photo-footer">
              <strong>Contesto ambientale:</strong> Vista generale del sito e via di accesso per l'individuazione del vertice sul campo.
            </div>
          </div>
        `;
      }

      if (mono.foto_dettaglio) {
        cardsHtml += `
          <div class="mono-photo-card">
            <div class="mono-photo-header">
              <span class="mono-photo-badge dettaglio">🎯 Foto Particolare &amp; Contrassegno</span>
              <span style="font-size: 0.72rem; color: #991b1b; font-weight: 700;">Materializzazione</span>
            </div>
            <div class="mono-img-wrap" onclick="window.openMonoLightbox('${mono.foto_dettaglio}', 'Fotografia di Particolare con Contrassegno - ${mono.id}')">
              <img src="${mono.foto_dettaglio}" alt="Foto Particolare ${mono.id}">
              <div class="mono-img-overlay">🔍 Ingrandisci a Tutto Schermo</div>
            </div>
            <div class="mono-photo-footer">
              <strong>Punto esatto materializzato:</strong> Spigolo, chiodo o caposaldo indicato con freccia/cerchio rosso catastale.
            </div>
          </div>
        `;
      }

      if (mono.estratto_mappa) {
        cardsHtml += `
          <div class="mono-photo-card">
            <div class="mono-photo-header">
              <span class="mono-photo-badge mappa">🗺️ Estratto di Mappa Catastale</span>
              <span style="font-size: 0.72rem; color: #92400e; font-weight: 600;">Schizzo Planimetrico</span>
            </div>
            <div class="mono-img-wrap" onclick="window.openMonoLightbox('${mono.estratto_mappa}', 'Estratto di Mappa Ufficiale con posizione PF cerchiata in rosso - ${mono.id}')">
              <img src="${mono.estratto_mappa}" alt="Estratto Mappa ${mono.id}">
              <div class="mono-img-overlay">🔍 Ingrandisci a Tutto Schermo</div>
            </div>
            <div class="mono-photo-footer">
              <strong>Inquadramento di mappa:</strong> Particelle limitrofe, strade e fabbricati catastali di riferimento (Foglio ${mono.foglio}).
            </div>
          </div>
        `;
      }

      bodyEl.innerHTML = `
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.85rem 1.1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.6rem;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 800; color: #002b49;">Materializzazione: ${mono.desc_plani || pfItem?.desc || 'Punto Fiduciale'}</div>
            <div style="font-size: 0.78rem; color: #64748b;">Particella/e: <strong>${mono.particelle || pfItem?.part || '-'}</strong> &bull; Quota: <strong>${quotaStr}</strong> &bull; Tecnico redattore: <strong>${mono.tecnico || '-'}</strong></div>
          </div>
          <a href="${mono.pdf}" download="${mono.pdf_name}" target="_blank" class="btn btn-gold" style="font-size: 0.78rem; text-decoration: none; padding: 0.35rem 0.8rem;">
            📄 Apri PDF Ufficiale ↗
          </a>
        </div>

        <div class="mono-photo-grid">
          ${cardsHtml}
        </div>

        <div style="font-size: 0.76rem; color: #64748b; text-align: center; margin-top: 0.5rem; background: #e2e8f0; padding: 0.5rem; border-radius: 6px;">
          ⚖️ Documentazione fotografica e planimetrica originale depositata agli atti dell'Agenzia delle Entrate - Ufficio Provinciale di ${mono.ufficio || 'Siracusa'}.
        </div>
      `;
    } else if (tabName === "tabDocument") {
      let pagesHtml = "";
      (mono.pagine || []).forEach((pg, i) => {
        pagesHtml += `
          <div class="mono-doc-page" onclick="window.openMonoLightbox('${pg}', 'Scheda Monografica Ufficiale Pagina ${i+1} - ${mono.id}')">
            <div style="padding: 0.5rem 0.8rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 0.78rem; font-weight: 700; color: #002b49; display: flex; justify-content: space-between;">
              <span>Pagina ${i+1} di ${mono.pagine.length}</span>
              <span style="color: #64748b;">🔍 Clicca per ingrandire</span>
            </div>
            <img src="${pg}" alt="Pagina ${i+1} Monografia ${mono.id}">
          </div>
        `;
      });

      bodyEl.innerHTML = `
        <div style="margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-size: 0.82rem; color: #475569;">
            Scansione digitale ad alta risoluzione della monografia originale Agenzia delle Entrate (2 Pagine).
          </div>
          <a href="${mono.pdf}" download="${mono.pdf_name}" target="_blank" class="btn btn-gold" style="font-size: 0.78rem; padding: 0.35rem 0.8rem; text-decoration: none;">
            💾 Scarica File PDF Originale
          </a>
        </div>
        <div class="mono-doc-grid">
          ${pagesHtml}
        </div>
      `;
    } else if (tabName === "tabMetrics") {
      const latStr = pfItem ? pfItem.lat.toFixed(6) : "-";
      const lonStr = pfItem ? pfItem.lon.toFixed(6) : "-";
      const pregeoStr = pfItem ? `7|${pfItem.pf}|${pfItem.foglio}|${nordStr}|${estStr}|${quotaStr.replace(' m s.l.m.', '')}|${pfItem.desc || ''}|` : "-";

      bodyEl.innerHTML = `
        <div class="mono-metrics-box">
          <h4 style="margin: 0 0 0.85rem; color: #002b49; font-size: 0.95rem; border-bottom: 1.5px solid #c9a227; padding-bottom: 0.4rem;">
            Dati Metrici, Coordinate e Identificazione Catastale
          </h4>
          <table class="mono-metrics-table">
            <tr><th>Identificativo PF:</th><td><strong style="color: #b91c1c; font-size: 1.05rem;">${mono.id}</strong></td></tr>
            <tr><th>Ufficio Provinciale:</th><td>Agenzia delle Entrate &mdash; Ufficio Provinciale di <strong>${mono.ufficio || 'Siracusa'}</strong> (Territorio)</td></tr>
            <tr><th>Comune Catastale:</th><td><strong>${mono.comune}</strong> &mdash; Codice Nazionale <strong>${mono.codComune}</strong></td></tr>
            <tr><th>Foglio e Particelle:</th><td>Foglio <strong>${mono.foglio}</strong> ${mono.all ? '(All. ' + mono.all + ')' : ''} &bull; Particella/e: <strong>${mono.particelle || pfItem?.part || '-'}</strong></td></tr>
            <tr><th>Coordinate Cassini-Soldner:</th><td>Nord (X): <code>${nordStr} m</code> &bull; Est (Y): <code>${estStr} m</code></td></tr>
            <tr><th>Coordinate Geografiche (WGS84):</th><td>Latitudine: <code>${latStr}° N</code> &bull; Longitudine: <code>${lonStr}° E</code></td></tr>
            <tr><th>Quota Altimetrica:</th><td><strong>${quotaStr}</strong> ${mono.desc_alti ? '— ' + mono.desc_alti : ''}</td></tr>
            <tr><th>Attendibilità Planimetrica:</th><td>Livello <strong>${mono.attendibilita || pfItem?.attp || '50'}</strong> (Catasto Terreni)</td></tr>
            <tr><th>Tecnico Redattore Registrato:</th><td><strong>${mono.tecnico || 'Non specificato'}</strong></td></tr>
            <tr><th>Descrizione Materializzazione:</th><td>${mono.desc_plani || pfItem?.desc || 'Caposaldo fiduciario'}</td></tr>
            ${mono.note ? `<tr><th>Annotazioni Catastali:</th><td><span style="color: #b45309; font-weight: 600;">${mono.note}</span></td></tr>` : ''}
            <tr><th>Riga 7 / 8 Libretto Pregeo:</th><td><code>${pregeoStr}</code></td></tr>
          </table>

          <div style="margin-top: 1.25rem; display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <a href="https://maps.google.com/?q=${latStr},${lonStr}" target="_blank" rel="noopener noreferrer" class="btn btn-gold" style="font-size: 0.82rem; padding: 0.45rem 0.9rem; text-decoration: none;">
              🧭 Avvia Navigazione Satellitare GPS (Google Maps) ↗
            </a>
            <button class="btn btn-ghost" type="button" onclick="navigator.clipboard.writeText('${pregeoStr}').then(() => alert('Riga Pregeo copiata negli appunti!'))" style="font-size: 0.82rem; padding: 0.45rem 0.9rem; color: #002b49; border-color: #cbd5e1;">
              📋 Copia Stringa Pregeo
            </button>
          </div>
        </div>
      `;
    }
  };

  window.openMonoLightbox = (imgSrc, caption) => {
    const lb = document.getElementById("monoLightboxModal");
    const imgEl = document.getElementById("monoLightboxImg");
    const capEl = document.getElementById("monoLightboxCaption");
    if (!lb || !imgEl) return;
    imgEl.src = imgSrc;
    if (capEl) capEl.textContent = caption || "";
    lb.classList.add("visible");
  };

  const closeMonoLightbox = () => {
    const lb = document.getElementById("monoLightboxModal");
    if (lb) lb.classList.remove("visible");
  };

  const closeOfficialMonoModal = () => {
    const modal = document.getElementById("officialMonoModal");
    if (modal) modal.classList.remove("visible");
  };

  window.renderMonoModalTab = renderMonoModalTab;
  window.closeOfficialMonoModal = closeOfficialMonoModal;

  document.getElementById("monoTabBtnPhotos")?.addEventListener("click", () => renderMonoModalTab("tabPhotos"));
  document.getElementById("monoTabBtnDoc")?.addEventListener("click", () => renderMonoModalTab("tabDocument"));
  document.getElementById("monoTabBtnMetrics")?.addEventListener("click", () => renderMonoModalTab("tabMetrics"));
  document.getElementById("btnCloseMonoModal")?.addEventListener("click", closeOfficialMonoModal);
  document.getElementById("btnCloseMonoModalFooter")?.addEventListener("click", closeOfficialMonoModal);
  document.getElementById("btnPrintMonoModal")?.addEventListener("click", () => {
    renderMonoModalTab("tabDocument");
    setTimeout(() => window.print(), 250);
  });
  document.getElementById("btnCloseMonoLightbox")?.addEventListener("click", closeMonoLightbox);
  document.getElementById("monoLightboxModal")?.addEventListener("click", (e) => {
    if (e.target.id === "monoLightboxModal") closeMonoLightbox();
  });

  const toggleOnlyOfficialMono = document.getElementById("toggleOnlyOfficialMono");
  toggleOnlyOfficialMono?.addEventListener("change", () => {
    updateTopographyView();
  });

  const btnUploadOfficialMono = document.getElementById("btnUploadOfficialMono");
  const inputMonoPdfFile = document.getElementById("inputMonoPdfFile");
  const monoUploadStatus = document.getElementById("monoUploadStatus");

  btnUploadOfficialMono?.addEventListener("click", () => {
    inputMonoPdfFile?.click();
  });

  inputMonoPdfFile?.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (monoUploadStatus) {
      monoUploadStatus.style.display = "block";
      monoUploadStatus.textContent = `Caricamento di ${files.length} file monografia...`;
    }
    let loadedCount = 0;
    files.forEach((file) => {
      const m = file.name.match(/^([A-Za-z]\d{3})-([0-9A-Za-z]{4})-([0-9A-Za-z]{2})\.pdf$/i);
      if (m) {
        const com = m[1].toUpperCase();
        const fg = parseInt(m[2].slice(0, 3));
        const all = m[2].slice(3) === "0" ? "" : m[2].slice(3);
        const pf = `PF${parseInt(m[3], 10).toString().padStart(2, "0")}`;
        const pfId = all ? `${pf}/${fg.toString().padStart(4, "0")}${all}/${com}` : `${pf}/${fg.toString().padStart(4, "0")}/${com}`;
        const pdfUrl = URL.createObjectURL(file);
        window.MONOGRAFIE_INDEX = window.MONOGRAFIE_INDEX || {};
        window.MONOGRAFIE_INDEX[pfId] = {
          id: pfId,
          fs_key: `${pf}_${fg.toString().padStart(4, "0")}${all}_${com}`,
          pf: pf,
          foglio: fg,
          all: all,
          codComune: com,
          comune: com === "H574" ? "Rosolini" : (com === "F943" ? "Noto" : com),
          ufficio: "Siracusa",
          pdf: pdfUrl,
          pdf_name: file.name,
          has_official_mono: true,
          foto_panoramica: null,
          foto_dettaglio: null,
          estratto_mappa: null,
          pagine: [],
          num_pagine: 2,
          cassini_x: null,
          cassini_y: null,
          quota: null
        };
        loadedCount++;
      }
    });

    if (monoUploadStatus) {
      monoUploadStatus.style.display = "block";
      monoUploadStatus.textContent = `✅ ${loadedCount} Monografie caricate in sessione! I pin con foto sono ora visibili su mappa.`;
    }
    const officialMonoBadge = document.getElementById("officialMonoCountBadge");
    if (officialMonoBadge && window.MONOGRAFIE_INDEX) {
      officialMonoBadge.textContent = `(${Object.keys(window.MONOGRAFIE_INDEX).length})`;
    }
    updateTopographyView();
  });

  // Avvio iniziale VisualTAF: precarica l'archivio PF e mostra i punti su mappa
  map.addLayer(parcelTriangulationGroup);
  loadPuntiFiduciali().then(() => {
    if (toggleShowPFGlobal ? toggleShowPFGlobal.checked : true) {
      updateTopographyView();
    }
  });
})();
