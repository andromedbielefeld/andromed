import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useExaminationCategoryStore } from '../../stores/examinationCategoryStore';
import { useInsuranceTypeStore } from '../../stores/insuranceTypeStore';
import InsuranceTypesManager from './settings/InsuranceTypesManager';

function SettingsManager() {
  const [activeTab, setActiveTab] = useState<'examinations' | 'insurance'>('examinations');

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-semibold">Einstellungen</h1>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('examinations')}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'examinations'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Untersuchungstypen
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'insurance'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Versicherungsarten
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'examinations' ? (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Untersuchungstypen verwalten</h2>
            <div className="space-y-6">
              {/* Examination types management content */}
              <div>
                <input
                  type="text"
                  placeholder="Neuen Typ eingeben..."
                  className="input w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <span>CT</span>
                  <div className="flex gap-2">
                    <button className="text-muted-foreground hover:text-foreground">
                      Bearbeiten
                    </button>
                    <button className="text-muted-foreground hover:text-error">
                      Löschen
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <span>MRT</span>
                  <div className="flex gap-2">
                    <button className="text-muted-foreground hover:text-foreground">
                      Bearbeiten
                    </button>
                    <button className="text-muted-foreground hover:text-error">
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <InsuranceTypesManager />
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsManager;