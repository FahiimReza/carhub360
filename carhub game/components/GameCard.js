function GameCard({ game, onClick }) {
    try {
        return (
            <div 
                className="game-card" 
                onClick={onClick}
                data-name="game-card" 
                data-file="components/GameCard.js"
            >
                <div className="game-icon">{game.icon}</div>
                <h3 className="game-title">{game.title}</h3>
                <p className="game-tagline">{game.tagline}</p>
                <button className="play-btn">
                    Play Now
                </button>
            </div>
        );
    } catch (error) {
        console.error('GameCard component error:', error);
        return null;
    }
}