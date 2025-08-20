(function() {
    'use strict';

    window.AuthModal = function AuthModal({ onClose }) {
        const auth = window.useAuth();
        const [mode, setMode] = React.useState('signin'); // 'signin' or 'signup'
        const [formData, setFormData] = React.useState({
            email: '',
            password: '',
            username: '',
            confirmPassword: ''
        });
        const [loading, setLoading] = React.useState(false);
        const [error, setError] = React.useState('');

        const handleInputChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            setError(''); // Clear error when user types
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
                if (formData.username.length < 3) {
                    setError('Username must be at least 3 characters');
                    return false;
                }
                if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                    setError('Username can only contain letters, numbers, and underscores');
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
                    // Success!
                    if (mode === 'signup') {
                        setError(''); // Clear any errors
                        // Show success message for signup
                        alert('Account created successfully! Please check your email to verify your account.');
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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            },
            onClick: (e) => {
                if (e.target === e.currentTarget) onClose();
            }
        },
            React.createElement('div', {
                style: {
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
            },
                // Header
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }
                },
                    React.createElement('h2', {
                        style: {
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#374151'
                        }
                    }, mode === 'signin' ? 'Sign In' : 'Create Account'),
                    React.createElement('button', {
                        onClick: onClose,
                        style: {
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#6b7280',
                            cursor: 'pointer'
                        }
                    }, '×')
                ),

                // Form
                React.createElement('form', { onSubmit: handleSubmit },
                    // Username field (signup only)
                    mode === 'signup' && React.createElement('div', {
                        style: { marginBottom: '1rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.25rem'
                            }
                        }, 'Username'),
                        React.createElement('input', {
                            type: 'text',
                            value: formData.username,
                            onChange: (e) => handleInputChange('username', e.target.value),
                            placeholder: 'Enter username',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        })
                    ),

                    // Email field
                    React.createElement('div', {
                        style: { marginBottom: '1rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.25rem'
                            }
                        }, 'Email'),
                        React.createElement('input', {
                            type: 'email',
                            value: formData.email,
                            onChange: (e) => handleInputChange('email', e.target.value),
                            placeholder: 'Enter email',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        })
                    ),

                    // Password field
                    React.createElement('div', {
                        style: { marginBottom: mode === 'signup' ? '1rem' : '1.5rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.25rem'
                            }
                        }, 'Password'),
                        React.createElement('input', {
                            type: 'password',
                            value: formData.password,
                            onChange: (e) => handleInputChange('password', e.target.value),
                            placeholder: 'Enter password',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
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
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.25rem'
                            }
                        }, 'Confirm Password'),
                        React.createElement('input', {
                            type: 'password',
                            value: formData.confirmPassword,
                            onChange: (e) => handleInputChange('confirmPassword', e.target.value),
                            placeholder: 'Confirm password',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
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
                            marginBottom: '1rem'
                        }
                    }, error),

                    // Submit button
                    React.createElement('button', {
                        type: 'submit',
                        disabled: loading,
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: loading ? '#d1d5db' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '1rem'
                        }
                    }, loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account'))
                ),

                // Mode toggle
                React.createElement('div', {
                    style: {
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }
                },
                    mode === 'signin' ? "Don't have an account? " : 'Already have an account? ',
                    React.createElement('button', {
                        type: 'button',
                        onClick: () => {
                            setMode(mode === 'signin' ? 'signup' : 'signin');
                            setError('');
                            setFormData({
                                email: '',
                                password: '',
                                username: '',
                                confirmPassword: ''
                            });
                        },
                        style: {
                            background: 'none',
                            border: 'none',
                            color: '#10b981',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }
                    }, mode === 'signin' ? 'Sign up' : 'Sign in')
                )
            )
        );
    };

    console.log('✅ AuthModal component loaded');

})();