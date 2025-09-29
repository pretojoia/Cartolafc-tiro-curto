import React, { useMemo } from 'react';
import type { ProcessedPlayer } from '../types';
import Card from './Card';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DashboardChartsProps {
    players: ProcessedPlayer[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-700/90 p-4 rounded-lg border border-gray-600 shadow-xl text-white">
        <p className="font-bold text-base mb-2">{data.nome}</p>
        <p className="text-sm text-gray-300 mb-2">{data.time}</p>
        {payload.map((pld: any, index: number) => (
             <p key={index} style={{ color: pld.stroke || pld.fill }} className="font-semibold">{`${pld.name}: ${pld.value.toFixed(2)}`}</p>
        ))}
        <div className="mt-2 pt-2 border-t border-gray-500">
            <p className={`text-sm ${data.potencial > data.media ? 'text-green-400' : 'text-red-400'}`}>
                Diferença: {(data.potencial - data.media).toFixed(2)}
            </p>
        </div>
      </div>
    );
  }
  return null;
};


const DashboardCharts: React.FC<DashboardChartsProps> = ({ players }) => {
    const chartData = useMemo(() => {
        return players.slice(0, 15).map(p => ({
            ...p,
            name: p.nome.split(' ')[0], // Use first name for brevity
            pontosExtras: Math.max(0, p.media - p.mediaBasica),
        }));
    }, [players]);

    const averagePotencial = useMemo(() => {
        if (chartData.length === 0) return 0;
        const total = chartData.reduce((sum, p) => sum + p.potencial, 0);
        return total / chartData.length;
    }, [chartData]);

    return (
        <section className="grid md:grid-cols-2 gap-6 mb-8">
            <Card title="Composição da Média dos Jogadores" icon={<i className="fas fa-chart-bar"></i>}>
                <div className="w-full h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            layout="vertical" 
                            data={chartData.slice().reverse()} // Reverse for top player to be at the top
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                width={80} 
                                tick={{ fontSize: 12, fill: '#374151' }} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 140, 66, 0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '15px' }} />
                            <Bar dataKey="mediaBasica" name="Média Básica" stackId="a" fill="#4A90E2" radius={[5, 0, 0, 5]} barSize={15} />
                            <Bar dataKey="pontosExtras" name="Pts. Ofensivos (G, A)" stackId="a" fill="#FFA85C" radius={[0, 5, 5, 0]} barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <Card title="Potencial vs. Média (Top 15)" icon={<i className="fas fa-chart-line"></i>} className="bg-gray-800">
                <div className="w-full h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                            data={chartData} 
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                             <defs>
                                <linearGradient id="colorPotencial" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF8C42" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#FF8C42" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.7}/>
                                    <stop offset="95%" stopColor="#4A90E2" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#A0AEC0' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#A0AEC0' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FF8C42', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '15px', color: '#E2E8F0' }}/>
                            <ReferenceLine y={averagePotencial} label={{ value: `Média Pot. ${averagePotencial.toFixed(2)}`, position: 'insideTopLeft', fill: '#A0AEC0', fontSize: 10 }} stroke="#A0AEC0" strokeDasharray="4 4" />
                            <Area 
                                type="monotone" 
                                dataKey="potencial" 
                                name="Potencial" 
                                stroke="#FF8C42" 
                                strokeWidth={3} 
                                fill="url(#colorPotencial)" 
                                dot={{ stroke: '#FF8C42', strokeWidth: 2, fill: '#1A202C', r: 4 }}
                                activeDot={{ r: 6, fill: '#FF8C42' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="media" 
                                name="Média" 
                                stroke="#4A90E2" 
                                strokeWidth={2} 
                                fill="url(#colorMedia)"
                                dot={{ stroke: '#4A90E2', strokeWidth: 1, fill: '#1A202C', r: 3 }}
                                activeDot={{ r: 5, fill: '#4A90E2' }}
                             />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </section>
    );
};

export default DashboardCharts;