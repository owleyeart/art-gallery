import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import MemberGallery from './pages/MemberGallery.jsx'
import ArtistPage from './pages/ArtistPage.jsx'
import Events from './pages/Events.jsx'
import About from './pages/About.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminArtists from './pages/admin/Artists.jsx'
import AdminEvents from './pages/admin/EventsAdmin.jsx'
import AdminSiteConfig from './pages/admin/SiteConfig.jsx'
import AdminFeaturedArtist from './pages/admin/FeaturedArtist.jsx'
import AdminDocuments from './pages/admin/Documents.jsx'
import AdminNewsletter from './pages/admin/Newsletter.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import MemberRoster from './pages/admin/MemberRoster.jsx'
import Login from './pages/Login.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="gallery" element={<MemberGallery />} />
          <Route path="gallery/:slug" element={<ArtistPage />} />
          <Route path="events" element={<Events />} />
          <Route path="about" element={<About />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="artists" element={<AdminArtists />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="featured" element={<AdminFeaturedArtist />} />
          <Route path="site-config" element={<AdminSiteConfig />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="roster" element={<MemberRoster />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
