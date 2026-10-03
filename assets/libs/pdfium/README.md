# Self-hosted PDFium runtime

Source: `@embedpdf/pdfium` 2.15.1, downloaded from the npm registry.

- `pdfium.mjs`: unchanged `dist/index.browser.js`, renamed for native ES-module loading.
- `pdfium.wasm`: unchanged `dist/pdfium.wasm`.
- `LICENSE` and `LICENSE.pdfium`: upstream redistribution notices.
- npm tarball SHA-1: `ab110afd5d46ffd13ac5816bb78405d89df8854c`.

The editor loads this engine only when opening a document. The module and WASM
are served by ToolShoppy; document, image, password and font bytes are processed
inside a local Web Worker and are not sent to an API.

Upgrade both runtime files together and run the PDF editor export and worker
tests before releasing a new version.
