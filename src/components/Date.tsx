import { Timestamp } from "firebase/firestore";

const isValidDate = (vencimento: any): boolean => {
  let inputDate: Date;

  // Caso a entrada já seja um objeto Date
  if (vencimento instanceof Date) {
    inputDate = vencimento;
  } else if (typeof vencimento === "string") {
    // Se for string no formato DD/MM/AAAA
    const [day, month, year] = vencimento.split("/").map(Number);
    if (
      !day || !month || !year || 
      day < 1 || day > 31 || 
      month < 1 || month > 12
    ) {
      return false; // Data inválida
    }
    inputDate = new Date(year, month - 1, day); // Cria o objeto Date
  } else if (typeof vencimento === "number") {
    // Se for um número (formato Excel)
    // O Excel armazena datas como o número de dias desde 01/01/1900
    inputDate = new Date((vencimento - 25569) * 86400 * 1000); // Converte para timestamp
  } else {
    return false; // Formato inválido
  }

  // Verifica se a data é válida
  if (isNaN(inputDate.getTime())) {
    return false; // Data inválida
  }

  // Verifica se a data é futura
  const today = new Date();
  if (inputDate < today) {
    return false; // Data já passou
  }

  return true; // Data válida
};

const formatDateToDDMMYYYY = (date: any): string => {
  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mês zero-indexado
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Caso seja uma string no formato correto, retorna sem alterações
  if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return date;
  }

  // Caso seja um número (formato Excel)
  if (typeof date === "number") {
    const excelDate = new Date((date - 25569) * 86400 * 1000); // Converte Excel para Date
    const day = String(excelDate.getDate()).padStart(2, "0");
    const month = String(excelDate.getMonth() + 1).padStart(2, "0");
    const year = excelDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return "Não informada"; // Caso inválido
};

const parseToDate = (vencimento: any): Date | null => {
  if (vencimento instanceof Date) {
    return vencimento;
  }
  if (vencimento instanceof Timestamp) {
    return vencimento.toDate(); // Converte Timestamp para Date
  }
  if (typeof vencimento === "string") {
    const [day, month, year] = vencimento.split("/").map(Number);
    if (!day || !month || !year) return null; // Data inválida
    return new Date(year, month - 1, day);
  }
  if (typeof vencimento === "number") {
    return new Date((vencimento - 25569) * 86400 * 1000); // Converte formato Excel
  }
  return null; // Caso inválido
};

const formatTimestamp = (vencimento: Timestamp | string | null): string => {
  if (!vencimento) return "Não informada";

  let date: Date;

  if (vencimento instanceof Timestamp) {
    date = vencimento.toDate(); // Converte Timestamp para Date
  } else if (typeof vencimento === "string") {
    const [day, month, year] = vencimento.split("/").map(Number);
    if (!day || !month || !year) return "Data inválida";
    date = new Date(year, month - 1, day); // Converte string para Date
  } else {
    return "Data inválida"; // Caso não seja um tipo esperado
  }

  // Formata a data como DD/MM/AAAA
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Mês zero-indexado
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};




export {isValidDate, formatDateToDDMMYYYY, parseToDate, formatTimestamp};
