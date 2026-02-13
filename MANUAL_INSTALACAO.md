# 📘 Manual de Instalação - Plataforma ONG Novo Amanhã

## 📋 Visão Geral

Este manual explica como instalar e configurar a Plataforma ONG em um computador servidor que será acessado pelos outros computadores da rede local.

### Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                   REDE LOCAL DA ONG                     │
│                                                         │
│   ┌──────────┐    ┌──────────┐    ┌──────────────────┐ │
│   │Notebook 1│    │Notebook 2│    │ Notebook SERVIDOR│ │
│   │ (usuário)│    │ (usuário)│    │  (roda o sistema)│ │
│   └────┬─────┘    └────┬─────┘    └────────┬─────────┘ │
│        │               │                    │           │
│        └───────────────┴────────────────────┘           │
│                        │                                │
│                   ┌────▼────┐                           │
│                   │ Roteador │                          │
│                   │  Wi-Fi   │                          │
│                   └──────────┘                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Pré-requisitos (Instalar no Notebook SERVIDOR)

### 1. Node.js (versão 18 ou superior)
- Baixe em: https://nodejs.org
- Escolha a versão **LTS** (recomendada)
- Durante a instalação, marque a opção de adicionar ao PATH

### 2. MySQL (versão 8 ou superior)
- Baixe em: https://dev.mysql.com/downloads/installer/
- Escolha **MySQL Installer for Windows**
- Durante a instalação:
  - Selecione "Developer Default" ou "Server Only"
  - Defina uma senha para o usuário **root** (anote essa senha!)
  - Marque a opção de iniciar MySQL como serviço do Windows

### 3. Python (versão 3 ou superior)
- Baixe em: https://python.org
- Durante a instalação, **MARQUE** a opção "Add Python to PATH"

---

## 📥 Instalação

### Passo 1: Copiar os arquivos
Copie toda a pasta `Plataforma ONG` para o notebook servidor (ex: `C:\Plataforma ONG`)

### Passo 2: Executar instalação
1. Abra a pasta `Plataforma ONG`
2. Clique duas vezes em **`INSTALAR_SERVIDOR.bat`**
3. Siga as instruções na tela
4. Quando solicitado, digite a senha do usuário **root** do MySQL

### Passo 3: Verificar instalação
Se tudo correu bem, você verá a mensagem "INSTALAÇÃO CONCLUÍDA COM SUCESSO!"

---

## 🚀 Iniciando o Sistema

### No Notebook Servidor:
1. Abra a pasta `Plataforma ONG`
2. Clique duas vezes em **`INICIAR_SERVIDOR.bat`**
3. Mantenha a janela aberta enquanto usar o sistema
4. Anote o endereço IP mostrado na tela (ex: `192.168.1.100`)

### Nos Outros Notebooks:
1. Abra o navegador (Chrome, Firefox, Edge)
2. Digite o endereço: `http://IP_DO_SERVIDOR:8080`
   - Exemplo: `http://192.168.1.100:8080`
3. Faça login com as credenciais

---

## 🔐 Credenciais de Acesso

### Administrador (primeiro acesso):
- **Email:** admin@ongnovoamanha.org
- **Senha:** admin123

> ⚠️ **IMPORTANTE:** Altere a senha do administrador após o primeiro acesso!

---

## ❓ Solução de Problemas

### "MySQL não está configurado corretamente"
- Verifique se o MySQL está rodando (procure por "MySQL" nos Serviços do Windows)
- Verifique se a senha do usuário root está correta
- Execute o `INSTALAR_SERVIDOR.bat` novamente

### "Não consigo acessar de outro computador"
- Verifique se ambos os computadores estão na mesma rede Wi-Fi
- Verifique se o Firewall do Windows não está bloqueando
  - Abra o Firewall do Windows
  - Permita o Node.js e Python através do firewall
- Verifique se o IP está correto (pode mudar se reiniciar o roteador)

### "A página não carrega"
- Verifique se a janela do servidor ainda está aberta
- Verifique se não há erros na janela do servidor
- Tente acessar `http://localhost:8080` no próprio servidor

### "Erro de conexão com o banco de dados"
- Verifique se o MySQL está rodando
- Reinicie o servidor (feche e abra `INICIAR_SERVIDOR.bat`)

---

## 🔄 Uso Diário

### Para iniciar o sistema:
1. Ligue o notebook servidor
2. Execute `INICIAR_SERVIDOR.bat`
3. Aguarde a mensagem de "SERVIDOR INICIADO!"
4. Os outros notebooks já podem acessar

### Para parar o sistema:
1. Na janela do servidor, pressione qualquer tecla
2. Aguarde a mensagem "Servidor parado"
3. Pode desligar o notebook

---

## 📞 Suporte

Em caso de problemas, entre em contato com o suporte técnico.

---

*Versão 1.0 - Plataforma ONG Novo Amanhã*
