import api from '@libs/src/services/api.service';
import type {
  ImportReceiptResponse,
  ImportReceiptTableFilteredAndPaged,
  CreateImportReceiptDto,
} from '@libs/shared/types/import-receipt.type';
import { ReceiptStatus } from '@libs/shared/enums/receipt-status.enum';

class ImportReceiptService {
  private readonly BASE_URL = '/import-receipts';

  // Get all import receipts with filters and pagination
  async getImportReceipts(
    code?: string,
    warehouseId?: string,
    dateFrom?: Date,
    dateTo?: Date,
    totalPriceFrom?: number,
    totalPriceTo?: number,
    status?: ReceiptStatus,
    page?: number,
    pageSize?: number
  ): Promise<ImportReceiptTableFilteredAndPaged> {
    const params: any = {};
    if (code) params.code = code;
    if (warehouseId) params.warehouseId = warehouseId;
    if (dateFrom) params.dateFrom = dateFrom.toISOString();
    if (dateTo) params.dateTo = dateTo.toISOString();
    if (totalPriceFrom !== undefined) params.totalPriceFrom = totalPriceFrom;
    if (totalPriceTo !== undefined) params.totalPriceTo = totalPriceTo;
    if (status) params.status = status;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get import receipt by ID
  async getImportReceiptById(id: string): Promise<ImportReceiptResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Create new import receipt
  async createImportReceipt(data: CreateImportReceiptDto): Promise<ImportReceiptResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }
}

export default new ImportReceiptService();
