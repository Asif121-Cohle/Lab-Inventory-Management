import React from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import '../pages/CSS/addItemCard.css';

const AddItemCard = ({ onOpen, userRole }) => {
  if (userRole !== 'lab_assistant') return null;

  return (
    <div className="add-item-card" onClick={onOpen} title="Click to add new material">
      <div className="add-item-icon">
        <AiOutlinePlus size={48} />
      </div>
      <h3>Add New Material</h3>
      <p>Smart categorization with AI</p>
    </div>
  );
};

export default AddItemCard;
