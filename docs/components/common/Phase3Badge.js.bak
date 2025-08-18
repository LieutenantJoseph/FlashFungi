// Phase3Badge.js - Reusable Phase/Coming Soon Badge Component
// Flash Fungi - Common Components

const h = React.createElement;

// Main Phase3Badge Component
function Phase3Badge({ 
    phase = 3, 
    text = null, 
    size = 'sm', 
    variant = 'default',
    showIcon = true,
    className = '',
    style = {},
    onClick = null
}) {
    // Default text based on phase
    const getDefaultText = () => {
        if (text) return text;
        
        switch (phase) {
            case 2:
                return 'Coming in Phase 2';
            case 3:
                return 'Coming in Phase 3';
            case 4:
                return 'Coming in Phase 4';
            default:
                return 'Coming Soon';
        }
    };
    
    // Size configurations
    const sizeConfig = {
        xs: {
            fontSize: '0.625rem',
            padding: '0.125rem 0.375rem',
            iconSize: '0.75rem'
        },
        sm: {
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            iconSize: '0.875rem'
        },
        md: {
            fontSize: '0.875rem',
            padding: '0.375rem 0.75rem',
            iconSize: '1rem'
        },
        lg: {
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            iconSize: '1.125rem'
        }
    };
    
    // Variant configurations
    const variantConfig = {
        default: {
            backgroundColor: '#e5e7eb',
            color: '#6b7280',
            border: '1px solid #d1d5db'
        },
        primary: {
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            border: '1px solid #93c5fd'
        },
        warning: {
            backgroundColor: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fbbf24'
        },
        info: {
            backgroundColor: '#f0f9ff',
            color: '#0369a1',
            border: '1px solid #38bdf8'
        },
        success: {
            backgroundColor: '#dcfce7',
            color: '#059669',
            border: '1px solid #34d399'
        },
        purple: {
            backgroundColor: '#f3e8ff',
            color: '#7c3aed',
            border: '1px solid #a78bfa'
        }
    };
    
    // Get icon based on phase or variant
    const getIcon = () => {
        if (!showIcon) return null;
        
        switch (variant) {
            case 'success':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '🚀';
        }
    };
    
    // Combined styles
    const combinedStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        borderRadius: '9999px',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...sizeConfig[size],
        ...variantConfig[variant],
        ...style
    };
    
    // Hover effect for clickable badges
    const handleMouseEnter = (e) => {
        if (onClick) {
            e.target.style.opacity = '0.8';
        }
    };
    
    const handleMouseLeave = (e) => {
        if (onClick) {
            e.target.style.opacity = '1';
        }
    };
    
    return h('span', {
        className,
        style: combinedStyles,
        onClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
    },
        getIcon() && h('span', { 
            style: { 
                fontSize: sizeConfig[size].iconSize,
                lineHeight: 1
            } 
        }, getIcon()),
        getDefaultText()
    );
}

// Specialized Badge Components
function ComingSoonBadge(props) {
    return h(Phase3Badge, {
        variant: 'default',
        text: 'Coming Soon',
        ...props
    });
}

function Phase2Badge(props) {
    return h(Phase3Badge, {
        phase: 2,
        variant: 'info',
        ...props
    });
}

function Phase3Badge_Default(props) {
    return h(Phase3Badge, {
        phase: 3,
        variant: 'primary',
        ...props
    });
}

function Phase4Badge(props) {
    return h(Phase3Badge, {
        phase: 4,
        variant: 'purple',
        ...props
    });
}

function InDevelopmentBadge(props) {
    return h(Phase3Badge, {
        text: 'In Development',
        variant: 'warning',
        showIcon: true,
        ...props
    });
}

function LockedFeatureBadge(props) {
    return h(Phase3Badge, {
        text: '🔒 Locked',
        variant: 'default',
        showIcon: false,
        ...props
    });
}

function BetaFeatureBadge(props) {
    return h(Phase3Badge, {
        text: 'Beta',
        variant: 'success',
        showIcon: true,
        ...props
    });
}

// Container component for multiple badges
function BadgeGroup({ children, spacing = '0.5rem', direction = 'row' }) {
    return h('div', {
        style: {
            display: 'flex',
            flexDirection: direction,
            gap: spacing,
            alignItems: 'center',
            flexWrap: 'wrap'
        }
    }, children);
}

// Feature Card wrapper with badge
function FeatureCard({ 
    title, 
    description, 
    icon, 
    badgeProps = {}, 
    onClick, 
    disabled = false,
    children,
    style = {}
}) {
    const cardStyles = {
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '2px solid transparent',
        cursor: disabled ? 'not-allowed' : (onClick ? 'pointer' : 'default'),
        transition: 'all 0.2s',
        opacity: disabled ? 0.7 : 1,
        position: 'relative',
        ...style
    };
    
    const handleMouseEnter = (e) => {
        if (!disabled && onClick) {
            e.currentTarget.style.borderColor = '#10b981';
        }
    };
    
    const handleMouseLeave = (e) => {
        if (!disabled) {
            e.currentTarget.style.borderColor = 'transparent';
        }
    };
    
    return h('div', {
        style: cardStyles,
        onClick: disabled ? null : onClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
    },
        // Badge in top right
        badgeProps && h('div', {
            style: {
                position: 'absolute',
                top: '1rem',
                right: '1rem'
            }
        }, h(Phase3Badge, badgeProps)),
        
        // Icon and title
        h('div', { 
            style: { 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1rem' 
            } 
        },
            icon && h('div', { style: { fontSize: '2rem' } }, icon),
            h('div', null,
                h('h3', { 
                    style: { 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        marginBottom: '0.25rem' 
                    } 
                }, title),
                description && h('p', { 
                    style: { 
                        color: '#6b7280', 
                        fontSize: '0.875rem' 
                    } 
                }, description)
            )
        ),
        
        children
    );
}

// Export components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Phase3Badge,
        ComingSoonBadge,
        Phase2Badge,
        Phase3Badge: Phase3Badge_Default,
        Phase4Badge,
        InDevelopmentBadge,
        LockedFeatureBadge,
        BetaFeatureBadge,
        BadgeGroup,
        FeatureCard
    };
} else {
    // Browser global assignment
    window.Phase3Badge = Phase3Badge;
    window.ComingSoonBadge = ComingSoonBadge;
    window.Phase2Badge = Phase2Badge;
    window.Phase3Badge_Default = Phase3Badge_Default;
    window.Phase4Badge = Phase4Badge;
    window.InDevelopmentBadge = InDevelopmentBadge;
    window.LockedFeatureBadge = LockedFeatureBadge;
    window.BetaFeatureBadge = BetaFeatureBadge;
    window.BadgeGroup = BadgeGroup;
    window.FeatureCard = FeatureCard;
}