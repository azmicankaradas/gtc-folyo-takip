import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Trash2, Plus, Moon, Sun, Box, Search, AlertTriangle, Lock, Unlock, X, Check } from 'lucide-react'

// --- AYARLAR ---
// Şifreni buradan değiştirebilirsin
const ADMIN_PASSWORD = "1234"; 

const INITIAL_DATA = [{"marka": "ABB", "tip": "Sırt", "adet": 10, "sinir": 5}, {"marka": "Fenermekanik", "tip": "Sırt", "adet": 55, "sinir": 30}, {"marka": "ENKA", "tip": "Sırt", "adet": 33, "sinir": 30}];

function App() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modallar ve Admin Durumu
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false) // Şifre ekranı için
  const [showAddForm, setShowAddForm] = useState(false)
  const [passwordInput, setPasswordInput] = useState("") // Girilen şifre
  const [loginError, setLoginError] = useState(false)

  const [newItem, setNewItem] = useState({ marka: '', tip: '', adet: 0, sinir: 5 })

  useEffect(() => {
    fetchData()
    // Tema Ayarı
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
      setDarkMode(false); document.documentElement.classList.remove('dark')
    } else {
      setDarkMode(true); document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
    // Admin Hatırlama
    const sessionAdmin = localStorage.getItem('isAdmin');
    if (sessionAdmin === 'true') setIsAdmin(true);
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('folyolar').select('*').order('marka', { ascending: true })
    if (error) console.error('Hata:', error)
    else setInventory(data || [])
    setLoading(false)
  }

  // --- İŞLEMLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        setShowLoginModal(false);
        setPasswordInput("");
        setLoginError(false);
    } else {
        setLoginError(true);
    }
  }

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    setShowAddForm(false);
  }

  const updateStock = async (id, currentQty, amount) => {
    if (!isAdmin) { setShowLoginModal(true); return; }
    const newQty = currentQty + amount
    setInventory(inventory.map(item => item.id === id ? { ...item, adet: newQty } : item))
    await supabase.from('folyolar').update({ adet: newQty }).eq('id', id)
  }

  const addItem = async () => {
    if (!newItem.marka || !newItem.tip) return alert("Marka ve tip girin.")
    const { data, error } = await supabase.from('folyolar').insert([newItem]).select()
    if (error) alert("Hata: " + error.message)
    else {
      setInventory([...inventory, data[0]])
      setNewItem({ marka: '', tip: '', adet: 0, sinir: 5 })
      setShowAddForm(false)
    }
  }

  const deleteItem = async (id) => {
    if (!isAdmin) return;
    if (!confirm("Silmek istediğine emin misin?")) return
    setInventory(inventory.filter(item => item.id !== id))
    await supabase.from('folyolar').delete().eq('id', id)
  }

  const seedDatabase = async () => {
    if(!confirm("Veriler yüklensin mi?")) return;
    setLoading(true);
    await supabase.from('folyolar').insert(INITIAL_DATA);
    fetchData();
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const filteredInventory = inventory.filter(item => 
    item.marka.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.tip.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans pb-32 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* --- GİRİŞ MODALI (Modern Popup) --- */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl relative ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                <button onClick={() => setShowLoginModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
                <div className="text-center mb-6">
                    <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Yönetici Girişi</h2>
                    <p className="text-sm opacity-60">Düzenleme yapmak için şifre girin.</p>
                </div>
                <form onSubmit={handleLogin}>
                    <input 
                        type="password" 
                        placeholder="Şifre (1234)" 
                        autoFocus
                        className={`w-full p-4 text-center text-2xl font-bold tracking-widest rounded-xl border-2 mb-4 outline-none transition-colors ${loginError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-slate-700 bg-transparent focus:border-blue-500'}`}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition transform active:scale-95">GİRİŞ YAP</button>
                </form>
            </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* --- HEADER --- */}
        <div className={`flex justify-between items-center mb-6 p-5 rounded-2xl shadow-sm border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Box size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Folyo Stok</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                <span className="text-xs font-bold uppercase opacity-60 tracking-wider">
                    {isAdmin ? 'Yönetici Modu Açık' : 'Sadece İzleme'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
             <button 
                onClick={isAdmin ? handleLogout : () => setShowLoginModal(true)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isAdmin ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                {isAdmin ? <><Lock size={18}/> Çıkış</> : <><Unlock size={18}/> Giriş</>}
             </button>
            <button onClick={toggleTheme} className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* --- ARAMA & EKLEME --- */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 sticky top-2 z-10">
          <div className={`flex-1 flex items-center px-5 py-4 rounded-xl shadow-lg border transition-colors ${darkMode ? 'bg-slate-900 border-slate-700 shadow-black/50' : 'bg-white border-white shadow-blue-100'}`}>
            <Search className="text-gray-400 mr-3" size={22} />
            <input 
              type="text" 
              placeholder="Marka veya tip ara..." 
              className="bg-transparent outline-none w-full text-lg font-medium placeholder:text-gray-400"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition">
                <Plus size={24} /> <span className="hidden md:inline">Yeni Ekle</span>
            </button>
          )}
        </div>

        {/* --- YENİ EKLEME FORMU --- */}
        {showAddForm && isAdmin && (
          <div className={`p-6 mb-6 rounded-2xl shadow-xl animate-fade-in border-l-4 border-blue-500 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <h3 className="font-bold mb-4 text-lg">Yeni Stok Kartı Oluştur</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input placeholder="Marka Adı" className={`p-4 rounded-xl border md:col-span-2 outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`} value={newItem.marka} onChange={e => setNewItem({...newItem, marka: e.target.value})} />
              <input placeholder="Tip (Sırt/Cep)" className={`p-4 rounded-xl border outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`} value={newItem.tip} onChange={e => setNewItem({...newItem, tip: e.target.value})} />
              <input type="number" placeholder="Adet" className={`p-4 rounded-xl border outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`} value={newItem.adet} onChange={e => setNewItem({...newItem, adet: parseInt(e.target.value)})} />
              <button onClick={addItem} className="bg-blue-600 text-white rounded-xl font-bold py-4 md:col-span-4 hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">KAYDET</button>
            </div>
          </div>
        )}

        {/* --- MASAÜSTÜ TABLOSU (OKUNABİLİRLİK İÇİN YENİLENDİ) --- */}
        <div className="hidden md:block rounded-2xl shadow-sm border overflow-hidden bg-white dark:bg-slate-900 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead className={`${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-gray-50 text-gray-500'} text-sm uppercase font-bold tracking-wider`}>
              <tr>
                <th className="p-6">Marka & Ürün Tipi</th>
                <th className="p-6 text-center">Mevcut Stok</th>
                <th className="p-6 text-center">Hızlı İşlemler</th>
                <th className="p-6 text-right">Ayarlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="group hover:bg-blue-50 dark:hover:bg-slate-800/50 transition duration-150">
                  <td className="p-6">
                    <div className={`font-extrabold text-xl mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.marka}</div>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-600'}`}>
                        {item.tip}
                    </span>
                  </td>
                  
                  <td className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center min-w-[80px] px-4 py-2 rounded-xl text-2xl font-black tracking-tight border-2 
                        ${item.adet < item.sinir 
                            ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/50' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30'}`}>
                      {item.adet}
                    </div>
                    {item.adet < item.sinir && <div className="text-xs font-bold text-red-500 mt-1 animate-pulse">KRİTİK SEVİYE</div>}
                  </td>

                  <td className="p-6 text-center">
                    {isAdmin ? (
                        <div className="flex justify-center items-center gap-2 opacity-100 transition-opacity">
                            <button onClick={() => updateStock(item.id, item.adet, -1)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:bg-slate-800 dark:border-slate-700 transition font-bold active:scale-95"><Minus size={20}/></button>
                            
                            <div className="flex flex-col gap-2">
                                <button onClick={() => updateStock(item.id, item.adet, 10)} className="px-3 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 rounded text-xs font-bold text-gray-500">+10</button>
                                <button onClick={() => updateStock(item.id, item.adet, -10)} className="px-3 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 rounded text-xs font-bold text-gray-500">-10</button>
                            </div>

                            <button onClick={() => updateStock(item.id, item.adet, 1)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 dark:bg-slate-800 dark:border-slate-700 transition font-bold active:scale-95"><Plus size={20}/></button>
                        </div>
                    ) : (
                        <span className="text-sm font-medium text-gray-400 italic">Değişiklik için giriş yapın</span>
                    )}
                  </td>

                  <td className="p-6 text-right">
                    {isAdmin && (
                        <button onClick={() => deleteItem(item.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                            <Trash2 size={20}/>
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MOBİL LİSTE (KART GÖRÜNÜMÜ) --- */}
        <div className="grid grid-cols-1 md:hidden gap-3">
          {filteredInventory.map((item) => (
            <div key={item.id} className={`p-5 rounded-2xl shadow-sm border relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-[65%]"> 
                  <h3 className={`font-bold text-xl leading-tight break-words mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.marka}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                      {item.tip}
                    </span>
                    {item.adet < item.sinir && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                         <AlertTriangle size={10}/> AZALDI
                      </span>
                    )}
                  </div>
                </div>

                <div className={`flex flex-col items-end justify-center px-4 py-2 rounded-xl border-2 ${item.adet < item.sinir ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700'}`}>
                   <span className={`text-3xl font-black tracking-tighter leading-none ${item.adet < item.sinir ? 'text-red-600' : 'text-slate-700 dark:text-white'}`}>
                      {item.adet}
                   </span>
                   <span className="text-[10px] font-bold opacity-50 uppercase mt-1">Stok</span>
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => updateStock(item.id, item.adet, -1)} className="h-12 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 text-red-500 rounded-xl font-bold text-xl active:scale-95 transition hover:border-red-500 flex items-center justify-center gap-2">
                        <Minus size={18}/> 1
                    </button>
                    <button onClick={() => updateStock(item.id, item.adet, 1)} className="h-12 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 text-emerald-500 rounded-xl font-bold text-xl active:scale-95 transition hover:border-emerald-500 flex items-center justify-center gap-2">
                        <Plus size={18}/> 1
                    </button>
                  </div>

                  <div className="flex gap-3">
                     <button onClick={() => updateStock(item.id, item.adet, -10)} className="flex-1 py-3 bg-gray-50 dark:bg-slate-800 text-gray-500 rounded-xl text-xs font-bold active:scale-95">-10</button>
                     <button onClick={() => updateStock(item.id, item.adet, 10)} className="flex-1 py-3 bg-gray-50 dark:bg-slate-800 text-gray-500 rounded-xl text-xs font-bold active:scale-95">+10</button>
                     <button onClick={() => deleteItem(item.id)} className="px-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 size={18}/></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!loading && filteredInventory.length === 0 && (
            <div className="p-16 text-center">
                <div className="bg-gray-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-400" size={32}/>
                </div>
                <h3 className="text-xl font-bold text-gray-500">Kayıt Bulunamadı</h3>
                <p className="text-gray-400 mt-2">Arama kriterini değiştirin veya yeni ürün ekleyin.</p>
                {inventory.length === 0 && isAdmin && (
                    <button onClick={seedDatabase} className="mt-6 text-blue-600 font-bold underline">Varsayılan verileri yükle</button>
                )}
            </div>
        )}

      </div>
    </div>
  )
}

export default App