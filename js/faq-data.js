
// Dados iniciais do FAQ
const faqData = [
    {
        pergunta: "Como fazer chamada?",
        resposta: "Para fazer chamada: 1) Acesse o menu Registro de Chamada, 2) Selecione a turma, 3) Marque as presenças, 4) Clique em Salvar.",
        categoria: "chamada"
    },
    {
        pergunta: "Como cadastrar um novo aluno?",
        resposta: "Para cadastrar aluno: 1) Acesse Cadastro de Aluno, 2) Clique em Novo Aluno, 3) Preencha os dados, 4) Clique em Salvar.",
        categoria: "alunos"
    },
    {
        pergunta: "Como ver relatórios de presença?",
        resposta: "Os relatórios estão no Dashboard. Você pode filtrar por turma, período e ver gráficos detalhados de presença.",
        categoria: "relatorios"
    },
    {
        pergunta: "Como registrar uma doação?",
        resposta: "Para registrar doação: 1) Acesse Controle de Doações, 2) Clique em Nova Doação, 3) Preencha os dados do doador e da doação.",
        categoria: "doacoes"
    },
    {
        pergunta: "Como alterar minha senha?",
        resposta: "Para alterar senha: 1) Clique no seu perfil, 2) Vá em Configurações, 3) Selecione Segurança, 4) Clique em Alterar Senha.",
        categoria: "conta"
    },
    {
        pergunta: "Como adicionar fotos na galeria?",
        resposta: "Para adicionar fotos: 1) Acesse Galeria de Fotos, 2) Clique em Upload, 3) Selecione as fotos, 4) Adicione descrição se desejar.",
        categoria: "galeria"
    }
];

// Função para popular o FAQ no Firestore
export async function popularFAQ() {
    const db = getFirestore();
    const faqRef = collection(db, 'faq');

    try {
        for (const item of faqData) {
            await addDoc(faqRef, item);
        }
    } catch (error) {
        console.error('Erro ao popular FAQ:', error);
    }
}