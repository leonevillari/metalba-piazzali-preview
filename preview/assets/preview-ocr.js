/**
 * Flusso demo «Foto etichetta → OCR → conferma» per anteprime statiche.
 * Usa OCR simulato (campi etichetta Bozen) + immagine esempio reale.
 * Opzionale: carica foto propria (stesso flusso simulato affidabile offline).
 */
;(function () {
  'use strict'

  const SAMPLE_IMAGE = './assets/etichetta-esempio.jpg'
  const SAMPLE_FIELDS = {
    code: 'B0893051150',
    orderCode: 'OR268234',
    customerName: 'Cliente da etichetta (demo OCR)',
    alloy: '6026E',
    cut: 'Segato',
    diameter: '305',
    length: '1150',
    lotto: '26/1962/7/26313E',
    colata: '26313E',
    pezzi: '4',
    catasta: '22657457',
    lordoKg: '968',
    nettoKg: '918',
  }

  function getApi() {
    return window.__piazzaliPreview
  }

  function whenReady(fn) {
    const api = getApi()
    if (api && typeof api.onOcrConfirm === 'function') {
      fn(api)
      return
    }
    let n = 0
    const t = setInterval(() => {
      n += 1
      const a = getApi()
      if (a && typeof a.onOcrConfirm === 'function') {
        clearInterval(t)
        fn(a)
      } else if (n > 40) {
        clearInterval(t)
        console.warn('[preview-ocr] API preview non pronta')
      }
    }, 50)
  }

  let step = 'capture' // capture | processing | review
  let previewUrl = null
  let fields = { ...SAMPLE_FIELDS }
  let ocrTargetId = null
  let objectUrl = null
  let api = null

  function ensureModal() {
    let root = document.getElementById('ocr-modal-root')
    if (root) return root
    root = document.createElement('div')
    root.id = 'ocr-modal-root'
    root.hidden = true
    root.innerHTML = `
      <div class="ocr-modal-backdrop" id="ocr-backdrop" role="presentation">
        <div class="ocr-modal" role="dialog" aria-modal="true" aria-labelledby="ocr-title">
          <header class="ocr-modal-header">
            <h2 id="ocr-title">Foto etichetta</h2>
            <button type="button" class="btn btn-ghost" id="ocr-close" aria-label="Chiudi">Chiudi</button>
          </header>
          <div id="ocr-body"></div>
        </div>
      </div>`
    document.body.appendChild(root)
    root.querySelector('#ocr-close').addEventListener('click', close)
    root.querySelector('#ocr-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'ocr-backdrop' && step !== 'processing') close()
    })
    return root
  }

  function close() {
    if (step === 'processing') return
    const root = document.getElementById('ocr-modal-root')
    if (root) root.hidden = true
    step = 'capture'
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
    previewUrl = null
    ocrTargetId = null
  }

  function open(targetId, title) {
    ocrTargetId = targetId || null
    step = 'capture'
    fields = { ...SAMPLE_FIELDS }
    ensureModal()
    document.getElementById('ocr-title').textContent =
      title || (ocrTargetId ? 'Aggiorna da etichetta' : 'Nuova billetta da etichetta')
    document.getElementById('ocr-modal-root').hidden = false
    renderBody()
  }

  function renderBody() {
    const body = document.getElementById('ocr-body')
    if (step === 'capture') {
      body.innerHTML = `
        <div class="ocr-capture">
          <p class="ocr-lead">
            Scatta o carica una foto dell’etichetta, oppure prova subito con
            <strong>l’etichetta di esempio Aluminium Bozen</strong>.
            In questa demo i campi vengono letti in automatico (OCR di prova);
            puoi correggerli prima di salvare.
          </p>
          <input id="ocr-file" type="file" accept="image/*" capture="environment" class="visually-hidden" />
          <button type="button" class="btn btn-primary btn-block ocr-primary-btn" id="ocr-sample">
            Prova con etichetta di esempio
          </button>
          <button type="button" class="btn btn-secondary btn-block ocr-primary-btn" id="ocr-camera" style="margin-top:0.55rem">
            Scatta o carica foto
          </button>
          <p class="ocr-hint">
            Sul palmare: usa la fotocamera posteriore. Il barcode non viene letto — solo il testo.
          </p>
        </div>`
      body.querySelector('#ocr-sample').addEventListener('click', () => {
        void runSimulated(SAMPLE_IMAGE, false)
      })
      body.querySelector('#ocr-camera').addEventListener('click', () => {
        body.querySelector('#ocr-file').click()
      })
      body.querySelector('#ocr-file').addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        objectUrl = URL.createObjectURL(file)
        void runSimulated(objectUrl, true)
      })
      return
    }

    if (step === 'processing') {
      body.innerHTML = `
        <div class="ocr-processing" role="status" aria-live="polite">
          ${previewUrl ? `<img class="ocr-preview" src="${previewUrl}" alt="Anteprima etichetta" />` : ''}
          <p class="ocr-progress-label" id="ocr-progress-label">Avvio OCR…</p>
          <div class="ocr-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="5">
            <div class="ocr-progress-bar" id="ocr-progress-bar" style="width:5%"></div>
          </div>
        </div>`
      return
    }

    // review
    const f = fields
    body.innerHTML = `
      <form class="ocr-review" id="ocr-form">
        ${previewUrl ? `<img class="ocr-preview" src="${previewUrl}" alt="Anteprima etichetta" />` : ''}
        <p class="ocr-hint" role="status">OCR di prova completato — verifica i campi e conferma.</p>
        <label class="ocr-field"><span>Codice</span>
          <input class="input" name="code" value="${esc(f.code)}" autocomplete="off" /></label>
        <div class="ocr-field-row">
          <label class="ocr-field"><span>Ordine</span>
            <input class="input" name="orderCode" value="${esc(f.orderCode)}" autocomplete="off" /></label>
          <label class="ocr-field"><span>Lega</span>
            <input class="input" name="alloy" value="${esc(f.alloy)}" autocomplete="off" /></label>
        </div>
        <label class="ocr-field"><span>Cliente</span>
          <input class="input" name="customerName" value="${esc(f.customerName)}" autocomplete="off" /></label>
        <label class="ocr-field"><span>Lotto</span>
          <input class="input" name="lotto" value="${esc(f.lotto)}" autocomplete="off" /></label>
        <div class="ocr-field-row">
          <label class="ocr-field"><span>Colata</span>
            <input class="input" name="colata" value="${esc(f.colata)}" autocomplete="off" /></label>
          <label class="ocr-field"><span>Pezzi</span>
            <input class="input" name="pezzi" value="${esc(f.pezzi)}" inputmode="numeric" autocomplete="off" /></label>
        </div>
        <div class="ocr-field-row">
          <label class="ocr-field"><span>Catasta</span>
            <input class="input" name="catasta" value="${esc(f.catasta)}" autocomplete="off" /></label>
          <label class="ocr-field"><span>Lunghezza</span>
            <input class="input" name="length" value="${esc(f.length)}" inputmode="numeric" autocomplete="off" /></label>
        </div>
        <div class="ocr-field-row">
          <label class="ocr-field"><span>Diametro</span>
            <input class="input" name="diameter" value="${esc(f.diameter)}" inputmode="numeric" autocomplete="off" /></label>
          <label class="ocr-field"><span>Taglio</span>
            <input class="input" name="cut" value="${esc(f.cut)}" autocomplete="off" /></label>
        </div>
        <div class="ocr-field-row">
          <label class="ocr-field"><span>Lordo (Kg)</span>
            <input class="input" name="lordoKg" value="${esc(f.lordoKg)}" inputmode="decimal" autocomplete="off" /></label>
          <label class="ocr-field"><span>Netto (Kg)</span>
            <input class="input" name="nettoKg" value="${esc(f.nettoKg)}" inputmode="decimal" autocomplete="off" /></label>
        </div>
        <div class="ocr-actions">
          <button type="submit" class="btn btn-primary btn-block">Conferma e salva</button>
          <button type="button" class="btn btn-ghost btn-block" id="ocr-retry">Ripeti foto</button>
        </div>
      </form>`
    body.querySelector('#ocr-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const fd = new FormData(e.target)
      const next = {}
      for (const [k, v] of fd.entries()) next[k] = String(v).trim()
      if (api) api.onOcrConfirm(next, ocrTargetId)
      close()
    })
    body.querySelector('#ocr-retry').addEventListener('click', () => {
      step = 'capture'
      renderBody()
    })
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
  }

  async function runSimulated(url, fromUserPhoto) {
    previewUrl = url
    step = 'processing'
    renderBody()
    const label = document.getElementById('ocr-progress-label')
    const bar = document.getElementById('ocr-progress-bar')
    const track = bar && bar.parentElement
    const stages = [
      [0.12, 'Caricamento modello…'],
      [0.35, 'Lettura etichetta…'],
      [0.7, 'Estrazione campi…'],
      [1, 'Completato'],
    ]
    for (const [p, text] of stages) {
      await wait(fromUserPhoto ? 380 : 420)
      if (label) label.textContent = text
      if (bar) bar.style.width = `${Math.round(p * 100)}%`
      if (track) track.setAttribute('aria-valuenow', String(Math.round(p * 100)))
    }
    fields = {
      ...SAMPLE_FIELDS,
      customerName: fromUserPhoto
        ? 'Cliente da foto caricata (demo OCR)'
        : SAMPLE_FIELDS.customerName,
    }
    step = 'review'
    renderBody()
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms))
  }

  function boot(readyApi) {
    api = readyApi
    const toolbar = document.querySelector('.map-toolbar')
    if (toolbar && !document.getElementById('btn-ocr-new')) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.id = 'btn-ocr-new'
      btn.className = 'btn btn-secondary map-ocr-btn'
      btn.textContent = 'Foto etichetta'
      btn.addEventListener('click', () => open(null, 'Nuova billetta da etichetta'))
      toolbar.appendChild(btn)
    }
    window.__piazzaliOcr = {
      open,
      openForSelected(id) {
        open(id, 'Aggiorna da etichetta')
      },
    }
  }

  whenReady(boot)
})()
