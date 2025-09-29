import React from 'react';

interface HeaderProps {
    marketStatus: number | null;
    roundNumber: number | null;
}

const Header: React.FC<HeaderProps> = ({ marketStatus, roundNumber }) => {

    const handleShare = async () => {
        try {
            const response = await fetch('/shareable.html');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const htmlContent = await response.text();
            const file = new File([htmlContent], 'cartola-dashboard.html', { type: 'text/html' });

            // Use Web Share API if available and can share files
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Cartola FC Dashboard',
                    text: 'Confira este dashboard interativo do Cartola FC!',
                });
            } else {
                // Fallback to download for desktop or unsupported mobile browsers
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'cartola-dashboard.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            // Don't show an alert if the user cancels the share dialog
            if (error instanceof DOMException && error.name === 'AbortError') {
                console.log('Share action was cancelled by the user.');
            } else {
                console.error('Failed to share or download file:', error);
                alert('Não foi possível compartilhar ou baixar o arquivo. Por favor, tente novamente.');
            }
        }
    };

    const marketStatusColor = marketStatus === 1 ? "text-green-600" : "text-red-600";
    const marketStatusIndicator = marketStatus === 1 ? "bg-green-500" : "bg-red-500";


    return (
        <header className="text-center p-8 mb-8 bg-white rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FF8C42] to-[#FFA85C]"></div>
            
            <button 
                onClick={handleShare}
                title="Compartilhar ou baixar o dashboard"
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-[#FF8C42] font-bold p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center w-12 h-12"
                aria-label="Compartilhar dashboard"
            >
                <i className="fas fa-share-alt text-xl"></i>
            </button>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-gray-800 uppercase tracking-wide">
                CARTOLA FC - TIMES TIRO CURTO VERSÃO <span className="text-[#FF8C42]">(BETA)</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium">
                Dashboard com análise dos melhores jogadores e Times Para TIRO CURTO
            </p>
            {marketStatus !== null && roundNumber !== null && (
                 <div className="mt-4 flex items-center justify-center gap-2 text-lg">
                    <span className={`relative flex h-3 w-3`}>
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${marketStatusIndicator} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${marketStatusIndicator}`}></span>
                    </span>
                    <span className={`font-bold ${marketStatusColor}`}>
                        {marketStatus === 1
                            ? `Mercado Aberto para a Rodada ${roundNumber}`
                            : `Mercado Fechado (Rodada ${roundNumber} em andamento)`}
                    </span>
                </div>
            )}
        </header>
    );
};

export default Header;