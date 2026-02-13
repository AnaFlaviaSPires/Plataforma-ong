const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuração do transporter
const createTransporter = () => {
  // Se não houver configuração SMTP, retorna null
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('⚠️ Configuração SMTP ausente. E-mails serão apenas logados no console.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

/**
 * Envia e-mail de notificação
 * @param {string} to - E-mail do destinatário
 * @param {string} subject - Assunto
 * @param {string} html - Corpo do e-mail em HTML
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!transporter) {
      console.log(`📧 [SIMULAÇÃO DE ENVIO] Para: ${to} | Assunto: ${subject}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Plataforma ONG" <no-reply@ong.com>',
      to,
      subject,
      html,
    });

    console.log('📧 E-mail enviado: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    // Não lança erro para não quebrar o fluxo principal da aplicação
    return false;
  }
};

// Templates de e-mail
const templates = {
  aprovacaoConta: (nome, linkLogin) => ({
    subject: 'Sua conta foi aprovada! - Plataforma ONG',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Olá, ${nome}!</h2>
        <p>Temos o prazer de informar que seu cadastro na <strong>Plataforma ONG</strong> foi aprovado.</p>
        <p>Seu perfil de acesso foi configurado e você já pode acessar o sistema.</p>
        <br>
        <a href="${linkLogin}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Plataforma</a>
        <br><br>
        <p>Se você não solicitou este acesso, por favor ignore este e-mail.</p>
        <hr>
        <small>Plataforma ONG - Gestão Social</small>
      </div>
    `
  }),
  resetSenha: (nome, linkReset) => ({
    subject: 'Redefinição de Senha - Plataforma ONG',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Olá, ${nome}!</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <br>
        <a href="${linkReset}" style="background-color: #FF5722; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Minha Senha</a>
        <br><br>
        <p>Este link expira em 30 minutos.</p>
        <p>Se você não solicitou isso, por favor ignore este e-mail e sua senha permanecerá a mesma.</p>
        <hr>
        <small>Plataforma ONG - Segurança</small>
      </div>
    `
  })
};

module.exports = { sendEmail, templates };
