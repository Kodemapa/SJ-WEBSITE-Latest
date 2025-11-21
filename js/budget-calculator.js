// budget-calculator.js
// All logic for the budget calculator
window.budgetCalculatorInit = function() {
    let currentStep = 1;
    let totalSteps = 7;
    let currentPath = {
        projectType: null, // 'interiors' or 'construction'
        propertyType: null, // 'residential' or 'commercial'
        stepMap: [] // Array of step IDs to show
    };

    const steps = Array.from(document.querySelectorAll('.step'));
    const stepIndicators = Array.from(document.querySelectorAll('.step-indicator'));
    const progressBar = document.getElementById('progressBar');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const getEstimateBtn = document.getElementById('get-estimate-btn');

    // Step mappings for different paths
    const stepMappings = {
        'interiors-residential': [
            'step1', 'step2', 'step3-residential-interiors', 'step4-residential-interiors',
            'step5-residential-interiors', 'step6-residential-interiors', 'step6-summary', 'step7-result'
        ],
        'interiors-commercial': [
            'step1', 'step2', 'step3-commercial-interiors', 'step4-commercial-interiors',
            'step5-commercial-interiors', 'step6-commercial-interiors', 'step6-summary', 'step7-result'
        ],
        'construction-residential': [
            'step1', 'step2', 'step3-residential-construction', 'step4-residential-construction',
            'step5-residential-construction', 'step6-summary', 'step7-result'
        ],
        'construction-commercial': [
            'step1', 'step2', 'step3-commercial-construction', 'step4-commercial-construction',
            'step5-commercial-construction', 'step6-summary', 'step7-result'
        ]
    };

    function updateStepTitles() {
        // ...existing code...
    }
    function showStep(stepIndex) {
        // ...existing code...
    }
    function updateProgressBar() {
        // ...existing code...
    }
    function validateStep(stepIndex) {
        // ...existing code...
    }
    function updateSummary() {
        // ...existing code...
    }
    function calculateBudget() {
        // ...existing code...
    }
    function resetCalculator() {
        // ...existing code...
    }
    // Small UI-only stepper initializer (visual + click interactions)
    function initStepperUI(){
        try {
            const rail = document.querySelector('.step-indicators');
            const indicators = Array.from(document.querySelectorAll('.step-indicator'));
            if (!rail || !indicators.length) return;

            // Ensure each indicator has an inner .num element for styling
            indicators.forEach((el, idx) => {
                if (!el.querySelector('.num')){
                    const text = el.textContent.trim();
                    el.textContent = '';
                    const span = document.createElement('span');
                    span.className = 'num';
                    span.textContent = text;
                    el.appendChild(span);
                }
            });

            // create tick markers if not present
            let ticksContainer = rail.querySelector('.ticks');
            if (!ticksContainer){
                ticksContainer = document.createElement('div');
                ticksContainer.className = 'ticks';
                ticksContainer.style.position = 'absolute';
                ticksContainer.style.left = '0';
                ticksContainer.style.right = '0';
                ticksContainer.style.top = '0';
                ticksContainer.style.height = '100%';
                ticksContainer.style.zIndex = '1';
                rail.appendChild(ticksContainer);
            }
            // ensure ticks match indicators
            ticksContainer.innerHTML = '';
            const railRect = rail.getBoundingClientRect();
            indicators.forEach((ind, i) => {
                const t = document.createElement('span');
                t.className = 'tick';
                // compute center x of corresponding indicator relative to rail
                const indRect = ind.getBoundingClientRect();
                const centerX = (indRect.left + indRect.right) / 2 - railRect.left;
                t.style.left = centerX + 'px';
                t.style.transform = 'translateX(-50%)';
                ticksContainer.appendChild(t);
            });

            // floating badge
            let badge = rail.querySelector('.step-badge');
            if (!badge){
                badge = document.createElement('div');
                badge.className = 'step-badge';
                badge.textContent = '1';
                rail.appendChild(badge);
            }

            // keep track of visual index so we can reposition on resize
            let currentVisualIndex = 0;

            function setVisualStep(index){
                currentVisualIndex = index;
                indicators.forEach((el, i) => {
                    el.classList.toggle('active', i === index);
                    el.classList.toggle('completed', i < index);
                    el.classList.toggle('next', i === index+1);
                    // hide inner number when badge is present for the active element
                    const num = el.querySelector('.num');
                    if (num) num.classList.toggle('hidden-when-badge', i === index);
                });
                const pct = Math.round((index) / Math.max(1, indicators.length-1) * 100);
                rail.style.setProperty('--progress', pct + '%');

                // move badge to center of target indicator (use left + translateX(-50%))
                const target = indicators[index];
                if (target){
                    const railRect2 = rail.getBoundingClientRect();
                    const targetRect = target.getBoundingClientRect();
                    const centerX = (targetRect.left + targetRect.right)/2 - railRect2.left;
                    badge.style.left = centerX + 'px';
                    badge.style.transform = 'translateX(-50%)';
                    badge.textContent = String(index+1);
                }
                // update tick active state
                const ticks = Array.from(ticksContainer.querySelectorAll('.tick'));
                ticks.forEach((t, i) => t.classList.toggle('active', i <= index));
            }

            // reposition ticks and badge on resize in case layout changes
            function repositionAll(){
                const rRect = rail.getBoundingClientRect();
                const ts = Array.from(ticksContainer.querySelectorAll('.tick'));
                indicators.forEach((ind, i) => {
                    const indRect = ind.getBoundingClientRect();
                    const centerX = (indRect.left + indRect.right) / 2 - rRect.left;
                    const t = ts[i];
                    if (t) { t.style.left = centerX + 'px'; t.style.transform = 'translateX(-50%)'; }
                });
                // reposition badge to currentVisualIndex
                setVisualStep(currentVisualIndex);
            }
            window.addEventListener('resize', function(){
                // small timeout to wait for layout
                setTimeout(repositionAll, 60);
            });

            // click handlers to update UI only (non-destructive)
            indicators.forEach((el, i) => {
                el.addEventListener('click', function(){
                    setVisualStep(i);
                    // also dispatch a custom event so other scripts can react if they want
                    const ev = new CustomEvent('budgetStepper:visualChange', { detail: { step: i+1 } });
                    rail.dispatchEvent(ev);
                });
                el.addEventListener('mouseenter', () => el.classList.add('hover'));
                el.addEventListener('mouseleave', () => el.classList.remove('hover'));
            });

            // initialize to first step
            setVisualStep(0);

            // reposition after layout / next paint to ensure accurate bounding boxes
            requestAnimationFrame(function(){
                try{ repositionAll(); }catch(e){}
            });
        } catch (err) {
            console.warn('Stepper UI init failed', err);
        }
    }

    // initialize the stepper UI early (visual only)
    try { initStepperUI(); } catch(e){/* ignore */}
    // ...existing code for event listeners and initialization...
    // The actual code for all these functions and event listeners should be copied from the previous script.

    // --- Interactive background: subtle parallax based on mouse movement ---
    try {
        const calcContainer = document.querySelector('.budget-calculator-container');
        if (calcContainer) {
            // initialize CSS vars if not present
            calcContainer.style.setProperty('--mx', '0px');
            calcContainer.style.setProperty('--my', '0px');

            let rect = null;
            calcContainer.addEventListener('mousemove', function (e) {
                rect = rect || calcContainer.getBoundingClientRect();
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const x = e.clientX - rect.left - cx; // -cx..+cx
                const y = e.clientY - rect.top - cy;
                // scale down the movement for a subtle effect
                const mx = (x * 0.06).toFixed(2) + 'px';
                const my = (y * 0.06).toFixed(2) + 'px';
                calcContainer.style.setProperty('--mx', mx);
                calcContainer.style.setProperty('--my', my);
            });
            calcContainer.addEventListener('mouseleave', function () {
                calcContainer.style.setProperty('--mx', '0px');
                calcContainer.style.setProperty('--my', '0px');
            });
        }
    } catch (err) {
        // fail silently — this is purely visual and should not break calc logic
        console.warn('Interactive background init failed', err);
    }

    // Inject a few floating shapes and particles to make the background more lively
    try {
        const calcContainer = document.querySelector('.budget-calculator-container');
        if (calcContainer && !calcContainer.dataset.bgEnhanced) {
            // create shapes
            const s1 = document.createElement('div'); s1.className = 'floating-shape shape-1';
            const s2 = document.createElement('div'); s2.className = 'floating-shape shape-2';
            const s3 = document.createElement('div'); s3.className = 'floating-shape shape-3';
            calcContainer.appendChild(s1);
            calcContainer.appendChild(s2);
            calcContainer.appendChild(s3);

            // particles — random positions
            const particles = [];
            for (let i = 0; i < 6; i++) {
                const p = document.createElement('div');
                p.className = 'particle p' + ((i % 3) + 1);
                // random initial placement inside container bounds
                const left = Math.round(Math.random() * 80) + '%';
                const top = Math.round(Math.random() * 80) + '%';
                p.style.left = left; p.style.top = top;
                calcContainer.appendChild(p);
                particles.push(p);
            }

            // subtle hue shift that reacts to mouse x position
            let rafId = null;
            function animateHue() {
                // read CSS var --mx and convert to number
                const mx = getComputedStyle(calcContainer).getPropertyValue('--mx') || '0px';
                const num = parseFloat(mx.replace('px','')) || 0;
                // map num (-~40..40) to degrees -8..8
                const deg = Math.max(-10, Math.min(10, Math.round((num/40) * 8)));
                calcContainer.style.setProperty('--hue-shift', deg + 'deg');
                rafId = requestAnimationFrame(animateHue);
            }
            rafId = requestAnimationFrame(animateHue);

            // mark enhanced so we don't duplicate
            calcContainer.dataset.bgEnhanced = '1';

            // cleanup on page unload to avoid leaking RAF
            window.addEventListener('beforeunload', function () { if (rafId) cancelAnimationFrame(rafId); });
        }
    } catch (err) {
        console.warn('Background enhancement failed', err);
    }
};
// Optionally, auto-initialize if calculator is present on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('budget-calculator-container') && window.budgetCalculatorInit) {
            window.budgetCalculatorInit();
        }
    });
} else {
    if (document.getElementById('budget-calculator-container') && window.budgetCalculatorInit) {
        window.budgetCalculatorInit();
    }
}
