import React from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings = () => {
  return (
    <div>
      <Header title="Paramètres" />
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Informations du restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <SettingsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Page paramètres - À venir en Phase 2</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
