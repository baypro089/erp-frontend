'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@libs/src/store';
import { roleService } from '@libs/src/features/role/role.service';
import type { PermissionCode } from '@libs/shared/constants/permissions.constant';

/**
 * Resolves the current user's permissions from available Redux state sources,
 * falling back to a direct API call when the role is stored only as a code string.
 *
 * Source priority:
 *  1. state.user.currentUser.role.permissions  (populated by fetchUserById in layouts)
 *  2. state.auth.user.role.permissions         (populated after login)
 *  3. API call to /roles/:code                 (when role is stored as a plain code string)
 */
export function usePermissions() {
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [fetchedPermissions, setFetchedPermissions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  // Track which role code we already fetched to avoid duplicate API calls
  const fetchedForRef = useRef<string | null>(null);

  // Extract permissions directly from already-loaded role objects
  const directPermissions = useMemo<string[] | null>(() => {
    if (currentUser?.role?.permissions) {
      return currentUser.role.permissions.map((p) => p.permission_code);
    }
    if (authUser?.role?.permissions) {
      return (authUser.role.permissions as Array<{ permission_code: string }>).map(
        (p) => p.permission_code,
      );
    }
    return null;
  }, [currentUser, authUser]);

  // Determine the role code we need to fetch (only when no direct permissions available)
  const pendingRoleCode = useMemo<string | null>(() => {
    if (directPermissions !== null) return null;
    if (typeof authUser?.role === 'string') return authUser.role;
    return null;
  }, [directPermissions, authUser]);

  useEffect(() => {
    if (!pendingRoleCode || fetchedForRef.current === pendingRoleCode) return;
    fetchedForRef.current = pendingRoleCode;
    setLoading(true);
    roleService
      .getRoleByCode(pendingRoleCode)
      .then((role) => {
        setFetchedPermissions(role.permissions?.map((p) => p.permission_code) ?? []);
      })
      .catch(() => setFetchedPermissions([]))
      .finally(() => setLoading(false));
  }, [pendingRoleCode]);

  const permissions = useMemo<string[]>(() => {
    if (directPermissions !== null) return directPermissions;
    return fetchedPermissions ?? [];
  }, [directPermissions, fetchedPermissions]);

  /** Returns true if the user holds the given permission code. */
  const hasPermission = (permission: PermissionCode | string): boolean =>
    permissions.includes(permission);

  /** Returns true if the user holds at least one of the given permission codes. */
  const hasAnyPermission = (perms: (PermissionCode | string)[]): boolean =>
    perms.some((p) => permissions.includes(p));

  /** Returns true only if the user holds every one of the given permission codes. */
  const hasAllPermissions = (perms: (PermissionCode | string)[]): boolean =>
    perms.every((p) => permissions.includes(p));

  const isLoading = loading && directPermissions === null && fetchedPermissions === null;

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions, loading: isLoading };
}
