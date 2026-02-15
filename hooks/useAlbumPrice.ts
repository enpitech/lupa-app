import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAlbumStore from '@/stores/album';
import useAlbumTreeStore from '@/stores/albumTree';
import { eventTypeEnum } from '@/utils/appConst';
import { fetchPriceList } from '@/services/api/fetchPriceList';

// Format mapping from client format to server format index
const FORMAT_MAPPING: Record<string, number> = {
  square_big: 35,
  square_large: 35,
  square: 27,
  panoramic: 26,
  classic: 6,
  mini_lupa: 38,
};

//Extract base format from format string (removes _layflat, _normal suffixes)
function getBaseFormat(format: string): string {
  // Remove suffixes like _layflat, _normal
  return format.replace(/_layflat$|_normal$/, '');
}

/**
 * Calculates the number of billable pages for pricing, excluding prolog/epilog based on album type.
 *
 * Business Rules:
 * - Layflat albums: Always subtract prolog/epilog spreads (they are included/free)
 *   Each prolog/epilog = 1 spread deduction
 *
 * - Normal albums: Special pricing logic
 *   - If BOTH prolog AND epilog exist: Charge for all pages (no deduction)
 *   - Otherwise: Subtract individual pages (1 page each for prolog/epilog if they exist)
 */
function calcPageToPay(
  totalPages: number,
  existProlog: boolean | undefined,
  existEpilog: boolean | undefined,
  isLayflat: boolean
): number {
  if (isLayflat) {
    // Layflat: Subtract 1 spread for each prolog/epilog (they're included)
    return totalPages - (existProlog ? 1 : 0) - (existEpilog ? 1 : 0);
  } else {
    // Normal albums: Special case - if both prolog and epilog exist, charge full price
    if (existProlog && existEpilog) {
      return totalPages;
    }
    // Otherwise, subtract individual pages for prolog/epilog
    return totalPages - (existProlog ? 1 : 0) - (existEpilog ? 1 : 0);
  }
}

//Constructs the catalogue code for price lookup
function buildCatalogueCode(
  format: string,
  isLayflat: boolean,
  pages: number,
  eventType: string
): string | null {
  const baseFormat = getBaseFormat(format);
  const formatIndex = FORMAT_MAPPING[baseFormat];

  if (!formatIndex) {
    console.warn(`Unknown album format: ${format} (base: ${baseFormat})`);
    return null;
  }

  // Cover code: 0 = hard cover (normal), 5 = layflat
  const coverCode = isLayflat ? 5 : 0;

  const parts = [
    '0',
    formatIndex.toString(),
    coverCode.toString(),
    'n',
    'n',
    'n',
    'n',
    pages.toString(),
  ];

  // Add suffix for special book types
  if (eventType === eventTypeEnum.HAGGADAH) {
    parts.push('2');
  } else if (eventType === eventTypeEnum.SQUARE_600) {
    parts.push('4');
  }

  return parts.join('_');
}

//fetching and calculating album price information
export const useAlbumPrice = () => {
  const album = useAlbumStore((state) => state.album);
  const isLayflat = useAlbumTreeStore((state) => state.isLayflat);
  const totalPages = useAlbumTreeStore((state) => state.totalPages);
  const existEpilog = useAlbumStore((state) => state.album?.existEpilog);
  const existProlog = useAlbumStore((state) => state.album?.existProlog);

  // Generate catalogue code based on album properties
  const catalogueCode = useMemo(() => {
    if (!album?.format || !totalPages) {
      return null;
    }
    const pagesToPay = calcPageToPay(
      totalPages,
      existProlog,
      existEpilog,
      isLayflat
    );
    const code = buildCatalogueCode(
      album.format,
      isLayflat,
      pagesToPay,
      album.event_type || eventTypeEnum.REGULAR
    );

    return code;
  }, [album?.format, album?.event_type, isLayflat, totalPages]);

  const getHours = (hours: number) => hours * 60 * 60 * 1000;

  // Price data rarely changes, so we cache for longer periods
  const {
    data: priceListData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['price-list'],
    queryFn: fetchPriceList,
    staleTime: getHours(4),
    gcTime: getHours(24),
  });

  // Find the specific product price for our catalogue code using useMemo to memoize results
  const priceData = useMemo(() => {
    if (!catalogueCode || !priceListData?.payload?.products) {
      return null;
    }

    const foundProduct = priceListData.payload.products.find(
      (product) => product.catalogue_code === catalogueCode
    );

    return foundProduct || null;
  }, [catalogueCode, priceListData]);

  // Format price string for display
  const formattedPrice = useMemo(() => {
    if (!priceData?.price_ranges?.[0]) {
      return null;
    }

    const priceRange = priceData.price_ranges[0];
    const finalPrice = priceRange.unit_price;
    const originalPrice = priceRange.base_price;
    const hasDiscount = finalPrice < originalPrice;

    if (hasDiscount) {
      return {
        currentPrice: `₪${finalPrice.toFixed(0)}`,
        originalPrice: `₪${originalPrice.toFixed(0)}`,
        hasDiscount: true,
      };
    }

    return {
      currentPrice: `₪${finalPrice.toFixed(0)}`,
      hasDiscount: false,
    };
  }, [priceData]);

  return {
    priceData,
    formattedPrice,
    loading: isLoading,
    error: error ? 'Failed to fetch price information' : null,
    catalogueCode,
  };
};
