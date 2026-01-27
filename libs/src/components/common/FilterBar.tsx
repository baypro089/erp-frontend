'use client';

import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Paper,
  Collapse,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useState } from 'react';

export interface SearchField {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
  icon?: React.ReactNode;
}

export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'daterange';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  value?: any;
}

export interface FilterBarProps {
  searchFields?: SearchField[];
  onSearchChange?: (fieldId: string, value: string) => void;
  filters?: FilterOption[];
  onFilterChange?: (filterId: string, value: any) => void;
  onClearFilters?: () => void;
  activeFiltersCount?: number;
  showFilterButton?: boolean;
}

export default function FilterBar({
  searchFields = [],
  onSearchChange,
  filters = [],
  onFilterChange,
  onClearFilters,
  activeFiltersCount = 0,
  showFilterButton = true,
}: FilterBarProps) {
  const theme = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (fieldId: string, value: string) => {
    onSearchChange?.(fieldId, value);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    onFilterChange?.(filterId, value);
  };

  const handleClearSearch = (fieldId: string) => {
    onSearchChange?.(fieldId, '');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const hasActiveSearches = searchFields.some(field => field.value && field.value.length > 0);
  const hasActiveFilters = activeFiltersCount > 0 || hasActiveSearches;

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        {/* Search Fields */}
        {searchFields.length > 0 && (
          <Stack
            direction="column"
            spacing={2}
            flexWrap="wrap"
            sx={{
              mb: filters.length > 0 || showFilterButton ? 2 : 0,
              '& > *': {
                minWidth: 250,
                flex: '1 1 auto',
              },
            }}
          >
            {searchFields.map((field) => (
              <TextField
                key={field.id}
                fullWidth
                size="small"
                label={field.label}
                placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`}
                value={field.value || ''}
                onChange={(e) => handleSearchChange(field.id, e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {field.icon || <SearchIcon color="action" />}
                    </InputAdornment>
                  ),
                  endAdornment: field.value && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleClearSearch(field.id)}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ))}
          </Stack>
        )}

        {/* Filter Actions Bar */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            {showFilterButton && filters.length > 0 && (
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterListIcon />}
                onClick={toggleFilters}
                endIcon={
                  activeFiltersCount > 0 ? (
                    <Chip
                      label={activeFiltersCount}
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                  ) : null
                }
              >
                Filters
              </Button>
            )}
            {hasActiveFilters && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CloseIcon />}
                onClick={onClearFilters}
              >
                Clear All
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Advanced Filters */}
        {filters.length > 0 && (
          <Collapse in={showFilters}>
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Stack
                direction="column"
                spacing={2}
                flexWrap="wrap"
                sx={{
                  '& > *': {
                    minWidth: 200,
                    flex: '1 1 auto',
                  },
                }}
              >
                {filters.map((filter) => {
                  if (filter.type === 'select') {
                    return (
                      <FormControl key={filter.id} size="small" fullWidth>
                        <InputLabel>{filter.label}</InputLabel>
                        <Select
                          value={filter.value || ''}
                          onChange={(e: SelectChangeEvent) =>
                            handleFilterChange(filter.id, e.target.value)
                          }
                          label={filter.label}
                        >
                          <MenuItem value="">
                            <em>All</em>
                          </MenuItem>
                          {filter.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  }

                  if (filter.type === 'date') {
                    return (
                      <TextField
                        key={filter.id}
                        size="small"
                        type="date"
                        label={filter.label}
                        value={filter.value || ''}
                        onChange={(e) =>
                          handleFilterChange(filter.id, e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    );
                  }

                  return (
                    <TextField
                      key={filter.id}
                      size="small"
                      label={filter.label}
                      placeholder={filter.placeholder}
                      value={filter.value || ''}
                      onChange={(e) =>
                        handleFilterChange(filter.id, e.target.value)
                      }
                      fullWidth
                    />
                  );
                })}
              </Stack>
            </Box>
          </Collapse>
        )}
      </Paper>
    </Box>
  );
}
