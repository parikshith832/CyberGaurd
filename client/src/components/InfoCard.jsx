import React from 'react';

const InfoCard = ({ title, content, icon }) => (
  <div className="p-6 bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 hover:shadow-2xl transition duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 bg-opacity-70 backdrop-blur-sm">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-2xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-200">{content}</p>
  </div>
);

export default InfoCard;
