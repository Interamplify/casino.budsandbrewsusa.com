const puppeteer = require('puppeteer');
const path = require('path');

const casinos = [
  { name: 'jackpot-city', url: 'https://www.jackpotcitycasino.com' },
  { name: 'casino-days', url: 'https://www.casinodays.com' },
  { name: 'tooniebet', url: 'https://www.tooniebet.com' },
  { name: '888casino', url: 'https://www.888casino.com' },
  { name: 'leovegas', url: 'https://www.leovegas.com' },
  { name: 'spin-casino', url: 'https://www.spincasino.com' },
  { name: 'tonybet', url: 'https://www.tonybet.com' },
  { name: 'firevegas', url: 'https://www.firevegas.com' },
  { name: 'royal-vegas', url: 'https://www.royalvegascasino.com' },
  { name: 'toppz', url: 'https://www.toppz.com' },
];

const outDir = path.join(__dirname, 'img', 'casinos');

(async () => {
  const fs = require('fs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const casino of casinos) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    );

    const filePath = path.join(outDir, `${casino.name}.webp`);
    try {
      console.log(`Capturing ${casino.name}...`);
      await page.goto(casino.url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Wait a bit for animations/lazy content
      await new Promise(r => setTimeout(r, 2000));
      // Dismiss any cookie banners or popups by clicking common selectors
      try {
        await page.evaluate(() => {
          document.querySelectorAll('[class*="cookie"] button, [class*="consent"] button, [id*="cookie"] button, [class*="accept"]').forEach(el => {
            if (el.textContent.match(/accept|agree|ok|got it|close|dismiss/i)) el.click();
          });
        });
        await new Promise(r => setTimeout(r, 500));
      } catch (_) {}
      await page.screenshot({ path: filePath, type: 'webp', quality: 85, clip: { x: 0, y: 0, width: 390, height: 844 } });
      console.log(`  OK: ${filePath}`);
    } catch (err) {
      console.error(`  FAIL ${casino.name}: ${err.message}`);
    }
    await page.close();
  }

  await browser.close();
  console.log('Done.');
})();
