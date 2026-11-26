const PNG_DATA_URL = /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/;

export function buildQrCardHtml(imageDataUrl) {
  if (typeof imageDataUrl !== 'string' || !PNG_DATA_URL.test(imageDataUrl)) {
    throw new Error('A valid QR image is required to create the printable card.');
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QRAlalay Assistance Card</title>
    <style>
      @page { size: A5 portrait; margin: 12mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #222; font-family: Arial, sans-serif; }
      main { min-height: 170mm; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 2px solid #a83232; border-radius: 16px; padding: 18mm 12mm; }
      h1 { margin: 0; color: #a83232; font-size: 28pt; letter-spacing: 0.02em; }
      p { max-width: 105mm; margin: 7mm 0 0; font-size: 14pt; line-height: 1.45; }
      img { display: block; width: 95mm; height: 95mm; margin-top: 10mm; image-rendering: pixelated; }
      footer { margin-top: 9mm; color: #555; font-size: 10pt; }
      @media screen { body { background: #f5f5f5; padding: 12mm; } main { background: #fff; box-shadow: 0 2px 12px #0002; } }
    </style>
  </head>
  <body>
    <main>
      <h1>QRAlalay</h1>
      <p>Scan this QR code to access emergency assistance.</p>
      <img src="${imageDataUrl}" alt="QRAlalay emergency assistance QR code" />
      <footer>Keep this card visible and accessible.</footer>
    </main>
  </body>
</html>`;
}
