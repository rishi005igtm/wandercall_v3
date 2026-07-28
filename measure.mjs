import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

async function run() {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.tracing.start({ path: 'trace.json', screenshots: false });
  
  console.log('Navigating to home...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  console.log('Clicking the feed button...');
  const startTime = Date.now();
  
  // Find a button that pushes to /feed or similar. In home page it might be different.
  // We can just execute router.push in the page context.
  await page.evaluate(() => {
    // Next.js router is usually not exposed globally, but we can click a link or button.
    // Let's find any button that goes to feed or experiences.
    const btns = Array.from(document.querySelectorAll('button'));
    const expBtn = btns.find(b => b.textContent.includes('Experiences') || b.textContent.includes('Feed') || b.textContent.includes('Create'));
    if (expBtn) expBtn.click();
    else window.location.href = '/feed'; // fallback
  });
  
  // Wait for the URL to change
  try {
    await page.waitForNavigation({ timeout: 5000, waitUntil: 'domcontentloaded' });
  } catch (e) {
    console.log('Navigation wait timed out or handled client-side.');
    await new Promise(r => setTimeout(r, 2000));
  }
  
  const endTime = Date.now();
  console.log(`Navigation took ${endTime - startTime}ms`);
  
  await page.tracing.stop();
  await browser.close();
  console.log('Done.');
}
run().catch(console.error);
