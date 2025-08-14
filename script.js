// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️ Light Mode';
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        darkModeToggle.textContent = '☀️ Light Mode';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        darkModeToggle.textContent = '🌙 Dark Mode';
    }
});

// Modal Logic
const modal = document.getElementById('productModal');
const modalName = document.getElementById('modalName');
const modalImage = document.getElementById('modalImage');
const modalPrice = document.getElementById('modalPrice');
const modalFlavors = document.getElementById('modalFlavors');
const modalWhatsAppLink = document.getElementById('modalWhatsAppLink');

const promoCodeModal = document.getElementById('promoCodeModal');
const promoQuestion = document.getElementById('promo-question');
const promoInputContainer = document.getElementById('promo-input-container');
const promoYesBtn = document.getElementById('promo-yes');
const promoNoBtn = document.getElementById('promo-no');
const promoCodeInput = document.getElementById('promo-code-input');
const promoValidateBtn = document.getElementById('promo-validate');
const promoError = document.getElementById('promo-error');

const allCloseButtons = document.querySelectorAll('.close-button');
const products = document.querySelectorAll('.product');

let currentProductData = null; // To store data of the clicked product
let currentPromoCode = null; // To store the validated promo code for the current transaction

// --- New Promo Code Logic ---
const validPromoCodes = ['1234a', '1234b', '1234c', '1234d'];
// In a real-world scenario, you might want to manage used codes on a server.
// For this client-side example, we'll use localStorage to persist used codes across sessions.
let usedPromoCodes = [];
try {
    const storedCodes = localStorage.getItem('usedPromoCodes');
    if (storedCodes) {
        const parsedCodes = JSON.parse(storedCodes);
        if (Array.isArray(parsedCodes)) {
            usedPromoCodes = parsedCodes;
        }
    }
} catch (e) {
    console.error("Error parsing usedPromoCodes from localStorage:", e);
    // If parsing fails, we'll proceed with an empty list of used codes.
}

function updateWhatsAppLink(name, price, whatsappNumber) {
    const checkedFlavor = modalFlavors.querySelector('input[type="radio"]:checked');
    let flavorsMessage = "";
    if (checkedFlavor) {
        flavorsMessage = ` Sabor elegido es : ${checkedFlavor.value}`;
    }

    let promoMessage = "";
    if (currentPromoCode) {
        promoMessage = ` (Código de promotor usado: ${currentPromoCode})`;
    }

    const message = `Hola, estoy interesado/a en el producto: ${name} - Precio: ${price}.${flavorsMessage}${promoMessage}`;
    modalWhatsAppLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function showProductModal() {
    if (!currentProductData) return;

    const { name, image, price, flavors: flavorsStr } = currentProductData;
    const flavors = flavorsStr ? flavorsStr.split(',') : [];
    const whatsappNumber = "+5493544681685";

    modalName.textContent = name;
    modalImage.src = image;
    modalImage.alt = name;
    modalPrice.textContent = `Precio: ${price}`;

    // Clear previous flavors, keeping the <h4> title
    while (modalFlavors.children.length > 1) {
        modalFlavors.removeChild(modalFlavors.lastChild);
    }
    if (flavors.length > 0) {
         modalFlavors.querySelector('h4').textContent = 'Elige un sabor:';
    } else {
         modalFlavors.querySelector('h4').textContent = '';
    }


    flavors.forEach(flavor => {
        const trimmedFlavor = flavor.trim();
        if (!trimmedFlavor) return;

        const flavorId = `flavor-${trimmedFlavor.replace(/\s+/g, '-')}`;
        const container = document.createElement('div');
        container.classList.add('flavor-option');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = flavorId;
        radio.value = trimmedFlavor;
        radio.name = 'flavor-selection';

        const label = document.createElement('label');
        label.htmlFor = flavorId;
        label.textContent = trimmedFlavor;

        container.appendChild(radio);
        container.appendChild(label);
        modalFlavors.appendChild(container);

        radio.addEventListener('change', () => {
            updateWhatsAppLink(name, price, whatsappNumber);
        });
    });

    updateWhatsAppLink(name, price, whatsappNumber);
    modal.style.display = 'block';
}

products.forEach(product => {
    if (product.dataset.price === 'SIN STOCK') {
        product.classList.add('out-of-stock');
    } else {
        product.addEventListener('click', () => {
            currentProductData = product.dataset;
            currentPromoCode = null; // Reset promo code for new selection
            promoError.style.display = 'none';
            promoCodeInput.value = '';
            promoInputContainer.style.display = 'none';
            promoQuestion.style.display = 'block';
            promoCodeModal.style.display = 'block';
        });
    }
});

promoNoBtn.addEventListener('click', () => {
    currentPromoCode = null; // Ensure no code is used
    promoCodeModal.style.display = 'none';
    showProductModal();
});

promoYesBtn.addEventListener('click', () => {
    promoQuestion.style.display = 'none';
    promoInputContainer.style.display = 'block';
});

function validateAndApplyPromoCode(code) {
    const normalizedCode = code.trim().toLowerCase();

    if (usedPromoCodes.includes(normalizedCode)) {
        promoError.textContent = 'Este código ya ha sido utilizado.';
        promoError.style.color = 'red';
        promoError.style.display = 'block';
        return;
    }

    if (validPromoCodes.includes(normalizedCode)) {
        // Code is valid and not used
        currentPromoCode = normalizedCode; // Set code for this transaction
        usedPromoCodes.push(normalizedCode); // Mark as used for future
        localStorage.setItem('usedPromoCodes', JSON.stringify(usedPromoCodes)); // Save to localStorage

        promoError.textContent = `¡Código "${normalizedCode}" aplicado con éxito!`;
        promoError.style.color = 'green';
        promoError.style.display = 'block';

        // Proceed to the product modal after a short delay
        setTimeout(() => {
            promoCodeModal.style.display = 'none';
            showProductModal();
        }, 1500); // 1.5 seconds

    } else {
        promoError.textContent = 'El código ingresado no es válido.';
        promoError.style.color = 'red';
        promoError.style.display = 'block';
    }
}

promoValidateBtn.addEventListener('click', () => {
    validateAndApplyPromoCode(promoCodeInput.value);
});

allCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
        modal.style.display = 'none';
        promoCodeModal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target === modal || event.target === promoCodeModal) {
        modal.style.display = 'none';
        promoCodeModal.style.display = 'none';
    }
});

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    products.forEach(product => {
        const productName = product.dataset.name.toLowerCase();
        if (productName.includes(searchTerm)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
});
