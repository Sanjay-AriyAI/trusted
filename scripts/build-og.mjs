// Builds public/og.png (1774x887, the size referenced by the POC's og:image tags)
// from the planet artwork plus the brand wordmark and headline. Run: pnpm og
import sharp from "sharp";

const W = 1774;
const H = 887;

const overlay = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#030303" stop-opacity="0.92"/>
      <stop offset="0.55" stop-color="#030303" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#030303" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" x2="1" y1="0" y2="0.2">
      <stop offset="0" stop-color="#fff5d4"/>
      <stop offset="0.45" stop-color="#e1a83e"/>
      <stop offset="0.93" stop-color="#8a5b18"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="110" y="170" font-size="44" font-weight="700" fill="#f4f0e8">Trustedtr<tspan fill="#e0a940">Ai</tspan>ner</text>
    <text x="110" y="300" font-size="26" letter-spacing="6" fill="#a39e94">AI TRAINING · CERTIFICATION · TALENT</text>
    <text x="104" y="430" font-size="84" font-weight="600" letter-spacing="-4" fill="#f4f0e8">DON'T JUST USE AI.</text>
    <text x="104" y="540" font-size="84" font-weight="600" letter-spacing="-4" fill="url(#gold)">BECOME TRUSTED</text>
    <text x="104" y="650" font-size="84" font-weight="600" letter-spacing="-4" fill="url(#gold)">WITH IT.</text>
    <text x="110" y="770" font-size="30" fill="#a39e94">Train. Build. Prove. Transform.</text>
  </g>
</svg>`;

await sharp("public/images/planet.webp")
  .resize(W, H, { fit: "cover" })
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .png({ compressionLevel: 9 })
  .toFile("public/og.png");

console.log("Wrote public/og.png");
