import React, { useState, useEffect } from 'react';
import type { SgTeam } from '../types';
import Modal from './Modal';

interface SgEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: SgTeam[]) => void;
    currentSgData: SgTeam[];
    roundNumber: number;
}

const SgEditModal: React.FC<SgEditModalProps> = ({ isOpen, onClose, onSave, currentSgData, roundNumber }) => {
    
    // Create a simplified state for editing. We only need to store the max probability number.
    const getInitialState = (data: SgTeam[]) => {
        // Correctly map existing data
        const processedData = data.map(item => {
             const probMatch = item.probability.match(/(\d+)%/);
             const probValue = probMatch ? probMatch[1] : '';
             return {
                team: item.team,
                probability: probValue,
                observation: item.observation,
                width: '' // width is calculated on save
             }
        });

        // Add new, unique objects for empty rows to avoid shared state bug
        while (processedData.length < 5) {
            processedData.push({ team: '', probability: '', observation: '', width: '' });
        }

        return processedData.slice(0, 5); // Ensure there are always 5 items
    }

    const [editedData, setEditedData] = useState<SgTeam[]>(getInitialState(currentSgData));
    
    useEffect(() => {
        if (isOpen) {
            setEditedData(getInitialState(currentSgData));
        }
    }, [currentSgData, isOpen]);

    const handleInputChange = (index: number, field: keyof SgTeam, value: string) => {
        const newData = [...editedData];
        newData[index] = { ...newData[index], [field]: value };
        setEditedData(newData);
    };

    const handleSaveClick = () => {
        // Filter out empty rows before saving
        const dataToSave = editedData.filter(item => item.team.trim() !== '' && item.probability.trim() !== '');
        onSave(dataToSave);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Gerenciar Probabilidades de SG - Rodada ${roundNumber}`}
            maxWidth="max-w-3xl"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-12 gap-x-4 px-3 pb-2 border-b font-bold text-gray-500">
                    <div className="col-span-4">Time</div>
                    <div className="col-span-2">Prob. (%)</div>
                    <div className="col-span-6">Observação</div>
                </div>

                {editedData.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-x-4 items-center">
                        <div className="col-span-4">
                            <input
                                type="text"
                                placeholder="Nome do Time"
                                value={item.team}
                                onChange={(e) => handleInputChange(index, 'team', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42]"
                            />
                        </div>
                        <div className="col-span-2">
                             <input
                                type="number"
                                placeholder="Ex: 70"
                                value={item.probability}
                                onChange={(e) => handleInputChange(index, 'probability', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42]"
                            />
                        </div>
                        <div className="col-span-6">
                             <input
                                type="text"
                                placeholder="Ex: Defesa sólida"
                                value={item.observation}
                                onChange={(e) => handleInputChange(index, 'observation', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42]"
                            />
                        </div>
                    </div>
                ))}
            </div>

             <div className="mt-8 flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-300 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSaveClick}
                    className="bg-gradient-to-r from-[#FF8C42] to-[#FFA85C] text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
                >
                    Salvar Alterações
                </button>
            </div>
        </Modal>
    );
};

export default SgEditModal;