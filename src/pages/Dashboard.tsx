import React from "react";
import { useNavigate } from "react-router-dom";
import ProductTable from "../components/ProductTable";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Painel do Distribuidor</h1>
      <button
        onClick={() => navigate("/import")}
        className="upload-button flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="upload-icon h-5 w-5"
        >
          <path d="M11.47 1.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1-1.06 1.06l-1.72-1.72V7.5h-1.5V4.06L9.53 5.78a.75.75 0 0 1-1.06-1.06l3-3ZM11.25 7.5V15a.75.75 0 0 0 1.5 0V7.5h3.75a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h3.75Z" />
        </svg>
        <span className="text-sm font-medium">Importar Produtos via Planilha</span>
      </button>
      <ProductTable />
    </div>
  );
};

export default Dashboard;
