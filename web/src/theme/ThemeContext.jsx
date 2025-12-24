import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      // Đọc theme từ localStorage, mặc định là light mode
      const savedTheme = localStorage.getItem('theme')
      const shouldBeDark = savedTheme === 'dark'
      
      const html = document.documentElement
      const body = document.body
      
      if (html) {
        if (shouldBeDark) {
          html.classList.add('dark')
          html.classList.remove('light')
          html.setAttribute('data-theme', 'dark')
          html.style.colorScheme = 'dark'
        } else {
          html.classList.remove('dark')
          html.classList.add('light')
          html.setAttribute('data-theme', 'light')
          html.style.colorScheme = 'light'
        }
      }
      
      if (body) {
        if (shouldBeDark) {
          body.style.backgroundColor = '#111827'
          body.style.color = '#F9FAFB'
        } else {
          body.style.backgroundColor = '#F9FAFB'
          body.style.color = '#111827'
        }
      }
      
      return shouldBeDark
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    const html = document.documentElement
    const body = document.body
    const rootElement = document.getElementById('root')
    
    if (!html || !body) {
      return
    }
    
    if (isDark) {
      html.classList.add('dark')
      html.classList.remove('light')
      html.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
      body.style.backgroundColor = '#111827'
      body.style.color = '#F9FAFB'
      if (rootElement) {
        rootElement.style.backgroundColor = '#111827'
        rootElement.style.color = '#F9FAFB'
      }
      localStorage.setItem('theme', 'dark')
      console.log('Effect: Applied dark mode')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
      html.setAttribute('data-theme', 'light')
      html.style.colorScheme = 'light'
      html.style.backgroundColor = '#F8FAFC'
      root.style.colorScheme = 'light'
      body.style.backgroundColor = '#F8FAFC'
      body.style.color = '#1E293B'
      if (rootElement) {
        rootElement.style.backgroundColor = '#F8FAFC'
        rootElement.style.color = '#1E293B'
      }
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => {
    console.log('Toggle theme called, current isDark:', isDark)
    const newValue = !isDark
    console.log('Setting isDark to:', newValue)
    
    // Update state
    setIsDark(newValue)
    
    // Apply ngay lập tức để đảm bảo UI update ngay
    const html = document.documentElement
    const body = document.body
    const root = document.getElementById('root')
    
    html.classList.remove('dark')
    
    if (newValue) {
      html.classList.add('dark')
      html.classList.remove('light')
      html.setAttribute('data-theme', 'dark')
      html.style.colorScheme = 'dark'
      body.style.backgroundColor = '#121212'
      body.style.color = '#E2E2E2'
      if (root) {
        root.style.backgroundColor = '#121212'
        root.style.color = '#E2E2E2'
      }
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
      html.setAttribute('data-theme', 'light')
      html.style.colorScheme = 'light'
      html.style.backgroundColor = '#F9FAFB'
      body.style.backgroundColor = '#F9FAFB'
      body.style.color = '#111827'
      if (root) {
        root.style.backgroundColor = '#F9FAFB'
        root.style.color = '#111827'
      }
      localStorage.setItem('theme', 'light')
      
      // Force remove dark classes từ tất cả elements có thể
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        // Remove dark mode inline styles nếu có
        if (el.style && el.style.backgroundColor === 'rgb(15, 23, 42)') {
          el.style.backgroundColor = ''
        }
        if (el.style && el.style.color === 'rgb(241, 245, 249)') {
          el.style.color = ''
        }
      })
      
      const darkElements = document.querySelectorAll('[class*="dark:"]')
      console.log('Found elements with dark: classes:', darkElements.length)
      darkElements.forEach((el) => {
        void el.offsetHeight
      })
    }
    
    // Force reflow và repaint
    void html.offsetHeight
    void body.offsetHeight
    if (root) void root.offsetHeight
    
    // Trigger repaint
    window.getComputedStyle(html).color
    window.getComputedStyle(body).backgroundColor
    
    window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark: newValue } }))
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    // Fallback để tránh lỗi khi hot reload
    if (import.meta.env.DEV) {
      console.warn('useTheme called outside ThemeProvider, using fallback')
    }
    const fallbackIsDark = typeof window !== 'undefined' 
      ? (localStorage.getItem('theme') === 'dark')
      : false
    return {
      isDark: fallbackIsDark,
      toggleTheme: () => {
        if (typeof window !== 'undefined') {
          const newValue = !fallbackIsDark
          localStorage.setItem('theme', newValue ? 'dark' : 'light')
          location.reload()
        }
      },
      setIsDark: () => {},
    }
  }
  return context
}
