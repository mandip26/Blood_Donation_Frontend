import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, Calendar, Map, Droplets, Users, TrendingUp, Loader2, RefreshCw } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { eventService, bloodRequestService, donationService } from '@/services/apiService'
import { useAuth } from '@/hooks/useAuth' 
import { useResponsive } from '@/hooks/useResponsive'

export const Route = createLazyFileRoute('/dashboard/')({
  component: DashboardComponent,
})

// Type definitions
interface BloodDonationEvent {
  id: string
  title: string
  date: string
  time: string
  venue: string
}

interface BloodRequestCard {
  id: string
  bloodType: string
  name: string
  hospital: string
  urgency: 'low' | 'medium' | 'high'
  location: string
  postedTime: string
}

interface DonorStats {
  totalDonations: number
  lastDonation: string
  nextEligible: string
  bloodType: string
}

function DashboardComponent() {
  // Auth context
  const { user, isLoading: authLoading } = useAuth()  
  
  // Responsive design hook
  const { isMobile } = useResponsive()
  
  // State for loading indicators
  const [isLoading, setIsLoading] = useState(true)
  const [eventLoading, setEventLoading] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [donorStatsLoading, setDonorStatsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState({
    totalDonations: 0,
    totalRequests: 0,
    donorsNearby: 45, // This might be a mock value until we have geolocation
    upcomingEvents: 0
  })

  const [donorStats, setDonorStats] = useState<DonorStats>({
    totalDonations: 0,
    lastDonation: '',
    nextEligible: '',
    bloodType: ''
  })
  
  const [upcomingEvents, setUpcomingEvents] = useState<BloodDonationEvent[]>([])
  const [bloodRequests, setBloodRequests] = useState<BloodRequestCard[]>([])
  
  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  // Calculate days until next donation eligibility
  const daysUntilNextDonation = () => {
    if (!donorStats.nextEligible) return 0
    
    const nextDate = new Date(donorStats.nextEligible)
    const today = new Date()
    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch events
        try {
          setEventLoading(true)
          const eventsData = await eventService.getAllEvents()
          if (eventsData && eventsData.length > 0) {
            // Map the API response to our interface
            const formattedEvents: BloodDonationEvent[] = eventsData.map((event: any) => ({
              id: event._id || event.id,
              title: event.title,
              date: event.date,
              time: event.time,
              venue: event.venue
            }))
            setUpcomingEvents(formattedEvents.slice(0, 3)) // Show only 3 events
            setStats(prev => ({ ...prev, upcomingEvents: eventsData.length }))
          }
        } catch (eventError) {
          console.error('Error fetching events:', eventError)
          // Keep using mock data if API fails
        } finally {
          setEventLoading(false)
        }
        
        // Fetch blood requests
        try {
          setRequestLoading(true)
          const requestsData = await bloodRequestService.getActiveRequests()
          if (requestsData && requestsData.length > 0) {
            // Map the API response to our interface
            const formattedRequests: BloodRequestCard[] = requestsData.map((request: any) => ({
              id: request._id || request.id,
              bloodType: request.bloodType,
              name: request.name,
              hospital: request.hospital,
              urgency: request.urgency,
              location: request.location,
              postedTime: getTimeAgo(new Date(request.createdAt || new Date()))
            }))
            setBloodRequests(formattedRequests.slice(0, 3)) // Show only 3 requests
            setStats(prev => ({ ...prev, totalRequests: requestsData.length }))
          }
        } catch (requestError) {
          console.error('Error fetching blood requests:', requestError)
          // Keep using mock data if API fails
        } finally {
          setRequestLoading(false)
        }
        
        // Fetch donor stats if user is logged in
        if (user) {
          try {
            setDonorStatsLoading(true)
            const [donorStatusData, nextDonationDate] = await Promise.all([
              donationService.getDonorStatus(),
              donationService.getNextDonationDate()
            ])
            
            if (donorStatusData) {
              setDonorStats({
                totalDonations: donorStatusData.totalDonations || 0,
                lastDonation: donorStatusData.lastDonation || '',
                nextEligible: nextDonationDate?.date || '',
                bloodType: donorStatusData.bloodType || ''
              })
              
              setStats(prev => ({ ...prev, totalDonations: donorStatusData.totalDonations || 0 }))
            }
          } catch (donorError) {
            console.error('Error fetching donor status:', donorError)
          } finally {
            setDonorStatsLoading(false)
          }
        }
        
        // Set loading to false after all data is fetched
        setIsLoading(false)
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data. Please try again.')
        setIsLoading(false)
      }
    }
    
    // Only fetch data once auth is resolved
    if (!authLoading) {
      fetchDashboardData()
    }
  }, [user, authLoading])
  
  // Helper function to format time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffHour = Math.round(diffMin / 60)
    const diffDay = Math.round(diffHour / 24)
    
    if (diffSec < 60) return `${diffSec} seconds ago`
    if (diffMin < 60) return `${diffMin} minutes ago`
    if (diffHour < 24) return `${diffHour} hours ago`
    if (diffDay === 1) return 'Yesterday'
    if (diffDay < 30) return `${diffDay} days ago`
    
    return date.toLocaleDateString()
  }

  // Function to handle manual refresh
  const handleRefresh = () => {
    window.location.reload()
  }

  // Loading skeleton for the dashboard
  if (isLoading || authLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-3 md:p-4 flex items-center">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center"></div>
              <div className="ml-3 md:ml-4 flex-1">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-md mb-2"></div>
                <div className="h-6 w-12 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Donor Status Card Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 md:p-4 rounded-lg bg-gray-50">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <div className="h-2 w-full bg-gray-200 rounded-full"></div>
          </div>
        </div>
        
        {/* Two-column skeleton layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-40 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="h-12 w-12 bg-gray-200 animate-pulse rounded-lg"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md mb-2"></div>
                        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-md mb-2"></div>
                        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded-md"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="ghost" 
              size={isMobile ? "sm" : "default"} 
              className="relative"
            >
              <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"} 
              className="relative"
            >
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw size={16} />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            size={isMobile ? "sm" : "default"} 
            className="relative"
          >
            <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"} 
            className="relative"
          >
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 flex items-center">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-red-50 flex items-center justify-center">
            <Droplets className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
          </div>
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm text-gray-500">Total Donations</p>
            <p className="text-lg md:text-xl font-bold">
              {donorStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : stats.totalDonations}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 flex items-center">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
          </div>
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm text-gray-500">Blood Requests</p>
            <p className="text-lg md:text-xl font-bold">
              {requestLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : stats.totalRequests}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 flex items-center">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-green-50 flex items-center justify-center">
            <Users className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
          </div>
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm text-gray-500">Donors Nearby</p>
            <p className="text-lg md:text-xl font-bold">{stats.donorsNearby}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 flex items-center">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-purple-50 flex items-center justify-center">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
          </div>
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm text-gray-500">Upcoming Events</p>
            <p className="text-lg md:text-xl font-bold">
              {eventLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : stats.upcomingEvents}
            </p>
          </div>
        </div>
      </div>

      {/* Donor Status Card */}
      {user && (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold">Donor Status</h2>
            <Link to="/dashboard/donate" className="text-sm font-medium text-primary-magenta">
              <Button variant="outline" size={isMobile ? "sm" : "default"}>
                Register Donation
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="p-3 md:p-4 rounded-lg bg-gray-50">
              <p className="text-xs md:text-sm text-gray-500">Blood Type</p>
              <p className="text-lg md:text-xl font-bold">{donorStats.bloodType || 'Not specified'}</p>
            </div>
            
            <div className="p-3 md:p-4 rounded-lg bg-gray-50">
              <p className="text-xs md:text-sm text-gray-500">Last Donation</p>
              <p className="text-lg md:text-xl font-bold">
                {donorStatsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  donorStats.lastDonation ? formatDate(donorStats.lastDonation) : 'None'
                )}
              </p>
            </div>
            
            <div className="p-3 md:p-4 rounded-lg bg-gray-50">
              <p className="text-xs md:text-sm text-gray-500">Next Eligible Date</p>
              <p className="text-lg md:text-xl font-bold">
                {donorStatsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  donorStats.nextEligible ? formatDate(donorStats.nextEligible) : 'Eligible now'
                )}
              </p>
            </div>
          </div>
          
          {donorStats.nextEligible && (
            <div className="mt-6">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-primary-magenta rounded-full" 
                  style={{ width: `${Math.min(100, (daysUntilNextDonation() / 90) * 100)}%` }} 
                ></div>
              </div>
              <p className="mt-2 text-xs text-center">
                {daysUntilNextDonation() > 0 
                  ? `${daysUntilNextDonation()} days until next eligible donation` 
                  : "You are eligible to donate now!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Two-column layout for Events and Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Link to="/dashboard/events" className={`text-sm font-medium text-primary-magenta ${isMobile ? 'hidden' : 'block'}`}>
              View All
            </Link>
          </div>
          
          {eventLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="border border-gray-100 rounded-lg p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-2">{event.title}</h3>
                  <div className="flex items-center text-sm mb-1">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDate(event.date)} • {event.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Map className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{event.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <Calendar className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500 mb-4">No upcoming events found</p>              <Link to="/dashboard/events">
                <Button variant="outline" size="sm">Browse Events</Button>
              </Link>
            </div>
          )}
          
          {isMobile && upcomingEvents.length > 0 && (            <div className="mt-4 text-center">
              <Link to="/dashboard/events">
                <Button variant="outline" size="sm">View All Events</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Blood Requests */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Blood Requests</h2>            <Link to="/dashboard/recipient" className={`text-sm font-medium text-primary-magenta ${isMobile ? 'hidden' : 'block'}`}>
              View All
            </Link>
          </div>
          
          {requestLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
            </div>
          ) : bloodRequests.length > 0 ? (
            <div className="space-y-4">
              {bloodRequests.map(request => (
                <div key={request.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium
                      ${request.bloodType.includes('A') ? 'bg-green-500' : 
                        request.bloodType.includes('B') ? 'bg-blue-500' : 
                        request.bloodType.includes('O') ? 'bg-red-500' : 'bg-purple-500'}`}>
                      {request.bloodType}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.hospital}</p>
                      <div className="flex items-center text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded-full ${
                          request.urgency === 'high' ? 'bg-red-100 text-red-700' : 
                          request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">{request.postedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <Droplets className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500 mb-4">No blood requests found</p>              <Link to="/dashboard/recipient">
                <Button variant="outline" size="sm">Browse Requests</Button>
              </Link>
            </div>
          )}
          
          {isMobile && bloodRequests.length > 0 && (            <div className="mt-4 text-center">
              <Link to="/dashboard/recipient">
                <Button variant="outline" size="sm">View All Requests</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
