// DigiTurnos - Main JavaScript Application

class DigiTurnosApp {
    constructor() {
        // Application state
        this.currentNumber = 1;
        this.queue = [];
        this.lastTicket = 0;
        this.selectedService = 'general';
        this.activeView = 'customer';
        this.currentCalls = {
            ventanilla1: null,
            ventanilla2: null,
        };
        this.lastCalledTickets = [];
        
        // Configuration
        this.services = [
            { id: 'general', name: 'Citas Medicas', color: 'bg-blue-500', prefix: 'C' },
            { id: 'specialist', name: 'Facturación', color: 'bg-purple-500', prefix: 'F' },
            { id: 'Preferention', name: 'Preferencial', color: 'bg-purple-500', prefix: 'P' },

        ];

        this.ventanillas = [
            { id: 'ventanilla1', name: 'Ventanilla 1', color: 'bg-blue-600' },
            { id: 'ventanilla2', name: 'Ventanilla 2', color: 'bg-purple-600' },
        ];

        // Initialize the application
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCustomerView();
        this.updateDateTime();
        
        // Update datetime every second
        setInterval(() => this.updateDateTime(), 1000);
    }

    setupEventListeners() {
        // View navigation
        document.getElementById('display-view-btn')?.addEventListener('click', () => this.switchView('display'));
        document.getElementById('staff-view-btn')?.addEventListener('click', () => this.switchView('staff'));
        document.getElementById('display-view-btn-2')?.addEventListener('click', () => this.switchView('display'));
        document.getElementById('customer-view-btn')?.addEventListener('click', () => this.switchView('customer'));
        document.getElementById('back-to-customer-btn')?.addEventListener('click', () => this.switchView('customer'));

        // Ticket generation
        document.getElementById('generate-ticket-btn')?.addEventListener('click', () => this.generateTicket());

        // Print functionality
        document.getElementById('print-ticket-btn')?.addEventListener('click', () => this.printLastTicket());
    }

    switchView(view) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        // Show target view
        document.getElementById(`${view}-view`).classList.add('active');
        this.activeView = view;

        // Render the appropriate view
        switch(view) {
            case 'customer':
                this.renderCustomerView();
                break;
            case 'display':
                this.renderDisplayView();
                break;
            case 'staff':
                this.renderStaffView();
                break;
        }
    }

    updateDateTime() {
        const now = new Date();
        const dateTimeElement = document.getElementById('current-datetime');
        if (dateTimeElement) {
            dateTimeElement.textContent = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
        }
    }

    renderCustomerView() {
        this.renderServiceSelection();
        this.updateLastTicketDisplay();
    }

    renderServiceSelection() {
        const servicesGrid = document.getElementById('services-grid');
        if (!servicesGrid) return;

        servicesGrid.innerHTML = '';
        
        this.services.forEach(service => {
            const button = document.createElement('button');
            button.className = `service-btn p-4 rounded-lg border-2 transition-all ${
                this.selectedService === service.id
                    ? `${service.color} text-white border-transparent`
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`;
            
            button.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-medium">${service.name}</span>
                    <span class="text-sm">En espera: ${this.getWaitingCount(service.id)}</span>
                </div>
            `;
            
            button.addEventListener('click', () => {
                this.selectedService = service.id;
                this.renderServiceSelection();
            });
            
            servicesGrid.appendChild(button);
        });
    }

    generateTicket() {
        const service = this.services.find(s => s.id === this.selectedService);
        const ticketNumber = this.getNextTicketNumber(this.selectedService);
        const newTicket = {
            id: Date.now(),
            service: this.selectedService,
            serviceName: service.name,
            prefix: service.prefix,
            number: ticketNumber,
            fullNumber: `${service.prefix}${ticketNumber.toString().padStart(3, '0')}`,
            timestamp: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            status: 'waiting'
        };
        
        this.queue.push(newTicket);
        this.lastTicket = newTicket.id;
        
        this.updateLastTicketDisplay();
        this.renderServiceSelection(); // Update waiting counts
        
        // Show success animation
        this.showTicketGenerated();
    }

    getNextTicketNumber(serviceId) {
        const serviceQueue = this.queue.filter(item => item.service === serviceId);
        const lastServiceNumber = serviceQueue.length > 0 
            ? Math.max(...serviceQueue.map(item => item.number))
            : 0;
        return lastServiceNumber + 1;
    }

    getWaitingCount(serviceId) {
        return this.queue.filter(item => item.service === serviceId && item.status === 'waiting').length;
    }

    updateLastTicketDisplay() {
        const display = document.getElementById('last-ticket-display');
        const numberEl = document.getElementById('ticket-number');
        const serviceEl = document.getElementById('ticket-service');
        const timeEl = document.getElementById('ticket-time');
        
        if (this.lastTicket > 0 && display) {
            const ticket = this.queue.find(t => t.id === this.lastTicket);
            if (ticket) {
                display.classList.remove('hidden');
                numberEl.textContent = ticket.fullNumber;
                serviceEl.textContent = ticket.serviceName;
                timeEl.textContent = `Generado: ${ticket.timestamp}`;
            }
        }
    }

    showTicketGenerated() {
        const display = document.getElementById('last-ticket-display');
        if (display) {
            display.classList.add('fade-in');
            setTimeout(() => display.classList.remove('fade-in'), 500);
        }
    }

    printLastTicket() {
        const ticket = this.queue.find(t => t.id === this.lastTicket);
        if (ticket) {
            this.printTicket(ticket);
        }
    }

    printTicket(ticket) {
        const waitingBefore = this.queue.filter(t => 
            t.status === 'waiting' && t.id < ticket.id
        ).length;

        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket - ${ticket.fullNumber}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 20px;
                        font-size: 14px;
                        margin: 0;
                    }
                    .header { 
                        font-size: 20px; 
                        font-weight: bold; 
                        margin-bottom: 10px;
                    }
                    .clinic-name { 
                        font-size: 16px; 
                        margin-bottom: 20px;
                    }
                    .ticket-number { 
                        font-size: 48px; 
                        font-weight: bold; 
                        margin: 20px 0;
                        border: 3px solid #000;
                        padding: 20px;
                    }
                    .service { 
                        font-size: 18px; 
                        margin: 10px 0;
                    }
                    .details { 
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    .instructions {
                        margin-top: 20px;
                        font-size: 11px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="header">DIGITURNOS</div>
                <div class="clinic-name">CLÍNICA TORCOROMA</div>
                
                <div class="ticket-number">${ticket.fullNumber}</div>
                
                <div class="service">
                    <strong>Servicio:</strong><br>
                    ${ticket.serviceName}
                </div>
                
                <div class="details">
                    <strong>Fecha:</strong> ${ticket.date}<br>
                    <strong>Hora:</strong> ${ticket.timestamp}<br>
                    <strong>En espera:</strong> ${waitingBefore} turnos
                </div>
                
                <div class="instructions">
                    Por favor manténgase atento a las pantallas<br>
                    y al llamado por voz de su turno.<br>
                    Gracias por su paciencia.
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    renderDisplayView() {
        this.renderCurrentCalls();
        this.renderLastCalledTickets();
        this.renderWaitingStats();
    }

    renderCurrentCalls() {
        const grid = document.getElementById('current-calls-grid');
        if (!grid) return;

        grid.innerHTML = '';

        this.ventanillas.forEach(ventanilla => {
            const currentTicket = this.currentCalls[ventanilla.id];
            const div = document.createElement('div');
            div.className = 'bg-gray-800 rounded-lg p-8 border-4 border-gray-700 current-call-display';
            
            div.innerHTML = `
                <div class="text-center">
                    <h3 class="text-3xl font-bold mb-6">${ventanilla.name}</h3>
                    
                    <div class="bg-gray-700 rounded-lg p-8 mb-6">
                        ${currentTicket ? `
                            <div class="text-6xl font-bold text-yellow-400 mb-4 ticket-number-large call-animation">
                                ${currentTicket.fullNumber}
                            </div>
                            <div class="text-2xl text-gray-300 mb-2">
                                ${currentTicket.serviceName}
                            </div>
                            <div class="text-lg text-gray-400">
                                Llamado: ${currentTicket.calledAt}
                            </div>
                            <div class="mt-4">
                                <div class="inline-block bg-green-600 text-white px-6 py-2 rounded-full text-xl font-semibold animate-pulse">
                                    PASE POR FAVOR
                                </div>
                            </div>
                        ` : `
                            <div class="text-4xl text-gray-500">
                                Sin turno asignado
                            </div>
                        `}
                    </div>
                </div>
            `;
            
            grid.appendChild(div);
        });
    }

    renderLastCalledTickets() {
        const container = document.getElementById('last-called-tickets');
        if (!container) return;

        container.innerHTML = '';

        this.lastCalledTickets.forEach((ticket, index) => {
            const div = document.createElement('div');
            div.className = 'bg-gray-700 rounded-lg p-4 text-center fade-in';
            
            div.innerHTML = `
                <div class="text-2xl font-bold text-blue-400">${ticket.fullNumber}</div>
                <div class="text-sm text-gray-300">${ticket.ventanilla?.replace('ventanilla', 'Vent. ')}</div>
                <div class="text-xs text-gray-400">${ticket.calledAt}</div>
            `;
            
            container.appendChild(div);
        });
    }

    renderWaitingStats() {
        const container = document.getElementById('waiting-stats');
        if (!container) return;

        container.innerHTML = '';

        this.services.forEach(service => {
            const div = document.createElement('div');
            div.className = 'bg-gray-800 rounded-lg p-6 text-center stat-card';
            
            div.innerHTML = `
                <div class="w-6 h-6 rounded-full ${service.color} mx-auto mb-3"></div>
                <h4 class="text-lg font-semibold mb-2">${service.name}</h4>
                <div class="text-3xl font-bold text-yellow-400 stat-number">
                    ${this.getWaitingCount(service.id)}
                </div>
                <div class="text-sm text-gray-400">en espera</div>
            `;
            
            container.appendChild(div);
        });
    }

    renderStaffView() {
        this.renderVentanillasControl();
        this.renderQueueStatus();
        this.renderStatistics();
    }

    renderVentanillasControl() {
        const container = document.getElementById('ventanillas-control');
        if (!container) return;

        container.innerHTML = '';

        this.ventanillas.forEach(ventanilla => {
            const currentTicket = this.currentCalls[ventanilla.id];
            const div = document.createElement('div');
            div.className = 'bg-white rounded-lg shadow-lg p-6 ventanilla-card';
            
            div.innerHTML = `
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold">${ventanilla.name}</h3>
                    <div class="ventanilla-indicator w-4 h-4 rounded-full ${ventanilla.color} ${currentTicket ? 'active' : ''}"></div>
                </div>

                <div class="text-center mb-6">
                    <div class="text-2xl font-bold text-gray-800 mb-2">
                        ${currentTicket ? currentTicket.fullNumber : 'Sin turno'}
                    </div>
                    ${currentTicket ? `
                        <div class="text-sm text-gray-600 mb-4">
                            ${currentTicket.serviceName} - Llamado: ${currentTicket.calledAt}
                        </div>
                    ` : ''}
                </div>

                <div class="space-y-3">
                    <button class="call-next-btn w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                        this.queue.filter(t => t.status === 'waiting').length > 0
                            ? `${ventanilla.color} hover:opacity-90 text-white`
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }" 
                    data-ventanilla="${ventanilla.id}"
                    ${this.queue.filter(t => t.status === 'waiting').length === 0 ? 'disabled' : ''}>
                        <span>🔊</span>
                        <span>Llamar Siguiente</span>
                    </button>

                    ${currentTicket ? `
                        <button class="repeat-call-btn w-full py-2 px-4 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition-colors flex items-center justify-center space-x-2"
                        data-ventanilla="${ventanilla.id}">
                            <span>🔄</span>
                            <span>Repetir Llamado</span>
                        </button>

                        <button class="print-current-btn w-full py-2 px-4 rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                        data-ticket-id="${currentTicket.id}">
                            <span>🖨️</span>
                            <span>Imprimir Ticket</span>
                        </button>

                        <button class="complete-ticket-btn w-full py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                        data-ventanilla="${ventanilla.id}">
                            Completar Atención
                        </button>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(div);
        });

        // Add event listeners for ventanilla buttons
        this.setupVentanillaEventListeners();
    }

    setupVentanillaEventListeners() {
        // Call next buttons
        document.querySelectorAll('.call-next-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ventanillaId = e.currentTarget.dataset.ventanilla;
                this.callNextToVentanilla(ventanillaId);
            });
        });

        // Repeat call buttons
        document.querySelectorAll('.repeat-call-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ventanillaId = e.currentTarget.dataset.ventanilla;
                this.repeatCall(ventanillaId);
            });
        });

        // Print current ticket buttons
        document.querySelectorAll('.print-current-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ticketId = parseInt(e.currentTarget.dataset.ticketId);
                const ticket = this.queue.find(t => t.id === ticketId);
                if (ticket) this.printTicket(ticket);
            });
        });

        // Complete ticket buttons
        document.querySelectorAll('.complete-ticket-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ventanillaId = e.currentTarget.dataset.ventanilla;
                this.completeTicket(ventanillaId);
            });
        });
    }

callNextToVentanilla(ventanillaId) {
    let allowedServices = [];

    // Definir qué servicios puede atender cada ventanilla
    if (ventanillaId === 'ventanilla1') {
        allowedServices = ['general']; // Citas Médicas
    } else if (ventanillaId === 'ventanilla2') {
        allowedServices = ['specialist', 'Preferention']; // Facturación y Preferencial
    }

    // Buscar el siguiente ticket en espera que pertenezca a los servicios permitidos
    const waitingTickets = this.queue.filter(
        item => item.status === 'waiting' && allowedServices.includes(item.service)
    );

    if (waitingTickets.length > 0) {
        const nextTicket = waitingTickets[0];
        const ventanilla = this.ventanillas.find(v => v.id === ventanillaId);

        // Actualizar estado del ticket
        const ticketIndex = this.queue.findIndex(item => item.id === nextTicket.id);
        this.queue[ticketIndex] = {
            ...nextTicket,
            status: 'called',
            ventanilla: ventanillaId,
            calledAt: new Date().toLocaleTimeString()
        };

        // Guardar en llamadas actuales
        this.currentCalls[ventanillaId] = this.queue[ticketIndex];

        // Agregar a últimos llamados
        this.lastCalledTickets.unshift({
            ...this.queue[ticketIndex],
            ventanilla: ventanillaId,
            calledAt: new Date().toLocaleTimeString()
        });

        // Mantener solo últimos 5
        this.lastCalledTickets = this.lastCalledTickets.slice(0, 5);

        // Llamar por voz
        this.speakTicketNumber(nextTicket.fullNumber, ventanilla.name);

        // Refrescar vista
        this.renderStaffView();
    } else {
        alert("No hay turnos disponibles para esta ventanilla.");
    }
}


    repeatCall(ventanillaId) {
        const currentTicket = this.currentCalls[ventanillaId];
        const ventanilla = this.ventanillas.find(v => v.id === ventanillaId);
        if (currentTicket && ventanilla) {
            this.speakTicketNumber(currentTicket.fullNumber, ventanilla.name);
        }
    }

    completeTicket(ventanillaId) {
        const currentTicket = this.currentCalls[ventanillaId];
        if (currentTicket) {
            // Update queue status
            const ticketIndex = this.queue.findIndex(item => item.id === currentTicket.id);
            this.queue[ticketIndex] = {
                ...currentTicket,
                status: 'completed'
            };

            // Clear current call
            this.currentCalls[ventanillaId] = null;

            // Re-render the staff view
            this.renderStaffView();
        }
    }

    speakTicketNumber(ticketNumber, ventanillaName) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(
                `Turno ${ticketNumber}, favor dirigirse a ${ventanillaName.replace('Ventanilla', 'ventanilla número')}`
            );
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    }

    renderQueueStatus() {
        const container = document.getElementById('queue-status');
        if (!container) return;

        container.innerHTML = '';

        this.services.forEach(service => {
            const waitingCount = this.getWaitingCount(service.id);
            const waitingTickets = this.queue.filter(item => 
                item.service === service.id && item.status === 'waiting'
            );
            
            const div = document.createElement('div');
            div.className = 'bg-white rounded-lg shadow p-6 stat-card';
            
            div.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold">${service.name}</h4>
                    <div class="w-3 h-3 rounded-full ${service.color}"></div>
                </div>
                
                <div class="text-center">
                    <div class="text-2xl font-bold text-gray-800 mb-2 stat-number">
                        ${waitingCount}
                    </div>
                    <div class="text-sm text-gray-600">en espera</div>
                </div>

                ${waitingTickets.length > 0 ? `
                    <div class="mt-4 border-t pt-3">
                        <div class="text-xs text-gray-500 mb-2">Próximos:</div>
                        ${waitingTickets.slice(0, 3).map(ticket => `
                            <div class="text-sm text-gray-600 mb-1">${ticket.fullNumber}</div>
                        `).join('')}
                    </div>
                ` : ''}
            `;
            
            container.appendChild(div);
        });
    }

    renderStatistics() {
        const container = document.getElementById('statistics');
        if (!container) return;

        const totalWaiting = this.queue.filter(t => t.status === 'waiting').length;
        const totalCompleted = this.queue.filter(t => t.status === 'completed').length;
        const currentlyServing = Object.values(this.currentCalls).filter(call => call !== null).length;

        container.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6 stat-card">
                <div class="flex items-center">
                    <div class="text-3xl text-blue-500 mr-4">👥</div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">Total en Cola</p>
                        <p class="text-2xl font-semibold text-gray-900 stat-number">${totalWaiting}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6 stat-card">
                <div class="flex items-center">
                    <div class="text-3xl text-green-500 mr-4">⏰</div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">Atendidos Hoy</p>
                        <p class="text-2xl font-semibold text-gray-900 stat-number">${totalCompleted}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6 stat-card">
                <div class="flex items-center">
                    <div class="text-3xl text-orange-500 mr-4">⚠️</div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">En Atención</p>
                        <p class="text-2xl font-semibold text-gray-900 stat-number">${currentlyServing}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.digiturnosApp = new DigiTurnosApp();
});