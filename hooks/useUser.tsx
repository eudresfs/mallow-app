
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getOrCreateDefaultUser, User, setupDatabase } from '@/services/database';

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        // Garante que o banco de dados e as tabelas estão configurados
        await setupDatabase();
        const defaultUser = await getOrCreateDefaultUser();
        setUser(defaultUser);
      } catch (error) {
        console.error("Falha ao carregar o usuário padrão:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
