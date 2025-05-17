import { createLazyFileRoute } from '@tanstack/react-router'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

export const Route = createLazyFileRoute(
  '/dashboard/_dashboardLayout/edit-profile',
)({  
  component: EditProfileComponent,
})

function EditProfileComponent() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>
      </div>

      {/* Profile Photo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
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
        </div>
        <Button className="bg-primary-magenta text-white hover:bg-primary-magenta/90 mb-2 rounded-md px-6">
          Upload new photo
        </Button>
        <p className="text-sm text-gray-500 text-center">At least 800x800px recommended<br />JPG or PNG is allowed</p>
      </div>

      <Separator className="my-6" />

      {/* Personal Info Section */}
      <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Personal Info</h2>
          <Button variant="outline" size="sm" className="bg-primary-magenta/10 text-primary-magenta border-primary-magenta/20 hover:bg-primary-magenta/20 rounded-md">
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Full Name</h3>
            <p className="font-medium">Ramzey Nassar</p>
          </div>
          <div className="text-right md:flex md:justify-end md:items-center">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Phone</h3>
              <p className="font-medium">+91 98989 98989</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Email</h3>
            <p className="font-medium">ramzeynassar@gmail.com</p>
          </div>
          <div className="text-right md:flex md:justify-end md:items-center">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Blood Type</h3>
              <p className="font-medium">O Positive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Location</h2>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            Cancel
          </Button>
        </div>

        <div className="relative mb-4">
          <div className="flex">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-magenta"
              />
            </div>
            <Button className="bg-primary-magenta text-white hover:bg-primary-magenta/90 rounded-l-none">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">History</h2>
        <div className="space-y-0">
          <div className="py-3 border-b border-gray-100">
            <p className="text-gray-800">Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>
          </div>
          <div className="py-3">
            <p className="text-gray-800">Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
