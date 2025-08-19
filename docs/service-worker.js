// Flash Fungi Service Worker - Phase 3 Complete Implementation
// Enhanced caching, offline capabilities, background sync, and session persistence

const CACHE_NAME = 'flash-fungi-v3.2.0';
const DATA_CACHE_NAME = 'flash-fungi-data-v3.2.0';
const SESSION_CACHE_NAME = 'flash-fungi-sessions-v3.2.0';

// Cache strategies by resource type
const CACHE_STRATEGIES = {
    '/api/specimens': 'cache-first',
    '/api/species-hints': 'cache-first', 
    '/images/': 'cache-first',
    '/api/user': 'network-first',
    '/api/user-progress': 'network-first',
    '/api/study-sessions': 'network-first',
    '/api/achievements': 'network-first',
    '/api/profiles': 'network-first'
};

// Resources to cache on install
const STATIC_RESOURCES = [
    '/',
    '/app.js',
    '/manifest.json',
    '/constants.js',
    
    // Utils
    '/utils/api.js',
    '/utils/fuzzyMatching.js',
    '/utils/touchGestures.js',
    
    // Components - Common
    '/components/common/Toast.js',
    '/components/common/Phase3Badge.js',
    '/components/common/LoadingScreen.js',
    
    // Components - Study
    '/components/study/QuickStudy.js',
    '/components/study/FocusedStudy.js',
    '/components/study/MarathonMode.js',
    '/components/study/InteractiveSpeciesGuide.js',
    
    // Components - Training
    '/components/training/TrainingModules.js',
    '/components/training/GenusModules.js',
    '/components/training/ModulePlayer.js',
    
    // Components - Achievement
    '/components/achievements/AchievementSystem.js',
    
    // Components - Auth
    '/components/auth/AuthProvider.js',
    '/components/auth/AuthenticatedApp.js',
    '/components/auth/useUserProfile.js',
    
    // Components - Other
    '/components/home/HomePage.js',
    '/components/profile/ProfilePage.js',
    '/components/ui/PlaceholderAssets.js'
];

// Critical API endpoints to cache
const CRITICAL_API_ENDPOINTS = [
    '/api/specimens?status=eq.approved&limit=100',
    '/api/species-hints',
    '/api/achievements'
];

// Offline queue for failed requests
let offlineQueue = [];

// Session persistence data
let sessionData = {};

// Install event - cache static resources and critical data
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing v3.2.0...');
    
    event.waitUntil(
        Promise.all([
            // Cache static resources
            caches.open(CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            }),
            
            // Cache critical API data
            caches.open(DATA_CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Caching critical API data');
                return Promise.all(
                    CRITICAL_API_ENDPOINTS.map(endpoint => {
                        return fetch(endpoint)
                            .then(response => response.ok ? cache.put(endpoint, response) : null)
                            .catch(error => console.log(`Failed to cache ${endpoint}:`, error));
                    })
                );
            })
        ]).then(() => {
            console.log('[Service Worker] Installation complete');
            return self.skipWaiting();
        }).catch((error) => {
            console.error('[Service Worker] Installation failed:', error);
        })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating v3.2.0...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== DATA_CACHE_NAME && 
                        cacheName !== SESSION_CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests for caching
    if (request.method !== 'GET') {
        return handleNonGetRequest(event);
    }
    
    // Handle different types of requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
    } else if (url.pathname.match(/\.(js|css|html|json)$/)) {
        event.respondWith(handleStaticRequest(request));
    } else if (url.pathname.includes('/images/')) {
        event.respondWith(handleImageRequest(request));
    } else {
        event.respondWith(handleNavigationRequest(request));
    }
});

// Handle API requests with appropriate caching strategy
async function handleApiRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Determine cache strategy
    const strategy = Object.entries(CACHE_STRATEGIES).find(([pattern]) => 
        pathname.includes(pattern)
    )?.[1] || 'network-first';
    
    try {
        if (strategy === 'cache-first') {
            return await cacheFirst(request, DATA_CACHE_NAME);
        } else {
            return await networkFirst(request, DATA_CACHE_NAME);
        }
    } catch (error) {
        console.error('[Service Worker] API request failed:', error);
        return new Response(JSON.stringify({ 
            error: 'Offline', 
            message: 'This request requires an internet connection' 
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle static resource requests
async function handleStaticRequest(request) {
    return await cacheFirst(request, CACHE_NAME);
}

// Handle image requests with lazy loading
async function handleImageRequest(request) {
    return await cacheFirst(request, DATA_CACHE_NAME);
}

// Handle navigation requests (SPA routing)
async function handleNavigationRequest(request) {
    try {
        // Try network first for navigation
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('[Service Worker] Network failed, serving from cache');
    }
    
    // Fallback to cached index.html for SPA routing
    const cache = await caches.open(CACHE_NAME);
    return await cache.match('/') || new Response('Offline');
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        fetch(request).then(response => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
        }).catch(() => {}); // Silent fail for background updates
        
        return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
    }
    return networkResponse;
}

// Network-first strategy
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache');
    }
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    throw new Error('No network and no cache');
}

// Handle non-GET requests (POST, PUT, DELETE)
function handleNonGetRequest(event) {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle session persistence requests
    if (url.pathname === '/api/study-sessions') {
        event.respondWith(handleSessionRequest(request));
    } else if (url.pathname.includes('/api/')) {
        event.respondWith(handleOfflineCapableRequest(request));
    }
}

// Handle session persistence with offline support - NEW FEATURE
async function handleSessionRequest(request) {
    try {
        // Try to save to server first
        const response = await fetch(request);
        
        if (response.ok) {
            // Successfully saved to server
            const data = await request.clone().json();
            
            // Also cache session data locally
            const cache = await caches.open(SESSION_CACHE_NAME);
            await cache.put(
                `/session/${data.user_id}/${data.mode}`, 
                new Response(JSON.stringify(data))
            );
            
            return response;
        }
    } catch (error) {
        console.log('[Service Worker] Session save failed, storing offline');
    }
    
    // Network failed, store in offline queue and IndexedDB
    try {
        const data = await request.clone().json();
        
        // Store in cache for immediate retrieval
        const cache = await caches.open(SESSION_CACHE_NAME);
        await cache.put(
            `/session/${data.user_id}/${data.mode}`, 
            new Response(JSON.stringify(data))
        );
        
        // Queue for sync when online
        offlineQueue.push({
            type: 'session',
            data: data,
            timestamp: Date.now()
        });
        
        // Store in IndexedDB for persistence
        await storeOfflineSession(data);
        
        return new Response(JSON.stringify({ 
            success: true, 
            offline: true,
            message: 'Session saved offline, will sync when online'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Failed to save session offline' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle other API requests with offline queueing
async function handleOfflineCapableRequest(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            return response;
        }
    } catch (error) {
        console.log('[Service Worker] Request failed, queueing for sync');
    }
    
    // Queue for background sync
    try {
        const data = request.method === 'POST' || request.method === 'PUT' 
            ? await request.clone().json() 
            : null;
            
        offlineQueue.push({
            type: 'api',
            url: request.url,
            method: request.method,
            data: data,
            timestamp: Date.now()
        });
        
        return new Response(JSON.stringify({ 
            success: true, 
            offline: true,
            message: 'Request queued for sync when online'
        }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Failed to queue request' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Background sync for offline data - NEW FEATURE
self.addEventListener('sync', async (event) => {
    console.log('[Service Worker] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-offline-data') {
        event.waitUntil(syncOfflineData());
    } else if (event.tag === 'sync-sessions') {
        event.waitUntil(syncOfflineSessions());
    }
});

// Sync offline data when connection restored
async function syncOfflineData() {
    console.log('[Service Worker] Syncing offline data...');
    
    const failedQueue = [];
    
    for (const item of offlineQueue) {
        try {
            if (item.type === 'session') {
                await syncSessionData(item.data);
            } else if (item.type === 'api') {
                await syncApiRequest(item);
            }
        } catch (error) {
            console.error('[Service Worker] Failed to sync item:', error);
            failedQueue.push(item);
        }
    }
    
    // Keep failed items for retry
    offlineQueue = failedQueue;
    
    // Notify clients of sync completion
    notifyClients('sync-complete', { 
        synced: offlineQueue.length - failedQueue.length,
        failed: failedQueue.length 
    });
}

// Sync session data
async function syncSessionData(sessionData) {
    const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
    });
    
    if (!response.ok) {
        throw new Error(`Session sync failed: ${response.status}`);
    }
    
    return response;
}

// Sync API requests
async function syncApiRequest(item) {
    const response = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: item.data ? JSON.stringify(item.data) : undefined
    });
    
    if (!response.ok) {
        throw new Error(`API sync failed: ${response.status}`);
    }
    
    return response;
}

// Store session in IndexedDB for persistence
async function storeOfflineSession(sessionData) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FlashFungiOffline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            
            store.put({
                id: `${sessionData.user_id}_${sessionData.mode}_${Date.now()}`,
                data: sessionData,
                timestamp: Date.now()
            });
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('sessions')) {
                db.createObjectStore('sessions', { keyPath: 'id' });
            }
        };
    });
}

// Sync offline sessions from IndexedDB
async function syncOfflineSessions() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FlashFungiOffline', 1);
        
        request.onsuccess = async () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = async () => {
                const sessions = getAllRequest.result;
                
                for (const session of sessions) {
                    try {
                        await syncSessionData(session.data);
                        
                        // Remove from IndexedDB after successful sync
                        const deleteTransaction = db.transaction(['sessions'], 'readwrite');
                        const deleteStore = deleteTransaction.objectStore('sessions');
                        deleteStore.delete(session.id);
                        
                    } catch (error) {
                        console.error('Failed to sync session:', error);
                    }
                }
                
                resolve();
            };
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Notify clients of service worker events
function notifyClients(type, data) {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: type,
                data: data
            });
        });
    });
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'CACHE_SPECIMENS':
            cacheSpecimens(data);
            break;
        case 'TRIGGER_SYNC':
            self.registration.sync.register('sync-offline-data');
            break;
    }
});

// Cache specimen data for offline use
async function cacheSpecimens(specimens) {
    const cache = await caches.open(DATA_CACHE_NAME);
    
    for (const specimen of specimens) {
        // Cache specimen images
        if (specimen.primary_image_url) {
            try {
                await cache.add(specimen.primary_image_url);
            } catch (error) {
                console.log('Failed to cache image:', specimen.primary_image_url);
            }
        }
    }
}

// Periodic background sync registration
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'sync-sessions-periodic') {
        event.waitUntil(syncOfflineSessions());
    }
});

// Handle push notifications for achievements - FUTURE FEATURE
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        if (data.type === 'achievement') {
            event.waitUntil(
                self.registration.showNotification('🏆 Achievement Unlocked!', {
                    body: data.message,
                    icon: '/icons/achievement-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    tag: 'achievement',
                    actions: [
                        { action: 'view', title: 'View Achievement' },
                        { action: 'dismiss', title: 'Dismiss' }
                    ]
                })
            );
        }
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/profile?tab=achievements')
        );
    }
});

console.log('[Service Worker] Flash Fungi v3.2.0 service worker loaded with enhanced offline capabilities');