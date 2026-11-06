export function registerPwa() {
  if (!('serviceWorker' in navigator)) return
  if (import.meta.env.DEV) {
    // In dev mode, unregister any active service worker so hot reloading is never intercepted
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister()
      }
    })
    return
  }
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

export function isOnline(): boolean {
  return navigator.onLine
}
