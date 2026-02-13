const { ActionLog } = require('../models');

/**
 * Registra uma ação no log de auditoria
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} details - Detalhes da ação
 * @param {string} details.acao - Tipo da ação (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {string} details.tabela - Tabela afetada (ex: 'alunos')
 * @param {number} details.registroId - ID do registro afetado
 * @param {Object} [details.antigos] - Dados antes da alteração (snapshot)
 * @param {Object} [details.novos] - Dados depois da alteração (snapshot)
 */
const logAction = async (req, details) => {
    try {
        const usuarioId = req.user ? req.user.id : null;
        const usuarioNome = req.user ? req.user.nome : 'Sistema/Visitante';
        
        // Captura IP com fallback seguro
        const ip = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress || 
                   req.connection.socket.remoteAddress;
        
        await ActionLog.create({
            usuario_id: usuarioId,
            usuario_nome: usuarioNome,
            acao: details.acao,
            tabela_afetada: details.tabela,
            registro_id: details.registroId,
            dados_antigos: details.antigos || null,
            dados_novos: details.novos || null,
            ip: typeof ip === 'string' ? ip.split(',')[0].trim() : ip,
            url_origem: req.originalUrl,
            user_agent: req.headers['user-agent']
        });
    } catch (error) {
        // Falha no log não deve parar o sistema, mas deve ser registrada no console
        console.error('FALHA CRÍTICA AUDITORIA:', error);
    }
};

module.exports = { logAction };
