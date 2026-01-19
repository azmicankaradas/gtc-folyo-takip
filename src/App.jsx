import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Trash2, Plus, Moon, Sun, Box, Search, AlertTriangle, Lock, Unlock, X, Minus, CheckCircle } from 'lucide-react'

// ŞİFRE
const ADMIN_PASSWORD = "1234"; 

const INITIAL_DATA = [{"marka": "ABB", "tip": "Sırt", "adet": 10, "sinir": 5}, {"marka": "Fenermekanik", "tip": "Sırt", "adet": 55, "sinir": 30}];

function App() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true) 
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [loginError, setLoginError] = useState(false)
  const [newItem, setNewItem] = useState({ marka: '', tip: '', adet: 0, sinir: 5 })

  useEffect(() => {
    fetchData()
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') { 
        setDarkMode(false); 
        document.documentElement.classList.remove('dark') 
    } else { 
        setDarkMode(true); 
        document.documentElement.classList.add('dark'); 
        localStorage.setItem('theme', 'dark') 
    }
    const sessionAdmin = localStorage.getItem('isAdmin');
    if (sessionAdmin === 'true') setIsAdmin(true);
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('folyolar').select('*').order('marka', { ascending: true })
    if (error) console.error('Hata:', error); else setInventory(data || [])
    setLoading(false)
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
        setIsAdmin(true); 
        localStorage.setItem('isAdmin', 'true');
        setShowLoginModal(false); 
        setPasswordInput(""); 
        setLoginError(false);
    } else { setLoginError(true); }
  }

  const handleLogout = () => { setIsAdmin(false); localStorage.removeItem('isAdmin'); setShowAddForm(false); }

  const updateStock = async (id, currentQty, amount) => {
    if (!isAdmin) { setShowLoginModal(true); return; }
    const newQty = currentQty + amount
    setInventory(inventory.map(item => item.id === id ? { ...item, adet: newQty } : item))
    await supabase.from('folyolar').update({ adet: newQty }).eq('id', id)
  }

  const addItem = async () => {
    if (!newItem.marka || !newItem.tip) return alert("Marka giriniz.")
    const { data, error } = await supabase.from('folyolar').insert([newItem]).select()
    if (error) alert(error.message); else {
      setInventory([...inventory, data[0]]); setNewItem({ marka: '', tip: '', adet: 0, sinir: 5 }); setShowAddForm(false)
    }
  }

  const deleteItem = async (id) => {
    if (!isAdmin) return;
    if (!confirm("Silinsin mi?")) return
    setInventory(inventory.filter(item => item.id !== id))
    await supabase.from('folyolar').delete().eq('id', id)
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    if (!darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') }
  }

  const filteredInventory = inventory.filter(item => item.marka.toLowerCase().includes(searchTerm.toLowerCase()) || item.tip.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    // Ana arka plan rengi (Koyu modda daha koyu yapıldı)
    <div className={`min-h-screen font-sans pb-32 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      
      {/* --- GİRİŞ MODALI --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            {/* Modalın kendisi de buzlu cam efekti aldı */}
            <div className={`w-full max-w-sm p-8 rounded-2xl shadow-2xl relative border backdrop-blur-xl ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white'}`}>
                <button onClick={() => setShowLoginModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
                <div className="text-center mb-6">
                    <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Yönetici Girişi</h2>
                </div>
                <form onSubmit={handleLogin}>
                    <input type="password" placeholder="Şifre" autoFocus 
                        className={`w-full p-3 text-center text-xl font-bold tracking-widest rounded-xl border-2 mb-4 outline-none transition-all backdrop-blur-md
                        ${darkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white/50 border-gray-200 text-black placeholder:text-gray-400'}
                        ${loginError ? '!border-red-500' : 'focus:border-blue-500'}`} 
                        value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition transform active:scale-95">GİRİŞ YAP</button>
                </form>
            </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* --- HEADER (Buzlu Cam) --- */}
        <div className={`flex justify-between items-center mb-6 p-5 rounded-2xl shadow-sm border transition-colors backdrop-blur-xl ${darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white/70 border-white'}`}>
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/30"><Box size={24} /></div>
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Folyo Stok</h1>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">{isAdmin ? 'YÖNETİCİ' : 'İZLEME'}</span>
                </div>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={isAdmin ? handleLogout : () => setShowLoginModal(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isAdmin ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                {isAdmin ? <><Lock size={16}/> Çıkış</> : <><Unlock size={16}/> Giriş</>}
             </button>
            <button onClick={toggleTheme} className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* --- ARAMA (Buzlu Cam) --- */}
        <div className="flex gap-3 mb-6 sticky top-2 z-10">
          <div className={`flex-1 flex items-center px-4 py-3 rounded-2xl shadow-lg border transition-all backdrop-blur-xl ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white shadow-blue-100'}`}>
            <Search className="text-gray-400 mr-3" size={20} />
            <input type="text" placeholder="Marka ara..." className="bg-transparent outline-none w-full text-lg font-medium placeholder:text-gray-400" onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition">
                <Plus size={24} />
            </button>
          )}
        </div>

        {/* --- EKLEME FORMU (Buzlu Cam) --- */}
        {showAddForm && isAdmin && (
          <div className={`p-6 mb-6 rounded-2xl shadow-xl border-l-4 border-blue-500 animate-fade-in backdrop-blur-xl ${darkMode ? 'bg-slate-800/80' : 'bg-white/80'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input placeholder="Marka" className={`p-3 rounded-xl border font-medium md:col-span-2 outline-none focus:border-blue-500 bg-transparent ${darkMode ? 'border-slate-600 placeholder:text-slate-500' : 'border-gray-300 placeholder:text-gray-400'}`} value={newItem.marka} onChange={e => setNewItem({...newItem, marka: e.target.value})} />
              <input placeholder="Tip" className={`p-3 rounded-xl border font-medium outline-none focus:border-blue-500 bg-transparent ${darkMode ? 'border-slate-600 placeholder:text-slate-500' : 'border-gray-300 placeholder:text-gray-400'}`} value={newItem.tip} onChange={e => setNewItem({...newItem, tip: e.target.value})} />
              <input type="number" placeholder="Adet" className={`p-3 rounded-xl border font-medium outline-none focus:border-blue-500 bg-transparent ${darkMode ? 'border-slate-600 placeholder:text-slate-500' : 'border-gray-300 placeholder:text-gray-400'}`} value={newItem.adet} onChange={e => setNewItem({...newItem, adet: parseInt(e.target.value)})} />
              <button onClick={addItem} className="bg-blue-600 text-white rounded-xl font-bold py-3 md:col-span-4 hover:bg-blue-700 transition">KAYDET</button>
            </div>
          </div>
        )}

        {/* --- MASAÜSTÜ TABLOSU (Buzlu Cam ve Net Okunurluk) --- */}
        <div className={`hidden md:block rounded-2xl overflow-hidden shadow-sm border backdrop-blur-xl ${darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white/70 border-white'}`}>
          <table className="w-full text-left border-collapse">
            <thead className={`text-xs uppercase font-bold tracking-wider ${darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-gray-50/50 text-gray-500'}`}>
              <tr>
                <th className="p-5">Ürün Bilgisi</th>
                <th className="p-5 text-center">Stok</th>
                <th className="p-5 text-center">Hızlı İşlem</th>
                <th className="p-5 text-right">#</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-gray-100/50'}`}>
              {filteredInventory.map((item) => (
                <tr key={item.id} className={`${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-blue-50/50'} transition-colors duration-150`}>
                  <td className="p-5 align-middle">
                    <div className={`text-lg font-bold mb-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.marka}</div>
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${darkMode ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-gray-100/50 border-gray-200 text-gray-600'}`}>{item.tip}</span>
                  </td>
                  <td className="p-5 text-center align-middle">
                    <span className={`text-2xl font-black ${item.adet < item.sinir ? 'text-red-500' : (darkMode ? 'text-white' : 'text-slate-900')}`}>{item.adet}</span>
                    {item.adet < item.sinir && <div className="text-[10px] font-bold text-red-500 mt-1 animate-pulse">KRİTİK</div>}
                  </td>
                  <td className="p-5 text-center align-middle">
                    {isAdmin ? (
                        <div className="flex justify-center items-center gap-2">
                            <button onClick={() => updateStock(item.id, item.adet, -1)} className={`w-9 h-9 flex items-center justify-center rounded-lg border font-bold transition ${darkMode ? 'bg-slate-800 border-slate-600 hover:bg-red-900/30 hover:border-red-500 hover:text-red-500' : 'bg-white border-gray-200 hover:border-red-500 hover:text-red-600'}`}>-</button>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => updateStock(item.id, item.adet, 10)} className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>+10</button>
                                <button onClick={() => updateStock(item.id, item.adet, -10)} className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>-10</button>
                            </div>
                            <button onClick={() => updateStock(item.id, item.adet, 1)} className={`w-9 h-9 flex items-center justify-center rounded-lg border font-bold transition ${darkMode ? 'bg-slate-800 border-slate-600 hover:bg-blue-900/30 hover:border-blue-500 hover:text-blue-500' : 'bg-white border-gray-200 hover:border-blue-500 hover:text-blue-600'}`}>+</button>
                        </div>
                    ) : <Lock size={16} className={`mx-auto ${darkMode ? 'text-slate-600' : 'text-gray-300'}`}/>}
                  </td>
                  <td className="p-5 text-right align-middle">
                    {isAdmin && <button onClick={() => deleteItem(item.id)} className={`transition ${darkMode ? 'text-slate-500 hover:text-red-500' : 'text-gray-400 hover:text-red-500'}`}><Trash2 size={18}/></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MOBİL KARTLAR (Buzlu Cam Efektli - Beyaz Değil!) --- */}
        <div className="grid grid-cols-1 md:hidden gap-3">
          {filteredInventory.map((item) => (
            <div key={item.id} className={`p-4 rounded-2xl shadow-sm border relative overflow-hidden backdrop-blur-xl ${darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white/70 border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-[65%]"> 
                  <h3 className={`font-bold text-xl leading-tight mb-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.marka}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold border ${darkMode ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-gray-100/50 border-gray-200 text-gray-500'}`}>{item.tip}</span>
                    {item.adet < item.sinir && (<span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1 animate-pulse"><AlertTriangle size={10}/> AZALDI</span>)}
                  </div>
                </div>
                <div className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl border ${item.adet < item.sinir ? 'bg-red-500/10 border-red-500/30 text-red-500' : (darkMode ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-gray-50/50 border-gray-200 text-slate-700')}`}>
                   <span className="text-2xl font-black tracking-tighter">{item.adet}</span>
                </div>
              </div>
              {isAdmin && (
                <div className={`grid grid-cols-4 gap-2 pt-3 border-t ${darkMode ? 'border-slate-700/50' : 'border-gray-100'}`}>
                    <button onClick={() => updateStock(item.id, item.adet, -1)} className={`col-span-1 rounded-lg font-bold py-2 active:scale-95 transition ${darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'}`}>-1</button>
                    <button onClick={() => updateStock(item.id, item.adet, 1)} className={`col-span-1 rounded-lg font-bold py-2 active:scale-95 transition ${darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'}`}>+1</button>
                    <button onClick={() => updateStock(item.id, item.adet, 10)} className={`col-span-1 rounded-lg font-bold py-2 text-xs active:scale-95 transition ${darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'}`}>+10</button>
                    <button onClick={() => deleteItem(item.id)} className={`col-span-1 rounded-lg flex items-center justify-center active:scale-95 transition ${darkMode ? 'bg-red-900/20 text-red-500 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}><Trash2 size={18}/></button>
                </div>
              )}
            </div>
          ))}
        </div>
        {!loading && filteredInventory.length === 0 && (<div className={`p-12 text-center opacity-50 ${darkMode ? 'text-white' : 'text-black'}`}>Kayıt bulunamadı.</div>)}
      </div>
    </div>
  )
}

export default App