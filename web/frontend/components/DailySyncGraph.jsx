import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';



export function SyncGraph() {
  
  return (
  <>
  <div className="Daily-sinc-main-container">
  <div className="specify-categories">
    <div className="specify-categories-1" id='specify-1'>Inventory</div>
    <div className="specify-categories-1" id='specify-2'>Orders</div>
    <div className="specify-categories-1" id='specify-3'>Fullfillment</div>
  </div>
     <BarChart
      xAxis={[{ scaleType: 'band', data: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }]}
      series={[{ data: [4, 3, 5, 4, 10, 8, 15] }, { data: [1, 6, 3, 4, 20, 5 ,8] }, { data: [2, 5, 6, 10, 7,15,9] }]}
      width={500}
      height={300}
    />
    </div>
  </>
  )
}

