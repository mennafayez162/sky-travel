import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import MainLayout from '../layout/MainLayout';
import AdminLayout from '../layout/AdminLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Trips = lazy(() => import('../pages/Trips'));
const TripDetails = lazy(() => import('../pages/TripDetails'));
const Destinations = lazy(() => import('../pages/Destinations'));
const DestinationDetails = lazy(() => import('../pages/DestinationDetails'));
const Services = lazy(() => import('../pages/Services'));
const ServiceDetails = lazy(() => import('../pages/ServiceDetails'));
const Gallery = lazy(() => import('../pages/Gallery'));
const Blog = lazy(() => import('../pages/Blog'));
const ArticleDetails = lazy(() => import('../pages/ArticleDetails'));
const FAQ = lazy(() => import('../pages/FAQ'));
const Contact = lazy(() => import('../pages/Contact'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const Profile = lazy(() => import('../pages/Profile'));
const BookingHistory = lazy(() => import('../pages/BookingHistory'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const AuthCallback = lazy(() => import('../pages/AuthCallback'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminTrips = lazy(() => import('../pages/admin/AdminTrips'));
const AdminBookings = lazy(() => import('../pages/admin/AdminBookings'));
const AdminDestinations = lazy(() => import('../pages/admin/AdminDestinations'));
const AdminGallery = lazy(() => import('../pages/admin/AdminGallery'));
const AdminBlog = lazy(() => import('../pages/admin/AdminBlog'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'));
const AdminServices = lazy(() => import('../pages/admin/AdminServices'));
const AdminFAQ = lazy(() => import('../pages/admin/AdminFAQ'));
const AdminNewsletter = lazy(() => import('../pages/admin/AdminNewsletter'));
const AdminOffers = lazy(() => import('../pages/admin/AdminOffers'));
const AdminMessages = lazy(() => import('../pages/admin/AdminMessages'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminAbout = lazy(() => import('../pages/admin/AdminAbout'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0B1020]">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const LazyPage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LazyPage><Home /></LazyPage> },
      { path: 'about', element: <LazyPage><About /></LazyPage> },
      { path: 'trips', element: <LazyPage><Trips /></LazyPage> },
      { path: 'trips/:id', element: <LazyPage><TripDetails /></LazyPage> },
      { path: 'destinations', element: <LazyPage><Destinations /></LazyPage> },
      { path: 'destinations/:slug', element: <LazyPage><DestinationDetails /></LazyPage> },
      { path: 'services', element: <LazyPage><Services /></LazyPage> },
      { path: 'services/:slug', element: <LazyPage><ServiceDetails /></LazyPage> },
      { path: 'gallery', element: <LazyPage><Gallery /></LazyPage> },
      { path: 'blog', element: <LazyPage><Blog /></LazyPage> },
      { path: 'blog/:slug', element: <LazyPage><ArticleDetails /></LazyPage> },
      { path: 'faq', element: <LazyPage><FAQ /></LazyPage> },
      { path: 'contact', element: <LazyPage><Contact /></LazyPage> },
      { path: 'login', element: <LazyPage><Login /></LazyPage> },
      { path: 'register', element: <LazyPage><Register /></LazyPage> },
      { path: 'forgot-password', element: <LazyPage><ForgotPassword /></LazyPage> },
      { path: 'reset-password', element: <LazyPage><ResetPassword /></LazyPage> },
      { path: 'verify-email', element: <LazyPage><VerifyEmail /></LazyPage> },
      { path: 'profile', element: <LazyPage><ProtectedRoute><Profile /></ProtectedRoute></LazyPage> },
      { path: 'booking-history', element: <LazyPage><ProtectedRoute><BookingHistory /></ProtectedRoute></LazyPage> },
      { path: 'wishlist', element: <LazyPage><ProtectedRoute><Wishlist /></ProtectedRoute></LazyPage> },
      { path: '*', element: <LazyPage><NotFound /></LazyPage> },
    ],
  },
  { path: '/auth/callback', element: <LazyPage><AuthCallback /></LazyPage> },
  { path: '/admin/login', element: <LazyPage><AdminLogin /></LazyPage> },
  {
    path: '/admin',
    element: <LazyPage><ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute></LazyPage>,
    children: [
      { index: true, element: <LazyPage><AdminDashboard /></LazyPage> },
      { path: 'users', element: <LazyPage><AdminUsers /></LazyPage> },
      { path: 'trips', element: <LazyPage><AdminTrips /></LazyPage> },
      { path: 'bookings', element: <LazyPage><AdminBookings /></LazyPage> },
      { path: 'destinations', element: <LazyPage><AdminDestinations /></LazyPage> },
      { path: 'gallery', element: <LazyPage><AdminGallery /></LazyPage> },
      { path: 'blog', element: <LazyPage><AdminBlog /></LazyPage> },
      { path: 'reviews', element: <LazyPage><AdminReviews /></LazyPage> },
      { path: 'offers', element: <LazyPage><AdminOffers /></LazyPage> },
      { path: 'services', element: <LazyPage><AdminServices /></LazyPage> },
      { path: 'faq', element: <LazyPage><AdminFAQ /></LazyPage> },
      { path: 'newsletter', element: <LazyPage><AdminNewsletter /></LazyPage> },
      { path: 'messages', element: <LazyPage><AdminMessages /></LazyPage> },
      { path: 'about', element: <LazyPage><AdminAbout /></LazyPage> },
      { path: 'settings', element: <LazyPage><AdminSettings /></LazyPage> },
    ],
  },
]);

export default routes;
