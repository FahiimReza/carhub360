// Test script to verify export functionality
// This file can be run in the browser console or used for testing

console.log('🧪 Testing Export Functionality...');

// Test 1: Check if ExportModal component is loaded
function testExportModalLoaded() {
    try {
        if (typeof ExportModal === 'function') {
            console.log('✅ ExportModal component loaded successfully');
            return true;
        } else {
            console.error('❌ ExportModal component not found');
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading ExportModal:', error);
        return false;
    }
}

// Test 2: Check if ExportUtils is loaded
function testExportUtilsLoaded() {
    try {
        if (typeof ExportUtils === 'object') {
            console.log('✅ ExportUtils loaded successfully');
            return true;
        } else {
            console.error('❌ ExportUtils not found');
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading ExportUtils:', error);
        return false;
    }
}

// Test 3: Check if AdminDashboard is updated with export functionality
function testAdminDashboardIntegration() {
    try {
        // Check if we're on the admin page
        if (window.location.pathname.includes('admin.html') || window.location.pathname === '/admin') {
            // Look for the export button
            const exportButton = document.querySelector('button:has(.icon-download)');
            if (exportButton) {
                console.log('✅ Export button found in AdminDashboard');
                return true;
            } else {
                console.error('❌ Export button not found in AdminDashboard');
                return false;
            }
        } else {
            console.log('ℹ️ Not on admin page, skipping AdminDashboard test');
            return true;
        }
    } catch (error) {
        console.error('❌ Error testing AdminDashboard integration:', error);
        return false;
    }
}

// Test 4: Test CSV data formatting
function testCSVFormatting() {
    try {
        const testData = [
            { id: 1, name: 'Test Car', price: 150000, description: 'A test car with "quotes" and, commas' },
            { id: 2, name: 'Another Car', price: 200000, description: 'Normal description' }
        ];
        
        // Test CSV escaping
        const escapedField = ExportUtils.escapeCSVField('Test with "quotes" and, commas');
        if (escapedField === '"Test with ""quotes"" and, commas"') {
            console.log('✅ CSV field escaping works correctly');
            return true;
        } else {
            console.error('❌ CSV field escaping failed');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing CSV formatting:', error);
        return false;
    }
}

// Test 5: Test filename generation
function testFilenameGeneration() {
    try {
        const filename = ExportUtils.generateFilename('cars', 'csv');
        const expectedPattern = /^cars-export-\d{4}-\d{2}-\d{2}\.csv$/;
        
        if (expectedPattern.test(filename)) {
            console.log('✅ Filename generation works correctly');
            console.log(`   Generated filename: ${filename}`);
            return true;
        } else {
            console.error('❌ Filename generation failed');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing filename generation:', error);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('\n🚀 Starting Export Functionality Tests...\n');
    
    const results = [
        testExportModalLoaded(),
        testExportUtilsLoaded(),
        testAdminDashboardIntegration(),
        testCSVFormatting(),
        testFilenameGeneration()
    ];
    
    const passedTests = results.filter(result => result).length;
    const totalTests = results.length;
    
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Export functionality is ready to use.');
    } else {
        console.log('⚠️ Some tests failed. Please check the errors above.');
    }
    
    return passedTests === totalTests;
}

// Test API endpoint (requires server to be running)
async function testExportAPI() {
    try {
        console.log('\n🌐 Testing Export API endpoint...');
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('ℹ️ No admin token found. Please log in as admin to test API.');
            return false;
        }
        
        const response = await fetch('/api/admin/export?type=cars&format=csv', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Export API endpoint responding correctly');
            return true;
        } else {
            console.error(`❌ Export API returned status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing Export API:', error);
        return false;
    }
}

// Export test functions for use in browser console
window.ExportTests = {
    runAllTests,
    testExportModalLoaded,
    testExportUtilsLoaded,
    testAdminDashboardIntegration,
    testCSVFormatting,
    testFilenameGeneration,
    testExportAPI
};

// Auto-run tests if this script is loaded
if (typeof window !== 'undefined') {
    console.log('🔧 Export tests loaded. Run ExportTests.runAllTests() to test functionality.');
}