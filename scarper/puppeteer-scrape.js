// puppeteer-scrape.js
// Usage:
// 1) npm i puppeteer
// 2) node puppeteer-scrape.js "https://www.flipkart.com/search?q=shoes+for+men"
// Replace URL argument with the page you want to scrape.

const puppeteer = require('puppeteer');

async function scrapePage(url) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // some sites block headless bots; set some common headers
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36');

  // optionally set viewport
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  // Wait for the item containers to appear
  await page.waitForSelector('div._1sdMkc', { timeout: 5000 }).catch(() => {});

  const items = await page.evaluate(() => {
    const results = [];
    const containers = document.querySelectorAll('div._1sdMkc');

    containers.forEach(container => {
      // find outer wrapper for data-id
      const outer = container.closest('[data-id]') || container;
      const dataId = outer.getAttribute('data-id');

      const brandEl = container.querySelector('.syl9yP');
      const brand = brandEl ? brandEl.textContent.trim() : null;

      const titleEl = container.querySelector('.WKTcLC');
      const title = titleEl ? titleEl.textContent.trim() : null;

      let linkEl = container.querySelector('a.rPDeLR') || container.querySelector('a.WKTcLC');
      let link = linkEl ? linkEl.getAttribute('href') : null;
      if (link && link.startsWith('/')) link = 'https://www.flipkart.com' + link;

      const imgEl = container.querySelector('img._53J4C-');
      const image = imgEl ? imgEl.getAttribute('src') : null;

      const currentPriceEl = container.querySelector('.Nx9bqj');
      const originalPriceEl = container.querySelector('.yRaY8j');
      const price = currentPriceEl ? parseInt(currentPriceEl.textContent.replace(/[^\d]/g, ''), 10) : null;
      const originalPrice = originalPriceEl ? parseInt(originalPriceEl.textContent.replace(/[^\d]/g, ''), 10) : null;

      const discountEl = container.querySelector('.UkUFwK span');
      const discount = discountEl ? discountEl.textContent.trim() : null;

      // tags
      const tags = [];
      container.querySelectorAll('.M4DNwV .yiggsN, .M4DNwV .O5Fpg8').forEach(t => {
        const txt = t.textContent.trim();
        if (txt) tags.push(txt);
      });

      // sizes parsing if present
      let sizes = null;
      const ocr = container.querySelector('.OCRRMR');
      if (ocr) {
        const text = ocr.textContent || '';
        const match = text.match(/Size\s*([0-9,\s]+)/i);
        if (match) sizes = match[1].split(',').map(x => x.trim());
      }

      results.push({
        id: dataId,
        brand,
        title,
        link,
        image,
        price,
        originalPrice,
        discount,
        tags,
        sizes
      });
    });

    return results;
  });

  await browser.close();
  return items;
}

// run
(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node puppeteer-scrape.js "<URL>"');
    process.exit(1);
  }
  try {
    const data = await scrapePage(url);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error scraping', err);
    process.exit(1);
  }
})();
