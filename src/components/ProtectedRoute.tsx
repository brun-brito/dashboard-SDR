import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth(); // Obtenha o usuário autenticado do contexto ou do hook

  if (!currentUser) {
    // Se não estiver autenticado, redirecione para a página de login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // Renderiza os filhos se autenticado
};

export default ProtectedRoute;
