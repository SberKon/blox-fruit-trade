document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.item');
    const slots = document.querySelectorAll('.slot, .inventory-slot');
    const tradeSlots = document.querySelectorAll('.slot');
    let activeTooltip = null;

    function toggleSlotLock(slot) {
        if (!slot.classList.contains('slot')) return;
        slot.classList.toggle('locked');
    }

    function handleSlotClick(e) {
        const slot = e.target;
        if (!slot.classList.contains('slot') || slot.children.length > 0) return;
        toggleSlotLock(slot);
    }

    function createItemClone(originalItem) {
        const clone = originalItem.cloneNode(true);
        clone.style.opacity = '1'; // Ensure visibility
        return clone;
    }

    function handleItemClick(e) {
        const item = e.target.closest('.item');
        if (!item) return;

        if (item.closest('.slot')) {
            // Remove tooltip before removing item
            if (activeTooltip) {
                activeTooltip.remove();
                activeTooltip = null;
            }
            
            item.classList.add('removing');
            item.addEventListener('animationend', () => {
                item.remove();
            });
            return;
        }

        const emptySlot = Array.from(tradeSlots).find(slot => 
            !slot.hasChildNodes() && !slot.classList.contains('locked')
        );
        
        if (emptySlot) {
            const clone = createItemClone(item);
            clone.classList.add('adding');
            
            // Initialize all handlers before adding to DOM
            initializeItem(clone);
            clone.addEventListener('click', handleItemClick);
            initializeItemTooltips(clone);
            
            // Add to DOM after initialization
            emptySlot.appendChild(clone);
            
            // Remove adding class after animation
            clone.addEventListener('animationend', () => {
                clone.classList.remove('adding');
            });
        }
    }

    function handleDragStart(e) {
        const item = e.target.closest('.item');
        if (!item) {
            e.preventDefault();
            return;
        }
        
        // Allow dragging from inventory
        if (item.closest('.inventory-slot')) {
            e.dataTransfer.effectAllowed = 'copy';
        } else {
            e.dataTransfer.effectAllowed = 'move';
        }
        
        e.dataTransfer.setData('text/plain', item.outerHTML);
        item.classList.add('dragging');

        // Create ghost image
        const ghost = item.cloneNode(true);
        ghost.style.position = 'absolute';
        ghost.style.top = '-1000px';
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 45, 45);
        setTimeout(() => ghost.remove(), 0);
    }

    function handleDragEnd(e) {
        const item = e.target.closest('.item');
        if (item) {
            item.classList.remove('dragging');
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        const slot = e.target.closest('.slot, .inventory-slot');
        if (slot && !slot.classList.contains('locked')) {
            e.dataTransfer.dropEffect = 'move';
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const slot = e.target.closest('.slot');
        if (!slot || slot.classList.contains('locked')) return;

        const data = e.dataTransfer.getData('text/plain');
        const draggedItem = document.querySelector('.dragging');
        
        // Handle placing item in empty slot
        if (!slot.children.length) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            const newItem = tempDiv.firstChild;
            const clone = createItemClone(newItem);
            slot.appendChild(clone);
            initializeItemTooltips(clone);
        }
        // Clear dragging state
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
    }

    function handleMouseDown(e) {
        const item = e.target.closest('.item');
        if (!item) return;

        const isTradeSlot = item.closest('.slot');
        const isInventorySlot = item.closest('.inventory-slot');
        if (!isTradeSlot && !isInventorySlot) return;

        // Create dragging clone without opacity changes
        const clone = createItemClone(item);
        clone.style.position = 'absolute';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = '1000';
        document.body.appendChild(clone);

        // Track original state
        let originalSlot = null;
        let originalItem = null;

        if (isTradeSlot) {
            originalSlot = item.parentElement;
            originalItem = item;
            // Make original item semi-transparent while dragging
            item.style.opacity = '0.3';
        }

        function moveClone(e) {
            clone.style.left = e.pageX - clone.offsetWidth / 2 + 'px';
            clone.style.top = e.pageY - clone.offsetHeight / 2 + 'px';
        }

        function handleMouseUp(e) {
            const targetSlot = document.elementFromPoint(e.clientX, e.clientY).closest('.slot');
            
            if (targetSlot && !targetSlot.classList.contains('locked')) {
                if (originalSlot && targetSlot !== originalSlot) {
                    // Handle item swap
                    if (targetSlot.children.length > 0) {
                        const existingItem = targetSlot.children[0];
                        originalSlot.innerHTML = '';
                        const swappedClone = createItemClone(existingItem);
                        initializeItem(swappedClone);
                        initializeItemTooltips(swappedClone);
                        swappedClone.addEventListener('click', handleItemClick);
                        originalSlot.appendChild(swappedClone);
                    } else {
                        originalSlot.innerHTML = '';
                    }
                    
                    // Add new item to target slot
                    targetSlot.innerHTML = '';
                    const newClone = createItemClone(originalItem || item);
                    initializeItem(newClone);
                    initializeItemTooltips(newClone);
                    newClone.addEventListener('click', handleItemClick);
                    targetSlot.appendChild(newClone);
                    
                } else if (!targetSlot.children.length) {
                    // Handle new item placement
                    const finalClone = createItemClone(item);
                    initializeItem(finalClone);
                    initializeItemTooltips(finalClone);
                    finalClone.addEventListener('click', handleItemClick);
                    targetSlot.appendChild(finalClone);
                    if (originalSlot) {
                        originalSlot.innerHTML = '';
                    }
                }
            } else if (originalItem && originalSlot) {
                // Restore original item
                originalSlot.innerHTML = '';
                const restoredClone = createItemClone(originalItem);
                initializeItem(restoredClone);
                initializeItemTooltips(restoredClone);
                restoredClone.addEventListener('click', handleItemClick);
                originalSlot.appendChild(restoredClone);
            }

            // Clean up
            clone.remove();
            document.removeEventListener('mousemove', moveClone);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        moveClone(e);
        document.addEventListener('mousemove', moveClone);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function createTooltip(item) {
        if (activeTooltip) {
            activeTooltip.remove();
            activeTooltip = null;
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        
        const type = item.dataset.type;
        const rarity = item.dataset.rarity;
        const name = item.querySelector('.item-name').textContent;
        const showName = !container.classList.contains('hide-names');

        let priceHtml = '';
        if (type === 'Fruit') {
            const price = parseInt(item.dataset.price).toLocaleString();
            const robux = parseInt(item.dataset.robux).toLocaleString();
            priceHtml = `
                <div class="tooltip-row">
                    <span class="tooltip-label">Money:</span>
                    <span><img src="svg/money-icon.svg" alt="$" class="currency-icon">${price}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Robux:</span>
                    <span><img src="svg/robux-icon.svg" alt="R$" class="currency-icon">${robux}</span>
                </div>`;
        } else if (type === 'Game Pass' || type === 'Game Pass(Product)') {
            const robux = parseInt(item.dataset.robux).toLocaleString();
            priceHtml = `
                <div class="tooltip-row">
                    <span class="tooltip-label">Robux:</span>
                    <span><img src="svg/robux-icon.svg" alt="R$" class="currency-icon">${robux}</span>
                </div>`;
        }

        // Беремо колір з border-color елемента item-border
        const itemBorder = item.querySelector('.item-border');
        const rarityColor = window.getComputedStyle(itemBorder).borderColor;

        tooltip.innerHTML = `
            ${showName ? `<div class="tooltip-row">
                <span class="tooltip-label">Name:</span>
                <span>${name}</span>
            </div>` : ''}
            <div class="tooltip-row">
                <span class="tooltip-label">Type:</span>
                <span>${type}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Rarity:</span>
                <span style="color: ${rarityColor}">${rarity}</span>
            </div>
            ${priceHtml}
        `;
        
        document.body.appendChild(tooltip);
        activeTooltip = tooltip;
        return tooltip;
    }

    function updateTooltipPosition(e, tooltip) {
        const x = e.pageX + 15;
        const y = e.pageY + 15;
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    function initializeItemTooltips(item) {
        let currentTooltip = null;

        const removeTooltip = () => {
            if (currentTooltip) {
                currentTooltip.remove();
                currentTooltip = null;
                activeTooltip = null;
            }
        };

        item.addEventListener('mouseover', (e) => {
            removeTooltip(); // Clean up any existing tooltip
            currentTooltip = createTooltip(item);
            updateTooltipPosition(e, currentTooltip);
        });

        item.addEventListener('mousemove', (e) => {
            if (currentTooltip) {
                updateTooltipPosition(e, currentTooltip);
            }
        });

        item.addEventListener('mouseout', removeTooltip);

        // Enhanced cleanup for item removal
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && !document.contains(item)) {
                    removeTooltip();
                    observer.disconnect();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function updateTooltips() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            if (item._tooltip) {
                item._tooltip.remove();
                item._tooltip = null;
            }
        });
    }

    function initializeItem(item) {
        item.draggable = true;
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        
        // Add mouse down handler for all items
        item.addEventListener('mousedown', handleMouseDown);
        
        // Make all child elements trigger parent's drag
        const children = item.querySelectorAll('*');
        children.forEach(child => {
            child.addEventListener('mousedown', (e) => {
                // Prevent default drag of images
                e.preventDefault();
            });
            child.draggable = false;
        });
        
        // Add image scaling
        if (item.hasAttribute('data-img-scale')) {
            const scale = item.getAttribute('data-img-scale');
            item.style.setProperty('--scale-multiplier', scale);
        }
    }

    // Settings functionality
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsModal = document.querySelector('.settings-modal');
    const toggleNames = document.querySelector('#toggleNames');
    const container = document.querySelector('.trade-container');

    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.toggle('active');
    });

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsModal.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsModal.classList.remove('active');
        }
    });

    toggleNames.addEventListener('change', (e) => {
        container.classList.toggle('hide-names');
        updateTooltips();
    });

    // Initialize slots
    slots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        if (slot.classList.contains('slot')) {
            slot.addEventListener('click', handleSlotClick);
        }
    });

    // Initialize items
    items.forEach(item => {
        initializeItem(item);
        item.addEventListener('click', handleItemClick);
        initializeItemTooltips(item);
    });
});