const isValidDate = (vencimento: string): boolean => {
    const [month, year] = vencimento.split("/").map(Number);
    if (!month || !year || month < 1 || month > 12) {
      return false; // Verifica se a data está no formato correto
    }
  
    const today = new Date();
    const currentYear = today.getFullYear() % 100; // Últimos dois dígitos do ano
    const currentMonth = today.getMonth() + 1; // Mês atual (de 0 a 11)
  
    // Verifica se o produto venceu
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
  
    return true;
  };

export default isValidDate;