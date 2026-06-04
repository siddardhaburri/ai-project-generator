import React from 'react';

export default function RunningRobot() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, width: '100%',
      height: '90px', overflow: 'hidden', pointerEvents: 'none', zIndex: 999
    }}>
      <style>{`
        @keyframes runLR { 0%{transform:translateX(-100px)} 45%{transform:translateX(calc(100vw + 20px))} 46%{transform:translateX(calc(100vw + 20px)) scaleX(-1)} 100%{transform:translateX(-100px) scaleX(-1)} }
        @keyframes bobBody { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes legFL { 0%,100%{transform:rotate(30deg)} 50%{transform:rotate(-30deg)} }
        @keyframes legBL { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)} }
        @keyframes armFL { 0%,100%{transform:rotate(-25deg)} 50%{transform:rotate(25deg)} }
        @keyframes armBL { 0%,100%{transform:rotate(25deg)} 50%{transform:rotate(-25deg)} }
        @keyframes eyeBlink { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.1)} }
        @keyframes antennaPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes dust { 0%{opacity:0.7;transform:scale(0.5)} 100%{opacity:0;transform:scale(2) translateY(8px)} }
      `}</style>
      <svg viewBox="0 0 80 80" width="80" height="80"
        style={{ position:'absolute', bottom:'6px', left:0, animation:'runLR 3.2s linear infinite' }}>
        {/* paste the full SVG contents from above */}
      </svg>
    </div>
  );
}