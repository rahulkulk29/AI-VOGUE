// puppeteer-scrape-pants.js
// Usage:
// 1) npm init -y
// 2) npm i puppeteer
// 3) node puppeteer-scrape-pants.js
// Optionally pass URL: node puppeteer-scrape-pants.js "https://www.flipkart.com/search?q=pants+for+men"

const puppeteer = require('puppeteer');
const DEFAULT_URL = 'https://www.flipkart.com/search?q=pants+for+men';

async function openPage(browser, url) {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36');
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  try {
    await page.waitForSelector('button._2KpZ6l._2doB4z', { timeout: 3000 });
    await page.click('button._2KpZ6l._2doB4z').catch(()=>{});
  } catch (e) {}

  return page;
}

async function scrollToLoad(page) {
  await page.evaluate(async () => {
    const wait = ms => new Promise(res => setTimeout(res, ms));
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, 600);
      // eslint-disable-next-line no-await-in-loop
      await wait(300);
    }
  });
}

async function scrape(page) {
  await page.waitForSelector('div._1sdMkc', { timeout: 5000 }).catch(()=>{});
  return await page.evaluate(() => {
    const t = el => (el ? el.textContent.trim() : null);
    const results = [];
    document.querySelectorAll('div._1sdMkc').forEach(container => {
      const outer = container.closest('[data-id]') || container;
      const dataId = outer ? outer.getAttribute('data-id') : null;
      const brand = t(container.querySelector('.syl9yP'));
      const title = t(container.querySelector('.WKTcLC'));
      let linkEl = container.querySelector('a.rPDeLR') || container.querySelector('a.WKTcLC');
      let link = linkEl ? linkEl.getAttribute('href') : null;
      if (link && link.startsWith('/')) link = 'https://www.flipkart.com' + link;

      const imgEl = container.querySelector('img._53J4C-') || container.querySelector('img');
      let image = null;
      if (imgEl) {
        image = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') ||
                (imgEl.getAttribute('data-srcset') ? imgEl.getAttribute('data-srcset').split(',')[0].trim().split(' ')[0] : null);
      }

      const currentPriceEl = container.querySelector('.Nx9bqj');
      const originalPriceEl = container.querySelector('.yRaY8j');
      const price = currentPriceEl ? parseInt(currentPriceEl.textContent.replace(/[^\d]/g,''),10) : null;
      const originalPrice = originalPriceEl ? parseInt(originalPriceEl.textContent.replace(/[^\d]/g,''),10) : null;
      const discount = (container.querySelector('.UkUFwK span') || {}).textContent || null;

      const tags = [];
      container.querySelectorAll('.M4DNwV .yiggsN, .M4DNwV .O5Fpg8').forEach(x => {
        if (x && x.textContent) tags.push(x.textContent.trim());
      });

      // Pants often include waist/length in title; keep sizes null if not present
      let sizes = null;
      const ocr = container.querySelector('.OCRRMR');
      if (ocr) {
        const match = ocr.textContent.match(/Size\s*([0-9A-Za-z,\s]+)/i);
        if (match) sizes = match[1].split(',').map(s => s.trim());
      }

      results.push({ id: dataId, brand, title, link, image, price, originalPrice, discount, tags, sizes });
    });
    return results;
  });
}

(async () => {
  try {
    const url = process.argv[2] || DEFAULT_URL;
    const browser = await puppeteer.launch({ headless: true, args:['--no-sandbox'] });
    const page = await openPage(browser, url);
    await scrollToLoad(page);
    const items = await scrape(page);
    console.log(JSON.stringify({ url, count: items.length, items }, null, 2));
    await page.close();
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
