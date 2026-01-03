// Main Application JavaScript - Complete version
document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // GLOBAL CONSTANTS
    // ============================================
    const babySizes = [
        "Kwayoyin halitta", "Kankana", "Kankana", "Blueberry", "Blueberry",
        "Cherry", "Cherry", "Fig", "Fig", "Lime",
        "Lime", "Lemon", "Lemon", "Apple", "Apple",
        "Avocado", "Avocado", "Pear", "Pear", "Sweet Potato",
        "Sweet Potato", "Mango", "Mango", "Banana", "Banana",
        "Carrot", "Carrot", "Papaya", "Papaya", "Grapefruit",
        "Grapefruit", "Cantaloupe", "Cantaloupe", "Cauliflower", "Cauliflower",
        "Zucchini", "Zucchini", "Eggplant", "Eggplant", "Watermelon"
    ];

    const categoryNames = {
        'all': 'Duka Labarai',
        'pregnancy': 'Labaran Ciki',
        'baby-care': 'Kula da Jariri',
        'health': 'Lafiya',
        'nutrition': 'Abinci mai gina jiki',
        'postpartum': 'Bayan Haihuwa',
        'tips': 'Shawarwari',
        'symptoms': 'Alamun Ciki'
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function showToast(message, duration = 3000) {
        const toast = document.getElementById('error-toast');
        if (!toast) {
            console.error('Toast element not found');
            return;
        }

        const messageEl = toast.querySelector('.toast-message');
        if (messageEl) {
            messageEl.textContent = message;
        }

        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }

    function formatDateHausa(date, format = 'short') {
        if (!date || isNaN(date.getTime())) return '';

        const options = format === 'long' ? {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        } : {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('ha-NG', options);
    }

    // ============================================
    // THEME MANAGEMENT
    // ============================================
    function initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) {
            console.error('Theme toggle button not found');
            return;
        }

        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }

        themeToggle.addEventListener('click', function () {
            const isDark = document.body.classList.contains('dark-mode');
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
        });

        // Also initialize chatbot theme toggle
        const themeToggleChat = document.getElementById('theme-toggle-chat');
        if (themeToggleChat) {
            themeToggleChat.addEventListener('click', function () {
                const isDark = document.body.classList.contains('dark-mode');
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('theme', isDark ? 'light' : 'dark');
                showToast(isDark ? "Yanayin haske" : "Yanayin duhu", 2000);
            });
        }
    }

    // ============================================
    // FLIP CARD FUNCTIONALITY
    // ============================================
    function initFlipCards() {
        const flipCards = document.querySelectorAll('.flip-card');

        flipCards.forEach(card => {
            const front = card.querySelector('.card-front');
            const backBtn = card.querySelector('.back-btn');
            const form = card.querySelector('form');

            // Flip on card front click
            if (front) {
                front.addEventListener('click', function (e) {
                    // Don't flip if clicking on interactive elements or hint text
                    if (e.target.closest('.hint-text') ||
                        e.target.tagName === 'BUTTON' ||
                        e.target.tagName === 'INPUT' ||
                        e.target.tagName === 'SELECT') {
                        return;
                    }

                    // Add flipped class to expand height
                    card.classList.add('flipped');

                    // Focus on first input if there's a form
                    setTimeout(() => {
                        const firstInput = card.querySelector('input, select');
                        if (firstInput && firstInput.type !== 'hidden') {
                            firstInput.focus();
                        }
                    }, 300); // Wait for flip animation
                });
            }

            // Flip back on back button click
            if (backBtn) {
                backBtn.addEventListener('click', function (e) {
                    e.stopPropagation();

                    // Remove flipped class to return to normal height
                    card.classList.remove('flipped');

                    // Special handling for articles card
                    if (card.id === 'articles-benefit-card') {
                        const articlesSection = document.getElementById('articles-content-section');
                        if (articlesSection) {
                            articlesSection.style.display = 'none';
                        }
                    }

                    // Reset any forms in the card
                    const form = card.querySelector('form');
                    if (form) {
                        form.reset();
                    }
                });
            }

            // Prevent form submission from flipping card back
            if (form) {
                form.addEventListener('submit', function (e) {
                    e.stopPropagation(); // Don't let click bubble to card
                });
            }

            // Also allow clicking outside form on back to go back
            const cardBack = card.querySelector('.card-back');
            if (cardBack) {
                cardBack.addEventListener('click', function (e) {
                    // If clicking on empty space (not form elements or back button)
                    if (e.target === cardBack &&
                        !e.target.closest('form') &&
                        !e.target.closest('.back-btn')) {
                        card.classList.remove('flipped');
                    }
                });
            }
        });

        // Close flip cards when clicking outside (optional)
        document.addEventListener('click', function (e) {
            // If clicking outside any flip card while one is flipped
            if (!e.target.closest('.flip-card') &&
                !e.target.closest('.calculator-modal') &&
                !e.target.closest('.article-modal')) {

                document.querySelectorAll('.flip-card.flipped').forEach(card => {
                    card.classList.remove('flipped');
                });
            }
        });
    }
    // ============================================
    // OVULATION CALCULATOR
    // ============================================

    function initOvulationCalculator() {
        const ovulationCard = document.getElementById('ovulation-benefit-card');
        const ovulationForm = document.getElementById('ovulation-form');
        const lmpInput = document.getElementById('lmp-date');
        const cycleSelect = document.getElementById('cycle-length');
        const modal = document.getElementById('ovulation-results-modal');

        if (!ovulationForm || !modal) {
            console.error('Ovulation calculator elements not found');
            return;
        }

        // Set default date (today - 14 days)
        if (lmpInput) {
            const today = new Date();
            const defaultDate = new Date(today);
            defaultDate.setDate(today.getDate() - 14);

            const year = defaultDate.getFullYear();
            const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
            const day = String(defaultDate.getDate()).padStart(2, '0');

            lmpInput.value = `${year}-${month}-${day}`;
            lmpInput.max = new Date().toISOString().split('T')[0];
        }

        // Set default cycle length
        if (cycleSelect) {
            cycleSelect.value = '28';
        }

        // Form submission
        ovulationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const lmpDate = new Date(lmpInput.value);
            const cycleLength = parseInt(cycleSelect.value);

            // Validate
            if (isNaN(lmpDate.getTime()) || lmpDate > new Date()) {
                showToast("Ranar da ka shigar ba ta da inganci");
                return;
            }

            if (cycleLength < 21 || cycleLength > 45) {
                showToast("Tsawon lokacin haila bai kamata ya kasance ƙasa da kwanaki 21 ko fiye da 45 ba");
                return;
            }

            // Calculate ovulation dates
            const ovulationDay = new Date(lmpDate);
            ovulationDay.setDate(ovulationDay.getDate() + (cycleLength - 14));

            const fertileStart = new Date(ovulationDay);
            fertileStart.setDate(fertileStart.getDate() - 3);

            const fertileEnd = new Date(ovulationDay);
            fertileEnd.setDate(fertileEnd.getDate() + 3);

            // Safe period (before fertile window)
            const safeStart = new Date(lmpDate);
            safeStart.setDate(safeStart.getDate() + 1);

            const safeEnd = new Date(fertileStart);
            safeEnd.setDate(safeEnd.getDate() - 1);

            // Update modal
            document.getElementById('modal-ovulation-day').textContent =
                formatDateHausa(ovulationDay, 'short');

            document.getElementById('modal-fertile-window').textContent =
                `${formatDateHausa(fertileStart, 'short')} - ${formatDateHausa(fertileEnd, 'short')}`;

            const safePeriodEl = document.getElementById('modal-safe-period');
            if (safePeriodEl) {
                safePeriodEl.textContent = `${formatDateHausa(safeStart, 'short')} - ${formatDateHausa(safeEnd, 'short')}`;
            }

            document.getElementById('results-date-range').textContent =
                `Lissafi daga ${formatDateHausa(lmpDate, 'short')} zuwa ${formatDateHausa(ovulationDay, 'short')}`;

            // Show modal
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Flip card back
            if (ovulationCard) {
                ovulationCard.classList.remove('flipped');
            }
        });

        // Modal close functionality
        const modalClose = modal.querySelector('.modal-close');
        const modalOverlay = modal.querySelector('.modal-overlay');

        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }

        // Save and share buttons
        document.getElementById('save-results-btn')?.addEventListener('click', function () {
            showToast("Sakamakon an ajiye shi cikin nasara!");
        });

        document.getElementById('share-results-btn')?.addEventListener('click', async function () {
            try {
                const shareData = {
                    title: 'Sakamakon Lissafin Ovulation',
                    text: `Daga Ciki da Raino App`,
                    url: window.location.href
                };

                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText("Sakamakon an kwafa shi zuwa clipboard!");
                    showToast("Sakamakon an kwafa shi zuwa clipboard!");
                }
            } catch (err) {
                showToast("Ba zai yiwu a raba sakamakon ba");
            }
        });
    }

    // ============================================
    // PREGNANCY TRACKER
    // ============================================
    function initPregnancyTracker() {
        const pregnancyForm = document.getElementById('pregnancy-form');
        const typeButtons = document.querySelectorAll('.type-btn');
        const lmpContainer = document.getElementById('lmp-input-container');
        const eddContainer = document.getElementById('edd-input-container');
        const lmpDateInput = document.getElementById('pregnancy-lmp-date');
        const eddDateInput = document.getElementById('pregnancy-edd-date');
        const modal = document.getElementById('pregnancy-results-modal');

        if (!pregnancyForm || !modal) {
            console.error('Pregnancy tracker elements not found');
            return;
        }

        let currentCalculationType = 'lmp';

        // Set calculation type - show only one input
        function setCalculationType(type) {
            currentCalculationType = type;

            // Update active button
            typeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === type);
            });

            // Show/hide input containers
            if (type === 'lmp') {
                if (lmpContainer) lmpContainer.classList.add('active');
                if (eddContainer) eddContainer.classList.remove('active');

                // Set required attributes
                if (lmpDateInput) lmpDateInput.required = true;
                if (eddDateInput) eddDateInput.required = false;

                // Clear and focus on LMP input
                setTimeout(() => {
                    if (lmpDateInput) lmpDateInput.focus();
                }, 100);
            } else {
                if (lmpContainer) lmpContainer.classList.remove('active');
                if (eddContainer) eddContainer.classList.add('active');

                // Set required attributes
                if (lmpDateInput) lmpDateInput.required = false;
                if (eddDateInput) eddDateInput.required = true;

                // Clear and focus on EDD input
                setTimeout(() => {
                    if (eddDateInput) eddDateInput.focus();
                }, 100);
            }

            // Clear the inactive input
            if (type === 'lmp' && eddDateInput) {
                eddDateInput.value = '';
            } else if (lmpDateInput) {
                lmpDateInput.value = '';
            }
        }

        // Type button event listeners
        typeButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                setCalculationType(this.dataset.type);
            });
        });

        // Set default dates
        function setDefaultDates() {
            const today = new Date();

            // Set max/min dates
            if (lmpDateInput) {
                lmpDateInput.max = today.toISOString().split('T')[0];
            }

            // For EDD, set min to today and max to 10 months from now
            if (eddDateInput) {
                eddDateInput.min = today.toISOString().split('T')[0];
                const maxDate = new Date(today);
                maxDate.setMonth(maxDate.getMonth() + 10);
                eddDateInput.max = maxDate.toISOString().split('T')[0];
            }
        }

        // Validate date input
        function validateDate(input, isLMP = true) {
            const today = new Date();
            const selectedDate = new Date(input.value);

            if (isNaN(selectedDate.getTime())) {
                return { valid: false, error: "Ranar da ka shigar ba ta da inganci" };
            }

            if (isLMP) {
                // LMP cannot be in the future
                if (selectedDate > today) {
                    return { valid: false, error: "Ba zai yiwu ranar haila ta kasance a nan gaba ba" };
                }

                // LMP shouldn't be older than 1 year
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

                if (selectedDate < oneYearAgo) {
                    return { valid: false, error: "Ranar haila ta wuce shekara guda. Da fatan za a shigar da wadda ta kusa" };
                }
            } else {
                // EDD should be in the future (can be up to 2 weeks overdue)
                const twoWeeksAgo = new Date();
                twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

                if (selectedDate < twoWeeksAgo) {
                    return { valid: false, error: "Ranar haihuwa ta wuce makonni biyu. Da fatan za a shigar da wadda ta dace" };
                }
            }

            return { valid: true, date: selectedDate };
        }

        // Calculate pregnancy details
        function calculatePregnancyDetails(lmp, edd, today) {
            // Calculate days from LMP
            const diffTime = today - lmp;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Calculate weeks and days
            let weeks = Math.floor(diffDays / 7);
            const days = diffDays % 7;

            // Cap at 40 weeks
            if (weeks > 40) {
                weeks = 40;
            }

            // Calculate weeks left
            const dueDiffTime = edd - today;
            const dueDiffDays = Math.max(0, Math.floor(dueDiffTime / (1000 * 60 * 60 * 24)));
            const weeksLeft = Math.ceil(dueDiffDays / 7);

            // Calculate trimester
            let trimesterText;
            if (weeks <= 13) {
                trimesterText = "1 (Na Farko)";
            } else if (weeks <= 27) {
                trimesterText = "2 (Na Biyu)";
            } else {
                trimesterText = "3 (Na Uku)";
            }

            // Calculate month
            const month = Math.floor(weeks / 4.3) + 1;

            // Calculate progress
            const progress = Math.min(100, Math.round((weeks / 40) * 100));

            // Get baby size
            const babySize = babySizes[Math.min(weeks, 39)] || "Watermelon";

            return {
                lmp: lmp,
                edd: edd,
                weeks: weeks,
                days: days,
                weeksLeft: weeksLeft,
                daysLeft: dueDiffDays,
                trimesterText: trimesterText,
                month: month,
                progress: progress,
                babySize: babySize,
                daysFromLMP: diffDays
            };
        }

        // Form submission
        pregnancyForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Disable submit button temporarily
            const submitBtn = this.querySelector('.calculate-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Ana lissafawa...';
            submitBtn.disabled = true;

            let validation;
            let results;

            if (currentCalculationType === 'lmp') {
                validation = validateDate(lmpDateInput, true);

                if (!validation.valid) {
                    showToast(validation.error);
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                results = calculateFromLMP(lmpDateInput.value);
            } else {
                validation = validateDate(eddDateInput, false);

                if (!validation.valid) {
                    showToast(validation.error);
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                results = calculateFromEDD(eddDateInput.value);
            }

            // Check if pregnancy is valid (not negative weeks)
            if (results.weeks < 0) {
                showToast("Ba zai yiwu ciki ya kasance kafin ranar haila ba");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Show results after delay
            setTimeout(() => {
                updatePregnancyModal(results);

                // Show modal
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';

                // Flip card back
                document.getElementById('baby-tracking-card')?.classList.remove('flipped');

                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 500);
        });

        // Calculate from LMP
        function calculateFromLMP(lmpValue) {
            const lmpDate = new Date(lmpValue);
            const today = new Date();
            const edd = new Date(lmpDate);
            edd.setDate(edd.getDate() + 280);

            return calculatePregnancyDetails(lmpDate, edd, today);
        }

        // Calculate from EDD
        function calculateFromEDD(eddValue) {
            const today = new Date();
            const edd = new Date(eddValue);
            const lmp = new Date(edd);
            lmp.setDate(lmp.getDate() - 280);

            return calculatePregnancyDetails(lmp, edd, today);
        }

        // Update pregnancy modal
        function updatePregnancyModal(results) {
            const updateElement = (id, text) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            };

            updateElement('current-week', results.weeks);
            updateElement('current-day', results.days);
            updateElement('baby-size-text', `Girman jariri: ${results.babySize}`);
            updateElement('due-date-text', formatDateHausa(results.edd));
            updateElement('weeks-left-text', `Saura makonni: ${results.weeksLeft}`);
            updateElement('week-display', `${results.weeks} (Ki ke a yanzu)`);
            updateElement('month-display', `${results.month} (Ki ke a yanzu)`);
            updateElement('trimester-display', results.trimesterText);

            // Update progress bar
            const progressBar = document.getElementById('pregnancy-progress');
            if (progressBar) {
                progressBar.style.width = `${results.progress}%`;

                // Color based on trimester
                if (results.weeks <= 13) {
                    progressBar.style.background = 'linear-gradient(90deg, #00aeef, #4dc9ff)';
                } else if (results.weeks <= 27) {
                    progressBar.style.background = 'linear-gradient(90deg, #fb923c, #fdba74)';
                } else {
                    progressBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
                }
            }
        }

        // Modal close functionality
        const modalClose = modal.querySelector('.modal-close');
        const modalOverlay = modal.querySelector('.modal-overlay');

        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }

        // Save and share buttons
        document.getElementById('save-pregnancy-btn')?.addEventListener('click', function () {
            const pregnancyData = {
                calculationType: currentCalculationType,
                lmpDate: currentCalculationType === 'lmp' ? (lmpDateInput?.value || '') : '',
                eddDate: currentCalculationType === 'edd' ? (eddDateInput?.value || '') : '',
                calculatedAt: new Date().toISOString()
            };

            localStorage.setItem('pregnancy_tracking_data', JSON.stringify(pregnancyData));
            showToast("✓ Bayanin ciki an ajiye shi cikin nasara!", 3000);
        });

        document.getElementById('share-pregnancy-btn')?.addEventListener('click', async function () {
            try {
                const currentWeek = document.getElementById('current-week')?.textContent || '0';
                const dueDate = document.getElementById('due-date-text')?.textContent || '';
                const weeksLeft = document.getElementById('weeks-left-text')?.textContent || '';

                const shareData = {
                    title: 'Sakamakon Bibiyar Ciki',
                    text: `Mako na: ${currentWeek}\nRanar Haihuwa: ${dueDate}\n${weeksLeft}\n\nDaga Ciki da Raino App`,
                    url: window.location.href
                };

                if (navigator.share && navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText(shareData.text);
                    showToast("✓ Sakamakon an kwafa shi zuwa clipboard!", 3000);
                }
            } catch (err) {
                showToast("Ba zai yiwu a raba sakamakon ba");
            }
        });

        // Initialize
        function initialize() {
            setCalculationType('lmp');
            setDefaultDates();

            // Load saved data
            const savedData = localStorage.getItem('pregnancy_tracking_data');
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    if (data.calculationType) {
                        setCalculationType(data.calculationType);
                    }
                    if (data.lmpDate && lmpDateInput) {
                        lmpDateInput.value = data.lmpDate;
                    }
                    if (data.eddDate && eddDateInput) {
                        eddDateInput.value = data.eddDate;
                    }
                } catch (e) {
                    console.error('Error loading saved pregnancy data:', e);
                }
            }
        }

        initialize();
    }

    // ============================================
    // ARTICLES SECTION
    // ============================================
    function initArticles() {
        const articlesCard = document.getElementById('articles-benefit-card');
        const articlesContentSection = document.getElementById('articles-content-section');
        const articlesGrid = document.getElementById('articles-grid');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const searchInput = document.getElementById('articles-search');
        const searchBtn = document.querySelector('.search-btn');
        const articleDetailModal = document.getElementById('article-detail-modal');

        if (!articlesCard || !articlesContentSection) {
            console.warn('Articles elements not found');
            return;
        }

        // Sample articles data
        const sampleArticles = [
            {
                id: 1,
                title: "Abinci Mai Gina Jiki Ga Uwa Mai Ciki",
                excerpt: "Menene abinci masu muhimmanci don lafiyar ku da ta jariri a lokacin ciki?",
                category: "nutrition",
                content: `<h2>Abinci Mai Gina Jiki Ga Uwa Mai Ciki</h2>
                    <p>A lokacin ciki, cin abinci mai gina jiki yana da muhimmanci ga lafiyar ku da ta jariri.</p>
                    <h3>Abubuwan Gina Jiki Masu Muhimmanci:</h3>
                    <ul>
                        <li>Folic Acid - don hana cututtukan kwakwalwa</li>
                        <li>Ƙarfe - don haɓakar jini</li>
                        <li>Calcium - don ƙashi mai ƙarfi</li>
                        <li>Protein - don ci gaban jariri</li>
                    </ul>`,
                readTime: "5 min",
                date: "15 Janairu 2024",
                icon: "🍎",
                saved: false
            },
            {
                id: 2,
                title: "Alamun Farko na Ciki",
                excerpt: "Menene alamun da za ku iya gani a farkon ciki?",
                category: "symptoms",
                content: `<h2>Alamun Farko na Ciki</h2>
                    <p>Alamun farko na ciki na iya bambanta daga mace zuwa mace, amma akwai wasu na gama gari:</p>`,
                readTime: "3 min",
                date: "10 Janairu 2024",
                icon: "🤰",
                saved: false
            },
            {
                id: 3,
                title: "Yadda Ake Kula da Jariri Bayan Haihuwa",
                excerpt: "Dabarun kula da jariri na farko na watanni",
                category: "baby-care",
                content: `<h2>Kula da Jariri Bayan Haihuwa</h2>
                    <p>Kula da jariri bayan haihuwa yana buƙatar haƙuri da ƙwarewa.</p>`,
                readTime: "7 min",
                date: "5 Janairu 2024",
                icon: "👶",
                saved: false
            }
        ];

        let currentCategory = 'all';
        let currentSearch = '';

        // Load articles
        function loadArticles() {
            // Show loading
            if (articlesGrid) articlesGrid.innerHTML = '';
            const loadingElement = document.getElementById('articles-loading');
            if (loadingElement) loadingElement.style.display = 'flex';

            // Simulate API delay
            setTimeout(() => {
                let filteredArticles = sampleArticles;

                // Filter by category
                if (currentCategory !== 'all') {
                    filteredArticles = filteredArticles.filter(article =>
                        article.category === currentCategory
                    );
                }

                // Filter by search
                if (currentSearch.trim() !== '') {
                    const searchTerm = currentSearch.toLowerCase();
                    filteredArticles = filteredArticles.filter(article =>
                        article.title.toLowerCase().includes(searchTerm) ||
                        article.excerpt.toLowerCase().includes(searchTerm)
                    );
                }

                // Update UI
                updateArticlesUI(filteredArticles);

                // Hide loading
                if (loadingElement) loadingElement.style.display = 'none';
            }, 500);
        }

        // Update articles UI
        function updateArticlesUI(articles) {
            const count = articles.length;
            const countElement = document.getElementById('articles-count');
            const titleElement = document.getElementById('articles-category-title');

            if (countElement) countElement.textContent = `${count} labar${count === 1 ? 'i' : 'ai'}`;
            if (titleElement) titleElement.textContent = categoryNames[currentCategory] || 'Duka Labarai';

            // Clear grid
            if (articlesGrid) articlesGrid.innerHTML = '';

            // Show no articles message if empty
            const noArticlesElement = document.getElementById('no-articles-message');
            if (count === 0) {
                if (noArticlesElement) noArticlesElement.style.display = 'block';
                return;
            }

            // Hide no articles message
            if (noArticlesElement) noArticlesElement.style.display = 'none';

            // Add articles to grid
            articles.forEach(article => {
                const articleCard = createArticleCard(article);
                if (articlesGrid) articlesGrid.appendChild(articleCard);
            });
        }

        // Create article card
        function createArticleCard(article) {
            const card = document.createElement('div');
            card.className = 'article-card';
            card.dataset.id = article.id;

            card.innerHTML = `
                <div class="article-image">
                    <span>${article.icon}</span>
                </div>
                <div class="article-content">
                    <span class="article-category">${categoryNames[article.category] || article.category}</span>
                    <h4 class="article-title">${article.title}</h4>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span class="article-date">
                            <span>📅</span>
                            <span>${article.date}</span>
                        </span>
                        <span class="article-read-time">
                            <span>⏱️</span>
                            <span>${article.readTime}</span>
                        </span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                showArticleDetail(article);
            });

            return card;
        }

        // Show article detail
        function showArticleDetail(article) {
            if (!articleDetailModal) return;

            // Update modal content
            const titleElement = document.querySelector('.article-detail-title');
            const categoryElement = document.querySelector('.article-category-badge');
            const dateElement = document.querySelector('.article-date');
            const readTimeElement = document.querySelector('.article-read-time');
            const bodyElement = document.querySelector('.article-body');

            if (titleElement) titleElement.textContent = article.title;
            if (categoryElement) categoryElement.textContent = categoryNames[article.category] || article.category;
            if (dateElement) dateElement.textContent = `📅 ${article.date}`;
            if (readTimeElement) readTimeElement.textContent = `⏱️ ${article.readTime}`;
            if (bodyElement) bodyElement.innerHTML = article.content;

            // Show modal
            articleDetailModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        // Close article detail
        function closeArticleDetail() {
            if (articleDetailModal) {
                articleDetailModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }

        // Articles card click (show categories)
        const cardFront = articlesCard.querySelector('.card-front');
        if (cardFront) {
            cardFront.addEventListener('click', function () {
                articlesCard.classList.add('flipped');
                articlesContentSection.style.display = 'block';
                loadArticles();
            });
        }

        // Category selection
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.dataset.category;
                loadArticles();
            });
        });

        // Search functionality
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                currentSearch = searchInput.value;
                loadArticles();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    currentSearch = searchInput.value;
                    loadArticles();
                }
            });
        }

        // Article detail modal close
        const backBtn = document.querySelector('.article-back-btn');
        const modalOverlay = articleDetailModal?.querySelector('.modal-overlay');

        if (backBtn) {
            backBtn.addEventListener('click', closeArticleDetail);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeArticleDetail);
        }

        // Article action buttons
        document.querySelectorAll('.article-action-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const action = this.dataset.action;

                switch (action) {
                    case 'share':
                        showToast("Hanyar haɗin labari an kwafa shi");
                        break;
                    case 'save':
                        showToast("Labari an ajiye shi");
                        break;
                    case 'speak':
                        showToast("Ana karanta labarin...");
                        break;
                }
            });
        });

        // Initialize with some articles
        loadArticles();
    }

    // ============================================
    // CHATBOT KNOWLEDGE BASE
    // ============================================
    const chatbotKnowledge = {
        "alamun ciki": {
            question: "Menene alamun farko na ciki?",
            answer: `Alamun farko na ciki sun haɗa da:<br><br>
1. <strong>Jinkirin haila</strong>: Mafi muhimmanci alama<br>
2. <strong>Ƙwayoyin nono masu zafi</strong> ko girma<br>
3. <strong>Gajiya mai yawa</strong> ba tare da dalili ba<br>
4. <strong>Ƙaiƙayi da amai</strong> (morning sickness)<br>
5. <strong>Sauyin sha'awar abinci</strong> (cravings)<br>
6. <strong>Motsin zuciya</strong> (nausea)<br>
7. <strong>Yawan fitsari</strong><br>
8. <strong>Zazzabi ko zafi a jiki</strong><br><br>
Alamun na iya bambanta daga mace zuwa mace. Idan kun ga waɗannan alamai, yi gwajin ciki.`,
            category: "ciki",
            tags: ["alamu", "farko", "symptoms"]
        },

        "abinci mai gina jiki": {
            question: "Menene abinci mai gina jiki ga uwa mai ciki?",
            answer: `Abinci mai gina jiki ga uwa mai ciki:<br><br>
🍎 <strong>'Ya'yan itatuwa da kayan lambu</strong>: Rufe launi daban-daban (kore, ja, orange, purple)<br>
🥚 <strong>Furotin</strong>: Kifi, nama, kwai, wake, soyayyen abinci<br>
🥛 <strong>Calcium</strong>: Madara, cuku, yogurt, da kifi masu ƙashi<br>
🌾 <strong>Carbohydrates masu lafiya</strong>: Shinkafa, alkama, masara, dawa<br>
🥑 <strong>Mai masu lafiya</strong>: Avocado, man gyada, man zaitun<br>
💧 <strong>Ruwa</strong>: A sha aƙalla lita 8-10 a rana<br><br>
<strong>Muhimman abubuwan gina jiki:</strong><br>
• Folic acid (ganye kore, wake)<br>
• Ƙarfe (nama, kifi, 'ya'yan itatuwa)<br>
• Calcium (madara, cuku)<br>
• Vitamin D (hasken rana, kifi)`,
            category: "abinci",
            tags: ["nutrition", "gina jiki", "abinci"]
        },

        "ruwa a ciki": {
            question: "Yaya zan sha ruwa yayin ciki?",
            answer: `Yayin ciki, ruwa yana da muhimmanci sosai:<br><br>
💧 <strong>Yawan ruwa</strong>: A sha aƙalla lita 8-10 a rana (ko fiye idan yana zafi)<br>
🕒 <strong>Lokaci</strong>: Sha ƙarami akai-akai a tsawon rana<br>
🚰 <strong>Nau'in ruwa</strong>: Ruwan sanyi ya fi dacewa, ruwan dafaffe ma yana da kyau<br>
🍵 <strong>Madadin</strong>: Shan shayi mara caffeine, ruwan 'ya'yan itatuwa (lemun tsami, lemo)<br><br>
<strong>Fa'idodin ruwa yayin ciki:</strong><br>
• Yana taimakawa haɓakar mahaifa<br>
• Yana rage gajiya<br>
• Yana hana constipation<br>
• Yana kula da yawan ruwa a jiki<br>
• Yana taimakawa cikin daukar sinadirai`,
            category: "lafiya",
            tags: ["ruwa", "hydration", "lafiya"]
        },

        "default": {
            question: "Na gane tambayar ku",
            answer: `Na gane tambayar ku. Duk da haka, ina ba ku shawarar tuntubar likita ko kwararre don amsa mafi inganci.<br><br>
Za ku iya tambaya game da:<br>
• Alamun ciki da lafiyar uwa<br>
• Abinci mai gina jiki<br>
• Shirye-shiryen haihuwa<br>
• Kula da jariri<br>
• Lafiyar bayan haihuwa<br>
• Cututtukan ciki<br><br>
Ku ci gaba da tambayar ku a cikin Hausa, zan iya taimaka muku da shawarwari na gabaɗaya.`,
            category: "general",
            tags: ["help", "general"]
        }
    };

    // Get bot response
    function getBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase().trim();

        // Check for exact matches
        for (const [key, data] of Object.entries(chatbotKnowledge)) {
            if (lowerMessage.includes(key.toLowerCase())) {
                return {
                    text: data.answer,
                    category: data.category,
                    tags: data.tags
                };
            }
        }

        // Check for keywords
        const keywordMap = {
            'ciki': chatbotKnowledge["alamun ciki"],
            'alamu': chatbotKnowledge["alamun ciki"],
            'abinci': chatbotKnowledge["abinci mai gina jiki"],
            'nutrition': chatbotKnowledge["abinci mai gina jiki"],
            'ruwa': chatbotKnowledge["ruwa a ciki"],
            'water': chatbotKnowledge["ruwa a ciki"],
            'haihuwa': chatbotKnowledge["alamun ciki"],
            'labor': chatbotKnowledge["alamun ciki"],
            'jariri': chatbotKnowledge["abinci mai gina jiki"],
            'baby': chatbotKnowledge["abinci mai gina jiki"],
            'cutar': chatbotKnowledge["alamun ciki"],
            'complication': chatbotKnowledge["alamun ciki"],
            'motsa jiki': chatbotKnowledge["alamun ciki"],
            'exercise': chatbotKnowledge["alamun ciki"],
            'fitness': chatbotKnowledge["alamun ciki"]
        };

        for (const [keyword, data] of Object.entries(keywordMap)) {
            if (lowerMessage.includes(keyword)) {
                return {
                    text: data.answer,
                    category: data.category,
                    tags: data.tags
                };
            }
        }

        // Default response
        return {
            text: chatbotKnowledge.default.answer,
            category: chatbotKnowledge.default.category,
            tags: chatbotKnowledge.default.tags
        };
    }

    // ============================================
    // CHATBOT FUNCTIONALITY
    // ============================================
    function initChatbot() {
        // DOM Elements
        const chatbotPage = document.getElementById('chatbot-page');
        const chatBackBtn = document.getElementById('chat-back-btn');
        const messagesContainer = document.getElementById('messages-container');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const voiceBtn = document.getElementById('voice-btn');
        const clearChatBtn = document.getElementById('clear-chat-btn');
        const voiceListening = document.getElementById('voice-listening');
        const stopListeningBtn = document.getElementById('stop-listening-btn');
        const typingIndicator = document.getElementById('typing-indicator');
        const questionChips = document.querySelectorAll('.question-chip');

        if (!chatbotPage || !messagesContainer) {
            console.error('Chatbot elements not found');
            return;
        }

        // State
        let isListening = false;
        let chatHistory = [];

        // Load chat history from localStorage
        function loadChatHistory() {
            const savedChat = localStorage.getItem('chatbot_history');
            if (savedChat) {
                try {
                    chatHistory = JSON.parse(savedChat);
                    renderChatHistory();
                } catch (e) {
                    console.error('Error loading chat history:', e);
                    chatHistory = [];
                }
            }
        }

        // Save chat history to localStorage
        function saveChatHistory() {
            localStorage.setItem('chatbot_history', JSON.stringify(chatHistory));
        }

        // Render chat history
        function renderChatHistory() {
            messagesContainer.innerHTML = '';

            // Add welcome message if no history
            if (chatHistory.length === 0) {
                addBotMessage("Sannu! Ina taimakon Ciki da Raino. Zan iya amsa tambayoyin ku game da ciki, kula da jariri, lafiya, da dai sauransu a cikin Hausa. Me kuke bukata?", true);
                return;
            }

            // Render all messages from history
            chatHistory.forEach(msg => {
                if (msg.sender === 'user') {
                    addUserMessage(msg.text, msg.time, false);
                } else {
                    addBotMessage(msg.text, false, msg.time);
                }
            });

            scrollToBottom();
        }

        // Add user message
        function addUserMessage(text, time = null, saveToHistory = true) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message';

            const messageTime = time || getCurrentTime();

            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <span>👤</span>
                </div>
                <div class="message-content">
                    <p>${escapeHtml(text)}</p>
                    <div class="message-time">${messageTime}</div>
                </div>
            `;

            messagesContainer.appendChild(messageDiv);

            if (saveToHistory) {
                chatHistory.push({
                    sender: 'user',
                    text: text,
                    time: messageTime
                });
                saveChatHistory();
            }

            scrollToBottom();
            return messageDiv;
        }

        // Add bot message
        function addBotMessage(text, showTyping = true, time = null) {
            if (showTyping) {
                showTypingIndicator();
                setTimeout(() => {
                    hideTypingIndicator();
                    createBotMessage(text, time);
                }, 1500);
            } else {
                createBotMessage(text, time);
            }
        }

        // Create bot message element
        function createBotMessage(text, time = null) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot-message';

            const messageTime = time || getCurrentTime();

            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <span>🤖</span>
                </div>
                <div class="message-content">
                    <p>${formatMessageText(text)}</p>
                    <div class="message-time">${messageTime}</div>
                </div>
            `;

            messagesContainer.appendChild(messageDiv);

            chatHistory.push({
                sender: 'bot',
                text: text,
                time: messageTime
            });
            saveChatHistory();

            scrollToBottom();
            return messageDiv;
        }

        // Format message text with line breaks
        function formatMessageText(text) {
            return escapeHtml(text).replace(/\n/g, '<br>');
        }

        // Escape HTML
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Get current time
        function getCurrentTime() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        // Scroll to bottom of chat
        function scrollToBottom() {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }

        // Show typing indicator
        function showTypingIndicator() {
            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
                scrollToBottom();
            }
        }

        // Hide typing indicator
        function hideTypingIndicator() {
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
        }

        // Handle user message
        function handleUserMessage(message) {
            if (!message.trim()) {
                showToast("Da fatan za a rubuta wani abu", 2000);
                return;
            }

            // Add user message
            addUserMessage(message);

            // Clear input
            if (chatInput) chatInput.value = '';

            // Get and show bot response
            const response = getBotResponse(message);
            addBotMessage(response.text);

            // Show category toast
            const categoryNamesMap = {
                'ciki': 'Alamun Ciki',
                'abinci': 'Abinci Mai Gina Jiki',
                'lafiya': 'Lafiya',
                'haihuwa': 'Haihuwa',
                'jariri': 'Kula da Jariri',
                'general': 'Gabaɗaya'
            };

            const categoryName = categoryNamesMap[response.category] || response.category;
            showToast(`An ba da amsa game da ${categoryName}`, 2000);
        }

        // Voice input simulation
        function startVoiceInput() {
            if (isListening) return;

            isListening = true;
            if (voiceListening) voiceListening.style.display = 'block';
            if (voiceBtn) {
                voiceBtn.style.background = 'var(--accent-coral)';
                voiceBtn.style.color = 'white';
            }

            // Simulate voice recognition
            setTimeout(() => {
                if (isListening) {
                    const sampleQuestions = [
                        "Menene alamun farko na ciki?",
                        "Menene abinci mai gina jiki ga uwa mai ciki?",
                        "Yaya zan sha ruwa yayin ciki?",
                        "Menene alamun haihuwa?",
                        "Yaya zan kula da jariri bayan haihuwa?",
                        "Shin zan iya yi motsa jiki yayin ciki?"
                    ];

                    const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];

                    // Add voice input
                    if (chatInput) chatInput.value = randomQuestion;
                    handleUserMessage(randomQuestion);

                    // Stop listening
                    stopVoiceInput();
                }
            }, 3000);
        }

        // Stop voice input
        function stopVoiceInput() {
            isListening = false;
            if (voiceListening) voiceListening.style.display = 'none';
            if (voiceBtn) {
                voiceBtn.style.background = '';
                voiceBtn.style.color = '';
            }
        }

        // Clear chat
        function clearChat() {
            if (chatHistory.length === 0) {
                showToast("Babu tattaunawar da za a share", 2000);
                return;
            }

            if (confirm("Kuna da tabbacin share duk tattaunawar?")) {
                chatHistory = [];
                saveChatHistory();
                renderChatHistory();
                showToast("An share tattaunawar", 2000);
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            // Send message on button click
            if (sendBtn) {
                sendBtn.addEventListener('click', () => {
                    const message = chatInput.value.trim();
                    handleUserMessage(message);
                });
            }

            // Send message on Enter key
            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const message = chatInput.value.trim();
                        handleUserMessage(message);
                    }
                });
            }

            // Voice button
            if (voiceBtn) {
                voiceBtn.addEventListener('click', startVoiceInput);
            }

            // Stop listening button
            if (stopListeningBtn) {
                stopListeningBtn.addEventListener('click', stopVoiceInput);
            }

            // Clear chat button
            if (clearChatBtn) {
                clearChatBtn.addEventListener('click', clearChat);
            }

            // Quick question chips
            questionChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    const question = chip.getAttribute('data-question');
                    if (chatInput) chatInput.value = question;
                    handleUserMessage(question);
                });
            });
        }

        // Public methods for page switching
        return {
            show: function () {
                if (chatbotPage) {
                    chatbotPage.style.display = 'flex';
                    scrollToBottom();

                    // Auto-focus on input
                    setTimeout(() => {
                        if (chatInput) chatInput.focus();
                    }, 300);
                }
            },

            hide: function () {
                if (chatbotPage) {
                    chatbotPage.style.display = 'none';
                }
            },

            initialize: function () {
                loadChatHistory();
                setupEventListeners();
                scrollToBottom();
            }
        };
    }

    // ============================================
    // PAGE NAVIGATION SYSTEM
    // ============================================
    function initPageNavigation(chatbot) {
        const navItems = document.querySelectorAll('.nav-item');
        const mainContent = document.querySelector('.main-content');

        if (!navItems.length || !mainContent) {
            console.error('Navigation elements not found');
            return;
        }

        // Function to switch pages
        function switchPage(pageId) {
            // Update navigation
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === pageId) {
                    item.classList.add('active');
                }
            });

            // Handle page display
            if (pageId === 'chat') {
                mainContent.style.display = 'none';
                if (chatbot && chatbot.show) chatbot.show();
                document.body.style.overflow = 'hidden';
            } else {
                if (chatbot && chatbot.hide) chatbot.hide();
                mainContent.style.display = 'block';
                document.body.style.overflow = 'auto';

                // Update URL for other pages if needed
                if (pageId === 'home') {
                    window.history.pushState({ page: 'home' }, '', '#');
                } else {
                    window.history.pushState({ page: pageId }, '', `#${pageId}`);
                }
            }
        }

        // Add click event to nav items
        navItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const pageId = this.dataset.page;
                switchPage(pageId);
            });
        });

        // Handle back button in chat
        const chatBackBtn = document.getElementById('chat-back-btn');
        if (chatBackBtn) {
            chatBackBtn.addEventListener('click', () => {
                switchPage('home');
            });
        }

        // Handle browser back/forward buttons
        window.addEventListener('popstate', function (event) {
            const hash = window.location.hash.substring(1) || 'home';
            switchPage(hash);
        });

        // Initialize page based on URL hash
        function initFromUrl() {
            const hash = window.location.hash.substring(1);
            if (hash && hash === 'chat') {
                switchPage('chat');
            } else {
                switchPage('home');
            }
        }

        // Initialize from URL
        initFromUrl();
    }

    // ============================================
    // INITIALIZE APP
    // ============================================
    function initApp() {
        console.log('Initializing Ciki da Raino App...');

        // Initialize theme
        initTheme();

        // Initialize flip cards
        initFlipCards();

        // Initialize ovulation calculator
        initOvulationCalculator();

        // Initialize pregnancy tracker
        initPregnancyTracker();

        // Initialize articles
        initArticles();

        // Initialize chatbot
        const chatbot = initChatbot();
        if (chatbot && chatbot.initialize) {
            chatbot.initialize();
        }

        // Initialize page navigation (pass chatbot instance)
        initPageNavigation(chatbot);

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.calculator-modal, .article-modal').forEach(modal => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                });
            }
        });

        console.log('App initialized successfully!');
    }

    // Start the app
    initApp();
});