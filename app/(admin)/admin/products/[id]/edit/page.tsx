'use client';
import { use } from 'react';
import ProductFormPage from '@libs/src/pages/admin/products/form';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductEditPage({ params }: PageProps) {
  const { id } = use(params);
  return <ProductFormPage productId={id} />;
}
