import { useRef, useState, useEffect } from 'react';
import SignaturePad from 'react-signature-canvas';
import { loadsApi } from '../lib/api';

interface Location {
  lat: number;
  lng: number;
  accuracy: number;
}

interface SignatureCanvasProps {
  loadId: string;
  shipperName: string;
  onSignatureComplete: (success: boolean) => void;
  onClose: () => void;
}

export default function SignatureCanvas({ 
  loadId, 
  shipperName, 
  onSignatureComplete, 
  onClose 
}: SignatureCanvasProps) {
  const signatureRef = useRef<SignaturePad>(null);
  const [signerName, setSignerName] = useState(shipperName || '');
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requireSignerName = true;

  useEffect(() => {
    // Attempt to get location when component mounts
    captureLocation();
  }, []);

  const captureLocation = () => {
    setIsCapturingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setIsCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsCapturingLocation(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationError(`Location access denied or unavailable: ${error.message}`);
        setIsCapturingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    setError(null);
  };

  const isEmpty = () => {
    return signatureRef.current ? signatureRef.current.isEmpty() : true;
  };

  const handleSubmit = async () => {
    if (isEmpty()) {
      setError('Please provide a signature');
      return;
    }

    if (requireSignerName && !signerName.trim()) {
      setError('Please enter the signer name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert signature to blob
      const canvas = signatureRef.current?.getCanvas();
      if (!canvas) {
        throw new Error('Could not get signature canvas');
      }

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            throw new Error('Could not convert signature to blob');
          }
        }, 'image/png', 0.8);
      });

      // Get presigned URL
      const presignResponse = await loadsApi.getSignaturePresignUrl(loadId);
      
      // Upload signature to S3
      const uploadResponse = await fetch(presignResponse.uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/png',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload signature');
      }

      // Confirm signature with backend
      const confirmData: any = {
        s3Key: presignResponse.s3Key,
        signerName: signerName.trim(),
        signedAt: new Date().toISOString(),
      };

      // Add location if available
      if (location) {
        confirmData.lat = location.lat;
        confirmData.lng = location.lng;
        confirmData.accuracy = location.accuracy;
      }

      await loadsApi.confirmSignature(loadId, confirmData);

      onSignatureComplete(true);
    } catch (err) {
      console.error('Failed to submit signature:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit signature');
      onSignatureComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full h-full md:w-11/12 md:h-5/6 md:rounded-lg md:shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Shipper Signature Required
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Load ID: {loadId}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 space-y-4">
          {/* Signer Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Signer Name {requireSignerName && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter the name of the person signing"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Location Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location Capture
                </h3>
                {isCapturingLocation ? (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    📍 Getting location...
                  </p>
                ) : location ? (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ Location captured (±{Math.round(location.accuracy)}m accuracy)
                  </p>
                ) : (
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    ⚠️ {locationError || 'Location not available'}
                  </p>
                )}
              </div>
              {!isCapturingLocation && !location && (
                <button
                  onClick={captureLocation}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  Retry Location
                </button>
              )}
            </div>
          </div>

          {/* Signature Pad */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Signature
              </h3>
              <button
                onClick={clearSignature}
                disabled={isSubmitting}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                Clear
              </button>
            </div>
            
            <div className="flex-1 bg-white dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
              <SignaturePad
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-full rounded',
                  style: { touchAction: 'none' }
                }}
                backgroundColor="rgb(255, 255, 255)"
                penColor="rgb(0, 0, 0)"
                minWidth={1}
                maxWidth={3}
                velocityFilterWeight={0.7}
                dotSize={0}
              />
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
              Sign above with your finger or stylus
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isEmpty()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Delivery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}