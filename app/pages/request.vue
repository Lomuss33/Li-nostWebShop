<template>
  <div class="request-page">
    <div class="request-intro">
      <p class="eyebrow">Personal assistance</p>
      <h1 class="section-heading">A more personal way to shop.</h1>
      <p>Tell us what you need and a member of our team will respond using your preferred channel.</p>
      <div class="request-promise ornament-panel">
        <span>✦</span>
        <p><strong>No payment is taken.</strong><br />Your request is personal, clear, and without obligation.</p>
      </div>
    </div>
    <form class="request-form ornament-panel" @submit.prevent="submit">
      <p class="form-number">REQUEST / 01</p>
      <h2>Your details</h2>
      <div class="form-grid">
      <input
        v-model="form.firstName"
        required
        placeholder="Marko"
        aria-label="First name"
      /><input
        v-model="form.lastName"
        required
        placeholder="Petrović"
        aria-label="Last name"
      />
      </div>
      <input
        v-model="form.email"
        required
        type="email"
        placeholder="marko@example.com"
        aria-label="Email"
      /><input
        v-model="form.phone"
        required
        placeholder="+49 176 12345678"
        aria-label="Phone"
      />
      <div class="form-grid">
      <select v-model="form.countryCode" aria-label="Country">
        <option v-for="c in countries" :key="c.code" :value="c.code">
          {{ c.name }}
        </option></select>
      <select v-model="form.preferredContact" aria-label="Preferred contact method">
        <option value="email">Email</option>
        <option value="phone">Phone</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="viber">Viber</option></select>
      </div>
      <FieldHint
        text="Choose WhatsApp if you prefer a quick message instead of email."
      /><textarea
        v-model="form.message"
        rows="4"
        placeholder="Can you confirm shipping to Sarajevo and whether size XL is available?"
      />
      <p v-if="error" class="text-sm text-red-700">{{ error }}</p>
      <button class="ornament-button">Send personal request <span>→</span></button>
      <p class="privacy-note">By sending, you agree that we may contact you about this request.</p>
    </form>
  </div>
</template>
<script setup lang="ts">
import { countries } from '~/../shared/constants/regions'
const { items } = useCart()
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  countryCode: 'DE',
  preferredContact: 'email',
  message: '',
})
const error = ref('')
const submit = async () => {
  error.value = ''
  try {
    const response = await $fetch<{ success: boolean; requestNumber: string }>(
      '/api/purchase-requests',
      {
        method: 'POST',
        body: {
          ...form,
          items: items.value.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        },
      },
    )
    await navigateTo(
      `/request/confirmation?ref=${encodeURIComponent(response.requestNumber)}`,
    )
  } catch (e: unknown) {
    const apiError = e as { data?: { statusMessage?: string } }
    error.value =
      apiError.data?.statusMessage || 'Please check your details and try again.'
  }
}
</script>

<style scoped>
.request-page { display: grid; max-width: 72rem; grid-template-columns: .85fr 1.15fr; gap: clamp(3rem,7vw,7rem); align-items: start; margin: 0 auto; padding: 6rem 2rem; }
.request-intro { position: sticky; top: 150px; padding-top: 1rem; }
.request-intro h1 { margin-top: 1.2rem; }
.request-intro > p:nth-child(3) { margin-top: 1.5rem; color: var(--muted); font-size: .85rem; line-height: 1.8; }
.request-promise { display: flex; gap: 1rem; align-items: start; margin-top: 2rem; padding: 1.3rem; }
.request-promise > span { color: var(--gold); }
.request-promise p { color: var(--muted); font-size: .68rem; line-height: 1.65; }
.request-promise strong { color: var(--ink); }
.request-form { display: grid; gap: .85rem; padding: 2.5rem; }
.request-form .form-number { color: var(--red); font-size: .52rem; font-weight: 600; letter-spacing: .18em; }
.request-form h2 { margin-bottom: .8rem; font-size: 2.2rem; }
.form-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: .85rem; }
.request-form input, .request-form select, .request-form textarea { font-size: .75rem; }
.request-form textarea { resize: vertical; }
.request-form button { width: 100%; margin-top: .4rem; }
.request-form button span { margin-left: auto; }
.privacy-note { color: var(--muted); font-size: .53rem; line-height: 1.5; text-align: center; }
@media (max-width: 750px) { .request-page { grid-template-columns: 1fr; padding: 4rem 1.25rem; }.request-intro { position: static; }.request-form { padding: 1.5rem; } }
@media (max-width: 460px) { .form-grid { grid-template-columns: 1fr; } }
</style>
