import React from "react";
import { useNavigate } from "react-router-dom";
import UploadExcel from "../components/UploadExcel";

const ImportPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-4/5 bg-white shadow-xl rounded-lg p-6">
      <button
        onClick={() => navigate("/dashboard")}
        className="back-arrow"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Voltar
      </button>

        <h2 className="text-2xl font-bold text-center mb-6">Importar Produtos</h2>
        <UploadExcel />
      </div>
    </div>
  );
};

export default ImportPage;
