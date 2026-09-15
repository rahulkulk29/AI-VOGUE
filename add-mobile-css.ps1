# AI VOGUE - Add Mobile Responsive CSS to All Pages
# PowerShell Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI VOGUE Mobile Responsive Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = "c:\Users\RAHUL\Desktop\rahul\AI-VOGUE\AI-VOGUE"

# Define the files and their correct paths
$files = @(
    @{
        Path = "$rootPath\frontend\public\categories.html"
        CssPath = "../css/mobile-responsive.css"
    },
    @{
        Path = "$rootPath\frontend\public\about.html"
        CssPath = "../css/mobile-responsive.css"
    },
    @{
        Path = "$rootPath\frontend\public\contact.html"
        CssPath = "../css/mobile-responsive.css"
    },
    @{
        Path = "$rootPath\frontend\public\profile.html"
        CssPath = "../css/mobile-responsive.css"
    },
    @{
        Path = "$rootPath\frontend\public\prism-ai-3.0.html"
        CssPath = "../css/mobile-responsive.css"
    },
    @{
        Path = "$rootPath\frontend\public\addon\revibe.html"
        CssPath = "../../css/mobile-responsive.css"
    },
    @{
        Path = "$rootPath\frontend\public\addon\style lease.html"
        CssPath = "../../css/mobile-responsive.css"
    },
    @{
        Path = "$rootPath\creative-threads-complete\tshirt-printing\tshirt-customizer.html"
        CssPath = "../../frontend/css/mobile-responsive.css"
    }
)

$successCount = 0
$skipCount = 0
$errorCount = 0

foreach ($file in $files) {
    $filePath = $file.Path
    $cssPath = $file.CssPath
    $fileName = Split-Path $filePath -Leaf
    
    Write-Host "Processing: $fileName" -ForegroundColor Yellow
    
    if (-not (Test-Path $filePath)) {
        Write-Host "  WARNING: File not found: $filePath" -ForegroundColor Red
        $errorCount++
        continue
    }
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Check if mobile-responsive.css is already added
        if ($content -match "mobile-responsive") {
            Write-Host "  SKIP: Already has mobile-responsive.css" -ForegroundColor Gray
            $skipCount++
            continue
        }
        
        # Find where to insert the new CSS link
        # Look for the closing </head> tag
        if ($content -match "</head>") {
            # Insert before </head>
            $insertLine = "    <link rel=`"stylesheet`" href=`"$cssPath`">`r`n"
            $newContent = $content -replace "</head>", "$insertLine</head>"
            
            # Save the file
            Set-Content -Path $filePath -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "  SUCCESS: Added mobile-responsive.css" -ForegroundColor Green
            $successCount++
        }
        else {
            Write-Host "  ERROR: Could not find </head> tag" -ForegroundColor Red
            $errorCount++
        }
    }
    catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Successfully updated: $successCount files" -ForegroundColor Green
Write-Host "Already had CSS: $skipCount files" -ForegroundColor Gray
Write-Host "Errors: $errorCount files" -ForegroundColor Red
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test the pages in your browser" -ForegroundColor White
Write-Host "2. Use DevTools (F12) to test mobile view" -ForegroundColor White
Write-Host "3. Check MOBILE_RESPONSIVE_GUIDE.md for details" -ForegroundColor White
Write-Host ""
