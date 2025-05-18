import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, AlertCircle, Loader2, BellRing } from 'lucide-react'
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
  const { isMobile: _ } = useResponsive() // Using underscore to indicate intentionally unused variable
  
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
    <div className="mx-auto w-full">
      <div className="p-4 md:p-6 flex justify-between items-center rounded-t-xl">
        <h1 className="text-xl md:text-2xl font-semibold">Blood Donors Registration Form</h1>
      </div>
      
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700">{apiError}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8 md:pt-0 pt-0">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
          {/* Donor Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Donor's Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full rounded-full border ${errors.fullName ? 'border-red-300' : 'border-gray-300'} p-2.5 px-4`}
              placeholder="Enter Full Name"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Date of Birth<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onFocus={(e) => e.target.type = 'date'}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-full border ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'} p-2.5 px-4`}
                placeholder="DD/MM/YYYY"
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
            
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Gender<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.gender === 'male' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.gender === 'male' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  Male
                </label>
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.gender === 'female' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.gender === 'female' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  Female
                </label>
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.gender === 'other' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.gender === 'other' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  Other
                </label>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone No<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                className={`w-full rounded-full border ${errors.phoneNo ? 'border-red-300' : 'border-gray-300'} p-2.5 px-4`}
                placeholder="00000 00000"
              />
              {errors.phoneNo && <p className="text-red-500 text-xs mt-1">{errors.phoneNo}</p>}
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-full border ${errors.email ? 'border-red-300' : 'border-gray-300'} p-2.5 px-4`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Blood Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Blood Type<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className={`w-full rounded-full border ${errors.bloodType ? 'border-red-300' : 'border-gray-300'} p-2.5 px-4 appearance-none`}
                >
                  <option value="">-select-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#E6E6E6"/>
                    <path d="M11 7L8 10L5 7" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.bloodType && <p className="text-red-500 text-xs mt-1">{errors.bloodType}</p>}
            </div>
            
            {/* ID Proof */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ID Proof<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.idProofType === 'PAN' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.idProofType === 'PAN' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="idProofType"
                    value="PAN"
                    checked={formData.idProofType === 'PAN'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  PAN
                </label>
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.idProofType === 'Aadhaar' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.idProofType === 'Aadhaar' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="idProofType"
                    value="Aadhaar"
                    checked={formData.idProofType === 'Aadhaar'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  Aadhaar
                </label>
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.idProofType === 'VoterID' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.idProofType === 'VoterID' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="idProofType"
                    value="VoterID"
                    checked={formData.idProofType === 'VoterID'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  Vote ID
                </label>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  name="idProofNumber"
                  value={formData.idProofNumber}
                  onChange={handleChange}
                  className={`w-full rounded-full border ${errors.idProofNumber ? 'border-red-300' : 'border-gray-300'} p-2.5 px-4`}
                  placeholder="Enter ID Number"
                />
                {errors.idProofNumber && <p className="text-red-500 text-xs mt-1">{errors.idProofNumber}</p>}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Any Disability */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Any Disability<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.disability === 'no' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.disability === 'no' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="disability"
                    value="no"
                    checked={formData.disability === 'no'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  No
                </label>
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.disability === 'yes' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.disability === 'yes' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="disability"
                    value="yes"
                    checked={formData.disability === 'yes'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  Yes
                </label>
              </div>
            </div>
            
            {/* Weight */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Weight
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={`w-full rounded-full border ${errors.weight ? 'border-red-300' : 'border-gray-300'} p-2.5 px-4`}
                placeholder="weight in Kg's"
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Hemoglobin Count */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Hemoglobin Count
              </label>
              <input
                type="text"
                name="hemoglobinCount"
                value={formData.hemoglobinCount}
                onChange={handleChange}
                className={`w-full rounded-full border ${errors.hemoglobinCount ? 'border-red-300' : 'border-gray-300'} p-2.5 px-4`}
                placeholder="Enter your count"
              />
              {errors.hemoglobinCount && <p className="text-red-500 text-xs mt-1">{errors.hemoglobinCount}</p>}
            </div>
            
            {/* Are you Healthy */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Are you Healthy
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.healthy === 'no' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.healthy === 'no' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="healthy"
                    value="no"
                    checked={formData.healthy === 'no'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  No
                </label>
                <label className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${formData.healthy === 'yes' ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'} flex items-center justify-center mr-2`}>
                    {formData.healthy === 'yes' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name="healthy"
                    value="yes"
                    checked={formData.healthy === 'yes'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  Yes
                </label>
              </div>
            </div>
          </div>
          
          {/* Declaration */}
          <div className="mb-6">
            <label className="flex items-start">
              <div className={`w-5 h-5 border rounded flex items-center justify-center mt-0.5 ${errors.declaration ? 'border-red-300' : formData.declaration ? 'bg-[#c14351] border-[#c14351]' : 'border-gray-300'}`}>
                {formData.declaration && <Check className="h-3 w-3 text-white" />}
              </div>
              <input
                type="checkbox"
                name="declaration"
                checked={formData.declaration}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="ml-3 text-sm">
                I have read and understood all the information presented above and answered all the questions to the best of my knowledge, and hereby declare that<span className="text-red-500">*</span>
              </span>
            </label>
            {errors.declaration && <p className="text-red-500 text-xs mt-1 ml-8">{errors.declaration}</p>}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className={`rounded-full bg-[#c14351] text-white py-2.5 px-6 ${isSubmitting ? 'opacity-75' : 'hover:bg-[#a23543]'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                Submitting...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
