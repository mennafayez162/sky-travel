import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const shimmer = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
      backgroundPosition: '200% 0',
      transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
    },
  };

  const shimmerStyle = {
    backgroundImage:
      'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '200% 100%',
  };

  const CardSkeleton = () => (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      {...shimmer}
    >
      <div className="h-48 bg-dark-surface" style={shimmerStyle} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-dark-surface rounded w-3/4" style={shimmerStyle} />
        <div className="h-3 bg-dark-surface rounded w-1/2" style={shimmerStyle} />
        <div className="h-3 bg-dark-surface rounded w-full" style={shimmerStyle} />
        <div className="h-8 bg-dark-surface rounded w-1/3 mt-4" style={shimmerStyle} />
      </div>
    </motion.div>
  );

  const TextSkeleton = () => (
    <div className="space-y-3">
      <div className="h-4 bg-dark-surface rounded w-3/4" style={shimmerStyle} />
      <div className="h-3 bg-dark-surface rounded w-full" style={shimmerStyle} />
      <div className="h-3 bg-dark-surface rounded w-5/6" style={shimmerStyle} />
    </div>
  );

  const ImageSkeleton = () => (
    <div className="h-64 bg-dark-surface rounded-xl" style={shimmerStyle} />
  );

  const TableSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-10 bg-dark-surface rounded flex-1" style={shimmerStyle} />
          <div className="h-10 bg-dark-surface rounded flex-[2]" style={shimmerStyle} />
          <div className="h-10 bg-dark-surface rounded flex-1" style={shimmerStyle} />
          <div className="h-10 bg-dark-surface rounded flex-1" style={shimmerStyle} />
        </div>
      ))}
    </div>
  );

  const ProfileSkeleton = () => (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-dark-surface" style={shimmerStyle} />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-dark-surface rounded w-1/3" style={shimmerStyle} />
        <div className="h-3 bg-dark-surface rounded w-1/2" style={shimmerStyle} />
      </div>
    </div>
  );

  const skeletons = {
    card: CardSkeleton,
    text: TextSkeleton,
    image: ImageSkeleton,
    table: TableSkeleton,
    profile: ProfileSkeleton,
  };

  const SkeletonComponent = skeletons[type] || CardSkeleton;

  return (
    <div className="grid gap-6">
      {[...Array(count)].map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
