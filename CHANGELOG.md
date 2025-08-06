# Changelog - Contrato de Sangue

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0] - 2025-01-08

### 🎉 Lançamento Inicial

#### ✨ Adicionado
- **Sistema Completo**: Implementação completa do RPG Contrato de Sangue para Foundry VTT
- **Ficha de Personagem**: Interface completa com design gótico-punk pixelado
- **Balança Eterna**: Sistema automático Humanidade + Bestialidade = 12
- **Reserva de Dados**: Cálculo automático (Bestialidade + 1) com dados Sagrados e Umbrais
- **Sistema de Rolagens**: 1d12 + Perícia + Modificadores com interpretação automática
- **Linhagens**: Upiór e Wilkołaki com poderes únicos e automações específicas
- **Sistema de Mortalidade**: Penalidades automáticas baseadas no nível de mortalidade
- **Condições de Ferimento**: Aplicação automática baseada na vida atual
- **Sistema de Investigação**: Pontos de Entendimento com ganho e gasto automáticos
- **Automação de Combate**: Integração completa com Combat Tracker do Foundry
- **Aplicação de Dano**: Sistema automático com absorção de armaduras
- **Regeneração**: Automática para linhagens com essa habilidade
- **Comandos de Chat**: `/investigar`, `/pista`, `/conexao`, `/entendimento`
- **Macros Úteis**: 7 macros pré-configuradas para facilitar o jogo
- **Atalhos de Teclado**: Ctrl+R, Ctrl+S, Ctrl+U, Ctrl+I, Ctrl+H
- **Interface Avançada**: Drag & drop, tooltips, animações, feedback visual
- **Sistema de Notificações**: Notificações customizadas para eventos do jogo
- **Efeitos Especiais**: Animações para críticos, falhas, fúria bestial, sede de sangue
- **Revelações Progressivas**: Sistema de desbloqueio baseado em Pontos de Entendimento
- **Templates de Item**: Vantagens, armas, armaduras, equipamentos, poderes
- **Multilíngue**: Suporte para português brasileiro e inglês
- **Responsivo**: Interface adaptável para desktop e mobile

#### 🎲 Mecânicas Implementadas
- **Perícias**: 18 perícias organizadas por categoria (Físicas, Mentais, Sociais, Combate)
- **Atributos**: Humanidade, Bestialidade, Mortalidade, Vida, Reserva de Dados, Pontos de Entendimento
- **Combate**: Iniciativa automática, ataques, defesa, aplicação de dano
- **Investigação**: Ganho automático de pontos, comandos especializados, revelações
- **Caça**: Sistema para reduzir mortalidade através de alimentação
- **Vantagens**: Sistema flexível para habilidades especiais
- **Poderes de Linhagem**: Habilidades únicas para Upiór e Wilkołaki
- **Equipamentos**: Armas, armaduras e itens gerais com efeitos automáticos

#### 🎨 Interface e UX
- **Design Gótico-Punk**: Inspirado na arte pixelada fornecida
- **Cores Temáticas**: Vermelho sangue, dourado, preto com acentos
- **Elementos Interativos**: Hover effects, transições suaves, micro-interações
- **Feedback Visual**: Barras de progresso animadas, indicadores de status
- **Tooltips Informativos**: Explicações detalhadas para todos os elementos
- **Animações**: Efeitos de entrada, pulso, brilho, glitch para momentos especiais
- **Responsividade**: Layout adaptável para diferentes tamanhos de tela

#### ⚡ Automações
- **Balança Eterna**: Ajuste automático quando Humanidade ou Bestialidade mudam
- **Penalidades**: Aplicação automática de modificadores por mortalidade e ferimentos
- **Condições**: Atualização automática de estados baseados na vida
- **Regeneração**: Cura automática para personagens com essa habilidade
- **Fúria/Sede**: Ativação automática quando mortalidade atinge níveis críticos
- **Iniciativa**: Cálculo automático (1d12 + Defesa + Modificadores)
- **Absorção**: Cálculo automático de absorção de armaduras no dano
- **Pontos de Entendimento**: Ganho automático em rolagens de investigação bem-sucedidas

#### 🔧 Funcionalidades Técnicas
- **Hooks Customizados**: Sistema extensível para desenvolvedores
- **Configurações**: Opções para personalizar automações e comportamentos
- **Logs Detalhados**: Sistema de debug para solução de problemas
- **Compatibilidade**: Foundry VTT v11+ com suporte para v12
- **Performance**: Código otimizado para execução eficiente
- **Modularidade**: Arquitetura organizada em módulos especializados

#### 📚 Documentação
- **README Completo**: Guia detalhado de instalação e uso
- **Comandos de Chat**: Lista completa com exemplos
- **Atalhos de Teclado**: Referência rápida para produtividade
- **Solução de Problemas**: Guia para problemas comuns
- **API para Desenvolvedores**: Hooks e métodos disponíveis

#### 🌐 Internacionalização
- **Português Brasileiro**: Tradução completa e nativa
- **Inglês**: Tradução completa para audiência internacional
- **Sistema Extensível**: Preparado para adicionar mais idiomas

### 🔄 Compatibilidade
- **Foundry VTT**: v11.315+ (testado até v12)
- **Navegadores**: Chrome, Firefox, Safari, Edge (versões recentes)
- **Sistemas Operacionais**: Windows, macOS, Linux
- **Dispositivos**: Desktop, tablet, mobile (responsivo)

### 📦 Estrutura do Projeto
```
contrato-de-sangue/
├── module.json                    # Manifesto do módulo
├── template.json                  # Template de dados dos atores e itens
├── README.md                      # Documentação principal
├── CHANGELOG.md                   # Este arquivo
├── scripts/                       # Scripts JavaScript
│   ├── system.js                 # Sistema principal e configuração
│   ├── actor/                    # Classes e lógica de atores
│   │   ├── actor.js             # Classe base do ator
│   │   └── actor-sheet.js       # Classe da ficha de personagem
│   ├── item/                     # Classes e lógica de itens
│   │   ├── item.js              # Classe base do item
│   │   └── item-sheet.js        # Classe da ficha de item
│   ├── combat-automation.js      # Automações de combate
│   ├── investigation-system.js   # Sistema de investigação
│   ├── ui-enhancements.js       # Melhorias de interface
│   ├── macros.js                # Macros do sistema
│   └── create-compendiums.js    # Criação de compêndios
├── templates/                     # Templates HTML
│   ├── actor/                    # Templates de ator
│   │   ├── actor-sheet.html     # Ficha original
│   │   └── actor-sheet-improved.html # Ficha melhorada
│   └── item/                     # Templates de item
│       ├── item-vantagem-sheet.html
│       ├── item-arma-sheet.html
│       ├── item-armadura-sheet.html
│       ├── item-equipamento-sheet.html
│       └── item-poder-sheet.html
├── styles/                        # Arquivos CSS
│   ├── system.css               # Estilos principais
│   └── interface.css            # Estilos de interface avançada
└── lang/                          # Arquivos de tradução
    ├── en.json                  # Inglês
    └── pt-BR.json               # Português brasileiro
```

### 🎯 Próximas Versões (Roadmap)

#### [1.1.0] - Planejado
- **Compêndios Pré-populados**: Vantagens, poderes e equipamentos prontos
- **Editor de Poderes**: Interface para criar poderes customizados
- **Sistema de Clãs**: Expansão das linhagens com sub-grupos
- **Automação de XP**: Cálculo automático de custos de evolução
- **Fichas de NPC**: Templates especializados para NPCs
- **Gerador de Nomes**: Nomes temáticos para personagens
- **Música Ambiente**: Integração com playlists temáticas

#### [1.2.0] - Planejado
- **Modo Cooperativo**: Ferramentas para investigações em grupo
- **Cronologia**: Sistema para rastrear eventos da campanha
- **Relacionamentos**: Mapa de conexões entre personagens
- **Segredos**: Sistema para informações ocultas por personagem
- **Handouts Automáticos**: Distribuição automática de pistas
- **Integração com Módulos**: Compatibilidade com módulos populares

#### [2.0.0] - Futuro
- **Editor Visual**: Interface drag-and-drop para criar fichas
- **IA Assistente**: Sugestões automáticas para narrativa
- **Realidade Aumentada**: Integração com dispositivos AR/VR
- **Multiplataforma**: Aplicativo mobile complementar
- **Cloud Sync**: Sincronização de personagens na nuvem

### 🐛 Problemas Conhecidos
- Nenhum problema conhecido no momento

### 🔧 Correções Aplicadas
- N/A (primeira versão)

### ⚠️ Mudanças Importantes
- N/A (primeira versão)

### 🗑️ Removido
- N/A (primeira versão)

---

**Formato baseado em [Keep a Changelog](https://keepachangelog.com/)**

