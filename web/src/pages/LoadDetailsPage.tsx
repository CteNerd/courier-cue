import { useParams } from 'react-router-dom';

export default function LoadDetailsPage() {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900">Load Details</h2>
        <p className="mt-2 text-gray-600">Load ID: {id}</p>
      </div>
    </div>
  );
}
