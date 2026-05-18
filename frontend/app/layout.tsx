import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { BlobBackground } from '@/components/BlobBackground';
import { ToastConfig } from '@/components/ToastConfig';

const dmSerifDisplay = DM_Serif_Display({ 
  subsets: ['latin'], 
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display'
});

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans'
});

const dmMono = DM_Mono({ 
  subsets: ['latin'], 
  weight: ['400'],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'Cowrite - Real-Time Collaborative Notes',
  description: 'A warm, physical notebook that has come to life digitally. Collaborate in real time with Cowrite.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body>
        {/* BlobBackground fixed behind everything */}
        <BlobBackground />
        
        {/* Wrapped content in z-index 1 layer */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>

        {/* CustomToast system programmatically restricted to max 3 toasts with deduplication */}
        <ToastConfig />
      </body>
    </html>
  );
}
