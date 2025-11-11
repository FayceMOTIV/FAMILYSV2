import React, { useEffect } from 'react';

const BackOfficeRedirect = () => {
  useEffect(() => {
    // Rediriger vers le back office en ouvrant un nouvel onglet
    const adminUrl = 'http://localhost:3001/admin';
    window.open(adminUrl, '_blank');
    
    // Rediriger vers la page d'accueil après un court délai
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <p className="text-xl text-gray-700">Ouverture du Back Office...</p>
        <p className="text-sm text-gray-500 mt-2">Si rien ne s'ouvre, vérifiez que les popups ne sont pas bloqués</p>
      </div>
    </div>
  );
};

export default BackOfficeRedirect;
