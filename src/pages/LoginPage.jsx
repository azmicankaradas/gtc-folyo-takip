import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage({ darkMode }) {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (isRegister) {
      if (password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır.')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi.')
        setIsRegister(false)
        setEmail('')
        setPassword('')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.message.includes('Invalid login')) {
          setError('E-posta veya şifre hatalı.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanızı kontrol edin.')
        } else {
          setError(error.message)
        }
      }
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen font-sans flex items-center justify-center p-4 transition-colors duration-200 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/pwa-192x192.png"
            alt="GTC Folyo Takip"
            className="w-24 h-24 rounded-2xl shadow-lg mb-4"
          />
          <h1 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Folyo Stok Takip
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            GTC Endüstriyel
          </p>
        </div>

        {/* Kart */}
        <div className={`rounded-2xl shadow-xl border p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

          {/* Tab Başlıkları */}
          <div className={`flex rounded-xl p-1 mb-6 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
            <button
              onClick={() => { setIsRegister(false); setError(''); setSuccess('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${!isRegister
                ? 'bg-blue-600 text-white shadow-md'
                : (darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              <LogIn size={16} /> Giriş Yap
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); setSuccess('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${isRegister
                ? 'bg-blue-600 text-white shadow-md'
                : (darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              <UserPlus size={16} /> Kayıt Ol
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-posta */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                E-posta
              </label>
              <div className={`flex items-center rounded-xl border-2 px-3 transition-colors ${darkMode
                ? 'bg-slate-900 border-slate-600 focus-within:border-blue-500'
                : 'bg-gray-50 border-gray-300 focus-within:border-blue-500'
              }`}>
                <Mail size={18} className={darkMode ? 'text-slate-500' : 'text-gray-400'} />
                <input
                  type="email"
                  placeholder={isRegister ? 'ad.soyad@gtcendustriyel.com' : 'E-posta adresiniz'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full p-3 bg-transparent outline-none font-medium ${darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-gray-400'}`}
                />
              </div>
              {isRegister && (
                <p className={`text-[11px] mt-1.5 font-medium ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                  Sadece @gtcendustriyel.com uzantılı e-postalar kabul edilir
                </p>
              )}
            </div>

            {/* Şifre */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Şifre
              </label>
              <div className={`flex items-center rounded-xl border-2 px-3 transition-colors ${darkMode
                ? 'bg-slate-900 border-slate-600 focus-within:border-blue-500'
                : 'bg-gray-50 border-gray-300 focus-within:border-blue-500'
              }`}>
                <Lock size={18} className={darkMode ? 'text-slate-500' : 'text-gray-400'} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isRegister ? 'En az 6 karakter' : 'Şifreniz'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isRegister ? 6 : undefined}
                  className={`w-full p-3 bg-transparent outline-none font-medium ${darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-gray-400'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`p-1 ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Hata */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Başarı */}
            {success && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium">
                <CheckCircle size={18} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Gönder */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${loading
                ? 'bg-blue-600/50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'
              } text-white`}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Yükleniyor...</span>
                : isRegister ? 'Kayıt Ol' : 'Giriş Yap'
              }
            </button>
          </form>
        </div>

        {/* Alt bilgi */}
        <p className={`text-center text-xs mt-6 ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>
          © 2024 GTC Endüstriyel — Folyo Stok Takip Sistemi
        </p>
      </div>
    </div>
  )
}
