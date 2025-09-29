import React from 'react';
import type { ProcessedPlayer } from '../types';
import { Position } from '../types';

const PositionBadge: React.FC<{ position: Position }> = ({ position }) => {
    const baseClasses = "inline-block px-3 py-1 text-xs font-bold text-white rounded-full uppercase";
    const positionClasses: Record<Position, string> = {
        [Position.GOL]: "bg-gradient-to-r from-yellow-500 to-amber-500",
        [Position.LAT]: "bg-gradient-to-r from-cyan-500 to-blue-500",
        [Position.ZAG]: "bg-gradient-to-r from-indigo-500 to-purple-500",
        [Position.MEI]: "bg-gradient-to-r from-green-500 to-emerald-500",
        [Position.ATA]: "bg-gradient-to-r from-rose-500 to-pink-500",
        [Position.TEC]: "bg-gradient-to-r from-gray-500 to-slate-500",
    };
    return <span className={`${baseClasses} ${positionClasses[position]}`}>{position}</span>;
};

const ScoutStat: React.FC<{ icon: string; label: string; value: number | string; colorClass?: string }> = ({ icon, label, value, colorClass = 'text-gray-800' }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm text-center">
        <i className={`fas ${icon} text-2xl mb-2 ${colorClass}`}></i>
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
    </div>
);

const PlayerScoutDetail: React.FC<{ player: ProcessedPlayer }> = ({ player }) => {
    return (
        <div className="p-2">
            <header className="flex flex-col sm:flex-row items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <img src={player.timeEscudo.replace('30x30', '60x60')} alt={player.time} className="w-16 h-16 object-contain" />
                <div className="text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-gray-800">{player.nome}</h2>
                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
                        <span className="text-gray-600 font-medium">{player.time}</span>
                        <PositionBadge position={player.posicao} />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* General Stats */}
                <ScoutStat icon="fa-chart-line" label="Potencial" value={player.potencial.toFixed(2)} colorClass="text-[#FF8C42]" />
                <ScoutStat icon="fa-star" label="Média" value={player.media.toFixed(2)} colorClass="text-blue-500" />
                <ScoutStat icon="fa-running" label="Jogos" value={player.jogos} colorClass="text-purple-500" />
                 <ScoutStat icon="fa-calculator" label="Média Básica" value={player.mediaBasica.toFixed(2)} colorClass="text-indigo-500" />

                {/* Positive Scouts */}
                <ScoutStat icon="fa-futbol" label="Gols" value={player.gols} colorClass="text-green-600" />
                <ScoutStat icon="fa-hands-helping" label="Assistências" value={player.assistencias} colorClass="text-green-600" />
                <ScoutStat icon="fa-shield-alt" label="Desarmes" value={player.desarmes} colorClass="text-green-600" />
                <ScoutStat icon="fa-magnet" label="Roubos de Bola" value={player.roubosDeBola} colorClass="text-green-600" />

                {/* Negative Scouts */}
                <ScoutStat icon="fa-exclamation-triangle" label="Faltas Cometidas" value={player.faltasCometidas} colorClass="text-red-500" />
                <ScoutStat icon="fa-square" label="Cartões Amarelos" value={player.cartoesAmarelos} colorClass="text-yellow-500" />
                <ScoutStat icon="fa-square" label="Cartões Vermelhos" value={player.cartoesVermelhos} colorClass="text-red-600" />
                 <ScoutStat icon="fa-info-circle" label="Status" value={player.status} colorClass="text-gray-600" />
            </div>
        </div>
    );
};

export default PlayerScoutDetail;