import React from "react";

const Button = ({
  label = "Button",
  type = "button", // Use "button" as the default type
  className = "",
  disabled = false,
  onClick, // Add onClick prop
}) => {
  return (
    <button
      type={type}
      className={`text-white bg-primary hover:bg-primary focus:outline-none
        focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm 
        px-5 py-2.5 text-center ${className}`}
      disabled={disabled}
      onClick={onClick} // Attach the onClick handler
    >
      {label}
    </button>
  );
};

export default Button;
