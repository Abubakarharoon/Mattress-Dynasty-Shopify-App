import React, { useState } from 'react';
import { Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [zoom, setZoom] = useState([20, 40]);

  const handleResetZoom = () => {
    setZoom([0, 100]);
  };

  return (
    <div>
      <Button onClick={handleResetZoom}>Reset zoom</Button>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="y1"
            stroke="#8884d8"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="y2"
            stroke="#82ca9d"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const data = [
  { index: 0, y1: 443.28, y2: 153.9 },
  { index: 1, y1: 110.5, y2: 217.8 },
  { index: 2, y1: 175.23, y2: 286.32 },
  { index: 3, y1: 195.97, y2: 325.12 },
  { index: 4, y1: 351.77, y2: 144.58 },
  { index: 5, y1: 43.253, y2: 146.51 },
  { index: 6, y1: 376.34, y2: 309.69 },
  { index: 7, y1: 31.514, y2: 236.38 },
  { index: 8, y1: 231.31, y2: 440.72 },
  { index: 9, y1: 108.04, y2: 20.29 },
  { index: 10, y1: 321.77, y2: 484.17 },
  { index: 11, y1: 120.18, y2: 54.962 },
  { index: 12, y1: 366.2, y2: 418.5 },
  { index: 13, y1: 451.45, y2: 181.32 },
  { index: 14, y1: 294.8, y2: 440.9 },
  { index: 15, y1: 121.83, y2: 273.52 },
  { index: 16, y1: 287.7, y2: 346.7 },
  { index: 17, y1: 134.06, y2: 74.528 },
  { index: 18, y1: 104.5, y2: 150.9 },
  { index: 19, y1: 413.07, y2: 26.483 },
  { index: 20, y1: 74.68, y2: 333.2 },
  { index: 21, y1: 360.6, y2: 422.0 },
  { index: 22, y1: 330.72, y2: 488.06 },
];
