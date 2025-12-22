import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../language/LanguageContext'
import Icon from '../components/Icon'

function LoginPage() {
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const auth = useAuth()
  const login = auth?.login

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!login || typeof login !== 'function') {
      setError('Login function not available. Please refresh the page.')
      setLoading(false)
      return
    }

    try {
      // Validate input
      if (!username || !password) {
        setError('Vui lòng nhập email và mật khẩu')
        setLoading(false)
        return
      }

      // Backend chỉ nhận email, không nhận username
      const loginData = { email: username.trim(), password }
      
      console.log('Sending login request to:', api.defaults.baseURL + '/auth/login')
      console.log('Login data:', { email: loginData.email, password: '***' })
      
      const res = await api.post('/auth/login', loginData)
      
      if (res.data && res.data.token && res.data.user) {
        console.log('Login successful, calling login function')
        login(res.data)
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }
        // Đợi một chút để đảm bảo state đã được cập nhật
        setTimeout(() => {
          // Kiểm tra xem có redirect URL sau khi login không (ví dụ: join family link)
          const redirectAfterLogin = localStorage.getItem('redirectAfterLogin')
          if (redirectAfterLogin) {
            localStorage.removeItem('redirectAfterLogin')
            navigate(redirectAfterLogin)
          } else {
            navigate('/')
          }
        }, 200)
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('Login error:', err)
      console.error('Error response:', err.response?.data)
      const errorMessage = err.response?.data?.message || err.message || t('loginFailed') || 'Đăng nhập thất bại'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      setError('')
      setLoading(true)

      const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID
      if (!fbAppId) {
        setError('Facebook App ID chưa được cấu hình')
        setLoading(false)
        return
      }

      if (typeof window === 'undefined' || !window.FB) {
        setError('Facebook SDK đang tải. Vui lòng đợi và thử lại.')
        setLoading(false)
        return
      }

      if (typeof window.FB.login !== 'function') {
        setError('Facebook SDK chưa sẵn sàng. Vui lòng refresh trang và thử lại.')
        setLoading(false)
        return
      }

      try {
        window.FB.login((response) => {
          setLoading(false)
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken
            
            if (!accessToken) {
              setError('Không thể lấy access token từ Facebook')
              return
            }

            setLoading(true)
            api.post('/auth/facebook', { accessToken })
              .then((res) => {
                if (res.data && res.data.token && res.data.user) {
                  if (login && typeof login === 'function') {
                    login(res.data)
                    setTimeout(() => {
                      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin')
                      if (redirectAfterLogin) {
                        localStorage.removeItem('redirectAfterLogin')
                        navigate(redirectAfterLogin)
                      } else {
                        navigate('/')
                      }
                    }, 200)
                  } else {
                    setError('Login function không khả dụng')
                  }
                } else {
                  setError('Phản hồi không hợp lệ từ server')
                }
              })
              .catch((err) => {
                console.error('Facebook login API error:', err)
                setError(err.response?.data?.message || 'Đăng nhập Facebook thất bại')
              })
              .finally(() => {
                setLoading(false)
              })
          } else {
            if (response.status === 'not_authorized') {
              setError('Bạn đã từ chối quyền truy cập Facebook')
            } else {
              setError('Đăng nhập Facebook bị hủy hoặc thất bại')
            }
          }
        }, { scope: 'email,public_profile' })
      } catch (fbErr) {
        console.error('Facebook SDK error:', fbErr)
        setError('Lỗi khi gọi Facebook SDK: ' + (fbErr.message || 'Unknown error'))
        setLoading(false)
      }
    } catch (err) {
      console.error('Facebook login error:', err)
      setError('Lỗi khi đăng nhập Facebook: ' + (err.message || 'Unknown error'))
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!googleClientId) {
        setError('Google Client ID chưa được cấu hình. Vui lòng liên hệ admin.')
        return
      }

      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            try {
              const res = await api.post('/auth/google', { idToken: response.credential })
              if (res.data && res.data.token && res.data.user) {
                login(res.data)
                navigate('/')
              }
            } catch (err) {
              setError(err.response?.data?.message || 'Đăng nhập Google thất bại')
            }
          },
        })

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            window.google.accounts.oauth2.initTokenClient({
              client_id: googleClientId,
              scope: 'email profile',
              callback: async (tokenResponse) => {
                try {
                  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  })
                  const userInfo = await userInfoRes.json()
                  
                  const res = await api.post('/auth/google', { 
                    idToken: tokenResponse.access_token,
                    email: userInfo.email,
                    name: userInfo.name
                  })
                  if (res.data && res.data.token && res.data.user) {
                    login(res.data)
                    navigate('/')
                  }
                } catch (err) {
                  setError(err.response?.data?.message || 'Đăng nhập Google thất bại')
                }
              },
            }).requestAccessToken()
          }
        })
      } else {
        setError('Google SDK chưa sẵn sàng. Vui lòng refresh trang và thử lại.')
      }
    } catch (err) {
      console.error('Google login error:', err)
      setError('Lỗi khi đăng nhập Google')
    }
  }

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    document.documentElement.style.colorScheme = 'light'
    document.body.style.backgroundColor = '#fff7ed'
    document.body.style.color = '#0f172a'
    
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const userParam = urlParams.get('user')
    const error = urlParams.get('error')

    if (error) {
      setError(decodeURIComponent(error))
      window.history.replaceState({}, '', '/login')
    } else if (token && userParam && login) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        login({ token, user })
        setTimeout(() => {
          const redirectAfterLogin = localStorage.getItem('redirectAfterLogin')
          if (redirectAfterLogin) {
            localStorage.removeItem('redirectAfterLogin')
            navigate(redirectAfterLogin)
          } else {
            navigate('/')
          }
        }, 200)
        window.history.replaceState({}, '', '/login')
      } catch (err) {
        console.error('Error parsing callback data:', err)
        setError('Lỗi khi xử lý thông tin đăng nhập')
      }
    }
    
    const initFacebookSDK = () => {
      if (typeof window !== 'undefined' && window.FB) {
        const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID
        if (fbAppId) {
          try {
            if (!window.FB._initialized) {
              window.FB.init({
                appId: fbAppId,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
              })
              window.FB._initialized = true
              console.log('Facebook SDK initialized with App ID:', fbAppId)
            }
          } catch (err) {
            console.error('Error initializing Facebook SDK:', err)
          }
        } else {
          console.warn('Facebook App ID not found in environment variables')
        }
      } else {
        const maxAttempts = 50
        let attempts = 0
        const checkSDK = setInterval(() => {
          attempts++
          if (typeof window !== 'undefined' && window.FB) {
            clearInterval(checkSDK)
            initFacebookSDK()
          } else if (attempts >= maxAttempts) {
            clearInterval(checkSDK)
            console.error('Facebook SDK failed to load after', maxAttempts * 100, 'ms')
          }
        }, 100)
      }
    }

    if (typeof window !== 'undefined') {
      window.fbAsyncInit = function() {
        initFacebookSDK()
      }
      initFacebookSDK()
    }
  }, [login, navigate])

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#fef2f2' }}>
      <div className="w-full max-w-md">
        <h2 className="text-4xl font-bold text-blue-900 mb-8 text-center">Login</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Sign In</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Icon name="user" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size="sm" />
                <input
                  type="text"
                  placeholder={t('enterUsername') || 'Enter Username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400 text-slate-900 bg-white"
                  required
                />
              </div>
              <div className="relative">
                <Icon name="lock" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size="sm" />
                <input
                  type="password"
                  placeholder={t('enterPassword') || 'Enter Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400 text-slate-900 bg-white"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-slate-400 rounded focus:ring-orange-500 cursor-pointer"
                    style={{ accentColor: '#F4511E' }}
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-900 font-semibold cursor-pointer">
                    {t('rememberMe') || 'Remember Me'}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  {t('forgotPassword') || 'Forgot Password?'}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? t('processing') || 'Processing...' : t('login')}
              </button>
            </form>
            <div className="mt-6">
              <p className="text-sm text-center text-slate-900 mb-4">
                {t('orLoginWith') || 'Or, Login with'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleFacebookLogin}
                  disabled={loading}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition cursor-pointer"
                  title="Đăng nhập bằng Facebook"
                >
                  <span className="text-white font-bold text-lg">f</span>
                </button>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-12 h-12 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center transition cursor-pointer"
                  title="Đăng nhập bằng Google"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
              </div>
            </div>
            <p className="mt-6 text-sm text-center text-slate-900">
              {t('dontHaveAccount') || "Don't have an account?"}{' '}
              <Link to="/register" className="text-orange-600 hover:underline font-medium">
                {t('createOne') || 'Create One'}
              </Link>
            </p>
          </div>
      </div>
    </div>
  )
}

export default LoginPage
