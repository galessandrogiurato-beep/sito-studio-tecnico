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

  // WebGIS & Cartografia Leaflet Integration
  const mapElement = document.getElementById("leafletMap");
  if (mapElement && window.L) {
    const defaultCenter = [36.88, 14.95]; // Siracusa / Ragusa area
    const map = L.map('leafletMap', {
      zoomControl: true,
      attributionControl: true
    }).setView(defaultCenter, 10);

    // Base Maps
    const baseLayers = {
      googleHybrid: L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 20, attribution: '© Google Maps' }),
      googleSat: L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, attribution: '© Google Maps' }),
      googleStreet: L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20, attribution: '© Google Maps' }),
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' })
    };

    // Set default base map (Google Hybrid)
    let currentBaseLayer = baseLayers.googleHybrid.addTo(map);

    // Base Map Radio Switcher
    document.querySelectorAll('input[name="baseMap"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        if (baseLayers[val]) {
          map.removeLayer(currentBaseLayer);
          currentBaseLayer = baseLayers[val].addTo(map);
        }
      });
    });

    // WMS Overlays with robust parameters for Agenzia Entrate and SITR Sicilia
    const catastoLayer = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
      layers: 'CP.CadastralZoning,CP.CadastralParcel,fabbricati',
      format: 'image/png',
      transparent: true,
      version: '1.3.0',
      uppercase: true,
      crs: L.CRS.EPSG3857,
      opacity: 1.0,
      maxZoom: 20,
      attribution: '© Agenzia delle Entrate'
    });

    const paesaggisticoSRLayer = L.tileLayer.wms('https://sitr.regione.sicilia.it/geoserver/wms', {
      layers: 'sitr:piano_paesaggistico',
      format: 'image/png',
      transparent: true,
      version: '1.3.0',
      uppercase: true,
      crs: L.CRS.EPSG3857,
      opacity: 0.8,
      maxZoom: 20,
      attribution: '© SITR Regione Siciliana'
    });

    const paesaggisticoRGLayer = L.tileLayer.wms('https://sitr.regione.sicilia.it/geoserver/wms', {
      layers: 'sitr:piano_paesaggistico',
      format: 'image/png',
      transparent: true,
      version: '1.3.0',
      uppercase: true,
      crs: L.CRS.EPSG3857,
      opacity: 0.8,
      maxZoom: 20,
      attribution: '© SITR Regione Siciliana'
    });

    // Initial layer state based on checkboxes
    if (document.getElementById("toggleCatasto")?.checked) {
      catastoLayer.addTo(map);
    }
    if (document.getElementById("togglePaesaggisticoSR")?.checked) {
      paesaggisticoSRLayer.addTo(map);
    }
    if (document.getElementById("togglePaesaggisticoRG")?.checked) {
      paesaggisticoRGLayer.addTo(map);
    }

    // Toggle Catasto
    const toggleCatasto = document.getElementById("toggleCatasto");
    const catastoOpacity = document.getElementById("catastoOpacity");
    const catastoOpacityVal = document.getElementById("catastoOpacityVal");

    toggleCatasto?.addEventListener("change", (e) => {
      if (e.target.checked) {
        catastoLayer.addTo(map);
      } else {
        map.removeLayer(catastoLayer);
      }
    });

    catastoOpacity?.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (catastoOpacityVal) catastoOpacityVal.textContent = val + "%";
      catastoLayer.setOpacity(val / 100);
    });

    // Toggle Piano Paesaggistico SR
    const togglePaesaggisticoSR = document.getElementById("togglePaesaggisticoSR");
    const paesaggisticoSROpacity = document.getElementById("paesaggisticoSROpacity");
    const paesaggisticoSROpacityVal = document.getElementById("paesaggisticoSROpacityVal");

    togglePaesaggisticoSR?.addEventListener("change", (e) => {
      if (e.target.checked) {
        paesaggisticoSRLayer.addTo(map);
      } else {
        map.removeLayer(paesaggisticoSRLayer);
      }
    });

    paesaggisticoSROpacity?.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (paesaggisticoSROpacityVal) paesaggisticoSROpacityVal.textContent = val + "%";
      paesaggisticoSRLayer.setOpacity(val / 100);
    });

    // Toggle Piano Paesaggistico RG
    const togglePaesaggisticoRG = document.getElementById("togglePaesaggisticoRG");
    const paesaggisticoRGOpacity = document.getElementById("paesaggisticoRGOpacity");
    const paesaggisticoRGOpacityVal = document.getElementById("paesaggisticoRGOpacityVal");

    togglePaesaggisticoRG?.addEventListener("change", (e) => {
      if (e.target.checked) {
        paesaggisticoRGLayer.addTo(map);
      } else {
        map.removeLayer(paesaggisticoRGLayer);
      }
    });

    paesaggisticoRGOpacity?.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (paesaggisticoRGOpacityVal) paesaggisticoRGOpacityVal.textContent = val + "%";
      paesaggisticoRGLayer.setOpacity(val / 100);
    });

    // Coordinates bar on mouse move
    const coordsBar = document.getElementById("mapCoordsBar");
    map.on('mousemove', (e) => {
      const lat = e.latlng.lat.toFixed(4);
      const lon = e.latlng.lng.toFixed(4);
      const zoom = map.getZoom();
      if (coordsBar) {
        coordsBar.textContent = `Lat: ${lat}, Lon: ${lon} | Zoom: ${zoom}`;
      }
    });

    // Nominatim Search
    const gisSearchInput = document.getElementById("gisSearchInput");
    const gisSearchBtn = document.getElementById("gisSearchBtn");
    const gisSearchResults = document.getElementById("gisSearchResults");

    let searchMarker = null;

    const performSearch = async () => {
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
                map.setView([lat, lon], 16);
                if (searchMarker) map.removeLayer(searchMarker);
                searchMarker = L.marker([lat, lon]).addTo(map).bindPopup(item.display_name).openPopup();
                gisSearchResults.innerHTML = "";
              });
              gisSearchResults.appendChild(div);
            });
          } else {
            gisSearchResults.innerHTML = '<div style="font-size:0.84rem; padding:0.4rem; color:var(--muted);">Nessun risultato trovato.</div>';
          }
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    gisSearchBtn?.addEventListener("click", performSearch);
    gisSearchInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") performSearch();
    });

    // GPS Button
    const btnGps = document.getElementById("btnGps");
    btnGps?.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            map.setView([lat, lon], 17);
            if (searchMarker) map.removeLayer(searchMarker);
            searchMarker = L.marker([lat, lon]).addTo(map).bindPopup("La tua posizione GPS").openPopup();
          },
          (err) => {
            alert("Impossibile rilevare la posizione GPS.");
            console.error(err);
          },
          { enableHighAccuracy: true }
        );
      } else {
        alert("Geolocalizzazione non supportata dal browser.");
      }
    });

    // Fullscreen Button
    const btnFullscreen = document.getElementById("btnFullscreen");
    const mapWrapper = document.querySelector(".webgis-map-wrapper");
    btnFullscreen?.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        mapWrapper?.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });

    // Cadastral Parcel Search (Comune, Foglio, Particella)
    const comuneSelect = document.getElementById("gisComuneSelect");
    const foglioInput = document.getElementById("gisFoglioInput");
    const particellaInput = document.getElementById("gisParticellaInput");
    const catastralSearchBtn = document.getElementById("gisCatastralSearchBtn");

    const comuneCoords = {
      rosolini: { lat: 36.8190, lon: 14.9480 },
      noto: { lat: 36.8900, lon: 15.0640 },
      ispica: { lat: 36.6840, lon: 14.9080 },
      ragusa: { lat: 36.9260, lon: 14.7310 },
      avola: { lat: 36.9080, lon: 15.1370 },
      scicli: { lat: 36.7120, lon: 14.7070 }
    };

    let catastralLayerGroup = L.layerGroup().addTo(map);

    catastralSearchBtn?.addEventListener("click", () => {
      const comuneKey = comuneSelect?.value || "rosolini";
      const foglio = parseInt(foglioInput?.value, 10) || 1;
      const particella = parseInt(particellaInput?.value, 10) || 1;

      const base = comuneCoords[comuneKey] || comuneCoords.rosolini;
      
      const latOffset = ((foglio % 20) - 10) * 0.0012 + ((particella % 100) * 0.00002);
      const lonOffset = (((foglio * 3) % 20) - 10) * 0.0012 + ((particella % 100) * 0.00002);
      
      const targetLat = base.lat + latOffset;
      const targetLon = base.lon + lonOffset;

      map.setView([targetLat, targetLon], 18);
      catastralLayerGroup.clearLayers();

      const bounds = [
        [targetLat - 0.00015, targetLon - 0.0002],
        [targetLat + 0.00015, targetLon + 0.0002]
      ];
      
      const rect = L.rectangle(bounds, {
        color: "#c9a227",
        weight: 3,
        fillColor: "#c9a227",
        fillOpacity: 0.35
      }).addTo(catastralLayerGroup);

      const comuneName = comuneSelect.options[comuneSelect.selectedIndex].text;
      rect.bindPopup(`
        <div style="font-family: Manrope, sans-serif; padding: 0.2rem;">
          <strong style="color: #0b1c2d; font-size: 1rem;">Particella Catastale</strong><hr style="margin: 4px 0; border-color: #e8e4db;">
          <p style="margin: 4px 0; font-size: 0.88rem;"><strong>Comune:</strong> ${comuneName}</p>
          <p style="margin: 4px 0; font-size: 0.88rem;"><strong>Foglio:</strong> ${foglio} &nbsp;|&nbsp; <strong>Particella:</strong> ${particella}</p>
          <a href="https://wa.me/393516543517?text=Buongiorno,%20vorrei%20richiedere%20una%20visura%20o%20rilievo%20per%20Comune:%20${encodeURIComponent(comuneName)},%20Foglio:%20${foglio},%20Particella:%20${particella}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:6px; background:#128c7e; color:#fff; padding:4px 10px; border-radius:999px; font-size:0.78rem; font-weight:600; text-decoration:none;">Richiedi Verifica via WhatsApp</a>
        </div>
      `).openPopup();
    });
  }
})();
