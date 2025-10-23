import { PRIORITY_OPTIONS } from '../../types/load';

interface Driver {
  id: string;
  displayName: string;
  email: string;
  role: string;
}

interface LoadAssignmentProps {
  assignedDriverId?: string;
  priority: 'low' | 'normal' | 'high';
  notes?: string;
  drivers: Driver[];
  onDriverChange: (driverId: string) => void;
  onPriorityChange: (priority: 'low' | 'normal' | 'high') => void;
  onNotesChange: (notes: string) => void;
}

export default function LoadAssignment({
  assignedDriverId,
  priority,
  notes,
  drivers,
  onDriverChange,
  onPriorityChange,
  onNotesChange
}: LoadAssignmentProps) {
  return (
    <>
      {/* Assignment and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to Driver (Optional)</label>
          <select
            value={assignedDriverId}
            onChange={(e) => onDriverChange(e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
          >
            <option value="">Unassigned (Pending)</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>
                {driver.displayName} ({driver.email})
              </option>
            ))}
          </select>
          {drivers.length === 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No drivers available. Create driver accounts in the Users page.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as 'low' | 'normal' | 'high')}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
          >
            {PRIORITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Special Instructions/Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
          placeholder="Any special delivery instructions, access codes, etc."
        />
      </div>
    </>
  );
}