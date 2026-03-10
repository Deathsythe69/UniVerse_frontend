import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-6 max-w-4xl mx-auto md:ml-0 md:mr-auto lg:mx-auto">
        {/* Adds padding space for mobile bottom nav (to be built if needed) */}
        <div className="pb-24 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
