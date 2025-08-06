/**
 * Script para criar e popular compêndios com itens pré-definidos do sistema Contrato de Sangue
 * Este script deve ser executado uma vez para criar os compêndios iniciais
 */

// Vantagens Upiór
const vantagensUpior = [
    {
        name: "Charme Sobrenatural",
        type: "vantagem",
        system: {
            description: "+1 em testes sociais quando pode fazer contato visual. Sua presença magnética é irresistível.",
            linhagem: "upior",
            bonus: { tipo: "pericia", valor: 1, aplicacao: "sociais com contato visual" },
            ativa: true
        }
    },
    {
        name: "Mente Afiada",
        type: "vantagem",
        system: {
            description: "+1 em todas as perícias mentais. Sua mente vampírica processa informações com velocidade sobre-humana.",
            linhagem: "upior",
            bonus: { tipo: "pericia", valor: 1, aplicacao: "perícias mentais" },
            ativa: true
        }
    },
    {
        name: "Sentidos Aguçados",
        type: "vantagem",
        system: {
            description: "Pode detectar mentiras, emoções e intenções. Seus sentidos vampíricos penetram além do véu da deceptividade.",
            linhagem: "upior",
            bonus: { tipo: "especial", valor: 0, aplicacao: "detecção de mentiras e emoções" },
            ativa: true
        }
    },
    {
        name: "Velocidade Vampírica",
        type: "vantagem",
        system: {
            description: "Pode se mover com velocidade sobre-humana por curtos períodos. O tempo parece desacelerar ao seu redor.",
            linhagem: "upior",
            bonus: { tipo: "especial", valor: 0, aplicacao: "movimento em combate" },
            ativa: true
        }
    },
    {
        name: "Regeneração",
        type: "vantagem",
        system: {
            description: "Recupera 1 ponto de dano por hora. Seu corpo morto-vivo se reconstitui lentamente.",
            linhagem: "upior",
            bonus: { tipo: "especial", valor: 1, aplicacao: "regeneração por hora" },
            ativa: true
        }
    },
    {
        name: "Forma de Névoa",
        type: "vantagem",
        system: {
            description: "Pode se transformar em névoa por alguns minutos. Torna-se intangível e pode passar por pequenas aberturas.",
            linhagem: "upior",
            bonus: { tipo: "especial", valor: 0, aplicacao: "transformação em névoa" },
            ativa: true
        }
    },
    {
        name: "Controle Mental",
        type: "vantagem",
        system: {
            description: "Pode implantar sugestões simples em mentes fracas. Sua vontade se impõe sobre os mais vulneráveis.",
            linhagem: "upior",
            bonus: { tipo: "especial", valor: 0, aplicacao: "controle mental" },
            ativa: true
        }
    },
    {
        name: "Imortalidade",
        type: "vantagem",
        system: {
            description: "Não envelhece e é imune a doenças. O tempo não tem poder sobre sua forma não-morta.",
            linhagem: "upior",
            bonus: { tipo: "especial", valor: 0, aplicacao: "imunidade a envelhecimento e doenças" },
            ativa: true
        }
    }
];

// Vantagens Wilkołaki
const vantagensWilkolaki = [
    {
        name: "Força Bestial",
        type: "vantagem",
        system: {
            description: "+1 em testes de força e atletismo. Seus músculos possuem a potência de uma fera selvagem.",
            linhagem: "wilkolaki",
            bonus: { tipo: "pericia", valor: 1, aplicacao: "atletismo" },
            ativa: true
        }
    },
    {
        name: "Instintos Primitivos",
        type: "vantagem",
        system: {
            description: "+1 em Sobrevivência e detecção de perigos. Seus instintos animais alertam para ameaças.",
            linhagem: "wilkolaki",
            bonus: { tipo: "pericia", valor: 1, aplicacao: "sobrevivencia" },
            ativa: true
        }
    },
    {
        name: "Forma Lupina",
        type: "vantagem",
        system: {
            description: "Pode se transformar em lobo ou forma híbrida. Assume a forma de seus ancestrais predadores.",
            linhagem: "wilkolaki",
            bonus: { tipo: "especial", valor: 0, aplicacao: "transformação lupina" },
            ativa: true
        }
    },
    {
        name: "Regeneração Acelerada",
        type: "vantagem",
        system: {
            description: "Recupera 1 ponto de dano a cada 10 minutos. Seu metabolismo bestial acelera a cura.",
            linhagem: "wilkolaki",
            bonus: { tipo: "especial", valor: 1, aplicacao: "regeneração a cada 10 minutos" },
            ativa: true
        }
    },
    {
        name: "Faro Sobrenatural",
        type: "vantagem",
        system: {
            description: "Pode rastrear por cheiro e detectar emoções. Seu olfato rivaliza com o dos lobos.",
            linhagem: "wilkolaki",
            bonus: { tipo: "especial", valor: 0, aplicacao: "rastreamento e detecção de emoções" },
            ativa: true
        }
    },
    {
        name: "Resistência",
        type: "vantagem",
        system: {
            description: "+1 contra venenos, doenças e efeitos mentais. Sua natureza bestial resiste a influências externas.",
            linhagem: "wilkolaki",
            bonus: { tipo: "especial", valor: 1, aplicacao: "resistência a venenos, doenças e efeitos mentais" },
            ativa: true
        }
    },
    {
        name: "Garra e Presa",
        type: "vantagem",
        system: {
            description: "Ataques naturais causam dano letal. Suas garras e presas são armas mortais.",
            linhagem: "wilkolaki",
            bonus: { tipo: "especial", valor: 2, aplicacao: "dano letal com ataques naturais" },
            ativa: true
        }
    },
    {
        name: "Território",
        type: "vantagem",
        system: {
            description: "Bônus em ações realizadas em território conhecido. Você conhece cada pedra de seu domínio.",
            linhagem: "wilkolaki",
            bonus: { tipo: "especial", valor: 2, aplicacao: "ações em território conhecido" },
            ativa: true
        }
    }
];

// Poderes Upiór
const poderesUpior = [
    {
        name: "Dominação",
        type: "poder",
        system: {
            description: "Controle mental direto sobre um alvo. Você pode comandar as ações de uma pessoa por um período limitado.",
            linhagem: "upior",
            efeito: "Controla completamente as ações de um alvo por 1 cena",
            duracao: "1 cena",
            alcance: "Contato visual",
            custo: { reservaDados: 2, mortalidade: 1, pontosEntendimento: 0 }
        }
    },
    {
        name: "Celeridade",
        type: "poder",
        system: {
            description: "Velocidade sobre-humana que permite múltiplas ações em um turno.",
            linhagem: "upior",
            efeito: "Permite uma ação adicional por turno",
            duracao: "1 cena",
            alcance: "Pessoal",
            custo: { reservaDados: 1, mortalidade: 0, pontosEntendimento: 0 }
        }
    },
    {
        name: "Ofuscação",
        type: "poder",
        system: {
            description: "Invisibilidade e disfarce sobrenatural que confunde os sentidos.",
            linhagem: "upior",
            efeito: "Torna-se invisível ou assume outra aparência",
            duracao: "1 hora",
            alcance: "Pessoal",
            custo: { reservaDados: 1, mortalidade: 0, pontosEntendimento: 0 }
        }
    },
    {
        name: "Presença",
        type: "poder",
        system: {
            description: "Carisma sobrenatural que inspira medo, amor ou admiração.",
            linhagem: "upior",
            efeito: "Manipula emoções de todos em um raio de 10 metros",
            duracao: "1 cena",
            alcance: "10 metros",
            custo: { reservaDados: 2, mortalidade: 0, pontosEntendimento: 0 }
        }
    }
];

// Poderes Wilkołaki
const poderesWilkolaki = [
    {
        name: "Metamorfose",
        type: "poder",
        system: {
            description: "Transformação física em formas animais ou híbridas.",
            linhagem: "wilkolaki",
            efeito: "Transforma-se em lobo, forma híbrida ou volta ao normal",
            duracao: "Até cancelar",
            alcance: "Pessoal",
            custo: { reservaDados: 1, mortalidade: 0, pontosEntendimento: 0 }
        }
    },
    {
        name: "Fúria",
        type: "poder",
        system: {
            description: "Força e velocidade bestial em combate, mas com perda de controle.",
            linhagem: "wilkolaki",
            efeito: "+3 em ataques e dano, mas -2 em defesa e testes mentais",
            duracao: "1 combate",
            alcance: "Pessoal",
            custo: { reservaDados: 2, mortalidade: 1, pontosEntendimento: 0 }
        }
    },
    {
        name: "Sentidos",
        type: "poder",
        system: {
            description: "Percepção aguçada que permite detectar presenças e rastrear.",
            linhagem: "wilkolaki",
            efeito: "Detecta criaturas em 1 km de raio, pode rastrear por até 24h",
            duracao: "1 hora",
            alcance: "1 km",
            custo: { reservaDados: 1, mortalidade: 0, pontosEntendimento: 0 }
        }
    },
    {
        name: "Regeneração",
        type: "poder",
        system: {
            description: "Cura acelerada que permite recuperar ferimentos rapidamente.",
            linhagem: "wilkolaki",
            efeito: "Recupera 3 pontos de dano imediatamente",
            duracao: "Instantâneo",
            alcance: "Pessoal",
            custo: { reservaDados: 2, mortalidade: 0, pontosEntendimento: 0 }
        }
    }
];

// Armas
const armas = [
    {
        name: "Faca",
        type: "arma",
        system: {
            description: "Uma lâmina pequena e versátil, fácil de esconder.",
            dano: 1,
            alcance: "curto",
            especial: "Ocultável",
            tipo: "branca",
            peso: 0.2,
            preco: 20,
            equipada: false
        }
    },
    {
        name: "Espada",
        type: "arma",
        system: {
            description: "Uma lâmina longa e equilibrada, arma nobre dos guerreiros.",
            dano: 3,
            alcance: "curto",
            especial: "Versátil",
            tipo: "branca",
            peso: 1.5,
            preco: 300,
            equipada: false
        }
    },
    {
        name: "Machado",
        type: "arma",
        system: {
            description: "Uma arma pesada que causa ferimentos devastadores.",
            dano: 4,
            alcance: "curto",
            especial: "Pesado",
            tipo: "branca",
            peso: 2.0,
            preco: 150,
            equipada: false
        }
    },
    {
        name: "Bastão",
        type: "arma",
        system: {
            description: "Uma arma simples mas eficaz, causa dano não-letal.",
            dano: 1,
            alcance: "curto",
            especial: "Não-letal",
            tipo: "branca",
            peso: 1.0,
            preco: 10,
            equipada: false
        }
    },
    {
        name: "Pistola",
        type: "arma",
        system: {
            description: "Arma de fogo compacta e fácil de esconder.",
            dano: 2,
            alcance: "medio",
            especial: "Ocultável",
            tipo: "fogo",
            peso: 0.8,
            preco: 400,
            equipada: false
        }
    },
    {
        name: "Rifle",
        type: "arma",
        system: {
            description: "Arma de fogo de longo alcance com alta precisão.",
            dano: 4,
            alcance: "longo",
            especial: "Precisão",
            tipo: "fogo",
            peso: 4.0,
            preco: 800,
            equipada: false
        }
    },
    {
        name: "Espingarda",
        type: "arma",
        system: {
            description: "Arma de fogo de curto alcance com grande poder de parada.",
            dano: 3,
            alcance: "curto",
            especial: "Dispersão",
            tipo: "fogo",
            peso: 3.5,
            preco: 600,
            equipada: false
        }
    },
    {
        name: "Submetralhadora",
        type: "arma",
        system: {
            description: "Arma automática capaz de múltiplos disparos.",
            dano: 3,
            alcance: "medio",
            especial: "Automática",
            tipo: "fogo",
            peso: 2.5,
            preco: 1200,
            equipada: false
        }
    }
];

// Armaduras
const armaduras = [
    {
        name: "Roupas",
        type: "armadura",
        system: {
            description: "Roupas comuns que não oferecem proteção significativa.",
            absorcao: 0,
            penalidade: 0,
            peso: 1.0,
            preco: 50,
            equipada: false
        }
    },
    {
        name: "Colete",
        type: "armadura",
        system: {
            description: "Colete de proteção leve, usado por seguranças.",
            absorcao: 1,
            penalidade: 1,
            peso: 2.0,
            preco: 200,
            equipada: false
        }
    },
    {
        name: "Armadura Tática",
        type: "armadura",
        system: {
            description: "Equipamento militar moderno com boa proteção.",
            absorcao: 2,
            penalidade: 2,
            peso: 8.0,
            preco: 1000,
            equipada: false
        }
    },
    {
        name: "Armadura Completa",
        type: "armadura",
        system: {
            description: "Proteção máxima, mas muito restritiva.",
            absorcao: 3,
            penalidade: 3,
            peso: 15.0,
            preco: 2000,
            equipada: false
        }
    }
];

// Equipamentos Especiais
const equipamentos = [
    {
        name: "Laptop",
        type: "equipamento",
        system: {
            description: "Computador portátil para hacking e pesquisa.",
            peso: 2.0,
            preco: 800,
            quantidade: 1,
            equipado: false
        }
    },
    {
        name: "Kit de Primeiros Socorros",
        type: "equipamento",
        system: {
            description: "Suprimentos médicos básicos para tratamento de ferimentos.",
            peso: 1.0,
            preco: 50,
            quantidade: 1,
            equipado: false
        }
    },
    {
        name: "Equipamento de Vigilância",
        type: "equipamento",
        system: {
            description: "Câmeras, microfones e dispositivos de espionagem.",
            peso: 3.0,
            preco: 1500,
            quantidade: 1,
            equipado: false
        }
    },
    {
        name: "Grimório Antigo",
        type: "equipamento",
        system: {
            description: "Livro de conhecimento oculto com rituais e símbolos.",
            peso: 2.0,
            preco: 500,
            quantidade: 1,
            equipado: false
        }
    },
    {
        name: "Componentes Rituais",
        type: "equipamento",
        system: {
            description: "Velas, incensos, cristais e outros materiais para rituais.",
            peso: 1.5,
            preco: 100,
            quantidade: 1,
            equipado: false
        }
    },
    {
        name: "Amuleto de Proteção",
        type: "equipamento",
        system: {
            description: "Talismã que oferece proteção contra influências sobrenaturais.",
            peso: 0.1,
            preco: 200,
            quantidade: 1,
            equipado: false
        }
    }
];

/**
 * Função para criar os compêndios e popular com os itens
 */
export async function createCompendiums() {
    console.log('Contrato de Sangue | Criando compêndios...');
    
    try {
        // Cria compêndio de Vantagens Upiór
        const vantagensUpiorPack = await CompendiumCollection.createCompendium({
            type: "Item",
            label: "Vantagens Upiór",
            name: "vantagens-upior",
            path: "./packs/vantagens-upior.db",
            system: "contrato-de-sangue"
        });
        
        for (const vantagem of vantagensUpior) {
            await Item.create(vantagem, { pack: vantagensUpiorPack.collection });
        }
        
        // Cria compêndio de Vantagens Wilkołaki
        const vantagensWilkolakiPack = await CompendiumCollection.createCompendium({
            type: "Item",
            label: "Vantagens Wilkołaki",
            name: "vantagens-wilkolaki",
            path: "./packs/vantagens-wilkolaki.db",
            system: "contrato-de-sangue"
        });
        
        for (const vantagem of vantagensWilkolaki) {
            await Item.create(vantagem, { pack: vantagensWilkolakiPack.collection });
        }
        
        // Cria compêndio de Poderes Upiór
        const poderesUpiorPack = await CompendiumCollection.createCompendium({
            type: "Item",
            label: "Poderes Upiór",
            name: "poderes-upior",
            path: "./packs/poderes-upior.db",
            system: "contrato-de-sangue"
        });
        
        for (const poder of poderesUpior) {
            await Item.create(poder, { pack: poderesUpiorPack.collection });
        }
        
        // Cria compêndio de Poderes Wilkołaki
        const poderesWilkolakiPack = await CompendiumCollection.createCompendium({
            type: "Item",
            label: "Poderes Wilkołaki",
            name: "poderes-wilkolaki",
            path: "./packs/poderes-wilkolaki.db",
            system: "contrato-de-sangue"
        });
        
        for (const poder of poderesWilkolaki) {
            await Item.create(poder, { pack: poderesWilkolakiPack.collection });
        }
        
        // Cria compêndio de Armas
        const armasPack = await CompendiumCollection.createCompendium({
            type: "Item",
            label: "Armas",
            name: "armas",
            path: "./packs/armas.db",
            system: "contrato-de-sangue"
        });
        
        for (const arma of armas) {
            await Item.create(arma, { pack: armasPack.collection });
        }
        
        // Cria compêndio de Armaduras
        const armadurasPack = await CompendiumCollection.createCompendium({
            type: "Item",
            label: "Armaduras",
            name: "armaduras",
            path: "./packs/armaduras.db",
            system: "contrato-de-sangue"
        });
        
        for (const armadura of armaduras) {
            await Item.create(armadura, { pack: armadurasPack.collection });
        }
        
        // Cria compêndio de Equipamentos
        const equipamentosPack = await CompendiumCollection.createCompendium({
            type: "Item",
            label: "Equipamentos",
            name: "equipamentos",
            path: "./packs/equipamentos.db",
            system: "contrato-de-sangue"
        });
        
        for (const equipamento of equipamentos) {
            await Item.create(equipamento, { pack: equipamentosPack.collection });
        }
        
        console.log('Contrato de Sangue | Compêndios criados com sucesso!');
        ui.notifications.info("Compêndios do Contrato de Sangue criados com sucesso!");
        
    } catch (error) {
        console.error('Contrato de Sangue | Erro ao criar compêndios:', error);
        ui.notifications.error("Erro ao criar compêndios. Verifique o console para detalhes.");
    }
}

// Registra comando de chat para criar compêndios
Hooks.on('chatMessage', (chatLog, messageText, chatData) => {
    if (messageText === '/cds-create-compendiums' && game.user.isGM) {
        createCompendiums();
        return false;
    }
});

