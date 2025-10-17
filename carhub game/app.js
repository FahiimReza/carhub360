function App() {
    const [showRewardPopup, setShowRewardPopup] = React.useState(false);
    const [rewardCode, setRewardCode] = React.useState('');

    const games = [
        {
            id: 'spin',
            icon: '🎰',
            title: 'Spin the Wheel',
            tagline: 'Test your luck with our lucky wheel and win instant rewards!',
            page: 'spin.html'
        },
        {
            id: 'scratch',
            icon: '🎫',
            title: 'Scratch Card',
            tagline: 'Scratch and reveal hidden treasures and discount codes!',
            page: 'scratch.html'
        }
    ];

    const handleGameClick = (game) => {
        window.location.href = game.page;
    };

    const showReward = (code) => {
        setRewardCode(code);
        setShowRewardPopup(true);
        saveReward(code);
    };

    const hideReward = () => {
        setShowRewardPopup(false);
    };

    return (
        <div className="games-section" data-name="games-section" data-file="app.js">
            <div className="section-header">
                <h1 className="section-title">🎯 Play & Earn – The CarHub360 Fun Zone</h1>
                <p className="section-subtitle">
                    Play games, win rewards! Earn exclusive CarHub360 coupons by testing your luck and skills.
                </p>
            </div>

            <div className="games-grid">
                {games.map(game => (
                    <GameCard
                        key={game.id}
                        game={game}
                        onClick={() => handleGameClick(game)}
                    />
                ))}
            </div>

            {showRewardPopup && (
                <RewardPopup 
                    code={rewardCode}
                    onClose={hideReward}
                />
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);