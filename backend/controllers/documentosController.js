const { Documento, User } = require('../models');
const { logAction } = require('../middleware/auditMiddleware');
const { Op } = require('sequelize');

// Listar documentos
const getDocumentos = async (req, res) => {
  try {
    const { categoria, busca, limit = 50, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    
    if (categoria) {
      where.categoria = categoria;
    }
    
    if (busca) {
      where.titulo = { [Op.like]: `%${busca}%` };
    }

    const { count, rows } = await Documento.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'criador',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      documentos: rows
    });

  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar documento
const createDocumento = async (req, res) => {
  try {
    const { titulo, descricao, categoria, url_arquivo, data_referencia } = req.body;
    const userId = req.user.id;

    if (!titulo || !url_arquivo) {
      return res.status(400).json({ error: 'Título e Link do Arquivo são obrigatórios' });
    }

    const novoDoc = await Documento.create({
      titulo,
      descricao,
      categoria: categoria || 'outros',
      url_arquivo,
      data_referencia: data_referencia || new Date(),
      criado_por: userId
    });

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'documentos',
      registroId: novoDoc.id,
      novos: novoDoc
    });

    res.status(201).json(novoDoc);

  } catch (error) {
    console.error('Erro ao criar documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Excluir documento
const deleteDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.cargo;

    const doc = await Documento.findByPk(id);

    if (!doc) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Permissão: Apenas Admin ou o criador (se for secretaria/professor)
    // Mas admin pode tudo.
    if (userRole !== 'admin' && doc.criado_por !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este documento' });
    }

    const dadosAntigos = doc.toJSON();
    await doc.destroy();

    await logAction(req, {
      acao: 'DELETE',
      tabela: 'documentos',
      registroId: id,
      antigos: dadosAntigos
    });

    res.json({ message: 'Documento excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getDocumentos,
  createDocumento,
  deleteDocumento
};
