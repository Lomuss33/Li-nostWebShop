export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return
  const { data } = await useFetch('/api/admin/me')
  if (!data.value)
    return navigateTo(
      `/admin/login?redirect=${encodeURIComponent(to.fullPath)}`,
    )
})
