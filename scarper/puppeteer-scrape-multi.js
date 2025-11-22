// puppeteer-scrape-multi.js
// Usage examples:
// 1) Single URL:
//    node puppeteer-scrape-multi.js "https://www.flipkart.com/search?q=shoes+for+men"
// 2) Multiple URLs:
//    node puppeteer-scrape-multi.js "https://www.flipkart.com/search?q=shoes+for+men" "https://www.flipkart.com/search?q=pants+for+men" "https://www.flipkart.com/search?q=shirts+for+men"
// 3) Or pass simple search queries (script will convert to Flipkart search URLs):
//    node puppeteer-scrape-multi.js --search "shoes for men" "pants for men" "shirts for men"

const puppeteer = require('puppeteer');

const FLIPKART_SEARCH = q =>
  `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`;

async function openPage(browser, url) {
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  );
  await page.setViewport({ width: 1280, height: 800 });

  // go to page
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  // close Flipkart login modal if present
  try {
    // common selector for Flipkart close button on modal
    await page.waitForSelector('button._2KpZ6l._2doB4z', { timeout: 3000 });
    await page.click('button._2KpZ6l._2doB4z').catch(() => {});
  } catch (e) {
    // no popup — ignore
  }

  // sometimes there's a different overlay or cookie banner. attempt to remove large overlays:
  await page.evaluate(() => {
    const selectors = [
      '.bhgxx2', // example overlay classes
      '.Z2AkP', // another potential overlay
      '#fk-customer-consent' // hypothetical
    ];
    selectors.forEach(s => {
      const el = document.querySelector(s);
      if (el) el.remove();
    });
  });

  return page;
}

function extractImageSrc(img) {
  // prefer src, then data-src, then data-srcset -> take first url
  if (!img) return null;
  return (
    img.getAttribute('src') ||
    img.getAttribute('data-src') ||
    (img.getAttribute('data-srcset') || '').split(',')[0]?.trim().split(' ')[0] ||
    null
  );
}

async function scrapePage(page) {
  // ensure the containers exist (timeout small, continue even if not)
  await page.waitForSelector('div._1sdMkc', { timeout: 5000 }).catch(() => {});

  // evaluate in page
  const items = await page.evaluate(() => {
    // helper to safely get text
    const t = (el) => (el ? el.textContent.trim() : null);

    const results = [];
    const containers = document.querySelectorAll('div._1sdMkc');

    containers.forEach(container => {
      const outer = container.closest('[data-id]') || container;
      const dataId = outer ? outer.getAttribute('data-id') : null;

      const brand = t(container.querySelector('.syl9yP'));
      const title = t(container.querySelector('.WKTcLC'));
      let linkEl = container.querySelector('a.rPDeLR') || container.querySelector('a.WKTcLC');
      let link = linkEl ? linkEl.getAttribute('href') : null;
      if (link && link.startsWith('/')) link = 'https://www.flipkart.com' + link;

      // image handling: src or data-src or data-srcset
      const imgEl = container.querySelector('img._53J4C-') || container.querySelector('img');
      let image = null;
      if (imgEl) {
        image = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') ||
                (imgEl.getAttribute('data-srcset') ? imgEl.getAttribute('data-srcset').split(',')[0].trim().split(' ')[0] : null);
      }

      const currentPriceEl = container.querySelector('.Nx9bqj');
      const originalPriceEl = container.querySelector('.yRaY8j');
      const price = currentPriceEl ? parseInt(currentPriceEl.textContent.replace(/[^\d]/g, ''), 10) : null;
      const originalPrice = originalPriceEl ? parseInt(originalPriceEl.textContent.replace(/[^\d]/g, ''), 10) : null;
      const discountEl = container.querySelector('.UkUFwK span');
      const discount = discountEl ? discountEl.textContent.trim() : null;

      const tags = [];
      container.querySelectorAll('.M4DNwV .yiggsN, .M4DNwV .O5Fpg8').forEach(tg => {
        if (tg && tg.textContent) tags.push(tg.textContent.trim());
      });

      let sizes = null;
      const ocr = container.querySelector('.OCRRMR');
      if (ocr) {
        const text = ocr.textContent || '';
        const match = text.match(/Size\s*([0-9A-Za-z,\s]+)/i);
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

  return items;
}

(async () => {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.error('Usage: node puppeteer-scrape-multi.js <URL-or-search> [more URLs or --search "term" ...]');
    process.exit(1);
  }

  // support: --search prefix; if present, convert following args to Flipkart search URLs
  let urls = [];
  if (argv[0] === '--search') {
    // convert all following args into search URLs
    const queries = argv.slice(1);
    urls = queries.map(q => FLIPKART_SEARCH(q));
  } else {
    // treat all args as URLs or plain terms (if not starting with http, treat as search)
    urls = argv.map(a => {
      if (/^https?:\/\//i.test(a)) return a;
      return FLIPKART_SEARCH(a);
    });
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  const all = [];

  for (const url of urls) {
    const page = await openPage(browser, url);

    // small scroll to trigger lazy load images and more items
    await page.evaluate(async () => {
      const step = 600;
      const wait = ms => new Promise(res => setTimeout(res, ms));
      for (let i = 0; i < 6; i++) {
        window.scrollBy(0, step);
        // allow some time for lazy load
        // eslint-disable-next-line no-await-in-loop
        await wait(250);
      }
    });

    const items = await scrapePage(page);
    all.push({ url, count: items.length, items });

    await page.close();
  }

  await browser.close();

  // print grouped JSON
  console.log(JSON.stringify(all, null, 2));
  process.exit(0);
})();
