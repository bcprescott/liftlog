import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
    title: 'LiftLog',
    description: 'Track your lifts and compete with friends.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <main className="container">
                        <Navbar />
                        {children}
                    </main>
                    <Toaster position="top-center" />
                </ThemeProvider>
            </body>
        </html>
    );
}
