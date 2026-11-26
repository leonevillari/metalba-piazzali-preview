# Anteprime statiche Piazzali (demo completa)

Due versioni, entrambe usabili subito (niente login):

1. **Magazziniere** (cellulare/palmare) — mappa, **Foto etichetta / OCR**, posiziona, metti in lavorazione  
2. **Ufficio commerciale** (desktop) — tabella comande, KPI, **assegna a mulettista**

## Hub

https://leonevillari.github.io/metalba-piazzali-preview/preview/

## Magazziniere (mobile + OCR)

| Anteprima | URL |
| --- | --- |
| Aluminium Bozen | https://leonevillari.github.io/metalba-piazzali-preview/preview/bozen.html |
| Metalba (Bassano + Fortogna) | https://leonevillari.github.io/metalba-piazzali-preview/preview/metalba.html |
| Solo Bassano | https://leonevillari.github.io/metalba-piazzali-preview/preview/bassano.html |
| Solo Fortogna | https://leonevillari.github.io/metalba-piazzali-preview/preview/fortogna.html |

Flusso OCR: bottone **Foto etichetta** → «Prova con etichetta di esempio» (o carica foto) → barra progresso → revisione campi → Conferma e salva.

## Ufficio commerciale (desktop)

| Anteprima | URL |
| --- | --- |
| Commerciale Bozen | https://leonevillari.github.io/metalba-piazzali-preview/preview/commerciale-bozen.html |
| Commerciale Metalba | https://leonevillari.github.io/metalba-piazzali-preview/preview/commerciale-metalba.html |

## File

- `preview.js` — mappa / lista / azioni magazziniere  
- `preview-ocr.js` — modal foto + OCR di prova  
- `preview-commerciale.js` + `.css` — vista ufficio  
- `assets/etichetta-esempio.jpg` — etichetta Aluminium Bozen di esempio  

Nell’app React vera (con login Supabase): `src/components/LabelOcrModal.tsx`, `src/ocr/runOcr.ts`, `src/ocr/parseLabel.ts`, `src/components/MapView.tsx`, `src/components/AssignBilletControl.tsx`.
