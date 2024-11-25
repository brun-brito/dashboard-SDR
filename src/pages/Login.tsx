import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthError = (error: any) => {
    let message;
    switch (error.code) {
      case 'auth/invalid-email':
        message = "O email fornecido é inválido.";
        break;
      case "auth/invalid-credential":
          message = "E-mail ou senha incorreto(s). Verifique e tente novamente.";
          break;
      case 'auth/user-not-found':
        message = "Nenhum usuário encontrado com este email.";
        break;
      case 'auth/email-already-in-use':
        message = "Este email já está em uso por outra conta.";
        break;
      case 'auth/weak-password':
        message = "A senha é muito fraca. Escolha uma senha mais forte.";
        break;
      case 'auth/credential-already-in-use':
        message = "Estas credenciais já estão associadas a outra conta.";
        break;
      case 'auth/operation-not-allowed':
        message = "Esta operação não é permitida. Verifique as configurações.";
        break;
      case 'auth/requires-recent-login':
        message = "Requer um login recente. Faça login novamente.";
        break;
      case 'auth/user-disabled':
        message = "A conta do usuário foi desativada por um administrador.";
        break;
      case 'auth/too-many-requests':
        message = "Muitas tentativas de login. Tente novamente mais tarde.";
        break;
      case 'auth/network-request-failed':
        message = "Erro de rede. Verifique sua conexão e tente novamente.";
        break;
      case 'auth/internal-error':
        if (error.message && error.message.includes("INVALID_LOGIN_CREDENTIALS")) {
            message = "Email e/ou senha incorretos. Tente novamente.";
        } else {
            message = "Ocorreu um erro interno. Tente novamente.";
        }
        break;
      case 'auth/invalid-phone-number':
        message = "O número de telefone fornecido é inválido.";
        break;
      case 'auth/popup-closed-by-user':
        message = "O popup foi fechado antes da finalização do login. Tente novamente.";
        break;
      case 'auth/invalid-verification-code':
        message = "O código de verificação é inválido.";
        break;
      default:
        message = "Ocorreu um erro. Tente novamente.";
    }
    return message;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error: any) {
      const errorMsg = handleAuthError(error);
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h1>Login</h1>
        <div className="form-item">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-item">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-item">
          <button
            type="submit"
            disabled={isLoading}
            className={isLoading ? "loading-button" : ""}
          >
            {isLoading ? <span className="spinner"></span> : "Entrar"}
          </button>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default Login;
