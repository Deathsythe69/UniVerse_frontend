import React from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main content — transparent for WebGL to show through glass edges */}
      <main className="flex-1 overflow-x-hidden p-6 max-w-2xl mx-auto lg:ml-0 lg:mr-auto relative">
        <div className="pb-24 md:pb-6">
          {children}
        </div>
      </main>

      {/* Right sidebar — glass panel */}
      <div
        className="hidden lg:block w-80 p-6 overflow-y-auto"
        style={{
          background: 'rgba(14,14,19,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(72,71,77,0.1)',
        }}
      >
        <RightSidebar />
      </div>
    </div>
  );
};

export default MainLayout;
