import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Trip } from '../types';
import { useMemo } from 'react';

interface EarningsChartProps {
  trips: Trip[];
}

export function EarningsChart({ trips }: EarningsChartProps) {
  const data = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return {
        date: d.toISOString().split('T')[0],
        dayName: days[d.getDay()],
        earnings: 0,
      };
    });

    trips.forEach(trip => {
      const tripDate = trip.date;
      const dayData = last7Days.find(d => d.date === tripDate);
      if (dayData) {
        dayData.earnings += trip.type === 'income' ? trip.earnings : -trip.earnings;
      }
    });

    return last7Days;
  }, [trips]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="dayName" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#141414', 
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#10b981' }}
          />
          <Area 
            type="monotone" 
            dataKey="earnings" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorEarnings)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
