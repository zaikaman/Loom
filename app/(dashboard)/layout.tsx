import type { Metadata } from 'next'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
    title: 'Loom Dashboard',
    description: 'Manage your product roadmaps',
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar className="hidden md:flex" />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Sidebar Trigger could go here in a generic header if needed, 
            but for now we'll assume desktop first as per prominent specs, 
            with responsive collapse handled by CSS media queries mostly */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
