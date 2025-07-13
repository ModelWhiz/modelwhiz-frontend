import ChakraWrapper from '@/contexts/ChakraProvider'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'ModelWhiz',
  description: 'ModelWhiz Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraWrapper>
          <AuthProvider>{children}</AuthProvider>
        </ChakraWrapper>
      </body>
    </html>
  )
}

