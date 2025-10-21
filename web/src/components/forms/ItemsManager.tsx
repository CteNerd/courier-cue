import { LoadItem, UNIT_OPTIONS } from '../../types/load';

interface ItemsManagerProps {
  items: LoadItem[];
  onItemChange: (index: number, field: keyof LoadItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export default function ItemsManager({ 
  items, 
  onItemChange, 
  onAddItem, 
  onRemoveItem 
}: ItemsManagerProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">Load Items</h4>
        <button
          type="button"
          onClick={onAddItem}
          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
        >
          Add Item
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <input
                type="text"
                required
                value={item.description}
                onChange={(e) => onItemChange(index, 'description', e.target.value)}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                placeholder="Euro pallets, mixed pallets, etc."
              />
            </div>
            <div className="w-20">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qty</label>
              <input
                type="number"
                min="1"
                required
                value={item.qty}
                onChange={(e) => onItemChange(index, 'qty', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
              <select
                value={item.unit}
                onChange={(e) => onItemChange(index, 'unit', e.target.value)}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
              >
                {UNIT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveItem(index)}
                className="text-red-600 hover:text-red-800 pb-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
