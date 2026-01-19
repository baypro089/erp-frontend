// app/(auth)/layout.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ClientOnly from '@libs/src/components/ClientOnly';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Container chính: Chiều cao tối thiểu full màn hình, flex row
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo và Tên ứng dụng */}
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="ERP Logo"
            width={150}
            height={150}
            className="rounded-full"
          />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Hệ thống ERP
          </h1>
          <p className="text-sm text-gray-500">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        {/* Card chứa form */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <main>
            <ClientOnly>{children}</ClientOnly>
          </main>
        </div>

        {/* Footer nhỏ */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} MyCompany. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
