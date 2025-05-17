import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/dashboard/_dashboardLayout/visualization',
)({  
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Visualize Your Report</h1>
      
      <div className="bg-gradient-to-b from-white to-pink-50/80 rounded-xl shadow-md p-8 border border-gray-100">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold text-primary-magenta mb-8">UPLOAD PDF</h2>
          
          <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center mb-6">
            {/* Cloud Upload Icon */}
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            
            <h3 className="text-xl font-medium text-primary-magenta mb-2">Drag & Drop</h3>
            <p className="text-gray-500 text-center mb-4">Upload your PDF for visualization</p>
            
            <input 
              type="file" 
              className="hidden" 
              id="pdf-upload" 
              accept=".pdf" 
            />
            <label 
              htmlFor="pdf-upload" 
              className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
            >
              Browse files
            </label>
          </div>
          
          <button 
            className="bg-primary-magenta text-white py-3 px-12 rounded-full hover:bg-opacity-90 transition-colors font-medium shadow-sm"
          >
            Visualize
          </button>
        </div>
      </div>
    </div>
  )
}
