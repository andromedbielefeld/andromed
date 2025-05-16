import { useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureCaptureProps {
  onSubmit: (signatureData: string) => void;
  onBack: () => void;
}

function SignatureCapture({ onSubmit, onBack }: SignatureCaptureProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    signatureRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSubmit = () => {
    if (signatureRef.current && !isEmpty) {
      const signatureData = signatureRef.current.toDataURL();
      onSubmit(signatureData);
    }
  };

  return (
    <div className="animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Zurück
      </button>
      
      <h2 className="text-xl font-semibold mb-6">
        Bitte unterschreiben Sie hier
      </h2>

      <p className="text-muted-foreground mb-6">
        Mit Ihrer Unterschrift bestätigen Sie die Richtigkeit der angegebenen Daten und stimmen der Durchführung der Untersuchung zu.
      </p>

      <div className="border border-border rounded-lg p-4 bg-white">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            className: 'w-full h-64 border border-border rounded-md',
            style: { touchAction: 'none' }
          }}
          onBegin={() => setIsEmpty(false)}
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleClear}
          className="btn btn-outline"
          type="button"
        >
          Löschen
        </button>

        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={isEmpty}
        >
          Unterschrift bestätigen
        </button>
      </div>
    </div>
  );
}

export default SignatureCapture;