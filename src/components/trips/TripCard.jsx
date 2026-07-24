import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiStar, FiHeart, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../utils/helpers';

const TripCard = ({ trip }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  return (
    <Link to={`/trips/${trip.id}`} className="block glass-card overflow-hidden group card-hover">
      <div className="relative h-56 overflow-hidden">
        <img
          src={trip.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {trip.discount > 0 && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 rounded-lg text-xs font-bold">
            -{trip.discount}%
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(trip.id); }}
          className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isInWishlist(trip.id)
              ? 'bg-red-500 text-white'
              : 'glass-card hover:bg-red-500/20 hover:text-red-400'
          }`}
        >
          <FiHeart className={`w-4 h-4 ${isInWishlist(trip.id) ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white/80 text-sm">
          <span className="flex items-center gap-1">
            <FiMapPin className="w-4 h-4" />
            {trip.destination?.name || 'N/A'}
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            {trip.duration || 'N/A'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {trip.title}
        </h3>
        {trip.short_description && (
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{trip.short_description}</p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm">{trip.rating || '4.8'}</span>
          <span className="text-xs text-gray-500">({trip.booking_count || 0} bookings)</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dark-border">
          <div>
            {trip.discount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gradient">
                  {formatCurrency(trip.price * (1 - trip.discount / 100))}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(trip.price)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-gradient">
                {formatCurrency(trip.price)}
              </span>
            )}
            <p className="text-xs text-gray-500">per person</p>
          </div>

          <span className="flex items-center gap-1 gradient-btn px-4 py-2 text-sm">
            <span>View</span>
            <FiArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;
