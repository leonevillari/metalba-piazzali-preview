# Anteprima statica Piazzali

Pagine HTML autonome per mostrare l’interfaccia mappa **senza build**, **senza login** e **senza Supabase**.

## Cosa include

- Header Aluminium Bozen + switcher **Piazzale Bozen** / **Piazzale Metalba** (id tecnici `bolzano` / `fortogna`)
- Mappa aerea con pin billette demo
- Lista billette e dettaglio con campi etichetta (lotto, colata, pezzi, catasta, lordo/netto)
- Dati demo allineati a `src/billets/store.ts` / `server/data/billets.json`

## Come aprire in locale

**Doppio click** su `preview/index.html` (funziona anche in `file://`).

Oppure da root del repository:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Poi apri: [http://127.0.0.1:8080/preview/](http://127.0.0.1:8080/preview/)

## Link pubblici (GitHub Pages)

Il repo `metalba-mag-esterno` è **privato** (piano Free → Pages non attivabile lì).  
L’anteprima pubblica è sul repo dedicato **`leonevillari/metalba-piazzali-preview`**:

- Hub / redirect: https://leonevillari.github.io/metalba-piazzali-preview/
- Anteprima mappa: https://leonevillari.github.io/metalba-piazzali-preview/preview/
- Solo Piazzale Metalba (deep-link): https://leonevillari.github.io/metalba-piazzali-preview/preview/?sito=fortogna
- Billetta esempio Bolzano: https://leonevillari.github.io/metalba-piazzali-preview/preview/?sito=bolzano&billetta=bil-001

Quando cambi i file in `preview/` di questo repo, aggiorna anche la copia pubblica (push su `metalba-piazzali-preview`).

## File

| Path | Ruolo |
| --- | --- |
| `preview/index.html` | Pagina mappa demo |
| `preview/assets/preview.js` | Logica UI + seed + geo |
| `preview/assets/preview.css` | Copia di `src/index.css` |
| `preview/assets/*.jpg` / `logo.png` | Raster e brand |
