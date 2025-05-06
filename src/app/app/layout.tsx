import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AlvanPVT Voice Converter - App',
  description: 'Convert your voice with our state-of-the-art AI technology.',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 