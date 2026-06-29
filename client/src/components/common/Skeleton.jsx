// Generic pulsing placeholder block — ProductCard/ReelCard skeletons
// compose this rather than each redeclaring "animate-pulse bg-gray-200".
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-black/10 ${className}`} />
);

export default Skeleton;
