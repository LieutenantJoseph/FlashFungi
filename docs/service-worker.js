// Flash Fungi Service Worker - Phase 3 Implementation
// Enhanced caching, offline capabilities, and background sync

const CACHE_NAME = 'flash-fungi-v3.0.0';
const DATA_CACHE_NAME = 'flash-fungi-data-v3.0.0';

// Cache strategies by resource type
const CACHE_STRATEGIES = {
    '/api/specimens': 'cache-first',
    '/api/species-hints': 'cache-first', 
    '/images/': 'cache-first',
    '/api/user': 'network-first',
    '/api/user-progress': 'network-first',
    '/api/study-sessions': 'network-first',
    '/api/achievements': 'network-first'
};

// Resources to cache on install
const STATIC_RESOURCES = [
    '/',
    '/app.js',
    '/manifest.json',
    '/config/supabase.js',
    '/utils/api.js',
    '/utils/fuzzyMatching.js',
    '/components/common/Toast.js',
    '/components/common/Phase3Badge.js',
    '/components/common/LoadingScreen.js',
    '/components/study/QuickStudy.js',
    '/components/study/FocusedStudy.js',
    '/components/study/MarathonMode.js',
    '/components/study/InteractiveSpeciesGuide.js',
    '/components/training/TrainingModules.js',
    '/components/training/GenusModules.js',
    '/components/training/ModulePlayer.js',
    '/components/achievements/AchievementSystem.js',
    '/components/auth/AuthenticatedApp.js',
    '/components/auth/useUserProfile.js',
    '/components/home/HomePage.js',
    '/components/profile/ProfilePage.js',
    '/legacy/supabase-auth.js',
    '/legacy/public-profile.js'
];

// Offline queue for failed requests
let offlineQueue = [];

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing v3.0.0...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating v3.0.0...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests for caching (except for offline queue)
    if (request.method !== 'GET') {
        if (request.method === 'POST' && isProgressUpdate(request)) {
            event.respondWith(handleProgressUpdate(request));
        }
        return;
    }
    
    // Handle different types of requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
    } else if (url.pathname.startsWith('/images/') || isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
    } else {
        event.respondWith(handleAppRequest(request));
    }
});

// Background sync for offline progress updates
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-progress') {
        event.waitUntil(syncOfflineProgress());
    } else if (event.tag === 'sync-achievements') {
        event.waitUntil(syncOfflineAchievements());
    }
});

// Handle app asset requests (HTML, JS, CSS)
async function handleAppRequest(request) {
    try {
        // Try network first for HTML and critical assets
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Update cache with fresh version
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cached = await caches.match(request);
        
        if (cached) {
            console.log('[Service Worker] Serving from cache:', request.url);
            return cached;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return createOfflinePage();
        }
        
        // Return error response
        return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Handle API requests with different caching strategies
async function handleApiRequest(request) {
    const url = new URL(request.url);
    const strategy = getCacheStrategy(url.pathname);
    
    switch (strategy) {
        case 'cache-first':
            return handleCacheFirst(request);
        case 'network-first':
            return handleNetworkFirst(request);
        default:
            return handleNetworkOnly(request);
    }
}

// Cache-first strategy (for static data like specimens)
async function handleCacheFirst(request) {
    const cached = await caches.match(request);
    
    if (cached) {
        // Return cached version immediately
        updateCacheInBackground(request);
        return cached;
    }
    
    // Not in cache, fetch from network
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Cache-first request failed:', error);
        return createErrorResponse('Data unavailable offline');
    }
}

// Network-first strategy (for user data)
async function handleNetworkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Update cache with fresh data
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cached = await caches.match(request);
        
        if (cached) {
            console.log('[Service Worker] Serving stale data from cache:', request.url);
            return cached;
        }
        
        console.error('[Service Worker] Network-first request failed:', error);
        return createErrorResponse('Data unavailable');
    }
}

// Network-only strategy (for critical updates)
async function handleNetworkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.error('[Service Worker] Network-only request failed:', error);
        return createErrorResponse('Network required');
    }
}

// Handle image requests with aggressive caching
async function handleImageRequest(request) {
    const cached = await caches.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache images aggressively
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return placeholder image if available
        const placeholder = await caches.match('/placeholder-mushroom.jpg');
        if (placeholder) {
            return placeholder;
        }
        
        return new Response('', {
            status: 404,
            statusText: 'Image not available offline'
        });
    }
}

// Handle progress updates with offline queue
async function handleProgressUpdate(request) {
    try {
        const response = await fetch(request);
        return response;
    } catch (error) {
        // Queue for later sync
        await queueProgressUpdate(request);
        
        // Return success response to app
        return new Response(JSON.stringify({ 
            queued: true, 
            message: 'Progress will be synced when online' 
        }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Queue progress update for background sync
async function queueProgressUpdate(request) {
    try {
        const requestData = {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            body: await request.text(),
            timestamp: Date.now()
        };
        
        // Store in IndexedDB for persistence
        const db = await openProgressDB();
        const transaction = db.transaction(['queue'], 'readwrite');
        const store = transaction.objectStore('queue');
        await store.add(requestData);
        
        console.log('[Service Worker] Progress update queued for sync');
        
        // Register for background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            self.registration.sync.register('sync-progress');
        }
    } catch (error) {
        console.error('[Service Worker] Failed to queue progress update:', error);
    }
}

// Sync offline progress when connection restored
async function syncOfflineProgress() {
    console.log('[Service Worker] Syncing offline progress...');
    
    try {
        const db = await openProgressDB();
        const transaction = db.transaction(['queue'], 'readwrite');
        const store = transaction.objectStore('queue');
        const requests = await store.getAll();
        
        for (const requestData of requests) {
            try {
                const response = await fetch(requestData.url, {
                    method: requestData.method,
                    headers: requestData.headers,
                    body: requestData.body
                });
                
                if (response.ok) {
                    // Remove from queue on success
                    await store.delete(requestData.id);
                    console.log('[Service Worker] Synced progress update:', requestData.url);
                }
            } catch (error) {
                console.error('[Service Worker] Failed to sync progress:', error);
                // Keep in queue for next sync attempt
            }
        }
        
        console.log('[Service Worker] Progress sync complete');
    } catch (error) {
        console.error('[Service Worker] Progress sync failed:', error);
    }
}

// Helper functions
function getCacheStrategy(pathname) {
    for (const [path, strategy] of Object.entries(CACHE_STRATEGIES)) {
        if (pathname.startsWith(path)) {
            return strategy;
        }
    }
    return 'network-only';
}

function isImageRequest(request) {
    return request.destination === 'image' || 
           /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(new URL(request.url).pathname);
}

function isProgressUpdate(request) {
    return request.url.includes('/api/user-progress') || 
           request.url.includes('/api/study-sessions');
}

function updateCacheInBackground(request) {
    // Non-blocking cache update
    fetch(request)
        .then(response => {
            if (response.ok) {
                caches.open(DATA_CACHE_NAME)
                    .then(cache => cache.put(request, response));
            }
        })
        .catch(() => {
            // Ignore background update failures
        });
}

function createErrorResponse(message) {
    return new Response(JSON.stringify({ 
        error: message,
        offline: true 
    }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
    });
}

function createOfflinePage() {
    const offlineHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Flash Fungi - Offline</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 min-h-screen flex items-center justify-center">
            <div class="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <div class="text-6xl mb-4">🍄</div>
                <h1 class="text-2xl font-bold text-gray-800 mb-4">You're Offline</h1>
                <p class="text-gray-600 mb-6">
                    Flash Fungi is working offline. Some features may be limited, 
                    but you can still study with cached content.
                </p>
                <button onclick="window.location.reload()" 
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Try Again
                </button>
            </div>
        </body>
        </html>
    `;
    
    return new Response(offlineHTML, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// IndexedDB for offline queue
function openProgressDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FlashFungiOffline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('queue')) {
                const store = db.createObjectStore('queue', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                store.createIndex('timestamp', 'timestamp');
            }
        };
    });
}

console.log('[Service Worker] Flash Fungi v3.0.0 service worker loaded');
