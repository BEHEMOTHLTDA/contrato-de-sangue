# Contrato de Sangue - Sistema para Foundry VTT

![Contrato de Sangue](https://img.shields.io/badge/Foundry%20VTT-v11%2B-green) ![Sistema](https://img.shields.io/badge/Tipo-Sistema-blue) ![Versão](https://img.shields.io/badge/Versão-1.0.0-red)

Um sistema completo e automatizado para o RPG **Contrato de Sangue** no Foundry Virtual Tabletop. Este módulo implementa todas as regras, mecânicas e automações necessárias para uma experiência de jogo imersiva e fluida.

## 🩸 Características Principais

### ⚡ Automações Completas
- **Balança Eterna**: Humanidade + Bestialidade = 12 (automático)
- **Reserva de Dados**: Calculada automaticamente (Bestialidade + 1)
- **Dados Sagrados**: 1d6 ÷ 2 (sem consequências)
- **Dados Umbrais**: 1d6 completo (+1 Bestialidade, -1 Humanidade)
- **Penalidades de Mortalidade**: Aplicadas automaticamente nas rolagens
- **Sistema de Ferimentos**: Condições aplicadas automaticamente baseadas na vida

### 🎲 Sistema de Rolagens
- **Rolagens de Perícia**: 1d12 + Perícia + Modificadores
- **Interpretação Automática**: Sucesso Crítico (12), Sucesso, Falha Parcial, Falha Crítica (1)
- **Modificadores Automáticos**: Mortalidade, ferimentos, vantagens
- **Integração com Combat Tracker**: Iniciativa automática (1d12 + Defesa)

### 🔍 Sistema de Investigação
- **Pontos de Entendimento**: Ganhos automáticos em rolagens bem-sucedidas
- **Comandos de Chat**: `/investigar`, `/pista`, `/conexao`, `/entendimento`
- **Revelações Progressivas**: Sistema de desbloqueio baseado em pontos
- **Automação de Descobertas**: Conexões e pistas geram pontos automaticamente

### ⚔️ Combate Automatizado
- **Aplicação de Dano**: Sistema automático com absorção de armaduras
- **Condições de Ferimento**: Atualizadas automaticamente
- **Efeitos de Linhagem**: Fúria bestial (Wilkołaki) e sede de sangue (Upiór)
- **Regeneração**: Aplicada automaticamente baseada em vantagens

### 🧛 Linhagens Implementadas
- **Upiór**: Poderes vampíricos, sede de sangue, regeneração lenta
- **Wilkołaki**: Poderes lupinos, fúria bestial, regeneração acelerada
- **Poderes Únicos**: Cada linhagem com suas habilidades especiais

### 🎨 Interface Avançada
- **Design Gótico-Punk**: Inspirado na arte pixelada fornecida
- **Elementos Interativos**: Drag & drop, tooltips, animações
- **Feedback Visual**: Barras de progresso, indicadores de status
- **Responsiva**: Funciona em desktop e dispositivos móveis

## 📦 Instalação

### Método 1: Instalação Manual
1. Baixe o arquivo `.zip` do módulo
2. Extraia na pasta `Data/systems/` do seu Foundry VTT
3. Reinicie o Foundry VTT
4. Crie um novo mundo selecionando "Contrato de Sangue" como sistema

### Método 2: Via Manifest URL
1. No Foundry VTT, vá em "Install System"
2. Cole a URL do manifest: `[URL_DO_MANIFEST]`
3. Clique em "Install"

## 🚀 Primeiros Passos

### 1. Criando um Personagem
1. Crie um novo Ator do tipo "Personagem"
2. Preencha as informações básicas (nome, conceito, linhagem)
3. Distribua os pontos de perícia
4. Configure Humanidade e Bestialidade (total = 12)

### 2. Usando a Ficha
- **Abas**: Navegue entre Info, Vantagens, Biografia e Equipamento
- **Rolagens**: Clique no nome das perícias para rolar
- **Dados da Reserva**: Clique nos dados para usar como Sagrado ou Umbral
- **Drag & Drop**: Arraste itens para equipar ou organizar

### 3. Combate
- **Iniciativa**: Rolada automaticamente ao entrar em combate
- **Ataques**: Use as armas da ficha ou role perícias de combate
- **Dano**: Aplicado automaticamente com absorção de armaduras
- **Condições**: Atualizadas conforme a vida diminui

### 4. Investigação
- **Rolagens**: Perícias de investigação geram Pontos de Entendimento
- **Comandos**: Use `/investigar`, `/pista`, `/conexao` no chat
- **Revelações**: Desbloqueadas automaticamente com pontos suficientes

## 🎮 Comandos de Chat

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/investigar [local]` | Inicia uma investigação | `/investigar biblioteca antiga` |
| `/pista [texto]` | Cria uma pista (apenas GM) | `/pista Pegadas de sangue no chão` |
| `/conexao [texto]` | Registra uma conexão descoberta | `/conexao O assassino conhecia a vítima` |
| `/entendimento add [qtd]` | Adiciona pontos de entendimento | `/entendimento add 2` |
| `/entendimento gastar [qtd]` | Gasta pontos de entendimento | `/entendimento gastar 3` |
| `/cds-create-macros` | Recria as macros do sistema (GM) | `/cds-create-macros` |

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + R` | Rolagem rápida de perícia |
| `Ctrl + S` | Usar Dado Sagrado |
| `Ctrl + U` | Usar Dado Umbral |
| `Ctrl + I` | Rolar iniciativa |
| `Ctrl + H` | Mostrar ajuda |

## 🔧 Macros Incluídas

O sistema inclui macros úteis automaticamente criadas:
- **CDS - Rolagem Rápida**: Diálogo para rolagens de perícia
- **CDS - Dado Sagrado**: Usa um dado sagrado
- **CDS - Dado Umbral**: Usa um dado umbral (com confirmação)
- **CDS - Aplicar Dano**: Aplica dano aos tokens selecionados
- **CDS - Realizar Caça**: Reduz mortalidade através de caça
- **CDS - Status do Personagem**: Mostra status completo
- **CDS - Investigação Rápida**: Diálogo para investigações

## 📊 Mecânicas Implementadas

### Balança Eterna
- Humanidade + Bestialidade sempre = 12
- Atualização automática quando um valor muda
- Indicador visual na ficha

### Sistema de Mortalidade
- **0-3**: Sem penalidades
- **4-6**: -1 em todas as rolagens, caça 1x/semana
- **7-9**: -2 em todas as rolagens, caça 2x/semana  
- **10-12**: -3 em todas as rolagens, caça diária
- **13+**: Controle perdido, besta assume

### Reserva de Dados
- Calculada como Bestialidade + 1
- Dados Sagrados: 1d6 ÷ 2 (arredondado para baixo)
- Dados Umbrais: 1d6 completo, +1 Bestialidade, -1 Humanidade
- Recuperação através de descanso ou alimentação

### Condições de Ferimento
- **Escoriado** (90% vida): -1 em rolagens
- **Machucado** (75% vida): -2 em rolagens
- **Ferido** (50% vida): -3 em rolagens
- **Ferido Gravemente** (25% vida): -4 em rolagens
- **Aleijado** (10% vida): -5 em rolagens
- **Incapacitado** (0% vida): -10 em rolagens

## 🛠️ Configurações do Sistema

O sistema inclui várias configurações personalizáveis:
- **Aplicação Automática de Ferimentos**: Liga/desliga atualização automática de condições
- **Notificações Customizadas**: Controla o tipo de notificações mostradas
- **Efeitos Visuais**: Liga/desliga animações e efeitos especiais
- **Automação de Combate**: Controla o nível de automação em combate

## 🎨 Personalização

### CSS Customizado
O sistema permite personalização visual através de CSS customizado. Adicione suas regras em:
```css
/* Exemplo de personalização */
.contrato-de-sangue .sheet {
    --primary-color: #8B0000;
    --secondary-color: #FFD700;
    --background-color: #1a1a1a;
}
```

### Hooks Disponíveis
O sistema fornece hooks para desenvolvedores:
```javascript
// Exemplo de uso de hooks
Hooks.on('cds.rollSkill', (actor, skill, result) => {
    console.log(`${actor.name} rolou ${skill}: ${result}`);
});

Hooks.on('cds.useDie', (actor, dieType, result) => {
    console.log(`${actor.name} usou dado ${dieType}: ${result}`);
});
```

## 🐛 Solução de Problemas

### Problemas Comuns

**Ficha não carrega corretamente**
- Verifique se o sistema está ativado no mundo
- Limpe o cache do navegador (Ctrl+F5)
- Verifique o console do navegador para erros

**Rolagens não funcionam**
- Verifique se as perícias têm valores válidos
- Confirme que o ator tem dados na reserva se necessário
- Verifique se não há módulos conflitantes

**Automações não funcionam**
- Verifique as configurações do sistema
- Confirme que os hooks estão carregados
- Desative outros módulos para testar conflitos

### Logs e Debug
Para ativar logs detalhados, execute no console:
```javascript
CONFIG.debug.hooks = true;
game.settings.set("contrato-de-sangue", "debugMode", true);
```

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

### Estrutura do Projeto
```
contrato-de-sangue/
├── module.json              # Manifesto do módulo
├── template.json            # Template de dados
├── scripts/                 # Scripts JavaScript
│   ├── system.js           # Sistema principal
│   ├── actor/              # Classes de ator
│   ├── item/               # Classes de item
│   ├── combat-automation.js # Automação de combate
│   ├── investigation-system.js # Sistema de investigação
│   ├── ui-enhancements.js  # Melhorias de UI
│   └── macros.js           # Macros do sistema
├── templates/              # Templates HTML
│   ├── actor/              # Templates de ator
│   └── item/               # Templates de item
├── styles/                 # Arquivos CSS
│   ├── system.css          # Estilos principais
│   └── interface.css       # Estilos de interface
└── lang/                   # Arquivos de tradução
    ├── en.json             # Inglês
    └── pt-BR.json          # Português brasileiro
```

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🙏 Créditos

- **Sistema de RPG**: Contrato de Sangue
- **Arte de Referência**: Kadabura (@KadaburaDraws)
- **Plataforma**: Foundry Virtual Tabletop
- **Desenvolvimento**: Sistema automatizado completo

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no repositório
- Entre em contato através do Discord da comunidade Foundry VTT
- Consulte a documentação oficial do Foundry VTT

---

**Que o sangue guie seus passos na escuridão... 🩸**

