import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Trash2, Image, Video, MapPin, Tag, AlertCircle } from 'lucide-react'

export const Route = createLazyFileRoute('/dashboard/_dashboardLayout/create')({  
  component: CreatePostComponent,
})

function CreatePostComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [postText, setPostText] = useState('')
  const [postType, setPostType] = useState<'comment' | 'hospital' | 'organization'>('comment')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handlePost = () => {
    // Handle post submission logic here
    console.log('Post submitted:', { text: postText, type: postType, files: selectedFiles })
    setPostText('')
    setSelectedFiles([])
    setPreviewUrls([])
    closeModal()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setSelectedFiles(prev => [...prev, ...newFiles])
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviewUrls])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Create Post</h1>
        <p className="text-gray-600">Share updates, request blood donations, or ask questions to the community.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
            <img 
              src="/placeholder-avatar.svg" 
              alt="User" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/200x200?text=User';
              }}
            />
          </div>
          
          {/* Post create box */}
          <div 
            onClick={openModal}
            className="flex-1 bg-gray-100 rounded-xl p-4 text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            What's on your mind?
          </div>
        </div>
        
        {/* Quick post actions */}
        <div className="mt-4 border-t border-gray-100 pt-4 flex justify-around">
          <Button 
            onClick={openModal} 
            variant="ghost" 
            className="text-gray-600 gap-2 hover:bg-gray-100"
          >
            <Image size={18} />
            Photo
          </Button>
          <Button 
            onClick={openModal} 
            variant="ghost" 
            className="text-gray-600 gap-2 hover:bg-gray-100"
          >
            <Video size={18} />
            Video
          </Button>
          <Button 
            onClick={openModal} 
            variant="ghost" 
            className="text-gray-600 gap-2 hover:bg-gray-100"
          >
            <AlertCircle size={18} />
            Blood Request
          </Button>
        </div>
      </div>
      
      {/* Recent activity section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-6">
          {/* Example post */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                <img 
                  src="https://placehold.co/200x200?text=Hospital" 
                  alt="Apollo Hospital" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h3 className="font-medium">Apollo Hospital</h3>
                <p className="text-xs text-gray-500">Posted 2 hours ago</p>
                
                <div className="mt-3">
                  <p className="text-gray-800">
                    Urgent need for O- blood type for an emergency surgery. If you can donate, please contact the blood bank department immediately.
                  </p>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    <span>8</span> Responses
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Example post 2 */}
          <div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                <img 
                  src="https://placehold.co/200x200?text=User" 
                  alt="Priya Sharma" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h3 className="font-medium">Priya Sharma</h3>
                <p className="text-xs text-gray-500">Posted 1 day ago</p>
                
                <div className="mt-3">
                  <p className="text-gray-800">
                    Just donated blood for the first time today at the Community Drive! It was quick and painless. Feeling proud to have helped someone in need. 💉❤️ #BloodDonation #SaveLives
                  </p>
                  
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
                    <img 
                      src="https://placehold.co/800x400?text=Blood+Donation+Image" 
                      alt="Blood donation" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    <span>24</span> Likes
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    <span>5</span> Comments
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-xl relative">
            {/* Modal Header with Close Button */}
            <div className="flex justify-between items-center p-4">
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <button 
                onClick={() => {
                  setPostText('')
                  setSelectedFiles([])
                  setPreviewUrls([])
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <Trash2 size={24} />
              </button>
            </div>
            
            {/* Post Content Area */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                  <img 
                    src="/placeholder-avatar.svg" 
                    alt="User" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/200x200?text=User';
                    }}
                  />
                </div>
                
                {/* Text Input Area */}
                <div className="flex-1">
                  <textarea
                    placeholder="What's Happening?"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="w-full border-none outline-none resize-none text-lg min-h-[100px]"
                  />
                </div>
              </div>

              {/* Media Preview */}
              {previewUrls.length > 0 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Preview ${index}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button 
                        onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Media Buttons and Post Button */}
            <div className="p-4 flex justify-between items-center border-t border-gray-100">
              <div className="flex gap-2">
                <label htmlFor="image-upload" className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                  <Image size={20} className="text-gray-500" />
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <label htmlFor="video-upload" className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                  <Video size={20} className="text-gray-500" />
                  <input 
                    id="video-upload" 
                    type="file"
                    accept="video/*" 
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MapPin size={20} className="text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Tag size={20} className="text-gray-500" />
                </button>
              </div>
              
              <Button 
                onClick={handlePost}
                className="bg-primary-magenta text-white hover:bg-primary-magenta/90 px-6 rounded-full"
                disabled={!postText.trim() && selectedFiles.length === 0}
              >
                Post
              </Button>
            </div>
            
            {/* Category Tabs */}
            <div className="p-4 flex justify-between border-t border-gray-100">
              <button 
                onClick={() => setPostType('comment')}
                className={`flex-1 py-2 text-center ${postType === 'comment' ? 'border-b-2 border-primary-magenta text-primary-magenta font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Comment
              </button>
              <button 
                onClick={() => setPostType('hospital')}
                className={`flex-1 py-2 text-center ${postType === 'hospital' ? 'border-b-2 border-primary-magenta text-primary-magenta font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Hospital
              </button>
              <button 
                onClick={() => setPostType('organization')}
                className={`flex-1 py-2 text-center ${postType === 'organization' ? 'border-b-2 border-primary-magenta text-primary-magenta font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
