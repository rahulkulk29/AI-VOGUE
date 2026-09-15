# PowerShell script to standardize navigation across all pages
$publicDir = "C:\Users\RAHUL\Desktop\rahul\AI-VOGUE\AI-VOGUE\frontend\public"

# Standard navigation for non-index pages (with Home link)
$standardNavWithHome = @'
    <!-- Navigation Drawer -->
    <nav class="nav-drawer">
        <button class="nav-close" id="nav-close" aria-label="Close navigation">
            <span></span>
            <span></span>
        </button>

        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="categories.html">Vogue Vision</a></li>
            <li><a href="addon/revibe.html">Revibe</a></li>
            <li><a href="creative-threads.html">Creative Threads</a></li>
            <!-- <li><a href="mirrorx.html">MirrorX</a></li> -->
            <li><a href="prism-ai-3.0.html">Prism AI</a></li>
            <li><a href="addon/style lease.html">Style Lease</a></li>
            <!-- <li><a href="twinfit.html">TwinFit</a></li> -->
            <li><a href="about.html">About</a></li>
            <li><a href="contact.html">Contact</a></li>
        </ul>

        <div class="nav-icons">
            <a href="profile.html" aria-label="Account" class="account-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </a>
            <a href="#" aria-label="Shopping cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="m16 10a4 4 0 0 1-8 0"></path>
                </svg>
            </a>
        </div>
    </nav>
'@

# Standard navigation for addon pages (with ../ paths and Home link)
$standardNavAddon = @'
    <!-- Navigation Drawer -->
    <nav class="nav-drawer">
        <button class="nav-close" id="nav-close" aria-label="Close navigation">
            <span></span>
            <span></span>
        </button>

        <ul class="nav-links">
            <li><a href="../index.html">Home</a></li>
            <li><a href="../categories.html">Vogue Vision</a></li>
            <li><a href="revibe.html">Revibe</a></li>
            <li><a href="../creative-threads.html">Creative Threads</a></li>
            <!-- <li><a href="../mirrorx.html">MirrorX</a></li> -->
            <li><a href="../prism-ai-3.0.html">Prism AI</a></li>
            <li><a href="style lease.html">Style Lease</a></li>
            <!-- <li><a href="../twinfit.html">TwinFit</a></li> -->
            <li><a href="../about.html">About</a></li>
            <li><a href="../contact.html">Contact</a></li>
        </ul>

        <div class="nav-icons">
            <a href="../profile.html" aria-label="Account" class="account-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </a>
            <a href="#" aria-label="Shopping cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="m16 10a4 4 0 0 1-8 0"></path>
                </svg>
            </a>
        </div>
    </nav>
'@

Write-Host "Navigation templates created successfully!"
Write-Host "Standard Nav (with Home): $($standardNavWithHome.Length) characters"
Write-Host "Addon Nav: $($standardNavAddon.Length) characters"
