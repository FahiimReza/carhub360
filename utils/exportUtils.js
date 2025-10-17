// Export utility functions for different formats
class ExportUtils {
    
    // Convert CSV to Excel format (simplified version)
    static convertToExcel(csvData, filename) {
        // For now, we'll return the CSV as-is
        // In a real implementation, you would use a library like xlsx
        // This is a placeholder for Excel export functionality
        return csvData;
    }
    
    // Convert CSV data to PDF format using jsPDF
    static convertToPDF(csvData, filename) {
        try {
            // Check if jsPDF is available
            if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
                console.error('jsPDF library not loaded');
                return csvData; // Fallback to CSV
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Parse CSV data
            const lines = csvData.split('\n').filter(line => line.trim());
            if (lines.length === 0) return csvData;
            
            // Parse headers and data
            const headers = lines[0].split(',').map(header =>
                header.replace(/^"(.*)"$/, '$1').trim()
            );
            const data = lines.slice(1).map(line =>
                line.split(',').map(cell => cell.replace(/^"(.*)"$/, '$1').trim())
            );
            
            // Add title to PDF
            const exportType = filename.split('-')[0] || 'Report';
            doc.setFontSize(18);
            doc.text(`${exportType.charAt(0).toUpperCase() + exportType.slice(1)} Report`, 14, 15);
            
            // Add date
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);
            
            // Add table using autoTable plugin
            if (typeof doc.autoTable !== 'undefined') {
                doc.autoTable({
                    head: [headers],
                    body: data,
                    startY: 35,
                    styles: {
                        fontSize: 8,
                        cellPadding: 2,
                        overflow: 'linebreak'
                    },
                    headStyles: {
                        fillColor: [66, 139, 202],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    margin: { top: 35, left: 14, right: 14 }
                });
            } else {
                // Fallback if autoTable is not available
                let yPosition = 35;
                doc.setFontSize(10);
                
                // Add headers
                headers.forEach((header, index) => {
                    doc.text(header, 14 + (index * 30), yPosition);
                });
                
                yPosition += 10;
                
                // Add data rows
                data.forEach(row => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    row.forEach((cell, index) => {
                        doc.text(cell.substring(0, 20), 14 + (index * 30), yPosition);
                    });
                    yPosition += 7;
                });
            }
            
            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
                doc.text('CarHub360 Export System', 14, doc.internal.pageSize.height - 10);
            }
            
            // Return PDF as blob
            return doc.output('blob');
            
        } catch (error) {
            console.error('PDF generation error:', error);
            return csvData; // Fallback to CSV
        }
    }
    
    // Format currency for exports
    static formatCurrency(amount) {
        if (!amount || isNaN(amount)) return '0';
        return parseFloat(amount).toLocaleString('en-BD', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }
    
    // Format date for exports
    static formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    // Escape CSV fields
    static escapeCSVField(field) {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        // If field contains comma, newline, or quotes, wrap in quotes and escape internal quotes
        if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    }
    
    // Generate filename with timestamp
    static generateFilename(type, format) {
        const timestamp = new Date().toISOString().split('T')[0];
        return `${type}-export-${timestamp}.${format}`;
    }
    
    // Create download link for blob data
    static downloadBlob(data, filename, mimeType = 'text/csv') {
        let blob;
        
        if (data instanceof Blob) {
            blob = data;
        } else {
            blob = new Blob([data], { type: mimeType });
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
    
    // Handle export progress
    static async exportWithProgress(exportFunction, progressCallback) {
        try {
            progressCallback(10);
            const result = await exportFunction();
            progressCallback(70);
            return result;
        } catch (error) {
            console.error('Export error:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportUtils;
}