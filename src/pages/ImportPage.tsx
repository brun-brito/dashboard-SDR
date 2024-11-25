import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadExcel from "../components/UploadExcel";

const copyTable = () => {
  const tableContent = `Nome\tPreço\tQuantidade\tCategoria\tMarca
  Botox 50 UI\t445.0\t100\tToxina botulínica\tAllergan
  Botox 100 UI\t745.0\t100\tToxina botulínica\tAllergan
  Botox 200 UI\t1345.0\t100\tToxina botulínica\tAllergan
  Botulift 100 UI\t650.0\t100\tToxina botulínica\tBotulift
  Botulift 150 UI\t870.0\t100\tToxina botulínica\tBotulift`;

  navigator.clipboard
    .writeText(tableContent)
    .then(() => {
      alert("Tabela copiada com sucesso!");
    })
    .catch((err) => {
      console.error("Erro ao copiar tabela:", err);
    });
};

const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-4/5 bg-white shadow-xl rounded-lg p-6">
        {/* Botão de voltar */}
        <button
          onClick={() => navigate("/dashboard")}
          className="back-arrow"
        >
          ◀ Voltar
        </button>

        {/* Título */}
        <h2 className="text-2xl font-bold text-center mb-6">Importar Produtos</h2>
        <button
          onClick={() => setShowInfo((prev) => !prev)}
          className="info-icon"
          title="Exibir instruções e exemplo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 14 14"
            id="Information-Circle--Streamline-Core"
            height={14}
            width={14}
          >
            <desc>{"Information Circle Streamline Icon: https://streamlinehq.com"}</desc>
            <g id="information-circle--information-frame-info-more-help-point-circle">
              <path
                id="Subtract"
                fillRule="evenodd"
                d="M7 14c3.866 0 7 -3.134 7 -7 0 -3.86599 -3.134 -7 -7 -7 -3.86599 0 -7 3.13401 -7 7 0 3.866 3.13401 7 7 7ZM5.5 9.375c-0.34518 0 -0.625 0.27982 -0.625 0.625 0 0.3452 0.27982 0.625 0.625 0.625h3c0.34518 0 0.625 -0.2798 0.625 -0.625 0 -0.34518 -0.27982 -0.625 -0.625 -0.625h-0.875V6.5c0 -0.34518 -0.27982 -0.625 -0.625 -0.625H6c-0.34518 0 -0.625 0.27982 -0.625 0.625s0.27982 0.625 0.625 0.625h0.375v2.25H5.5ZM8 4c0 0.55228 -0.44772 1 -1 1s-1 -0.44772 -1 -1 0.44772 -1 1 -1 1 0.44772 1 1Z"
                clipRule="evenodd"
                strokeWidth={1}
              />
            </g>
          </svg>
          Se estiver com dificuldades, clique para ver as instruções
        </button>

        {/* Balão de informação e tabela */}
        {showInfo && (
          <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg mb-6">
            {/* Instruções */}
            <h3 className="text-lg font-medium mb-2">Instruções:</h3>
            <p className="text-gray-700 mb-4">
              Para importar produtos, sua planilha deve conter as seguintes colunas obrigatórias:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-700">
              <li><strong>Nome</strong>: Nome do produto.</li>
              <li><strong>Preço</strong>: Valor do produto (número).</li>
              <li><strong>Quantidade</strong>: Quantidade disponível.</li>
              <li><strong>Categoria</strong>: Categoria do produto (opcional).</li>
              <li><strong>Marca</strong>: Marca do produto.</li>
            </ul>

            {/* Exemplo de tabela */}
            <div className="overflow-x-auto mb-6">
              <h3 className="text-lg font-medium mb-2">Exemplo de Planilha:</h3>
              <table className="tabela-exemplo">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Nome</th>
                    <th className="border border-gray-300 px-4 py-2">Preço</th>
                    <th className="border border-gray-300 px-4 py-2">Quantidade</th>
                    <th className="border border-gray-300 px-4 py-2">Categoria</th>
                    <th className="border border-gray-300 px-4 py-2">Marca</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Botox 50 UI</td>
                    <td className="border border-gray-300 px-4 py-2">445.0</td>
                    <td className="border border-gray-300 px-4 py-2">25</td>
                    <td className="border border-gray-300 px-4 py-2">Toxina botulínica</td>
                    <td className="border border-gray-300 px-4 py-2">Allergan</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Botox 100 UI</td>
                    <td className="border border-gray-300 px-4 py-2">745.99</td>
                    <td className="border border-gray-300 px-4 py-2">100</td>
                    <td className="border border-gray-300 px-4 py-2">Toxina botulínica</td>
                    <td className="border border-gray-300 px-4 py-2">Allergan</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Botox 200 UI</td>
                    <td className="border border-gray-300 px-4 py-2">1345.55</td>
                    <td className="border border-gray-300 px-4 py-2">10</td>
                    <td className="border border-gray-300 px-4 py-2">Toxina botulínica</td>
                    <td className="border border-gray-300 px-4 py-2">Allergan</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Botulift 100 UI</td>
                    <td className="border border-gray-300 px-4 py-2">650.0</td>
                    <td className="border border-gray-300 px-4 py-2">150</td>
                    <td className="border border-gray-300 px-4 py-2">Toxina botulínica</td>
                    <td className="border border-gray-300 px-4 py-2">Botulift</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Botulift 150 UI</td>
                    <td className="border border-gray-300 px-4 py-2">869.99</td>
                    <td className="border border-gray-300 px-4 py-2">9</td>
                    <td className="border border-gray-300 px-4 py-2">Toxina botulínica</td>
                    <td className="border border-gray-300 px-4 py-2">Botulift</td>
                  </tr>
                </tbody>
              </table>
              {/* Botão de copiar tabela */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={copyTable}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Copiar exemplo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Componente de upload */}
        <UploadExcel />
      </div>
    </div>
  );
};

export default ImportPage;
