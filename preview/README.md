# Anteprima statica Piazzali

Pagine HTML autonome per mostrare l’interfaccia mappa **senza build**, **senza login** e **senza Supabase**.

## Cosa include

- Header + switcher **Bozen** / **Metalba Bassano** / **Fortogna**
- Mappe aeree con pin billette demo
- Lista e dettaglio (campi etichetta Aluminium Bozen)
- Pagina dedicata Bassano: `bassano.html`

## Come aprire in locale

**Doppio click** su `preview/index.html` o `preview/bassano.html`.

Oppure da root del repository:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

- Tutti i siti: http://127.0.0.1:8080/preview/
- Solo Bassano: http://127.0.0.1:8080/preview/bassano.html

## Link pubblici (GitHub Pages)

Repo mirror pubblico `leonevillari/metalba-piazzali-preview`:

- Hub: https://leonevillari.github.io/metalba-piazzali-preview/
- Tutti i siti: https://leonevillari.github.io/metalba-piazzali-preview/preview/
- **Piazzale Metalba Bassano:** https://leonevillari.github.io/metalba-piazzali-preview/preview/bassano.html
- Deep-link Bassano: https://leonevillari.github.io/metalba-piazzali-preview/preview/?sito=bassano

## File

| Path | Ruolo |
| --- | --- |
| `preview/index.html` | Mappa multi-sito |
| `preview/bassano.html` | Anteprima dedicata Piazzale Metalba |
| `preview/assets/preview.js` | Logica + seed + geo |
| `preview/assets/preview.css` | Stile |
| `preview/assets/*-aerial.jpg` | Raster siti |
