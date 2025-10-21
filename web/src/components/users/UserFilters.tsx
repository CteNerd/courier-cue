import { RoleFilter } from '../../types/user';

interface UserFiltersProps {
  selectedRole: RoleFilter;
  setSelectedRole: (role: RoleFilter) => void;
  userCounts: {
    total: number;
    admin: number;
    coAdmin: number;
    driver: number;
  };
}

export default function UserFilters({ selectedRole, setSelectedRole, userCounts }: UserFiltersProps) {
  const filters = [
    { id: 'all' as RoleFilter, name: 'All Users', count: userCounts.total },
    { id: 'admin' as RoleFilter, name: 'Admins', count: userCounts.admin },
    { id: 'co-admin' as RoleFilter, name: 'Co-Admins', count: userCounts.coAdmin },
    { id: 'driver' as RoleFilter, name: 'Drivers', count: userCounts.driver },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedRole(filter.id)}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              selectedRole === filter.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span>{filter.name}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              selectedRole === filter.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}