import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { CreditCard, Landmark, Mail, Phone, User as UserIcon, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileSectionProps {
  user: any;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [loading, setLoading] = useState(false);
  const [bankData, setBankData] = useState({
    bank: '',
    accountNumber: '',
    holder: '',
    phone: ''
  });

  const handleSaveBank = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'bankData', user.uid), {
        ...bankData,
        email: user.email,
        updatedAt: Date.now()
      }, { merge: true });
      alert('Datos guardados');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="bg-[#111] p-10 rounded-[40px] border border-[#222]">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-[#00ff88] rounded-2xl flex items-center justify-center">
            <Landmark className="text-black" size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter">Mis Datos Bancarios</h2>
            <p className="text-gray-500 font-medium tracking-tight">Configura dónde recibirás tus ganancias.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-left">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Banco</label>
            <input 
              value={bankData.bank}
              onChange={(e) => setBankData({...bankData, bank: e.target.value})}
              placeholder="Ej: Bancolombia"
              className="w-full bg-black border border-[#222] focus:border-[#00ff88] rounded-2xl p-5 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Número de Cuenta</label>
            <input 
              value={bankData.accountNumber}
              onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})}
              placeholder="000-000000-00"
              className="w-full bg-black border border-[#222] focus:border-[#00ff88] rounded-2xl p-5 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Titular</label>
            <input 
              value={bankData.holder}
              onChange={(e) => setBankData({...bankData, holder: e.target.value})}
              placeholder="Nombre Completo"
              className="w-full bg-black border border-[#222] focus:border-[#00ff88] rounded-2xl p-5 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Teléfono</label>
            <input 
              value={bankData.phone}
              onChange={(e) => setBankData({...bankData, phone: e.target.value})}
              placeholder="300 000 0000"
              className="w-full bg-black border border-[#222] focus:border-[#00ff88] rounded-2xl p-5 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          onClick={handleSaveBank}
          disabled={loading}
          className="w-full bg-[#00ff88] text-black font-black py-5 rounded-2xl tracking-tighter text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
        >
          <Save size={24} />
          {loading ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
        </button>
      </div>

      <div className="bg-gradient-to-br from-[#111] to-black p-10 rounded-[40px] border border-[#222] text-center">
        <CreditCard className="mx-auto mb-6 text-gray-700" size={48} />
        <h3 className="text-2xl font-black mb-2 tracking-tight text-white/50">Métodos de Pago</h3>
        <p className="text-gray-600 mb-8 max-w-xs mx-auto">Próximamente: Agrega tus tarjetas para pagos automáticos.</p>
        <div className="h-px bg-white/5 w-24 mx-auto" />
      </div>
    </div>
  );
}
