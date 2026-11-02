# DSA-XAI: controlled deletion results

Supplementary results for *DSA-XAI: Case-Based Explanations for Dysarthria Severity Assessment*.

This static website includes original TORGO and UASpeech class-averaged figures, all class-wise configurations, the controlled deletion protocol, figure interpretation notes, and original PDF downloads.

## Editing

- `index.html`: page text and structure.
- `styles.css`: layout and visual styling.
- `app.js`: figure selection and dataset-specific explanations.
- `assets/`: rendered figures and original PDFs.

## GitHub Pages

Publish from the `main` branch and `/ (root)` folder under **Settings → Pages → Deploy from a branch**. No build tools or external dependencies are required. Relative asset links support project Pages URLs.

The source figures are displayed unchanged. Class averages combine separate target-class deletion-and-retraining experiments; they are not overall test accuracy from a single retrained classifier. Original class IDs and labels are retained in the figures.
