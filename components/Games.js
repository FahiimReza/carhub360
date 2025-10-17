function Games() {
  try {
    const [selectedGame, setSelectedGame] = React.useState(null);
    
    const games = [
      {
        id: 1,
        title: 'Car Memory Game',
        description: 'Match pairs of car emojis to test your memory!',
        type: 'iframe',
        src: 'games/memory-game.html',
        icon: '🧠'
      },
      {
        id: 2,
        title: 'Car Racing Game',
        description: 'Race through traffic and avoid obstacles to score points!',
        type: 'iframe',
        src: 'games/racing-game.html',
        icon: '🏁'
      }
    ];

    return (
      <section className="py-24 px-6 bg-gradient-to-br from-[var(--secondary-color)]/30 via-[var(--bg-secondary)] to-[var(--primary-color)]/10" data-name="games" data-file="components/Games.js">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] mb-6">
              <span className="text-4xl">🎮</span>
            </div>
            <h2 className="text-5xl font-bold text-[var(--text-primary)] mb-6 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent">
              Play Interactive Games
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              Take a break from your busy schedule and enjoy our exciting collection of games! Play fun mini-games, earn rewards, and collect exclusive coupons for your next car rental or purchase
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {games.map((game, index) => (
              <div
                key={game.id}
                className="group relative glass-card p-8 hover-lift hover-glow animate-slide-up border border-[var(--primary-color)]/20 overflow-hidden"
                style={{ animationDelay: `${index * 0.2}s` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                }}
              >
                {/* Background Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/5 to-[var(--secondary-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Game Header */}
                <div className="relative z-10 flex items-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{game.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition-colors duration-300">{game.title}</h3>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                      <span className="text-sm text-[var(--text-secondary)]">Available Now</span>
                    </div>
                  </div>
                </div>

                {/* Game Description */}
                <p className="relative z-10 text-[var(--text-secondary)] mb-8 leading-relaxed text-lg">
                  {game.description}
                </p>

                {/* Game Container */}
                <div className="relative z-10 game-container mb-8">
                  <div className="iframe-wrapper relative overflow-hidden rounded-2xl border-2 border-[var(--primary-color)]/30 shadow-2xl" style={{
                    height: '300px',
                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
                  }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-color)]/10 to-transparent pointer-events-none"></div>
                    <iframe
                      data-game-id={game.id}
                      src={game.src}
                      title={game.title}
                      className="w-full h-full"
                      style={{
                        border: 'none',
                        borderRadius: '14px'
                      }}
                      frameBorder="0"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Game Controls */}
                <div className="relative z-10 flex flex-col sm:flex-row gap-3">
                  <button
                    className="flex-1 btn-primary text-base font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedGame(game)}
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-2">🎮</span>
                      Play Fullscreen
                    </span>
                  </button>
                  <button
                    className="flex-1 btn-secondary text-base font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                    onClick={() => {
                      const iframe = document.querySelector(`[data-game-id="${game.id}"]`);
                      if (iframe && iframe.contentWindow) {
                        // Try to refresh the iframe content
                        iframe.src = iframe.src;
                      }
                    }}
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-2">🔄</span>
                      Restart
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-20">
            <div className="glass-card p-10 max-w-3xl mx-auto border border-[var(--primary-color)]/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/5 to-[var(--secondary-color)]/5"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-6 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent">
                  Enjoying Our Games?
                </h3>
                <p className="text-[var(--text-secondary)] mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
                  Take a break from browsing and have some fun! More exciting games and challenges are coming soon to enhance your CarHub360 experience.
                </p>
                <button
                  className="btn-primary text-lg font-semibold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    // Scroll to the top of the page where the car listings are
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }}
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-3">🚗</span>
                    Back to Car Shopping
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Modal */}
        {selectedGame && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedGame(null)}
          >
            <div
              className="glass-card w-full max-w-5xl max-h-[95vh] overflow-hidden border border-[var(--primary-color)]/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-8 border-b border-white/10 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] mr-4">
                    <span className="text-3xl">{selectedGame.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[var(--text-primary)] bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent">{selectedGame.title}</h3>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                      <span className="text-sm text-[var(--text-secondary)]">Fullscreen Mode</span>
                    </div>
                  </div>
                </div>
                <button
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--bg-card)] hover:bg-[var(--primary-color)]/20 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-300 text-2xl"
                  onClick={() => setSelectedGame(null)}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 bg-gradient-to-b from-transparent to-[var(--bg-secondary)]/50">
                <div className="iframe-wrapper relative overflow-hidden rounded-2xl border-2 border-[var(--primary-color)]/30 shadow-2xl" style={{
                  height: 'min(650px, 75vh)',
                  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
                }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-color)]/10 to-transparent pointer-events-none"></div>
                  <iframe
                    src={selectedGame.src}
                    title={selectedGame.title}
                    className="w-full h-full"
                    style={{
                      border: 'none',
                      borderRadius: '14px'
                    }}
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-white/10 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-[var(--text-secondary)] text-lg mb-2">{selectedGame.description}</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    <span className="text-sm text-[var(--text-secondary)]">Game is ready to play</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    className="btn-secondary font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                    onClick={() => {
                      const iframe = document.querySelector('.fixed iframe');
                      if (iframe && iframe.contentWindow) {
                        iframe.src = iframe.src;
                      }
                    }}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">🔄</span>
                      Restart Game
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  } catch (error) {
    console.error('Games component error:', error);
    return null;
  }
}