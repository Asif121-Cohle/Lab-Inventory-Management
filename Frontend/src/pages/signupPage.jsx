import SignupForm from "../components/signupForm";
import "./CSS/styling.css";
import "./CSS/Blob.css";

const SignupPage = () => {
  return (
    <div className="page-wrapper login-page">
      {/* Same animated background */}
      <div className="animated-bg">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="login-container">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
