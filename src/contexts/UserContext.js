import React, { createContext, useState, useContext, useEffect } from 'react';
import UserDataRefreshService from '../services/UserDataRefreshService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserData = async () => {
    try {
      setIsLoading(true);
      const result = await UserDataRefreshService.refreshUserData();
      
      if (result.success) {
        setUserData(result.data.userData);
        return { success: true, data: result.data.userData };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza os dados do usuário quando o app inicia
  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, isLoading, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}; 