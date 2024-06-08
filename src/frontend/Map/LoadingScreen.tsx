import React from "react";

/**
 * The loading screen component
 * @param hidden if the screen should be hidden
 */
export default function LoadingScreen({hidden}) {
  return (
    <>
      {!hidden && (
        <div
          id="loading-screen"
          className="w-[100vw] h-[50vh] fixed top-0 left-0 z-50"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 99,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          <img src="/LoadingScreenAssets/BusStatic.svg" className="absolute left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-auto" alt="A bus with animated rolling wheels"/>
          <img src="/LoadingScreenAssets/Wheel.svg" className="rotate-wheel absolute left-[39.35%] top-[54%] w-[5.3%] h-auto" alt="A rolling wheel"/>
          <img src="/LoadingScreenAssets/Wheel.svg" className="rotate-wheel absolute left-[66%] top-[53.5%] transform w-[5.3%] h-auto" alt="A rolling wheel"/>
          

        </div>
      )}
    </>
  );
};
