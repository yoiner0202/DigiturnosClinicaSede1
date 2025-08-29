// DigiTurnos - Utility Functions

/**
 * Utility functions for DigiTurnos application
 * Includes helpers for date/time, formatting, validation, etc.
 */

const DigiTurnosUtils = {
    
    /**
     * Date and Time utilities
     */
    DateTime: {
        /**
         * Format current date and time for display
         * @returns {Object} Object with formatted date and time
         */
        getCurrentDateTime: () => {
            const now = new Date();
            return {
                date: now.toLocaleDateString('es-CO'),
                time: now.toLocaleTimeString('es-CO'),
                datetime: now.toLocaleString('es-CO'),
                timestamp: now.getTime(),
                iso: now.toISOString()
            };
        },

        /**
         * Format time for display
         * @param {Date|string|number} date - Date to format
         * @returns {string} Formatted time string
         */
        formatTime: (date) => {
            const d = new Date(date);
            return d.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        },

        /**
         * Format date for display
         * @param {Date|string|number} date - Date to format
         * @returns {string} Formatted date string
         */
        formatDate: (date) => {
            const d = new Date(date);
            return d.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        },

        /**
         * Calculate time difference in minutes
         * @param {Date|string|number} start - Start time
         * @param {Date|string|number} end - End time (default: now)
         * @returns {number} Difference in minutes
         */
        getTimeDifference: (start, end = new Date()) => {
            const startTime = new Date(start);
            const endTime = new Date(end);
            return Math.floor((endTime - startTime) / (1000 * 60));
        }
    },

    /**
     * Ticket formatting utilities
     */
    Ticket: {
        /**
         * Format ticket number with prefix and padding
         * @param {string} prefix - Service prefix
         * @param {number} number - Ticket number
         * @param {number} padding - Number padding (default: 3)
         * @returns {string} Formatted ticket number
         */
        formatNumber: (prefix, number, padding = 3) => {
            const paddedNumber = number.toString().padStart(padding, '0');
            return `${prefix}${paddedNumber}`;
        },

        /**
         * Parse ticket number to get prefix and number
         * @param {string} ticketNumber - Full ticket number
         * @returns {Object} Object with prefix and number
         */
        parseNumber: (ticketNumber) => {
            const match = ticketNumber.match(/^([A-Z]+)(\d+)$/);
            if (match) {
                return {
                    prefix: match[1],
                    number: parseInt(match[2], 10),
                    full: ticketNumber
                };
            }
            return null;
        },

        /**
         * Generate unique ticket ID
         * @returns {string} Unique ticket ID
         */
        generateId: () => {
            return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    },

    /**
     * Queue management utilities
     */
    Queue: {
        /**
         * Get next ticket number for a service
         * @param {Array} queue - Current queue
         * @param {string} serviceId - Service ID
         * @returns {number} Next ticket number
         */
        getNextNumber: (queue, serviceId) => {
            const serviceTickets = queue.filter(ticket => ticket.service === serviceId);
            if (serviceTickets.length === 0) return 1;
            
            const maxNumber = Math.max(...serviceTickets.map(ticket => ticket.number));
            return maxNumber + 1;
        },

        /**
         * Get waiting tickets for a service
         * @param {Array} queue - Current queue
         * @param {string} serviceId - Service ID (optional)
         * @returns {Array} Array of waiting tickets
         */
        getWaitingTickets: (queue, serviceId = null) => {
            let waitingTickets = queue.filter(ticket => ticket.status === 'waiting');
            
            if (serviceId) {
                waitingTickets = waitingTickets.filter(ticket => ticket.service === serviceId);
            }
            
            return waitingTickets.sort((a, b) => a.timestamp - b.timestamp);
        },

        /**
         * Get queue statistics
         * @param {Array} queue - Current queue
         * @returns {Object} Queue statistics
         */
        getStatistics: (queue) => {
            const stats = {
                total: queue.length,
                waiting: 0,
                called: 0,
                completed: 0,
                byService: {}
            };

            queue.forEach(ticket => {
                stats[ticket.status]++;
                
                if (!stats.byService[ticket.service]) {
                    stats.byService[ticket.service] = {
                        total: 0,
                        waiting: 0,
                        called: 0,
                        completed: 0
                    };
                }
                
                stats.byService[ticket.service].total++;
                stats.byService[ticket.service][ticket.status]++;
            });

            return stats;
        },

        /**
         * Estimate waiting time for a ticket
         * @param {Array} queue - Current queue
         * @param {Object} ticket - Ticket to estimate
         * @param {number} avgServiceTime - Average service time in minutes
         * @returns {number} Estimated waiting time in minutes
         */
        estimateWaitingTime: (queue, ticket, avgServiceTime = 15) => {
            const waitingBefore = queue.filter(t => 
                t.status === 'waiting' && 
                t.timestamp < ticket.timestamp
            ).length;
            
            return waitingBefore * avgServiceTime;
        }
    },

    /**
     * Audio and speech utilities
     */
    Audio: {
        /**
         * Check if text-to-speech is supported
         * @returns {boolean} True if TTS is supported
         */
        isTTSSupported: () => {
            return 'speechSynthesis' in window;
        },

        /**
         * Speak text with Spanish voice
         * @param {string} text - Text to speak
         * @param {Object} options - Speech options
         */
        speak: (text, options = {}) => {
            if (!DigiTurnosUtils.Audio.isTTSSupported()) {
                console.warn('Text-to-Speech not supported');
                return;
            }

            const defaults = {
                lang: 'es-ES',
                rate: 0.8,
                volume: 1.0,
                pitch: 1.0
            };

            const settings = { ...defaults, ...options };
            
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            Object.keys(settings).forEach(key => {
                utterance[key] = settings[key];
            });

            window.speechSynthesis.speak(utterance);
        },

        /**
         * Stop current speech
         */
        stopSpeech: () => {
            if (DigiTurnosUtils.Audio.isTTSSupported()) {
                window.speechSynthesis.cancel();
            }
        },

        /**
         * Play notification sound (if available)
         * @param {string} soundUrl - URL to sound file
         */
        playNotification: (soundUrl = null) => {
            if (soundUrl) {
                const audio = new Audio(soundUrl);
                audio.play().catch(err => console.warn('Could not play notification sound:', err));
            }
        }
    },

    /**
     * Print utilities
     */
    Print: {
        /**
         * Generate printable ticket HTML
         * @param {Object} ticket - Ticket object
         * @param {Object} clinicInfo - Clinic information
         * @param {number} waitingCount - Number of tickets waiting before this one
         * @returns {string} HTML string for printing
         */
        generateTicketHTML: (ticket, clinicInfo = {}, waitingCount = 0) => {
            const clinic = {
                name: 'CLÍNICA TORCOROMA',
                address: '',
                phone: '',
                ...clinicInfo
            };

            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Ticket - ${ticket.fullNumber}</title>
                    <style>
                        body { 
                            font-family: 'Courier New', monospace; 
                            text-align: center; 
                            padding: 10px;
                            font-size: 12px;
                            margin: 0;
                            width: 300px;
                        }
                        .header { 
                            font-size: 16px; 
                            font-weight: bold; 
                            margin-bottom: 5px;
                        }
                        .clinic-name { 
                            font-size: 14px; 
                            margin-bottom: 15px;
                            text-transform: uppercase;
                        }
                        .ticket-number { 
                            font-size: 36px; 
                            font-weight: bold; 
                            margin: 15px 0;
                            border: 2px solid #000;
                            padding: 15px;
                            background: #f0f0f0;
                        }
                        .service { 
                            font-size: 14px; 
                            margin: 8px 0;
                            font-weight: bold;
                        }
                        .details { 
                            margin: 15px 0;
                            font-size: 11px;
                            line-height: 1.4;
                        }
                        .instructions {
                            margin-top: 15px;
                            font-size: 10px;
                            color: #666;
                            line-height: 1.3;
                        }
                        .separator {
                            border-top: 1px dashed #000;
                            margin: 10px 0;
                        }
                        @media print {
                            body { width: auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">DIGITURNOS</div>
                    <div class="clinic-name">${clinic.name}</div>
                    
                    <div class="ticket-number">${ticket.fullNumber}</div>
                    
                    <div class="service">
                        ${ticket.serviceName}
                    </div>
                    
                    <div class="separator"></div>
                    
                    <div class="details">
                        <strong>Fecha:</strong> ${ticket.date}<br>
                        <strong>Hora:</strong> ${ticket.timestamp}<br>
                        <strong>Turnos anteriores:</strong> ${waitingCount}
                    </div>
                    
                    <div class="separator"></div>
                    
                    <div class="instructions">
                        Por favor manténgase atento a las pantallas<br>
                        y al llamado por voz de su turno.<br>
                        <br>
                        <strong>Gracias por su paciencia.</strong>
                    </div>
                    
                    ${clinic.address || clinic.phone ? `
                        <div class="separator"></div>
                        <div class="instructions">
                            ${clinic.address ? `${clinic.address}<br>` : ''}
                            ${clinic.phone ? `Tel: ${clinic.phone}` : ''}
                        </div>
                    ` : ''}
                </body>
                </html>
            `;
        },

        /**
         * Print ticket
         * @param {Object} ticket - Ticket to print
         * @param {Object} options - Print options
         */
        printTicket: (ticket, options = {}) => {
            const printOptions = {
                autoClose: true,
                delay: 500,
                clinicInfo: {},
                waitingCount: 0,
                ...options
            };

            const printHTML = DigiTurnosUtils.Print.generateTicketHTML(
                ticket, 
                printOptions.clinicInfo, 
                printOptions.waitingCount
            );

            const printWindow = window.open('', '_blank');
            printWindow.document.write(printHTML);
            printWindow.document.close();

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                if (printOptions.autoClose) {
                    printWindow.close();
                }
            }, printOptions.delay);
        }
    },

    /**
     * Validation utilities
     */
    Validation: {
        /**
         * Validate ticket object
         * @param {Object} ticket - Ticket to validate
         * @returns {Object} Validation result
         */
        validateTicket: (ticket) => {
            const errors = [];
            
            if (!ticket.id) errors.push('Missing ticket ID');
            if (!ticket.service) errors.push('Missing service');
            if (!ticket.number || ticket.number < 1) errors.push('Invalid ticket number');
            if (!ticket.fullNumber) errors.push('Missing full ticket number');
            if (!ticket.timestamp) errors.push('Missing timestamp');
            if (!['waiting', 'called', 'completed'].includes(ticket.status)) {
                errors.push('Invalid status');
            }

            return {
                valid: errors.length === 0,
                errors
            };
        },

        /**
         * Validate service configuration
         * @param {Object} service - Service to validate
         * @returns {Object} Validation result
         */
        validateService: (service) => {
            const errors = [];
            
            if (!service.id) errors.push('Missing service ID');
            if (!service.name) errors.push('Missing service name');
            if (!service.prefix) errors.push('Missing service prefix');
            if (!service.color) errors.push('Missing service color');

            return {
                valid: errors.length === 0,
                errors
            };
        }
    },

    /**
     * Storage utilities (for future use)
     */
    Storage: {
        /**
         * Save data to localStorage
         * @param {string} key - Storage key
         * @param {*} data - Data to save
         */
        save: (key, data) => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },

        /**
         * Load data from localStorage
         * @param {string} key - Storage key
         * @param {*} defaultValue - Default value if not found
         * @returns {*} Loaded data or default value
         */
        load: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                return defaultValue;
            }
        },

        /**
         * Remove data from localStorage
         * @param {string} key - Storage key
         */
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        }
    },

    /**
     * DOM utilities
     */
    DOM: {
        /**
         * Create element with attributes and content
         * @param {string} tag - HTML tag
         * @param {Object} attributes - Element attributes
         * @param {string|Array} content - Element content
         * @returns {HTMLElement} Created element
         */
        createElement: (tag, attributes = {}, content = '') => {
            const element = document.createElement(tag);
            
            Object.keys(attributes).forEach(key => {
                element.setAttribute(key, attributes[key]);
            });

            if (Array.isArray(content)) {
                content.forEach(child => {
                    if (typeof child === 'string') {
                        element.appendChild(document.createTextNode(child));
                    } else {
                        element.appendChild(child);
                    }
                });
            } else if (typeof content === 'string') {
                element.innerHTML = content;
            }

            return element;
        },

        /**
         * Add CSS class with animation
         * @param {HTMLElement} element - Target element
         * @param {string} className - CSS class to add
         * @param {number} duration - Animation duration
         */
        addClassWithAnimation: (element, className, duration = 300) => {
            element.classList.add(className);
            setTimeout(() => {
                element.classList.remove(className);
            }, duration);
        },

        /**
         * Smooth scroll to element
         * @param {HTMLElement|string} target - Target element or selector
         */
        scrollToElement: (target) => {
            const element = typeof target === 'string' 
                ? document.querySelector(target) 
                : target;
                
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    },

    /**
     * Event utilities
     */
    Events: {
        /**
         * Debounce function execution
         * @param {Function} func - Function to debounce
         * @param {number} delay - Delay in milliseconds
         * @returns {Function} Debounced function
         */
        debounce: (func, delay) => {
            let timeoutId;
            return function (...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        },

        /**
         * Throttle function execution
         * @param {Function} func - Function to throttle
         * @param {number} delay - Delay in milliseconds
         * @returns {Function} Throttled function
         */
        throttle: (func, delay) => {
            let lastCall = 0;
            return function (...args) {
                const now = Date.now();
                if (now - lastCall >= delay) {
                    lastCall = now;
                    func.apply(this, args);
                }
            };
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DigiTurnosUtils;
}