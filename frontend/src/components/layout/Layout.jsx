import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'
import NewsletterPopup from '../ui/NewsletterPopup.jsx'

export default function Layout() {
  const { config } = useSiteConfig()

  return (
    <>
      <Helmet>
        <title>{config.site_name}</title>
        <meta name="description" content={config.meta_description} />
        <meta name="keywords" content={config.meta_keywords} />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <NewsletterPopup />
    </>
  )
}
