
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Produto, InsumoProduto } from '@/services/database';

interface ProductFormData extends Partial<Produto> {
  insumos?: InsumoProduto[];
}

interface ProductFormContextType {
  productData: ProductFormData;
  setProductData: (data: Partial<ProductFormData>) => void;
  addInsumo: (insumo: InsumoProduto) => void;
  removeInsumo: (insumoId: number) => void;
  updateInsumoQuantity: (insumoId: number, quantity: number) => void;
  clearForm: () => void;
}

const ProductFormContext = createContext<ProductFormContextType | undefined>(undefined);

export const ProductFormProvider = ({ children }: { children: ReactNode }) => {
  const [productData, setProductDataState] = useState<ProductFormData>({});

  const setProductData = (data: Partial<ProductFormData>) => {
    setProductDataState(prev => ({ ...prev, ...data }));
  };

  const addInsumo = (insumo: InsumoProduto) => {
    setProductDataState(prev => ({
      ...prev,
      insumos: [...(prev.insumos || []), insumo],
    }));
  };

  const removeInsumo = (insumoId: number) => {
    setProductDataState(prev => ({
      ...prev,
      insumos: prev.insumos?.filter(i => i.insumo_id !== insumoId) || [],
    }));
  };

  const updateInsumoQuantity = (insumoId: number, quantity: number) => {
    setProductDataState(prev => ({
      ...prev,
      insumos: prev.insumos?.map(i => 
        i.insumo_id === insumoId ? { ...i, quantidade_usada: quantity } : i
      ) || [],
    }));
  };

  const clearForm = () => {
    setProductDataState({});
  };

  return (
    <ProductFormContext.Provider value={{ productData, setProductData, addInsumo, removeInsumo, updateInsumoQuantity, clearForm }}>
      {children}
    </ProductFormContext.Provider>
  );
};

export const useProductForm = () => {
  const context = useContext(ProductFormContext);
  if (context === undefined) {
    throw new Error('useProductForm must be used within a ProductFormProvider');
  }
  return context;
};
