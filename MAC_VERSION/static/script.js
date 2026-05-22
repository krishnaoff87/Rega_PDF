// PDF Compressor Frontend Logic

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadForm = document.getElementById('uploadForm');
const compressBtn = document.getElementById('compressBtn');
const progressContainer = document.getElementById('progressContainer');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

const wantedSizeBtn = document.getElementById('wantedSizeBtn');
const wantedSizeModal = document.getElementById('wantedSizeModal');
const closeWantedSizeBtn = document.getElementById('closeWantedSizeBtn');
const applyWantedSizeBtn = document.getElementById('applyWantedSizeBtn');
const wantedSizeInput = document.getElementById('wantedSizeInput');

const qualityWarningModal = document.getElementById('qualityWarningModal');
const cancelWarningBtn = document.getElementById('cancelWarningBtn');
const proceedWarningBtn = document.getElementById('proceedWarningBtn');

// State
let selectedFiles = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeQualitySelector();
    initializeSettings();
});

// Initialize Settings
function initializeSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const changeFolderBtn = document.getElementById('changeFolderBtn');
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const currentFolderText = document.getElementById('currentFolderText');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
        
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
        
        changeFolderBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/change_download_folder', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    currentFolderText.textContent = 'Saving to: ' + data.folder;
                }
            } catch (e) {
                console.error(e);
            }
        });
        
        clearCacheBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/clear_cache', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    alert(data.message);
                    resetForm();
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (e) {
                console.error(e);
            }
        });
    }
}

// Event Listeners
function initializeEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFileSelect(e.dataTransfer.files);
    });
    
    // Form submit
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        compressPDFs();
    });
    
    // Wanted Size Logic
    if (wantedSizeBtn) {
        wantedSizeBtn.addEventListener('click', () => {
            wantedSizeModal.classList.remove('hidden');
        });
        
        const wantedSizeUnit = document.getElementById('wantedSizeUnit');
        if (wantedSizeUnit) {
            wantedSizeUnit.addEventListener('change', (e) => {
                if (e.target.value === 'KB') {
                    wantedSizeInput.step = '1';
                    wantedSizeInput.min = '1';
                    wantedSizeInput.placeholder = 'e.g. 500';
                    if (wantedSizeInput.value) {
                        wantedSizeInput.value = Math.round(parseFloat(wantedSizeInput.value));
                    }
                } else {
                    wantedSizeInput.step = '0.1';
                    wantedSizeInput.min = '0.1';
                    wantedSizeInput.placeholder = 'e.g. 5.0';
                }
            });
        }
        
        closeWantedSizeBtn.addEventListener('click', () => {
            wantedSizeModal.classList.add('hidden');
        });
        
        applyWantedSizeBtn.addEventListener('click', () => {
            const targetVal = parseFloat(wantedSizeInput.value);
            const targetUnit = document.getElementById('wantedSizeUnit').value;
            
            if (!targetVal || targetVal <= 0) {
                showError("Please enter a valid target size.");
                return;
            }
            
            const targetBytes = targetUnit === 'MB' ? targetVal * 1024 * 1024 : targetVal * 1024;
            const totalBytes = selectedFiles.reduce((acc, file) => acc + file.size, 0);
            
            wantedSizeModal.classList.add('hidden');
            
            if (targetBytes < totalBytes * 0.3) {
                qualityWarningModal.classList.remove('hidden');
            } else {
                selectScreenQuality();
                compressPDFs();
            }
        });
        
        cancelWarningBtn.addEventListener('click', () => {
            qualityWarningModal.classList.add('hidden');
        });
        
        proceedWarningBtn.addEventListener('click', () => {
            qualityWarningModal.classList.add('hidden');
            selectScreenQuality();
            compressPDFs();
        });
    }
}

// Quality Selector
function initializeQualitySelector() {
    const qualityOptions = document.querySelectorAll('.quality-option');
    
    qualityOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all
            document.querySelectorAll('.quality-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active class to selected
            const card = option.querySelector('.quality-card');
            card.classList.add('active');
            
            // Check the radio button
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;
            
            resetUIForNewCompression();
        });
    });
}

function resetUIForNewCompression() {
    if (selectedFiles.length > 0) {
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        progressContainer.classList.add('hidden');
        updateCompressButton();
    }
}

// File Selection Handler
function handleFileSelect(files) {
    if (!successMessage.classList.contains('hidden')) {
        // Reset state for new session but don't clear these incoming files
        successMessage.classList.add('hidden');
        selectedFiles = [];
        fileList.innerHTML = '';
        compressBtn.disabled = true;
    }
    
    const pdfFiles = Array.from(files).filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length === 0) {
        showError('Please select valid PDF files');
        return;
    }
    
    // Add to selected files
    selectedFiles = [...selectedFiles, ...pdfFiles];
    
    // Remove duplicates based on name and size
    selectedFiles = selectedFiles.filter((file, index, self) =>
        index === self.findIndex(f => f.name === file.name && f.size === file.size)
    );
    
    updateFileList();
    updateCompressButton();
}

// Update File List Display
function updateFileList() {
    if (selectedFiles.length === 0) {
        fileList.classList.add('hidden');
        return;
    }
    
    fileList.classList.remove('hidden');
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'flex items-center space-x-3';
        fileInfo.innerHTML = `
            <i class="fas fa-file-pdf text-red-500 text-xl"></i>
            <div>
                <div class="font-semibold text-gray-700">${file.name}</div>
                <div class="text-sm text-gray-500">${formatFileSize(file.size)}</div>
            </div>
        `;
        
        const removeBtn = document.createElement('div');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', () => removeFile(index));
        
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);
        fileList.appendChild(fileItem);
    });
}

// Remove File
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateCompressButton();
}

// Update Compress Button State
function updateCompressButton() {
    if (selectedFiles.length > 0) {
        compressBtn.disabled = false;
        if (wantedSizeBtn) wantedSizeBtn.disabled = false;
        compressBtn.classList.add('pulse-glow');
        compressBtn.innerHTML = `
            <i class="fas fa-compress-alt mr-2"></i>
            Compress ${selectedFiles.length} PDF${selectedFiles.length > 1 ? 's' : ''}
        `;
    } else {
        compressBtn.disabled = true;
        if (wantedSizeBtn) wantedSizeBtn.disabled = true;
        compressBtn.classList.remove('pulse-glow');
        compressBtn.innerHTML = `
            <i class="fas fa-compress-alt mr-2"></i>
            Compress PDFs
        `;
    }
}

// Auto-select lowest quality for aggressive compression
function selectScreenQuality() {
    const screenRadio = document.querySelector('input[value="screen"]');
    if (screenRadio) {
        screenRadio.checked = true;
        document.querySelectorAll('.quality-card').forEach(card => card.classList.remove('active'));
        screenRadio.nextElementSibling.classList.add('active');
    }
}

// Generate UUID for task tracking
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Compress PDFs
async function compressPDFs() {
    // Hide messages
    hideMessages();
    
    // Show progress
    progressContainer.classList.remove('hidden');
    compressBtn.disabled = true;
    compressBtn.classList.remove('pulse-glow');
    
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = '0%';
    
    // Get selected quality
    const quality = document.querySelector('input[name="quality"]:checked').value;
    const taskId = uuidv4();
    
    // Create FormData
    const formData = new FormData();
    selectedFiles.forEach(file => {
        formData.append('files[]', file);
    });
    formData.append('quality', quality);
    formData.append('task_id', taskId);
    
    // Start progress polling
    const progressInterval = setInterval(async () => {
        try {
            const res = await fetch(`/progress/${taskId}`);
            const data = await res.json();
            progressBar.style.width = `${data.progress}%`;
        } catch (e) {
            // ignore polling errors
        }
    }, 500);
    
    try {
        const response = await fetch('/compress', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Compression failed');
        }
        
        const data = await response.json();
        
        // Render download buttons
        const downloadButtons = document.getElementById('downloadButtons');
        downloadButtons.innerHTML = '';
        downloadButtons.className = 'flex flex-col space-y-3 w-full mt-2';
        
        if (data.is_multiple) {
            // PDF button (downloads all individually)
            const pdfBtn = document.createElement('button');
            pdfBtn.className = 'w-full neon-yellow-btn font-bold py-4 rounded-xl';
            pdfBtn.innerHTML = '<i class="fas fa-file-pdf mr-2"></i>Download PDFs';
            pdfBtn.onclick = async () => {
                const originalText = pdfBtn.innerHTML;
                pdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Downloading...';
                for (const pdf of data.pdf_urls) {
                    const filename = pdf.url.split('/').pop();
                    await fetch(`/save_to_downloads/${filename}`);
                }
                pdfBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Downloaded!';
                setTimeout(() => pdfBtn.innerHTML = originalText, 2000);
            };
            
            // ZIP button
            const zipBtn = document.createElement('button');
            zipBtn.className = 'w-full neon-yellow-btn font-bold py-4 rounded-xl';
            zipBtn.innerHTML = '<i class="fas fa-file-archive mr-2"></i>Download ZIP';
            zipBtn.onclick = async () => {
                const originalText = zipBtn.innerHTML;
                zipBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Downloading...';
                const filename = data.zip_url.split('/').pop();
                await fetch(`/save_to_downloads/${filename}`);
                zipBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Downloaded!';
                setTimeout(() => zipBtn.innerHTML = originalText, 2000);
            };
            
            downloadButtons.appendChild(pdfBtn);
            downloadButtons.appendChild(zipBtn);
        } else {
            // Single PDF download
            const pdfBtn = document.createElement('button');
            pdfBtn.className = 'w-full neon-yellow-btn font-bold py-4 rounded-xl';
            pdfBtn.innerHTML = '<i class="fas fa-file-pdf mr-2"></i>Download PDF';
            pdfBtn.onclick = async () => {
                const originalText = pdfBtn.innerHTML;
                pdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Downloading...';
                const filename = data.pdf_url.split('/').pop();
                await fetch(`/save_to_downloads/${filename}`);
                pdfBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Downloaded!';
                setTimeout(() => pdfBtn.innerHTML = originalText, 2000);
            };
            downloadButtons.appendChild(pdfBtn);
        }
        
        // Show success
        progressContainer.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
    } catch (error) {
        clearInterval(progressInterval);
        progressContainer.classList.add('hidden');
        showError(error.message);
        compressBtn.disabled = false;
    }
}

// Show Error
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// Hide Messages
function hideMessages() {
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

// Reset Form
function resetForm() {
    selectedFiles = [];
    fileInput.value = '';
    updateFileList();
    updateCompressButton();
    hideMessages();
    compressBtn.disabled = false;
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Prevent default drag behavior on document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Made with Bob
