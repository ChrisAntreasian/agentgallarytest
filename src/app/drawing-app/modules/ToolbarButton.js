import React from 'react';

export default function ToolbarButton({ onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '30px',
        height: '30px',
        backgroundColor: 'white',
        border: '1px solid grey',
        borderRadius: '2px',
        cursor: 'pointer',
        marginBottom: '10px',
      }}
    >
      {icon}
    </button>
  );
}