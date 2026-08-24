<template>
  <div class="floating-ornaments" aria-hidden="true">
    <svg class="floating-sigil floating-sigil--one" viewBox="0 0 90 90" :style="slowStyle">
      <path d="M45 3 57 31l30 14-30 14-12 28-12-28L3 45l30-14L45 3Z" />
      <circle cx="45" cy="45" r="11" />
      <path d="M45 20v50M20 45h50" />
    </svg>
    <svg class="floating-sigil floating-sigil--two" viewBox="0 0 110 110" :style="fastStyle">
      <path d="M55 5c7 20 15 29 38 32-17 14-20 25-10 49-22-7-35-1-48 18-5-23-14-33-38-35 18-15 23-29 14-50 22 7 33 3 44-14Z" />
      <path d="m55 32 8 15 15 8-15 8-8 15-8-15-15-8 15-8 8-15Z" />
    </svg>
    <svg class="floating-sigil floating-sigil--three" viewBox="0 0 100 140" :style="reverseStyle">
      <path d="M50 5v130M15 35c23 0 35-10 35-30 0 20 12 30 35 30-23 0-35 10-35 30 0-20-12-30-35-30Zm5 70c20 0 30-9 30-27 0 18 10 27 30 27-20 0-30 9-30 27 0-18-10-27-30-27Z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
const scrollY = ref(0)
let frame = 0

const updateScroll = () => {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    scrollY.value = window.scrollY
  })
}

onMounted(() => {
  window.addEventListener('scroll', updateScroll, { passive: true })
  updateScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScroll)
  cancelAnimationFrame(frame)
})

const slowStyle = computed(() => ({ '--scroll-shift': `${scrollY.value * -0.035}px` }))
const fastStyle = computed(() => ({ '--scroll-shift': `${scrollY.value * 0.06}px` }))
const reverseStyle = computed(() => ({ '--scroll-shift': `${scrollY.value * -0.08}px` }))
</script>
