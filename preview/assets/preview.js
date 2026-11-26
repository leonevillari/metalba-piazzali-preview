/**
 * Anteprima statica Piazzali — nessun Supabase, dati demo in-page.
 * Allinea siti / seed / campi etichetta Aluminium Bozen all’app React.
 */
;(function () {
  'use strict'

  // —— Geo affine (come src/geo/transform.ts) ————————————————
  function solveLinearSystem(A, b) {
    const n = b.length
    const M = A.map((row, i) => [...row, b[i]])
    for (let col = 0; col < n; col++) {
      let pivot = col
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r
      }
      ;[M[col], M[pivot]] = [M[pivot], M[col]]
      const div = M[col][col]
      if (Math.abs(div) < 1e-14) throw new Error('Sistema singolare GCP')
      for (let j = col; j <= n; j++) M[col][j] /= div
      for (let r = 0; r < n; r++) {
        if (r === col) continue
        const f = M[r][col]
        for (let j = col; j <= n; j++) M[r][j] -= f * M[col][j]
      }
    }
    return M.map((row) => row[n])
  }

  function fitAffine(points) {
    const AtA_lon = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const Atb_lon = [0, 0, 0]
    const AtA_lat = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const Atb_lat = [0, 0, 0]
    for (const p of points) {
      const row = [p.pixel.x, p.pixel.y, 1]
      for (let i = 0; i < 3; i++) {
        Atb_lon[i] += row[i] * p.lon
        Atb_lat[i] += row[i] * p.lat
        for (let j = 0; j < 3; j++) {
          AtA_lon[i][j] += row[i] * row[j]
          AtA_lat[i][j] += row[i] * row[j]
        }
      }
    }
    const [a, b, c] = solveLinearSystem(AtA_lon, Atb_lon)
    const [d, e, f] = solveLinearSystem(AtA_lat, Atb_lat)
    return { a, b, c, d, e, f }
  }

  function wgs84ToPixel(geo, params) {
    const { a, b, c, d, e, f } = params
    const det = a * e - b * d
    const lon0 = geo.lon - c
    const lat0 = geo.lat - f
    return {
      x: (e * lon0 - b * lat0) / det,
      y: (-d * lon0 + a * lat0) / det,
    }
  }

  function createTransform(points) {
    const affine = fitAffine(points)
    return {
      wgs84ToPixel: (g) => wgs84ToPixel(g, affine),
    }
  }

  // —— Siti (src/config/sites.ts + gcp*) ————————————————
  const BOLZANO_GCP = [
    { lat: 46.474555, lon: 11.328903, pixel: { x: 95, y: 1720 } },
    { lat: 46.476127, lon: 11.328903, pixel: { x: 90, y: 160 } },
    { lat: 46.475993, lon: 11.330533, pixel: { x: 780, y: 220 } },
    { lat: 46.475364, lon: 11.328707, pixel: { x: 70, y: 950 } },
    { lat: 46.4746, lon: 11.330599, pixel: { x: 790, y: 1680 } },
  ]

  const BASSANO_GCP = [
    { lat: 45.761588, lon: 11.713525, pixel: { x: 212, y: 913 } },
    { lat: 45.762576, lon: 11.713345, pixel: { x: 175, y: 105 } },
    { lat: 45.761884, lon: 11.714658, pixel: { x: 1445, y: 615 } },
    { lat: 45.762181, lon: 11.713113, pixel: { x: 70, y: 515 } },
    { lat: 45.761525, lon: 11.714504, pixel: { x: 1385, y: 900 } },
  ]

  const FORTOGNA_GCP = [
    { lat: 46.233228, lon: 12.29, pixel: { x: 230, y: 240 } },
    { lat: 46.233299, lon: 12.291234, pixel: { x: 1160, y: 170 } },
    { lat: 46.232824, lon: 12.29, pixel: { x: 230, y: 640 } },
    { lat: 46.232804, lon: 12.291234, pixel: { x: 1160, y: 660 } },
    { lat: 46.233375, lon: 12.291764, pixel: { x: 1560, y: 95 } },
  ]

  const SITES = {
    bolzano: {
      id: 'bolzano',
      brandId: 'aluminium-bozen',
      label: 'Piazzale Bozen',
      shortLabel: 'Bozen',
      addressShort: 'Via Toni Ebner 24, Bolzano',
      map: {
        src: './assets/bolzano-aerial.jpg',
        width: 845,
        height: 1860,
      },
      transform: createTransform(BOLZANO_GCP),
    },
    bassano: {
      id: 'bassano',
      brandId: 'metalba',
      label: 'Piazzale Metalba',
      shortLabel: 'Bassano',
      addressShort: 'Viale Vicenza 71, Bassano del Grappa',
      map: {
        src: './assets/bassano-aerial.jpg',
        width: 1515,
        height: 1038,
      },
      transform: createTransform(BASSANO_GCP),
    },
    fortogna: {
      id: 'fortogna',
      brandId: 'metalba',
      label: 'Fonderia Fortogna',
      shortLabel: 'Fortogna',
      addressShort: 'Via Fortogna 188/A, Fortogna BL',
      map: {
        src: './assets/fortogna-aerial.jpg',
        width: 1646,
        height: 956,
      },
      transform: createTransform(FORTOGNA_GCP),
    },
  }

  const BRAND_DEFAULT_SITE = {
    'aluminium-bozen': 'bolzano',
    metalba: 'bassano',
  }

  // —— Seed billette (store + campi etichetta Aluminium Bozen) ———
  const BILLETS = [
    {
      id: 'bil-001',
      code: 'BIL-001',
      orderCode: '2026/450',
      customerName: 'Acciai Alto Adige S.p.A.',
      alloy: '2007',
      cut: 'Segato',
      diameter: '305',
      length: '1250',
      lotto: '26/1962/7/26313E',
      colata: '26313E',
      pezzi: '4',
      catasta: '22657457',
      lordoKg: '968',
      nettoKg: '918',
      siteId: 'bolzano',
      status: 'piazzale',
      position: { lat: 46.4751, lon: 11.32895 },
    },
    {
      id: 'bil-002',
      code: 'BIL-002',
      orderCode: '2026/451',
      customerName: 'Cliente Bolzano Demo',
      alloy: '6082',
      cut: 'Troncatura',
      diameter: '120',
      length: '4500',
      lotto: '26/1880/3/25110A',
      colata: '25110A',
      pezzi: '6',
      catasta: '22651002',
      lordoKg: '412',
      nettoKg: '388',
      siteId: 'bolzano',
      status: 'piazzale',
      position: { lat: 46.4754, lon: 11.32905 },
    },
    {
      id: 'bil-003',
      code: 'BIL-003',
      orderCode: '2026/452',
      customerName: 'Aluminium Bozen Cliente demo',
      alloy: '7075',
      cut: 'Segato',
      diameter: '280',
      length: '12000',
      lotto: '26/2011/1/27001B',
      colata: '27001B',
      pezzi: '2',
      catasta: '22658890',
      lordoKg: '2150',
      nettoKg: '2080',
      siteId: 'bolzano',
      status: 'piazzale',
      position: { lat: 46.4749, lon: 11.3292 },
    },
    {
      id: 'bil-004',
      code: 'BIL-004',
      orderCode: '2026/460',
      customerName: 'Profilati Isarco S.r.l.',
      alloy: '6063',
      cut: 'Segato',
      diameter: '203',
      length: '3000',
      lotto: '26/1755/5/24990C',
      colata: '24990C',
      pezzi: '8',
      catasta: '22650111',
      lordoKg: '640',
      nettoKg: '605',
      siteId: 'bolzano',
      status: 'piazzale',
      position: null,
    },
    {
      id: 'bil-bas-ph1',
      code: 'PH-BAS-001',
      orderCode: 'PLACEHOLDER/BAS',
      customerName: 'PLACEHOLDER — billetta demo Bassano (non reale)',
      alloy: '6082',
      cut: 'Segato',
      diameter: '203',
      length: '3000',
      lotto: 'PLACEHOLDER',
      colata: '—',
      pezzi: '1',
      catasta: '—',
      lordoKg: '—',
      nettoKg: '—',
      siteId: 'bassano',
      status: 'piazzale',
      position: { lat: 45.76205, lon: 11.7139 },
    },
    {
      id: 'bil-bas-ph2',
      code: 'PH-BAS-002',
      orderCode: 'PLACEHOLDER/BAS',
      customerName: 'PLACEHOLDER — billetta demo Bassano (non reale)',
      alloy: '6060',
      cut: 'Troncatura',
      diameter: '178',
      length: '4500',
      lotto: 'PLACEHOLDER',
      colata: '—',
      pezzi: '2',
      catasta: '—',
      lordoKg: '—',
      nettoKg: '—',
      siteId: 'bassano',
      status: 'piazzale',
      position: { lat: 45.76185, lon: 11.7142 },
    },
    {
      id: 'bil-f01',
      code: 'BIL-F01',
      orderCode: '2026/510',
      customerName: 'Estrusi Dolomiti',
      alloy: '6060',
      cut: 'Segato',
      diameter: '254',
      length: '6000',
      lotto: '26/2100/2/28010D',
      colata: '28010D',
      pezzi: '3',
      catasta: '33660001',
      lordoKg: '1120',
      nettoKg: '1065',
      siteId: 'fortogna',
      status: 'piazzale',
      position: { lat: 46.233218, lon: 12.291446 },
    },
    {
      id: 'bil-f02',
      code: 'BIL-F02',
      orderCode: '2026/511',
      customerName: 'Alluminio Cadore',
      alloy: '6082',
      cut: 'Troncatura',
      diameter: '178',
      length: '4500',
      lotto: '26/2105/4/28022E',
      colata: '28022E',
      pezzi: '5',
      catasta: '33660045',
      lordoKg: '780',
      nettoKg: '740',
      siteId: 'fortogna',
      status: 'piazzale',
      position: { lat: 46.233147, lon: 12.291618 },
    },
    {
      id: 'bil-f03',
      code: 'BIL-F03',
      orderCode: '2026/512',
      customerName: 'Aluminium Bozen Cliente demo',
      alloy: '7075',
      cut: 'Segato',
      diameter: '305',
      length: '8000',
      lotto: '26/2112/1/28100F',
      colata: '28100F',
      pezzi: '2',
      catasta: '33660120',
      lordoKg: '1680',
      nettoKg: '1595',
      siteId: 'fortogna',
      status: 'piazzale',
      position: { lat: 46.232985, lon: 12.291446 },
    },
  ]

  // —— Stato UI ————————————————————————————————————————
  const pageBrand =
    (document.body && document.body.dataset.brand) || 'aluminium-bozen'
  const pageRole =
    (document.body && document.body.dataset.role) || 'magazziniere'
  const DEFAULT_FROM_PAGE =
    document.body && document.body.dataset.defaultSite
      ? document.body.dataset.defaultSite
      : BRAND_DEFAULT_SITE[pageBrand] || 'bolzano'
  let siteId =
    SITES[DEFAULT_FROM_PAGE] && SITES[DEFAULT_FROM_PAGE].brandId === pageBrand
      ? DEFAULT_FROM_PAGE
      : BRAND_DEFAULT_SITE[pageBrand] || 'bolzano'
  let selectedId = null
  let query = ''
  let dims = {
    w: SITES[siteId].map.width,
    h: SITES[siteId].map.height,
  }
  let toastTimer = null

  const DEMO_OPERATORS = [
    { id: 'op-marco', displayName: 'Marco Rossi' },
    { id: 'op-luca', displayName: 'Luca Bianchi' },
  ]

  function showToast(msg, kind) {
    let el = document.getElementById('preview-toast')
    if (!el) {
      el = document.createElement('p')
      el.id = 'preview-toast'
      el.className = 'scan-toast'
      el.setAttribute('role', 'status')
      const section = document.querySelector('.map-section') || document.body
      section.insertBefore(el, section.firstChild)
    }
    el.textContent = msg
    el.classList.toggle('is-lavorazione', kind === 'lavorazione')
    el.hidden = false
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      el.hidden = true
    }, 3200)
  }

  const elSwitcher = document.getElementById('site-switcher')
  const elAerial = document.getElementById('map-aerial')
  const elPins = document.getElementById('map-pins')
  const elList = document.getElementById('billet-list')
  const elPanel = document.getElementById('billet-panel')
  const elHint = document.getElementById('map-hint')
  const elAddress = document.getElementById('map-address')
  const elSearch = document.getElementById('search-input')
  const elLogo = document.getElementById('brand-logo')

  function brandSites() {
    return Object.values(SITES).filter((s) => s.brandId === pageBrand)
  }

  // Allinea raster / logo iniziale
  ;(function syncInitialAerial() {
    const s = SITES[siteId]
    elAerial.src = s.map.src
    elAerial.width = s.map.width
    elAerial.height = s.map.height
    elAerial.alt = `Mappa ${s.label} — Piazzali`
    if (elLogo) {
      if (pageBrand === 'metalba') {
        elLogo.src = './assets/brands/metalba/logo.webp'
        elLogo.alt = 'Metalba'
      } else {
        elLogo.src = './assets/brands/aluminium-bozen/logo.png'
        elLogo.alt = 'Aluminium Bozen'
      }
    }
    if (elSwitcher) {
      elSwitcher.innerHTML = brandSites()
        .map((s) => {
          const active = s.id === siteId
          return `<button type="button" class="site-switcher-btn${active ? ' is-active' : ''}" data-site="${s.id}" aria-pressed="${active ? 'true' : 'false'}">${s.shortLabel}</button>`
        })
        .join('')
    }
  })()

  function site() {
    return SITES[siteId]
  }

  function billetsForSite() {
    return BILLETS.filter((b) => b.siteId === siteId && b.status !== 'in_lavorazione')
  }

  function normalizeOrderQuery(s) {
    return s.trim().toLowerCase().replace(/\s+/g, '')
  }

  function matchesQuery(b, q) {
    const needle = normalizeOrderQuery(q)
    if (!needle) return true
    const order = normalizeOrderQuery(b.orderCode)
    if (order.includes(needle) || needle.includes(order)) return true
    return [
      b.code,
      b.customerName,
      b.alloy,
      b.lotto,
      b.colata,
      b.pezzi,
      b.catasta,
      b.lordoKg,
      b.nettoKg,
    ].some((v) => String(v).toLowerCase().includes(needle))
  }

  function formatDimensions(diameter, length) {
    return `${diameter} X ${length}`
  }

  function formatGps(pos) {
    if (!pos) return '—'
    return `${pos.lat.toFixed(6)}, ${pos.lon.toFixed(6)}`
  }

  function toPercent(pixel, w, h) {
    return {
      left: `${(pixel.x / w) * 100}%`,
      top: `${(pixel.y / h) * 100}%`,
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function factRow(label, value) {
    if (value == null || value === '' || value === '—') return ''
    return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
  }

  function render() {
    const s = site()
    const all = billetsForSite()
    const filtered = all.filter((b) => matchesQuery(b, query))
    const selected = filtered.find((b) => b.id === selectedId) || null

    elAddress.textContent = s.addressShort
    elHint.textContent = `${s.shortLabel} · ${filtered.length} billette sul piazzale`

    // Switcher
    elSwitcher.querySelectorAll('[data-site]').forEach((btn) => {
      const active = btn.getAttribute('data-site') === siteId
      btn.classList.toggle('is-active', active)
      btn.setAttribute('aria-pressed', active ? 'true' : 'false')
    })

    // Pins
    elPins.innerHTML = ''
    filtered.forEach((b) => {
      if (!b.position) return
      const pixel = s.transform.wgs84ToPixel(b.position)
      const style = toPercent(pixel, dims.w, dims.h)
      const active = b.id === selectedId
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = `map-pin map-pin-billet map-pin-btn${active ? ' is-selected has-label' : ' is-dot-only'}`
      btn.style.left = style.left
      btn.style.top = style.top
      btn.title = `${b.orderCode} · ${b.customerName}`
      btn.setAttribute('aria-label', `Comanda ${b.orderCode}, ${b.customerName}`)
      btn.setAttribute('aria-pressed', active ? 'true' : 'false')
      btn.innerHTML =
        '<span class="map-pin-hit" aria-hidden="true"></span><span class="map-pin-dot"></span>' +
        (active
          ? `<span class="map-pin-label">${escapeHtml(b.orderCode)}</span>`
          : '')
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        selectedId = b.id
        render()
      })
      elPins.appendChild(btn)
    })

    // Lista
    if (selected) {
      elList.hidden = true
      elList.innerHTML = ''
    } else {
      elList.hidden = false
      elList.innerHTML = filtered
        .map((b) => {
          const missing = !b.position
          return `<li class="billet-list-row">
            <button type="button" class="search-result${missing ? ' is-unpositioned' : ''}" data-select="${escapeHtml(b.id)}">
              <span class="search-result-line1">
                <span class="search-result-commessa">${escapeHtml(b.orderCode)}</span>
                <span class="search-result-gps${missing ? ' is-missing' : ''}">${missing ? 'Senza GPS' : formatGps(b.position)}</span>
              </span>
              <span class="search-result-line2">
                <span class="search-result-billetta">${escapeHtml(b.code)} · ${escapeHtml(b.customerName)}</span>
              </span>
            </button>
          </li>`
        })
        .join('')
      elList.querySelectorAll('[data-select]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedId = btn.getAttribute('data-select')
          render()
        })
      })
    }

    // Pannello dettaglio (campi etichetta Aluminium Bozen)
    if (selected) {
      elPanel.hidden = false
      elPanel.classList.toggle('is-unpositioned', !selected.position)
      const weight =
        selected.lordoKg !== '—' || selected.nettoKg !== '—'
          ? `L ${selected.lordoKg} / N ${selected.nettoKg} kg`
          : null
      const assignee = DEMO_OPERATORS.find(
        (o) => o.id === selected.assignedToUserId,
      )
      const assignLine = assignee
        ? factRow('Assegnata a', assignee.displayName)
        : ''
      const magActions =
        pageRole === 'magazziniere'
          ? `
          ${
            !selected.position
              ? `<button type="button" class="btn btn-primary btn-block posiziona-btn-expand" id="btn-place">Posiziona</button>`
              : ''
          }
          <button type="button" class="btn btn-secondary btn-block" id="btn-ocr-selected">Foto etichetta</button>
          <button type="button" class="btn lavorazione-btn btn-block" id="btn-lavorazione">Metti in lavorazione</button>`
          : `
          <div class="assign-control">
            <label class="assign-control-label" for="assign-select">Assegna a mulettista</label>
            <select id="assign-select" class="input assign-select">
              <option value="">— Non assegnata —</option>
              ${DEMO_OPERATORS.map(
                (o) =>
                  `<option value="${o.id}"${o.id === selected.assignedToUserId ? ' selected' : ''}>${escapeHtml(o.displayName)}</option>`,
              ).join('')}
            </select>
          </div>`
      elPanel.innerHTML = `
        <p class="billet-panel-title">${escapeHtml(selected.code)}</p>
        <dl class="billet-facts">
          ${factRow('Ordine', selected.orderCode)}
          ${factRow('Cliente', selected.customerName)}
          ${factRow('Lega', selected.alloy)}
          ${factRow('Lotto', selected.lotto)}
          ${factRow('Colata', selected.colata)}
          ${factRow('Pezzi', selected.pezzi)}
          ${factRow('Catasta', selected.catasta)}
          ${factRow('Dimensioni', formatDimensions(selected.diameter, selected.length))}
          ${factRow('Peso', weight)}
          ${factRow('GPS', formatGps(selected.position))}
          ${assignLine}
        </dl>
        <div class="billet-actions">
          ${magActions}
          <button type="button" class="btn btn-ghost btn-block" id="btn-back-list">Torna alla lista</button>
        </div>`
      document.getElementById('btn-back-list').addEventListener('click', () => {
        selectedId = null
        render()
      })
      const btnOcr = document.getElementById('btn-ocr-selected')
      if (btnOcr) {
        btnOcr.addEventListener('click', () => {
          if (window.__piazzaliOcr) window.__piazzaliOcr.openForSelected(selected.id)
        })
      }
      const btnLav = document.getElementById('btn-lavorazione')
      if (btnLav) {
        btnLav.addEventListener('click', () => {
          selected.status = 'in_lavorazione'
          showToast(
            `Billetta ${selected.code} in lavorazione`,
            'lavorazione',
          )
          selectedId = null
          render()
        })
      }
      const btnPlace = document.getElementById('btn-place')
      if (btnPlace) {
        btnPlace.addEventListener('click', () => {
          const s = site()
          // Posizione demo al centro del piazzale (GCP medio)
          selected.position = {
            lat: s.id === 'bolzano' ? 46.4753 : s.id === 'bassano' ? 45.762 : 46.2331,
            lon: s.id === 'bolzano' ? 11.3293 : s.id === 'bassano' ? 11.7139 : 12.2914,
          }
          showToast(`Posizione GPS salvata per ${selected.code}`)
          render()
        })
      }
      const assignSel = document.getElementById('assign-select')
      if (assignSel) {
        assignSel.addEventListener('change', () => {
          const v = assignSel.value || null
          selected.assignedToUserId = v
          selected.assignedAt = v ? new Date().toISOString() : null
          const name = DEMO_OPERATORS.find((o) => o.id === v)?.displayName
          showToast(
            v
              ? `Assegnata a ${name}`
              : 'Assegnazione rimossa',
          )
          render()
        })
      }
    } else {
      elPanel.hidden = true
      elPanel.innerHTML = ''
    }
  }

  function onOcrConfirm(fields, targetId) {
    if (targetId) {
      const bil = BILLETS.find((b) => b.id === targetId)
      if (bil) {
        Object.assign(bil, {
          code: fields.code || bil.code,
          orderCode: fields.orderCode || bil.orderCode,
          customerName: fields.customerName || bil.customerName,
          alloy: fields.alloy || bil.alloy,
          cut: fields.cut || bil.cut,
          diameter: fields.diameter || bil.diameter,
          length: fields.length || bil.length,
          lotto: fields.lotto || bil.lotto,
          colata: fields.colata || bil.colata,
          pezzi: fields.pezzi || bil.pezzi,
          catasta: fields.catasta || bil.catasta,
          lordoKg: fields.lordoKg || bil.lordoKg,
          nettoKg: fields.nettoKg || bil.nettoKg,
        })
        selectedId = bil.id
        showToast(`Etichetta aggiornata · ${bil.code}`)
        render()
        return
      }
    }
    const id = `bil-ocr-${Date.now()}`
    BILLETS.push({
      id,
      code: fields.code || `OCR-${Date.now().toString().slice(-4)}`,
      orderCode: fields.orderCode || 'DEMO/OCR',
      customerName: fields.customerName || 'Da etichetta',
      alloy: fields.alloy || '—',
      cut: fields.cut || '—',
      diameter: fields.diameter || '—',
      length: fields.length || '—',
      lotto: fields.lotto || '—',
      colata: fields.colata || '—',
      pezzi: fields.pezzi || '—',
      catasta: fields.catasta || '—',
      lordoKg: fields.lordoKg || '—',
      nettoKg: fields.nettoKg || '—',
      siteId,
      status: 'piazzale',
      position: null,
      assignedToUserId: null,
    })
    selectedId = id
    showToast(`Nuova billetta da OCR · ${fields.code || id}`)
    render()
  }

  window.__piazzaliPreview = {
    onOcrConfirm,
    getSiteId: () => siteId,
    getBrand: () => pageBrand,
    getRole: () => pageRole,
  }

  function setSite(nextId) {
    if (!SITES[nextId] || nextId === siteId) return
    if (SITES[nextId].brandId !== pageBrand) return
    siteId = nextId
    selectedId = null
    query = ''
    elSearch.value = ''
    const s = site()
    dims = { w: s.map.width, h: s.map.height }
    elAerial.src = s.map.src
    elAerial.width = s.map.width
    elAerial.height = s.map.height
    elAerial.alt = `Mappa ${s.label} — Piazzali`
    render()
  }

  elSwitcher.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-site]')
    if (!btn) return
    setSite(btn.getAttribute('data-site'))
  })

  elSearch.addEventListener('input', () => {
    query = elSearch.value
    selectedId = null
    render()
  })

  elAerial.addEventListener('load', () => {
    dims = {
      w: elAerial.naturalWidth || site().map.width,
      h: elAerial.naturalHeight || site().map.height,
    }
    render()
  })

  // Deep-link opzionale ?sito=fortogna&billetta=bil-f01
  try {
    const params = new URLSearchParams(location.search)
    const qSite = params.get('sito')
    if (qSite === 'bolzano' || qSite === 'bassano' || qSite === 'fortogna') {
      setSite(qSite)
    }
    const qBil = params.get('billetta')
    if (qBil && BILLETS.some((b) => b.id === qBil && b.siteId === siteId)) {
      selectedId = qBil
    }
  } catch (_) {
    /* ignore */
  }

  render()
})()
