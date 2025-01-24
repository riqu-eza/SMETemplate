/* eslint-disable react/prop-types */

import { useNavigate } from "react-router-dom";
import Button from "../ux/button";
import "./components.css";


const Homecontainer = ({ imageUrl, title, description, navigateTo }) => {
  const navigate = useNavigate();
  const handleButtonClick = () => {
    navigate(navigateTo); // Navigate to the specified route
  };
  return (
    <div className="image-container">
  <div
    className="image-background"
    style={{
      backgroundImage: `url(${imageUrl})`, // Dynamically set the background image
    }}
  ></div>
  
  {/* Add the overlay div here */}
  <div className="image-overlay"></div> 

  <div className="content">
    <h3>{title}</h3>
    <p>{description}</p>
    <Button handleButtonClick={handleButtonClick} buttonText="Learn More" > </Button>
  </div>
</div>

  
  

  
  );
};

export default Homecontainer;
