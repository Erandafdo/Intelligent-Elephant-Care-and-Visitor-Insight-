import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    visitorId: string | null;
    visitorName: string | null;
    login: (id: string, name: string) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            visitorId: null,
            visitorName: null,
            login: (id, name) => set({ visitorId: id, visitorName: name }),
            logout: () => set({ visitorId: null, visitorName: null }),
        }),
        {
            name: 'pinnawala-auth-storage',
        }
    )
);
