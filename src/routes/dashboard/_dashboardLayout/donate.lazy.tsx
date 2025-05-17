import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, AlertCircle, Loader2 } from 'lucide-react'
import { donationService } from '@/services/apiService'
import { useAuth } from '@/hooks/useAuth'
import { useResponsive } from '@/hooks/useResponsive'

export const Route = createLazyFileRoute('/dashboard/_dashboardLayout/donate')({  
  component: RouteComponent,
})

function RouteComponent() {
  // Get auth context
  const { user, isLoading: authLoading } = useAuth()
  
  // Get responsive design hooks
  const { isMobile } = useResponsive()
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phoneNo: '',
    bloodType: '',
    disability: 'no',
    gender: 'male',
    email: '',
    idProofType: 'PAN',
    idProofNumber: '',
    weight: '',
    hemoglobinCount: '',
    healthy: 'yes',
    declaration: false
  })
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  
  // Populate form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        fullName: user.name || prevData.fullName,
        email: user.email || prevData.email,
        phoneNo: user.phone || prevData.phoneNo,
      }))
    }
  }, [user])
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkboxInput = e.target as HTMLInputElement
      setFormData({
        ...formData,
        [name]: checkboxInput.checked
      })
    } else if (type === 'radio') {
      setFormData({
        ...formData,
        [name]: value
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }
  
  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required'
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.phoneNo.trim()) newErrors.phoneNo = 'Phone number is required'
    if (!formData.bloodType) newErrors.bloodType = 'Blood type is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.idProofNumber?.trim()) newErrors.idProofNumber = 'ID proof number is required'
    
    // Phone validation
    if (formData.phoneNo && !/^\d{10}$/.test(formData.phoneNo.replace(/\s/g, ''))) {
      newErrors.phoneNo = 'Please enter a valid 10-digit phone number'
    }
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Age validation (must be at least 18)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old to donate blood'
      }
    }
    
    // Weight validation (if provided)
    if (formData.weight && (isNaN(Number(formData.weight)) || Number(formData.weight) < 30 || Number(formData.weight) > 200)) {
      newErrors.weight = 'Please enter a valid weight between 30-200 kg'
    }
    
    // Hemoglobin validation (if provided)
    if (formData.hemoglobinCount && (isNaN(Number(formData.hemoglobinCount)) || Number(formData.hemoglobinCount) < 5 || Number(formData.hemoglobinCount) > 20)) {
      newErrors.hemoglobinCount = 'Please enter a valid hemoglobin count between 5-20 g/dL'
    }
    
    // Declaration required
    if (!formData.declaration) {
      newErrors.declaration = 'You must agree to the declaration'
    }
    
    return newErrors
  }
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    try {
      setIsSubmitting(true)
      setApiError(null)
      
      // Prepare donor data
      const donorData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other',
        bloodType: formData.bloodType,
        weight: formData.weight ? Number(formData.weight) : 0,
        hemoglobinCount: formData.hemoglobinCount ? Number(formData.hemoglobinCount) : undefined,
        disability: formData.disability as 'yes' | 'no',
        healthy: formData.healthy as 'yes' | 'no',
        phoneNo: formData.phoneNo,
        email: formData.email,
        idProofType: formData.idProofType as 'PAN' | 'Aadhaar' | 'VoterID',
        idProofNumber: formData.idProofNumber,
      }
      
      // Register donor
      const response = await donationService.registerDonor(donorData)
      console.log('Donation registration successful:', response)
      
      // Record donation details if API call is successful
      await donationService.recordDonation({
        donorId: response.donorId || user?.id,
        donationDate: new Date().toISOString().split('T')[0],
        hospitalName: 'Current Hospital', // This would typically come from form data
        units: 1,
        bloodType: formData.bloodType,
        hemoglobinLevel: formData.hemoglobinCount ? Number(formData.hemoglobinCount) : undefined,
        notes: 'Self-reported donation',
      })
      
      // Set UI state to show success message
      setIsSubmitted(true)
      
      // Reset form after submission
      setFormData({
        fullName: '',
        dateOfBirth: '',
        phoneNo: '',
        bloodType: '',
        disability: 'no',
        gender: 'male',
        email: '',
        idProofType: 'PAN',
        idProofNumber: '',
        weight: '',
        hemoglobinCount: '',
        healthy: 'yes',
        declaration: false
      })
    } catch (error) {
      console.error('Error registering donation:', error)
      setApiError('Failed to register donation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // If auth is loading, show loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-8 h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
      </div>
    )
  }
  
  // Show success message after submission
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-2">Registration Successful!</h2>
          <p className="text-gray-700 mb-6">
            Thank you for registering your donation. Your contribution helps save lives!
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => setIsSubmitted(false)}
            >
              Register Another
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-primary-magenta hover:bg-primary-magenta/90"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  // Main form render
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-2">Blood Donation Registration</h1>
        <p className="text-gray-600">
          Please fill in the details below to register your blood donation.
        </p>
      </div>
      
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700">{apiError}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-x-6 gap-y-4`}>
          {/* Personal Information */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-lg font-medium mb-4">Personal Information</h2>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Full Name*</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.fullName ? 'border-red-300' : 'border-gray-300'} p-2.5`}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Date of Birth*</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full rounded-lg border ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'} p-2.5`}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Gender*</label>
            <div className="flex gap-4 mt-1.5">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Female
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other
              </label>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Blood Type*</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.bloodType ? 'border-red-300' : 'border-gray-300'} p-2.5`}
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            {errors.bloodType && <p className="text-red-500 text-xs">{errors.bloodType}</p>}
          </div>
          
          {/* Contact Information */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <h2 className="text-lg font-medium mb-4">Contact Information</h2>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Email Address*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} p-2.5`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Phone Number*</label>
            <input
              type="tel"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.phoneNo ? 'border-red-300' : 'border-gray-300'} p-2.5`}
              placeholder="Enter your phone number"
            />
            {errors.phoneNo && <p className="text-red-500 text-xs">{errors.phoneNo}</p>}
          </div>
          
          {/* Health Information */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <h2 className="text-lg font-medium mb-4">Health Information</h2>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.weight ? 'border-red-300' : 'border-gray-300'} p-2.5`}
              placeholder="Enter your weight in kg"
            />
            {errors.weight && <p className="text-red-500 text-xs">{errors.weight}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Hemoglobin Count (g/dL)</label>
            <input
              type="number"
              step="0.1"
              name="hemoglobinCount"
              value={formData.hemoglobinCount}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.hemoglobinCount ? 'border-red-300' : 'border-gray-300'} p-2.5`}
              placeholder="Enter hemoglobin count if known"
            />
            {errors.hemoglobinCount && <p className="text-red-500 text-xs">{errors.hemoglobinCount}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Do you have any disability?*</label>
            <div className="flex gap-4 mt-1.5">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="disability"
                  value="yes"
                  checked={formData.disability === 'yes'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="disability"
                  value="no"
                  checked={formData.disability === 'no'}
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Are you currently healthy?*</label>
            <div className="flex gap-4 mt-1.5">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="healthy"
                  value="yes"
                  checked={formData.healthy === 'yes'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="healthy"
                  value="no"
                  checked={formData.healthy === 'no'}
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
          
          {/* ID Verification */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <h2 className="text-lg font-medium mb-4">ID Verification</h2>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">ID Proof Type*</label>
            <select
              name="idProofType"
              value={formData.idProofType}
              onChange={handleChange}
              className={`w-full rounded-lg border border-gray-300 p-2.5`}
            >
              <option value="PAN">PAN Card</option>
              <option value="Aadhaar">Aadhaar Card</option>
              <option value="VoterID">Voter ID</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">ID Proof Number*</label>
            <input
              type="text"
              name="idProofNumber"
              value={formData.idProofNumber}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.idProofNumber ? 'border-red-300' : 'border-gray-300'} p-2.5`}
              placeholder="Enter ID number"
            />
            {errors.idProofNumber && <p className="text-red-500 text-xs">{errors.idProofNumber}</p>}
          </div>
          
          {/* Consent */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <div className={`p-4 rounded-lg bg-gray-50 ${errors.declaration ? 'border border-red-300' : ''}`}>
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="declaration"
                  checked={formData.declaration}
                  onChange={handleChange}
                  className="mt-1 mr-3"
                />
                <span className="text-sm">
                  I hereby declare that all the information provided by me is true and correct to the best of my knowledge. 
                  I understand that providing false information may disqualify me from donating blood and may have legal consequences.
                </span>
              </label>
              {errors.declaration && <p className="text-red-500 text-xs mt-1">{errors.declaration}</p>}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary-magenta hover:bg-primary-magenta/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
