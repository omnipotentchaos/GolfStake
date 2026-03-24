import './globals.css';

import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: 'GolfStake — Play. Win. Give.',
  description: 'A subscription-based golf platform combining performance tracking, monthly prize draws, and charitable giving. Enter your golf scores, compete in draws, and support charities.',
  keywords: 'golf, charity, subscription, prize draw, stableford, give back',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
