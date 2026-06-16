import { useState } from 'react';
import { Package, FileDown, FileSpreadsheet, Eye, Trash2, BarChart2, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import AttributeCard from './AttributeCard';

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

interface ResultsDisplayProps {
  extractionResult: ExtractionResult | null;
  isProcessing: boolean;
  onDelete?: () => void;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export default function ResultsDisplay({ extractionResult, isProcessing, onDelete }: ResultsDisplayProps) {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  if (!extractionResult && !isProcessing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center h-full flex flex-col items-center justify-center min-h-64">
        <Package className="w-16 h-16 sm:w-24 sm:h-24 text-slate-300 mb-6" />
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3">No Results Yet</h3>
        <p className="text-slate-600 text-sm sm:text-base">Upload a product image to see extracted IMDB attributes</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center h-full flex flex-col items-center justify-center min-h-64">
        <div className="animate-pulse">
          <Package className="w-16 h-16 sm:w-24 sm:h-24 text-blue-400 mb-6" />
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3">Processing...</h3>
          <p className="text-slate-600 text-sm sm:text-base">Extracting product attributes with AI</p>
        </div>
      </div>
    );
  }

  if (!extractionResult) return null;

  const { extracted_data, confidence_scores } = extractionResult;

  const attributes = [
    { label: 'Barcode', key: 'barcode', value: extracted_data.barcode, confidence: confidence_scores.barcode },
    { label: 'Category Type', key: 'category_type', value: extracted_data.category_type, confidence: confidence_scores.category_type },
    { label: 'Segment Type', key: 'segment_type', value: extracted_data.segment_type, confidence: confidence_scores.segment_type },
    { label: 'Manufacturer', key: 'manufacturer', value: extracted_data.manufacturer, confidence: confidence_scores.manufacturer },
    { label: 'Brand', key: 'brand', value: extracted_data.brand, confidence: confidence_scores.brand },
    { label: 'Product Name', key: 'product_name', value: extracted_data.product_name, confidence: confidence_scores.product_name },
    {
      label: 'Weight & Unit',
      key: 'weight_and_unit',
      value: extracted_data.weight && extracted_data.unit ? `${extracted_data.weight} ${extracted_data.unit}` : null,
      confidence: confidence_scores.weight_and_unit,
    },
    { label: 'Packaging Type', key: 'packaging_type', value: extracted_data.packaging_type, confidence: confidence_scores.packaging_type },
    { label: 'Country of Origin', key: 'country_of_origin', value: extracted_data.country_of_origin, confidence: confidence_scores.country_of_origin },
    { label: 'Promotional Messages', key: 'promotional_messages', value: extracted_data.promotional_messages, confidence: confidence_scores.promotional_messages },
  ];

  const highConfidenceCount = Object.values(confidence_scores).filter((s) => s === 'high').length;
  const lowConfidenceCount = 10 - highConfidenceCount;
  const percentageScore = (highConfidenceCount / 10) * 100;
  const detectedCount = attributes.filter((a) => a.value !== null).length;

  let status: 'passed' | 'failed' | 'warning';
  let statusColor: string;
  let statusBgColor: string;
  let statusBorderColor: string;
  let statusText: string;

  if (percentageScore >= 85) {
    status = 'passed';
    statusColor = 'text-green-700';
    statusBgColor = 'bg-green-100';
    statusBorderColor = 'border-green-300';
    statusText = 'PASSED';
  } else if (percentageScore < 50) {
    status = 'failed';
    statusColor = 'text-red-700';
    statusBgColor = 'bg-red-100';
    statusBorderColor = 'border-red-300';
    statusText = 'FAILED';
  } else {
    status = 'warning';
    statusColor = 'text-amber-700';
    statusBgColor = 'bg-amber-100';
    statusBorderColor = 'border-amber-300';
    statusText = 'NEEDS REVIEW';
  }

  const buildRows = () =>
    attributes.map((attr) => ({
      Attribute: attr.label,
      Value: attr.value ?? '',
      Confidence: attr.confidence === 'high' ? 'High' : 'Low',
    }));

  const handleExportCSV = () => {
    const rows = buildRows();
    const csvLines = [
      ['Attribute', 'Value', 'Confidence'].join(','),
      ...rows.map((r) => [r.Attribute, `"${(r.Value ?? '').replace(/"/g, '""')}"`, r.Confidence].join(',')),
      '',
      `Overall Score,${percentageScore}%,${statusText}`,
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-extraction.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const rows = buildRows();
    const ws = XLSX.utils.json_to_sheet([...rows, {}, { Attribute: 'Overall Score', Value: `${percentageScore}%`, Confidence: statusText }]);
    ws['!cols'] = [{ wch: 22 }, { wch: 40 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Extraction Results');
    XLSX.writeFile(wb, 'product-extraction.xlsx');
    setShowExportModal(false);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        {/* Status Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Extracted Attributes</h2>

          {/* Score Card */}
          <div className={`${statusBgColor} rounded-lg p-3 sm:p-4 border-2 ${statusBorderColor}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className={`text-3xl sm:text-5xl font-bold mb-1 ${statusColor}`}>{percentageScore}%</div>
                <div className="text-xs sm:text-sm text-slate-600">{highConfidenceCount}/10 High Confidence Attributes</div>
              </div>
              <div className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-lg ${statusBgColor} ${statusColor} border-2 ${
                status === 'passed' ? 'border-green-400' : status === 'failed' ? 'border-red-400' : 'border-amber-400'
              }`}>
                {statusText}
              </div>
            </div>
          </div>

          {/* Threshold Info */}
          <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>≥85% Pass</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span>50–84% Review</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>&lt;50% Fail</span></div>
          </div>
        </div>

        {/* Attribute Cards */}
        <div className="space-y-2 sm:space-y-3">
          {attributes.map((attr, index) => (
            <AttributeCard key={index} label={attr.label} value={attr.value} confidence={attr.confidence} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setShowViewModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold text-xs sm:text-sm"
          >
            <Eye className="w-4 h-4" />
            View Record
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-xs sm:text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-semibold text-xs sm:text-sm"
          >
            <BarChart2 className="w-4 h-4" />
            View Stats
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-xs sm:text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* View Record Modal */}
      {showViewModal && (
        <Modal title="Record Details" onClose={() => setShowViewModal(false)}>
          <div className="space-y-3">
            {attributes.map((attr, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm font-medium text-slate-600 min-w-[130px]">{attr.label}</span>
                <span className="text-sm text-slate-900 text-right">{attr.value ?? <em className="text-slate-400">Not detected</em>}</span>
              </div>
            ))}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Overall Score</span>
              <span className={`font-bold text-sm ${statusColor}`}>{percentageScore}% — {statusText}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <Modal title="Extraction Statistics" onClose={() => setShowStatsModal(false)}>
          <div className="space-y-4">
            {/* Score bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Confidence Score</span>
                <span className={`font-bold ${statusColor}`}>{percentageScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${status === 'passed' ? 'bg-green-500' : status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${percentageScore}%` }}
                />
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">{highConfidenceCount}</div>
                <div className="text-xs text-green-600 mt-0.5">High Confidence</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-700">{lowConfidenceCount}</div>
                <div className="text-xs text-amber-600 mt-0.5">Low Confidence</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{detectedCount}</div>
                <div className="text-xs text-blue-600 mt-0.5">Fields Detected</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-slate-700">{10 - detectedCount}</div>
                <div className="text-xs text-slate-500 mt-0.5">Not Detected</div>
              </div>
            </div>

            {/* Per-attribute breakdown */}
            <div className="mt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Per-Attribute Confidence</p>
              <div className="space-y-1.5">
                {attributes.map((attr, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 truncate flex-1">{attr.label}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${attr.confidence === 'high' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {attr.confidence === 'high' ? 'High' : 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <Modal title="Delete Record" onClose={() => setShowDeleteConfirm(false)}>
          <p className="text-slate-600 text-sm mb-6">Are you sure you want to delete this extraction record? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Modal title="Export Data" onClose={() => setShowExportModal(false)}>
          <div className="space-y-3">
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-left"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-emerald-800">Export as Excel (.xlsx)</div>
                <div className="text-xs text-emerald-600">Formatted spreadsheet with all attributes</div>
              </div>
            </button>
            <button
              onClick={() => { handleExportCSV(); setShowExportModal(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <FileDown className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-blue-800">Export as CSV (.csv)</div>
                <div className="text-xs text-blue-600">Comma-separated values for data tools</div>
              </div>
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
