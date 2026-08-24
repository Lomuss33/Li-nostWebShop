<template>
  <div class="site-shell">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <FloatingOrnaments />
    <div class="side-ornament side-ornament--left" aria-hidden="true" />
    <div class="side-ornament side-ornament--right" aria-hidden="true" />

    <div class="announcement-bar">
      <span class="announcement-star">✦</span>
      Free delivery on orders over €100
      <span class="announcement-separator">Hand-finished spirit · Modern form</span>
      <span class="announcement-star">✦</span>
    </div>
    <header class="site-header">
      <OrnamentBand />
      <div class="site-header__inner">
        <button class="menu-button md:hidden" type="button" :aria-expanded="mobileOpen" aria-controls="mobile-navigation" aria-label="Toggle menu" @click="mobileOpen = !mobileOpen">
          <span /><span /><span />
        </button>
        <NuxtLink to="/" class="brand-lockup" aria-label="Ličnost home" @click="mobileOpen = false">
          <BrandCrest />
          <span class="brand-lockup__type">Ličnost</span>
          <span class="brand-lockup__year">EST. MMXXVI</span>
        </NuxtLink>
        <nav class="site-nav hidden md:flex" aria-label="Primary navigation">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to">{{ link.label }}</NuxtLink>
        </nav>
        <div class="header-actions">
          <NuxtLink to="/shop" class="header-action" aria-label="Search products">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>
          </NuxtLink>
          <NuxtLink to="/cart" class="bag-link" aria-label="Shopping bag">
            <span>Bag</span><span class="bag-count">{{ count }}</span>
          </NuxtLink>
        </div>
      </div>
      <nav v-if="mobileOpen" id="mobile-navigation" class="mobile-nav" aria-label="Mobile navigation">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" @click="mobileOpen = false">{{ link.label }}<span>↗</span></NuxtLink>
      </nav>
    </header>

    <main id="main-content"><slot /></main>

    <footer class="site-footer">
      <OrnamentBand light />
      <div class="site-footer__inner">
        <div class="footer-brand">
          <BrandCrest />
          <div><p class="footer-name">Ličnost</p><p class="footer-tagline">Everyday pieces with a distinct identity.</p></div>
        </div>
        <div class="footer-words" aria-hidden="true">FORMA · DUŠA · TRAG</div>
        <div class="footer-links">
          <div><p class="footer-label">Discover</p><NuxtLink to="/shop">Shop all</NuxtLink><NuxtLink to="/collections">Collections</NuxtLink><NuxtLink to="/about">Our story</NuxtLink></div>
          <div><p class="footer-label">Care</p><NuxtLink to="/contact">Contact</NuxtLink><NuxtLink to="/shipping">Shipping</NuxtLink><NuxtLink to="/returns">Returns</NuxtLink></div>
          <div><p class="footer-label">Legal</p><NuxtLink to="/privacy">Privacy</NuxtLink><NuxtLink to="/terms">Terms</NuxtLink><NuxtLink to="/imprint">Imprint</NuxtLink></div>
        </div>
      </div>
      <div class="site-footer__base"><span>© {{ new Date().getFullYear() }} Ličnost</span><span>Designed between heritage and now</span></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { count } = useCart()
const mobileOpen = ref(false)
const links = [
  { label: 'New', to: '/new' },
  { label: 'Men', to: '/men' },
  { label: 'Women', to: '/women' },
  { label: 'Collections', to: '/collections' },
  { label: 'Sale', to: '/sale' },
  { label: 'All Products', to: '/shop' },
]
</script>
