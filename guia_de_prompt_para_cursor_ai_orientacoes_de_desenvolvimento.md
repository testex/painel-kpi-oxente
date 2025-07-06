# Guia de Prompt para Cursor AI - Orientações de Desenvolvimento

> **Use este documento como instrução-base em toda interação com o Cursor AI ao solicitar alterações, correções ou implementações neste projeto.**

---

## Instruções Gerais para Cursor AI

1. **Siga as melhores práticas de organização de código:**

   - Estruture o projeto em módulos ou features.
   - Nomeie arquivos, funções e componentes de forma clara e descritiva.
   - Separe funções grandes em funções menores e reutilizáveis.

2. **Identificação de elementos:**

   - Adicione sempre um atributo `data-testid` exclusivo e descritivo em todo elemento interativo (botão, campo, área clicável, etc).
     - Exemplo: `<button data-testid="btn-salvar-produto">Salvar</button>`

3. **Comentários e clareza no código:**

   - Comente o início de toda função handler ou de evento relevante.
   - Escreva comentários curtos explicando blocos de lógica importantes ou áreas confusas.

4. **Debug:**

   - Inclua logs temporários de debug no início de cada handler principal ou função de evento:
     - Exemplo: `console.log('[UserForm] handleSubmit', dados);`
   - Use logs para rastrear o fluxo de dados durante a execução.

5. **Limite de alterações:**

   - **Nunca altere arquivos ou funções que não foram explicitamente citados na tarefa ou no prompt.**
   - Caso identifique áreas de código duplicadas, ambíguas ou confusas, apenas aponte no retorno, não altere sem autorização.

6. **Padrão de workflow:**

   - Sempre trabalhe em cima da branch/commit mais recente, conforme indicado.
   - Antes de sugerir grandes mudanças, me pergunte sobre conflitos ou possíveis impactos.

7. **Checklist de entrega:**

   -

---

## Exemplo de Prompt para Solicitação de Alteração

```
Altere apenas o componente UserForm.jsx conforme as diretrizes do nosso guia:
- Adicione `data-testid` em todos os campos e botões.
- Adicione logs de debug em todos os handlers.
- Comente o início de cada função principal.
- Não altere outros arquivos.
- Se houver código confuso ou duplicado, apenas me informe.
```

---

## Requisitos de Ambiente e Versionamento

- Considere que o projeto segue este setup:
  - Node.js (LTS)
  - Uso de Docker para ambiente isolado (`docker compose up`)
  - Versionamento via Git/GitHub
- Antes de grandes alterações, sempre oriente a realizar um commit ou criar uma branch.

---

## Debug e Teste

- Certifique-se que logs e `data-testid` permitam rastreabilidade dos fluxos ao usar DevTools ou React DevTools.
- Oriente sempre a remoção dos logs temporários antes da entrega final em produção.

---

## Referências

- [Documentação oficial do Cursor AI](https://docs.cursor.so/)
- [Guia do React DevTools](https://react.dev/learn/react-developer-tools)
- [Guia básico de Git e GitHub](https://guides.github.com/introduction/git-handbook/)

---

**IMPORTANTE:** Sempre siga as diretrizes acima antes de propor ou executar qualquer alteração. Em caso de dúvida sobre contexto, arquitetura ou sobre onde aplicar determinada funcionalidade, questione antes de executar mudanças amplas.

