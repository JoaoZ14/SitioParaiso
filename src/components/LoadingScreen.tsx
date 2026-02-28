import { Leaf } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#fffdf5] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 bg-gradient-to-br from-[#4a7c59] to-[#2d5a3d] rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
        <Leaf className="w-7 h-7 text-white" />
      </div>
      <p className="font-serif text-[#8a7a66] text-sm">Carregando o sítio...</p>
    </div>
  );
}
