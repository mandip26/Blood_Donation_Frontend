import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'

export const Route = createLazyFileRoute(
  '/dashboard/_dashboardLayout/edit-password',
)({
  component: EditPasswordComponent,
})

function EditPasswordComponent() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  
  // Password requirements
  const requirements = [
    { id: 'length', label: 'At least 8 characters', met: newPassword.length >= 8 },
    { id: 'uppercase', label: 'At least 1 uppercase letter', met: /[A-Z]/.test(newPassword) },
    { id: 'lowercase', label: 'At least 1 lowercase letter', met: /[a-z]/.test(newPassword) },
    { id: 'number', label: 'At least 1 number', met: /\d/.test(newPassword) },
    { id: 'special', label: 'At least 1 special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) }
  ]
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    
    // Check if all requirements are met
    const allRequirementsMet = requirements.every(req => req.met)
    if (!allRequirementsMet) {
      setFormError('Please ensure your password meets all requirements.')
      return
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setFormError('New password and confirm password do not match.')
      return
    }
    
    // Here you would normally send a request to the server to update the password
    // Simulate a successful password change
    setTimeout(() => {
      setFormSubmitted(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }, 1000)
  }
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <div className="mb-6">
        <Link to="/dashboard/edit-profile" className="text-gray-600 hover:text-gray-900 flex items-center">
          <ArrowLeft size={18} className="mr-2" />
          Back to Profile
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6">Change Password</h1>
        
        {formSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
            <Check size={20} className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800">Password Updated Successfully</h3>
              <p className="text-green-700 text-sm mt-1">
                Your password has been successfully updated. Use your new password the next time you sign in.
              </p>
              <div className="mt-4">
                <Link to="/dashboard">
                  <Button className="bg-primary-magenta text-white hover:bg-primary-magenta/90">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                <AlertCircle size={20} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{formError}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Password Requirements</h3>
                <ul className="space-y-2">
                  {requirements.map((req) => (
                    <li key={req.id} className="flex items-center text-sm">
                      {req.met ? (
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-300 rounded-full mr-2 flex-shrink-0"></div>
                      )}
                      <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <Link to="/dashboard/edit-profile">
                  <Button variant="outline" type="button" className="border-gray-300 text-gray-700">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </form>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-base font-medium text-gray-900 mb-4">Security Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Never share your password with anyone, including customer support</li>
            <li>• Create a unique password that you don't use for other websites</li>
            <li>• Enable two-factor authentication for additional security</li>
            <li>• Change your password regularly, at least once every 3 months</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
