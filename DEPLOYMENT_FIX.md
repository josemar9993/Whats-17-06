# Como Corrigir o Erro de Deploy "Branch Not Found"

Este erro acontece porque a sua plataforma de deploy (Coolify, Heroku, etc.) está tentando baixar uma branch que não existe. Siga os passos abaixo para corrigir.

## Passo a Passo

1.  **Acesse sua Plataforma de Deploy:**
    *   Faça login no painel de controle da sua plataforma (ex: Coolify).

2.  **Encontre as Configurações do Projeto:**
    *   Navegue até o seu projeto ou aplicação ("meu-bot-whatsapp" ou "Whats-17-06").
    *   Procure por uma aba ou seção chamada **"Configuration" (Configuração)**, **"Settings" (Ajustes)** ou **"Source" (Fonte)**.

3.  **Localize a Configuração da Branch:**
    *   Dentro das configurações, procure por um campo chamado **"Branch"** ou **"Branch Name"**.
    *   O valor neste campo estará incorreto, provavelmente `Whats-17-06`.

4.  **Corrija o Nome da Branch:**
    *   Apague o valor `Whats-17-06`.
    *   Digite `main` no lugar.

5.  **Salve e Faça o Deploy Novamente:**
    *   Salve as alterações na configuração.
    *   Procure por um botão de **"Deploy"**, **"Redeploy"** ou **"Deploy Now"** e clique nele para iniciar o processo de implantação novamente.

Após seguir estes passos, o servidor irá baixar a branch `main` correta, e sua aplicação deve ser implantada com sucesso.
