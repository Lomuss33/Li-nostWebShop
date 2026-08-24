<template>
  <div class="content-page">
    <div class="content-page__symbol" aria-hidden="true"><BrandCrest /></div>
    <p class="eyebrow">Ličnost journal</p>
    <h1>{{ title }}</h1>
    <OrnamentBand />
    <p class="content-page__copy">{{ copy }}</p>
    <NuxtLink v-if="slug !== 'contact'" to="/shop" class="ornament-button ornament-button--secondary">Discover the collection</NuxtLink>
    <NuxtLink v-else to="/request" class="ornament-button">Request assistance</NuxtLink>
  </div>
</template>
<script setup lang="ts">
const slug = String(useRoute().params.slug || '')
const pages: Record<string, [string, string]> = {
  new: [
    'New arrivals',
    'Fresh layers and considered essentials for the season ahead.',
  ],
  men: ['Men', 'A focused wardrobe of relaxed essentials and useful layers.'],
  women: ['Women', 'Modern silhouettes designed for everyday movement.'],
  collections: [
    'Collections',
    'Explore the Ličnost point of view, one collection at a time.',
  ],
  sale: ['Sale', 'A small edit of pieces made to last.'],
  about: [
    'About Ličnost',
    'Ličnost is a modern clothing label built around clarity, comfort, and character.',
  ],
  contact: [
    'Contact',
    'Questions about an order or a piece? We would love to hear from you.',
  ],
  faq: ['FAQ', 'We are preparing our full customer care guide.'],
  shipping: ['Shipping', 'Shipping details will be available at checkout.'],
  returns: [
    'Returns',
    'Returns information will be published before payments go live.',
  ],
  'size-guide': [
    'Size guide',
    'Our size guide is being prepared with each fit in mind.',
  ],
  privacy: [
    'Privacy',
    'This page will contain our privacy policy before launch.',
  ],
  terms: ['Terms', 'This page will contain our terms of sale before launch.'],
  imprint: [
    'Imprint',
    'Ličnost legal information will be published before launch.',
  ],
}
const [title, copy] = pages[slug] || [
  'Page not found',
  'The page you are looking for does not exist.',
]
</script>

<style scoped>
.content-page { position: relative; max-width: 54rem; min-height: 55vh; margin: 0 auto; padding: 7rem 2rem; text-align: center; }
.content-page__symbol { width: 54px; margin: 0 auto 1.5rem; }
.content-page .eyebrow { justify-content: center; }
.content-page h1 { margin: 1.2rem 0 2rem; font-size: clamp(4rem,8vw,7rem); font-weight: 600; letter-spacing: -.04em; line-height: .85; }
.content-page__copy { max-width: 39rem; margin: 2.2rem auto; color: var(--muted); font-family: 'Cormorant Garamond',serif; font-size: 1.55rem; line-height: 1.5; }
@media (max-width: 600px) { .content-page { padding: 5rem 1.25rem; }.content-page h1 { font-size: 4rem; }.content-page__copy { font-size: 1.3rem; } }
</style>
