import { Helmet } from 'react-helmet-async'
import { useSiteConfig } from '../context/SiteConfigContext.jsx'

export default function About() {
  const { config } = useSiteConfig()

  return (
    <>
      <Helmet><title>About — {config.site_name}</title></Helmet>
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-10 h-0.5 bg-accent" />
          <h1 className="font-heading text-3xl font-bold">About & Contact</h1>
        </div>
        {config.about && (
          <p className="text-sm leading-relaxed opacity-80 mb-10 whitespace-pre-line max-w-2xl">{config.about}</p>
        )}
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <h2 className="font-heading text-xl font-bold mb-3">Find Us</h2>
            <p className="text-sm opacity-70">{config.address}</p>
            {config.hours && <p className="text-sm opacity-70 mt-1">Hours: {config.hours}</p>}
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold mb-3">Get in Touch</h2>
            {config.phone && <p className="text-sm opacity-70">📞 {config.phone}</p>}
            {config.email && (
              <a href={`mailto:${config.email}`} className="text-sm text-secondary hover:underline block">
                ✉️ {config.email}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
