import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";

export default function BloodTestVisualization() {
  return (
    <section
      className="bg-gradient-to-r from-[#D9525E] to-primary-magenta text-white p-14 my-16 rounded-3xl max-w-7xl mx-auto"
      data-scroll
      data-scroll-speed="0.1"
    >
      <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        <div className="space-y-6 max-w-md">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Visualize your Blood test report
          </h2>
          <p className="text-white/90">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget
            dolor. Aenean massa.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="bg-white text-primary-magenta hover:bg-white/90 hover:text-primary-magenta/90 rounded-full px-8"
          >
            Upload
          </Button>
        </div>

        <div className="bg-white/20 border border-white/20 rounded-2xl p-6 shadow-lg w-full max-w-sm relative">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm z-10">
            <div className="text-center mb-2">
              <span className="text-primary-magenta text-sm font-medium">UPLOAD PDF</span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <CloudUpload className="text-gray-400" size={40} />
              </div>
              <p className="text-primary-magenta text-base font-medium">Drag & Drop</p>
              <p className="text-gray-400 text-xs mt-1">
                Upload your PDF for visualization
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
