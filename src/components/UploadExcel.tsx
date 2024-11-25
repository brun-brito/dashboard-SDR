import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";

interface Product {
  nome: string;
  preco: number;
  quantidade: number;
  categoria?: string;
  marca?: string;
}

const UploadExcel: React.FC = () => {
  const [fileData, setFileData] = useState<Product[] | null>(null);
  const [uploadLogs, setUploadLogs] = useState<string[]>([]);
  const [finalMessage, setFinalMessage] = useState<string | null>(null); // Novo estado para a mensagem final
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUploadLogs((prev) => [...prev, "Erro: Nenhum arquivo foi selecionado."]);
      return;
    }
  
    // Reseta os estados para sobrescrever o arquivo anterior
    setFileData(null);
    setUploadLogs([]);
    setFinalMessage(null);
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        try {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
  
          const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
  
          // Filtra os produtos com colunas obrigatórias preenchidas
          const validData: Product[] = jsonData
            .filter(
              (row) =>
                row["Nome"] &&
                row["Preço"] !== undefined &&
                row["Quantidade"] !== undefined &&
                row["Marca"]
            )
            .map((row) => ({
              nome: row["Nome"],
              preco: row["Preço"],
              quantidade: row["Quantidade"],
              categoria: row["Categoria"] || "Sem categoria",
              marca: row["Marca"],
            }));
  
          setFileData(validData);
          setUploadLogs((prev) => [
            ...prev,
            `Arquivo anexado. ${validData.length} produtos foram encontrados.`,
          ]);
        } catch (error) {
          setUploadLogs((prev) => [
            ...prev,
            "Erro: Não foi possível processar o arquivo. Verifique se ele está no formato XLSX e contém os campos corretos.",
          ]);
          console.error("Erro ao processar o arquivo:", error);
        }
      }
    };
  
    reader.readAsBinaryString(file);
  };  

  const handleSendData = async () => {
    if (!fileData) {
      setUploadLogs((prev) => [...prev, "Erro: Nenhum arquivo processado para envio."]);
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [index, product] of fileData.entries()) {
      try {
        if (!product.nome || product.preco === undefined || !product.quantidade || !product.marca) {
          setUploadLogs((prev) => [
            ...prev,
            `Erro no produto na linha ${index + 2}: Campos obrigatórios ausentes. Detalhes: ${JSON.stringify(product)}`,
          ]);
          errorCount++;
          continue;
        }

        await addDoc(collection(db, "produtos"), {
          nome: product.nome,
          preco: product.preco,
          quantidade: product.quantidade,
          categoria: product.categoria || "Geral",
          marca: product.marca,
        });

        successCount++;
        setUploadLogs((prev) => [
          ...prev,
          `Produto "${product.nome}" enviado com sucesso.`,
        ]);
      } catch (error) {
        setUploadLogs((prev) => [
          ...prev,
          `Erro ao enviar produto "${product.nome}" na linha ${index + 2}.`,
        ]);
        console.error(`Erro ao enviar produto na linha ${index + 2}:`, error);
        errorCount++;
      }
    }

    // Resumo do envio
    setUploadLogs((prev) => [
      ...prev,
      `Envio concluído: ${successCount} produtos enviados com sucesso, ${errorCount} erros encontrados.`,
    ]);

    // Define mensagem final
    if (successCount === 0) {
      setFinalMessage("Falha: Nenhum produto foi enviado.");
    } else if (errorCount > 0) {
      setFinalMessage(`Parcial: ${successCount} produtos enviados com sucesso, ${errorCount} falhas.`);
    } else {
      setFinalMessage("Sucesso: Todos os produtos foram enviados com sucesso!");
    }
  
    setIsLoading(false);
  };  

  const resetUploadProcess = () => {
    setFileData(null);
    setUploadLogs([]);
    setFinalMessage(null);
  };

  return (
    <div>
      <div className="mb-4"  style={{ marginTop: "20px", justifyContent: "center", display: "flex" }}>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="file-input"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="spinner border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          <p className="ml-4 text-blue-500 font-medium">Importando produtos, aguarde...</p>
        </div>
      )}

      {fileData && !finalMessage && (
        <button
          onClick={handleSendData}
          className={`bg-blue-500 text-white py-2 px-4 mt-4 rounded ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Importando..." : "Enviar Planilha"}
        </button>
      )}

      {finalMessage && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="text-xl font-bold">{finalMessage}</h3>
          {finalMessage.startsWith("Falha") && (
            <button
              onClick={resetUploadProcess}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Tentar Novamente
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Voltar para Dashboard
          </button>
        </div>
      )}

      <h3 className="mt-6">Logs de Importação:</h3>
      <div className="logs bg-gray-100 p-4 rounded">
        {uploadLogs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  );
};

export default UploadExcel;
