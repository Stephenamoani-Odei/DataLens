import { useState } from 'react';
import { Eye, Trash2, BarChart2, Download, X, Pencil, Save } from 'lucide-react';
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

const FIELD_LABELS: { key: keyof ExtractedData; label: string }[] = [
  { key: 'barcode', label: 'Barcode' },
  { key: 'category_type', label: 'Category Type' },
  { key: 'segment_type', label: 'Segment Type' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'brand', label: 'Brand' },
  { key: 'product_name', label: 'Product Name' },
  { key: 'weight', label: 'Weight' },
  { key: 'unit', label: 'Unit' },
  { key: 'packaging_type', label: 'Packaging Type' },
  { key: 'country_of_origin', label: 'Country of Origin' },
  { key: 'promotional_messages', label: 'Promotional Messages' },
];

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<ExtractedData | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setExtractionResult(null);
      setIsProcessing(true);
      setTimeout(() => {
       
      // Simulate extraction result
      
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

  const openViewModal = () => {
    if (!extractionResult) return;
    setEditDraft({ ...extractionResult.extracted_data });
    setIsEditing(false);
    setShowViewModal(true);
  };

  const handleSaveEdit = () => {
    if (!extractionResult || !editDraft) return;
    setExtractionResult({ ...extractionResult, extracted_data: editDraft });
    setIsEditing(false);
  };

  const handleDeleteRecord = () => {
    setShowViewModal(false);
    setIsEditing(false);
    handleReset();
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setIsEditing(false);
    setEditDraft(null);
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
          {/* On mobile: upload first, results below */}
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
          <button
            onClick={openViewModal}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold text-sm"
          >
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

      {/* View Record Modal */}
      {showViewModal && extractionResult && editDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Record' : 'View Record'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {FIELD_LABELS.map(({ key, label }) => (
                <div key={key} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-500 w-36 shrink-0 pt-1">{label}</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editDraft[key] ?? ''}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, [key]: e.target.value || null })
                      }
                      className="flex-1 text-sm text-slate-900 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="flex-1 text-sm text-slate-900">
                      {extractionResult.extracted_data[key] ?? (
                        <em className="text-slate-400">Not detected</em>
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer — Edit & Delete */}
            <div className="px-5 py-4 border-t border-slate-200 flex gap-3 shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteRecord}
                    className="flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
