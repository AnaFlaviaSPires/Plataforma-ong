
export class NotificationCenter {
    constructor() {
        this.initialize();
        this.setupEventListeners();
        this.setupFirestoreListener();
    }

    // Inicialização do centro de notificações
    initialize() {
        const notificationsHTML = `
            <div class="notifications-center" id="notificationsCenter">
                <div class="notifications-header">
                    <h5><i class="bi bi-bell"></i> Notificações</h5>
                    <button class="notifications-settings" id="notificationsSettings">
                        <i class="bi bi-gear"></i>
                    </button>
                </div>
                <div class="notifications-tabs">
                    <div class="notifications-tab active" data-tab="all">
                        Todas
                        <span class="notifications-badge" id="allCount">0</span>
                    </div>
                    <div class="notifications-tab" data-tab="alerts">
                        Alertas
                        <span class="notifications-badge" id="alertsCount">0</span>
                    </div>
                    <div class="notifications-tab" data-tab="logs">
                        Logs
                        <span class="notifications-badge" id="logsCount">0</span>
                    </div>
                </div>
                <div class="notifications-content" id="notificationsContent">
                    <!-- Notificações serão inseridas aqui -->
                </div>
                <div class="notifications-footer">
                    <button class="mark-all-read" id="markAllRead">
                        Marcar todas como lidas
                    </button>
                    <span class="text-muted" id="notificationCount">0 não lidas</span>
                </div>
            </div>
        `;

        // Adicionar botão de notificações na navbar
        const navbarNav = document.querySelector('.navbar-nav');
        if (navbarNav) {
            const notificationButton = document.createElement('li');
            notificationButton.className = 'nav-item';
            notificationButton.innerHTML = `
                <a class="nav-link" href="#" id="notificationsToggle">
                    <i class="bi bi-bell"></i>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="notificationsBadge">
                        0
                    </span>
                </a>
            `;
            navbarNav.insertBefore(notificationButton, navbarNav.firstChild);
        }

        // Adicionar centro de notificações ao body
        document.body.insertAdjacentHTML('beforeend', notificationsHTML);
    }

    // Configurar event listeners
    setupEventListeners() {
        const toggle = (document.getElementById('notificationsToggle');
        const center = (document.getElementById('notificationsCenter');
        const tabs = document.querySelectorAll('.notifications-tab');
        const markAllRead = (document.getElementById('markAllRead');
        const settings = (document.getElementById('notificationsSettings');

        toggle?.addEventListener('click', (e) => {
            e.preventDefault();
            center.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!center.contains(e.target) && !toggle.contains(e.target)) {
                center.classList.remove('active');
            }
        });

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterNotifications(tab.dataset.tab);
            });
        });

        markAllRead?.addEventListener('click', () => this.markAllAsRead());
        settings?.addEventListener('click', () => this.openSettings());
    }

    // Configurar listener do Firestore
    setupFirestoreListener() {
        const db = getFirestore();

            if (user) {
                // Query para notificações do usuário
                const notificationsRef = collection(db, 'notifications');
                const q = query(
                    notificationsRef,
                    where('userId', '==', user.uid),
                    orderBy('timestamp', 'desc')
                );

                // Listener em tempo real
                this.unsubscribe = onSnapshot(q, (snapshot) => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            this.addNotification(change.doc.data(), change.doc.id);
                        }
                        if (change.type === 'modified') {
                            this.updateNotification(change.doc.data(), change.doc.id);
                        }
                        if (change.type === 'removed') {
                            this.removeNotification(change.doc.id);
                        }
                    });
                    this.updateCounts();
                });
            } else if (this.unsubscribe) {
                this.unsubscribe();
            }
        });
    }

    // Adicionar nova notificação
    addNotification(data, id) {
        const content = (document.getElementById('notificationsContent');
        const notification = this.createNotificationElement(data, id);
        
        if (content.firstChild) {
            content.insertBefore(notification, content.firstChild);
        } else {
            content.appendChild(notification);
        }

        if (!data.read) {
            this.showNotificationPopup(data);
        }

        this.updateCounts();
    }

    // Criar elemento HTML da notificação
    createNotificationElement(data, id) {
        const div = document.createElement('div');
        div.className = `notification-item ${data.read ? '' : 'unread'}`;
        div.dataset.id = id;
        div.dataset.type = data.type;

        div.innerHTML = `
            <div class="notification-icon ${data.type}">
                <i class="bi ${this.getIconForType(data.type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${data.title}</div>
                <div class="notification-message">${data.message}</div>
                <div class="notification-time">${this.formatTimestamp(data.timestamp)}</div>
                ${this.getActionsHTML(data)}
            </div>
        `;

        // Event listeners para ações
        const actions = div.querySelector('.notification-actions');
        if (actions) {
            actions.addEventListener('click', (e) => {
                if (e.target.matches('button')) {
                    e.stopPropagation();
                    const action = e.target.dataset.action;
                    this.handleAction(action, id, data);
                }
            });
        }

        // Marcar como lida ao clicar
        div.addEventListener('click', () => this.markAsRead(id));

        return div;
    }

    // Obter HTML para ações da notificação
    getActionsHTML(data) {
        if (!data.actions || !data.actions.length) return '';

        return `
            <div class="notification-actions">
                ${data.actions.map(action => `
                    <button class="notification-button ${action.type}" data-action="${action.id}">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    // Obter ícone baseado no tipo
    getIconForType(type) {
        const icons = {
            alert: 'bi-exclamation-triangle',
            info: 'bi-info-circle',
            success: 'bi-check-circle',
            warning: 'bi-exclamation-circle',
            danger: 'bi-x-circle',
            log: 'bi-journal-text'
        };
        return icons[type] || 'bi-bell';
    }

    // Formatar timestamp
    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 60) {
            return `${minutes}m atrás`;
        } else if (hours < 24) {
            return `${hours}h atrás`;
        } else if (days < 7) {
            return `${days}d atrás`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Atualizar contadores
    updateCounts() {
        const content = (document.getElementById('notificationsContent');
        const items = content.getElementsByClassName('notification-item');
        
        let total = 0;
        let alerts = 0;
        let logs = 0;

        Array.from(items).forEach(item => {
            if (item.classList.contains('unread')) {
                total++;
                if (item.dataset.type === 'alert') alerts++;
                if (item.dataset.type === 'log') logs++;
            }
        });

        // Atualizar badges
        (document.getElementById('allCount').textContent = total;
        (document.getElementById('alertsCount').textContent = alerts;
        (document.getElementById('logsCount').textContent = logs;
        (document.getElementById('notificationsBadge').textContent = total;
        (document.getElementById('notificationCount').textContent = `${total} não lidas`;

        // Mostrar/esconder badges
        (document.getElementById('notificationsBadge').style.display = total > 0 ? 'block' : 'none';
    }

    // Filtrar notificações
    filterNotifications(type) {
        const items = document.getElementsByClassName('notification-item');
        Array.from(items).forEach(item => {
            if (type === 'all' || item.dataset.type === type) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Marcar notificação como lida
    async markAsRead(id) {
        const db = getFirestore();
        const notificationRef = doc(db, 'notifications', id);
        await updateDoc(notificationRef, { read: true });

        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.remove('unread');
            this.updateCounts();
        }
    }

    // Marcar todas como lidas
    async markAllAsRead() {
        const db = getFirestore();
        const unreadItems = document.getElementsByClassName('unread');
        
        Array.from(unreadItems).forEach(async (item) => {
            const id = item.dataset.id;
            const notificationRef = doc(db, 'notifications', id);
            await updateDoc(notificationRef, { read: true });
            item.classList.remove('unread');
        });

        this.updateCounts();
    }

    // Mostrar popup de notificação
    showNotificationPopup(data) {
        const popup = document.createElement('div');
        popup.className = 'notification-popup';
        popup.innerHTML = `
            <div class="notification-icon ${data.type}">
                <i class="bi ${this.getIconForType(data.type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${data.title}</div>
                <div class="notification-message">${data.message}</div>
            </div>
        `;

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 5000);
    }

    // Abrir configurações
    openSettings() {
        // Implementar modal de configurações
    }

    // Manipular ações de notificação
    handleAction(actionId, notificationId, data) {
        switch (actionId) {
            case 'view':
                window.location.href = data.link;
                break;
            case 'dismiss':
                this.markAsRead(notificationId);
                break;
            // Adicionar mais ações conforme necessário
        }
    }

    // Criar nova notificação
    static async create(data) {
        const db = getFirestore();
        

        const notification = {
            timestamp: Timestamp.now(),
            read: false,
            ...data
        };

        try {
            await addDoc(collection(db, 'notifications'), notification);
        } catch (error) {
            console.error('Erro ao criar notificação:', error);
        }
    }
}