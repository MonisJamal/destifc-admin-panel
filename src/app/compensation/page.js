'use client';
import Sidebar from '@/components/Sidebar';
import CompensationConfig from '@/components/CompensationConfig';

export default function CompensationPage() {
  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-64 relative min-h-screen">
        <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          <CompensationConfig />
        </div>
      </main>
    </div>
  );
}
