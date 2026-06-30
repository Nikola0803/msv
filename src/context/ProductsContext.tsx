import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { products as MOCK_PRODUCTS, type Product } from '../mocks/products';

interface ProductsState {
  products: Product[];
  loading: boolean;
  fromApi: boolean;
}

const ProductsContext = createContext<ProductsState>({
  products: MOCK_PRODUCTS,
  loading: false,
  fromApi: false,
});

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProductsState>({
    products: MOCK_PRODUCTS,
    loading: true,
    fromApi: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    fetch('/api/products', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data: Product[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setState({ products: data, loading: false, fromApi: true });
        } else {
          setState({ products: MOCK_PRODUCTS, loading: false, fromApi: false });
        }
      })
      .catch(() => {
        setState({ products: MOCK_PRODUCTS, loading: false, fromApi: false });
      })
      .finally(() => clearTimeout(timeout));

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  return <ProductsContext.Provider value={state}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  return useContext(ProductsContext);
}
