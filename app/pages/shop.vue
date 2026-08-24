<template>
  <div class="shop-page">
    <div class="shop-heading">
      <div>
        <p class="eyebrow">Ličnost shop</p>
        <h1 class="section-heading">The complete edit</h1>
        <p>Modern essentials, quiet symbols, and silhouettes with a point of view.</p>
      </div>
      <span class="piece-count"><b>{{ filtered.length }}</b> pieces</span>
    </div>
    <OrnamentBand />
    <div class="catalog-toolbar">
      <div class="filter-row" aria-label="Filter products by category">
        <span class="filter-label">Filter by</span>
        <button
          v-for="category in categories"
          :key="category"
          :class="{ 'is-active': selected === category }"
          :aria-pressed="selected === category"
          @click="setCategory(category)"
        >
          {{ category }} <span>{{ categoryTotal(category) }}</span>
        </button>
      </div>
      <div class="catalog-controls">
        <label>
          <span>Sort</span>
          <select v-model="sortBy" aria-label="Sort products">
            <option value="featured">Featured</option>
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
        <div class="density-toggle" aria-label="Product grid size">
          <button type="button" :class="{ 'is-active': density === 'large' }" :aria-pressed="density === 'large'" aria-label="Large product cards" @click="density = 'large'">
            <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="1" y="1" width="8" height="18"/><rect x="11" y="1" width="8" height="18"/></svg>
          </button>
          <button type="button" :class="{ 'is-active': density === 'compact' }" :aria-pressed="density === 'compact'" aria-label="Compact product cards" @click="density = 'compact'">
            <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="1" y="1" width="5" height="18"/><rect x="7.5" y="1" width="5" height="18"/><rect x="14" y="1" width="5" height="18"/></svg>
          </button>
        </div>
      </div>
    </div>
    <div class="results-line" aria-live="polite">
      <span>{{ selected === 'All' ? 'All forms' : selected }}</span>
      <span>{{ filtered.length }} results</span>
    </div>
    <div v-if="status === 'pending'" class="shop-grid shop-grid--skeleton" aria-label="Loading products">
      <div v-for="n in 6" :key="n" class="skeleton-card"><span /><span /><span /></div>
    </div>
    <div v-else-if="error" class="empty-state ornament-panel">
      <span class="empty-symbol">◇</span>
      <h2>The collection could not be loaded.</h2>
      <p>Please refresh the page or return in a moment.</p>
      <button class="ornament-button ornament-button--secondary" @click="refresh()">Try again</button>
    </div>
    <div v-else-if="!filtered.length" class="empty-state ornament-panel">
      <span class="empty-symbol">✦</span>
      <h2>No products match these filters.</h2>
      <p>
        Try removing “Black” or “XL” to see more products.
      </p>
      <button class="ornament-button ornament-button--secondary" @click="selected = 'All'">
        Clear filters
      </button>
    </div>
    <div
      v-else
      class="shop-grid"
      :class="{ 'shop-grid--compact': density === 'compact' }"
    >
      <ProductCard v-for="p in visibleProducts" :key="p.id" :product="p" />
    </div>
    <div v-if="hasMore" class="load-more">
      <p><span>{{ visibleProducts.length }}</span> of {{ filtered.length }} pieces shown</p>
      <div class="load-more__track" aria-hidden="true"><span :style="{ width: `${progress}%` }" /></div>
      <button class="ornament-button ornament-button--secondary" type="button" @click="visibleCount += pageSize">
        Show more pieces <span aria-hidden="true">↓</span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
const { data, error, status, refresh } = await useFetch('/api/products')
const route = useRoute()
const router = useRouter()
const categories = ['All', 'T-Shirts', 'Hoodies', 'Jackets', 'Accessories']
const selected = ref(String(route.query.category || 'All'))
const sortBy = ref('featured')
const density = ref<'large' | 'compact'>('large')
const pageSize = 18
const visibleCount = ref(pageSize)
const filtered = computed(() => {
  const products = (data.value || []).filter(
    (p) => selected.value === 'All' || p.category === selected.value,
  )
  return [...products].sort((a, b) => {
    if (sortBy.value === 'newest') return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew))
    if (sortBy.value === 'price-low') return (a.variants[0]?.price.amount || 0) - (b.variants[0]?.price.amount || 0)
    if (sortBy.value === 'price-high') return (b.variants[0]?.price.amount || 0) - (a.variants[0]?.price.amount || 0)
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  })
})
const visibleProducts = computed(() => filtered.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleProducts.value.length < filtered.value.length)
const progress = computed(() => filtered.value.length ? Math.round((visibleProducts.value.length / filtered.value.length) * 100) : 0)
const categoryTotal = (category: string) => category === 'All' ? (data.value || []).length : (data.value || []).filter((product) => product.category === category).length
const setCategory = (c: string) => {
  selected.value = c
  visibleCount.value = pageSize
  router.replace({ query: c === 'All' ? {} : { category: c } })
}
watch(sortBy, () => { visibleCount.value = pageSize })
</script>

<style scoped>
.shop-page { max-width: var(--container-wide); min-height: 60vh; margin: 0 auto; padding: 5rem var(--page-gutter); }
.shop-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; padding: 0 1rem 3rem; }
.shop-heading h1 { margin-top: 1rem; }
.shop-heading p:last-child { max-width: 34rem; margin-top: 1.2rem; color: var(--muted); font-size: .84rem; line-height: 1.7; }
.piece-count { display: flex; align-items: baseline; gap: .45rem; color: var(--muted); font-size: .63rem; letter-spacing: .12em; text-transform: uppercase; }
.piece-count b { color: var(--red); font-family: 'Cormorant Garamond',serif; font-size: 2.2rem; font-weight: 600; }
.catalog-toolbar { position: sticky; top: 122px; z-index: 15; display: flex; align-items: center; justify-content: space-between; gap: 2rem; margin-top: 2rem; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: rgba(243,238,228,.93); padding: .9rem 1rem; backdrop-filter: blur(14px); }
.filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: .45rem; }
.filter-label { margin-right: .7rem; color: var(--muted); font-size: .58rem; font-weight: 600; letter-spacing: .17em; text-transform: uppercase; }
.filter-row button { position: relative; display: inline-flex; align-items: center; gap: .55rem; border: 1px solid var(--line); padding: .65rem .8rem; font-size: .61rem; letter-spacing: .07em; transition: color 160ms ease,background 160ms ease,border-color 160ms ease; }
.filter-row button > span { display: grid; min-width: 18px; height: 18px; place-items: center; background: rgba(32,61,112,.07); color: var(--muted); font-size: .45rem; }
.filter-row button:hover { border-color: var(--red); color: var(--red); }
.filter-row button.is-active { border-color: var(--ink); background: var(--ink); color: white; }
.filter-row button.is-active::before { display: inline-block; width: 5px; height: 5px; margin-right: .6rem; content: ''; border: 1px solid #d7b572; transform: rotate(45deg); }
.filter-row button.is-active > span { background: var(--red); color: #fff; }
.catalog-controls { display: flex; flex: none; align-items: stretch; gap: .55rem; }
.catalog-controls label { display: flex; align-items: center; border: 1px solid var(--line); }
.catalog-controls label > span { padding: 0 .7rem; color: var(--muted); font-size: .5rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
.catalog-controls select { width: 145px; border: 0; border-left: 1px solid var(--line); background: transparent; padding: .65rem 2rem .65rem .7rem; font-size: .58rem; box-shadow: none; }
.density-toggle { display: flex; border: 1px solid var(--line); }
.density-toggle button { display: grid; width: 38px; place-items: center; color: var(--muted); }
.density-toggle button + button { border-left: 1px solid var(--line); }
.density-toggle button.is-active { background: var(--ink); color: white; }
.density-toggle svg { width: 15px; fill: none; stroke: currentColor; stroke-width: 1.2; }
.results-line { display: flex; justify-content: space-between; margin-top: 2rem; padding: 0 1rem; color: var(--muted); font-size: .54rem; font-weight: 600; letter-spacing: .13em; text-transform: uppercase; }
.shop-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 2.6rem clamp(1.25rem,2vw,2rem); margin-top: 1.2rem; transition: grid-template-columns 250ms ease; }
.shop-grid--compact { grid-template-columns: repeat(4,minmax(0,1fr)); }
.load-more { display: grid; width: min(28rem,100%); justify-items: center; margin: 4.5rem auto 0; }
.load-more p { color: var(--muted); font-size: .57rem; font-weight: 600; letter-spacing: .13em; text-transform: uppercase; }
.load-more p span { color: var(--red); }
.load-more__track { width: 100%; height: 2px; margin: 1rem 0 1.5rem; overflow: hidden; background: rgba(32,61,112,.13); }
.load-more__track span { display: block; height: 100%; background: linear-gradient(90deg,var(--blue),var(--red)); transition: width 350ms ease; }
.load-more .ornament-button { min-width: 15rem; }
.load-more .ornament-button span { margin-left: auto; }
.skeleton-card { aspect-ratio: 3/5; border: 1px solid var(--line); padding: 1rem; background: rgba(255,255,255,.25); }
.skeleton-card span { display: block; background: linear-gradient(90deg,rgba(32,61,112,.05),rgba(255,255,255,.45),rgba(32,61,112,.05)); background-size: 220% 100%; animation: skeleton-shine 1.4s linear infinite; }
.skeleton-card span:first-child { height: 77%; }.skeleton-card span:nth-child(2) { width: 70%; height: 18px; margin-top: 1rem; }.skeleton-card span:nth-child(3) { width: 42%; height: 11px; margin-top: .7rem; }
@keyframes skeleton-shine { to { background-position: -220% 0; } }
.empty-state { margin: 4rem 1rem 0; padding: 6rem 2rem; text-align: center; }
.empty-symbol { color: var(--red); font-size: 2rem; }
.empty-state h2 { margin-top: 1rem; font-size: 2rem; }
.empty-state p { margin: .8rem auto 1.8rem; color: var(--muted); font-size: .8rem; }
@media (max-width: 1100px) {
  .catalog-toolbar { position: static; align-items: flex-start; flex-direction: column; gap: 1rem; }
  .filter-row { width: 100%; }
  .catalog-controls { width: 100%; }
  .catalog-controls label { flex: 1; }
  .catalog-controls select { width: 100%; }
  .shop-grid, .shop-grid--compact { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
@media (max-width: 600px) {
  .shop-page { padding: 3.5rem 1.25rem; }
  .shop-heading { align-items: start; padding: 0 0 2rem; }
  .shop-heading p:last-child { display: none; }
  .piece-count { flex-direction: column; align-items: end; gap: 0; }
  .catalog-toolbar { margin-top: 1.5rem; padding: .8rem 0; background: transparent; backdrop-filter: none; }
  .filter-label { flex-basis: 100%; }
  .filter-row { flex-wrap: nowrap; overflow-x: auto; padding-bottom: .3rem; scrollbar-width: none; }
  .filter-row::-webkit-scrollbar { display: none; }
  .filter-row button { flex: none; }
  .density-toggle { display: none; }
  .shop-grid, .shop-grid--compact { grid-template-columns: 1fr; gap: 2rem; margin-top: 1.2rem; }
  .results-line { padding: 0; }
}
</style>
