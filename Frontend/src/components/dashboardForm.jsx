import "../pages/styling.css";
import Footer from "./footer";
const Dashboard = () => {
  return (
    <div className="dashboard">
    <div className="labs">
      <div className="card">Computer Lab</div>
      <div className="card">Physics Lab</div>
      <div className="card">Electronics Lab</div>
    </div>
    <Footer/>
    </div>
  );
};

export default Dashboard;
