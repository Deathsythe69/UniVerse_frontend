import React from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-6 max-w-2xl mx-auto lg:ml-0 lg:mr-auto">
        <div className="pb-24 md:pb-6">
          {children}
        </div>
      </main>
      
      <div className="hidden lg:block w-80 p-6 border-l border-white/10 overflow-y-auto">
         <RightSidebar />
      </div>
    </div>
  );
};

export default MainLayout;
