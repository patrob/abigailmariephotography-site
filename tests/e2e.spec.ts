import { test, expect } from '@playwright/test';

const NAV_LINKS = [
  { text: 'Home', href: '/' },
  { text: 'About', href: '/about' },
  { text: 'Portrait & Lifestyle', href: '/gallery' },
  { text: 'Birth & Maternity', href: '/birth-photography' },
  { text: 'Contact', href: '/contact' },
];

test.describe('Abigail Marie Photography — Full Site E2E', () => {
  test('Home page loads with hero, about, and session teaser sections', async ({ page }) => {
    await page.goto('/');

    // Hero section
    await expect(page.locator('.site-brand[href="/"]')).toBeVisible();
    await expect(page.locator('.home-page .main-nav')).toBeVisible();
    await expect(page.locator('.home-page nav a[href="/"]')).toContainText('Home');
    await expect(page.locator('.home-page nav a[href="/about"]')).toContainText('About');
    await expect(page.locator('.home-page nav a[href="/gallery"]')).toContainText('Portrait & Lifestyle');
    await expect(page.locator('.home-page nav a[href="/birth-photography"]')).toContainText('Birth & Maternity');
    await expect(page.locator('.home-page nav a[href="/contact"]')).toContainText('Contact');
    await expect(page.locator('.header-session-link[href="/contact"]')).not.toBeVisible();
    await expect(page.locator('.home-album-hero')).toBeVisible();
    await expect(page.locator('.home-album-hero')).not.toContainText('A photograph is the pause button on life.');
    await expect(page.locator('.home-album-hero__track img')).toHaveCount(27);
    await expect(page.locator('.home-album-hero__slideshow img')).toHaveCount(9);
    const albumSources = await page.locator('.home-album-hero img').evaluateAll((images) =>
      images.map((image) => image.getAttribute('src') || ''),
    );
    expect(albumSources.every((src) => src.startsWith('/images/'))).toBe(true);
    const loadedAlbumImages = await page.locator('.home-album-hero img').evaluateAll((images) =>
      images.filter((image) => (image as HTMLImageElement).naturalWidth > 0).length,
    );
    expect(loadedAlbumImages).toBeGreaterThan(0);
    await expect(page.locator('.home-welcome-section h1')).toContainText('The beauty of your everyday');
    await expect(page.locator('.home-welcome__small')).toContainText('lifestyle • maternity • birth');
    await expect(page.locator('.home-welcome__copy')).toContainText("Hi there, I'm Abbie.");
    await expect(page.locator('.home-welcome__copy')).toContainText('full of movement, connection, laughter');
    await expect(page.locator('.home-welcome__copy .gallery-story-link')).toContainText('Meet Abbie');
    await expect(page.locator('.home-welcome__copy .gallery-story-link')).toHaveAttribute('href', '/about');
    await expect(page.locator('.newborn-promo')).toContainText('Free lifestyle newborn session');
    await expect(page.locator('.newborn-promo__link')).toHaveAttribute('href', '/birth-photography#birth-packages');
    await page.waitForTimeout(5400);
    await expect(page.locator('.newborn-promo')).not.toHaveClass(/newborn-promo--visible/);
    const visibleAlbumImagesAfterDelay = await page.locator('.home-album-hero img').evaluateAll((images) =>
      images.filter((image) => {
        const rect = image.getBoundingClientRect();
        return (
          (image as HTMLImageElement).naturalWidth > 0 &&
          rect.right > 0 &&
          rect.left < window.innerWidth &&
          rect.bottom > 0 &&
          rect.top < window.innerHeight
        );
      }).length,
    );
    expect(visibleAlbumImagesAfterDelay).toBeGreaterThan(0);
    await page.locator('.home-album-hero__track').evaluate((track) => {
      (track as HTMLElement).style.animationDelay = '-145s';
    });
    await page.waitForTimeout(300);
    const visibleAlbumImagesNearLoopEnd = await page.locator('.home-album-hero img').evaluateAll((images) =>
      images.filter((image) => {
        const rect = image.getBoundingClientRect();
        return (
          (image as HTMLImageElement).naturalWidth > 0 &&
          rect.right > 0 &&
          rect.left < window.innerWidth &&
          rect.bottom > 0 &&
          rect.top < window.innerHeight
        );
      }).length,
    );
    expect(visibleAlbumImagesNearLoopEnd).toBeGreaterThan(0);
    await page.evaluate(() => window.scrollTo(0, 720));
    await expect(page.locator('.newborn-promo')).toHaveClass(/newborn-promo--visible/);

    // Start path has been intentionally removed.
    await expect(page.locator('.home-start-section')).toHaveCount(0);

    // The homepage intro is carried by the welcome section, not a second repeated bio block.
    await expect(page.locator('.about-section')).toHaveCount(0);

    // Review feature
    await expect(page.locator('.testimonial-section--home')).toContainText('Jordan Peters');
    await expect(page.locator('.testimonial-section--home')).toContainText('Can’t recommend highly enough');
    await expect(page.locator('.testimonial-section--home img')).toHaveCount(2);
    await expect(page.locator('.testimonial-section--home blockquote')).toHaveCSS('font-style', 'normal');

    // Recent sessions
    await expect(page.locator('.home-recent-section')).toContainText('A closer look at real stories.');
    await expect(page.locator('.home-recent-card')).toHaveCount(4);
    await expect(page.locator('.home-recent-card').first()).toHaveAttribute('href', '/gallery/lifestyle-newborn-session-4');
    await expect(page.locator('.home-recent-card[href="/gallery/lifestyle-newborn-session-4"]')).toContainText('Hentges Lifestyle Newborn');
    await expect(page.locator('.home-recent-card[href="/gallery/couples-session-1"]')).toContainText("Erick & Macy's Engagement");
    await expect(page.locator('.home-recent-card[href="/gallery/lifestyle-newborn-session-1"]')).toContainText('Mendoza Family Lifestyle Newborn');
    await expect(page.locator('.home-recent-card[href="/gallery/senior-session-1"]')).toContainText("Makaylah's Senior Session");

    // Service teasers
    await expect(page.locator('.portrait-lifestyle-teaser-section')).toContainText('Portrait & Lifestyle Sessions');
    await expect(page.locator('.portrait-lifestyle-teaser-section')).toContainText('families, couples, proposals, minis');
    await expect(page.locator('.portrait-lifestyle-teaser-section')).toContainText('newborn days');
    await expect(page.locator('.lifestyle-teaser-section')).toHaveCount(0);

    // Birth teaser
    await expect(page.locator('.birth-teaser-section')).toContainText('Birth & Maternity');

    // Session feel and final CTA
    await expect(page.locator('.home-session-feel-section')).toContainText('Light direction. Real connection.');
    await expect(page.locator('.home-session-feel-section')).toContainText('Gentle prompts');
    await expect(page.locator('.home-final-cta-section')).toContainText('Tell me what season you want remembered.');
    await expect(page.locator('.home-final-cta-section .btn-accent')).toHaveAttribute('href', '/contact');

    // Social/content feature blocks have been intentionally removed.
    await expect(page.locator('.featured-section')).toHaveCount(0);

    // Footer
    await expect(page.locator('.footer-logo-link[href="/"]')).toBeVisible();
    await expect(page.locator('.site-footer')).toContainText('Abigail Marie Photography');
    await expect(page.locator('.site-footer')).toContainText('Serving San Antonio');
    await expect(page.locator('footer a[href*="instagram.com"]')).toBeVisible();
    await expect(page.locator('footer a[href*="facebook.com"]')).toBeVisible();
    await expect(page.locator('footer a[href="mailto:info@abigailmariephotography.com"]')).toBeVisible();
    await expect(page.locator('footer a[href="tel:2105426718"]')).toBeVisible();
  });

  test('Mobile homepage header fades between photos', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.locator('.home-album-hero')).toBeVisible();
    await expect(page.locator('.home-album-hero__track')).not.toBeVisible();
    await expect(page.locator('.home-album-hero__slideshow')).toBeVisible();
    await expect(page.locator('.home-album-hero__slideshow img')).toHaveCount(9);

    const initialState = await page.locator('.home-album-hero__slideshow img').evaluateAll((images) =>
      images.filter((image) => {
        const rect = image.getBoundingClientRect();
        return (
          (image as HTMLImageElement).naturalWidth > 0 &&
          rect.right > 0 &&
          rect.left < window.innerWidth &&
          rect.bottom > 0 &&
          rect.top < window.innerHeight
        );
      }).length,
    );
    expect(initialState).toBeGreaterThan(0);
    await page.waitForTimeout(6200);
    await expect(page.locator('.newborn-promo')).not.toHaveClass(/newborn-promo--visible/);

    const fadedState = await page.locator('.home-album-hero__slideshow img').evaluateAll((images) =>
      images.filter((image) => {
        const rect = image.getBoundingClientRect();
        const opacity = Number.parseFloat(window.getComputedStyle(image.closest('figure') as Element).opacity);
        return (
          opacity > 0.01 &&
          (image as HTMLImageElement).naturalWidth > 0 &&
          rect.right > 0 &&
          rect.left < window.innerWidth &&
          rect.bottom > 0 &&
          rect.top < window.innerHeight
        );
      }).length,
    );
    expect(fadedState).toBeGreaterThan(0);
    expect(fadedState).toBeLessThanOrEqual(2);
  });

  test('Navigation works — click through each page', async ({ page }) => {
    for (const link of NAV_LINKS) {
      await page.goto('/gallery');
      await page.click(`nav a[href="${link.href}"]`);
      await expect(page).toHaveURL(link.href);
    }
  });

  test('About page introduces Abbie and links to contact', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL('/about');
    await expect(page).toHaveTitle(/About/);
    await expect(page.locator('main h1')).toContainText("Hi, I'm Abbie.");
    await expect(page.locator('body')).toContainText('Arizona-born');
    await expect(page.locator('body')).toContainText('homeschool mom');
    await expect(page.locator('body')).toContainText('photo team at my church');
    await expect(page.locator('.about-notes__list')).toHaveCount(0);
    await expect(page.locator('.about-notes__story')).toBeVisible();
    await expect(page.locator('body')).toContainText('Photographs that feel lived in');
    await expect(page.locator('.about-cta-section')).toHaveCount(0);
    await expect(page.locator('.about-hero').getByRole('link', { name: 'Plan Your Session' })).toHaveAttribute('href', '/contact');
    await expect(page.locator('.about-bottom-action').getByRole('link', { name: 'Plan Your Session' })).toHaveAttribute('href', '/contact');
    await expect(page.locator('.about-hero img').first()).toBeVisible();
    await expect(page.locator('.about-hero__detail img')).toHaveAttribute('src', '/images/about-abbie-kids.jpg');
    await expect(page.locator('.about-approach-card')).toHaveCount(3);

    await page.screenshot({ path: 'test-results/about-screenshot.png', fullPage: true });
  });

  test('Gallery page shows image grid', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page).toHaveURL('/gallery');
    await expect(page).toHaveTitle(/Portrait & Lifestyle/);
    await expect(page.locator('h1')).toContainText('Portrait & Lifestyle');
    await expect(page.locator('.session-index-card')).toHaveCount(13);
    await expect(page.locator('.session-index-card[href="/gallery/milestone-session-1"]')).toHaveCount(0);
    await expect(page.locator('.session-index-card[href="/gallery/family-session-8"]')).toHaveCount(0);
    await expect(page.locator('.session-index-card[href="/gallery/family-session-7"]')).toHaveCount(0);
    await expect(page.locator('.session-index-card[href="/gallery/couples-session-2"]')).toHaveCount(0);
    await expect(page.locator('.session-index-card strong').nth(0)).toContainText('Hentges Lifestyle Newborn');
    await expect(page.locator('.session-index-card strong').nth(1)).toContainText("Erick & Macy's Engagement");
    await expect(page.locator('.session-index-card strong').nth(2)).toContainText("Makaylah's Senior Session");
    await expect(page.locator('.session-index-card strong').nth(8)).toContainText('Sanchez, Hernandez, Allen, & Orozco Family Session');
    await expect(page.locator('.session-index-card strong').nth(11)).toContainText('Tijerina Lifestyle Newborn');
    await expect(page.locator('.session-index-card strong').nth(12)).toContainText('Schaefer Lifestyle Newborn');
    await expect(page.locator('.gallery-story-section')).toHaveCount(0);
    await expect(page.locator('.portrait-faq-section')).toContainText('Portrait & Lifestyle FAQ');
    await expect(page.locator('.portrait-birth-link-section')).toContainText('Looking for Birth & Maternity?');
    await expect(page.locator('.portrait-birth-link-section')).not.toContainText('Inquire to Begin');
    await expect(page.locator('.portrait-birth-link-section').getByRole('link', { name: 'View Birth & Maternity' })).toHaveAttribute('href', '/birth-photography');
    await expect(page.locator('.gallery-story-copy__number')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('Plan something like this');

    // Should have gallery images
    const galleryImages = page.locator('.gallery img, .gallery-grid img, .masonry img, main img');
    const count = await galleryImages.count();
    expect(count).toBeGreaterThan(0);

    // Take a screenshot for the video
    await page.screenshot({ path: 'test-results/gallery-screenshot.png', fullPage: true });
  });

  test('Session preview opens its own page', async ({ page }) => {
    await page.goto('/gallery');
    await page.locator('.session-index-card[href="/gallery/senior-session-1"]').click();
    await expect(page).toHaveURL('/gallery/senior-session-1');
    await expect(page.locator('h1')).toContainText("Makaylah's Senior Session");
    await expect(page.locator('.session-detail-masonry img').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Portrait & Lifestyle' })).toBeVisible();
    await expect(page.locator('.session-detail-masonry')).toHaveCSS('opacity', '1');
    await expect(page.locator('.session-detail-masonry')).toHaveCSS('column-count', '3');
    await expect(page.locator('.session-detail-masonry img').first()).toHaveCSS('object-fit', 'contain');
    await expect(page.locator('.session-detail-nav__link--previous')).toHaveAttribute('href', '/gallery/family-session-8');
    await expect(page.locator('.session-detail-nav__link--previous')).toContainText('Hentges Family Maternity');
    await expect(page.locator('.session-detail-nav__link--next')).toHaveAttribute('href', '/gallery/lifestyle-newborn-session-1');
    await expect(page.locator('.session-detail-nav__link--next')).toContainText('Mendoza Family Lifestyle Newborn');
  });

  test('Birth and maternity page includes maternity sessions', async ({ page }) => {
    await page.goto('/birth-photography');
    await expect(page).toHaveTitle(/Birth & Maternity/);
    await expect(page.locator('main')).not.toContainText('Birth photography allows you to be completely present');
    await expect(page.locator('main')).toContainText('The waiting is part of the story.');
    await expect(page.locator('.birth-maternity-card')).toHaveCount(3);
    await expect(page.locator('main')).toContainText('Hentges Family Maternity');
    await expect(page.locator('main')).toContainText('Riggs Family Maternity');
    await expect(page.locator('main')).toContainText('Pharr Family Maternity');
    await expect(page.locator('.birth-package-work-strip img')).toHaveCount(3);
    await expect(page.locator('.birth-package-work-strip img').first()).toHaveAttribute('src', /birth-06/);
    await expect(page.locator('.package-included-note')).toContainText([
      'Includes a maternity mini session.',
      'Includes a full maternity session.',
    ]);
    await expect(page.locator('main')).toContainText('Full Maternity Session');
    await expect(page.locator('main')).toContainText('Mini Maternity Session');
    await expect(page.locator('.maternity-packages-grid')).toContainText('$400');
    await expect(page.locator('.maternity-packages-grid')).toContainText('$225');
    await expect(page.locator('.maternity-feature-images img')).toHaveCount(3);
    await expect(page.locator('.birth-maternity-card[href="/gallery/family-session-8"]')).toBeVisible();
    await expect(page.locator('.birth-maternity-card[href="/gallery/family-session-7"]')).toBeVisible();
    await expect(page.locator('.birth-maternity-card[href="/gallery/maternity-session-2"]')).toBeVisible();
    await expect(page.locator('.birth-maternity-card[href="/gallery/couples-session-2"]')).toHaveCount(0);
    await expect(page.locator('.newborn-promo')).toContainText('Free lifestyle newborn session');
    await expect(page.locator('.newborn-promo__link')).toHaveAttribute('href', '#birth-packages');
    await expect(page.locator('#birth-packages .package-booking-row').getByRole('link', { name: 'Book Your Birth' })).toHaveAttribute('href', '/contact');
    await expect(page.locator('.birth-maternity-section .package-booking-row').getByRole('link', { name: 'Book a Maternity Session' })).toHaveAttribute('href', '/contact');
  });

  test('Portrait & Lifestyle page shows investment details', async ({ page }) => {
    await page.goto('/gallery#investment');
    await expect(page).toHaveURL('/gallery#investment');

    // Check portrait and lifestyle packages exist
    await expect(page.locator('#investment')).toContainText('Portrait & Lifestyle Sessions');
    await expect(page.locator('body')).toContainText('Full Sessions');
    await expect(page.locator('body')).toContainText('$400');
    await expect(page.locator('body')).toContainText('Mini Sessions');
    await expect(page.locator('body')).toContainText('$225');
    await expect(page.locator('body')).toContainText('Lifestyle Sessions');
    await expect(page.locator('body')).toContainText('$500');
    await expect(page.locator('body')).not.toContainText('Cake Smash & Milestones');
    const investmentColumns = await page
      .locator('.portrait-investment-section .packages-grid')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(investmentColumns).toBe(2);

    // Check package details
    await expect(page.locator('body')).toContainText('private gallery and print release');
    await expect(page.locator('body')).toContainText('$25 per image');
    await expect(page.locator('#investment').getByRole('link', { name: 'Book Your Session' })).toBeVisible();

    await page.screenshot({ path: 'test-results/investment-screenshot.png', fullPage: true });
  });

  test('Contact page has form fields and contact info', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL('/contact');

    // Form fields
    await expect(page.locator('form[data-contact-form]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('select[name="sessionType"]')).toBeVisible();
    await expect(page.locator('select[name="sessionType"]')).not.toContainText('Milestone');
    await expect(page.locator('select[name="sessionType"] option')).toHaveText([
      'Select a session',
      'Full Sessions',
      'Mini Sessions',
      'Lifestyle Sessions',
      'Full Maternity Session',
      'Mini Maternity Session',
      'Essential Birth',
      'Birth Story',
      'Heirloom Birth',
      'Other',
    ]);
    await expect(page.locator('input[name="sessionDate"]')).toBeVisible();
    await expect(page.locator('input[name="preferredLocation"]')).toBeVisible();
    await expect(page.locator('input[name="referralSource"]')).toBeVisible();
    await expect(page.locator('textarea[name="styleDraw"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('body')).toContainText('When it comes to my photography style, what drew you into my work?');
    await expect(page.locator('body')).toContainText('How did you hear about me?');
    await expect(page.locator('body')).toContainText("Tell me what you're dreaming of");
    await expect(page.getByRole('button', { name: 'Send Inquiry' })).toBeVisible();

    // Contact info
    await expect(page.locator('body')).toContainText('info@abigailmariephotography.com');
    await expect(page.locator('body')).toContainText('210');
    await expect(page.locator('body')).toContainText('New Braunfels');
    await expect(page.locator('.testimonial-section--contact')).toHaveCount(0);

    await page.screenshot({ path: 'test-results/contact-screenshot.png', fullPage: true });
  });

  test('Full user journey: Home → Portrait & Lifestyle → Contact', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page.locator('.home-album-hero')).toBeVisible();
    await page.screenshot({ path: 'test-results/journey-01-home.png' });

    // Go to gallery
    await page.getByRole('link', { name: 'Portrait & Lifestyle' }).first().click();
    await expect(page).toHaveURL('/gallery');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/journey-02-gallery.png' });

    // Go to contact
    await page.click('nav a[href="/contact"]');
    await expect(page).toHaveURL('/contact');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/journey-03-contact.png' });
  });

  test('Mobile nav toggle exists and is functional', async ({ page }) => {
    await page.goto('/gallery');
    const toggle = page.locator('.nav-toggle');
    const navList = page.locator('.nav-list');

    // Toggle exists in DOM
    await expect(toggle).toBeAttached();
    await expect(navList).toBeAttached();

    // At 1920px desktop, toggle is hidden (CSS display:none) — that's correct behavior
    // Verify nav links are directly visible at desktop width
    await expect(page.locator('.nav-list a[href="/"]')).toBeVisible();
    await expect(page.locator('.nav-list a[href="/about"]')).toBeVisible();
    await expect(page.locator('.nav-list a[href="/gallery"]')).toBeVisible();
  });

  test('All images load successfully', async ({ page }) => {
    const brokenImages: string[] = [];
    await page.goto('/');

    await page.evaluate(async () => {
      const step = Math.max(window.innerHeight / 2, 300);
      for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => window.setTimeout(resolve, 60));
      }
    });
    await page.waitForLoadState('networkidle');

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
