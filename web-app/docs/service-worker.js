// Service Worker for Flash Fungi PWA
// Phase 3 Implementation - Lightweight hybrid caching strategy

const CACHE_NAME = 'flash-fungi-v1';
const RUNTIME_CACHE = 'flash-fungi-runtime-v1';
const IMAGE_CACHE = 'flash-fungi-images-v1';

// Core assets to cache on install (Cache First strategy)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/focused-study.js',
    '/marathon-mode.js',
    '/manifest.json',
    // External CDN resources (optional - may fail if offline)
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://cdn.tailwindcss.com'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                // Cache static assets, but don't fail if some aren't available
                return Promise.allSettled(
                    STATIC_ASSETS.map(url => 
                        cache.add(url).catch(err => 
                            console.warn(`[Service Worker] Failed to cache ${url}:`, err)
                        )
                    )
                );
            })
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName.startsWith('flash-fungi-') && 
                                   cacheName !== CACHE_NAME && 
                                   cacheName !== RUNTIME_CACHE &&
                                   cacheName !== IMAGE_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim()) // Take control immediately
    );
});

// Fetch event - hybrid caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of resources with appropriate strategies
    if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || 
        request.url.includes('inaturalist')) {
        // Images: Cache First with fallback
        event.respondWith(handleImageRequest(request));
    } else if (url.origin === location.origin && 
               (url.pathname === '/' || 
                url.pathname.endsWith('.html') || 
                url.pathname.endsWith('.js') || 
                url.pathname.endsWith('.json'))) {
        // App assets: Network First with cache fallback
        event.respondWith(handleAppAssetRequest(request));
    } else if (request.url.includes('/api/') || 
               request.url.includes('supabase')) {
        // API calls: Network Only with offline detection
        event.respondWith(handleApiRequest(request));
    } else {
        // Everything else: Network First
        event.respondWith(handleGenericRequest(request));
    }
});

// Strategy: Cache First for images (with size limit)
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
        // Return cached image
        return cached;
    }
    
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            // Check cache size before adding (limit to ~50MB)
            const cacheSize = await estimateCacheSize(IMAGE_CACHE);
            if (cacheSize < 50 * 1024 * 1024) { // 50MB limit
                // Clone the response before caching
                cache.put(request, response.clone());
            } else {
                // Clean up old images if cache is too large
                await cleanImageCache();
                cache.put(request, response.clone());
            }
        }
        
        return response;
    } catch (error) {
        console.error('[Service Worker] Image fetch failed:', error);
        // Return placeholder image if available
        return new Response('', {
            status: 404,
            statusText: 'Image not available offline'
        });
    }
}

// Strategy: Network First for app assets
async function handleAppAssetRequest(request) {
    try {
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
        
        // Return offline page if available
        return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Strategy: Network Only for API calls with offline queue
async function handleApiRequest(request) {
    try {
        const response = await fetch(request);
        return response;
    } catch (error) {
        console.error('[Service Worker] API request failed:', error);
        
        // For POST requests, queue for later sync
        if (request.method === 'POST' && request.url.includes('/user-progress')) {
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
        
        // Return error for other API calls
        return new Response(JSON.stringify({ 
            error: 'Offline', 
            message: 'This feature requires an internet connection' 
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Strategy: Network First for generic requests
async function handleGenericRequest(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            // Cache successful responses
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Try cache fallback
        const cached = await caches.match(request);
        return cached || new Response('Offline', { status: 503 });
    }
}

// Queue progress updates for background sync
async function queueProgressUpdate(request) {
    const data = await request.clone().text();
    const queue = await getProgressQueue();
    
    queue.push({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: data,
        timestamp: Date.now()
    });
    
    await saveProgressQueue(queue);
}

// Get queued progress updates from IndexedDB
async function getProgressQueue() {
    // Simple implementation using cache API as storage
    const cache = await caches.open('offline-queue');
    const response = await cache.match('queue');
    
    if (response) {
        const data = await response.json();
        return data.queue || [];
    }
    
    return [];
}

// Save progress queue to IndexedDB
async function saveProgressQueue(queue) {
    const cache = await caches.open('offline-queue');
    
    await cache.put('queue', new Response(JSON.stringify({ queue }), {
        headers: { 'Content-Type': 'application/json' }
    }));
}

// Estimate cache size
async function estimateCacheSize(cacheName) {
    if ('estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
    }
    
    // Fallback: count cached items
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    return keys.length * 100000; // Rough estimate: 100KB per item
}

// Clean up old images from cache
async function cleanImageCache() {
    const cache = await caches.open(IMAGE_CACHE);
    const keys = await cache.keys();
    
    // Remove oldest 25% of cached images
    const toRemove = Math.floor(keys.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
        await cache.delete(keys[i]);
    }
    
    console.log(`[Service Worker] Cleaned ${toRemove} old images from cache`);
}

// Background sync for queued updates
self.addEventListener('sync', async (event) => {
    if (event.tag === 'sync-progress') {
        console.log('[Service Worker] Syncing queued progress...');
        
        event.waitUntil(syncQueuedProgress());
    }
});

// Sync queued progress updates
async function syncQueuedProgress() {
    const queue = await getProgressQueue();
    
    if (queue.length === 0) {
        return;
    }
    
    console.log(`[Service Worker] Syncing ${queue.length} queued updates`);
    
    const successful = [];
    
    for (const item of queue) {
        try {
            const response = await fetch(item.url, {
                method: item.method,
                headers: item.headers,
                body: item.body
            });
            
            if (response.ok) {
                successful.push(item);
            }
        } catch (error) {
            console.error('[Service Worker] Sync failed for item:', error);
        }
    }
    
    // Remove successful items from queue
    if (successful.length > 0) {
        const remaining = queue.filter(item => !successful.includes(item));
        await saveProgressQueue(remaining);
        
        console.log(`[Service Worker] Synced ${successful.length} updates, ${remaining.length} remaining`);
    }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'SYNC_NOW') {
        syncQueuedProgress();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(names => {
            names.forEach(name => {
                if (name.startsWith('flash-fungi-')) {
                    caches.delete(name);
                }
            });
        });
    }
});

// Periodic cleanup (every 24 hours)
setInterval(() => {
    // Clean old items from runtime cache
    caches.open(RUNTIME_CACHE).then(cache => {
        cache.keys().then(keys => {
            const oneDay = 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            keys.forEach(request => {
                cache.match(request).then(response => {
                    if (response) {
                        const dateHeader = response.headers.get('date');
                        if (dateHeader) {
                            const responseTime = new Date(dateHeader).getTime();
                            if (now - responseTime > oneDay) {
                                cache.delete(request);
                            }
                        }
                    }
                });
            });
        });
    });
}, 24 * 60 * 60 * 1000); // Run daily

console.log('[Service Worker] Loaded successfully');