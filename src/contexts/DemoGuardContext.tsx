import { useState, useCallback, createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DemoGuardContextType {
    isDemoMode: boolean;
    guardAction: (action: () => void, moduleName?: string) => void;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    modulesAccessed: string[];
    demoStartTime: number;
}

const DemoGuardContext = createContext<DemoGuardContextType | undefined>(undefined);

export function DemoGuardProvider({ children }: { children: React.ReactNode }) {
    const { user, role } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [modulesAccessed, setModulesAccessed] = useState<string[]>([]);
    const [demoStartTime] = useState(Date.now());

    // Demo mode = logged in with demo credentials (email contains 'demo')
    const isDemoMode = user?.email ? user.email.includes('demo') : false;

    const guardAction = useCallback((action: () => void, moduleName?: string) => {
        if (moduleName && modulesAccessed && !modulesAccessed.includes(moduleName)) {
            setModulesAccessed(prev => [...prev, moduleName]);
        }

        if (isDemoMode) {
            setShowModal(true);
            return;
        }

        action();
    }, [isDemoMode, modulesAccessed]);

    return (
        <DemoGuardContext.Provider value={{
            isDemoMode,
            guardAction,
            showModal,
            setShowModal,
            modulesAccessed,
            demoStartTime,
        }}>
            {children}
        </DemoGuardContext.Provider>
    );
}

export function useDemoGuard() {
    const context = useContext(DemoGuardContext);
    if (!context) throw new Error('useDemoGuard must be used within DemoGuardProvider');
    return context;
}
