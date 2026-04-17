import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { setTimeout as sleep } from 'timers/promises';

const BASE = 'http://localhost:5180';
const DIR = './screenshots';

const SCREENS = [
  { name: '02-home-feed', path: '/home' },
  { name: '03-companion-chat', path: '/companion' },
  { name: '04-voice-mode', path: '/voice' },
  { name: '05-concierge-agent', path: '/concierge' },
  { name: '06-discover', path: '/discover' },
  { name: '07-destination-detail', path: '/discover/d4' },
  { name: '08-circles', path: '/circles' },
  { name: '09-match', path: '/match' },
  { name: '10-for-two', path: '/for-two' },
  { name: '11-passport', path: '/passport' },
  { name: '12-perks', path: '/perks' },
  { name: '13-live', path: '/live' },
  { name: '14-debrief', path: '/debrief' },
  { name: '15-add-rec', path: '/add-rec' },
  { name: '16-translate', path: '/translate' },
  { name: '17-replay', path: '/replay' },
  { name: '18-alerts', path: '/alerts' },
  { name: '19-fixers', path: '/fixers' },
  { name: '20-journal', path: '/journal' },
  { name: '21-packing', path: '/packing' },
  { name: '22-costs', path: '/costs' },
  { name: '23-safety', path: '/safety' },
  { name: '24-wishlist', path: '/wishlist' },
  { name: '25-calendar', path: '/calendar' },
  { name: '26-gear', path: '/gear' },
  { name: '27-expenses', path: '/expenses' },
  { name: '28-intel', path: '/intel' },
];

const clickByText = async (page, text) => {
  const handles = await page.$$('button');
  for (const h of handles) {
    const t = await page.evaluate(el => el.textContent.trim(), h);
    if (t.includes(text)) {
      await h.click();
      return true;
    }
  }
  return false;
};

async function completeOnboarding(page) {
  await sleep(1500);
  await clickByText(page, "Let's Go");
  await sleep(800);
  const cards = await page.$$('button[class*="rounded-2xl"][class*="overflow-hidden"]');
  if (cards[0]) await cards[0].click();
  await sleep(300);
  await clickByText(page, "Continue");
  await sleep(800);
  await clickByText(page, "Continue");
  await sleep(800);
  await clickByText(page, "Start the Jetzy");
  await sleep(2500);
}

async function spaNavigate(page, path) {
  await page.evaluate((p) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function run() {
  await mkdir(DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // === DESKTOP RESOLUTION FOR ALL SCREENSHOTS ===
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Splash
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 15000 });
  await sleep(2000);
  await page.screenshot({ path: `${DIR}/01-onboarding-splash.png`, fullPage: false });
  console.log('✓ 01-onboarding-splash');

  // Onboarding (works at desktop too — it's responsive)
  console.log('Completing onboarding...');
  await completeOnboarding(page);
  console.log('  Now at:', page.url());

  // All 27 main screens at desktop resolution
  for (const screen of SCREENS) {
    try {
      await spaNavigate(page, screen.path);
      await sleep(2000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(400);
      await page.screenshot({ path: `${DIR}/${screen.name}.png`, fullPage: true });
      console.log(`✓ ${screen.name}`);
    } catch (e) {
      console.log(`✗ ${screen.name} — ${e.message}`);
    }
  }

  // Bonus: a few "above the fold" desktop hero shots (not full page)
  for (const s of [
    { name: '29-home-hero', path: '/home' },
    { name: '30-companion-hero', path: '/companion' },
    { name: '31-intel-hero', path: '/intel' },
  ]) {
    try {
      await spaNavigate(page, s.path);
      await sleep(2000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(300);
      await page.screenshot({ path: `${DIR}/${s.name}.png`, fullPage: false });
      console.log(`✓ ${s.name}`);
    } catch (e) {
      console.log(`✗ ${s.name} — ${e.message}`);
    }
  }

  await browser.close();
  console.log('\nDone! All screenshots are now 1440px desktop view.');
}

run();
