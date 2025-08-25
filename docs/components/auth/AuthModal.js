// AuthModal.js - Living Mycology Style Update
// Flash Fungi - Modern authentication modal with gradient design

(function() {
    'use strict';

    window.AuthModal = function AuthModal({ onClose }) {
        const [mode, setMode] = React.useState('signin');
        const [formData, setFormData] = React.useState({
            email: '',
            password: '',
            username: '',
            confirmPassword: ''
        });
        const [loading, setLoading] = React.useState(false);
        const [error, setError] = React.useState('');

        // Get auth context
        const auth = window.useAuth ? window.useAuth() : null;

        const handleInputChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            setError('');
        };

        const validateForm = () => {
            if (!formData.email || !formData.password) {
                setError('Email and password are required');
                return false;
            }

            if (mode === 'signup') {
                if (!formData.username) {
                    setError('Username is required');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return false;
                }
                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    return false;
                }
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setError('Please enter a valid email address');
                return false;
            }

            return true;
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!validateForm()) return;
            if (!auth) {
                setError('Authentication system is not available');
                return;
            }

            setLoading(true);
            setError('');

            try {
                let result;
                
                if (mode === 'signup') {
                    result = await auth.signUp(formData.email, formData.password, formData.username);
                } else {
                    result = await auth.signIn(formData.email, formData.password);
                }

                if (result.error) {
                    setError(result.error.message || 'Authentication failed');
                } else {
                    if (mode === 'signup') {
                        alert('Account created! Please check your email to verify.');
                    }
                    onClose();
                }
            } catch (err) {
                console.error('Auth error:', err);
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        return React.createElement('div', {
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
                backdropFilter: 'blur(4px)'
            },
            onClick: (e) => {
                if (e.target === e.currentTarget) onClose();
            }
        },
            React.createElement('div', {
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '450px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    animation: 'slideUp 0.3s ease-out'
                }
            },
                // Gradient Header
                React.createElement('div', {
                    style: {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        padding: '2rem',
                        position: 'relative'
                    }
                },
                    React.createElement('button', {
                        onClick: onClose,
                        style: {
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '1.25rem',
                            transition: 'background 0.2s'
                        }
                    }, '×'),
                    
                    React.createElement('div', {
                        style: {
                            textAlign: 'center',
                            color: 'white'
                        }
                    },
                        React.createElement('div', {
                            style: { fontSize: '3rem', marginBottom: '0.5rem' }
                        }, '🍄'),
                        React.createElement('h2', {
                            style: {
                                fontSize: '1.75rem',
                                fontWeight: 'bold',
                                marginBottom: '0.5rem'
                            }
                        }, 'Flash Fungi'),
                        React.createElement('p', {
                            style: {
                                fontSize: '0.875rem',
                                opacity: 0.9
                            }
                        }, mode === 'signin' ? 'Welcome back!' : 'Join our mycology community')
                    )
                ),

                // Form Content
                React.createElement('form', {
                    onSubmit: handleSubmit,
                    style: {
                        padding: '2rem'
                    }
                },
                    // Mode Tabs
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            marginBottom: '2rem',
                            borderRadius: '0.5rem',
                            backgroundColor: '#f3f4f6',
                            padding: '0.25rem'
                        }
                    },
                        ['signin', 'signup'].map(tabMode => 
                            React.createElement('button', {
                                key: tabMode,
                                type: 'button',
                                onClick: () => {
                                    setMode(tabMode);
                                    setError('');
                                    setFormData({
                                        email: '',
                                        password: '',
                                        username: '',
                                        confirmPassword: ''
                                    });
                                },
                                style: {
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: mode === tabMode ? 'white' : 'transparent',
                                    color: mode === tabMode ? '#059669' : '#6b7280',
                                    boxShadow: mode === tabMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none'
                                }
                            }, tabMode === 'signin' ? 'Sign In' : 'Create Account')
                        )
                    ),

                    // Username field (signup only)
                    mode === 'signup' && React.createElement('div', {
                        style: { marginBottom: '1.25rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Username'),
                        React.createElement('input', {
                            type: 'text',
                            value: formData.username,
                            onChange: (e) => handleInputChange('username', e.target.value),
                            placeholder: 'Choose a username',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                                outline: 'none'
                            },
                            onFocus: (e) => e.target.style.borderColor = '#059669',
                            onBlur: (e) => e.target.style.borderColor = '#e5e7eb'
                        })
                    ),

                    // Email field
                    React.createElement('div', {
                        style: { marginBottom: '1.25rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Email'),
                        React.createElement('input', {
                            type: 'email',
                            value: formData.email,
                            onChange: (e) => handleInputChange('email', e.target.value),
                            placeholder: 'Enter your email',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                                outline: 'none'
                            },
                            onFocus: (e) => e.target.style.borderColor = '#059669',
                            onBlur: (e) => e.target.style.borderColor = '#e5e7eb'
                        })
                    ),

                    // Password field
                    React.createElement('div', {
                        style: { marginBottom: '1.25rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Password'),
                        React.createElement('input', {
                            type: 'password',
                            value: formData.password,
                            onChange: (e) => handleInputChange('password', e.target.value),
                            placeholder: mode === 'signup' ? 'At least 6 characters' : 'Enter your password',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                                outline: 'none'
                            },
                            onFocus: (e) => e.target.style.borderColor = '#059669',
                            onBlur: (e) => e.target.style.borderColor = '#e5e7eb'
                        })
                    ),

                    // Confirm Password field (signup only)
                    mode === 'signup' && React.createElement('div', {
                        style: { marginBottom: '1.5rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Confirm Password'),
                        React.createElement('input', {
                            type: 'password',
                            value: formData.confirmPassword,
                            onChange: (e) => handleInputChange('confirmPassword', e.target.value),
                            placeholder: 'Confirm your password',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                                outline: 'none'
                            },
                            onFocus: (e) => e.target.style.borderColor = '#059669',
                            onBlur: (e) => e.target.style.borderColor = '#e5e7eb'
                        })
                    ),

                    // Error message
                    error && React.createElement('div', {
                        style: {
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    },
                        React.createElement('span', null, '⚠️'),
                        error
                    ),

                    // Submit button
                    React.createElement('button', {
                        type: 'submit',
                        disabled: loading,
                        style: {
                            width: '100%',
                            padding: '0.875rem',
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transform: loading ? 'scale(1)' : 'scale(1)'
                        },
                        onMouseEnter: (e) => {
                            if (!loading) {
                                e.target.style.transform = 'scale(1.02)';
                                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }
                        },
                        onMouseLeave: (e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }
                    }, loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account'))
                )
            )
        );
    };

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    console.log('✅ AuthModal component loaded - Living Mycology Style');
})();