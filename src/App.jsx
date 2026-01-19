import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Trash2, Plus, Moon, Sun, Box, Search, AlertTriangle, Lock, Unlock, X, Minus } from 'lucide-react'

const ADMIN_PASSWORD = "1234"; 

function App() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Admin ve Modal Durumları
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [loginError, setLoginError] = useState(false)

  const [newItem, setNewItem] = useState({ marka: '', tip: '', adet: 0, sinir: 5 })

  useEffect(() => {
    fetchData()
    // Varsayılan olarak KOYU mod başlat
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') { 
        setDarkMode(false); 
        document.documentElement.classList.remove('dark') 
    } else { 
        setDarkMode(true); 
        document.documentElement.classList.add('dark'); 
        localStorage.setItem('theme', 'dark') 
    }
    
    // Admin girişini hatırla
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
    if (error) alert("Hata: " + error.message); else {
      setInventory([...inventory, data[0]]); 
      setNewItem({ marka: '', tip: '', adet: 0, sinir: 5 }); 
      setShowAddForm(false)
    }
  }

  const deleteItem = async (id) => {
    if (!isAdmin) return;
    if (!confirm("Silmek istediğine emin misin?")) return
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
    <div className={`min-h-screen font-sans pb-32 transition-colors duration-200 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* --- GİRİŞ MODALI (IPHONE İÇİN GÜVENLİ MOD) --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
            {/* autoFocus kaldırıldı, blur kaldırıldı */}
            <div className={`w-full max-w-sm p-6 rounded-2xl shadow-none border relative ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'}`}>
                
                <button onClick={() => setShowLoginModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-red-500 p-2">
                    <X size={28}/>
                </button>

                <div className="text-center mb-6 mt-2">
                    <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Yönetici Girişi</h2>
                    <p className="text-sm opacity-60 mt-1">Lütfen şifreyi girin</p>
                </div>

                <form onSubmit={handleLogin}>
                    {/* iPhone'da klavye patlamasın diye autoFocus YOK */}
                    <input 
                        type="password" // iPhone'un şifre yöneticisi tetiklenmesin diye düz input gibi davranabilir ama güvenlik için password kalsın
                        placeholder="Şifre" 
                        className={`w-full p-4 text-center text-xl font-bold tracking-widest rounded-xl border-2 mb-4 outline-none appearance-none
                        ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-300 text-black'} 
                        ${loginError ? 'border-red-500' : 'focus:border-blue-500'}`} 
                        value={passwordInput} 
                        onChange={(e) => setPasswordInput(e.target.value)}
                    />
                    
                    {loginError && <p className="text-red-500 text-center font-bold mb-4">HATALI ŞİFRE!</p>}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-lg active:scale-95 transition">
                        GİRİŞ YAP
                    </button>
                </form>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* --- HEADER --- */}
        <div className={`flex justify-between items-center mb-6 p-4 rounded-2xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Box size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">Folyo Stok</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">
                        {isAdmin ? 'YÖNETİCİ' : 'İZLEME'}
                    </span>
                </div>
            </div>
          </div>
          
          <div className="flex gap-2">
             <button 
                onClick={isAdmin ? handleLogout : () => setShowLoginModal(true)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors
                ${isAdmin ? 'bg-red-100 text-red-600' : 'bg-blue-600 text-white'}`}>
                {isAdmin ? <><Lock size={18}/> <span className="hidden md:inline">Çıkış</span></> : <><Unlock size={18}/> <span className="hidden md:inline">Giriş</span></>}
             </button>

            <button onClick={toggleTheme} className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-gray-100 border-gray-300 text-gray-600'}`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* --- ARAMA KUTUSU --- */}
        <div className="flex gap-3 mb-6 sticky top-2 z-10">
          <div className={`flex-1 flex items-center px-4 py-3 rounded-xl shadow-md border-2 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-100'}`}>
            <Search className="text-gray-400 mr-3" size={24} />
            <input 
              type="text" 
              placeholder="Marka ara..." 
              className="bg-transparent outline-none w-full text-lg font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-4 rounded-xl font-bold shadow-md flex items-center justify-center active:scale-95 transition">
                <Plus size={24} />
            </button>
          )}
        </div>

        {/* --- EKLEME FORMU --- */}
        {showAddForm && isAdmin && (
          <div className={`p-5 mb-6 rounded-2xl shadow-xl border-l-4 border-blue-600 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="font-bold mb-3 text-lg">Yeni Stok Ekle</h3>
            <div className="grid grid-cols-1 gap-3">
              <input placeholder="Marka Adı" className={`p-3 rounded-lg border-2 font-bold ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-gray-300'}`} value={newItem.marka} onChange={e => setNewItem({...newItem, marka: e.target.value})} />
              <div className="flex gap-3">
                <input placeholder="Tip" className={`flex-1 p-3 rounded-lg border-2 font-bold ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-gray-300'}`} value={newItem.tip} onChange={e => setNewItem({...newItem, tip: e.target.value})} />
                <input type="number" placeholder="Adet" className={`flex-1 p-3 rounded-lg border-2 font-bold ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-gray-300'}`} value={newItem.adet} onChange={e => setNewItem({...newItem, adet: parseInt(e.target.value)})} />
              </div>
              <button onClick={addItem} className="bg-blue-600 text-white rounded-lg font-bold py-3 hover:bg-blue-700">KAYDET</button>
            </div>
          </div>
        )}

        {/* --- MASAÜSTÜ TABLOSU --- */}
        <div className={`hidden md:block rounded-2xl overflow-hidden shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <table className="w-full text-left border-collapse">
            <thead className={`text-sm uppercase font-bold tracking-wider ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
              <tr>
                <th className="p-5 border-b dark:border-slate-700">Marka & Tip</th>
                <th className="p-5 text-center border-b dark:border-slate-700">Stok</th>
                <th className="p-5 text-center border-b dark:border-slate-700">İşlemler</th>
                <th className="p-5 text-right border-b dark:border-slate-700">#</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
              {filteredInventory.map((item) => (
                <tr key={item.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}`}>
                  <td className="p-5 align-middle">
                    <div className={`text-xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.marka}</div>
                    <span className={`text-xs font-bold px-2 py-1 rounded border uppercase ${darkMode ? 'bg-slate-900 border-slate-600 text-slate-300' : 'bg-white border-gray-300 text-slate-600'}`}>{item.tip}</span>
                  </td>
                  <td className="p-5 text-center align-middle">
                    <span className={`text-3xl font-black ${item.adet < item.sinir ? 'text-red-500' : (darkMode ? 'text-white' : 'text-slate-900')}`}>{item.adet}</span>
                    {item.adet < item.sinir && <div className="text-[10px] font-bold text-red-500 mt-1 animate-pulse">KRİTİK</div>}
                  </td>
                  <td className="p-5 text-center align-middle">
                    {isAdmin ? (
                        <div className="flex justify-center items-center gap-2">
                            <button onClick={() => updateStock(item.id, item.adet, -1)} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 font-bold ${darkMode ? 'bg-slate-900 border-slate-600 text-red-400 hover:border-red-500' : 'bg-white border-gray-300 text-red-600 hover:border-red-500'}`}>-</button>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => updateStock(item.id, item.adet, 10)} className={`px-2 py-0.5 rounded text-[10px] font-bold ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-200 text-black'}`}>+10</button>
                                <button onClick={() => updateStock(item.id, item.adet, -10)} className={`px-2 py-0.5 rounded text-[10px] font-bold ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-200 text-black'}`}>-10</button>
                            </div>
                            <button onClick={() => updateStock(item.id, item.adet, 1)} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 font-bold ${darkMode ? 'bg-slate-900 border-slate-600 text-green-400 hover:border-green-500' : 'bg-white border-gray-300 text-green-600 hover:border-green-500'}`}>+</button>
                        </div>
                    ) : <Lock size={20} className="mx-auto opacity-30"/>}
                  </td>
                  <td className="p-5 text-right align-middle">
                    {isAdmin && <button onClick={() => deleteItem(item.id)} className="p-3 text-gray-400 hover:text-red-500 transition"><Trash2 size={20}/></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MOBİL LİSTE (KARTLAR) --- */}
        <div className="grid grid-cols-1 md:hidden gap-3">
          {filteredInventory.map((item) => (
            <div key={item.id} className={`p-4 rounded-xl border-2 shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-[65%]"> 
                  <h3 className={`font-black text-xl leading-tight mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.marka}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold border ${darkMode ? 'bg-slate-900 border-slate-600 text-slate-300' : 'bg-gray-50 border-gray-200 text-slate-500'}`}>{item.tip}</span>
                    {item.adet < item.sinir && (<span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1 animate-pulse"><AlertTriangle size={10}/> AZALDI</span>)}
                  </div>
                </div>
                <div className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg border-2 ${item.adet < item.sinir ? 'bg-red-500/10 border-red-500/30 text-red-500' : (darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-slate-800')}`}>
                   <span className="text-2xl font-black tracking-tighter">{item.adet}</span>
                </div>
              </div>
              {isAdmin && (
                <div className={`grid grid-cols-4 gap-2 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                    <button onClick={() => updateStock(item.id, item.adet, -1)} className={`col-span-1 rounded-lg font-bold py-2 active:scale-95 transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}>-1</button>
                    <button onClick={() => updateStock(item.id, item.adet, 1)} className={`col-span-1 rounded-lg font-bold py-2 active:scale-95 transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}>+1</button>
                    <button onClick={() => updateStock(item.id, item.adet, 10)} className={`col-span-1 rounded-lg font-bold py-2 text-xs active:scale-95 transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}>+10</button>
                    <button onClick={() => deleteItem(item.id)} className={`col-span-1 rounded-lg flex items-center justify-center active:scale-95 transition ${darkMode ? 'bg-red-900/20 text-red-500' : 'bg-red-50 text-red-500'}`}><Trash2 size={18}/></button>
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