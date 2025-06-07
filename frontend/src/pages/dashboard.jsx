// src/pages/dashboard.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Dashboard() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '1rem 2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;
