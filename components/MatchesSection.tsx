import React from 'react';
import type { Match, ClubsMap } from '../types';
import Card from './Card';

interface MatchesSectionProps {
    matches: Match[];
    clubs: ClubsMap;
    onMatchClick: (match: Match) => void;
}

const MatchesSection: React.FC<MatchesSectionProps> = ({ matches, clubs, onMatchClick }) => {
    if (!matches.length || !Object.keys(clubs).length) {
        return null;
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleString('pt-BR', options).replace(',', ' -');
    };

    return (
        <Card title="Jogos da Rodada" icon={<i className="fas fa-calendar-alt"></i>} className="mb-8">
            <div className="space-y-4">
                {matches.map((match, index) => {
                    const homeTeam = clubs[match.clube_casa_id];
                    const awayTeam = clubs[match.clube_visitante_id];

                    if (!homeTeam || !awayTeam) return null;

                    return (
                        <div 
                            key={index} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => onMatchClick(match)}
                        >
                            <div className="flex items-center gap-3 w-2/5 justify-end">
                                <span className="font-bold text-right hidden sm:inline">{homeTeam.nome}</span>
                                <span className="font-bold text-right sm:hidden">{homeTeam.abreviacao}</span>
                                <img src={homeTeam.escudos['30x30']} alt={homeTeam.nome} className="w-8 h-8 object-contain"/>
                            </div>
                            <div className="text-center text-gray-700 font-mono px-2">
                                <span className="font-bold text-lg">vs</span>
                                <div className="text-xs text-gray-500 whitespace-nowrap">{formatDate(match.partida_data)}</div>
                            </div>
                             <div className="flex items-center gap-3 w-2/5">
                                <img src={awayTeam.escudos['30x30']} alt={awayTeam.nome} className="w-8 h-8 object-contain"/>
                                 <span className="font-bold text-left hidden sm:inline">{awayTeam.nome}</span>
                                 <span className="font-bold text-left sm:hidden">{awayTeam.abreviacao}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default MatchesSection;