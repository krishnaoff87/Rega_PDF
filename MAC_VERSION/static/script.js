
// --- Tool State ---
let currentTool = 'compress';

const toolConfig = {
    'compress': {
        title: '<i class="fas fa-compress mr-2 text-cyan-400"></i> Compress PDF',
        accept: '.pdf',
        multiple: true,
        showQuality: true,
        showWantedSize: true,
        btnText: 'Compress PDFs',
        btnIcon: 'fa-bolt',
        endpoint: '/compress'
    },
    'pdf-to-img': {
        title: '<i class="fas fa-file-image mr-2 text-cyan-400"></i> PDF to Image',
        accept: '.pdf',
        multiple: true,
        showQuality: false,
        showWantedSize: false,
        btnText: 'Convert to Image',
        btnIcon: 'fa-magic',
        endpoint: '/api/convert/pdf-to-img'
    },
    'img-to-pdf': {
        title: '<i class="fas fa-images mr-2 text-cyan-400"></i> Image to PDF',
        accept: 'image/*',
        multiple: true,
        showQuality: false,
        showWantedSize: false,
        btnText: 'Convert to PDF',
        btnIcon: 'fa-magic',
        endpoint: '/api/convert/img-to-pdf'
    },
    'merge': {
        title: '<i class="fas fa-object-group mr-2 text-purple-400"></i> Merge PDFs',
        accept: '.pdf',
        multiple: true,
        showQuality: false,
        showWantedSize: false,
        btnText: 'Merge PDFs',
        btnIcon: 'fa-compress-arrows-alt',
        endpoint: '/api/convert/merge'
    },
    'pdf-to-word': {
        title: '<i class="fas fa-file-word mr-2 text-blue-400"></i> PDF to Word',
        accept: '.pdf',
        multiple: false,
        showQuality: false,
        showWantedSize: false,
        btnText: 'Convert to Word',
        btnIcon: 'fa-file-word',
        endpoint: '/api/convert/pdf-to-word'
    },
    'pdf-to-excel': {
        title: '<i class="fas fa-file-excel mr-2 text-green-400"></i> PDF to Excel',
        accept: '.pdf',
        multiple: false,
        showQuality: false,
        showWantedSize: false,
        btnText: 'Convert to Excel',
        btnIcon: 'fa-file-excel',
        endpoint: '/api/convert/pdf-to-excel'
    }
};

function initToolSwitcher() {
    // Keyboard shortcut for Back to Home
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !toolView.classList.contains('hidden')) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                backBtn.click();
            }
        }
    });

    const homeView = document.getElementById('homeView');
    const toolView = document.getElementById('toolView');
    const backBtn = document.getElementById('backToHomeBtn');
    const fileInput = document.getElementById('fileInput');
    const qualityContainer = document.getElementById('qualityOptionsContainer');
    const wantedSizeBtn = document.getElementById('wantedSizeBtn');
    const compressBtn = document.getElementById('compressBtn');
    const toolTitle = document.getElementById('toolTitle');
    const uploadPrompt = document.querySelector('#uploadArea p.text-lg');
    const uploadIcon = document.querySelector('#uploadArea i.fas');
    
    document.querySelectorAll('.tool-tile').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTool = btn.getAttribute('data-tool');
            const conf = toolConfig[currentTool];
            
            // Update UI for tool
            toolTitle.innerHTML = conf.title;
            fileInput.accept = conf.accept;
            if(conf.multiple) {
                fileInput.setAttribute('multiple', '');
                uploadPrompt.textContent = `Drop ${conf.accept === '.pdf' ? 'PDF' : 'Image'} files here or click to browse`;
            } else {
                fileInput.removeAttribute('multiple');
                uploadPrompt.textContent = `Drop a ${conf.accept === '.pdf' ? 'PDF' : 'Image'} file here or click to browse`;
            }
            
            if(conf.showQuality) qualityContainer?.classList.remove('hidden');
            else qualityContainer?.classList.add('hidden');
            
            if(conf.showWantedSize) wantedSizeBtn?.classList.remove('hidden');
            else wantedSizeBtn?.classList.add('hidden');
            
            
            
            const existingWarning = document.getElementById('ocrWarning');
            if (existingWarning) existingWarning.remove();
            
            if (currentTool === 'pdf-to-word' || currentTool === 'pdf-to-excel') {
                const warningDiv = document.createElement('div');
                warningDiv.id = 'ocrWarning';
                warningDiv.className = 'mt-4 bg-yellow-900/40 border border-yellow-500/50 rounded-xl p-4 text-center';
                warningDiv.innerHTML = `
                    <i class="fas fa-info-circle text-yellow-400 mb-2 text-xl"></i>
                    <p class="text-sm text-yellow-200"><strong>Note:</strong> This tool extracts raw text from Digital PDFs perfectly. However, it does not support OCR. If you upload a <em>Scanned PDF</em> (a picture of a document), it will not be able to read the text.</p>
                `;
                document.getElementById('uploadArea').parentNode.insertBefore(warningDiv, compressBtn);
            }

            
            if (currentTool === 'pdf-to-img') {
                document.getElementById('extraFieldsContainer')?.classList.remove('hidden');
                document.getElementById('formatSelectorContainer')?.classList.remove('hidden');
            } else {
                document.getElementById('formatSelectorContainer')?.classList.add('hidden');
            }
            
            if (currentTool === 'img-to-pdf') {
                document.getElementById('extraFieldsContainer')?.classList.remove('hidden');
                document.getElementById('passwordContainer')?.classList.remove('hidden');
            } else {
                document.getElementById('passwordContainer')?.classList.add('hidden');
            }
            
            if (currentTool !== 'pdf-to-img' && currentTool !== 'img-to-pdf') {
                document.getElementById('extraFieldsContainer')?.classList.add('hidden');
            }
    
            compressBtn.innerHTML = `<i class="fas ${conf.btnIcon} mr-2"></i> ${conf.btnText}`;
            if(currentTool === 'compress') compressBtn.className = 'w-full neon-yellow-btn font-bold py-4 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed';
            else compressBtn.className = 'w-full bg-cyan-600 text-white shadow-[0_0_15px_rgba(0,243,255,0.4)] font-bold py-4 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500 transition-colors';
            
            if(currentTool === 'merge') compressBtn.className = 'w-full bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] font-bold py-4 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500 transition-colors';
            if(currentTool === 'pdf-to-word') compressBtn.className = 'w-full bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] font-bold py-4 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors';
            if(currentTool === 'pdf-to-excel') compressBtn.className = 'w-full bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] font-bold py-4 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 transition-colors';

            // Switch views
            selectedFiles = [];
            updateFileList();
            resetUIForNewCompression();
            
            homeView.classList.add('hidden');
            toolView.classList.remove('hidden');
        });
    });
    
    
    const resetBtn = document.getElementById('resetToolBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            successMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');
            progressContainer.classList.add('hidden');
            selectedFiles = [];
            updateFileList();
            compressBtn.disabled = true;
            compressBtn.classList.remove('pulse-glow');
            if (document.getElementById('pdfPasswordInput')) document.getElementById('pdfPasswordInput').value = '';
        });
    }
    
    backBtn.addEventListener('click', () => {
        // Reset all tasks
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        progressContainer.classList.add('hidden');
        selectedFiles = [];
        updateFileList();
        compressBtn.disabled = true;
        compressBtn.classList.remove('pulse-glow');
        
        toolView.classList.add('hidden');
        homeView.classList.remove('hidden');
    });
}

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
    initToolSwitcher();
    initializeEventListeners();
    initializeQualitySelector();
    initializeSettings();
    
    // Check if running on local desktop app
    const isDesktop = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
    if (isDesktop) {
        const changeFolderBtn = document.getElementById('changeFolderBtn');
        if (changeFolderBtn) changeFolderBtn.classList.remove('hidden');
    }
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
        // Reset state for new session
        successMessage.classList.add('hidden');
        selectedFiles = [];
        fileList.innerHTML = '';
        compressBtn.disabled = true;
    }
    
    const conf = toolConfig[currentTool];
    let validFiles = [];
    
    if (conf.accept === 'image/*') {
        validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (validFiles.length === 0) {
            showError('Please select valid image files');
            return;
        }
    } else {
        validFiles = Array.from(files).filter(file => 
            file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        );
        if (validFiles.length === 0) {
            showError('Please select valid PDF files');
            return;
        }
    }
    
    // If tool only accepts single file, replace selectedFiles
    if (!conf.multiple) {
        selectedFiles = [validFiles[0]];
    } else {
        selectedFiles = [...selectedFiles, ...validFiles];
    }
    
    // Remove duplicates
    selectedFiles = selectedFiles.filter((file, index, self) =>
        index === self.findIndex(f => f.name === file.name && f.size === file.size)
    );
    
    updateFileList();
    updateCompressButton();
    setTimeout(() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'}), 100);
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
    setTimeout(() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'}), 100);
}

// Update Compress Button State

function updateCompressButton() {
    const conf = toolConfig[currentTool];
    if (selectedFiles.length > 0) {
        compressBtn.disabled = false;
        if (wantedSizeBtn && conf.showWantedSize) wantedSizeBtn.disabled = false;
        if(currentTool === 'compress') compressBtn.classList.add('pulse-glow');
        compressBtn.innerHTML = `
            <i class="fas ${conf.btnIcon} mr-2"></i>
            ${conf.btnText} (${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''})
        `;
    } else {
        compressBtn.disabled = true;
        if (wantedSizeBtn) wantedSizeBtn.disabled = true;
        compressBtn.classList.remove('pulse-glow');
        compressBtn.innerHTML = `
            <i class="fas ${conf.btnIcon} mr-2"></i>
            ${conf.btnText}
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
    if (currentTool === 'pdf-to-img') {
        formData.append('format', document.getElementById('imgFormatSelect').value);
    }
    if (currentTool === 'img-to-pdf') {
        formData.append('password', document.getElementById('pdfPasswordInput').value);
    }
    
    
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
        const response = await fetch(toolConfig[currentTool].endpoint, {
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
                    const isDesktop = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
                    if (isDesktop) {
                        await fetch(`/save_to_downloads/${filename}`);
                    } else {
                        const absoluteUrl = new URL(`/download/${filename}`, window.location.href).href;
                        if (typeof Android !== "undefined") {
                            Android.downloadFile(absoluteUrl, filename);
                        } else {
                            const a = document.createElement('a');
                            a.href = absoluteUrl;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                    }
                }
                pdfBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Downloaded!';
                setTimeout(() => { pdfBtn.innerHTML = originalText; window.scrollTo({ top: 0, behavior: 'smooth' }); }, 2000);
            };
            
            // ZIP button
            const zipBtn = document.createElement('button');
            zipBtn.className = 'w-full neon-yellow-btn font-bold py-4 rounded-xl';
            zipBtn.innerHTML = '<i class="fas fa-file-archive mr-2"></i>Download ZIP';
            zipBtn.onclick = async () => {
                const originalText = zipBtn.innerHTML;
                zipBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Downloading...';
                const filename = data.zip_url.split('/').pop();
                const absoluteUrl = new URL(`/download/${filename}`, window.location.href).href;
                    if (typeof Android !== "undefined") {
                        Android.downloadFile(absoluteUrl, filename);
                    } else {
                        const a = document.createElement('a');
                        a.href = absoluteUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                zipBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Downloaded!';
                setTimeout(() => { zipBtn.innerHTML = originalText; window.scrollTo({ top: 0, behavior: 'smooth' }); }, 2000);
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
                const absoluteUrl = new URL(`/download/${filename}`, window.location.href).href;
                    if (typeof Android !== "undefined") {
                        Android.downloadFile(absoluteUrl, filename);
                    } else {
                        const a = document.createElement('a');
                        a.href = absoluteUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                pdfBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Downloaded!';
                setTimeout(() => { pdfBtn.innerHTML = originalText; window.scrollTo({ top: 0, behavior: 'smooth' }); }, 2000);
            };
            downloadButtons.appendChild(pdfBtn);
        }
        
        // Show success
        progressContainer.classList.add('hidden');
        successMessage.classList.remove('hidden');
        setTimeout(() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'}), 100);
        
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



window.powerDownApp = function() {
    const exitBtn = document.getElementById('exitBtn');
    exitBtn.innerHTML = "TURNING OFF...";
    exitBtn.style.pointerEvents = 'none';
    exitBtn.style.background = 'transparent';
    exitBtn.style.color = '#450a0a';
    exitBtn.style.borderColor = '#450a0a';
    exitBtn.style.boxShadow = 'none';

    // Step 1: Header flickers and dies
    setTimeout(() => {
        document.querySelector('.text-center.mb-8').classList.add('flicker-off');
    }, 500);

    // Step 2: Buttons die one by one
    setTimeout(() => {
        const buttons = document.querySelectorAll('.tool-tile');
        buttons.forEach((btn, index) => {
            setTimeout(() => {
                btn.classList.add('flicker-off');
            }, index * 200); 
        });
    }, 1300);

    // Step 3: Fade entire screen to pure black and tell Python to shutdown
    setTimeout(() => {
        document.getElementById('exitBtnContainer').classList.add('flicker-off');
        document.body.style.transition = "background 2s ease, filter 2s ease";
        document.body.style.background = "#000000";
        document.querySelector('.glass-card').style.transition = "all 2s ease";
        document.querySelector('.glass-card').style.background = "transparent";
        document.querySelector('.glass-card').style.border = "none";
        document.querySelector('.glass-card').style.boxShadow = "none";
        
        setTimeout(() => {
            if (typeof Android !== "undefined") {
                Android.closeApp();
            } else {
                fetch('/api/shutdown', { method: 'POST' }).catch(e => console.log('Shutting down...'));
            }
        }, 2000);
    }, 2500);
}



document.addEventListener("DOMContentLoaded", () => {
    const exitBtn = document.getElementById('exitBtn');
    if (!exitBtn) return;
    
    exitBtn.innerHTML = "<i class='fas fa-power-off mr-2'></i> TURNING ON...";

    // Step 1: Body fades to normal dark blue
    setTimeout(() => {
        document.body.style.background = "#0f172a";
        document.querySelector('.glass-card').style.transition = "all 2s ease";
        document.querySelector('.glass-card').style.background = "";
        document.querySelector('.glass-card').style.border = "";
        document.querySelector('.glass-card').style.boxShadow = "";
    }, 500);

    // Step 2: Header flickers on
    setTimeout(() => {
        document.querySelector('.text-center.mb-8').classList.add('flicker-on');
    }, 1000);

    // Step 3: Buttons flicker on
    setTimeout(() => {
        const buttons = document.querySelectorAll('.tool-tile');
        buttons.forEach((btn, index) => {
            setTimeout(() => {
                btn.classList.add('flicker-on');
            }, index * 200); 
        });
    }, 1800);

    // Step 4: Button turns into normal EXIT
    setTimeout(() => {
        document.body.classList.remove('startup-mode');
        exitBtn.innerHTML = "<i class='fas fa-power-off mr-2'></i> SYSTEM EXIT";
        
        // Clean up classes so hover effects work normally
        setTimeout(() => {
            document.querySelector('.text-center.mb-8').classList.remove('flicker-on');
            document.querySelector('.text-center.mb-8').style.opacity = '1';
            document.querySelectorAll('.tool-tile').forEach(btn => {
                btn.classList.remove('flicker-on');
                btn.style.opacity = '1';
            });
        }, 1000);
    }, 3200);
});
