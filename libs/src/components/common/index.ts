// Export all common components
export { default as DataTable } from './DataTable';
export type { Column, DataTableAction } from './DataTable';

export { default as FormDialog } from './FormDialog';
export type { FormDialogProps } from './FormDialog';

export { default as DeleteConfirmDialog } from './DeleteConfirmDialog';
export type { DeleteConfirmDialogProps } from './DeleteConfirmDialog';

export { default as PageHeader } from './PageHeader';
export type { BreadcrumbItem, PageAction, PageHeaderProps } from './PageHeader';

export { default as FilterBar } from './FilterBar';
export type { FilterOption, FilterBarProps } from './FilterBar';

export { default as StatusChip } from './StatusChip';
export type { StatusType } from './StatusChip';

export { default as EmptyState } from './EmptyState';
export type { EmptyStateType } from './EmptyState';

export { default as LoadingOverlay } from './LoadingOverlay';

export { default as PermissionDeniedDialog } from './PermissionDeniedDialog';
export type { PermissionDeniedDialogProps } from './PermissionDeniedDialog';

export { PermissionGuard } from './PermissionGuard';