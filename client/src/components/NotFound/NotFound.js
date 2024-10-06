import React from 'react';

const NotFound = () => {
  const handleRedirect = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="max-w-md p-4 bg-white rounded shadow-md">
        <h1 className="text-3xl font-bold mb-2">404 Not Found</h1>
        <p className="text-gray-600 mb-4">The page you are looking for does not exist.</p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleRedirect}
        >
          Go back to homepage
        </button>
      </div>
    </div>
  );
};

export default NotFound;