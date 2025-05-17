import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dashboard/_dashboardLayout/donate')({  
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Blood Donors Registration Form</h1>
      
      <div className="bg-gradient-to-b from-white to-pink-50/80 rounded-xl shadow-md p-8 border border-gray-100">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Donor's Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Donor's Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter Full Name"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-magenta"
                />
              </div>
              
              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="DD/MM/YYYY"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-magenta"
                />
              </div>
              
              {/* Phone No */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Phone No <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  placeholder="00000 00000"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-magenta"
                />
              </div>
              
              {/* Blood Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Blood Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-magenta appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled>-select-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Any Disability */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Any Disability <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="disability" className="sr-only peer" defaultChecked />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>No</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="disability" className="sr-only peer" />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>Yes</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="gender" className="sr-only peer" defaultChecked />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>Male</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="gender" className="sr-only peer" />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>Female</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="gender" className="sr-only peer" />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>Other</span>
                  </label>
                </div>
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-magenta"
                />
              </div>
              
              {/* ID Proof */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  ID Proof <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="idProof" className="sr-only peer" defaultChecked />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>PAN</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="idProof" className="sr-only peer" />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>Aadhaar</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="idProof" className="sr-only peer" />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>Vote ID</span>
                  </label>
                </div>
              </div>
              
              {/* Weight */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Weight
                </label>
                <input 
                  type="text" 
                  placeholder="weight in Kg's"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-magenta"
                />
              </div>
              
              {/* Hemoglobin Count */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Hemoglobin Count
                </label>
                <input 
                  type="text" 
                  placeholder="Enter your count"
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary-magenta"
                />
              </div>
              
              {/* Are you Healthy */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Are you Healthy
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="healthy" className="sr-only peer" defaultChecked />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>No</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input type="radio" name="healthy" className="sr-only peer" />
                      <div className="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                      </div>
                    </div>
                    <span>Yes</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Declaration Checkbox */}
          <div className="mt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-5 h-5 border border-gray-300 rounded peer-checked:bg-primary-magenta peer-checked:border-primary-magenta"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <span className="text-sm">I have read and understood all the information presented above and answered all the questions to the best of my knowledge, and hereby declare that <span className="text-red-500">*</span></span>
            </label>
          </div>
          
          {/* Submit Button */}
          <div className="mt-6">
            <button 
              type="submit" 
              className="w-full md:w-auto md:px-16 bg-primary-magenta text-white py-3 px-6 rounded-full hover:bg-opacity-90 transition-colors font-medium shadow-sm float-right"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
