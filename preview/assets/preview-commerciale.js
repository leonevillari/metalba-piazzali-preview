/**
 * Demo ufficio commerciale (desktop): elenco comande, KPI, assegna mulettista.
 */
;(function () {
  'use strict'

  const pageBrand =
    (document.body && document.body.dataset.brand) || 'aluminium-bozen'

  const OPERATORS = [
    { id: 'op-marco', displayName: 'Marco Rossi' },
    { id: 'op-luca', displayName: 'Luca Bianchi' },
  ]

  const ROWS = [
    {
      id: 'bil-001',
      brandId: 'aluminium-bozen',
      site: 'Bozen',
      orderCode: '2026/450',
      code: 'BIL-001',
      customer: 'Acciai Alto Adige S.p.A.',
      alloy: '2007',
      status: 'piazzale',
      gps: true,
      assignedToUserId: 'op-marco',
    },
    {
      id: 'bil-002',
      brandId: 'aluminium-bozen',
      site: 'Bozen',
      orderCode: '2026/451',
      code: 'BIL-002',
      customer: 'Cliente Bolzano Demo',
      alloy: '6082',
      status: 'piazzale',
      gps: true,
      assignedToUserId: null,
    },
    {
      id: 'bil-003',
      brandId: 'aluminium-bozen',
      site: 'Bozen',
      orderCode: '2026/452',
      code: 'BIL-003',
      customer: 'Aluminium Bozen Cliente demo',
      alloy: '7075',
      status: 'piazzale',
      gps: true,
      assignedToUserId: null,
    },
    {
      id: 'bil-004',
      brandId: 'aluminium-bozen',
      site: 'Bozen',
      orderCode: '2026/460',
      code: 'BIL-004',
      customer: 'Profilati Isarco S.r.l.',
      alloy: '6063',
      status: 'piazzale',
      gps: false,
      assignedToUserId: null,
    },
    {
      id: 'bil-bas-ph1',
      brandId: 'metalba',
      site: 'Bassano',
      orderCode: 'PLACEHOLDER/BAS',
      code: 'PH-BAS-001',
      customer: 'PLACEHOLDER Bassano',
      alloy: '6082',
      status: 'piazzale',
      gps: true,
      assignedToUserId: null,
    },
    {
      id: 'bil-bas-ph2',
      brandId: 'metalba',
      site: 'Bassano',
      orderCode: 'PLACEHOLDER/BAS',
      code: 'PH-BAS-002',
      customer: 'PLACEHOLDER Bassano',
      alloy: '6060',
      status: 'piazzale',
      gps: true,
      assignedToUserId: 'op-luca',
    },
    {
      id: 'bil-f01',
      brandId: 'metalba',
      site: 'Fortogna',
      orderCode: '2026/510',
      code: 'BIL-F01',
      customer: 'Estrusi Dolomiti',
      alloy: '6060',
      status: 'piazzale',
      gps: true,
      assignedToUserId: null,
    },
    {
      id: 'bil-f02',
      brandId: 'metalba',
      site: 'Fortogna',
      orderCode: '2026/511',
      code: 'BIL-F02',
      customer: 'Alluminio Cadore',
      alloy: '6082',
      status: 'piazzale',
      gps: true,
      assignedToUserId: 'op-marco',
    },
    {
      id: 'bil-f03',
      brandId: 'metalba',
      site: 'Fortogna',
      orderCode: '2026/512',
      code: 'BIL-F03',
      customer: 'Cliente demo',
      alloy: '7075',
      status: 'piazzale',
      gps: true,
      assignedToUserId: null,
    },
  ]

  let filterSite = 'all'
  let toastTimer = null

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;')
  }

  function rows() {
    return ROWS.filter((r) => r.brandId === pageBrand).filter((r) => {
      if (filterSite === 'all') return true
      return r.site.toLowerCase() === filterSite
    })
  }

  function toast(msg) {
    const el = document.getElementById('com-toast')
    if (!el) return
    el.textContent = msg
    el.hidden = false
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      el.hidden = true
    }, 2800)
  }

  function kpi() {
    const all = ROWS.filter((r) => r.brandId === pageBrand)
    const assigned = all.filter((r) => r.assignedToUserId).length
    const noGps = all.filter((r) => !r.gps).length
    const el = document.getElementById('com-kpi')
    if (!el) return
    el.innerHTML = `
      <div class="com-kpi-card"><span class="com-kpi-label">Commesse</span><strong class="com-kpi-value">${all.length}</strong></div>
      <div class="com-kpi-card"><span class="com-kpi-label">Assegnate</span><strong class="com-kpi-value">${assigned}</strong></div>
      <div class="com-kpi-card"><span class="com-kpi-label">Senza GPS</span><strong class="com-kpi-value">${noGps}</strong></div>
      <div class="com-kpi-card"><span class="com-kpi-label">Mulettisti</span><strong class="com-kpi-value">${OPERATORS.length}</strong></div>`
  }

  function render() {
    kpi()
    const tbody = document.getElementById('com-tbody')
    if (!tbody) return
    const list = rows()
    tbody.innerHTML = list
      .map((r) => {
        const opName =
          OPERATORS.find((o) => o.id === r.assignedToUserId)?.displayName || '—'
        return `<tr data-id="${esc(r.id)}">
          <td><strong>${esc(r.orderCode)}</strong><div class="com-sub">${esc(r.code)}</div></td>
          <td>${esc(r.site)}</td>
          <td>${esc(r.customer)}</td>
          <td class="num">${esc(r.alloy)}</td>
          <td>${r.gps ? '<span class="com-pill is-ok">GPS</span>' : '<span class="com-pill is-warn">Senza GPS</span>'}</td>
          <td>
            <select class="input assign-select com-assign" data-assign="${esc(r.id)}" aria-label="Assegna ${esc(r.code)}">
              <option value="">— Non assegnata —</option>
              ${OPERATORS.map(
                (o) =>
                  `<option value="${o.id}"${o.id === r.assignedToUserId ? ' selected' : ''}>${esc(o.displayName)}</option>`,
              ).join('')}
            </select>
            <div class="com-sub">${esc(opName)}</div>
          </td>
        </tr>`
      })
      .join('')

    tbody.querySelectorAll('[data-assign]').forEach((sel) => {
      sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-assign')
        const row = ROWS.find((r) => r.id === id)
        if (!row) return
        row.assignedToUserId = sel.value || null
        const name = OPERATORS.find((o) => o.id === sel.value)?.displayName
        toast(
          sel.value
            ? `${row.code} assegnata a ${name}`
            : `${row.code}: assegnazione rimossa`,
        )
        render()
      })
    })

    const empty = document.getElementById('com-empty')
    if (empty) empty.hidden = list.length > 0
  }

  document.querySelectorAll('[data-filter-site]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterSite = btn.getAttribute('data-filter-site') || 'all'
      document.querySelectorAll('[data-filter-site]').forEach((b) => {
        b.classList.toggle('is-active', b === btn)
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      })
      render()
    })
  })

  render()
})()
