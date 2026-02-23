'use client';
import { use } from 'react';
import ProductDetailPage from '@libs/src/pages/admin/products/detail';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductViewPage({ params }: PageProps) {
  const { id } = use(params);
  return <ProductDetailPage productId={id} />;
}