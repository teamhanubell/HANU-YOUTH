import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ModalProvider } from '@/hooks/useModal'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ModalProvider>
      <Component {...pageProps} />
    </ModalProvider>
  )
}

export default MyApp