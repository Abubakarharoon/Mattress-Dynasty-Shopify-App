import React, { useEffect, useState } from 'react';
// import { useAuthenticatedFetch } from '../hooks/auth';

export function Topbar() {
  // const fetch = useAuthenticatedFetch();
  // const [productsCount, setProductsCount] = useState(null); // State for product count
  // const [loading, setLoading] = useState(true); // State for loading status
  // const [error, setError] = useState(null); // State for errors

  // useEffect(() => {
  //   const fetchStoreInfo = async () => {
  //     try {
  //       const response = await fetch('/api/products/count', { method: 'GET' });
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch product count');
  //       }
  //       const data = await response.json();
  //       setProductsCount(data.count); // Set the count
  //       setError(null); // Clear any previous errors
  //     } catch (err) {
  //       setError(err.message); // Set the error message
  //     } finally {
  //       setLoading(false); // End loading
  //     }
  //   };

  //   fetchStoreInfo();
  // }, [fetch]);

  return (
    <div>
      <div className="top-baar">
        <div className="logo"></div>
        <div className="linkbar"></div>
        <div className="product-num">
          
   
        </div>
      </div>
    </div>
  );
}
