import React from 'react';
import { motion } from 'framer-motion';

const CompanyInfo: React.FC = () => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-5  z-10">
  
        <img
          src="/assets/images/logo2.png"
          alt="Mycenic Logo"
          className="w-[60%] rounded-full bg-gradient-to-t from-sky-300 "
        />


      <h1 className="font-Audrey_Normal text-transparent text-9xl leading-tight bg-clip-text bg-gradient-to-tr from-sky-400 ">
        MYCENIC
      </h1>
        
  
    </div>
  );
};

export default CompanyInfo;
