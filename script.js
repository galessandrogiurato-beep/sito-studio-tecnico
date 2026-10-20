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

  // Gestione Form Contatti (index.html)
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!status) return;
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

  // 1. MAPPE DI BASE (Con maxNativeZoom 20 e maxZoom 21 per zoom catastale spinto)
  const baseLayers = {
    googleHybrid: L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      maxNativeZoom: 20,
      maxZoom: 21,
      attribution: "© Google Maps"
    }),
    googleSat: L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
      maxNativeZoom: 20,
      maxZoom: 21,
      attribution: "© Google Maps"
    }),
    googleStreet: L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
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

  // 2. LAYER CATASTO AGENZIA DELLE ENTRATE (Conversione nativa EPSG:6706 per ciascuna Tile)
  const CatastoAdELayer = L.TileLayer.extend({
    getTileUrl: function (coords) {
      const nwLon = tile2lon(coords.x, coords.z);
      const nwLat = tile2lat(coords.y, coords.z);
      const seLon = tile2lon(coords.x + 1, coords.z);
      const seLat = tile2lat(coords.y + 1, coords.z);

      // In WMS 1.3.0 con CRS=EPSG:6706 l'ordine degli assi obbligatorio è: minLat,minLon,maxLat,maxLon
      const bbox = `${seLat.toFixed(7)},${nwLon.toFixed(7)},${nwLat.toFixed(7)},${seLon.toFixed(7)}`;

      const params = [
        "language=ita",
        "service=WMS",
        "version=1.3.0",
        "request=GetMap",
        `bbox=${bbox}`,
        "crs=EPSG:6706",
        "width=256",
        "height=256",
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
    minZoom: 6,
    opacity: 0.95,
    zIndex: 600,
    attribution: "© Agenzia delle Entrate - Cartografia Catastale CC-BY 4.0"
  });

  // 3. LAYER PIANO PAESAGGISTICO SITR REGIONE SICILIANA (ArcGIS REST MapServer Export PNG32)
  // Supporta Componenti, Regimi Normativi e Beni Paesaggistici per Siracusa (SR) e Ragusa (RG)
  const SitrArcGisLayer = L.TileLayer.extend({
    initialize: function (servicePath, options) {
      this._servicePath = servicePath;
      L.TileLayer.prototype.initialize.call(this, "", options);
    },
    getTileUrl: function (coords) {
      const nwLon = tile2lon(coords.x, coords.z);
      const nwLat = tile2lat(coords.y, coords.z);
      const seLon = tile2lon(coords.x + 1, coords.z);
      const seLat = tile2lat(coords.y + 1, coords.z);
      const bbox4326 = `${nwLon.toFixed(7)},${seLat.toFixed(7)},${seLon.toFixed(7)},${nwLat.toFixed(7)}`;

      return `https://map.sitr.regione.sicilia.it/gis/rest/services/piani_paesaggistici/${this._servicePath}/MapServer/export?bbox=${bbox4326}&bboxSR=4326&imageSR=3857&size=256,256&format=png32&transparent=true&f=image`;
    }
  });

  // Provincia di Siracusa (Componenti, Regimi Normativi e Beni Paesaggistici)
  const srComponentiLayer = new SitrArcGisLayer("sr_componenti_paesaggio", { maxZoom: 21, opacity: 0.6, zIndex: 450, attribution: "© SITR Sicilia - PP Siracusa" });
  const srRegimiLayer = new SitrArcGisLayer("sr_regimi_normativi", { maxZoom: 21, opacity: 0.6, zIndex: 450, attribution: "© SITR Sicilia - PP Siracusa" });
  const srBeniLayer = new SitrArcGisLayer("sr_beni_paesaggistici", { maxZoom: 21, opacity: 0.7, zIndex: 450, attribution: "© SITR Sicilia - PP Siracusa" });
  const paesaggisticoSRGroup = L.layerGroup([srComponentiLayer, srRegimiLayer, srBeniLayer]);

  // Provincia di Ragusa (Componenti, Regimi Normativi e Beni Paesaggistici)
  const rgComponentiLayer = new SitrArcGisLayer("rg_componenti_paesaggio", { maxZoom: 21, opacity: 0.6, zIndex: 450, attribution: "© SITR Sicilia - PP Ragusa" });
  const rgRegimiLayer = new SitrArcGisLayer("rg_regimi_normativi", { maxZoom: 21, opacity: 0.6, zIndex: 450, attribution: "© SITR Sicilia - PP Ragusa" });
  const rgBeniLayer = new SitrArcGisLayer("rg_beni_paesaggistici", { maxZoom: 21, opacity: 0.7, zIndex: 450, attribution: "© SITR Sicilia - PP Ragusa" });
  const paesaggisticoRGGroup = L.layerGroup([rgComponentiLayer, rgRegimiLayer, rgBeniLayer]);

  // Gestione spinner di caricamento sulle tile WMS/ArcGIS
  [catastoLayer, srBeniLayer, rgBeniLayer].forEach((lyr) => {
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

  // Toggle Piano Paesaggistico Siracusa
  const togglePaesaggisticoSR = document.getElementById("togglePaesaggisticoSR");
  const paesaggisticoSROpacity = document.getElementById("paesaggisticoSROpacity");
  const paesaggisticoSROpacityVal = document.getElementById("paesaggisticoSROpacityVal");

  if (togglePaesaggisticoSR?.checked) {
    paesaggisticoSRGroup.addTo(map);
  }

  togglePaesaggisticoSR?.addEventListener("change", (e) => {
    if (e.target.checked) {
      paesaggisticoSRGroup.addTo(map);
    } else {
      map.removeLayer(paesaggisticoSRGroup);
    }
  });

  paesaggisticoSROpacity?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (paesaggisticoSROpacityVal) paesaggisticoSROpacityVal.textContent = `${val}%`;
    const op = val / 100;
    srComponentiLayer.setOpacity(op);
    srRegimiLayer.setOpacity(op);
    srBeniLayer.setOpacity(op);
  });

  // Toggle Piano Paesaggistico Ragusa
  const togglePaesaggisticoRG = document.getElementById("togglePaesaggisticoRG");
  const paesaggisticoRGOpacity = document.getElementById("paesaggisticoRGOpacity");
  const paesaggisticoRGOpacityVal = document.getElementById("paesaggisticoRGOpacityVal");

  if (togglePaesaggisticoRG?.checked) {
    paesaggisticoRGGroup.addTo(map);
  }

  togglePaesaggisticoRG?.addEventListener("change", (e) => {
    if (e.target.checked) {
      paesaggisticoRGGroup.addTo(map);
    } else {
      map.removeLayer(paesaggisticoRGGroup);
    }
  });

  paesaggisticoRGOpacity?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (paesaggisticoRGOpacityVal) paesaggisticoRGOpacityVal.textContent = `${val}%`;
    const op = val / 100;
    rgComponentiLayer.setOpacity(op);
    rgRegimiLayer.setOpacity(op);
    rgBeniLayer.setOpacity(op);
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
  // 5. RICERCA CATASTALE REALE PER COMUNE, FOGLIO E PARTICELLA
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

  catastralSearchBtn?.addEventListener("click", async () => {
    const codComune = comuneSelect?.value || "H574";
    const foglioRaw = (gFoglioInput?.value || "").trim();
    const particellaRaw = (gParticellaInput?.value || "").trim();
    const comuneInfo = comuniData[codComune] || comuniData.H574;

    if (!foglioRaw) {
      alert("Inserisci almeno il numero di Foglio catastale.");
      return;
    }

    const foglioPadded = foglioRaw.padStart(4, "0");
    const inspireZoningRef = `${codComune}_${foglioPadded}00`;
    const inspireParcelRef = particellaRaw ? `${inspireZoningRef}.${particellaRaw}` : inspireZoningRef;

    if (catastralSearchStatus) {
      catastralSearchStatus.style.display = "block";
      catastralSearchStatus.textContent = `⏳ Ricerca ${inspireParcelRef} sui server catastali...`;
    }

    inspectLayerGroup.clearLayers();
    let foundCoords = null;

    // 1. Tentativo interrogazione diretta API / WFS Agenzia delle Entrate per codice catastale nazionale
    try {
      const wfsUrl = `https://wfs.cartografia.agenziaentrate.gov.it/inspire/wfs/owfs01.php?service=WFS&version=2.0.0&request=GetFeature&typeNames=CP:CadastralParcel&Filter=${encodeURIComponent(`<Filter><PropertyIsEqualTo><PropertyName>nationalCadastralReference</PropertyName><Literal>${inspireParcelRef}</Literal></PropertyIsEqualTo></Filter>`)}`;
      const wfsResponse = await fetchWithCorsFallback(wfsUrl);

      // Estrazione coordinate GML <gml:pos> o <gml:posList> o <gml:lowerCorner> (in EPSG:6706: Lat Lon)
      const posMatch = wfsResponse.match(/<gml:posList[^>]*>([\d.\s]+)<\/gml:posList>/i) ||
                       wfsResponse.match(/<gml:pos[^>]*>([\d.\s]+)<\/gml:pos>/i);
      if (posMatch) {
        const nums = posMatch[1].trim().split(/\s+/).map(Number);
        if (nums.length >= 2 && nums[0] > 35 && nums[0] < 48) {
          // Ricava tutti i vertici del poligono della particella!
          const polygonLatLngs = [];
          for (let i = 0; i < nums.length - 1; i += 2) {
            polygonLatLngs.push([nums[i], nums[i + 1]]);
          }
          const poly = L.polygon(polygonLatLngs, {
            color: "#d97706",
            weight: 3,
            fillColor: "#fbbf24",
            fillOpacity: 0.35
          }).addTo(inspectLayerGroup);

          map.fitBounds(poly.getBounds(), { maxZoom: 19 });
          foundCoords = poly.getBounds().getCenter();

          poly.bindPopup(`
            <div style="font-family: Manrope, sans-serif; padding: 0.3rem; min-width: 220px;">
              <strong style="color: #0b1c2d; font-size: 1rem;">✅ Particella Individuata</strong>
              <hr style="margin: 6px 0; border-color: #e8e4db;">
              <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Comune:</strong> ${comuneInfo.name}</p>
              <p style="margin: 3px 0; font-size: 0.86rem;"><strong>Foglio:</strong> ${foglioRaw} &nbsp;|&nbsp; <strong>Particella:</strong> ${particellaRaw}</p>
              <p style="margin: 3px 0; font-size: 0.76rem; color: #5b6570;">Codice INSPIRE: ${inspireParcelRef}</p>
              <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Buongiorno, richiedo verifica per:\nComune: ${comuneInfo.name}\nFoglio: ${foglioRaw}\nParticella:${particellaRaw}`)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:8px; background:#128c7e; color:#fff; padding:6px 12px; border-radius:999px; font-size:0.78rem; font-weight:600; text-decoration:none;">Richiedi Visura via WhatsApp ↗</a>
            </div>
          `).openPopup();
        }
      }
    } catch (_) {}

    // 2. Se il server WFS dell'AdE applica filtro anti-bot/CAPTCHA, centra il Comune ad alto zoom con il layer WMS catastale attivo
    if (!foundCoords) {
      if (toggleCatasto && !toggleCatasto.checked) {
        toggleCatasto.checked = true;
        catastoLayer.addTo(map);
      }
      map.setView([comuneInfo.lat, comuneInfo.lon], 18);

      L.popup()
        .setLatLng([comuneInfo.lat, comuneInfo.lon])
        .setContent(`
          <div style="font-family: Manrope, sans-serif; padding: 0.3rem; min-width: 230px;">
            <strong style="color: #0b1c2d; font-size: 0.98rem;">🗺️ Catasto ${comuneInfo.name} Attivo</strong>
            <hr style="margin: 6px 0; border-color: #e8e4db;">
            <p style="margin: 4px 0; font-size: 0.84rem;">Ricerca richiesta: <strong>Foglio ${foglioRaw}</strong> ${particellaRaw ? `| <strong>Part. ${particellaRaw}</strong>` : ""}</p>
            <p style="margin: 4px 0; font-size: 0.78rem; color: #5b6570;">I confini e i numeri delle particelle dell'Agenzia delle Entrate sono ora visibili in sovrapposizione. Clicca su qualsiasi particella per leggerne i dati in tempo reale.</p>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Buongiorno, vorrei richiedere un estratto di mappa / visura per:\nComune: ${comuneInfo.name} (${codComune})\nFoglio: ${foglioRaw}\nParticella:${particellaRaw || "intero foglio"}`)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:8px; background:#128c7e; color:#fff; padding:6px 12px; border-radius:999px; font-size:0.78rem; font-weight:600; text-decoration:none;">Richiedi Visura su WhatsApp ↗</a>
          </div>
        `)
        .openOn(map);
    }

    if (catastralSearchStatus) {
      catastralSearchStatus.textContent = `✅ Mappa catastale centrata (${inspireParcelRef})`;
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
})();