import { Outlet } from 'react-router-dom';
import { ActivitySquare } from 'lucide-react';

function PublicLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex flex-col justify-center items-center w-full px-4 py-12">
        <div className="mb-8 flex flex-col items-center">
          <ActivitySquare className="h-12 w-12 text-primary mb-2" />
          <h1 className="text-2xl font-bold text-center">
            Radiologisches Terminbuchungssystem
          </h1>
        </div>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default PublicLayout;