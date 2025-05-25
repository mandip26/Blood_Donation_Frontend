import { createLazyFileRoute } from '@tanstack/react-router'
import { Bell, Search, MapPin, Calendar, Phone, Mail, CheckCircle, Edit3, Camera, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import useAuth from '@/hooks/useAuth'

export const Route = createLazyFileRoute(
  '/dashboard/_dashboardLayout/edit-profile',
)({  
  component: EditProfileComponent,
})

interface DonationHistory {
  id: string;
  date: string;
  hospital: string;
  units: number;
}

interface MedicalDetail {
  key: string;
  value: string;
  lastUpdated: string;
}

function EditProfileComponent() {
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingMedical, setEditingMedical] = useState(false)
  const { user: loggedInUser } = useAuth();
  const [personalInfo, setPersonalInfo] = useState({
    name: loggedInUser ? loggedInUser.name : 'Ramzey Nassar',
    phone: loggedInUser ? loggedInUser.phone : '+91 98989 98989',
    email: loggedInUser ? loggedInUser.email : 'ramzeynassar@gmail.com',
    bloodType: loggedInUser ? loggedInUser.bloodType : 'O+',
    dob: loggedInUser ? loggedInUser.dob : '1990-04-15',
    gender: loggedInUser ? loggedInUser.gender : 'Male',
    address: loggedInUser ? loggedInUser.address : '123 Main St, Delhi, India',
    emergencyContact: loggedInUser ? loggedInUser.emergencyContact : '+91 87878 87878'
  })
  
  
  const [medicalDetails, setMedicalDetails] = useState<MedicalDetail[]>([
    { key: 'Weight', value: '75 kg', lastUpdated: '2025-04-01' },
    { key: 'Height', value: '178 cm', lastUpdated: '2025-04-01' },
    { key: 'Blood Pressure', value: '120/80 mmHg', lastUpdated: '2025-04-10' },
    { key: 'Allergies', value: 'None', lastUpdated: '2025-04-01' },
    { key: 'Chronic Conditions', value: 'None', lastUpdated: '2025-04-01' },
    { key: 'Medications', value: 'None', lastUpdated: '2025-04-01' }
  ])
  
  const donationHistory: DonationHistory[] = [
    { id: '1', date: '2025-03-15', hospital: 'Apollo Hospital', units: 1 },
    { id: '2', date: '2024-12-10', hospital: 'Fortis Hospital', units: 1 },
    { id: '3', date: '2024-08-22', hospital: 'City Blood Bank', units: 1 },
    { id: '4', date: '2024-04-05', hospital: 'University Medical Center', units: 1 },
    { id: '5', date: '2023-11-18', hospital: 'Community Blood Drive', units: 1 }
  ]
  
  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  const handlePersonalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEditingPersonal(false)
    // Here you would normally save the data to a server
  }
  
  const handleMedicalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEditingMedical(false)
    // Here you would normally save the data to a server
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Profile Photo Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="w-32 h-32 rounded-full bg-blue-100 overflow-hidden border-4 border-white shadow-md">
                <img 
                  src="/placeholder-avatar.svg" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/200x200?text=Avatar'
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-1">{personalInfo.name}</h2>
            <p className="text-gray-500 text-sm mb-4">Donor ID: DON-9876543</p>
            
            <div className="w-full">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin size={16} />
                <span className="text-sm">{personalInfo.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Mail size={16} />
                <span className="text-sm">{personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span className="text-sm">{personalInfo.phone}</span>
              </div>
            </div>
            
            <div className="mt-6 w-full pt-6 border-t border-gray-100">
              <h3 className="font-medium mb-2">Badge Status</h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  <CheckCircle size={12} className="mr-1" /> Regular Donor
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                  3+ Donations
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-magenta/10 text-primary-magenta text-xs font-medium">
                  {personalInfo.bloodType}
                </span>
              </div>
            </div>
          </div>
          
          {/* Next Eligible Donation */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="font-medium mb-4">Next Eligible Donation</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary-magenta/10 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary-magenta" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">You can donate again on</p>
                  <p className="font-medium">July 15, 2025</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                In 60 days
              </span>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {/* Personal Info Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {!editingPersonal ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary-magenta text-primary-magenta hover:bg-primary-magenta/10"
                  onClick={() => setEditingPersonal(true)}
                >
                  <Edit3 size={16} className="mr-1" /> Edit
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => setEditingPersonal(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
            
            {!editingPersonal ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Full Name</h3>
                  <p className="font-medium">{personalInfo.name}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Blood Type</h3>
                  <p className="font-medium">{personalInfo.bloodType}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Date of Birth</h3>
                  <p className="font-medium">{formatDate(personalInfo.dob)}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Gender</h3>
                  <p className="font-medium">{personalInfo.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Email</h3>
                  <p className="font-medium">{personalInfo.email}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Phone</h3>
                  <p className="font-medium">{personalInfo.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm text-gray-500 mb-1">Address</h3>
                  <p className="font-medium">{personalInfo.address}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm text-gray-500 mb-1">Emergency Contact</h3>
                  <p className="font-medium">{personalInfo.emergencyContact}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePersonalFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Blood Type</label>
                    <select
                      value={personalInfo.bloodType}
                      onChange={(e) => setPersonalInfo({...personalInfo, bloodType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={personalInfo.dob}
                      onChange={(e) => setPersonalInfo({...personalInfo, dob: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Gender</label>
                    <select
                      value={personalInfo.gender}
                      onChange={(e) => setPersonalInfo({...personalInfo, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Emergency Contact</label>
                    <input
                      type="tel"
                      value={personalInfo.emergencyContact}
                      onChange={(e) => setPersonalInfo({...personalInfo, emergencyContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
          
          {/* Medical Details Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Medical Details</h2>
              {!editingMedical ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary-magenta text-primary-magenta hover:bg-primary-magenta/10"
                  onClick={() => setEditingMedical(true)}
                >
                  <Edit3 size={16} className="mr-1" /> Edit
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => setEditingMedical(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
            
            {!editingMedical ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {medicalDetails.map((detail, index) => (
                  <div key={index}>
                    <h3 className="text-sm text-gray-500 mb-1">{detail.key}</h3>
                    <p className="font-medium">{detail.value}</p>
                    <p className="text-xs text-gray-400 mt-1">Updated: {formatDate(detail.lastUpdated)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleMedicalFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {medicalDetails.map((detail, index) => (
                    <div key={index}>
                      <label className="block text-sm text-gray-700 mb-1">{detail.key}</label>
                      <input
                        type="text"
                        value={detail.value}
                        onChange={(e) => {
                          const updatedDetails = [...medicalDetails];
                          updatedDetails[index].value = e.target.value;
                          updatedDetails[index].lastUpdated = new Date().toISOString().split('T')[0];
                          setMedicalDetails(updatedDetails);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
