import { useNavigate } from "react-router-dom";
import "../pages/CSS/card.css";
import "../pages/CSS/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const labs = [
    {
      id: "computer-lab",
      name: "Computer Lab",
      image: "/images/compiler.png",
      description: "Computer hardware, networking equipment, and accessories"
    },
    {
      id: "physics-lab",
      name: "Physics Lab",
      image: "/images/ee.jpg",
      description: "Physics instruments, measurement tools, and experimental apparatus"
    },
    {
      id: "electronics-lab",
      name: "Electronics Lab",
      image: "/images/machine.jpg",
      description: "Electronic components, circuit boards, and testing equipment"
    }
  ];

  const handleLabClick = (labId) => {
    navigate(`/lab/${labId}`);
  };

  return (
    <div className="dashboard">
      <div className="labs">
        {labs.map((lab) => (
          <div 
            key={lab.id}
            className="card"
            onClick={() => handleLabClick(lab.id)}
            style={{ cursor: 'pointer' }}
            title={`Click to view ${lab.name} materials`}
          >
            <img src={lab.image} className="lab-img" alt={lab.name} />
            <p>{lab.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
