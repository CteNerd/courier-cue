export interface Trailer {
  trailerId: string;
  trailerNumber: string;
  currentDockId?: string;
  registrationExpiresAt?: string;
  inspectionExpiresAt?: string;
  isRegistrationCurrent: boolean;
  isInspectionCurrent: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'IN_REPAIR';
  compliance?: 'COMPLIANT' | 'NEEDS_UPDATING';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrailerFormData {
  trailerNumber: string;
  currentDockId?: string;
  registrationExpiresAt?: string;
  isRegistrationCurrent: boolean;
  inspectionExpiresAt?: string;
  isInspectionCurrent: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'IN_REPAIR';
}

export function calculateCompliance(trailer: Trailer): 'COMPLIANT' | 'NEEDS_UPDATING' {
  const now = new Date();
  const regExpired = trailer.registrationExpiresAt 
    ? new Date(trailer.registrationExpiresAt) < now 
    : true;
  const inspExpired = trailer.inspectionExpiresAt 
    ? new Date(trailer.inspectionExpiresAt) < now 
    : true;
  
  const compliant = 
    trailer.isRegistrationCurrent && 
    !regExpired && 
    trailer.isInspectionCurrent && 
    !inspExpired;
  
  return compliant ? 'COMPLIANT' : 'NEEDS_UPDATING';
}
