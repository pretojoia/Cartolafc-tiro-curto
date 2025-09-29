import React from 'react';
import { Position } from '../types';

interface FiltersProps {
    teams: string[];
    filters: {
        position: string;
        team: string;
        sortBy: string;
    };
    onFilterChange: (filters: { position: string; team: string; sortBy: string; }) => void;
}

const FilterSelect: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}> = ({ label, value, onChange, children }) => (
    <div className="flex flex-col flex-1 min-w-[180px]">
        <label className="mb-2 font-semibold text-[#FF8C42]">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="p-3 rounded-lg border-2 border-[#FFA85C] focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/50 outline-none transition"
        >
            {children}
        </select>
    </div>
);


const Filters: React.FC<FiltersProps> = ({ teams, filters, onFilterChange }) => {
    
    const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, position: e.target.value });
    };

    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, team: e.target.value });
    };

    const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, sortBy: e.target.value });
    };

    return (
        <section className="bg-white/95 p-5 rounded-2xl shadow-lg flex flex-wrap gap-5 my-8">
            <FilterSelect label="Posição" value={filters.position} onChange={handlePositionChange}>
                <option value="all">Todas as Posições</option>
                <option value={Position.GOL}>Goleiro (GOL)</option>
                <option value={Position.LAT}>Lateral (LAT)</option>
                <option value={Position.ZAG}>Zagueiro (ZAG)</option>
                <option value={Position.MEI}>Meia (MEI)</option>
                <option value={Position.ATA}>Atacante (ATA)</option>
                <option value={Position.TEC}>Técnico (TEC)</option>
            </FilterSelect>
            <FilterSelect label="Time" value={filters.team} onChange={handleTeamChange}>
                <option value="all">Todos os Times</option>
                {teams.map(team => <option key={team} value={team}>{team}</option>)}
            </FilterSelect>
            <FilterSelect label="Ordenar por" value={filters.sortBy} onChange={handleSortByChange}>
                <option value="potencial">Potencial</option>
                <option value="media">Média (Maior para Menor)</option>
                <option value="mediaBasica">Média Básica (Maior para Menor)</option>
                <option value="gols">Gols (Maior para Menor)</option>
                <option value="assistencias">Assistências (Maior para Menor)</option>
                <option value="desarmes">Desarmes (Maior para Menor)</option>
                <option value="nome">Nome (A-Z)</option>
            </FilterSelect>
        </section>
    );
};

export default Filters;