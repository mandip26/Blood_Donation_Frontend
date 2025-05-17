import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Trash2, Image, Video, Mic } from 'lucide-react'

export const Route = createLazyFileRoute('/dashboard/_dashboardLayout/create')({  
  component: CreatePostComponent,
})

function CreatePostComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [postText, setPostText] = useState('')

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handlePost = () => {
    // Handle post submission logic here
    console.log('Post submitted:', postText)
    setPostText('')
    closeModal()
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Button 
          onClick={openModal} 
          className="bg-primary-magenta text-white hover:bg-primary-magenta/90 px-8 py-6 text-lg rounded-xl"
        >
          Create Post
        </Button>
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
              <button className="text-gray-500 hover:text-gray-700">
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
                      e.currentTarget.src = 'https://placehold.co/200x200?text=User'
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
            </div>
            
            {/* Media Buttons and Post Button */}
            <div className="p-4 flex justify-between items-center border-t border-gray-100">
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Image size={20} className="text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Video size={20} className="text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Mic size={20} className="text-gray-500" />
                </button>
              </div>
              
              <Button 
                onClick={handlePost}
                className="bg-primary-magenta text-white hover:bg-primary-magenta/90 px-6 rounded-full"
                disabled={!postText.trim()}
              >
                Post
              </Button>
            </div>
            
            {/* Category Tabs */}
            <div className="p-4 flex justify-between border-t border-gray-100">
              <button className="flex-1 py-2 text-center border-b-2 border-primary-magenta text-primary-magenta font-medium">
                Comment
              </button>
              <button className="flex-1 py-2 text-center text-gray-500 hover:text-gray-700">
                Hospital
              </button>
              <button className="flex-1 py-2 text-center text-gray-500 hover:text-gray-700">
                Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
