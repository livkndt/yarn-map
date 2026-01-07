'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShopFormModal } from './shop-form-modal';
import type { Shop } from '@/types';

export function ShopsManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shops?limit=1000', {
        cache: 'no-store', // Always fetch fresh data to avoid stale cache
      });
      const data = await response.json();

      if (response.ok) {
        setShops(data.shops);
      } else {
        toast.error('Failed to fetch shops');
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shop?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/shops/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Shop deleted successfully');
        fetchShops();
      } else {
        toast.error('Failed to delete shop');
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
      toast.error('Failed to delete shop');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingShop(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingShop(null);
    fetchShops();
  };

  const handleGeocode = async (
    address: string,
    city: string,
    postcode: string,
  ) => {
    try {
      const query = encodeURIComponent(`${address}, ${city}, ${postcode}, UK`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      );
      const data = await response.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return { latitude: lat, longitude: lon };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Shops Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create, edit, and delete yarn shops
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shop
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shops ({shops.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading shops...
            </div>
          ) : shops.length === 0 ? (
            <div className="py-12 text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No shops found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first shop to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      City
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Postcode
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr key={shop.id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="font-medium">{shop.name}</div>
                        {shop.description && (
                          <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                            {shop.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{shop.city}</td>
                      <td className="px-4 py-3 text-sm">{shop.postcode}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(shop)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(shop.id)}
                            disabled={deletingId === shop.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <ShopFormModal
          shop={editingShop}
          open={isFormOpen}
          onClose={handleFormClose}
          onGeocode={handleGeocode}
        />
      )}
    </div>
  );
}
