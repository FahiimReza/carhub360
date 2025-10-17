function ExportModal({ isOpen, onClose }) {
  const [exportType, setExportType] = React.useState('cars');
  const [exportFormat, setExportFormat] = React.useState('csv');
  const [dateRange, setDateRange] = React.useState({
    startDate: '',
    endDate: ''
  });
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  
  const token = localStorage.getItem('token') || '';

  const exportOptions = [
    { 
      value: 'cars', 
      label: 'Car Inventory', 
      icon: 'car',
      description: 'Complete car catalog with specifications and availability'
    },
    { 
      value: 'users', 
      label: 'User Database', 
      icon: 'users',
      description: 'User information and registration data'
    },
    { 
      value: 'bookings', 
      label: 'Bookings & Revenue', 
      icon: 'calendar',
      description: 'Booking history and revenue analytics'
    },
    { 
      value: 'messages', 
      label: 'Customer Messages', 
      icon: 'message-circle',
      description: 'Customer inquiries and communication history'
    },
    { 
      value: 'analytics', 
      label: 'Performance Analytics', 
      icon: 'bar-chart',
      description: 'Platform usage and performance metrics'
    },
    { 
      value: 'services', 
      label: 'Service Reports', 
      icon: 'wrench',
      description: 'Service bookings and maintenance reports'
    }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV (Excel Compatible)', icon: 'file-text' },
    { value: 'excel', label: 'Excel (.xlsx)', icon: 'file-spreadsheet' },
    { value: 'pdf', label: 'PDF Report', icon: 'file-text' }
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(10);

      const queryParams = new URLSearchParams({
        type: exportType,
        format: 'csv', // Always get CSV from backend, convert client-side if needed
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      setExportProgress(30);

      const response = await fetch(`/api/admin/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setExportProgress(70);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get CSV data from response
      const csvData = await response.text();
      
      // Generate filename
      const filename = ExportUtils.generateFilename(exportType, exportFormat);
      
      setExportProgress(90);

      // Convert format if needed and download
      let finalData = csvData;
      let mimeType = 'text/csv';
      
      if (exportFormat === 'excel') {
        finalData = ExportUtils.convertToExcel(csvData, filename);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (exportFormat === 'pdf') {
        finalData = ExportUtils.convertToPDF(csvData, filename);
        // For PDF, the convertToPDF function returns a blob, so we handle it differently
        if (finalData instanceof Blob) {
          ExportUtils.downloadBlob(finalData, filename, 'application/pdf');
        } else {
          // Fallback to CSV if PDF generation failed
          ExportUtils.downloadBlob(finalData, filename, 'text/csv');
        }
        setExportProgress(100);
        
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
          onClose();
        }, 1000);
        
        return; // Exit early since we already handled the download
      }
      
      ExportUtils.downloadBlob(finalData, filename, mimeType);

      setExportProgress(100);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const resetForm = () => {
    setExportType('cars');
    setExportFormat('csv');
    setDateRange({ startDate: '', endDate: '' });
    setIsExporting(false);
    setExportProgress(0);
  };

  const handleClose = () => {
    if (!isExporting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            Export Reports
          </h3>
          <button 
            onClick={handleClose} 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            disabled={isExporting}
          >
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        {/* Export Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Select Report Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exportOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setExportType(option.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  exportType === option.value
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`icon-${option.icon} text-lg ${
                    exportType === option.value ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'
                  }`}></div>
                  <div>
                    <div className={`font-semibold ${
                      exportType === option.value ? 'text-[var(--primary-color)]' : 'text-[var(--text-primary)]'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {formatOptions.map(format => (
              <button
                key={format.value}
                onClick={() => setExportFormat(format.value)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  exportFormat === format.value
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`icon-${format.icon} text-lg mb-1 ${
                  exportFormat === format.value ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'
                }`}></div>
                <div className={`text-sm font-medium ${
                  exportFormat === format.value ? 'text-[var(--primary-color)]' : 'text-[var(--text-primary)]'
                }`}>
                  {format.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Date Range (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                disabled={isExporting}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">End Date</label>
              <input
                type="date"
                className="input-field"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                disabled={isExporting}
              />
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Leave empty to export all data
          </p>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[var(--text-primary)]">Exporting...</span>
              <span className="text-sm text-[var(--text-primary)]">{exportProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-[var(--primary-color)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Exporting...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <div className="icon-download mr-2"></div>
                Export Report
              </span>
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="px-6 py-3 border border-white/20 rounded-lg text-[var(--text-secondary)] hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>

        {/* Export Tips */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Export Tips:
          </h4>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• CSV format is best for data analysis in Excel</li>
            <li>• Excel format includes formatting and multiple sheets</li>
            <li>• PDF format is ideal for presentations and reports</li>
            <li>• Large exports may take a few moments to process</li>
          </ul>
        </div>
      </div>
    </div>
  );
}