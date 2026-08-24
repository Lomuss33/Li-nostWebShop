<template>
  <div v-if="product" class="product-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <NuxtLink to="/">Home</NuxtLink><span>◇</span><NuxtLink to="/shop">Shop</NuxtLink><span>◇</span><span>{{ product.name }}</span>
    </nav>

    <div class="product-layout">
      <div class="product-gallery-wrap">
        <div class="product-gallery ornament-panel">
          <span class="gallery-code">LIČNOST / {{ product.id.toUpperCase() }}</span>
          <img :src="activeImage?.url || '/placeholders/licnost-logo-mark.svg'" :alt="activeImage?.alt || product.name" />
          <span class="gallery-caption">A DISTINCT FORM · MADE TO BE LIVED IN</span>
        </div>
        <div v-if="product.images.length > 1" class="gallery-thumbnails" aria-label="Product views">
          <button
            v-for="(image, index) in product.images"
            :key="image.id"
            type="button"
            :class="{ 'is-active': selectedImage === index }"
            :aria-label="`Show ${image.alt}`"
            :aria-pressed="selectedImage === index"
            @click="selectedImage = index"
          >
            <img :src="image.url" :alt="image.alt" />
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </button>
        </div>
      </div>

      <div class="product-information">
        <div class="product-kicker">
          <p class="eyebrow">{{ product.category }}</p>
          <span v-if="product.isNew">New form</span>
          <span v-else-if="product.onSale">Private sale</span>
        </div>
        <h1>{{ product.name }}</h1>
        <div class="product-price">
          <strong>{{ formatMoney(variant?.salePrice || variant?.price || product.variants[0]?.price || { amount: 0, currency: 'EUR' }) }}</strong>
          <del v-if="variant?.salePrice">{{ formatMoney(variant.price) }}</del>
          <span>Tax included</span>
        </div>
        <OrnamentBand />
        <p class="product-description">{{ product.description }}</p>

        <fieldset class="option-picker color-picker">
          <div class="picker-heading">
            <legend>Choose your colour</legend>
            <span>{{ selectedColor }}</span>
          </div>
          <div class="color-options">
            <button
              v-for="color in availableColors"
              :key="color"
              type="button"
              :class="{ 'is-selected': selectedColor === color }"
              :aria-pressed="selectedColor === color"
              @click="selectColor(color)"
            >
              <span class="color-dot" :style="{ background: colorCss(color) }" />
              {{ color }}
            </button>
          </div>
        </fieldset>

        <fieldset class="option-picker size-picker">
          <div class="picker-heading">
            <legend>Choose your size</legend>
            <NuxtLink to="/size-guide">Size guide ↗</NuxtLink>
          </div>
          <div class="size-options">
            <button
              v-for="size in availableSizes"
              :key="size.label"
              type="button"
              :class="{ 'is-selected': selectedSize === size.label }"
              :disabled="size.stock === 0"
              :aria-pressed="selectedSize === size.label"
              @click="selectedSize = size.label"
            >
              {{ size.label }}<span v-if="size.stock === 0">Sold out</span>
            </button>
          </div>
        </fieldset>

        <button class="ornament-button add-button" :disabled="!variant || variant.stock === 0" @click="addItem">
          {{ added ? 'Added to your bag' : 'Add to bag' }}
          <span aria-hidden="true">{{ added ? '✓' : '→' }}</span>
        </button>
        <p class="stock-note" aria-live="polite">
          <span :class="{ 'is-low': variant && variant.stock <= 5 }" />
          {{ stockMessage }}
        </p>
        <p class="delivery-note"><span>✦</span> Complimentary delivery over €100 · Easy returns</p>

        <dl class="product-details">
          <div><dt>Material</dt><dd>{{ product.material }}</dd></div>
          <div><dt>Fit</dt><dd>{{ product.fit }}</dd></div>
          <div><dt>Care</dt><dd>{{ product.care }}</dd></div>
        </dl>
      </div>
    </div>

    <section v-if="relatedProducts?.length" class="related-selection">
      <div class="related-heading">
        <div>
          <p class="eyebrow">Continue exploring</p>
          <h2 class="section-heading">More distinct forms</h2>
        </div>
        <NuxtLink class="ornament-button ornament-button--secondary" to="/shop">View all pieces <span>↗</span></NuxtLink>
      </div>
      <div class="related-grid">
        <ProductCard v-for="related in relatedProducts" :key="related.id" :product="related" />
      </div>
    </section>
  </div>

  <div v-else class="not-found ornament-panel">
    <p class="eyebrow">Lost thread</p>
    <h1>Product not found</h1>
    <NuxtLink class="ornament-button" to="/shop">Back to shop</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/../shared/types/domain'

const route = useRoute()
const slug = String(route.params.slug)
const { data: product } = await useFetch<Product>(`/api/products/${slug}`)
const { data: relatedProducts } = await useFetch<Product[]>(`/api/products?limit=3&exclude=${encodeURIComponent(slug)}`)
const initialVariant = product.value?.variants.find((item) => item.active && item.stock > 0) || product.value?.variants[0]
const selectedColor = ref(initialVariant?.color || '')
const selectedSize = ref(initialVariant?.size || '')
const selectedImage = ref(0)
const added = ref(false)
let addedTimer: ReturnType<typeof setTimeout> | undefined

const activeImage = computed(() => product.value?.images[selectedImage.value] || product.value?.images[0])
const availableColors = computed(() => [...new Set(product.value?.variants.map((item) => item.color) || [])])
const availableSizes = computed(() => [...new Set(product.value?.variants.filter((item) => item.color === selectedColor.value).map((item) => item.size) || [])].map((label) => ({
  label,
  stock: product.value?.variants.find((item) => item.color === selectedColor.value && item.size === label && item.active)?.stock || 0,
})))
const variant = computed(() => product.value?.variants.find((item) => item.color === selectedColor.value && item.size === selectedSize.value && item.active))
const stockMessage = computed(() => {
  if (!variant.value || variant.value.stock === 0) return 'This combination is currently unavailable'
  if (variant.value.stock <= 5) return `Only ${variant.value.stock} left in this size`
  return 'Ready to leave the studio'
})
const { add } = useCart()

const colorCss = (color: string) => ({
  Black: '#20232a',
  White: '#f6f2e9',
  Charcoal: '#4c4d50',
  Navy: '#203d70',
  Olive: '#667052',
  Stone: '#aaa294',
  Cream: '#e8deca',
  Natural: '#d7c7a9',
  'Heather Gray': '#969696',
}[color] || '#a62532')

const selectColor = (color: string) => {
  selectedColor.value = color
  const sameSize = product.value?.variants.find((item) => item.color === color && item.size === selectedSize.value && item.active && item.stock > 0)
  if (!sameSize) selectedSize.value = product.value?.variants.find((item) => item.color === color && item.active && item.stock > 0)?.size || ''
}

const addItem = () => {
  if (!product.value || !variant.value || variant.value.stock === 0) return
  add({
    variantId: variant.value.id,
    quantity: 1,
    productId: product.value.id,
    name: product.value.name,
    color: variant.value.color,
    size: variant.value.size,
    price: variant.value.salePrice || variant.value.price,
    imageUrl: product.value.images[0]?.url || '/placeholders/licnost-logo-mark.svg',
  })
  added.value = true
  clearTimeout(addedTimer)
  addedTimer = setTimeout(() => { added.value = false }, 1800)
}

onBeforeUnmount(() => clearTimeout(addedTimer))
</script>

<style scoped>
.product-page { max-width: var(--container-wide); margin: 0 auto; padding: 2.2rem var(--page-gutter) 7rem; }
.breadcrumbs { display: flex; flex-wrap: wrap; gap: .7rem; align-items: center; margin-bottom: 2rem; color: var(--muted); font-size: .58rem; letter-spacing: .1em; text-transform: uppercase; }
.breadcrumbs span:last-child { color: var(--ink); }
.breadcrumbs > span:not(:last-child) { color: var(--gold); }
.product-layout { display: grid; max-width: var(--container-main); grid-template-columns: minmax(0,1.12fr) minmax(350px,.88fr); align-items: start; gap: clamp(3rem,7vw,7rem); margin: 0 auto; }
.product-gallery-wrap { min-width: 0; }
.product-gallery { padding: 13px; background: #ded3c3; }
.product-gallery > img { display: block; width: 100%; aspect-ratio: 4/5; border: 1px solid rgba(23,32,56,.18); object-fit: cover; transition: opacity 200ms ease; }
.gallery-code { position: absolute; top: 28px; left: 28px; z-index: 4; color: rgba(23,32,56,.62); font-size: .5rem; font-weight: 600; letter-spacing: .16em; }
.gallery-caption { position: absolute; right: 28px; bottom: 27px; left: 28px; z-index: 4; color: rgba(23,32,56,.62); font-size: .5rem; font-weight: 600; letter-spacing: .13em; text-align: right; }
.gallery-thumbnails { display: grid; grid-template-columns: repeat(3,1fr); gap: .65rem; margin-top: .8rem; }
.gallery-thumbnails button { position: relative; overflow: hidden; border: 1px solid var(--line); background: #ded3c3; padding: 5px; transition: border-color 180ms ease, transform 180ms ease; }
.gallery-thumbnails button:hover { border-color: var(--red); transform: translateY(-2px); }
.gallery-thumbnails button.is-active { border-color: var(--ink); box-shadow: inset 0 0 0 2px var(--paper), inset 0 0 0 3px var(--ink); }
.gallery-thumbnails img { display: block; width: 100%; aspect-ratio: 4/2.5; object-fit: cover; }
.gallery-thumbnails span { position: absolute; right: 10px; bottom: 8px; background: rgba(243,238,228,.88); padding: .25rem .35rem; color: var(--ink); font-size: .45rem; font-weight: 600; }
.product-information { position: sticky; top: 142px; padding-top: 1rem; }
.product-kicker { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.product-kicker > span { border: 1px solid var(--red); padding: .4rem .6rem; color: var(--red); font-size: .48rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
.product-information h1 { max-width: 10ch; margin-top: 1rem; font-size: clamp(3.4rem,5vw,5.5rem); font-weight: 600; letter-spacing: -.035em; line-height: .88; }
.product-price { display: flex; align-items: baseline; gap: .8rem; margin: 1.5rem 0 1rem; }
.product-price strong { font-family: 'Cormorant Garamond',serif; font-size: 1.7rem; font-weight: 600; }
.product-price del { color: var(--muted); font-size: .7rem; }
.product-price > span { margin-left: auto; color: var(--muted); font-size: .52rem; letter-spacing: .1em; text-transform: uppercase; }
.product-description { margin-top: 1.6rem; color: var(--muted); font-size: .88rem; line-height: 1.8; }
.option-picker { margin-top: 1.8rem; }
.picker-heading { display: flex; align-items: center; justify-content: space-between; }
.picker-heading legend { font-size: .68rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
.picker-heading > span, .picker-heading a { color: var(--muted); font-size: .58rem; }
.picker-heading a { border-bottom: 1px solid var(--line); }
.color-options { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .8rem; }
.color-options button { display: flex; min-height: 43px; align-items: center; gap: .55rem; border: 1px solid var(--line); padding: .65rem .85rem; color: var(--muted); font-size: .62rem; transition: border-color 160ms ease, color 160ms ease, background 160ms ease; }
.color-options button:hover { border-color: var(--red); color: var(--red); }
.color-options button.is-selected { border-color: var(--ink); background: var(--ink); color: white; }
.color-dot { width: 12px; height: 12px; border: 2px solid var(--paper); border-radius: 50%; box-shadow: 0 0 0 1px rgba(23,32,56,.35); }
.size-options { display: grid; grid-template-columns: repeat(4,1fr); gap: .5rem; margin-top: .8rem; }
.size-options button { min-height: 52px; border: 1px solid var(--line); font-size: .72rem; transition: border-color 150ms ease, background 150ms ease, color 150ms ease; }
.size-options button:hover:not(:disabled) { border-color: var(--red); color: var(--red); }
.size-options button.is-selected { border-color: var(--ink); background: var(--ink); color: white; box-shadow: inset 0 0 0 3px var(--ink),inset 0 0 0 4px #d8b878; }
.size-options button:disabled { cursor: not-allowed; background: linear-gradient(to top right,transparent 49%,rgba(23,32,56,.16) 50%,transparent 51%); color: #99938a; }
.size-options button span { display: block; margin-top: .2rem; font-size: .43rem; text-transform: uppercase; }
.add-button { width: 100%; margin-top: 1.3rem; }
.add-button > span { margin-left: auto; font-size: 1rem; }
.add-button:disabled { cursor: not-allowed; opacity: .45; }
.stock-note { display: flex; align-items: center; justify-content: center; gap: .45rem; margin-top: .75rem; color: var(--muted); font-size: .54rem; letter-spacing: .07em; }
.stock-note > span { width: 6px; height: 6px; border-radius: 50%; background: #456b4d; box-shadow: 0 0 0 3px rgba(69,107,77,.12); }
.stock-note > span.is-low { background: var(--red); box-shadow: 0 0 0 3px rgba(166,37,50,.12); }
.delivery-note { display: flex; justify-content: center; gap: .6rem; margin-top: .7rem; color: var(--muted); font-size: .57rem; letter-spacing: .06em; }
.delivery-note span { color: var(--gold); }
.product-details { margin-top: 2rem; border-top: 1px solid var(--line); }
.product-details div { display: grid; grid-template-columns: 90px 1fr; gap: 1rem; border-bottom: 1px solid var(--line); padding: .9rem 0; font-size: .68rem; }
.product-details dt { color: var(--red); font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
.product-details dd { color: var(--muted); }
.related-selection { margin-top: clamp(6rem,10vw,10rem); border-top: 1px solid var(--line); padding-top: 3rem; }
.related-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 2.2rem; }
.related-heading h2 { margin-top: .75rem; }
.related-heading .ornament-button span { margin-left: auto; }
.related-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: clamp(1.25rem,2vw,2rem); }
.not-found { max-width: 46rem; margin: 6rem auto; padding: 6rem 2rem; text-align: center; }
.not-found h1 { margin: 1rem 0 2rem; font-size: 3rem; }
@media (max-width: 900px) {
  .product-page { padding: 1.8rem 1.25rem 4rem; }
  .product-layout { grid-template-columns: 1fr; gap: 2.5rem; }
  .product-gallery-wrap { width: min(100%,680px); margin: 0 auto; }
  .product-information { position: static; width: min(100%,680px); margin: 0 auto; padding-top: 0; }
  .related-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .related-grid :deep(.product-card:last-child) { display: none; }
}
@media (max-width: 600px) {
  .breadcrumbs { margin-bottom: 1.3rem; }
  .product-information h1 { font-size: 3.35rem; }
  .gallery-thumbnails { gap: .4rem; }
  .gallery-caption { text-align: left; }
  .size-options { grid-template-columns: repeat(3,1fr); }
  .related-heading { align-items: start; flex-direction: column; }
  .related-heading .ornament-button { width: 100%; }
  .related-grid { grid-template-columns: 1fr; }
  .related-grid :deep(.product-card:last-child) { display: block; }
}
</style>
