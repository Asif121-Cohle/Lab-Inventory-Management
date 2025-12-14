import LoginForm from "../components/loginForm";
import "./CSS/Blob.css";
import "./CSS/styling.css";


const LoginPage = () => {
  return (

    <div className="page-wrapper login-page">

      <div className="animated-bg">
       <div className="blob"></div>
       <div className="blob"></div>
       <div className="blob"></div>
      </div>

      <div className="login-container">
        <h2 className="login-title">Lab Inventory Login</h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
