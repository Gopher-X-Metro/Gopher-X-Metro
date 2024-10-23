import React from "react";

/**
 * Loading screen component
 * @param hidden if the screen should be hidden
 * @returns rendered loading screen component
 */
export default function LoadingScreen({ hidden }) {
  return (
    <>
      {!hidden && (
        <div id="loading-screen" className="fixed w-[100vw] h-[100vh] top-0 left-0 z-50 flex justify-center items-center" style={{backgroundColor: "rgba(255, 255, 255, 0.9)"}}>
          <div className="fixed w-[100vw] h-[50vw]">
            <img src="/LoadingScreenAssets/BusStatic.svg" className="absolute left-[25%] top-[33%] w-[50%] h-auto" alt="A bus with animated rolling wheels" />
            <img src="/LoadingScreenAssets/Wheel.svg" className="rotate-wheel absolute left-[39.35%] top-[54%] w-[5.3%] h-auto" alt="A rolling wheel" />
            <img src="/LoadingScreenAssets/Wheel.svg" className="rotate-wheel absolute left-[66%] top-[53.5%] transform w-[5.3%] h-auto" alt="A rolling wheel" />

            <h1 className="fixed top-[65%] bottom-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-[5vw]	">Loading...</h1>
          </div>
        </div>
      )}
    </>
  );
}