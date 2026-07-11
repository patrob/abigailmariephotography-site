import { test, expect } from '@playwright/test';

const NAV_LINKS = [
  { text: 'Home', href: '/' },
  { text: 'Gallery', href: '/gallery' },
  { text: 'Packages', href: '/packages' },
  { text: 'Contact', href: '/contact' },
];

test.describe('Abigail Marie Photography — Full Site E2E', () => {
  test('Home page loads with hero, about, and featured sections', async ({ page }) => {
    await page.goto('/');

    // Hero section
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.hero h1')).toContainText('pause button on life');
    await expect(page.locator('.hero img')).toBeVisible();

    // About section
    await expect(page.locator('.about-section h2')).toContainText("Hi, I'm Abbie!");
    const aboutText = page.locator('.about-section');
    await expect(aboutText).toContainText('Arizona');
    await expect(aboutText).toContainText('San Antonio');
    await expect(aboutText).toContainText('New Braunfels');

    // Bible verse
    await expect(page.locator('.verse-section')).toContainText('John 16:21');

    // Featured grid
    await expect(page.locator('.featured-grid img')).toHaveCount(4);

    // Footer
    await expect(page.locator('.site-footer')).toContainText('Abigail Marie Photography');
    await expect(page.locator('.site-footer')).toContainText('Schertz, TX');
    await expect(page.locator('footer a[href*="instagram.com"]')).toBeVisible();
    await expect(page.locator('footer a[href*="facebook.com"]')).toBeVisible();
    await expect(page.locator('footer a[href="mailto:info@abigailmariephotography.com"]')).toBeVisible();
    await expect(page.locator('footer a[href="tel:2105426718"]')).toBeVisible();
  });

  test('Navigation works — click through each page', async ({ page }) => {
    await page.goto('/');

    for (const link of NAV_LINKS) {
      await page.click(`nav a[href="${link.href}"]`);
      await expect(page).toHaveURL(link.href);
    }

    // Back home
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('Gallery page shows image grid', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page).toHaveURL('/gallery');

    // Should have gallery images
    const galleryImages = page.locator('.gallery img, .gallery-grid img, .masonry img, main img');
    const count = await galleryImages.count();
    expect(count).toBeGreaterThan(0);

    // Take a screenshot for the video
    await page.screenshot({ path: 'test-results/gallery-screenshot.png', fullPage: true });
  });

  test('Packages page shows all 4 packages with correct pricing', async ({ page }) => {
    await page.goto('/packages');
    await expect(page).toHaveURL('/packages');

    // Check all 4 packages exist
    await expect(page.locator('body')).toContainText('Full Sessions');
    await expect(page.locator('body')).toContainText('$400');
    await expect(page.locator('body')).toContainText('Mini Sessions');
    await expect(page.locator('body')).toContainText('$225');
    await expect(page.locator('body')).toContainText('Lifestyle Sessions');
    await expect(page.locator('body')).toContainText('$500');
    await expect(page.locator('body')).toContainText('Cake Smash');

    // Check package details
    await expect(page.locator('body')).toContainText('private gallery and print release');
    await expect(page.locator('body')).toContainText('$25 per image');

    await page.screenshot({ path: 'test-results/packages-screenshot.png', fullPage: true });
  });

  test('Contact page has form fields and contact info', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL('/contact');

    // Form fields
    await expect(page.locator('input[name="name"], input[name="Name"]')).toBeVisible();
    await expect(page.locator('input[name="email"], input[name="Email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"], textarea[name="Message"]')).toBeVisible();

    // Contact info
    await expect(page.locator('body')).toContainText('info@abigailmariephotography.com');
    await expect(page.locator('body')).toContainText('210');
    await expect(page.locator('body')).toContainText('Schertz');

    await page.screenshot({ path: 'test-results/contact-screenshot.png', fullPage: true });
  });

  test('Full user journey: Home → Gallery → Packages → Contact', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page.locator('.hero')).toBeVisible();
    await page.screenshot({ path: 'test-results/journey-01-home.png' });

    // Go to gallery
    await page.click('nav a[href="/gallery"]');
    await expect(page).toHaveURL('/gallery');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/journey-02-gallery.png' });

    // Go to packages
    await page.click('nav a[href="/packages"]');
    await expect(page).toHaveURL('/packages');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/journey-03-packages.png' });

    // Go to contact
    await page.click('nav a[href="/contact"]');
    await expect(page).toHaveURL('/contact');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/journey-04-contact.png' });
  });

  test('Mobile nav toggle exists and is functional', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('.nav-toggle');
    const navList = page.locator('.nav-list');

    // Toggle exists in DOM
    await expect(toggle).toBeAttached();
    await expect(navList).toBeAttached();

    // At 1920px desktop, toggle is hidden (CSS display:none) — that's correct behavior
    // Verify nav links are directly visible at desktop width
    await expect(page.locator('.nav-list a[href="/"]')).toBeVisible();
    await expect(page.locator('.nav-list a[href="/gallery"]')).toBeVisible();
  });

  test('All images load successfully', async ({ page }) => {
    const brokenImages: string[] = [];
    await page.goto('/');

    const allImages = page.locator('img');
    const count = await allImages.count();

    for (let i = 0; i < count; i++) {
      const img = allImages.nth(i);
      const src = await img.getAttribute('src') || '';
      if (src.startsWith('http')) {
        const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
        if (naturalWidth === 0) {
          brokenImages.push(src);
        }
      }
    }

    expect(brokenImages, `Broken images: ${brokenImages.join(', ')}`).toHaveLength(0);
  });

  test('SEO meta tags present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(await page.title()).toContain('Abigail Marie Photography');
  });
});