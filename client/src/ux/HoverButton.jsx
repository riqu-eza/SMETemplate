// HoverButton.jsx
/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import './HoverButton.css';

const HoverButton = ({ title, link,  }) => {
  return (
    <Link
      to={link}
      className="relative inline-block p-3 border border-gray-400  overflow-hidden transition-transform duration-300 transform "
    >
      <span className="absolute inset-0 flex font-[Poppins] text-[#252525] px-4 items-center justify-center transition-opacity duration-300 opacity-100 hover:opacity-0">
        {title}
      </span>
      <span className="absolute inset-0 flex items-center font-[Poppins] text-[#FFFFFF] bg-[#3A3A3A] justify-center transition-opacity duration-300 opacity-0 hover:opacity-100">
        {title}
      </span>
    </Link>
  );
};

export default HoverButton;
