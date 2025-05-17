import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Filter, Calendar, MapPin, Clock, ChevronDown, X } from 'lucide-react'

export const Route = createLazyFileRoute('/dashboard/_dashboardLayout/events')({
  component: EventsComponent,
})

interface BloodDonationEvent {
  id: string
  title: string
  date: string
  time: string
  venue: string
  organizer: string
  description: string
  image: string
  registeredCount: number
  capacity: number
}

function EventsComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<BloodDonationEvent | null>(null)
  
  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata']
  const dates = ['Today', 'Tomorrow', 'This Week', 'This Month']
  
  const events: BloodDonationEvent[] = [
    {
      id: '1',
      title: 'Community Blood Drive',
      date: '2025-05-25',
      time: '10:00 AM - 4:00 PM',
      venue: 'City Community Center, Delhi',
      organizer: 'Delhi Blood Bank',
      description: 'Join our community blood drive to help save lives. We need all blood types, especially O- and AB+. Refreshments will be provided to all donors.',
      image: 'https://placehold.co/600x400?text=Blood+Drive',
      registeredCount: 45,
      capacity: 100
    },
    {
      id: '2',
      title: 'Apollo Hospital Blood Donation Camp',
      date: '2025-06-05',
      time: '9:00 AM - 2:00 PM',
      venue: 'Apollo Hospital, Mumbai',
      organizer: 'Apollo Hospital',
      description: 'Apollo Hospital is organizing a blood donation camp to replenish its blood bank supplies. All donors will receive a free basic health checkup.',
      image: 'https://placehold.co/600x400?text=Apollo+Hospital',
      registeredCount: 32,
      capacity: 80
    },
    {
      id: '3',
      title: 'University Blood Donation Drive',
      date: '2025-06-12',
      time: '11:00 AM - 5:00 PM',
      venue: 'University Campus, Bangalore',
      organizer: 'Medical Students Association',
      description: 'The Medical Students Association is organizing a blood donation drive at the university campus. Come support this student-led initiative!',
      image: 'https://placehold.co/600x400?text=University+Drive',
      registeredCount: 28,
      capacity: 120
    },
    {
      id: '4',
      title: 'Corporate Blood Donation Event',
      date: '2025-06-15',
      time: '10:00 AM - 3:00 PM',
      venue: 'Tech Park, Chennai',
      organizer: 'TechCorp Inc.',
      description: 'TechCorp is hosting a blood donation event as part of its CSR initiative. Open to all employees and the general public.',
      image: 'https://placehold.co/600x400?text=Corporate+Event',
      registeredCount: 15,
      capacity: 60
    },
    {
      id: '5',
      title: 'Summer Blood Donation Festival',
      date: '2025-06-20',
      time: '9:00 AM - 6:00 PM',
      venue: 'Central Park, Hyderabad',
      organizer: 'Hyderabad Blood Bank Association',
      description: 'A full-day event with entertainment, food stalls, and blood donation facilities. Bring your family and make it a day of giving back!',
      image: 'https://placehold.co/600x400?text=Summer+Festival',
      registeredCount: 67,
      capacity: 200
    }
  ]
  
  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCity = selectedCity ? event.venue.includes(selectedCity) : true
    
    let matchesDate = true
    if (selectedDate) {
      const eventDate = new Date(event.date)
      const today = new Date()
      
      if (selectedDate === 'Today') {
        matchesDate = eventDate.toDateString() === today.toDateString()
      } else if (selectedDate === 'Tomorrow') {
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        matchesDate = eventDate.toDateString() === tomorrow.toDateString()
      } else if (selectedDate === 'This Week') {
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)
        matchesDate = eventDate >= today && eventDate <= nextWeek
      } else if (selectedDate === 'This Month') {
        matchesDate = 
          eventDate.getMonth() === today.getMonth() && 
          eventDate.getFullYear() === today.getFullYear()
      }
    }
    
    return matchesSearch && matchesCity && matchesDate
  })
  
  // Handle event click to view details
  const handleEventClick = (event: BloodDonationEvent) => {
    setSelectedEvent(event)
  }
  
  // Handle registration form submission
  const handleRegistration = (event: React.FormEvent) => {
    event.preventDefault()
    // Implement registration submission logic
    console.log('Registering for event:', selectedEvent)
    // Close the details modal
    setSelectedEvent(null)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blood Donation Events</h1>
        <Button className="bg-primary-magenta text-white hover:bg-primary-magenta/90">
          Create Event
        </Button>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search events by name, organizer, or location"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-magenta"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Button 
                variant="outline" 
                className="border border-gray-200 px-4 py-2 flex items-center gap-2"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={18} />
                Filter
                <ChevronDown size={16} />
              </Button>
              
              {/* Filter dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 z-10 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">City</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {cities.map(city => (
                        <button
                          key={city}
                          className={`py-1 px-2 text-sm rounded ${
                            selectedCity === city
                              ? 'bg-primary-magenta text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Date</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {dates.map(date => (
                        <button
                          key={date}
                          className={`py-1 px-2 text-sm rounded ${
                            selectedDate === date
                              ? 'bg-primary-magenta text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedCity(null)
                        setSelectedDate(null)
                      }}
                      className="text-gray-600 mr-2"
                    >
                      Clear All
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Active filters */}
        {(selectedCity || selectedDate) && (
          <div className="flex gap-2 mt-4">
            {selectedCity && (
              <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                City: {selectedCity}
                <button 
                  onClick={() => setSelectedCity(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {selectedDate && (
              <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                Date: {selectedDate}
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div 
              key={event.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 bg-primary-magenta/80 text-white px-3 py-1 rounded-tr-lg">
                  <Calendar size={14} className="inline mr-1" />
                  {formatDate(event.date)}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{event.organizer}</p>
                
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <MapPin size={14} className="mr-1" />
                  {event.venue}
                </div>
                
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock size={14} className="mr-1" />
                  {event.time}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Registration</span>
                    <span className="text-sm font-medium">{event.registeredCount}/{event.capacity}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-magenta rounded-full"
                      style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 pt-0">
                <Button 
                  className="w-full bg-primary-magenta text-white hover:bg-primary-magenta/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  Register Now
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No matching events found.</p>
          </div>
        )}
      </div>
      
      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1"
            >
              <X size={24} />
            </button>
            
            <div className="h-60 overflow-hidden">
              <img 
                src={selectedEvent.image} 
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary-magenta/10 p-3 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary-magenta" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-semibold">{selectedEvent.title}</h2>
                  </div>
                  <p className="text-gray-600">{selectedEvent.organizer}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Date</h3>
                  <p className="font-medium">{formatDate(selectedEvent.date)}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Time</h3>
                  <p className="font-medium">{selectedEvent.time}</p>
                </div>
                <div className="col-span-full">
                  <h3 className="text-sm text-gray-500 mb-1">Venue</h3>
                  <p className="font-medium">{selectedEvent.venue}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm text-gray-500 mb-2">About This Event</h3>
                <p className="text-gray-800">{selectedEvent.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm text-gray-500 mb-2">Registration Status</h3>
                <div className="flex justify-between mb-2">
                  <span>{selectedEvent.registeredCount} registered</span>
                  <span>{selectedEvent.capacity - selectedEvent.registeredCount} spots left</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-magenta rounded-full"
                    style={{ width: `${(selectedEvent.registeredCount / selectedEvent.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <form onSubmit={handleRegistration}>
                <h3 className="text-lg font-semibold mb-4">Register for this Event</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Type
                    </label>
                    <select 
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                      required
                    >
                      <option value="">Select Blood Type</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                      <option>O+</option>
                      <option>O-</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedEvent(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                  >
                    Confirm Registration
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
