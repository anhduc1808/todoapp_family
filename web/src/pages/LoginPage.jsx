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
      // Backend chỉ nhận email, không nhận username
      const loginData = { email: username, password }
      
      const res = await api.post('/auth/login', loginData)
      
      if (res.data && res.data.token && res.data.user) {
        login(res.data)
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }
        setTimeout(() => {
          navigate('/')
        }, 100)
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      setError(err.response?.data?.message || t('loginFailed') || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      if (!window.FB) {
        setError('Facebook SDK chưa sẵn sàng. Vui lòng thử lại sau.')
        return
      }

      window.FB.login(async (response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken
          
          try {
            const res = await api.post('/auth/facebook', { accessToken })
            if (res.data && res.data.token && res.data.user) {
              login(res.data)
              navigate('/')
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập Facebook thất bại')
          }
        } else {
          setError('Đăng nhập Facebook bị hủy')
        }
      }, { scope: 'email,public_profile' })
    } catch (err) {
      console.error('Facebook login error:', err)
      setError('Lỗi khi đăng nhập Facebook')
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
    
    if (window.FB && !window.FB._initialized) {
      const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID
      if (fbAppId) {
        window.FB.init({
          appId: fbAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        })
        window.FB._initialized = true
      }
    }
  }, [])

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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-slate-400 rounded focus:ring-orange-500 cursor-pointer"
                  style={{ accentColor: '#F4511E' }}
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-700 font-medium cursor-pointer">
                  {t('rememberMe') || 'Remember Me'}
                </label>
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
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition cursor-pointer"
                >
                  <span className="text-white font-bold">f</span>
                </button>
                <button
                  onClick={handleGoogleLogin}
                  className="w-12 h-12 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center transition cursor-pointer"
                >
                  <span className="text-slate-700 font-bold">G</span>
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
