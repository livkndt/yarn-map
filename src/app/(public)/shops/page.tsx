import { Metadata } from 'next';
import { ShopsDirectory } from './shops-directory';
import { db } from '@/lib/db';
import type { Shop } from '@/types';

export const metadata: Metadata = {
  title: 'UK Yarn Shops Directory | Yarn Map',
  description:
    'Discover independent yarn shops across the UK with locations, contact information, and specialties.',
};

export const revalidate = 3600; // Revalidate every hour

async function getInitialShops(): Promise<{ shops: Shop[]; total: number }> {
  try {
    const [shops, total] = await Promise.all([
      db.shop.findMany({
        orderBy: { name: 'asc' },
        take: 100,
        skip: 0,
      }),
      db.shop.count(),
    ]);

    return {
      shops: shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        description: shop.description,
        address: shop.address,
        city: shop.city,
        postcode: shop.postcode,
        latitude: shop.latitude,
        longitude: shop.longitude,
        website: shop.website,
        phone: shop.phone,
        source: shop.source,
      })),
      total,
    };
  } catch (error) {
    console.error('Error fetching initial shops:', error);
    return { shops: [], total: 0 };
  }
}

export default async function ShopsPage() {
  const initialData = await getInitialShops();
  return (
    <ShopsDirectory
      initialShops={initialData.shops}
      initialTotal={initialData.total}
    />
  );
}
