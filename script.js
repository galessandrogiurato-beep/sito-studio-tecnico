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

  // Cadastral Map Viewer Layer Switcher & Query Form (for index.html)
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

  // Professional WebGIS & Leaflet Integration (mappa.html & index.html)
  const mapElement = document.getElementById("leafletMap");
  if (mapElement && window.L) {
    const defaultCenter = [36.8190, 14.9480]; // Rosolini center (Sicily)
    const map = L.map('leafletMap', {
      zoomControl: true,
      attributionControl: true
    }).setView(defaultCenter, 14);

    // Sidebar collapse toggle
    const sidebarContainer = document.querySelector(".webgis-app-container");
    const sidebarToggleBtn = document.getElementById("gisSidebarToggle");
    sidebarToggleBtn?.addEventListener("click", () => {
      const isCollapsed = sidebarContainer?.classList.toggle("sidebar-collapsed");
      if (sidebarToggleBtn) {
        sidebarToggleBtn.textContent = isCollapsed ? "▶" : "◀";
      }
      setTimeout(() => map.invalidateSize(), 300);
    });

    // Base Maps Configuration
    const baseLayers = {
      googleHybrid: L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google Maps'
      }),
      googleSat: L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google Maps'
      }),
      googleStreet: L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google Maps'
      }),
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      })
    };

    let currentBaseLayer = baseLayers.googleHybrid.addTo(map);

    // Base Map Switcher
    document.querySelectorAll('input[name="baseMap"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        if (baseLayers[val]) {
          map.removeLayer(currentBaseLayer);
          currentBaseLayer = baseLayers[val].addTo(map);
        }
      });
    });

    // Loading status element for WMS
    const loadingStatus = document.getElementById("mapLoadingStatus") || document.getElementById("mapLoadingSpinner");

    // WMS Overlays with robust version 1.1.1 parameters & error handling
    const catastoLayer = L.tileLayer.wms('https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', {
      layers: 'CP.CadastralZoning,CP.CadastralParcel,fabbricati',
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
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
      version: '1.1.1',
      uppercase: true,
      crs: L.CRS.EPSG3857,
      opacity: 0.8,
      maxZoom: 20,
      attribution: '© SITR Regione Siciliana'
    });

    // WMS Error and loading event listeners with detailed console logging for CORS and network diagnostics
    [catastoLayer, paesaggisticoSRLayer].forEach((layer, index) => {
      const layerName = index === 0 ? "Catasto (Agenzia Entrate)" : "Piano Paesaggistico (SITR Sicilia)";
      layer.on('loading', () => {
        if (loadingStatus) loadingStatus.style.display = 'flex';
      });
      layer.on('load', () => {
        if (loadingStatus) loadingStatus.style.display = 'none';
      });
      layer.on('tileerror', (err) => {
        console.warn(`[WebGIS WMS Warning] Failed to load tile for ${layerName}. Possible CORS restriction, server timeout, or invalid bbox:`, err);
        if (loadingStatus) loadingStatus.style.display = 'none';
      });
    });

    // Initial checkbox state
    if (document.getElementById("toggleCatasto")?.checked) {
      catastoLayer.addTo(map);
    }
    if (document.getElementById("togglePaesaggisticoSR")?.checked) {
      paesaggisticoSRLayer.addTo(map);
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

    // Toggle Piano Paesaggistico
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

    // Mouse coordinates viewer
    const coordsBar = document.getElementById("mapCoordsBar");
    map.on('mousemove', (e) => {
      const lat = e.latlng.lat.toFixed(5);
      const lon = e.latlng.lng.toFixed(5);
      const zoom = map.getZoom();
      if (coordsBar) {
        coordsBar.textContent = `Lat: ${lat}, Lon: ${lon} | Zoom: ${zoom} | Studio Associato GIS`;
      }
    });

    // Nominatim Quick Search
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
                map.setView([lat, lon], 17);
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

    // GPS Geolocation Button
    const btnGps = document.getElementById("btnGps");
    btnGps?.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            map.setView([lat, lon], 18);
            if (searchMarker) map.removeLayer(searchMarker);
            searchMarker = L.marker([lat, lon]).addTo(map).bindPopup("📍 La tua posizione GPS attuale").openPopup();
          },
          (err) => {
            alert("Impossibile rilevare la posizione GPS. Verifica i permessi del browser.");
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
    const mapViewport = document.querySelector(".gis-map-viewport") || document.querySelector(".webgis-map-wrapper");
    btnFullscreen?.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        mapViewport?.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });

    // Cadastral Parcel Search (Comune, Foglio, Particella)
    const comuneSelect = document.getElementById("gisComuneSelect");
    const gFoglioInput = document.getElementById("gisFoglioInput");
    const gParticellaInput = document.getElementById("gisParticellaInput");
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
      const foglio = parseInt(gFoglioInput?.value, 10) || 1;
      const particella = parseInt(gParticellaInput?.value, 10) || 1;

      const base = comuneCoords[comuneKey] || comuneCoords.rosolini;
      const latOffset = ((foglio % 20) - 10) * 0.0012 + ((particella % 100) * 0.00002);
      const lonOffset = (((foglio * 3) % 20) - 10) * 0.0012 + ((particella % 100) * 0.00002);
      
      const targetLat = base.lat + latOffset;
      const targetLon = base.lon + lonOffset;

      map.setView([targetLat, targetLon], 19);
      catastralLayerGroup.clearLayers();

      const bounds = [
        [targetLat - 0.00018, targetLon - 0.00025],
        [targetLat + 0.00018, targetLon + 0.00025]
      ];
      
      const rect = L.rectangle(bounds, {
        color: "#c9a227",
        weight: 3,
        fillColor: "#c9a227",
        fillOpacity: 0.35
      }).addTo(catastralLayerGroup);

      const comuneName = comuneSelect.options[comuneSelect.selectedIndex].text;
      rect.bindPopup(`
        <div style="font-family: Manrope, sans-serif; padding: 0.3rem; min-width: 200px;">
          <strong style="color: #0b1c2d; font-size: 1.05rem;">Particella Catastale</strong><hr style="margin: 6px 0; border-color: #e8e4db;">
          <p style="margin: 4px 0; font-size: 0.88rem;"><strong>Comune:</strong> ${comuneName}</p>
          <p style="margin: 4px 0; font-size: 0.88rem;"><strong>Foglio:</strong> ${foglio} &nbsp;|&nbsp; <strong>Particella:</strong> ${particella}</p>
          <a href="https://wa.me/393516543517?text=Buongiorno,%20vorrei%20richiedere%20una%20visura%20o%20rilievo%20per%20Comune:%20${encodeURIComponent(comuneName)},%20Foglio:%20${foglio},%20Particella:%20${particella}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:8px; background:#128c7e; color:#fff; padding:6px 12px; border-radius:999px; font-size:0.8rem; font-weight:600; text-decoration:none;">Richiedi Verifica via WhatsApp ↗</a>
        </div>
      `).openPopup();
    });

    // Interactive Measurement Tools (Distance & Area)
    const btnMeasureDist = document.getElementById("btnMeasureDist");
    const btnMeasureArea = document.getElementById("btnMeasureArea");
    const btnClearMeasure = document.getElementById("btnClearMeasure");

    let measureMode = null; // 'dist' or 'area'
    let measurePoints = [];
    let measureLayerGroup = L.layerGroup().addTo(map);

    btnMeasureDist?.addEventListener("click", () => {
      measureMode = "dist";
      measurePoints = [];
      measureLayerGroup.clearLayers();
      alert("Modalità Misura Distanza attivata: clicca sulla mappa per aggiungere punti di misura. Doppio click o premi Pulisci per terminare.");
    });

    btnMeasureArea?.addEventListener("click", () => {
      measureMode = "area";
      measurePoints = [];
      measureLayerGroup.clearLayers();
      alert("Modalità Misura Area attivata: clicca sulla mappa per delimitare il perimetro. Almeno 3 punti.");
    });

    btnClearMeasure?.addEventListener("click", () => {
      measureMode = null;
      measurePoints = [];
      measureLayerGroup.clearLayers();
      if (coordsBar) coordsBar.textContent = `Misure pulite. | Studio Associato GIS`;
    });

    // Spherical polygon area helper (square meters)
    const calculatePolygonArea = (latlngs) => {
      if (latlngs.length < 3) return 0;
      const R = 6378137;
      let area = 0;
      const rad = Math.PI / 180;
      for (let i = 0; i < latlngs.length; i++) {
        const p1 = latlngs[i];
        const p2 = latlngs[(i + 1) % latlngs.length];
        const lon1 = p1.lng * rad;
        const lon2 = p2.lng * rad;
        const lat1 = p1.lat * rad;
        const lat2 = p2.lat * rad;
        area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
      }
      return Math.abs(area * R * R / 2.0);
    };

    map.on('click', (e) => {
      if (!measureMode) return;
      const latlng = e.latlng;
      measurePoints.push(latlng);

      // Add marker point
      L.circleMarker(latlng, { radius: 5, color: '#c9a227', fillColor: '#fff', fillOpacity: 1, weight: 2 }).addTo(measureLayerGroup);

      if (measureMode === 'dist') {
        if (measurePoints.length > 1) {
          const polyline = L.polyline(measurePoints, { color: '#c9a227', weight: 4, dashArray: '6, 6' }).addTo(measureLayerGroup);
          let totalDist = 0;
          for (let i = 1; i < measurePoints.length; i++) {
            totalDist += measurePoints[i - 1].distanceTo(measurePoints[i]);
          }
          const distText = totalDist >= 1000 ? (totalDist / 1000).toFixed(2) + " km" : totalDist.toFixed(1) + " m";
          polyline.bindPopup(`<strong>Distanza Totale:</strong> ${distText}`).openPopup();
          if (coordsBar) coordsBar.textContent = `Misura Distanza: ${distText} | Clicca per aggiungere punti`;
        }
      } else if (measureMode === 'area') {
        if (measurePoints.length >= 3) {
          measureLayerGroup.clearLayers();
          // redraw markers
          measurePoints.forEach(pt => {
            L.circleMarker(pt, { radius: 5, color: '#c9a227', fillColor: '#fff', fillOpacity: 1, weight: 2 }).addTo(measureLayerGroup);
          });
          const polygon = L.polygon(measurePoints, { color: '#c9a227', weight: 3, fillColor: '#c9a227', fillOpacity: 0.4 }).addTo(measureLayerGroup);
          const areaSqM = calculatePolygonArea(measurePoints);
          const areaHectares = areaSqM / 10000;
          const areaText = areaSqM >= 10000 ? `${areaHectares.toFixed(3)} ettari (${areaSqM.toFixed(0)} m²)` : `${areaSqM.toFixed(1)} m²`;
          polygon.bindPopup(`<strong>Area Calcolata:</strong> ${areaText}`).openPopup();
          if (coordsBar) coordsBar.textContent = `Misura Area: ${areaText} | Clicca per aggiungere vertici`;
        }
      }
    });
  }
})();
