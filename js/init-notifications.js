import { NotificationCenter } from './notifications.js';

// Inicializar centro de notificações quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar CSS das notificações
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../css/notifications.css';
    document.head.appendChild(link);

    // Criar instância do centro de notificações
    const notifications = new NotificationCenter();

    // Expor globalmente para uso em outros scripts
    window.notifications = notifications;
});