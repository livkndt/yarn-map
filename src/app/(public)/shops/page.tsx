import { Metadata } from 'next';
import { ShopsDirectory } from './shops-directory';

export const metadata: Metadata = {
  title: 'UK Yarn Shops Directory | Yarn Map',
  description:
    'Discover independent yarn shops across the UK with locations, contact information, and specialties.',
};

export default function ShopsPage() {
  return <ShopsDirectory />;
}
