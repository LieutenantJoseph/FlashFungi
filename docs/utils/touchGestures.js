// Touch Gesture Utility - Phase 3 Mobile Optimization
// Provides consistent touch gesture handling across study components

(function() {
    'use strict';
    
    // Touch gesture configuration
    const GESTURE_CONFIG = {
        minSwipeDistance: 50,
        maxSwipeTime: 300,
        tapTimeout: 200,
        doubleTapDelay: 300,
        longPressDelay: 500
    };
    
    // Touch gesture hook for React components
    window.useTouchGestures = function(options = {}) {
        const {
            onSwipeLeft = null,
            onSwipeRight = null,
            onSwipeUp = null,
            onSwipeDown = null,
            onTap = null,
            onDoubleTap = null,
            onLongPress = null,
            onPinch = null,
            disabled = false,
            element = null
        } = options;
        
        const [touchState, setTouchState] = React.useState({
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            startTime: 0,
            touchCount: 0,
            lastTap: 0,
            longPressTimer: null,
            initialDistance: 0
        });
        
        const gestureHandlers = React.useMemo(() => {
            if (disabled) return {};
            
            const handleTouchStart = (e) => {
                const touch = e.touches[0];
                const now = Date.now();
                
                // Clear any existing long press timer
                if (touchState.longPressTimer) {
                    clearTimeout(touchState.longPressTimer);
                }
                
                const newState = {
                    startX: touch.clientX,
                    startY: touch.clientY,
                    endX: touch.clientX,
                    endY: touch.clientY,
                    startTime: now,
                    touchCount: e.touches.length,
                    initialDistance: e.touches.length > 1 ? getTouchDistance(e.touches) : 0
                };
                
                setTouchState(prev => ({ ...prev, ...newState }));
                
                // Start long press timer
                if (onLongPress && e.touches.length === 1) {
                    const timer = setTimeout(() => {
                        onLongPress(e);
                    }, GESTURE_CONFIG.longPressDelay);
                    
                    setTouchState(prev => ({ ...prev, longPressTimer: timer }));
                }
            };
            
            const handleTouchMove = (e) => {
                const touch = e.touches[0];
                
                setTouchState(prev => ({
                    ...prev,
                    endX: touch.clientX,
                    endY: touch.clientY
                }));
                
                // Cancel long press if finger moves too much
                const deltaX = Math.abs(touch.clientX - touchState.startX);
                const deltaY = Math.abs(touch.clientY - touchState.startY);
                
                if ((deltaX > 10 || deltaY > 10) && touchState.longPressTimer) {
                    clearTimeout(touchState.longPressTimer);
                    setTouchState(prev => ({ ...prev, longPressTimer: null }));
                }
                
                // Handle pinch gesture
                if (onPinch && e.touches.length === 2) {
                    const currentDistance = getTouchDistance(e.touches);
                    const scale = currentDistance / touchState.initialDistance;
                    onPinch({ scale, center: getTouchCenter(e.touches) });
                }
            };
            
            const handleTouchEnd = (e) => {
                const now = Date.now();
                const deltaTime = now - touchState.startTime;
                const deltaX = touchState.endX - touchState.startX;
                const deltaY = touchState.endY - touchState.startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Clear long press timer
                if (touchState.longPressTimer) {
                    clearTimeout(touchState.longPressTimer);
                    setTouchState(prev => ({ ...prev, longPressTimer: null }));
                }
                
                // Handle swipe gestures
                if (distance > GESTURE_CONFIG.minSwipeDistance && deltaTime < GESTURE_CONFIG.maxSwipeTime) {
                    const absX = Math.abs(deltaX);
                    const absY = Math.abs(deltaY);
                    
                    if (absX > absY) {
                        // Horizontal swipe
                        if (deltaX > 0 && onSwipeRight) {
                            onSwipeRight({ deltaX, deltaY, deltaTime });
                        } else if (deltaX < 0 && onSwipeLeft) {
                            onSwipeLeft({ deltaX, deltaY, deltaTime });
                        }
                    } else {
                        // Vertical swipe
                        if (deltaY > 0 && onSwipeDown) {
                            onSwipeDown({ deltaX, deltaY, deltaTime });
                        } else if (deltaY < 0 && onSwipeUp) {
                            onSwipeUp({ deltaX, deltaY, deltaTime });
                        }
                    }
                }
                // Handle tap gestures
                else if (distance < 10 && deltaTime < GESTURE_CONFIG.tapTimeout) {
                    // Check for double tap
                    if (onDoubleTap && (now - touchState.lastTap) < GESTURE_CONFIG.doubleTapDelay) {
                        onDoubleTap({ x: touchState.endX, y: touchState.endY });
                        setTouchState(prev => ({ ...prev, lastTap: 0 })); // Reset to prevent triple tap
                    } else {
                        setTouchState(prev => ({ ...prev, lastTap: now }));
                        
                        // Single tap (with delay to check for double tap)
                        if (onTap) {
                            setTimeout(() => {
                                if (touchState.lastTap === now) { // Still the last tap
                                    onTap({ x: touchState.endX, y: touchState.endY });
                                }
                            }, GESTURE_CONFIG.doubleTapDelay);
                        }
                    }
                }
            };
            
            const handleTouchCancel = () => {
                if (touchState.longPressTimer) {
                    clearTimeout(touchState.longPressTimer);
                    setTouchState(prev => ({ ...prev, longPressTimer: null }));
                }
            };
            
            return {
                onTouchStart: handleTouchStart,
                onTouchMove: handleTouchMove,
                onTouchEnd: handleTouchEnd,
                onTouchCancel: handleTouchCancel
            };
        }, [disabled, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, onLongPress, onPinch, touchState]);
        
        // Auto-attach to element if provided
        React.useEffect(() => {
            if (!element || disabled) return;
            
            const el = typeof element === 'string' ? document.querySelector(element) : element;
            if (!el) return;
            
            Object.entries(gestureHandlers).forEach(([event, handler]) => {
                el.addEventListener(event.replace('on', '').toLowerCase(), handler, { passive: false });
            });
            
            return () => {
                Object.entries(gestureHandlers).forEach(([event, handler]) => {
                    el.removeEventListener(event.replace('on', '').toLowerCase(), handler);
                });
            };
        }, [element, disabled, gestureHandlers]);
        
        return gestureHandlers;
    };
    
    // Helper functions
    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    function getTouchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }
    
    // Touch feedback utility
    window.provideTouchFeedback = function(type = 'light') {
        if ('vibrate' in navigator) {
            switch (type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(25);
                    break;
                case 'heavy':
                    navigator.vibrate(50);
                    break;
                case 'success':
                    navigator.vibrate([50, 50, 100]);
                    break;
                case 'error':
                    navigator.vibrate([100, 50, 100, 50, 100]);
                    break;
            }
        }
    };
    
    // Gesture instruction component
    window.GestureInstructions = function({ gestures = [], className = '' }) {
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
        if (!isMobile || gestures.length === 0) return null;
        
        return React.createElement('div', {
            className: `text-center text-gray-500 text-sm py-2 ${className}`
        },
            React.createElement('div', { className: 'flex justify-center items-center space-x-4' },
                gestures.map((gesture, index) =>
                    React.createElement('span', { 
                        key: index,
                        className: 'flex items-center space-x-1'
                    },
                        React.createElement('span', null, gesture.icon),
                        React.createElement('span', null, gesture.text)
                    )
                )
            )
        );
    };
    
    // Mobile detection utility
    window.isMobileDevice = function() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
    };
    
    // Safe area utilities for mobile
    window.getSafeAreaInsets = function() {
        const style = getComputedStyle(document.documentElement);
        return {
            top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
            right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
            bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
            left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
        };
    };
    
    console.log('✅ Touch gesture utility loaded successfully');
    
})();