// Fashion Designers Functionality - Fixed Syntax Error
// Add this script at the end of tshirt-customizer.html before closing </body>

(function () {
    'use strict';

    // Load fashion designers data
    let fashionDesigners = [];

    // Load JSON data
    fetch('../../fashiondesigner.json')
        .then(response => response.json())
        .then(data => {
            fashionDesigners = data;
            console.log('Fashion designers loaded:', fashionDesigners.length);
        })
        .catch(error => {
            console.error('Error loading fashion designers:', error);
        });

    // City selection handler
    const citySelect = document.getElementById('designerCitySelect');
    const resultsCount = document.getElementById('resultsCount');
    const designersGrid = document.getElementById('designersGrid');

    if (citySelect) {
        citySelect.addEventListener('change', function () {
            const selectedCity = this.value;

            if (selectedCity) {
                // Filter and display all designers from selected city
                filterDesigners(selectedCity);
            } else {
                // Hide results
                if (resultsCount) resultsCount.style.display = 'none';

                // Show empty state
                designersGrid.innerHTML = '<p class="empty-state">Select a city to view available printing services</p>';
            }
        });
    }

    function filterDesigners(city) {
        // Filter by city
        let filtered = fashionDesigners.filter(designer => {
            return designer.city === city || designer.city.includes(city);
        });

        // Display all results
        displayDesigners(filtered, city);
    }

    function displayDesigners(designers, city) {
        if (designers.length === 0) {
            designersGrid.innerHTML = `
                <p class="empty-state">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i><br>
                    No printing services found in ${city}
                </p>
            `;
            if (resultsCount) resultsCount.style.display = 'none';
            return;
        }

        // Show results count
        if (resultsCount) {
            resultsCount.textContent = `${designers.length} printing service${designers.length > 1 ? 's' : ''} found in ${city}`;
            resultsCount.style.display = 'block';
        }

        // Create designer cards
        designersGrid.innerHTML = designers.map(designer => createDesignerCard(designer)).join('');
    }

    function createDesignerCard(designer) {
        const hasPhone = designer.phone_number && designer.phone_number !== 'Not available' && !designer.phone_number.includes('send enquiry');
        const phoneNumber = hasPhone ? designer.phone_number.replace(/[^0-9+]/g, '') : '';

        return `
            <div class="designer-card">
                <span class="designer-city-tag">${designer.city}</span>
                <h4 class="designer-name">${designer.name}</h4>
                <p class="designer-address">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${designer.address}</span>
                </p>
                ${hasPhone ? `
                    <p class="designer-phone">
                        <i class="fas fa-phone"></i>
                        <span>${designer.phone_number}</span>
                    </p>
                    <button class="contact-whatsapp-btn" onclick="contactViaWhatsApp('${phoneNumber}')">
                        <i class="fab fa-whatsapp"></i>
                        Contact on WhatsApp
                    </button>
                ` : `
                    <p class="designer-phone" style="color: #999;">
                        <i class="fas fa-info-circle"></i>
                        <span>Contact information not available</span>
                    </p>
                `}
            </div>
        `;
    }

    // WhatsApp contact function (global scope) - FIXED
    window.contactViaWhatsApp = function (phoneNumber) {
        const message = encodeURIComponent("Hi, I'm interested in your t-shirt printing services. I found you on AI VOGUE.");
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappURL, '_blank');
    };

})();
