function RewardPopup({ code, onClose }) {
    try {
        return (
            <div className="reward-popup" data-name="reward-popup" data-file="components/RewardPopup.js">
                <div className="popup-content">
                    <h2 className="popup-title">🎉 Congratulations!</h2>
                    <p>You've won an exclusive CarHub360 coupon!</p>
                    <div className="coupon-code">{code}</div>
                    <p>Use this code at checkout to get your discount!</p>
                    <button className="close-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        );
    } catch (error) {
        console.error('RewardPopup component error:', error);
        return null;
    }
}