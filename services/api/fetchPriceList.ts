interface PriceRange {
  price_group_step: number;
  from_quantity: number;
  to_quantity: number;
  base_price: number;
  unit_price: number;
  discounts: {
    sale_id: number;
    sale: number;
    sale_remark: string;
    membership: number;
  };
  remark: string;
}

interface ProductPrice {
  catalogue_code: string;
  price_group: number;
  title: string;
  invoice_name: string;
  product_type: number;
  category: number;
  format: number;
  material: number;
  cover: number;
  theme: number;
  pages: number;
  feature: string;
  design: string;
  makat: string;
  remark: string | null;
  price_ranges: PriceRange[];
  relevant_accessories: unknown;
}

import { trackApiError } from '@/utils/datadogErrorTracking';
import { env } from '@/config/env';

export interface PriceListResponse {
  payload: {
    products: ProductPrice[];
  };
}

/**
 * Fetch price list from API
 */
export const fetchPriceList = async (): Promise<PriceListResponse> => {
  try {
    const response = await fetch(`${env.PRICELIST_URL}/1/0`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    trackApiError(error as Error, 'pricelist', {
      statusCode: (error as { status?: number })?.status,
    });
    throw error;
  }
};
