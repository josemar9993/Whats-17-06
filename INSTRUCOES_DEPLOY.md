# Como Corrigir o Erro de Deploy "Branch Not Found"

Este erro acontece porque a sua plataforma de deploy (Coolify) está tentando baixar uma branch que não existe. Siga os passos abaixo para corrigir.

**Nenhuma alteração de código é necessária.** O problema é apenas na configuração do seu serviço na Coolify.

## Passo a Passo

1.  **Acesse o Painel da Coolify:**
    *   Faça login na sua conta da Coolify.

2.  **Vá para o seu Projeto:**
    *   Encontre e clique no seu projeto (provavelmente chamado `Whats-17-06`).

3.  **Acesse as Configurações da Aplicação:**
    *   Dentro do projeto, vá para a sua aplicação.
    *   Procure por uma aba ou seção chamada **"Configuration" (Configuração)** ou **"General" (Geral)**.

4.  **Localize e Corrija o Nome da Branch:**
    *   Dentro das configurações, procure por um campo de texto chamado **"Branch"**.
    *   O valor neste campo estará incorreto, provavelmente `Whats-17-06`.
    *   Apague `Whats-17-06` e digite `main` no lugar.

5.  **Salve e Faça o Deploy Novamente:**
    *   Clique no botão **"Save" (Salvar)** para aplicar a nova configuração.
    *   Depois de salvar, procure por um botão como **"Deploy"**, **"Redeploy"** ou **"Force Redeploy"** e clique nele para iniciar o processo de implantação novamente.

Após seguir estes passos, a Coolify irá baixar a branch `main` correta, e sua aplicação será implantada com sucesso.
