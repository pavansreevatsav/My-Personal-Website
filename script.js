// Same JS as the previous "Full JS code" response.
// The [data-tilt-card] attribute on the new .skill-orb-category divs
// will automatically pick up the existing tilt logic.
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('dotsCanvas');
    const ctx = canvas.getContext('2d');

    let dots = [];
    let globalTime = 0;

    // --- CONFIGURATION FOR DOTS CANVAS ---
    const GRID_SPACING = 28;
    const dotRadius = 0.8;
    const WAVE_1_SPEED = 0.009;
    const WAVE_1_LENGTH_X = 1300;
    const WAVE_1_LENGTH_Y = 850;
    const WAVE_1_AMPLITUDE = 0.65;
    const WAVE_2_SPEED = 0.016;
    const WAVE_2_LENGTH_X = 750;
    const WAVE_2_LENGTH_Y = 1100;
    const WAVE_2_AMPLITUDE = 0.35;

    const phase_1_OffsetX = (2 * Math.PI) / WAVE_1_LENGTH_X;
    const phase_1_OffsetY = (2 * Math.PI) / WAVE_1_LENGTH_Y;
    const phase_2_OffsetX = (2 * Math.PI) / WAVE_2_LENGTH_X;
    const phase_2_OffsetY = (2 * Math.PI) / WAVE_2_LENGTH_Y;

    let baseDotColorRGB = { r: 0, g: 0, b: 0 };

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function parseCSSColorToRGB(cssColorString) {
        const dummy = document.createElement('div');
        dummy.style.color = cssColorString;
        document.body.appendChild(dummy);
        const computedColor = getComputedStyle(dummy).color;
        document.body.removeChild(dummy);
        const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (match) {
            return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
        }
        console.warn("Could not parse dot color. Defaulting to black. CSS:", cssColorString, "Computed:", computedColor);
        return { r: 0, g: 0, b: 0 };
    }

    class Dot {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.alpha = 0;
        }
        updateAndDraw() {
            if (!ctx) return;
            const phase1 = (this.x * phase_1_OffsetX) + (this.y * phase_1_OffsetY) + (globalTime * WAVE_1_SPEED);
            const value1 = Math.sin(phase1) * WAVE_1_AMPLITUDE;
            const phase2 = (this.x * phase_2_OffsetX) + (this.y * phase_2_OffsetY) + (globalTime * WAVE_2_SPEED * 1.15);
            const value2 = Math.sin(phase2) * WAVE_2_AMPLITUDE;
            const combinedValue = value1 + value2;
            this.alpha = (combinedValue + 1) / 2;
            this.alpha = Math.max(0, Math.min(1, this.alpha));
            ctx.beginPath();
            ctx.arc(this.x, this.y, dotRadius, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(${baseDotColorRGB.r}, ${baseDotColorRGB.g}, ${baseDotColorRGB.b}, ${this.alpha})`;
            ctx.fill();
            ctx.closePath();
        }
    }

    function initDots() {
        if (!canvas) return;
        dots = [];
        const cssDotColor = getComputedStyle(document.documentElement).getPropertyValue('--dot-color').trim();
        baseDotColorRGB = parseCSSColorToRGB(cssDotColor);
        for (let y = -GRID_SPACING; y < canvas.height + GRID_SPACING; y += GRID_SPACING) {
            for (let x = -GRID_SPACING; x < canvas.width + GRID_SPACING; x += GRID_SPACING) {
                dots.push(new Dot(x, y));
            }
        }
    }

    function animateDots() {
        if (!canvas || !ctx) return;
        requestAnimationFrame(animateDots);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        globalTime++;
        dots.forEach(dot => {
            dot.updateAndDraw();
        });
    }

    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            if (canvas) {
                const newCssDotColor = getComputedStyle(document.documentElement).getPropertyValue('--dot-color').trim();
                baseDotColorRGB = parseCSSColorToRGB(newCssDotColor);
            }
        });
    }

    if (canvas && ctx) {
        resizeCanvas();
        initDots();
        animateDots();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resizeCanvas();
                initDots();
            }, 250);
        });
    }

    // Smooth Scroll
    const smoothScrollLinks = document.querySelectorAll('.cta-buttons a[href^="#"], .header-right a[href^="#"]');
    smoothScrollLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Header Email Button Functionality
    const emailButtonContainer = document.querySelector('.header-email-button-container');
    const mainEmailButton = document.querySelector('.header-email-main-button');
    const emailToCopy = "pavansrivatsav.akula@gmail.com";

    if (emailButtonContainer && mainEmailButton) {
        const copyButton = emailButtonContainer.querySelector('.email-option-button[data-action="copy"]');
        const closeDropdown = () => mainEmailButton.setAttribute('aria-expanded', 'false');
        const openDropdown = () => mainEmailButton.setAttribute('aria-expanded', 'true');

        mainEmailButton.addEventListener('mouseover', openDropdown);
        mainEmailButton.addEventListener('focus', openDropdown);
        emailButtonContainer.addEventListener('mouseleave', () => {
            if (!emailButtonContainer.contains(document.activeElement)) closeDropdown();
        });

        const allFocusableElementsInDropdown = [mainEmailButton, ...emailButtonContainer.querySelectorAll('.email-option-button')];
        allFocusableElementsInDropdown.forEach(el => {
            el.addEventListener('blur', (e) => {
                setTimeout(() => {
                    if (!emailButtonContainer.contains(document.activeElement)) closeDropdown();
                }, 100);
            });
        });

        if (copyButton) {
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(emailToCopy).then(() => {
                    const originalText = copyButton.innerHTML;
                    const iconHTML = copyButton.querySelector('i') ? copyButton.querySelector('i').outerHTML : '';
                    copyButton.innerHTML = `${iconHTML} Copied!`;
                    setTimeout(() => { copyButton.innerHTML = originalText; }, 2000);
                }).catch(err => {
                    console.error('Failed to copy email: ', err);
                    alert("Failed to copy email. Please copy manually: " + emailToCopy);
                });
            });
        }
        emailButtonContainer.querySelectorAll('.email-option-button').forEach(optBtn => {
            optBtn.addEventListener('click', (e) => {
                if (optBtn.dataset.action !== 'copy') closeDropdown();
            });
        });
    }

    // Experience Accordion & Tabs Functionality
    const jobEntryCards = document.querySelectorAll('.experience-accordion .job-entry-card');
    jobEntryCards.forEach(card => {
        const header = card.querySelector('.job-entry-header');
        const content = card.querySelector('.job-entry-content');
        const tabs = card.querySelectorAll('.job-tab-button');
        const panels = card.querySelectorAll('.job-tab-panel');

        if (header && content) {
            header.addEventListener('click', () => {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                header.setAttribute('aria-expanded', String(!isExpanded));
                content.classList.toggle('active');

                if (!isExpanded) {
                    if (!content.querySelector('.job-tab-button.active')) {
                        tabs[0]?.classList.add('active');
                        panels[0]?.classList.add('active');
                    }
                    content.style.maxHeight = content.scrollHeight + "px";
                } else {
                    content.style.maxHeight = null;
                }
            });
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const targetTabName = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const targetPanel = card.querySelector(`.job-tab-panel[data-tab="${targetTabName}"]`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
                if (content.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        });
    });

    // Tilt Effect for Cards (Certifications AND Skill Orbs)
    const tiltCards = document.querySelectorAll('[data-tilt-card]');
    tiltCards.forEach(card => {
        const maxTilt = card.classList.contains('skill-orb-category') ? 6 : 10; // Lesser tilt for skill orbs
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = ((y - centerY) / centerY) * -maxTilt;
            const tiltY = ((x - centerX) / centerX) * maxTilt;
            card.style.setProperty('--tilt-x', `${tiltX}deg`);
            card.style.setProperty('--tilt-y', `${tiltY}deg`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--tilt-x', `0deg`);
            card.style.setProperty('--tilt-y', `0deg`);
        });
    });

});