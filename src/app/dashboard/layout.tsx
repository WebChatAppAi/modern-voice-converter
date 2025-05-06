import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AlvanPVT Voice Converter - Dashboard',
  description: 'Convert your voice with our state-of-the-art AI technology.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {children}
    </div>
  );
} 