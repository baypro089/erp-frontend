'use client';

import ReturnDetailPage from '@libs/src/pages/commercial/returns/detail';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  return <ReturnDetailPage id={id} />;
}
