
import React from 'react';
import type { SgTeam } from '../types';
import Card from './Card';

interface SgSectionProps {
    sgData: SgTeam[];
    onEdit: () => void;
    isAdmin: boolean;
}

const SgSection: React.FC<SgSectionProps> = ({ sgData, onEdit, isAdmin }) => {
    
    const validData = sgData && sgData.length > 0 ? sgData : [];
    
    const getTopStat = (stat: 'probability' | 'width') => {
        if (validData.length === 0) return 'N/A';
        const values = validData.map(d => parseInt(d[stat], 10) || 0);
        return `${Math.max(...values)}%`;
    }

     const getMinStat = () => {
        if (validData.length === 0) return 'N/A';
        const values = validData.map(d => parseInt(d.width, 10) || 0);
        return `${Math.min(...values)}%`;
    }

    const cardTitle = (
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
                <span className="mr-3 text-lg"><i className="fas fa-shield-alt"></i></span>
                Times com Maior Probabilidade de SG
            </div>
            {isAdmin && (
                <button 
                    onClick={onEdit}
                    className="text-gray-400 hover:text-[#FF8C42] transition-colors p-2 -mr-2"
                    aria-label="Editar dados de SG"
                    title="Gerenciar times com chance de SG"
                >
                    <i className="fas fa-cog"></i>
                </button>
            )}
        </div>
    );

    return (
        <Card title={cardTitle}>
            <div className="overflow-x-auto">
                <table className="w-full min-w-max text-left">
                    <thead >
                        <tr >
                           <th className="p-4 bg-gradient-to-r from-[#FF8C42] to-[#FFA85C] text-white font-semibold rounded-tl-lg">Time</th>
                           <th className="p-4 bg-gradient-to-r from-[#FF8C42] to-[#FFA85C] text-white font-semibold">Probabilidade de Vitória</th>
                           <th className="p-4 bg-gradient-to-r from-[#FF8C42] to-[#FFA85C] text-white font-semibold rounded-tr-lg">Observação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {validData.map((team, index) => (
                            <tr key={index} className="border-b border-orange-100 hover:bg-orange-50/50 transition-colors">
                                <td className="p-4 font-medium">{team.team}</td>
                                <td className="p-4">
                                    <span>{team.probability}</span>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                        <div 
                                            className="bg-gradient-to-r from-green-400 to-lime-500 h-2.5 rounded-full" 
                                            style={{ width: team.width }}>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">{team.observation}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="flex justify-around text-center mt-6">
                <div className="flex-1 p-4">
                    <span className="block text-4xl font-bold text-[#FF8C42]">{getTopStat('width')}</span>
                    <span className="text-sm text-gray-600">Maior Probabilidade</span>
                </div>
                <div className="flex-1 p-4 border-x border-gray-200">
                    <span className="block text-4xl font-bold text-[#FF8C42]">{validData.length}</span>
                    <span className="text-sm text-gray-600">Times Recomendados</span>
                </div>
                <div className="flex-1 p-4">
                    <span className="block text-4xl font-bold text-[#FF8C42]">{getMinStat()}</span>
                    <span className="text-sm text-gray-600">Probabilidade Mínima</span>
                </div>
            </div>
        </Card>
    );
};

export default SgSection;