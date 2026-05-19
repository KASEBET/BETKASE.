import { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Mail, Lock, X, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegister) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          email,
          createdAt: Date.now()
        });
        setSuccess('¡Cuenta creada correctamente!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess('¡Bienvenido de nuevo!');
      }
      
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Ingresa tu correo para restablecer la clave');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Correo de recuperación enviado');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#111] rounded-[40px] border border-[#222] p-10 overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black mb-2 tracking-tighter">
            {isRegister ? 'Crea tu cuenta' : 'Acceso Premium'}
          </h2>
          <p className="text-gray-500 font-medium">BETKASE Sports Betting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Correo</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00ff88] transition-colors" size={20} />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-black border border-[#222] focus:border-[#00ff88] rounded-2xl py-5 pl-14 pr-6 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00ff88] transition-colors" size={20} />
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-[#222] focus:border-[#00ff88] rounded-2xl py-5 pl-14 pr-6 outline-none transition-all"
              />
            </div>
          </div>

          {!isRegister && (
            <div className="text-right">
              <button 
                type="button"
                onClick={handleResetPassword}
                className="text-xs font-bold text-[#00ff88] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl text-red-500 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-[#00ff88]/10 border border-[#00ff88]/50 p-4 rounded-2xl text-[#00ff88] text-sm font-medium flex items-center gap-2"
              >
                <Check size={16} /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            disabled={loading}
            className="w-full bg-[#00ff88] text-black font-black py-5 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(0,255,136,0.2)]"
          >
            {loading ? 'Procesando...' : (isRegister ? 'REGISTRARSE' : 'INGRESAR')}
            {!loading && <ChevronRight size={20} />}
          </button>

          <div className="pt-4 text-center">
            <button 
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
            >
              {isRegister ? '¿Ya tienes cuenta? Ingresa' : '¿No tienes cuenta? Registrate'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
