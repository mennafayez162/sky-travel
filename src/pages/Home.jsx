import Hero from '../components/home/Hero';
import PopularDestinations from '../components/home/PopularDestinations';
import FeaturedTrips from '../components/home/FeaturedTrips';
import OffersSection from '../components/home/OffersSection';
import ServicesSection from '../components/home/ServicesSection';
import Statistics from '../components/home/Statistics';
import Testimonials from '../components/home/Testimonials';
import GallerySection from '../components/home/GallerySection';
import Partners from '../components/home/Partners';
import Newsletter from '../components/home/Newsletter';

const Home = () => {
  return (
    <>
      <Hero />
      <PopularDestinations />
      <FeaturedTrips />
      <OffersSection />
      <ServicesSection />
      <Statistics />
      <Testimonials />
      <GallerySection />
      <Partners />
      <Newsletter />
    </>
  );
};

export default Home;
