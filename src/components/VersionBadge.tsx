import { useEffect, useState } from 'react';

export const VersionBadge = () => {
    const commitHash = "e724062"; // Hash do último commit feito agora
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div 
            onClick={() => setIsVisible(false)}
            className="fixed bottom-4 right-4 z-[9999] bg-blue-600/20 backdrop-blur-md border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black cursor-pointer hover:bg-blue-600/40 transition-all animate-pulse"
            title="Clique para fechar"
        >
            BUILD: {commitHash} (WHATSAPP_UPDATE)
        </div>
    );
};
