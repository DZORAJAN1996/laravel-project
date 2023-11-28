import type { FirebaseApp } from 'firebase/app'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { cacheNames, clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { setDefaultHandler } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope & Record<string, any>
const cacheName = cacheNames.runtime
let firebaseApp: FirebaseApp | undefined

cleanupOutdatedCaches()

setDefaultHandler(new CacheFirst({ cacheName }))

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  firebaseApp = initializeApp(FIREBASE_CONFIG)

  const messaging = getMessaging(firebaseApp)

  onBackgroundMessage(messaging, ({ notification, fcmOptions }) => {
    if (!notification)
      return

    if (Notification.permission !== 'granted') {
      e.waitUntil(self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          client.postMessage({
            type: 'notification',
            title: notification.title,
            body: notification.body,
            icon: notification.icon,
          })
        }
      }))

      return
    }

    self.registration.showNotification(notification.title!, {
      body: notification.body,
      icon: notification.icon || '/favicon.ico',
      badge: '/vendor/creasico/icon-192x192.png',
      lang: 'id',
      data: {
        url: fcmOptions?.link || '/',
      },
    })
  })
})

/**
 * Handles a notification click event
 */
self.addEventListener('notificationclick', (e) => {
  e.notification.close()

  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((clients) => {
    if (clients.length === 0) {
      self.clients.openWindow('/')
      return
    }

    // This part still now working as expected
    clients[0].focus()
  }))
})

clientsClaim()
