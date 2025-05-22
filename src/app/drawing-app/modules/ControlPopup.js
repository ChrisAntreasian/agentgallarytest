import React from 'react';

export default function ControlPopup({ title, value, onChange, onClose, type = 'color', min, max }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        border: '1px solid grey',
        borderRadius: '2px',
        padding: '10px',
        zIndex: 1000,
      }}
    >
      <button onClick={onClose} style={{ float: 'right' }}>X</button>
      <label>
        {title}:
        <input
          type={type}
          value={value}
          onChange={onChange}
          style={{ marginLeft: '5px' }}
          {...(type === 'range' && { min, max })}
        />
      </label>
    </div>
  );
}