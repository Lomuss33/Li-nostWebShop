<template>
  <article class="product-card" :class="{ 'product-card--added': quickAdded }">
    <NuxtLink :to="`/product/${product.slug}`" class="product-card__media">
      <img
        :src="product.images[0]?.url || '/placeholders/licnost-logo-mark.svg'"
        :alt="product.images[0]?.alt || product.name"
        loading="lazy"
      />
      <div class="product-card__status">
        <span v-if="product.onSale" class="product-card__badge product-card__badge--sale">Sale</span>
        <span v-else-if="product.isNew" class="product-card__badge">New</span>
      </div>
      <span class="product-card__index" aria-hidden="true">LČ / {{ shortId }}</span>
      <span class="product-card__view">Open piece <b>↗</b></span>
      <span class="product-card__corner product-card__corner--one" aria-hidden="true" />
      <span class="product-card__corner product-card__corner--two" aria-hidden="true" />
      <span class="product-card__shine" aria-hidden="true" />
    </NuxtLink>

    <div class="product-card__info">
      <div class="product-card__topline">
        <p class="product-card__category">{{ product.category }} · {{ product.collection }}</p>
        <span class="product-card__price">
          {{ formatMoney(displayPrice) }}
        </span>
      </div>
      <NuxtLink :to="`/product/${product.slug}`" class="product-card__title-link">
        <h3>{{ product.name }}</h3><span aria-hidden="true">↗</span>
      </NuxtLink>
      <p class="product-card__description">{{ product.description }}</p>

      <div class="product-card__options">
        <div class="product-card__color">
          <span class="color-swatch" />{{ product.variants[0]?.color || 'Core' }}
        </div>
        <ul class="product-card__sizes" aria-label="Available sizes">
          <li
            v-for="size in availableSizes"
            :key="size.label"
            :class="{ 'is-sold-out': size.soldOut }"
          >
            {{ size.label }}
          </li>
        </ul>
      </div>

      <div class="product-card__actions">
        <NuxtLink :to="`/product/${product.slug}`" class="card-action card-action--details">
          Details <span>↗</span>
        </NuxtLink>
        <button
          class="card-action card-action--quick"
          type="button"
          :disabled="!quickVariant"
          @click="quickAdd"
        >
          <span>{{ quickAdded ? 'Added' : `Quick add · ${quickVariant?.size || ''}` }}</span>
          <b aria-hidden="true">{{ quickAdded ? '✓' : '+' }}</b>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/../shared/types/domain'

const props = defineProps<{ product: Product }>()
const shortId = computed(() => props.product.id.slice(-2).toUpperCase().padStart(2, '0'))
const quickVariant = computed(() => props.product.variants.find((variant) => variant.active && variant.stock > 0))
const availableSizes = computed(() => [...new Set(props.product.variants.map((variant) => variant.size))].map((label) => ({
  label,
  soldOut: !props.product.variants.some((variant) => variant.size === label && variant.active && variant.stock > 0),
})))
const displayPrice = computed(() => quickVariant.value?.salePrice || quickVariant.value?.price || { amount: 0, currency: 'EUR' as const })
const quickAdded = ref(false)
let feedbackTimer: ReturnType<typeof setTimeout> | undefined
const { add } = useCart()

const quickAdd = () => {
  const variant = quickVariant.value
  if (!variant) return
  add({
    variantId: variant.id,
    quantity: 1,
    productId: props.product.id,
    name: props.product.name,
    color: variant.color,
    size: variant.size,
    price: variant.salePrice || variant.price,
    imageUrl: props.product.images[0]?.url || '/placeholders/licnost-logo-mark.svg',
  })
  quickAdded.value = true
  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { quickAdded.value = false }, 1800)
}

onBeforeUnmount(() => clearTimeout(feedbackTimer))
</script>

<style scoped>
.product-card {
  min-width: 0;
  border: 1px solid var(--line);
  background: rgba(250,247,239,.86);
  box-shadow: 0 0 0 rgba(23,32,56,0);
  transition: transform 420ms cubic-bezier(.2,.75,.2,1), box-shadow 420ms ease, border-color 250ms ease;
}
.product-card:hover {
  z-index: 3;
  border-color: rgba(166,37,50,.45);
  box-shadow: 14px 16px 0 rgba(32,61,112,.11), 0 22px 50px rgba(23,32,56,.1);
  transform: translateY(-9px);
}
.product-card__media {
  position: relative;
  display: block;
  aspect-ratio: 4/5;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
  background: #e2d8c8;
}
.product-card__media::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  content: '';
  background: linear-gradient(180deg,transparent 52%,rgba(23,32,56,.54));
  opacity: 0;
  transition: opacity 350ms ease;
}
.product-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 750ms cubic-bezier(.18,.72,.18,1), filter 450ms ease;
}
.product-card__status { position: absolute; top: 15px; left: 15px; z-index: 4; display: flex; gap: .4rem; }
.product-card__badge { border: 1px solid var(--ink); background: rgba(243,238,228,.92); padding: .5rem .72rem; color: var(--ink); font-size: .52rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; backdrop-filter: blur(7px); }
.product-card__badge--sale { border-color: var(--red); background: var(--red); color: white; }
.product-card__index { position: absolute; top: 18px; right: 18px; z-index: 4; color: rgba(23,32,56,.65); font-size: .48rem; font-weight: 600; letter-spacing: .14em; }
.product-card__view { position: absolute; right: 19px; bottom: 18px; left: 19px; z-index: 3; display: flex; align-items: center; justify-content: space-between; color: white; font-size: .61rem; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; opacity: 0; transform: translateY(13px); transition: opacity 320ms ease, transform 320ms ease; }
.product-card__view b { color: #e0bd7a; font-size: 1.1rem; }
.product-card__corner { position: absolute; z-index: 3; width: 18px; height: 18px; border-color: var(--red); opacity: .8; transition: width 350ms ease, height 350ms ease; }
.product-card__corner--one { top: 8px; left: 8px; border-top: 1px solid; border-left: 1px solid; }
.product-card__corner--two { right: 8px; bottom: 8px; border-right: 1px solid; border-bottom: 1px solid; }
.product-card__shine { position: absolute; top: -30%; bottom: -30%; left: -55%; z-index: 2; width: 25%; background: linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent); opacity: 0; transform: rotate(14deg); }
.product-card__info { padding: clamp(1rem,1.7vw,1.35rem); }
.product-card__topline { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.product-card__category { overflow: hidden; color: var(--red); font-size: .5rem; font-weight: 600; letter-spacing: .14em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.product-card__price { flex: none; font-size: .71rem; font-weight: 600; }
.product-card__title-link { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: .65rem; }
.product-card h3 { font-size: clamp(1.5rem,2.2vw,2rem); font-weight: 600; letter-spacing: -.02em; line-height: 1; }
.product-card__title-link > span { color: var(--gold); font-size: .9rem; opacity: 0; transform: translate(-7px,7px); transition: opacity 220ms ease, transform 220ms ease; }
.product-card__description { display: -webkit-box; min-height: 2.7em; margin-top: .65rem; overflow: hidden; color: var(--muted); font-size: .67rem; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.product-card__options { display: flex; min-height: 40px; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; border-top: 1px solid var(--line); padding-top: .8rem; }
.product-card__color { display: flex; align-items: center; gap: .45rem; color: var(--muted); font-size: .56rem; }
.color-swatch { width: 10px; height: 10px; border: 2px solid #eee8dd; border-radius: 50%; background: #24272c; box-shadow: 0 0 0 1px rgba(23,32,56,.35); }
.product-card__sizes { display: flex; align-items: center; gap: .48rem; color: var(--muted); font-size: .5rem; }
.product-card__sizes li { position: relative; }
.product-card__sizes li.is-sold-out { opacity: .35; }
.product-card__sizes li.is-sold-out::after { position: absolute; top: 50%; left: -2px; width: calc(100% + 4px); height: 1px; content: ''; background: currentColor; transform: rotate(-25deg); }
.product-card__actions { display: grid; grid-template-columns: .75fr 1.25fr; gap: .55rem; margin-top: 1rem; }
.card-action { position: relative; display: flex; min-height: 43px; align-items: center; justify-content: space-between; gap: .6rem; overflow: hidden; border: 1px solid var(--ink); padding: .65rem .8rem; font-size: .56rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; transition: color 220ms ease, background 220ms ease, border-color 220ms ease, transform 220ms ease; }
.card-action--details { background: transparent; color: var(--ink); }
.card-action--quick { background: var(--ink); color: white; }
.card-action--quick::before { position: absolute; inset: 0; content: ''; background: var(--red); transform: translateX(-102%); transition: transform 320ms cubic-bezier(.2,.75,.2,1); }
.card-action--quick span, .card-action--quick b { position: relative; z-index: 1; }
.card-action--quick b { color: #e0bd7a; font-size: .95rem; }
.card-action:hover { transform: translateY(-2px); }
.card-action--details:hover { border-color: var(--red); color: var(--red); }
.card-action--quick:hover::before, .product-card--added .card-action--quick::before { transform: translateX(0); }
.product-card--added { border-color: var(--red); }
.product-card:hover .product-card__media img { transform: scale(1.055); filter: saturate(.86) contrast(1.03); }
.product-card:hover .product-card__media::after { opacity: 1; }
.product-card:hover .product-card__view { opacity: 1; transform: translateY(0); }
.product-card:hover .product-card__title-link > span { opacity: 1; transform: translate(0,0); }
.product-card:hover .product-card__corner { width: 28px; height: 28px; }
.product-card:hover .product-card__shine { opacity: 1; animation: card-shine 1s ease forwards; }
@keyframes card-shine { to { left: 125%; } }
@media (max-width: 560px) {
  .product-card__info { padding: 1.2rem; }
  .product-card h3 { font-size: 1.75rem; }
  .product-card__description { font-size: .72rem; }
  .product-card__view { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .product-card, .product-card__media img, .product-card__view, .card-action { transition: none; }
  .product-card:hover { transform: none; }
  .product-card__shine { display: none; }
}
</style>
