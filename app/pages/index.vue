<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-copy">
        <p class="eyebrow">New collection · 01</p>
        <h1>Identity, <em>stitched</em> into every day.</h1>
        <p class="hero-intro">
          Modern silhouettes carrying a quiet trace of ornament—made for movement,
          memory, and a life entirely your own.
        </p>
        <div class="hero-actions">
          <NuxtLink class="ornament-button" to="/collections">Explore collection</NuxtLink>
          <NuxtLink class="ornament-button ornament-button--secondary" to="/shop">Shop all pieces</NuxtLink>
        </div>
        <div class="hero-notes">
          <span><b>01</b> Considered form</span>
          <span><b>02</b> Lasting material</span>
          <span><b>03</b> Distinct detail</span>
        </div>
      </div>

      <div class="hero-visual ornament-panel">
        <div class="hero-visual__label">THE NEW FOLKLORE</div>
        <img src="/placeholders/licnost-hero-ornamental.svg" alt="Abstract Ličnost textile composition in red, cream and blue" />
        <div class="hero-seal" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs><path id="seal-path" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" /></defs>
            <text><textPath href="#seal-path">LIČNOST · FORMA · DUŠA · TRAG · </textPath></text>
            <path d="m60 38 6 15 16 7-16 7-6 15-6-15-16-7 16-7 6-15Z" />
          </svg>
        </div>
      </div>
    </section>

    <div class="home-band"><OrnamentBand /></div>

    <section class="featured-section">
      <div class="featured-heading">
        <div>
          <p class="eyebrow">The full selection</p>
          <h2 class="section-heading">Find your piece</h2>
        </div>
        <p class="featured-copy">Explore the complete Ličnost edit through generous product cards, clear details, and quick selection.</p>
        <NuxtLink to="/shop" class="text-link">View all pieces <span>↗</span></NuxtLink>
      </div>
      <nav class="catalog-links" aria-label="Browse product categories">
        <NuxtLink to="/shop" class="is-active">All pieces <span>{{ products.length }}</span></NuxtLink>
        <NuxtLink v-for="category in categories" :key="category" :to="`/shop?category=${encodeURIComponent(category)}`">
          {{ category }} <span>{{ categoryCount(category) }}</span>
        </NuxtLink>
      </nav>
      <div class="product-grid">
        <ProductCard v-for="p in products" :key="p.id" :product="p" />
      </div>
    </section>

    <section class="manifesto-section">
      <div class="manifesto-mark"><BrandCrest /></div>
      <p class="eyebrow">The Ličnost approach</p>
      <blockquote>
        “Not costume. Not nostalgia. A living language of shape, rhythm,
        and <em>character.</em>”
      </blockquote>
      <NuxtLink to="/about" class="manifesto-link">Read our story <span>→</span></NuxtLink>
      <div class="manifesto-corners" aria-hidden="true"><span /><span /><span /><span /></div>
    </section>

    <section class="principles-section">
      <p class="eyebrow">Made with intention</p>
      <div class="principles-grid">
        <article v-for="(principle, index) in principles" :key="principle.title">
          <span class="principle-number">0{{ index + 1 }}</span>
          <svg viewBox="0 0 76 76" aria-hidden="true">
            <path d="M38 3 49 27l24 11-24 11-11 24-11-24L3 38l24-11L38 3Z" />
            <circle cx="38" cy="38" r="8" />
          </svg>
          <h3>{{ principle.title }}</h3>
          <p>{{ principle.copy }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/products')
const products = computed(() => (data.value || []).slice(0, 8))
const categories = ['T-Shirts', 'Hoodies', 'Jackets', 'Accessories'] as const
const categoryCount = (category: (typeof categories)[number]) => products.value.filter((product) => product.category === category).length
const principles = [
  { title: 'Quiet ornament', copy: 'Precise details inspired by stitch, symbol, and inherited geometry.' },
  { title: 'Modern proportion', copy: 'Relaxed forms designed around how bodies actually move through a day.' },
  { title: 'Personal character', copy: 'Clothes that frame the person—never the other way around.' },
]
</script>

<style scoped>
.hero-section { display: grid; max-width: var(--container-wide); min-height: 720px; grid-template-columns: minmax(0,.92fr) minmax(460px,1.08fr); align-items: center; gap: clamp(3rem,7vw,7rem); margin: 0 auto; padding: 5rem var(--page-gutter) 6rem; }
.hero-copy { position: relative; z-index: 2; padding-left: 1rem; }
.hero-copy h1 { max-width: 680px; margin-top: 1.4rem; font-size: clamp(4rem,7.2vw,7.8rem); font-weight: 600; letter-spacing: -.055em; line-height: .78; }
.hero-copy h1 em { color: var(--red); font-weight: 500; }
.hero-intro { max-width: 34rem; margin-top: 2rem; color: var(--muted); font-size: 1rem; line-height: 1.8; }
.hero-actions { display: flex; flex-wrap: wrap; gap: .8rem; margin-top: 2.3rem; }
.hero-notes { display: grid; grid-template-columns: repeat(3,1fr); gap: .8rem; margin-top: 3rem; padding-top: 1.2rem; border-top: 1px solid var(--line); color: var(--muted); font-size: .61rem; letter-spacing: .08em; text-transform: uppercase; }
.hero-notes span { display: flex; flex-direction: column; gap: .3rem; }
.hero-notes b { color: var(--red); font-size: .54rem; font-weight: 600; }
.hero-visual { position: relative; justify-self: end; width: min(100%, 590px); padding: 13px; background: #ded3c1; transform: rotate(.7deg); }
.hero-visual::before { top: 18px; left: 18px; width: 28px; height: 28px; }
.hero-visual::after { right: 18px; bottom: 18px; width: 28px; height: 28px; }
.hero-visual img { display: block; width: 100%; aspect-ratio: 4/5; object-fit: cover; border: 1px solid rgba(23,32,56,.3); }
.hero-visual__label { position: absolute; top: 50%; right: -77px; z-index: 3; color: var(--blue); font-size: .55rem; font-weight: 600; letter-spacing: .28em; transform: rotate(90deg); }
.hero-seal { position: absolute; right: -47px; bottom: -42px; z-index: 5; width: 124px; height: 124px; border: 1px solid var(--line); border-radius: 50%; background: rgba(243,238,228,.93); color: var(--red); animation: seal-turn 24s linear infinite; box-shadow: 0 8px 35px rgba(23,32,56,.12); }
.hero-seal svg { width: 100%; overflow: visible; }
.hero-seal text { fill: var(--ink); font-family: 'DM Sans',sans-serif; font-size: 7px; font-weight: 600; letter-spacing: 2.2px; }
.hero-seal > svg > path:last-child { fill: none; stroke: currentColor; stroke-width: 1; }
.home-band { margin: 0 auto 1rem; }
.featured-section { max-width: var(--container-wide); margin: 0 auto; padding: var(--section-space) var(--page-gutter); }
.featured-heading { display: grid; grid-template-columns: 1fr 340px auto; align-items: end; gap: 2rem; margin-bottom: 3rem; }
.featured-heading h2 { margin-top: 1rem; }
.featured-copy { color: var(--muted); font-size: .84rem; line-height: 1.7; }
.text-link { padding-bottom: .3rem; border-bottom: 1px solid var(--ink); font-size: .68rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
.text-link span { color: var(--red); }
.catalog-links { display: flex; align-items: center; gap: .55rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: .35rem; scrollbar-width: thin; }
.catalog-links a { display: inline-flex; min-height: 40px; flex: none; align-items: center; gap: .7rem; border: 1px solid var(--line); padding: .6rem .8rem; font-size: .57rem; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; transition: color 180ms ease,border-color 180ms ease,background 180ms ease; }
.catalog-links a span { display: grid; width: 20px; height: 20px; place-items: center; background: rgba(32,61,112,.08); color: var(--muted); font-size: .48rem; }
.catalog-links a:hover { border-color: var(--red); color: var(--red); }
.catalog-links a.is-active { border-color: var(--ink); background: var(--ink); color: #fff; }
.catalog-links a.is-active span { background: var(--red); color: white; }
.product-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: clamp(1.25rem,2vw,2rem); }
.manifesto-section { position: relative; max-width: 78rem; margin: 5rem auto; overflow: hidden; background: var(--blue); padding: 7rem 5rem; color: #f7f1e6; text-align: center; box-shadow: 18px 18px 0 rgba(166,37,50,.12); }
.manifesto-section::before { position: absolute; inset: 17px; content: ''; border: 1px solid rgba(245,239,227,.25); pointer-events: none; }
.manifesto-section .eyebrow { color: #d4b77f; }
.manifesto-mark { width: 58px; margin: 0 auto 1.5rem; color: #f5efe3; }
.manifesto-section blockquote { max-width: 58rem; margin: 2rem auto; font-family: 'Cormorant Garamond',serif; font-size: clamp(2.5rem,5.2vw,5.2rem); line-height: .98; }
.manifesto-section blockquote em { color: #d7b572; }
.manifesto-link { display: inline-flex; gap: .8rem; align-items: center; border-bottom: 1px solid rgba(255,255,255,.5); padding: .5rem 0; font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; }
.manifesto-link span { color: #d7b572; }
.manifesto-corners span { position: absolute; width: 9px; height: 9px; background: #d7b572; transform: rotate(45deg); }
.manifesto-corners span:nth-child(1) { top: 13px; left: 13px; }.manifesto-corners span:nth-child(2) { top: 13px; right: 13px; }.manifesto-corners span:nth-child(3) { bottom: 13px; left: 13px; }.manifesto-corners span:nth-child(4) { right: 13px; bottom: 13px; }
.principles-section { max-width: 74rem; margin: 0 auto; padding: 6rem 2rem 2rem; text-align: center; }
.principles-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; margin-top: 3rem; background: var(--line); border: 1px solid var(--line); }
.principles-grid article { position: relative; background: rgba(243,238,228,.96); padding: 3.5rem 2rem; }
.principles-grid svg { width: 52px; margin: 0 auto 1.5rem; fill: none; stroke: var(--red); stroke-width: 1; }
.principles-grid h3 { font-size: 1.8rem; font-weight: 600; }
.principles-grid p { margin-top: .8rem; color: var(--muted); font-size: .8rem; line-height: 1.7; }
.principle-number { position: absolute; top: 1rem; left: 1rem; color: var(--gold); font-size: .55rem; letter-spacing: .12em; }
@keyframes seal-turn { to { transform: rotate(360deg); } }
@media (max-width: 900px) {
  .hero-section { min-height: auto; grid-template-columns: 1fr; padding-top: 4rem; }
  .hero-copy { padding-left: 0; }
  .hero-copy h1 { max-width: 760px; }
  .hero-visual { justify-self: center; width: min(85%,560px); }
  .featured-heading { grid-template-columns: 1fr auto; }
  .featured-copy { display: none; }
  .product-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 2rem 1rem; }
  .manifesto-section { margin-right: 1.25rem; margin-left: 1.25rem; padding: 5rem 2rem; }
}
@media (max-width: 600px) {
  .hero-section { gap: 3rem; padding: 3.5rem 1.25rem 4.5rem; }
  .hero-copy h1 { font-size: 4.2rem; }
  .hero-actions { display: grid; }
  .hero-notes { gap: .45rem; }
  .hero-notes span { font-size: .52rem; }
  .hero-visual { width: calc(100% - 1rem); }
  .hero-visual__label { display: none; }
  .hero-seal { right: -25px; bottom: -38px; width: 100px; }
  .featured-section { padding: 4rem var(--page-gutter); }
  .featured-heading { grid-template-columns: 1fr; gap: 1rem; }
  .text-link { justify-self: start; }
  .manifesto-section { padding: 4.5rem 1.5rem; }
  .principles-section { padding: 4rem 1.25rem 0; }
  .principles-grid { grid-template-columns: 1fr; }
  .product-grid { grid-template-columns: 1fr; gap: 2rem; }
}
@media (min-width: 901px) and (max-width: 1379px) { .product-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
@media (prefers-reduced-motion: reduce) { .hero-seal { animation: none; } }
</style>
