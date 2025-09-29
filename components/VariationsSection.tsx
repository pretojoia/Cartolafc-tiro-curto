import React from 'react';
import type { ProcessedPlayer, FullLineupVariation } from '../types';

interface VariationsSectionProps {
    variations: FullLineupVariation[];
}

const PlayerRow: React.FC<{ player: ProcessedPlayer, showTeam?: boolean }> = ({ player, showTeam = false }) => (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0 text-sm">
        <span className="font-semibold text-gray-800 flex items-center gap-2">
            {player.nome}
            {player.isChosenFromDoubt && (
                <i 
                    className="fas fa-question-circle text-yellow-500" 
                    title="Jogador escalado como Dúvida com maior média"
                ></i>
            )}
            <span className="text-gray-500 font-normal">({player.posicao})</span>
        </span>
        <div className="flex items-center gap-2 text-gray-600">
            {showTeam && (
                 <img src={player.timeEscudo} alt={player.time} className="w-4 h-4 object-contain" />
            )}
           <span>M: {player.media?.toFixed(2) ?? '-'}</span>
        </div>
    </div>
);

const PositionGroup: React.FC<{ title: string; players: ProcessedPlayer[], showTeam?: boolean }> = ({ title, players, showTeam = false }) => (
    <div>
        <h4 className="font-bold text-gray-600 text-sm mt-3 mb-1 uppercase tracking-wider">{title}</h4>
        {players.length > 0 ? (
            players.map(player => <PlayerRow key={player.id} player={player} showTeam={showTeam} />)
        ) : (
            <p className="text-xs text-gray-400 italic">N/A</p>
        )}
    </div>
);


const VariationCard: React.FC<{ variation: FullLineupVariation }> = ({ variation }) => (
    <div className="bg-white/95 rounded-2xl p-5 shadow-lg border-t-4 border-[#FF8C42]">
        <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">{variation.title}</h3>
            <p className="text-sm text-gray-500">{variation.description}</p>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg mb-3">
             <img src={variation.defenseTeam.shield} alt={variation.defenseTeam.name} className="w-8 h-8"/>
             <span className="font-bold text-gray-700">Defesa Fechada: {variation.defenseTeam.name}</span>
        </div>

        <div>
            <PositionGroup title="Goleiro" players={variation.goalkeeper} />
            <PositionGroup title="Defensores" players={variation.defenders} />
            <PositionGroup title="Meio-Campo" players={variation.midfielders} showTeam />
            <PositionGroup title="Ataque" players={variation.attackers} showTeam />
            <PositionGroup title="Técnico" players={variation.coach} />
        </div>
    </div>
);

const VariationsSection: React.FC<VariationsSectionProps> = ({ variations }) => {
    if (!variations || variations.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
                <i className="fas fa-exclamation-triangle text-3xl text-yellow-500 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-700">Não foi possível gerar variações</h3>
                <p className="text-gray-500 mt-2">Verifique se existem jogadores prováveis suficientes para a defesa e o ataque.</p>
            </div>
        )
    }
    
    return (
        <section id="variationsSection">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {variations.map(v => <VariationCard key={v.id} variation={v} />)}
            </div>
        </section>
    );
};

export default VariationsSection;
