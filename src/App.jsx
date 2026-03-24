import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import { Trash2, Plus, Moon, Sun, Search, AlertTriangle, LogOut, Eye, Edit3, Package, RefreshCw, X, Flame } from 'lucide-react'

// Çok giden markalar listesi
const COK_GIDEN_MARKALAR = [
  'fenermekanik', 'enka', 'üstay', 'amina', 'efex',
  'kocaman denizcilik', 'kocaman lojistik', 'sam apsis'
]

function App() {
  const { user, profile, loading: authLoading, isEditor, signOut } = useAuth()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [editMode, setEditMode] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ marka: '', tip: '', adet: 0, sinir: 5 })
  const [selectedBrand, setSelectedBrand] = useState(null)

  // İstatistikler
  const totalItems = inventory.length
  const criticalItems = inventory.filter(i => i.adet < i.sinir).length
  const totalStock = inventory.reduce((sum, i) => sum + (i.adet || 0), 0)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') { 
      setDarkMode(false); 
      document.documentElement.classList.remove('dark') 
    } else { 
      setDarkMode(true); 
      document.documentElement.classList.add('dark'); 
      localStorage.setItem('theme', 'dark') 
    }
  }, [])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('folyolar').select('*').order('marka', { ascending: true })
    if (error) console.error('Hata:', error); else setInventory(data || [])
    setLoading(false)
  }

  const updateStock = async (id, currentQty, amount) => {
    if (!editMode || !isEditor) return
    const newQty = Math.max(0, currentQty + amount)
    setInventory(inventory.map(item => item.id === id ? { ...item, adet: newQty } : item))
    await supabase.from('folyolar').update({ adet: newQty }).eq('id', id)
  }

  const addItem = async () => {
    if (!newItem.marka || !newItem.tip) return alert("Marka ve tip girin.")
    const { data, error } = await supabase.from('folyolar').insert([newItem]).select()
    if (error) alert("Hata: " + error.message); else {
      const updated = [...inventory, data[0]].sort((a, b) => a.marka.localeCompare(b.marka, 'tr'))
      setInventory(updated); 
      setNewItem({ marka: '', tip: '', adet: 0, sinir: 5 }); 
      setShowAddForm(false)
    }
  }

  const deleteItem = async (id) => {
    if (!editMode || !isEditor) return;
    if (!confirm("Bu kaydı silmek istediğine emin misin?")) return
    setInventory(inventory.filter(item => item.id !== id))
    await supabase.from('folyolar').delete().eq('id', id)
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    if (!darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') }
  }

  const toggleEditMode = () => {
    if (!isEditor) return
    setEditMode(!editMode)
    if (editMode) setShowAddForm(false)
  }

  const handleSignOut = async () => {
    setEditMode(false)
    setShowAddForm(false)
    await signOut()
  }

  const filteredInventory = inventory.filter(item => {
    // Marka filtresi
    if (selectedBrand) {
      if (!item.marka.toLowerCase().includes(selectedBrand.toLowerCase())) return false
    }
    // Arama filtresi
    const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean)
    const searchText = `${item.marka} ${item.tip}`.toLowerCase()
    return words.every(word => searchText.includes(word))
  })

  // Çok giden markaları grupla (aynı marka tek kart)
  const cokGidenGrouped = (() => {
    const grouped = {}
    inventory.forEach(item => {
      const matchedBrand = COK_GIDEN_MARKALAR.find(m => item.marka.toLowerCase().includes(m))
      if (!matchedBrand) return
      const key = item.marka // Gerçek marka adını key olarak kullan
      if (!grouped[key]) {
        grouped[key] = { marka: item.marka, items: [], totalStock: 0, hasCritical: false }
      }
      grouped[key].items.push(item)
      grouped[key].totalStock += (item.adet || 0)
      if (item.adet < item.sinir) grouped[key].hasCritical = true
    })
    return Object.values(grouped).sort((a, b) => a.marka.localeCompare(b.marka, 'tr'))
  })()

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/pwa-192x192.png" alt="GTC" className="w-20 h-20 rounded-2xl animate-pulse" />
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage darkMode={darkMode} />

  // Glassmorphism card base classes
  const card = darkMode 
    ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700/50' 
    : 'bg-white/80 backdrop-blur-xl border-gray-200/50'
  const cardSolid = darkMode 
    ? 'bg-slate-800 border-slate-700' 
    : 'bg-white border-gray-200'
  const inputClass = darkMode 
    ? 'bg-slate-900/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500' 
    : 'bg-gray-50 border-gray-300 text-slate-900 placeholder:text-gray-400 focus:border-blue-500'

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 text-slate-900'}`}>
      
      <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-6 pb-32">
        
        {/* ═══ HEADER ═══ */}
        <header className={`flex justify-between items-center mb-5 p-3.5 sm:p-4 rounded-2xl shadow-lg border ${card}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/pwa-192x192.png" alt="GTC" className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-md" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${darkMode ? 'border-slate-800' : 'border-white'} ${editMode ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">Folyo Stok</h1>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${editMode ? 'text-orange-400' : 'text-emerald-400'}`}>
                {editMode ? '● DEĞİŞTİRME' : '● İZLEME'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {isEditor && (
              <button onClick={toggleEditMode}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl font-bold text-xs transition-all active:scale-95
                ${editMode 
                  ? 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25' 
                  : 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'}`}>
                {editMode ? <><Eye size={15}/> <span className="hidden sm:inline">İzleme</span></> : <><Edit3 size={15}/> <span className="hidden sm:inline">Değiştir</span></>}
              </button>
            )}
            <button onClick={toggleTheme} className={`p-2 rounded-xl transition-all active:scale-95 ${darkMode ? 'text-amber-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-gray-200'}`}>
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={handleSignOut} className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all active:scale-95" title="Çıkış">
              <LogOut size={17}/>
            </button>
          </div>
        </header>

        {/* ═══ İSTATİSTİK KARTLARI ═══ */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className={`p-3 sm:p-4 rounded-xl border ${card} text-center`}>
            <p className={`text-2xl sm:text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{totalItems}</p>
            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Ürün</p>
          </div>
          <div className={`p-3 sm:p-4 rounded-xl border ${card} text-center`}>
            <p className={`text-2xl sm:text-3xl font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{totalStock}</p>
            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Toplam Stok</p>
          </div>
          <div className={`p-3 sm:p-4 rounded-xl border ${card} text-center`}>
            <p className={`text-2xl sm:text-3xl font-black ${criticalItems > 0 ? 'text-red-500' : (darkMode ? 'text-white' : 'text-slate-900')}`}>{criticalItems}</p>
            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Kritik</p>
          </div>
        </div>

        {/* ═══ ARAMA + EKLE ═══ */}
        <div className="flex gap-2.5 mb-5 sticky top-2 z-10">
          <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${card}`}>
            <Search className={darkMode ? 'text-slate-500' : 'text-gray-400'} size={20} />
            <input 
              type="text" placeholder="Marka veya tip ara..." 
              className="bg-transparent outline-none w-full text-sm sm:text-base font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-200">
                <X size={16}/>
              </button>
            )}
          </div>
          <button onClick={fetchData} className={`p-3 rounded-xl border shadow-lg transition-all active:scale-95 ${card} ${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`} title="Yenile">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {editMode && isEditor && (
            <button onClick={() => setShowAddForm(!showAddForm)}
              className={`px-4 rounded-xl font-bold shadow-lg flex items-center justify-center active:scale-95 transition-all ${showAddForm ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
              {showAddForm ? <X size={20} /> : <Plus size={20} />}
            </button>
          )}
        </div>

        {/* ═══ EKLEME FORMU (YENİ MODERN) ═══ */}
        {showAddForm && editMode && isEditor && (
          <div className={`mb-5 rounded-2xl shadow-xl border overflow-hidden ${cardSolid}`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Package size={18}/> Yeni Stok Ekle
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Marka</label>
                  <input 
                    placeholder="örn: 3M, Avery, Fenermekanik" 
                    className={`w-full p-3 rounded-xl border-2 font-semibold text-sm outline-none transition-colors ${inputClass}`} 
                    value={newItem.marka} 
                    onChange={e => setNewItem({...newItem, marka: e.target.value})} 
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Tip</label>
                  <input 
                    placeholder="örn: Sırt, Cep, İZZ" 
                    className={`w-full p-3 rounded-xl border-2 font-semibold text-sm outline-none transition-colors ${inputClass}`} 
                    value={newItem.tip} 
                    onChange={e => setNewItem({...newItem, tip: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Başlangıç Adedi</label>
                  <input 
                    type="number" min="0"
                    className={`w-full p-3 rounded-xl border-2 font-semibold text-sm outline-none transition-colors ${inputClass}`} 
                    value={newItem.adet} 
                    onChange={e => setNewItem({...newItem, adet: parseInt(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Kritik Sınır</label>
                  <input 
                    type="number" min="0"
                    className={`w-full p-3 rounded-xl border-2 font-semibold text-sm outline-none transition-colors ${inputClass}`} 
                    value={newItem.sinir} 
                    onChange={e => setNewItem({...newItem, sinir: parseInt(e.target.value) || 5})} 
                  />
                </div>
              </div>
              <button onClick={addItem} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold py-3 text-sm active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20">
                KAYDET
              </button>
            </div>
          </div>
        )}

        {/* ═══ ÇOK GİDEN ÜRÜNLER ═══ */}
        {!searchTerm && !selectedBrand && cokGidenGrouped.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Flame size={16} className="text-orange-400" />
              <h2 className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Çok Giden Ürünler</h2>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>{cokGidenGrouped.length} firma</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {cokGidenGrouped.map(group => (
                <div key={`cg-${group.marka}`} className={`shrink-0 w-48 sm:w-52 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  darkMode 
                    ? `bg-slate-800/90 border-slate-700 hover:border-slate-500 ${group.hasCritical ? 'border-l-[3px] border-l-red-500' : ''}` 
                    : `bg-white border-gray-200 hover:border-gray-300 ${group.hasCritical ? 'border-l-[3px] border-l-red-500' : ''}`
                }`} onClick={() => { setSelectedBrand(group.marka); setSearchTerm('') }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black ${
                      group.hasCritical 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : (darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                    }`}>{group.marka.charAt(0)}</div>
                    <div className="text-right">
                      <span className={`text-2xl font-black tabular-nums ${group.hasCritical ? 'text-red-500' : (darkMode ? 'text-white' : 'text-slate-900')}`}>{group.totalStock}</span>
                      <p className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>toplam</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold truncate mb-2.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{group.marka}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map(item => (
                      <span key={item.id} className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                        item.adet < item.sinir
                          ? 'bg-red-500/15 text-red-400'
                          : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600')
                      }`}>
                        {item.tip} <span className="opacity-60">({item.adet})</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ AKTİF FİLTRE ═══ */}
        {selectedBrand && (
          <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-xl ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
            <span className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Filtre: {selectedBrand}</span>
            <button onClick={() => setSelectedBrand(null)} className={`ml-auto p-1 rounded-lg transition-all hover:bg-red-500/10 ${darkMode ? 'text-slate-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
              <X size={14}/>
            </button>
          </div>
        )}

        {/* ═══ MASAÜSTÜ TABLOSU ═══ */}
        <div className={`hidden md:block rounded-2xl overflow-hidden shadow-lg border ${cardSolid}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[11px] uppercase font-bold tracking-wider ${darkMode ? 'bg-slate-900/80 text-slate-500' : 'bg-gray-50 text-gray-400'}`}>
                <th className={`px-5 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>Marka & Tip</th>
                <th className={`px-5 py-4 text-center border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>Stok Adedi</th>
                <th className={`px-5 py-4 text-center border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>{editMode ? 'İşlemler' : 'Durum'}</th>
                {editMode && <th className={`px-5 py-4 text-center border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'} w-16`}></th>}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
              {filteredInventory.map((item) => {
                const isCritical = item.adet < item.sinir
                return (
                  <tr key={item.id} className={`group transition-colors ${darkMode ? 'hover:bg-slate-700/40' : 'hover:bg-blue-50/50'}`}>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                          isCritical 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : (darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                        }`}>
                          {item.marka.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-bold text-[15px] ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.marka}</div>
                          <span className={`text-[11px] font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.tip}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center align-middle">
                      <span className={`text-2xl font-black tabular-nums ${isCritical ? 'text-red-500' : (darkMode ? 'text-white' : 'text-slate-900')}`}>{item.adet}</span>
                      {isCritical && <div className="text-[10px] font-bold text-red-500 mt-0.5 animate-pulse flex items-center justify-center gap-1"><AlertTriangle size={10}/> KRİTİK</div>}
                    </td>
                    <td className="px-5 py-4 text-center align-middle">
                      {editMode && isEditor ? (
                        <div className="flex justify-center items-center gap-1.5">
                          <button onClick={() => updateStock(item.id, item.adet, -10)} className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>-10</button>
                          <button onClick={() => updateStock(item.id, item.adet, -1)} className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-lg transition-all active:scale-90 ${darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>−</button>
                          <span className={`w-14 text-center text-lg font-black tabular-nums ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.adet}</span>
                          <button onClick={() => updateStock(item.id, item.adet, 1)} className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-lg transition-all active:scale-90 ${darkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>+</button>
                          <button onClick={() => updateStock(item.id, item.adet, 10)} className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>+10</button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isCritical 
                            ? 'bg-red-500/10 text-red-400' 
                            : (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                          {isCritical ? 'Düşük Stok' : 'Yeterli'}
                        </span>
                      )}
                    </td>
                    {editMode && (
                      <td className="px-5 py-4 text-center align-middle">
                        <button onClick={() => deleteItem(item.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!loading && filteredInventory.length === 0 && (
            <div className={`p-16 text-center ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              <Search size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="font-bold">Kayıt bulunamadı</p>
              <p className="text-sm mt-1 opacity-70">Arama terimini değiştirmeyi deneyin</p>
            </div>
          )}
        </div>

        {/* ═══ MOBİL KARTLAR ═══ */}
        <div className="grid grid-cols-1 md:hidden gap-2.5">
          {filteredInventory.map((item) => {
            const isCritical = item.adet < item.sinir
            return (
              <div key={item.id} className={`rounded-xl border shadow-sm overflow-hidden transition-all ${cardSolid} ${isCritical ? (darkMode ? 'border-l-red-500 border-l-[3px]' : 'border-l-red-500 border-l-[3px]') : ''}`}>
                <div className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                      isCritical 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : (darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                    }`}>
                      {item.marka.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-bold text-base truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.marka}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.tip}</span>
                        {isCritical && <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse"><AlertTriangle size={8}/> AZALDI</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`flex flex-col items-center justify-center min-w-[52px] h-12 rounded-xl font-black ${
                    isCritical 
                      ? 'bg-red-500/10 text-red-500' 
                      : (darkMode ? 'bg-slate-700/60 text-white' : 'bg-gray-50 text-slate-800')
                  }`}>
                    <span className="text-xl tabular-nums">{item.adet}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>adet</span>
                  </div>
                </div>

                {editMode && isEditor && (
                  <div className={`flex items-center gap-1.5 px-3.5 pb-3.5 pt-0`}>
                    <button onClick={() => updateStock(item.id, item.adet, -10)} className={`flex-1 py-2 rounded-lg font-bold text-xs active:scale-95 transition-all ${darkMode ? 'bg-slate-700/60 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>-10</button>
                    <button onClick={() => updateStock(item.id, item.adet, -1)} className={`flex-1 py-2 rounded-lg font-bold text-sm active:scale-95 transition-all ${darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>−1</button>
                    <button onClick={() => updateStock(item.id, item.adet, 1)} className={`flex-1 py-2 rounded-lg font-bold text-sm active:scale-95 transition-all ${darkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>+1</button>
                    <button onClick={() => updateStock(item.id, item.adet, 10)} className={`flex-1 py-2 rounded-lg font-bold text-xs active:scale-95 transition-all ${darkMode ? 'bg-slate-700/60 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>+10</button>
                    <button onClick={() => deleteItem(item.id)} className={`px-3 py-2 rounded-lg active:scale-95 transition-all ${darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}><Trash2 size={15}/></button>
                  </div>
                )}
              </div>
            )
          })}
          {!loading && filteredInventory.length === 0 && (
            <div className={`p-12 text-center rounded-xl border ${cardSolid}`}>
              <Search size={32} className={`mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`}/>
              <p className={`font-bold ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Kayıt bulunamadı</p>
            </div>
          )}
        </div>

        {/* Kullanıcı bilgisi footer */}
        <div className={`mt-6 flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-medium ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>
          <span>{user.email}</span>
          <span>{isEditor ? '● Yetkili' : '● İzleyici'}</span>
        </div>
      </div>
    </div>
  )
}

export default App