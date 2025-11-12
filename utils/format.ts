
export const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null) {
    return "R$ 0,00";
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};
