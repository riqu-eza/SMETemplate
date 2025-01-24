/* eslint-disable react/prop-types */
import "./Button.css"; // Assuming you have the styles in an external CSS file

const Button = ({ handleButtonClick, buttonText }) => {
  return (
    <div className="container">
      <button onClick={handleButtonClick} className="button type--C">
        <div className="button__line"></div>
        <div className="button__line"></div>
        <span className="button__text">{buttonText}</span>
        <div className="button__drow1"></div>
        <div className="button__drow2"></div>
      </button>
    </div>
  );
};

export default Button;
