import { useState } from 'react';
import { Eye, Trash2, BarChart2, Download } from 'lucide-react';
import UploadZone from './components/UploadZone';
import ResultsDisplay from './components/ResultsDisplay';

interface ExtractedData {
  barcode: string | null;
  category_type: string | null;
  segment_type: string | null;
  manufacturer: string | null;
  brand: string | null;
  product_name: string | null;
  weight: string | null;
  unit: string | null;
  packaging_type: string | null;
  country_of_origin: string | null;
  promotional_messages: string | null;
}

interface ConfidenceScores {
  barcode: 'high' | 'low';
  category_type: 'high' | 'low';
  segment_type: 'high' | 'low';
  manufacturer: 'high' | 'low';
  brand: 'high' | 'low';
  product_name: 'high' | 'low';
  weight_and_unit: 'high' | 'low';
  packaging_type: 'high' | 'low';
  country_of_origin: 'high' | 'low';
  promotional_messages: 'high' | 'low';
}

interface ExtractionResult {
  extracted_data: ExtractedData;
  confidence_scores: ConfidenceScores;
}

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setExtractionResult(null);
      setIsProcessing(true);
      setTimeout(() => {
        // Extraction logic not implemented yet. Remove the mock data handler when adding real API calls.
        setIsProcessing(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setExtractionResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 sm:mb-4">
            Product Image to IMDB Extractor
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-slate-600 px-2">
            Upload a product image to extract retail attributes with AI-powered analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* On mobile: upload first, results below. On desktop: results left, upload right */}
          <div className="lg:hidden">
            <UploadZone
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onReset={handleReset}
              isProcessing={isProcessing}
            />
          </div>

          {/* Left Column - Results */}
          <div>
            <ResultsDisplay
              extractionResult={extractionResult}
              isProcessing={isProcessing}
            />
          </div>

          {/* Right Column - Upload (desktop only) */}
          <div className="hidden lg:block">
            <UploadZone
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onReset={handleReset}
              isProcessing={isProcessing}
            />
          </div>
        </div>

        {/* Action Buttons — below the main interface */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold text-sm">
            <Eye className="w-4 h-4" />
            View Record
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm">
            <Trash2 className="w-4 h-4" />
            Delete Record
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-semibold text-sm">
            <BarChart2 className="w-4 h-4" />
            View Stats
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
