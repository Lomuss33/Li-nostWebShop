<template>
  <div class="cart-page">
    <div class="cart-heading">
      <p class="eyebrow">Your selection</p>
      <h1 class="section-heading">The bag</h1>
    </div>
    <OrnamentBand />
    <div v-if="!items.length" class="empty-bag ornament-panel">
      <span>◇</span>
      <h2>Your bag is empty.</h2>
      <p>
        Start with T-Shirts, Hoodies or New Arrivals.
      </p>
      <NuxtLink class="ornament-button" to="/shop"
        >Shop products</NuxtLink
      >
    </div>
    <div v-else class="cart-layout">
      <div class="cart-items">
        <article v-for="item in items" :key="item.variantId" class="cart-item">
          <div class="cart-item__image"><img :src="item.imageUrl" :alt="item.name" /></div>
          <div class="cart-item__content">
            <p class="cart-item__eyebrow">Selected piece</p>
            <h2>{{ item.name }}</h2>
            <p class="cart-item__variant">{{ item.color }} · Size {{ item.size }}</p>
            <div class="quantity-control" aria-label="Quantity">
              <button aria-label="Decrease quantity" @click="update(item.variantId, item.quantity - 1)">−</button>
              <span>{{ item.quantity }}</span>
              <button aria-label="Increase quantity" @click="update(item.variantId, item.quantity + 1)">+</button>
            </div>
          </div>
          <div class="cart-item__aside">
            <p>{{ formatMoney({ amount: item.price.amount * item.quantity, currency: item.price.currency }) }}</p>
            <button class="remove-button" @click="remove(item.variantId)">Remove</button>
          </div>
        </article>
      </div>
      <aside class="cart-summary ornament-panel">
        <p class="eyebrow">Order summary</p>
        <div class="summary-line"><span>Subtotal</span><strong>{{ formatMoney({ amount: subtotal, currency: 'EUR' }) }}</strong></div>
        <p class="summary-note">Shipping and applicable taxes are calculated for your destination at checkout.</p>
        <div class="checkout-fields">
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            aria-label="Email address"
          />
          <select
            v-model="country"
            aria-label="Shipping country"
          >
            <option value="DE">Germany</option>
            <option value="AT">Austria</option>
            <option value="CH">Switzerland</option>
            <option value="HR">Croatia</option>
            <option value="SI">Slovenia</option>
            <option value="BA">Bosnia and Herzegovina</option>
            <option value="RS">Serbia</option>
            <option value="ME">Montenegro</option>
            <option value="MK">North Macedonia</option>
            <option value="US">United States</option>
          </select>
        </div>
        <p v-if="checkoutError" class="text-sm text-red-700">
          {{ checkoutError }}
        </p>
        <button
          class="ornament-button checkout-button"
          :disabled="loading || !email"
          @click="checkout"
        >
          Checkout securely</button
        ><NuxtLink
          to="/request"
          class="ornament-button ornament-button--secondary"
          >Request these items</NuxtLink
        >
        <p class="assistance-note">
          Prefer personal assistance? Send your cart and contact details without
          paying.
        </p>
      </aside>
    </div>
  </div>
</template>
<script setup lang="ts">
const { items, remove, update, subtotal } = useCart()
const email = ref('')
const country = ref('DE')
const loading = ref(false)
const checkoutError = ref('')
const checkout = async () => {
  loading.value = true
  checkoutError.value = ''
  try {
    const currency = country.value === 'US' ? 'USD' : 'EUR'
    const result = await $fetch<{ checkoutUrl: string }>('/api/checkout', {
      method: 'POST',
      body: {
        email: email.value,
        shippingCountry: country.value,
        currency,
        items: items.value.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      },
    })
    await navigateTo(result.checkoutUrl, { external: true })
  } catch (error: unknown) {
    const apiError = error as { data?: { statusMessage?: string } }
    checkoutError.value =
      apiError.data?.statusMessage || 'Checkout is temporarily unavailable.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cart-page { max-width: 76rem; min-height: 60vh; margin: 0 auto; padding: 4.5rem 2rem; }
.cart-heading { padding: 0 1rem 2.5rem; }
.cart-heading h1 { margin-top: 1rem; }
.empty-bag { margin: 3rem auto 0; padding: 6rem 2rem; text-align: center; }
.empty-bag > span { color: var(--red); font-size: 2rem; }
.empty-bag h2 { margin-top: .8rem; font-size: 2rem; }
.empty-bag p { margin: .7rem auto 1.8rem; color: var(--muted); font-size: .8rem; }
.cart-layout { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(320px,.7fr); gap: 3rem; margin-top: 3.5rem; align-items: start; }
.cart-items { border-top: 1px solid var(--line); }
.cart-item { display: grid; grid-template-columns: 115px 1fr auto; gap: 1.3rem; border-bottom: 1px solid var(--line); padding: 1.4rem 0; }
.cart-item__image { aspect-ratio: 4/5; overflow: hidden; background: #ded3c3; }
.cart-item__image img { width: 100%; height: 100%; object-fit: cover; }
.cart-item__content { padding-top: .3rem; }
.cart-item__eyebrow { color: var(--red); font-size: .5rem; letter-spacing: .15em; text-transform: uppercase; }
.cart-item h2 { margin-top: .4rem; font-size: 1.45rem; }
.cart-item__variant { margin-top: .3rem; color: var(--muted); font-size: .68rem; }
.quantity-control { display: inline-grid; grid-template-columns: 30px 34px 30px; margin-top: 1.2rem; border: 1px solid var(--line); text-align: center; }
.quantity-control button, .quantity-control span { display: grid; height: 30px; place-items: center; font-size: .7rem; }
.quantity-control button:hover { color: var(--red); background: rgba(166,37,50,.05); }
.cart-item__aside { display: flex; flex-direction: column; align-items: end; justify-content: space-between; padding: .4rem 0; font-size: .72rem; }
.remove-button { color: var(--muted); font-size: .58rem; border-bottom: 1px solid currentColor; }
.remove-button:hover { color: var(--red); }
.cart-summary { padding: 2rem; }
.summary-line { display: flex; justify-content: space-between; margin-top: 1.6rem; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 1.2rem 0; font-size: .78rem; }
.summary-line strong { font-family: 'Cormorant Garamond',serif; font-size: 1.4rem; }
.summary-note, .assistance-note { margin-top: 1rem; color: var(--muted); font-size: .58rem; line-height: 1.65; }
.checkout-fields { display: grid; gap: .7rem; margin-top: 1.3rem; }
.checkout-fields input, .checkout-fields select { font-size: .72rem; }
.checkout-button { width: 100%; margin-top: 1rem; }
.cart-summary > a { width: 100%; margin-top: .7rem; }
.assistance-note { text-align: center; }
@media (max-width: 800px) { .cart-layout { grid-template-columns: 1fr; }.cart-summary { position: static; } }
@media (max-width: 600px) {
  .cart-page { padding: 3.5rem 1.25rem; }
  .cart-heading { padding-right: 0; padding-left: 0; }
  .cart-item { grid-template-columns: 86px 1fr; gap: 1rem; }
  .cart-item__aside { grid-column: 2; flex-direction: row; align-items: center; margin-top: -1rem; }
}
</style>
