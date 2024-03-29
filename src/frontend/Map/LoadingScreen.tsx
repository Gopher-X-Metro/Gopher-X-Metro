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
          className="w-full"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'red',
            zIndex: 99,
          }}
        >
          <h1>Loading...</h1>
          {/* //TODO:  Add more loading content if needed */}
        </div>
      )}
    </>
  );
};
