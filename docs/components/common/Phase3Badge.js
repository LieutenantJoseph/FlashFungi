// components/common/Phase3Badge.js
// Badge component to indicate features coming in Phase 3

const h = React.createElement;

function Phase3Badge({ size = 'sm', className = '' }) {
    const sizeStyles = {
        xs: {
            fontSize: '0.625rem',
            padding: '0.125rem 0.375rem'
        },
        sm: {
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem'
        },
        md: {
            fontSize: '0.875rem',
            padding: '0.375rem 0.75rem'
        },
        lg: {
            fontSize: '1rem',
            padding: '0.5rem 1rem'
        }
    };

    return h('span', {
        className: className,
        style: {
            ...sizeStyles[size],
            backgroundColor: '#8b5cf6',
            color: 'white',
            borderRadius: '9999px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            whiteSpace: 'nowrap'
        }
    },
        h('span', null, '🚀'),
        'Phase 3'
    );
}

function ComingSoonBadge({ size = 'sm', className = '' }) {
    const sizeStyles = {
        xs: {
            fontSize: '0.625rem',
            padding: '0.125rem 0.375rem'
        },
        sm: {
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem'
        },
        md: {
            fontSize: '0.875rem',
            padding: '0.375rem 0.75rem'
        },
        lg: {
            fontSize: '1rem',
            padding: '0.5rem 1rem'
        }
    };

    return h('span', {
        className: className,
        style: {
            ...sizeStyles[size],
            backgroundColor: '#6b7280',
            color: 'white',
            borderRadius: '9999px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            whiteSpace: 'nowrap'
        }
    },
        h('span', null, '⏳'),
        'Coming Soon'
    );
}

function DNABadge({ size = 'sm', className = '' }) {
    const sizeStyles = {
        xs: {
            fontSize: '0.625rem',
            padding: '0.125rem 0.375rem'
        },
        sm: {
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem'
        },
        md: {
            fontSize: '0.875rem',
            padding: '0.375rem 0.75rem'
        },
        lg: {
            fontSize: '1rem',
            padding: '0.5rem 1rem'
        }
    };

    return h('span', {
        className: className,
        style: {
            ...sizeStyles[size],
            backgroundColor: '#7c3aed',
            color: 'white',
            borderRadius: '9999px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            whiteSpace: 'nowrap'
        }
    },
        h('span', null, '🧬'),
        'DNA Verified'
    );
}

function ApprovedBadge({ size = 'sm', className = '' }) {
    const sizeStyles = {
        xs: {
            fontSize: '0.625rem',
            padding: '0.125rem 0.375rem'
        },
        sm: {
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem'
        },
        md: {
            fontSize: '0.875rem',
            padding: '0.375rem 0.75rem'
        },
        lg: {
            fontSize: '1rem',
            padding: '0.5rem 1rem'
        }
    };

    return h('span', {
        className: className,
        style: {
            ...sizeStyles[size],
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '9999px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            whiteSpace: 'nowrap'
        }
    },
        h('span', null, '✅'),
        'Approved'
    );
}

// Feature Card with Phase 3 indicator
function FeatureCard({ 
    title, 
    description, 
    icon, 
    isPhase3 = false, 
    isComingSoon = false, 
    onClick, 
    disabled = false,
    children 
}) {
    return h('div', {
        style: {
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            cursor: disabled ? 'not-allowed' : (onClick ? 'pointer' : 'default'),
            border: '2px solid transparent',
            transition: 'all 0.2s',
            opacity: disabled ? 0.6 : 1,
            position: 'relative'
        },
        onClick: disabled ? undefined : onClick,
        onMouseEnter: disabled ? undefined : (e) => {
            if (onClick) e.currentTarget.style.borderColor = '#10b981';
        },
        onMouseLeave: disabled ? undefined : (e) => {
            if (onClick) e.currentTarget.style.borderColor = 'transparent';
        }
    },
        // Badge in top right
        (isPhase3 || isComingSoon) && h('div', {
            style: {
                position: 'absolute',
                top: '1rem',
                right: '1rem'
            }
        },
            isPhase3 ? h(Phase3Badge, { size: 'xs' }) : h(ComingSoonBadge, { size: 'xs' })
        ),

        h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' } },
            h('div', { style: { fontSize: '2rem' } }, icon),
            h('div', null,
                h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' } }, title),
                h('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, description)
            )
        ),

        children
    );
}

// Export to window for global access
window.Phase3Badge = Phase3Badge;
window.ComingSoonBadge = ComingSoonBadge;
window.DNABadge = DNABadge;
window.ApprovedBadge = ApprovedBadge;
window.FeatureCard = FeatureCard;