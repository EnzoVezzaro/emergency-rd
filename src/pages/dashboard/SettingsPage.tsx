import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout'; // Import the layout

const SettingsPage = () => {
  return (
    <DashboardLayout> {/* Wrap content with DashboardLayout */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        <p>This is the placeholder for the settings page.</p>
        {/* Add settings form elements or components here later */}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
