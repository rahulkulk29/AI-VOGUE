# Add Fashion Designers Section to tshirt-customizer.html

$htmlFile = "c:\Users\RAHUL\Desktop\rahul\AI-VOGUE\AI-VOGUE\creative-threads-complete\tshirt-printing\tshirt-customizer.html"
$content = Get-Content $htmlFile -Raw

# 1. Add CSS link in head
$cssLink = '    <link rel="stylesheet" href="fashion-designers.css">'
if ($content -notmatch "fashion-designers.css") {
    $content = $content -replace '(mobile-responsive\.css">)', "`$1`r`n$cssLink"
    Write-Host "✓ Added CSS link" -ForegroundColor Green
} else {
    Write-Host "○ CSS link already exists" -ForegroundColor Yellow
}

# 2. Add HTML section after line with zoom-controls closing div
$htmlSection = @'

                    <!-- Fashion Designers Section -->
                    <div class="fashion-designers-section">
                        <div class="designers-header">
                            <h3>Find Local T-Shirt Printing Services</h3>
                            <p class="designers-subtitle">Connect with professional printing services in your city</p>
                        </div>

                        <!-- City Selection -->
                        <div class="city-selector-container">
                            <label for="designerCitySelect" class="city-label">SELECT YOUR CITY</label>
                            <select id="designerCitySelect" class="city-select">
                                <option value="">Choose a city...</option>
                                <option value="Belgaum">Belgaum</option>
                                <option value="Hubli">Hubli</option>
                                <option value="Hubli/Dharwad">Hubli/Dharwad</option>
                            </select>
                        </div>

                        <!-- Search Bar -->
                        <div class="search-container">
                            <input type="text" id="designerSearchInput" class="search-input" 
                                placeholder="Search by name or location..." disabled>
                            <button id="designerSearchBtn" class="search-btn" disabled>
                                <i class="fas fa-search"></i>
                                <span>Search</span>
                            </button>
                        </div>

                        <p class="search-hint" id="designerSearchHint">Please select a city first</p>

                        <!-- Results Count -->
                        <div class="results-count" id="resultsCount" style="display: none;"></div>

                        <!-- Designers Grid -->
                        <div class="designers-grid" id="designersGrid">
                            <p class="empty-state">Select a city to view available printing services</p>
                        </div>
                    </div>
'@

if ($content -notmatch "fashion-designers-section") {
    # Find the closing div of zoom-controls and add section after customizer-preview
    $content = $content -replace '(</div>\s*</div>\s*\r?\n\s*<!-- Right: Controls Panel -->)', "$htmlSection`r`n`$1"
    Write-Host "✓ Added HTML section" -ForegroundColor Green
} else {
    Write-Host "○ HTML section already exists" -ForegroundColor Yellow
}

# 3. Add JavaScript before closing body tag
$jsScript = '    <script src="fashion-designers.js"></script>'
if ($content -notmatch "fashion-designers.js") {
    $content = $content -replace '(</body>)', "$jsScript`r`n`$1"
    Write-Host "✓ Added JavaScript link" -ForegroundColor Green
} else {
    Write-Host "○ JavaScript link already exists" -ForegroundColor Yellow
}

# Save the file
Set-Content -Path $htmlFile -Value $content -NoNewline
Write-Host "`n✅ Fashion Designers section added successfully!" -ForegroundColor Cyan
Write-Host "Open tshirt-customizer.html in your browser to see it!" -ForegroundColor White
