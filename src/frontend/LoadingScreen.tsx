import React from "react";

interface LoadingScreenProps {
  hidden: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ hidden }) => {
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
          {/* Add more loading content as needed */}
        </div>
      )}
    </>
  );
};

export default LoadingScreen;
