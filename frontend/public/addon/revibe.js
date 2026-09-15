// AI VOGUE - Premium Ethnic & Formal Wear Rental Platform
// Comprehensive database with designer wear for special occasions

const rentalDatabase = {
    Bengaluru: [
        // WOMEN'S WEAR - Designer Sarees
        { id: 1, name: "Jacquard Work Woven", category: "saree", shop: "Glory sarees", phone: "7975610791", price: 1500, image: "https://m.media-amazon.com/images/I/81SMaQoCBpL._SY741_.jpg" },
        { id: 2, name: "Lycra Embroidery Saree", category: "saree", shop: "TRENDMALLS", phone: "919876543211", price: 2000, image: "https://m.media-amazon.com/images/I/71DUbt-yyQL._SX679_.jpg" },
        { id: 3, name: "Banarasi Saree Pure Kanjivaram Silk Saree", category: "saree", shop: "Sugathari", phone: "919876543212", price: 1800, image: "https://m.media-amazon.com/images/I/71adP+uM57L._SY741_.jpg" },
        { id: 4, name: " Silk Saree, Black and Maroon", category: "saree", shop: "Designer Bengaluru", phone: "919876543213", price: 2200, image: "https://m.media-amazon.com/images/I/61f6mvcpQrL._SY741_.jpg" },
        { id: 5, name: "Pure Kanjivaram Silk Saree", category: "saree", shop: "Silk Bengaluru", phone: "919876543214", price: 2500, image: "https://m.media-amazon.com/images/I/81W6NYK+paL._SY741_.jpg" },
        { id: 6, name: "Banarasi Wedding Saree", category: "saree", shop: "Heritage Bengaluru", phone: "919876543215", price: 3000, image: "https://m.media-amazon.com/images/I/81XBIwbct9L._SY879_.jpg" },
        { id: 7, name: "Banarasi Silk", category: "saree", shop: "Glory sarees", phone: "7975610791", price: 1500, image: "https://m.media-amazon.com/images/I/9129rZ5TonL._SY741_.jpg" },
        { id: 8, name: "Enthone  Woven Banarasi Silk", category: "saree", shop: "TRENDMALLS", phone: "919876543211", price: 2000, image: "https://m.media-amazon.com/images/I/81PXEiG1odL._SY741_.jpg" },
        { id: 9, name: "Kotha Silk Bengali", category: "saree", shop: "Sugathari", phone: "919876543212", price: 1800, image: "https://m.media-amazon.com/images/I/41vJxXsNPZL.jpg" },
        { id: 10, name: "Kanjivaram Soft Lichi Silk", category: "saree", shop: "Designer Bengaluru", phone: "919876543213", price: 2200, image: "https://m.media-amazon.com/images/I/61ZR4qklk9L._SX569_.jpg" },

        // WOMEN'S WEAR - Lehengas
        { id: 11, name: "lengha choli ", category: "lehenga", shop: "Bridal Bengaluru", phone: "919876543216", price: 2500, image: "https://m.media-amazon.com/images/I/81XXHK4PvxL._SY879_.jpg" },
        { id: 12, name: "Women's Semi Stitched satin blend Lehenga Choli ", category: "lehenga", shop: "Wedding Bengaluru", phone: "919876543217", price: 2200, image: "https://m.media-amazon.com/images/I/81g6U3UQeZL._SY879_.jpg" },
        { id: 13, name: "Yellow Haldi Lehenga", category: "lehenga", shop: "Festive Bengaluru", phone: "919876543218", price: 1800, image: "https://m.media-amazon.com/images/I/819WlToA-FL._SY879_.jpg" },
        { id: 14, name: "Jacquard Semi-Stitched Lehenga choli", category: "lehenga", shop: "Royal Bridal Bengaluru", phone: "919876543219", price: 5000, image: "https://m.media-amazon.com/images/I/81jNIXd0xKL._SY741_.jpg" },
        { id: 15, name: "Dola Silk Semi stitched Sequins Zari Embroidered Jacquard Lehenga", category: "lehenga", shop: "Designer Bengaluru", phone: "919876543220", price: 2000, image: "https://m.media-amazon.com/images/I/913UsRBCbrL._SY741_.jpg" },
        { id: 16, name: " Net Embroidery Sequence Work Lehenga Choli ", category: "lehenga", shop: "Premium Bengaluru", phone: "919876543221", price: 4500, image: "https://m.media-amazon.com/images/I/91o4WVFPM+L._SY741_.jpg" },
        { id: 17, name: "Georgette Embroidery Choli", category: "lehenga", shop: "Bridal Bengaluru", phone: "919876543216", price: 2500, image: "https://m.media-amazon.com/images/I/9131y+PUtWL._SY741_.jpg" },
        { id: 18, name: "Net Embroidered Semi-Stitched", category: "lehenga", shop: "Wedding Bengaluru", phone: "919876543217", price: 2200, image: "https://m.media-amazon.com/images/I/91QAxfU+m2L._SY741_.jpg" },
        { id: 19, name: "Lehenga Choli ", category: "lehenga", shop: "Festive Bengaluru", phone: "919876543218", price: 1800, image: "https://m.media-amazon.com/images/I/814bYb42FnL._SY741_.jpg" },
        { id: 20, name: "Lehenga Choli", category: "lehenga", shop: "Royal Bridal Bengaluru", phone: "919876543219", price: 5000, image: "https://m.media-amazon.com/images/I/91ZxuPDFXPL._SY741_.jpg" },

        // WOMEN'S WEAR - Gowns
        { id: 21, name: " Evening Gown", category: "gown", shop: "Elite Bengaluru", phone: "919876543222", price: 1800, image: "https://m.media-amazon.com/images/I/81Ov1OixYkL._SY741_.jpg" },
        { id: 22, name: " Reception Gown", category: "gown", shop: "Royal Bengaluru", phone: "919876543223", price: 2000, image: "https://m.media-amazon.com/images/I/71UUtzf2hFL._SY879_.jpg" },
        { id: 23, name: "Long Flowy Gown", category: "gown", shop: "Designer Bengaluru", phone: "919876543224", price: 1600, image: "https://m.media-amazon.com/images/I/810aoVxqTTL._SY879_.jpg" },
        { id: 24, name: "  Gown", category: "gown", shop: "Glamour Bengaluru", phone: "919876543225", price: 2200, image: "https://m.media-amazon.com/images/I/81G2+U3bDSL._SY879_.jpg" },
        { id: 25, name: " Sequin Gown", category: "gown", shop: "Sparkle Bengaluru", phone: "919876543226", price: 2400, image: "https://m.media-amazon.com/images/I/71Lu6fewUsL._SY879_.jpg" },
        { id: 26, name: " Mermaid Style Gown", category: "gown", shop: "Vogue Bengaluru", phone: "919876543227", price: 2600, image: "https://m.media-amazon.com/images/I/71kPI9QUuKL._SY879_.jpg" },
        { id: 27, name: " Bridal Gown", category: "gown", shop: "Bridal Bengaluru", phone: "919876543228", price: 4000, image: "https://m.media-amazon.com/images/I/91TmgNhQEVL._SX679_.jpg" },
        { id: 28, name: "Ivory Long Trail Bridal Gown", category: "gown", shop: "Wedding Bengaluru", phone: "919876543229", price: 4500, image: "https://m.media-amazon.com/images/I/91jKuRJfY+L._SX679_.jpg" },
        { id: 29, name: " Evening Gown", category: "gown", shop: "Elite Bengaluru", phone: "919876543222", price: 1800, image: "https://m.media-amazon.com/images/I/71-bqoJCXwL._SY741_.jpg" },
        { id: 30, name: " Reception Gown", category: "gown", shop: "Royal Bengaluru", phone: "919876543223", price: 2000, image: "https://m.media-amazon.com/images/I/61sLtvz1gRL._SX679_.jpg" },

        // MEN'S WEAR - Blazers
        { id: 31, name: "Men's Formal Black Blazer", category: "blazer", shop: "Formal Bengaluru", phone: "919876543230", price: 1500, image: "https://m.media-amazon.com/images/I/51kyY5T0nKL._SX679_.jpg" },
        { id: 32, name: "Men's Navy Blue Blazer", category: "blazer", shop: "Elite Bengaluru", phone: "919876543231", price: 1800, image: "https://m.media-amazon.com/images/I/51sx+HbErlL._SX679_.jpg" },
        { id: 33, name: "Men's Premium Grey Blazer", category: "blazer", shop: "Professional Bengaluru", phone: "919876543232", price: 2000, image: "https://m.media-amazon.com/images/I/51HCvVnBI9L._SY879_.jpg" },
        { id: 34, name: "Men's Designer Maroon Blazer", category: "blazer", shop: "Wedding Bengaluru", phone: "919876543233", price: 2200, image: "https://m.media-amazon.com/images/I/718onpsphHL._SY879_.jpg" },
        { id: 35, name: "Men's Party Velvet Blazer", category: "blazer", shop: "Party Bengaluru", phone: "919876543234", price: 1600, image: "https://m.media-amazon.com/images/I/51T8s3zf-sL._SY879_.jpg" },
        { id: 36, name: "Men's Tuxedo Blazer", category: "blazer", shop: "Royal Bengaluru", phone: "919876543235", price: 2500, image: "https://m.media-amazon.com/images/I/41DGIuRjqvL.jpg" },
        { id: 37, name: "Men's Wedding Cream Blazer", category: "blazer", shop: "Bridal Bengaluru", phone: "919876543236", price: 2300, image: "https://m.media-amazon.com/images/I/71g-v8SGy3L._SY879_.jpg" },
        { id: 38, name: "Men's Slim Fit Blazer", category: "blazer", shop: "Modern Bengaluru", phone: "919876543237", price: 1900, image: "https://m.media-amazon.com/images/I/71WPXpci1FL._SY879_.jpg" },
        { id: 39, name: "Men's Classic Brown Blazer", category: "blazer", shop: "Heritage Bengaluru", phone: "919876543238", price: 1700, image: "https://m.media-amazon.com/images/I/61AKY4BNZiL._SY879_.jpg" },
        { id: 40, name: "Men's Executive Charcoal Blazer", category: "blazer", shop: "Corporate Bengaluru", phone: "919876543239", price: 2100, image: "https://m.media-amazon.com/images/I/61g47CSwlQL._SY741_.jpg" },

        // MEN'S WEAR - Sherwanis
        { id: 41, name: "Royal Ivory Sherwani", category: "sherwani", shop: "Wedding Bengaluru", phone: "919876543240", price: 3000, image: "https://m.media-amazon.com/images/I/717KFgpoo9L._SY879_.jpg" },
        { id: 42, name: "Golden Embroidered Sherwani", category: "sherwani", shop: "Bridal Bengaluru", phone: "919876543241", price: 3500, image: "https://m.media-amazon.com/images/I/81JHQqoD9gS._SY879_.jpg" },
        { id: 43, name: "Maroon Silk Sherwani", category: "sherwani", shop: "Royal Bengaluru", phone: "919876543242", price: 3200, image: "https://m.media-amazon.com/images/I/71nz0+8smpL._SY879_.jpg" },
        { id: 44, name: "Cream Zari Work Sherwani", category: "sherwani", shop: "Heritage Bengaluru", phone: "919876543243", price: 2800, image: "https://m.media-amazon.com/images/I/71DJt2AFOVL._SY879_.jpg" },
        { id: 45, name: "Black Designer Sherwani", category: "sherwani", shop: "Elite Bengaluru", phone: "919876543244", price: 3300, image: "https://m.media-amazon.com/images/I/51PYipMX0JL._SX679_.jpg" },
        { id: 46, name: "Red Velvet Sherwani", category: "sherwani", shop: "Wedding Bengaluru", phone: "919876543245", price: 3600, image: "https://m.media-amazon.com/images/I/41wMVVMo2PL.jpg" },
        { id: 47, name: "Navy Blue Sherwani", category: "sherwani", shop: "Bridal Bengaluru", phone: "919876543246", price: 2900, image: "https://m.media-amazon.com/images/I/41J6jr1+R1L.jpg" },
        { id: 48, name: "Beige Embroidered Sherwani", category: "sherwani", shop: "Royal Bengaluru", phone: "919876543247", price: 3100, image: "https://m.media-amazon.com/images/I/614NPPjAWfL._SY879_.jpg" },
        { id: 49, name: "Pink Wedding Sherwani", category: "sherwani", shop: "Heritage Bengaluru", phone: "919876543248", price: 3400, image: "https://m.media-amazon.com/images/I/61128j6hpUL._SX679_.jpg" },
        { id: 50, name: "Green Silk Sherwani", category: "sherwani", shop: "Elite Bengaluru", phone: "919876543249", price: 3000, image: "https://m.media-amazon.com/images/I/61gFIuw1JRL._SX679_.jpg" },
    ],

    Belagavi: [
        // WOMEN'S WEAR - Designer Sarees
        { id: 51, name: "Kerala Kasavu Saree", category: "saree", shop: "Royal Belagavi", phone: "918765432101", price: 1400, image: "https://m.media-amazon.com/images/I/51Vravl0trL._SX679_.jpg" },
        { id: 52, name: "Cotton Silk Soft Jamdani", category: "saree", shop: "Elite Belagavi", phone: "918765432102", price: 1900, image: "https://m.media-amazon.com/images/I/71OXAdv4yXL._SY741_.jpg" },
        { id: 53, name: "Floral Nakshi Butta Soft Jamdani", category: "saree", shop: "Vogue Belagavi", phone: "918765432103", price: 1700, image: "https://m.media-amazon.com/images/I/71R2RGp18JL._SY741_.jpg" },
        { id: 54, name: "Kanjivaram Silk", category: "saree", shop: "Designer Belagavi", phone: "918765432104", price: 2100, image: "https://m.media-amazon.com/images/I/71xkCnp5ALL._SY879_.jpg" },
        { id: 55, name: "Viscose Ethnic Motif Printed Saree", category: "saree", shop: "Royal Belagavi", phone: "918765432101", price: 1400, image: "https://m.media-amazon.com/images/I/81kKWKGFnGL._SY879_.jpg" },
        { id: 56, name: "Leheriya Georgette Saree", category: "saree", shop: "Elite Belagavi", phone: "918765432102", price: 1900, image: "https://m.media-amazon.com/images/I/812nv0ybdKL._SY741_.jpg" },
        { id: 57, name: "silk Linen Embroidered Saree", category: "saree", shop: "Vogue Belagavi", phone: "918765432103", price: 1700, image: "https://m.media-amazon.com/images/I/61qkAwtp6PL._SY879_.jpg " },
        { id: 58, name: "Georgette Embellished Saree", category: "saree", shop: "Designer Belagavi", phone: "918765432104", price: 2100, image: "https://m.media-amazon.com/images/I/71hbRQny5TL._SY879_.jpg" },
        { id: 59, name: "Georgette Striped Printed", category: "saree", shop: "Royal Belagavi", phone: "918765432101", price: 1400, image: "https://m.media-amazon.com/images/I/710X6BzNAuL._SY741_.jpg " },
        { id: 60, name: "Striped Linen Saree", category: "saree", shop: "Elite Belagavi", phone: "918765432102", price: 1900, image: "https://m.media-amazon.com/images/I/51bgVeyFLHL._SX679_.jpg" },

        // WOMEN'S WEAR - Lehengas
        { id: 61, name: "Semi Stitched Net Lehenga Choli", category: "lehenga", shop: "Bridal Belagavi", phone: "918765432105", price: 2400, image: "https://m.media-amazon.com/images/I/81sjwRmwMWL._SY741_.jpg" },
        { id: 62, name: "Lehenga Choli", category: "lehenga", shop: "Wedding Belagavi", phone: "918765432106", price: 2100, image: "https://m.media-amazon.com/images/I/41wQBb+KoVL._SY445_SX342_QL70_FMwebp_.jpg" },
        { id: 63, name: "Lehenge", category: "lehenga", shop: "Festive Belagavi", phone: "918765432107", price: 1700, image: "https://m.media-amazon.com/images/I/81f-owFvdCL._SY741_.jpg" },
        { id: 64, name: "Lehenge", category: "lehenga", shop: "Royal Bridal Belagavi", phone: "918765432108", price: 4800, image: "https://m.media-amazon.com/images/I/71BlDgWn6VL._SY741_.jpg" },
        { id: 65, name: "Banarasi silk Jacquard lehenga choli ", category: "lehenga", shop: "Bridal Belagavi", phone: "918765432105", price: 2400, image: "https://m.media-amazon.com/images/I/81G4zvvhMLS._SY879_.jpg" },
        { id: 66, name: "Georgette Semi Stitched Choli", category: "lehenga", shop: "Wedding Belagavi", phone: "918765432106", price: 2100, image: "https://m.media-amazon.com/images/I/71ZlXSA6VYL._SY879_.jpg" },
        { id: 67, name: "Faux Silk Semi-Stitched Lehenga Choli", category: "lehenga", shop: "Festive Belagavi", phone: "918765432107", price: 1700, image: "https://m.media-amazon.com/images/I/71ZlXSA6VYL._SY879_.jpg" },
        { id: 68, name: "Lehenge", category: "lehenga", shop: "Royal Bridal Belagavi", phone: "918765432108", price: 4800, image: "https://m.media-amazon.com/images/I/71kGtX3FamL._SY741_.jpg" },
        { id: 69, name: "Silk Embroidered Semi-Stitched Choli", category: "lehenga", shop: "Bridal Belagavi", phone: "918765432105", price: 2400, image: "https://m.media-amazon.com/images/I/51Bxqfy+58L.jpg" },
        { id: 70, name: "Silk Lehenga Choli", category: "lehenga", shop: "Wedding Belagavi", phone: "918765432106", price: 2100, image: "https://m.media-amazon.com/images/I/61EKi0kv2sL._SY741_.jpg" },

        // WOMEN'S WEAR - Gowns
        { id: 71, name: "Burgundy Evening Gown", category: "gown", shop: "Elite Belagavi", phone: "918765432109", price: 1700, image: "https://m.media-amazon.com/images/I/81p8XoZWe+L._SY741_.jpg" },
        { id: 72, name: "Emerald Reception Gown", category: "gown", shop: "Royal Belagavi", phone: "918765432110", price: 1900, image: "https://m.media-amazon.com/images/I/61zsHDjWKYL._SY741_.jpg" },
        { id: 73, name: "Champagne Shimmer Gown", category: "gown", shop: "Glamour Belagavi", phone: "918765432111", price: 2100, image: "https://m.media-amazon.com/images/I/81R5VxjLf3L._SY879_.jpg" },
        { id: 74, name: "Blush Bridal Gown", category: "gown", shop: "Bridal Belagavi", phone: "918765432112", price: 3800, image: "https://m.media-amazon.com/images/I/61K1+xq-COL._SY741_.jpg" },
        { id: 75, name: "Burgundy Evening Gown", category: "gown", shop: "Elite Belagavi", phone: "918765432109", price: 1700, image: "https://m.media-amazon.com/images/I/816+M2fMm9L._SY741_.jpg" },
        { id: 76, name: "Emerald Reception Gown", category: "gown", shop: "Royal Belagavi", phone: "918765432110", price: 1900, image: "https://m.media-amazon.com/images/I/81cCVp6yoCL._SY741_.jpg" },
        { id: 77, name: "Champagne Shimmer Gown", category: "gown", shop: "Glamour Belagavi", phone: "918765432111", price: 2100, image: "https://m.media-amazon.com/images/I/61nETY9h3+L._SX569_.jpg" },
        { id: 78, name: "Blush Bridal Gown", category: "gown", shop: "Bridal Belagavi", phone: "918765432112", price: 3800, image: "https://m.media-amazon.com/images/I/613pvjqORNL._SX569_.jpg" },
        { id: 79, name: "Burgundy Evening Gown", category: "gown", shop: "Elite Belagavi", phone: "918765432109", price: 1700, image: "https://m.media-amazon.com/images/I/91ZIUcagtLL._SX679_.jpg" },
        { id: 80, name: "Emerald Reception Gown", category: "gown", shop: "Royal Belagavi", phone: "918765432110", price: 1900, image: "https://m.media-amazon.com/images/I/71nx1lPnQpL._SY741_.jpg" },

        // MEN'S WEAR - Blazers
        { id: 81, name: "Men's Navy Blue Blazer", category: "blazer", shop: "Formal Belagavi", phone: "918765432113", price: 1450, image: "https://m.media-amazon.com/images/I/71wYgTKZ-OL._SY741_.jpg" },
        { id: 82, name: "Men's Charcoal Grey Blazer", category: "blazer", shop: "Elite Belagavi", phone: "918765432114", price: 1750, image: "https://m.media-amazon.com/images/I/71HuAV3bYrL._SY741_.jpg" },
        { id: 83, name: "Men's Black Tuxedo Blazer", category: "blazer", shop: "Professional Belagavi", phone: "918765432115", price: 1950, image: "https://m.media-amazon.com/images/I/41sDIr2MAiL.jpg" },
        { id: 84, name: "Men's Burgundy Blazer", category: "blazer", shop: "Wedding Belagavi", phone: "918765432116", price: 2150, image: "https://m.media-amazon.com/images/I/41RJ5URL38L.jpg" },
        { id: 85, name: "Men's Velvet Party Blazer", category: "blazer", shop: "Party Belagavi", phone: "918765432117", price: 1550, image: "https://m.media-amazon.com/images/I/31GcVP1DMLL.jpg" },
        { id: 86, name: "Men's Tan Blazer", category: "blazer", shop: "Royal Belagavi", phone: "918765432118", price: 2450, image: "https://m.media-amazon.com/images/I/31CHOzZCmJL.jpg" },
        { id: 87, name: "Men's Double Breasted Blazer", category: "blazer", shop: "Bridal Belagavi", phone: "918765432119", price: 2250, image: "https://m.media-amazon.com/images/I/31yHKRMSOaL.jpg" },
        { id: 88, name: "Men's Slim Fit Blazer", category: "blazer", shop: "Modern Belagavi", phone: "918765432120", price: 1850, image: "https://m.media-amazon.com/images/I/71bHztQZ69L._SY879_.jpg" },
        { id: 89, name: "Men's Tweed Blazer", category: "blazer", shop: "Heritage Belagavi", phone: "918765432121", price: 1650, image: "https://m.media-amazon.com/images/I/71z1XC4lreL._SX569_.jpg" },
        { id: 90, name: "Men's Premium Blazer", category: "blazer", shop: "Corporate Belagavi", phone: "918765432122", price: 2050, image: "https://m.media-amazon.com/images/I/717IsAQE9aL._SY741_.jpg" },

        // MEN'S WEAR - Sherwanis
        { id: 91, name: "Champagne Gold Sherwani", category: "sherwani", shop: "Wedding Belagavi", phone: "918765432123", price: 2950, image: "https://m.media-amazon.com/images/I/51oa367tHnL._SY879_.jpg" },
        { id: 92, name: "Peach Embroidered Sherwani", category: "sherwani", shop: "Bridal Belagavi", phone: "918765432124", price: 3450, image: "https://m.media-amazon.com/images/I/61uOUUkA3cL._SX679_.jpg" },
        { id: 93, name: "Burgundy Silk Sherwani", category: "sherwani", shop: "Royal Belagavi", phone: "918765432125", price: 3150, image: "https://m.media-amazon.com/images/I/61OTUmAzbFL._SY879_.jpg" },
        { id: 94, name: "White Zari Sherwani", category: "sherwani", shop: "Heritage Belagavi", phone: "918765432126", price: 2750, image: "https://m.media-amazon.com/images/I/51-hC2pICJL._SY879_.jpg" },
        { id: 95, name: "Midnight Blue Sherwani", category: "sherwani", shop: "Elite Belagavi", phone: "918765432127", price: 3250, image: "https://m.media-amazon.com/images/I/41mWHKr3y4L.jpg" },
        { id: 96, name: "Crimson Velvet Sherwani", category: "sherwani", shop: "Wedding Belagavi", phone: "918765432128", price: 3550, image: "https://m.media-amazon.com/images/I/61-bvrBFebL._SY879_.jpg" },
        { id: 97, name: "Teal Blue Sherwani", category: "sherwani", shop: "Bridal Belagavi", phone: "918765432129", price: 2850, image: "https://m.media-amazon.com/images/I/41aUcC2TYeL._SX679_.jpg" },
        { id: 98, name: "Silver Embroidered Sherwani", category: "sherwani", shop: "Royal Belagavi", phone: "918765432130", price: 3050, image: "https://m.media-amazon.com/images/I/610Msqmep1L._SY879_.jpg" },
        { id: 99, name: "Salmon Pink Sherwani", category: "sherwani", shop: "Heritage Belagavi", phone: "918765432131", price: 3350, image: "https://m.media-amazon.com/images/I/51cW0oKpEqL._SY879_.jpg" },
        { id: 100, name: "Olive Green Sherwani", category: "sherwani", shop: "Elite Belagavi", phone: "918765432132", price: 2950, image: "https://m.media-amazon.com/images/I/41zZDRBmXQL.jpg" },
    ],

    Pune: [
        // WOMEN'S WEAR - Designer Sarees
        { id: 101, name: "Doria, Polyester Floral", category: "saree", shop: "Royal Pune", phone: "917654321001", price: 1600, image: "https://m.media-amazon.com/images/I/81UJUMeVpCL._SY879_.jpg" },
        { id: 102, name: "Hand Block Printed", category: "saree", shop: "Elite Pune", phone: "917654321002", price: 2100, image: "https://m.media-amazon.com/images/I/81Hy1ZbXU1L._SX679_.jpg" },
        { id: 103, name: "Applique Work Saree", category: "saree", shop: "Vogue Pune", phone: "917654321003", price: 1900, image: "https://m.media-amazon.com/images/I/713BonbALwL._SY879_.jpg" },
        { id: 104, name: "Lichi Silk", category: "saree", shop: "Designer Pune", phone: "917654321004", price: 2300, image: "https://m.media-amazon.com/images/I/61kvU2ivy4L._SY879_.jpg" },
        { id: 105, name: "Cotton Blend saree", category: "saree", shop: "Royal Pune", phone: "917654321001", price: 1600, image: "https://m.media-amazon.com/images/I/415X-9EtS3L.jpg " },
        { id: 106, name: "Print Cotton Mulmul Saree ", category: "saree", shop: "Elite Pune", phone: "917654321002", price: 2100, image: "https://m.media-amazon.com/images/I/41bH21VMpvL.jpg" },
        { id: 107, name: "Woven Soft Saree", category: "saree", shop: "Vogue Pune", phone: "917654321003", price: 1900, image: "https://m.media-amazon.com/images/I/713TbqWtWuL._SY879_.jpg" },
        { id: 108, name: "Georgette Foil Printed", category: "saree", shop: "Designer Pune", phone: "917654321004", price: 2300, image: "https://m.media-amazon.com/images/I/717vttaSGnL._SX569_.jpg" },
        { id: 109, name: "Georgette Bandhani Printed", category: "saree", shop: "Royal Pune", phone: "917654321001", price: 1600, image: "https://m.media-amazon.com/images/I/715Zonw03RL._SX569_.jpg" },
        { id: 110, name: "Georgette Bandhani", category: "saree", shop: "Elite Pune", phone: "917654321002", price: 2100, image: "https://m.media-amazon.com/images/I/71e631zgyAL._SX679_.jpg" },

        // WOMEN'S WEAR - Lehengas
        { id: 111, name: " Embroidered Net  Lehenga Choli", category: "lehenga", shop: "Bridal Pune", phone: "917654321005", price: 2600, image: "https://m.media-amazon.com/images/I/51vMt5nPEyL.jpg" },
        { id: 112, name: "Sequins Embroidered Soft Lehenga Choli", category: "lehenga", shop: "Wedding Pune", phone: "917654321006", price: 2300, image: "https://m.media-amazon.com/images/I/51QMFN6un6L.jpg" },
        { id: 113, name: "Embroidered Lehenga", category: "lehenga", shop: "Festive Pune", phone: "917654321007", price: 1900, image: "https://m.media-amazon.com/images/I/51CTfQjE3uL.jpg" },
        { id: 114, name: "Embroidered Lehenga", category: "lehenga", shop: "Royal Bridal Pune", phone: "917654321008", price: 5200, image: "https://m.media-amazon.com/images/I/51dSHv5WAOL.jpg" },
        { id: 115, name: "Embroidered Lehenga", category: "lehenga", shop: "Bridal Pune", phone: "917654321005", price: 2600, image: "https://m.media-amazon.com/images/I/81A-krhtgsL._SY879_.jpg" },
        { id: 116, name: "Embroidered Lehenga", category: "lehenga", shop: "Wedding Pune", phone: "917654321006", price: 2300, image: "https://m.media-amazon.com/images/I/81C-6kRb-9L._SY741_.jpg" },
        { id: 117, name: "Embroidered Lehenga", category: "lehenga", shop: "Festive Pune", phone: "917654321007", price: 1900, image: "https://m.media-amazon.com/images/I/81MxHszRHQL._SY741_.jpg" },
        { id: 118, name: "Embroidered Lehenga", category: "lehenga", shop: "Royal Bridal Pune", phone: "917654321008", price: 5200, image: "https://m.media-amazon.com/images/I/51dVCZndTJL._SY879_.jpg" },
        { id: 119, name: "Embroidered Lehenga", category: "lehenga", shop: "Bridal Pune", phone: "917654321005", price: 2600, image: "https://m.media-amazon.com/images/I/61Zzb1nooxL._SY879_.jpg" },
        { id: 120, name: "Georgette Embroidered Lehenga", category: "lehenga", shop: "Wedding Pune", phone: "917654321006", price: 2300, image: "https://m.media-amazon.com/images/I/51ezVqGx3uL.jpg" },

        // WOMEN'S WEAR - Gowns
        { id: 121, name: "Midnight  Evening Gown", category: "gown", shop: "Elite Pune", phone: "917654321009", price: 1900, image: "https://m.media-amazon.com/images/I/512YsmqWVZL._SY879_.jpg" },
        { id: 122, name: "Crimson Reception Gown", category: "gown", shop: "Royal Pune", phone: "917654321010", price: 2100, image: "https://m.media-amazon.com/images/I/71-gAizDd3L._SY741_.jpg" },
        { id: 123, name: " Gown", category: "gown", shop: "Glamour Pune", phone: "917654321011", price: 2300, image: "https://m.media-amazon.com/images/I/612SnRAFO+S._SX679_.jpg" },
        { id: 124, name: " Bridal Gown", category: "gown", shop: "Bridal Pune", phone: "917654321012", price: 4200, image: "https://m.media-amazon.com/images/I/71RPYSvOCbL._SX679_.jpg" },
        { id: 125, name: "Midnight Evening Gown", category: "gown", shop: "Elite Pune", phone: "917654321009", price: 1900, image: "https://m.media-amazon.com/images/I/71Z17aIxuhL._SX679_.jpg" },
        { id: 126, name: "Crimson Reception Gown", category: "gown", shop: "Royal Pune", phone: "917654321010", price: 2100, image: "https://m.media-amazon.com/images/I/51McDBLLfjL.jpg" },
        { id: 127, name: " Gown", category: "gown", shop: "Glamour Pune", phone: "917654321011", price: 2300, image: "https://m.media-amazon.com/images/I/81puDfElkNL._SY879_.jpg" },
        { id: 128, name: "Pearl  Bridal Gown", category: "gown", shop: "Bridal Pune", phone: "917654321012", price: 4200, image: "https://m.media-amazon.com/images/I/616NvJXlZOL._SY879_.jpg" },
        { id: 129, name: "Midnight  Evening Gown", category: "gown", shop: "Elite Pune", phone: "917654321009", price: 1900, image: "https://m.media-amazon.com/images/I/81hk4BjkfRL._SY741_.jpg" },
        { id: 130, name: "Crimson Reception Gown", category: "gown", shop: "Royal Pune", phone: "917654321010", price: 2100, image: "https://m.media-amazon.com/images/I/51xyhwwfBgL.jpg" },

        // MEN'S WEAR - Blazers
        { id: 131, name: "Men's Tan Brown Blazer", category: "blazer", shop: "Formal Pune", phone: "917654321013", price: 1550, image: "https://m.media-amazon.com/images/I/81M1laomJFL._SY741_.jpg" },
        { id: 132, name: "Men's Pinstripe Blazer", category: "blazer", shop: "Elite Pune", phone: "917654321014", price: 1850, image: "https://m.media-amazon.com/images/I/61cdMgFATJL._SY879_.jpg" },
        { id: 133, name: "Men's Royal Blue Blazer", category: "blazer", shop: "Professional Pune", phone: "917654321015", price: 2050, image: "https://m.media-amazon.com/images/I/31uGoqZKZGL._SY445_SX342_QL70_FMwebp_.jpg" },
        { id: 134, name: "Men's Cream Blazer", category: "blazer", shop: "Wedding Pune", phone: "917654321016", price: 2250, image: "https://m.media-amazon.com/images/I/61hTy0e4+4L._SY741_.jpg" },
        { id: 135, name: "Men's Printed Party Blazer", category: "blazer", shop: "Party Pune", phone: "917654321017", price: 1650, image: "https://m.media-amazon.com/images/I/612VS1L98pL._SY741_.jpg" },
        { id: 136, name: "Men's Designer Tuxedo Blazer", category: "blazer", shop: "Royal Pune", phone: "917654321018", price: 2550, image: "https://m.media-amazon.com/images/I/514e2VOKp8L._SY741_.jpg" },
        { id: 137, name: "Men's Checkered Blazer", category: "blazer", shop: "Bridal Pune", phone: "917654321019", price: 2350, image: "https://m.media-amazon.com/images/I/4117pZRz9eL._SX342_SY445_QL70_FMwebp_.jpg" },
        { id: 138, name: "Men's Italian Cut Blazer", category: "blazer", shop: "Modern Pune", phone: "917654321020", price: 1950, image: "https://m.media-amazon.com/images/I/41YwXzFxAQL._SY445_SX342_QL70_FMwebp_.jpg" },
        { id: 139, name: "Men's Linen Blazer", category: "blazer", shop: "Heritage Pune", phone: "917654321021", price: 1750, image: "https://m.media-amazon.com/images/I/81L-i24TIqL._SY741_.jpg" },
        { id: 140, name: "Men's Classic Black Blazer", category: "blazer", shop: "Corporate Pune", phone: "917654321022", price: 2150, image: "https://m.media-amazon.com/images/I/71is-wmPn3L._SY879_.jpg" },

        // MEN'S WEAR - Sherwanis
        { id: 141, name: "Pearl White Sherwani", category: "sherwani", shop: "Wedding Pune", phone: "917654321023", price: 3000, image: "https://m.media-amazon.com/images/I/61yYOjjuB6L._SX679_.jpg" },
        { id: 142, name: "Rose Gold Sherwani", category: "sherwani", shop: "Bridal Pune", phone: "917654321024", price: 3500, image: "https://m.media-amazon.com/images/I/51Sgnwr0JoL._SX679_.jpg" },
        { id: 143, name: "Wine Red Sherwani", category: "sherwani", shop: "Royal Pune", phone: "917654321025", price: 3200, image: "https://m.media-amazon.com/images/I/61mERVzsv5L._SY879_.jpg" },
        { id: 144, name: "Ivory Zari Sherwani", category: "sherwani", shop: "Heritage Pune", phone: "917654321026", price: 2800, image: "https://m.media-amazon.com/images/I/61hjHElfC4L._SX679_.jpg" },
        { id: 145, name: "Charcoal Grey Sherwani", category: "sherwani", shop: "Elite Pune", phone: "917654321027", price: 3300, image: "https://m.media-amazon.com/images/I/51KIiIGbqOL._SY879_.jpg" },
        { id: 146, name: "Ruby Red Sherwani", category: "sherwani", shop: "Wedding Pune", phone: "917654321028", price: 3600, image: "https://m.media-amazon.com/images/I/41aUcC2TYeL._SX679_.jpg" },
        { id: 147, name: "Sapphire Blue Sherwani", category: "sherwani", shop: "Bridal Pune", phone: "917654321029", price: 2900, image: "https://m.media-amazon.com/images/I/612yicJPUgL._SX679_.jpg" },
        { id: 148, name: "Gold Embroidered Sherwani", category: "sherwani", shop: "Royal Pune", phone: "917654321030", price: 3100, image: "https://m.media-amazon.com/images/I/71DS+2qnhXL._SY879_.jpg" },
        { id: 149, name: "Blush Pink Sherwani", category: "sherwani", shop: "Heritage Pune", phone: "917654321031", price: 3400, image: "https://m.media-amazon.com/images/I/61+CUnRe-jL._SX679_.jpg" },
        { id: 150, name: "Emerald Green Sherwani", category: "sherwani", shop: "Elite Pune", phone: "917654321032", price: 3000, image: "https://m.media-amazon.com/images/I/51nrttVEeuL.jpg" },
    ]
};

// ============================================
// SEARCH LOGIC
// ============================================

let currentCity = '';

const citySelect = document.getElementById('citySelect');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchHint = document.getElementById('searchHint');
const resultsSection = document.getElementById('resultsSection');
const resultsTitle = document.getElementById('resultsTitle');
const resultsSubtitle = document.getElementById('resultsSubtitle');
const productsCatalog = document.getElementById('productsCatalog');
const noResults = document.getElementById('noResults');
const noResultsMessage = document.getElementById('noResultsMessage');

citySelect.addEventListener('change', (e) => {
    currentCity = e.target.value;
    if (currentCity) {
        searchInput.disabled = false;
        searchBtn.disabled = false;
        searchHint.textContent = `Type: saree, lehenga, gown, blazer, sherwani...`;
        searchHint.classList.add('success');
        searchInput.focus();
    } else {
        searchInput.disabled = true;
        searchBtn.disabled = true;
        searchHint.textContent = 'Please select a city first';
        searchHint.classList.remove('success');
        resultsSection.style.display = 'none';
    }
});

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query || !currentCity) return;

    resultsSection.style.display = 'block';

    // Simple local search
    const cityProducts = rentalDatabase[currentCity] || [];

    // Filter products based on query
    const filteredProducts = cityProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );

    // Sort by price
    filteredProducts.sort((a, b) => a.price - b.price);

    displayResults({
        products: filteredProducts,
        category: query,
        message: filteredProducts.length === 0 ? `No products found matching "${query}" in ${currentCity}.` : null
    });
}

function displayResults(result) {
    const { products, category, message } = result;

    if (products.length > 0) {
        resultsTitle.innerHTML = `${products.length} items found in ${currentCity}`;
        resultsSubtitle.textContent = `Sorted by lowest price`;
        productsCatalog.innerHTML = products.map(p => `
            <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}&city=${encodeURIComponent(currentCity)}'" style="cursor: pointer;">
                <div class="product-image-container">
                    <img src="${p.image}" alt="${p.name}" class="product-image">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-shop"><i data-feather="shopping-bag"></i> ${p.shop}</p>
                    <p class="product-location"><i data-feather="map-pin"></i> ${currentCity}</p>
                    <div class="product-price">₹${p.price}<span class="price-period">/day</span></div>
                    <a href="https://wa.me/${p.phone}?text=I want to rent ${encodeURIComponent(p.name)} from ${encodeURIComponent(p.shop)}" target="_blank" class="whatsapp-btn" onclick="event.stopPropagation()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Rent on WhatsApp
                    </a>
                </div>
            </div>
        `).join('');
        noResults.style.display = 'none';
        feather.replace();
    } else {
        productsCatalog.innerHTML = '';
        noResults.style.display = 'block';
        noResultsMessage.textContent = message;
        feather.replace();
    }
}

document.addEventListener('DOMContentLoaded', () => feather.replace());
