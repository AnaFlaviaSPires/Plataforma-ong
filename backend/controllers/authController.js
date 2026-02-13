const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Manter por enquanto se uuid falhar ou para outros usos
const { v4: uuidv4 } = require('uuid');
const { User, PasswordReset } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { logAction } = require('../middleware/auditMiddleware');
const { sendEmail, templates } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-ong-novo-amanha';

// Gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      cargo: user.cargo 
    },
    JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

// Login
const login = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, senha } = req.body;

    // Buscar usuário
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({
        error: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const senhaValida = await user.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Atualizar último login
    await user.update({ ultimo_login: new Date() });

    // Log de Auditoria
    req.user = user; // Popula contexto para o log
    await logAction(req, {
      acao: 'LOGIN',
      tabela: 'usuarios',
      registroId: user.id
    });

    // Gerar token
    const token = generateToken(user);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Registro de novo usuário
const register = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, email, senha, cargo, telefone, data_nascimento } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }

    // Verificar se é o primeiro usuário do sistema
    const userCount = await User.count();
    const isFirstUser = userCount === 0;

    // Criar usuário
    // Se for o primeiro, é admin e ativo. Se não, é secretaria e inativo (pendente de aprovação)
    const user = await User.create({
      nome,
      email: email.toLowerCase(),
      senha,
      cargo: isFirstUser ? 'admin' : 'secretaria',
      ativo: isFirstUser ? true : false,
      telefone,
      data_nascimento
    });

    // Gerar token apenas se estiver ativo (primeiro usuário)
    let token = null;
    if (user.ativo) {
      token = generateToken(user);
    }

    // Log de Auditoria
    req.user = user; // O próprio usuário (mesmo inativo)
    await logAction(req, {
      acao: 'CREATE',
      tabela: 'usuarios',
      registroId: user.id,
      novos: { nome, email, cargo: user.cargo, ativo: user.ativo }
    });

    res.status(201).json({
      message: user.ativo ? 'Usuário criado com sucesso' : 'Cadastro realizado! Aguarde aprovação do administrador.',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        avatar: user.avatar,
        ativo: user.ativo
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Esqueci a senha - gerar token de recuperação
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Log de tentativa com email inexistente (segurança)
      await logAction(req, {
        acao: 'PASSWORD_RESET_REQUEST', // Requisito pede esse nome de ação
        tabela: 'usuarios',
        registroId: 0, // 0 ou null para indicar não encontrado
        novos: { email, status: 'NOT_FOUND' }
      });

      // Retornar 200 para não vazar existência
      return res.json({
        message: 'Se o e-mail estiver cadastrado, enviaremos instruções para recuperação de senha.'
      });
    }

    // Gerar token UUID v4
    const token = uuidv4();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    // Criar registro na nova tabela
    await PasswordReset.create({
      usuario_id: user.id,
      token: token,
      expira_em: expires,
      usado: false
    });

    // Enviar e-mail
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    // Link deve apontar para página de reset com token na URL
    const resetLink = `${frontendUrl}/pages/nova-senha.html?token=${token}`;
    const emailData = templates.resetSenha(user.nome, resetLink);

    await sendEmail(user.email, emailData.subject, emailData.html);

    await logAction(req, {
      acao: 'PASSWORD_RESET_REQUEST',
      tabela: 'usuarios',
      registroId: user.id,
      novos: { email, status: 'SENT' }
    });

    console.log('Link de recuperação de senha (DEV):', resetLink);

    res.json({
      message: 'Se o e-mail estiver cadastrado, enviaremos instruções para recuperação de senha.',
      // resetLink apenas em dev
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    });

  } catch (error) {
    console.error('Erro no esqueci a senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Redefinir senha com token
const resetPassword = async (req, res) => {
  try {
    // Validar inputs (senha)
    // Token pode vir no body ou params, vamos normalizar
    const token = req.params.token || req.body.token;
    const { senha } = req.body;

    if (!token || !senha) {
        return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    // Buscar token válido na tabela PasswordReset
    const resetRegistro = await PasswordReset.findOne({
      where: {
        token: token,
        usado: false,
        expira_em: { [Op.gt]: new Date() } // Expira > Agora
      },
      include: [{ model: User, as: 'usuario' }]
    });

    if (!resetRegistro) {
      await logAction(req, {
        acao: 'PASSWORD_RESET_FAIL',
        tabela: 'password_resets',
        registroId: 0,
        novos: { token, motivo: 'Inválido ou Expirado' }
      });
      
      return res.status(400).json({
        error: 'Link de recuperação inválido ou expirado. Solicite uma nova redefinição.'
      });
    }

    const user = resetRegistro.usuario;
    if (!user) {
        return res.status(404).json({ error: 'Usuário associado não encontrado' });
    }

    // Atualizar senha
    user.senha = senha; // Hook do Sequelize fará o hash
    // Limpar campos legados se existirem, por precaução
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    // Marcar token como usado
    resetRegistro.usado = true;
    await resetRegistro.save();

    await logAction(req, {
      acao: 'PASSWORD_RESET_SUCCESS',
      tabela: 'usuarios',
      registroId: user.id
    });

    res.json({
      message: 'Senha redefinida com sucesso. Você já pode fazer login com a nova senha.'
    });

  } catch (error) {
    console.error('Erro na redefinição de senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    const user = req.user; // Vem do middleware de autenticação

    res.json({
      valid: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        avatar: user.avatar,
        telefone: user.telefone, // Adicionado
        ultimo_login: user.ultimo_login
      }
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Logout (invalidar token - implementação simples)
const logout = async (req, res) => {
  try {
    // Log de Logout
    if (req.user) {
        await logAction(req, {
            acao: 'LOGOUT',
            tabela: 'usuarios',
            registroId: req.user.id
        });
    }

    // Em uma implementação mais robusta, você manteria uma blacklist de tokens
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Aprovar usuário (Admin)
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { cargo } = req.body; // Opcional: definir cargo na aprovação

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const dadosAntigos = user.toJSON();

    user.ativo = true;
    if (cargo) {
      // Validar cargo se fornecido
      const cargosValidos = ['admin', 'professor', 'secretaria', 'assistente_social'];
      if (cargosValidos.includes(cargo)) {
        user.cargo = cargo;
      }
    }

    await user.save();

    // Enviar e-mail de notificação
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    const loginLink = `${frontendUrl}/pages/login.html`;
    const emailData = templates.aprovacaoConta(user.nome, loginLink);
    
    // Disparar envio (não bloqueia resposta crítica, mas idealmente aguardamos)
    await sendEmail(user.email, emailData.subject, emailData.html);

    await logAction(req, {
      acao: 'APPROVE',
      tabela: 'usuarios',
      registroId: user.id,
      antigos: dadosAntigos,
      novos: user
    });

    res.json({
      message: 'Usuário aprovado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        ativo: user.ativo
      }
    });

  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Listar usuários (Admin)
const getUsers = async (req, res) => {
  try {
    const { ativo } = req.query;
    const where = {};
    
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'nome', 'email', 'cargo', 'ativo', 'created_at'], // Exclui senha
      order: [['created_at', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// Lista simples para seleção (dropdowns)
const getUsersList = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { ativo: true },
      attributes: ['id', 'nome'],
      order: [['nome', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários simples:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// Atualizar perfil do usuário logado
const updateProfile = async (req, res) => {
  try {
    const user = req.user; // Do middleware auth
    const { nome, telefone, avatar } = req.body; 

    // Email e cargo não são alteráveis aqui por segurança
    if (nome) user.nome = nome;
    if (telefone) user.telefone = telefone;
    if (avatar) user.avatar = avatar;

    await user.save();

    await logAction(req, {
      acao: 'UPDATE_PROFILE',
      tabela: 'usuarios',
      registroId: user.id,
      novos: { nome, telefone }
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        telefone: user.telefone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// Alterar senha (logado)
const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (novaSenha.length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    // Verificar senha atual
    const senhaValida = await user.verificarSenha(senhaAtual);
    if (!senhaValida) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Atualizar
    user.senha = novaSenha; // Hook fará o hash
    await user.save();

    await logAction(req, {
      acao: 'CHANGE_PASSWORD',
      tabela: 'usuarios',
      registroId: user.id
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyToken,
  logout,
  approveUser,
  getUsers,
  getUsersList,
  updateProfile,
  changePassword
};
