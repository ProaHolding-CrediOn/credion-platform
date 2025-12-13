import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import React from 'react';

export default function LayoutPlatform({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full h-full">
            <div className="w-full">
                <Header />
                <div className="p-6 bg-white dark:bg-secondary">
                    {children}
                </div>
                <Footer />
            </div>
        </div>
    );
}