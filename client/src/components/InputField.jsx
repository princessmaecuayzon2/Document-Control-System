import React from 'react';

const InputField = ({ label, type, name, value, onChange, icon }) => (
  <div className="relative">
    <input
      required
      type={type}
      name={name}
      placeholder={label}
      value={value}
      onChange={onChange}
      className="w-full bg-white border border-gray-300 p-3 pl-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">{icon}</span>
  </div>
);

export default InputField;
