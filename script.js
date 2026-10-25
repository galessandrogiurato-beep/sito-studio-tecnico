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

  // Switcher Mappa base in index.html
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

  // 3. LAYER PIANO PAESAGGISTICO SITR REGIONE SICILIANA (Tile 512x512, format=png8, updateWhenIdle)
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

      return `https://map.sitr.regione.sicilia.it/gis/rest/services/piani_paesaggistici/${this._servicePath}/MapServer/export?bbox=${bbox4326}&bboxSR=4326&imageSR=3857&size=512,512&format=png8&transparent=true&f=image`;
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

  // Group 1: PP - Beni Paesaggistici (SR/RG) - zIndex: 460, opacity: 0.80
  const srBeniLayer = new SitrArcGisLayer("sr_beni_paesaggistici", { ...baseSitrOptions, zIndex: 460, opacity: 0.80, attribution: "© SITR Sicilia - PP Beni" });
  const rgBeniLayer = new SitrArcGisLayer("rg_beni_paesaggistici", { ...baseSitrOptions, zIndex: 460, opacity: 0.80, attribution: "© SITR Sicilia - PP Beni" });
  const ppBeniGroup = L.layerGroup([srBeniLayer, rgBeniLayer]);

  // Group 2: PP - Regimi Normativi / Livelli Tutela (SR/RG) - zIndex: 450, opacity: 0.75
  const srRegimiLayer = new SitrArcGisLayer("sr_regimi_normativi", { ...baseSitrOptions, zIndex: 450, opacity: 0.75, attribution: "© SITR Sicilia - PP Regimi" });
  const rgRegimiLayer = new SitrArcGisLayer("rg_regimi_normativi", { ...baseSitrOptions, zIndex: 450, opacity: 0.75, attribution: "© SITR Sicilia - PP Regimi" });
  const ppRegimiGroup = L.layerGroup([srRegimiLayer, rgRegimiLayer]);

  // Group 3: PP - Componenti del Paesaggio (SR/RG) - zIndex: 440, opacity: 0.65
  const srComponentiLayer = new SitrArcGisLayer("sr_componenti_paesaggio", { ...baseSitrOptions, zIndex: 440, opacity: 0.65, attribution: "© SITR Sicilia - PP Componenti" });
  const rgComponentiLayer = new SitrArcGisLayer("rg_componenti_paesaggio", { ...baseSitrOptions, zIndex: 440, opacity: 0.65, attribution: "© SITR Sicilia - PP Componenti" });
  const ppComponentiGroup = L.layerGroup([srComponentiLayer, rgComponentiLayer]);

  // Gestione spinner di caricamento sulle tile WMS/ArcGIS
  [catastoLayer, srBeniLayer, rgBeniLayer, srRegimiLayer, rgRegimiLayer, srComponentiLayer, rgComponentiLayer].forEach((lyr) => {
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
    srBeniLayer.setOpacity(op);
    rgBeniLayer.setOpacity(op);
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
    srRegimiLayer.setOpacity(op);
    rgRegimiLayer.setOpacity(op);
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
    srComponentiLayer.setOpacity(op);
    rgComponentiLayer.setOpacity(op);
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

  // Costruisce un URL GetFeatureInfo WMS 1.3.0 per il punto esatto cliccato (in EPSG:6706)
  const queryCatastoAtPoint = async (lat, lon) => {
    const delta = 0.00005;
    const bbox = `${(lat - delta).toFixed(7)},${(lon - delta).toFixed(7)},${(lat + delta).toFixed(7)},${(lon + delta).toFixed(7)}`;
    const gfiUrl = `https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php?language=ita&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&BBOX=${bbox}&CRS=EPSG:6706&WIDTH=101&HEIGHT=101&LAYERS=CP.CadastralParcel,CP.CadastralZoning,fabbricati&STYLES=default,default,default&FORMAT=image/png&QUERY_LAYERS=CP.CadastralParcel,CP.CadastralZoning,fabbricati&INFO_FORMAT=text/html&I=50&J=50`;

    // Proviamo anche l'endpoint JSON diretto di Geoportale AdE
    const ajaxUrl = `https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getDatiOggetto&lon=${lon}&lat=${lat}`;

    try {
      const rawAjax = await fetchWithCorsFallback(ajaxUrl);
      if (rawAjax && rawAjax.trim().startsWith("{")) {
        const json = JSON.parse(rawAjax);
        if (json && (json.NUM_PART || json.FOGLIO || json.SIGLA_PROV)) {
          return {
            tipo: json.TIPO || "Particella",
            comune: `${json.DENOM || ""} (${json.SIGLA_PROV || ""})`,
            codComune: json.COD_COMUNE || "",
            foglio: json.FOGLIO || "-",
            particella: json.NUM_PART || "-",
            allegato: json.ALLEGATO || "0",
            sviluppo: json.SVILUPPO || "0",
            geom: json.GEOM || null
          };
        }
      }
    } catch (_) {}

    // Parsing dalla risposta standard GetFeatureInfo HTML dell'Agenzia delle Entrate
    const htmlText = await fetchWithCorsFallback(gfiUrl);
    const refMatch = htmlText.match(/NationalCadastralReference[^>]*>([^<]+)</i) ||
                     htmlText.match(/([A-Z]\d{3}[A-Z_]\d{4}[A-Z0-9]{2}\.[^\s<]+)/i);
    const labelMatch = htmlText.match(/label[^>]*>([^<]+)</i);

    if (refMatch) {
      const code = refMatch[1].trim(); // es. H574_001200.345
      const codCom = code.substring(0, 4);
      const foglioNum = parseInt(code.substring(5, 9), 10) || code.substring(5, 9);
      const partNum = code.split(".")[1] || (labelMatch ? labelMatch[1].trim() : "-");
      return {
        tipo: "Particella Catastale",
        comune: `Codice Catastale ${codCom}`,
        codComune: codCom,
        foglio: foglioNum,
        particella: partNum,
        nationalRef: code
      };
    }
    return null;
  };

  map.on("click", async (e) => {
    if (measureMode) return; // Se siamo in modalità misura, non fare GetFeatureInfo

    const { lat, lng } = e.latlng;
    inspectLayerGroup.clearLayers();

    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <div style="font-family: Manrope, sans-serif; padding: 0.25rem; min-width: 210px;">
          <strong style="color: #0b1c2d;">⏳ Lettura Catasto in corso...</strong><br>
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

    try {
      const info = await queryCatastoAtPoint(lat, lng);
      if (info) {
        popup.setContent(`
          <div style="font-family: Manrope, sans-serif; padding: 0.3rem; min-width: 230px;">
            <strong style="color: #0b1c2d; font-size: 1rem;">📋 ${info.tipo}</strong>
            <hr style="margin: 6px 0; border-color: #e8e4db;">
            <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Comune:</strong> ${info.comune}</p>
            <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Foglio:</strong> ${info.foglio} &nbsp;|&nbsp; <strong>Particella:</strong> <span style="background:#fef3c7; padding:1px 6px; border-radius:4px; font-weight:700;">${info.particella}</span></p>
            <p style="margin: 3px 0; font-size: 0.78rem; color: #5b6570;">Coord: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Buongiorno, vorrei richiedere una visura/rilievo per:\nComune: ${info.comune}\nFoglio: ${info.foglio}\nParticella:${info.particella}\nCoordinate: ${lat.toFixed(6)},${lng.toFixed(6)}`)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:8px; background:#128c7e; color:#fff; padding:6px 12px; border-radius:999px; font-size:0.78rem; font-weight:600; text-decoration:none;">Richiedi Visura su WhatsApp ↗</a>
          </div>
        `);
      } else {
        popup.setContent(`
          <div style="font-family: Manrope, sans-serif; padding: 0.3rem; min-width: 210px;">
            <strong style="color: #0b1c2d; font-size: 0.95rem;">📍 Punto Georeferenziato</strong>
            <hr style="margin: 6px 0; border-color: #e8e4db;">
            <p style="margin: 3px 0; font-size: 0.82rem;"><strong>Lat:</strong> ${lat.toFixed(6)}<br><strong>Lon:</strong> ${lng.toFixed(6)}</p>
            <p style="margin: 4px 0; font-size: 0.76rem; color: #5b6570;">Fai zoom a livello 18+ e clicca dentro il perimetro di una particella per i dati catastali.</p>
          </div>
        `);
      }
    } catch (_) {
      popup.setContent(`
        <div style="font-family: Manrope, sans-serif; padding: 0.3rem; min-width: 210px;">
          <strong style="color: #0b1c2d; font-size: 0.95rem;">📍 Coordinate Punto</strong>
          <hr style="margin: 6px 0; border-color: #e8e4db;">
          <p style="margin: 3px 0; font-size: 0.82rem;"><strong>Lat:</strong> ${lat.toFixed(6)}<br><strong>Lon:</strong> ${lng.toFixed(6)}</p>
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Buongiorno, invio coordinate punto da verificare: ${lat.toFixed(6)},${lng.toFixed(6)}`)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:6px; background:#128c7e; color:#fff; padding:5px 10px; border-radius:999px; font-size:0.78rem; font-weight:600; text-decoration:none;">Invia posizione su WhatsApp ↗</a>
        </div>
      `);
    }
  });

  // ============================================================================
  // 5. RICERCA CATASTALE REALE PER COMUNE, FOGLIO E PARTICELLA (Con supporto file:// e hyparquet)
  // ============================================================================
  const comuneSelect = document.getElementById("gisComuneSelect");
  const gFoglioInput = document.getElementById("gisFoglioInput");
  const gParticellaInput = document.getElementById("gisParticellaInput");
  const catastralSearchBtn = document.getElementById("gisCatastralSearchBtn");
  const catastralSearchStatus = document.getElementById("catastralSearchStatus");

  const comuniData = {
    H574: { name: "Rosolini (SR)", lat: 36.81925, lon: 14.94785 },
    F943: { name: "Noto (SR)", lat: 36.89110, lon: 15.07040 },
    E366: { name: "Ispica (RG)", lat: 36.78520, lon: 14.90680 },
    F258: { name: "Modica (RG)", lat: 36.86040, lon: 14.76060 },
    H163: { name: "Ragusa (RG)", lat: 36.92550, lon: 14.72550 },
    A522: { name: "Avola (SR)", lat: 36.90820, lon: 15.13550 },
    I535: { name: "Scicli (RG)", lat: 36.79250, lon: 14.70680 },
    G224: { name: "Pachino (SR)", lat: 36.71800, lon: 15.09060 },
    G923: { name: "Pozzallo (RG)", lat: 36.73030, lon: 14.84680 },
    I754: { name: "Siracusa (SR)", lat: 37.06630, lon: 15.28560 }
  };

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
      <div style="font-family: Manrope, sans-serif; padding: 0.3rem; min-width: 240px;">
        <strong style="color: #0b1c2d; font-size: 1rem;">🎯 Localizzazione Catastale</strong>
        <hr style="margin: 6px 0; border-color: #e8e4db;">
        <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Comune:</strong> ${comuneInfo.name}</p>
        <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Foglio:</strong> ${foglioRaw} &nbsp;|&nbsp; <strong>Particella:</strong> <span style="background:#fef3c7; padding:1px 6px; border-radius:4px; font-weight:700;">${particellaRaw || 'Intero Foglio'}</span></p>
        <p style="margin: 3px 0; font-size: 0.78rem; color: #5b6570;">Coordinate: ${lat.toFixed(6)}, ${lon.toFixed(6)} (${matchType})</p>
        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Buongiorno, vorrei richiedere una visura / rilievo per:\nComune: ${comuneInfo.name} (${codComune})\nFoglio: ${foglioRaw}\nParticella: ${particellaRaw || 'Intero Foglio'}\nCoordinate: ${lat.toFixed(6)}, ${lon.toFixed(6)}`)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:8px; background:#128c7e; color:#fff; padding:6px 12px; border-radius:999px; font-size:0.78rem; font-weight:600; text-decoration:none;">Richiedi Visura su WhatsApp ↗</a>
      </div>
    `).openPopup();

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
})();