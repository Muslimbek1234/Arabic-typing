import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arabcha Yozish Mashqi | AI Analysis',
  description:
    "Sun'iy intellekt yordamida arabcha yozishni o'rganing. Harflar, so'zlar va matnlarni yozish mashqi. AI tahlili bilan shaxsiy taraqqiyotni kuzating.",
  keywords: [
    'arabcha yozish',
    'typing practice',
    'arab alifbosi',
    'mashq',
    'AI tahlil',
  ],
  authors: [{ name: 'Arabic Typing Mastery' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" dir="ltr">
      <body className="bg-[#050508] text-[#e2e8f0] antialiased">
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
