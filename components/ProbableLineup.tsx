import React, { useState, useMemo } from 'react';
import type { Match, ClubsMap, ProcessedPlayer } from '../types';
import { Position } from '../types';

const PositionBadge: React.FC<{ position: Position }> = ({ position }) => {
    const baseClasses = "inline-block px-2 py-0.5 text-xs font-bold text-white rounded-full uppercase";
    const positionClasses: Record<Position, string> = {
        'GOL': "bg-yellow-500",
        'LAT': "bg-blue-500",
        'ZAG': "bg-indigo-500",
        'MEI': "bg-green-500",
        'ATA': "bg-red-500",
        'TEC': "bg-gray-500",
    };
    return <span className={`${baseClasses} ${positionClasses[position]}`}>{position}</span>;
};

const PlayerAlternativeRow: React.FC<{ player: ProcessedPlayer }> = ({ player }) => {
    const statusColor: { [key: string]: string } = {
        'Provável': 'text-green-600',
        'Dúvida': 'text-yellow-600',
        'Suspenso': 'text-red-600',
        'Contundido': 'text-red-600',
        'Nulo': 'text-gray-500',
    };
    return (
        <li className="flex items-center justify-between p-2 rounded-md">
            <span className="font-medium text-gray-700">{player.nome}</span>
            <div className="flex items-center gap-3 text-sm">
                <span className={`font-bold ${statusColor[player.status] || 'text-gray-500'}`}>{player.status}</span>
                <span>Média: {player.media.toFixed(2)}</span>
            </div>
        </li>
    );
};

const TeamLineup: React.FC<{ teamId: number; clubs: ClubsMap; players: ProcessedPlayer[] }> = ({ teamId, clubs, players }) => {
    const [focusedPosition, setFocusedPosition] = useState<Position | null>(null);
    const team = clubs[teamId];

    const displayLineup = useMemo(() => {
        const teamPlayers = players.filter(p => p.clubeId === teamId);
    
        // 1. Get all probable and doubt players, with doubts sorted by media
        const provaveis = teamPlayers.filter(p => p.status === 'Provável');
        const duvidas = teamPlayers.filter(p => p.status === 'Dúvida').sort((a, b) => b.media - a.media);
    
        // 2. Find the coach separately
        let lineupCoach = provaveis.find(p => p.posicao === Position.TEC);
        if (!lineupCoach) {
            const doubtCoach = duvidas.find(p => p.posicao === Position.TEC);
            if (doubtCoach) {
                lineupCoach = { ...doubtCoach, isChosenFromDoubt: true };
            }
        }
    
        // 3. Start field lineup with probable players
        let fieldLineup = provaveis.filter(p => p.posicao !== Position.TEC);
        
        // 4. Fill remaining 11 slots with the best doubt players
        const neededPlayers = 11 - fieldLineup.length;
        if (neededPlayers > 0) {
            const doubtFieldPlayers = duvidas.filter(p => p.posicao !== Position.TEC && !lineupCoach || (lineupCoach && p.id !== lineupCoach.id));
            const bestDuvidas = doubtFieldPlayers.slice(0, neededPlayers).map(p => ({ ...p, isChosenFromDoubt: true }));
            fieldLineup.push(...bestDuvidas);
        }
        
        // 5. Combine and sort
        const finalLineup: ProcessedPlayer[] = [...fieldLineup];
        if (lineupCoach) {
            finalLineup.push(lineupCoach);
        }
    
        const posOrder: Record<Position, number> = { [Position.GOL]: 1, [Position.ZAG]: 2, [Position.LAT]: 3, [Position.MEI]: 4, [Position.ATA]: 5, [Position.TEC]: 6 };
        return finalLineup.sort((a, b) => posOrder[a.posicao] - posOrder[b.posicao]);
        
    }, [teamId, players]);
    
    const alternativePlayers = useMemo(() => {
        if (!focusedPosition) return [];
        return players
            .filter(p => p.clubeId === teamId && p.posicao === focusedPosition)
            .sort((a, b) => {
                const statusOrder: { [key: string]: number } = { 'Provável': 1, 'Dúvida': 2 };
                const aStatus = statusOrder[a.status] || 99;
                const bStatus = statusOrder[b.status] || 99;
                if (aStatus !== bStatus) return aStatus - bStatus;
                return b.media - a.media;
            });
    }, [focusedPosition, teamId, players]);

    if (!team) return null;

    if (focusedPosition) {
        return (
            <div className="flex-1">
                 <div className="flex items-center justify-between gap-3 mb-4">
                    <button 
                        onClick={() => setFocusedPosition(null)}
                        className="text-sm font-semibold text-[#FF8C42] hover:text-orange-700 p-2 -ml-2"
                        aria-label="Voltar para a escalação completa"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>Voltar
                    </button>
                    <div className="text-right">
                        <h3 className="text-xl font-bold text-gray-800">{team.nome}</h3>
                        <p className="text-sm font-semibold text-gray-600">Opções para {focusedPosition}</p>
                    </div>
                </div>
                {alternativePlayers.length > 0 ? (
                    <ul className="space-y-1 bg-gray-50 p-2 rounded-lg">
                        {alternativePlayers.map(player => (
                           <PlayerAlternativeRow key={player.id} player={player} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 italic p-4">Nenhum jogador encontrado para esta posição.</p>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-4 p-2 bg-gray-100 rounded-lg">
                <img src={team.escudos['45x45']} alt={team.nome} className="w-10 h-10 object-contain" />
                <h3 className="text-xl font-bold text-gray-800">{team.nome}</h3>
            </div>
            {displayLineup.length > 0 ? (
                <ul className="space-y-2">
                    {displayLineup.map(player => (
                        <li 
                            key={player.id} 
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => setFocusedPosition(player.posicao)}
                            title={`Ver outras opções para ${player.posicao}`}
                        >
                            <span className="font-medium text-gray-700 flex items-center gap-2">
                                {player.nome}
                                {player.isChosenFromDoubt && (
                                    <i className="fas fa-question-circle text-yellow-500" title="Jogador escalado como Dúvida com maior média"></i>
                                )}
                            </span>
                            <PositionBadge position={player.posicao} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 italic p-4">Nenhuma escalação provável disponível.</p>
            )}
        </div>
    );
};

interface ProbableLineupProps {
    match: Match;
    clubs: ClubsMap;
    players: ProcessedPlayer[];
    lastUpdated: Date | null;
}

const ProbableLineup: React.FC<ProbableLineupProps> = ({ match, clubs, players, lastUpdated }) => {
    
    const formatLastUpdated = (date: Date | null) => {
        if (!date) return '';
        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
        return `Atualizado em: ${date.toLocaleDateString('pt-BR', dateOptions)} às ${date.toLocaleTimeString('pt-BR', timeOptions)}`;
    };
    
    return (
        <div>
            {lastUpdated && (
                <div className="text-center mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm text-green-700 bg-green-100 p-2 rounded-lg inline-flex items-center gap-2 shadow-sm">
                        <i className="fas fa-sync-alt fa-spin"></i>
                        <span>{formatLastUpdated(lastUpdated)}</span>
                    </p>
                </div>
            )}
            <div className="flex flex-col md:flex-row gap-8">
                <TeamLineup teamId={match.clube_casa_id} clubs={clubs} players={players} />
                <div className="border-l border-gray-200 hidden md:block mx-2"></div>
                <TeamLineup teamId={match.clube_visitante_id} clubs={clubs} players={players} />
            </div>
        </div>
    );
};

export default ProbableLineup;