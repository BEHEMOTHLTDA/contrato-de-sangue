/**
 * Contrato de Sangue System for Foundry VTT
 * Sistema de RPG de Horror Gótico-Punk
 */

// Importa as classes do sistema
import { ContratoDeSangueActor } from "./actor/actor.js";
import { ContratoDeSangueActorSheet } from "./actor/actor-sheet.js";
import { ContratoDeSangueItem } from "./item/item.js";
import { ContratoDeSangueItemSheet } from "./item/item-sheet.js";

// Hook de inicialização do sistema
Hooks.once('init', async function() {
    console.log('Contrato de Sangue | Inicializando sistema...');

    // Define o namespace global do sistema
    game.contratoDeSangue = {
        ContratoDeSangueActor,
        ContratoDeSangueActorSheet,
        ContratoDeSangueItem,
        ContratoDeSangueItemSheet,
        rollSkill,
        rollInitiative,
        rollAttack,
        rollDefense,
        useSacredDie,
        useUmbralDie,
        interpretResult,
        getMortalityPenalty,
        getWoundPenalty
    };

    // Configura as classes de documento
    CONFIG.Actor.documentClass = ContratoDeSangueActor;
    CONFIG.Item.documentClass = ContratoDeSangueItem;

    // Registra as fichas de personagem e item
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("contrato-de-sangue", ContratoDeSangueActorSheet, {
        types: ["personagem"],
        makeDefault: true,
        label: "CDS.ActorSheet"
    });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("contrato-de-sangue", ContratoDeSangueItemSheet, {
        makeDefault: true,
        label: "CDS.ItemSheet"
    });

    // Registra configurações do sistema
    registerSystemSettings();

    // Registra helpers do Handlebars
    registerHandlebarsHelpers();

    console.log('Contrato de Sangue | Sistema inicializado com sucesso!');
});

// Hook quando o sistema está pronto
Hooks.once('ready', async function() {
    console.log('Contrato de Sangue | Sistema pronto para uso!');
    
    // Configura macros de barra de ação se necessário
    setupActionBarMacros();
});

// Hook para interceptar mensagens de chat
Hooks.on('preCreateChatMessage', (document, data, options, userId) => {
    // Processa comandos especiais do sistema
    if (data.content?.startsWith('/cds')) {
        processChatCommand(data.content, document);
        return false; // Impede a criação da mensagem original
    }
});

/**
 * Registra as configurações do sistema
 */
function registerSystemSettings() {
    // Configuração para mostrar dicas de regras
    game.settings.register("contrato-de-sangue", "showRuleTips", {
        name: "CDS.Settings.ShowRuleTips",
        hint: "CDS.Settings.ShowRuleTipsHint",
        scope: "client",
        config: true,
        type: Boolean,
        default: true
    });

    // Configuração para automação de ferimentos
    game.settings.register("contrato-de-sangue", "autoWounds", {
        name: "CDS.Settings.AutoWounds",
        hint: "CDS.Settings.AutoWoundsHint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        restricted: true
    });

    // Configuração para aplicar automaticamente penalidades de mortalidade
    game.settings.register("contrato-de-sangue", "autoMortalityPenalty", {
        name: "CDS.Settings.AutoMortalityPenalty",
        hint: "CDS.Settings.AutoMortalityPenaltyHint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        restricted: true
    });
}

/**
 * Registra helpers do Handlebars para os templates
 */
function registerHandlebarsHelpers() {
    // Helper para verificar igualdade
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    // Helper para verificar se um valor é maior que outro
    Handlebars.registerHelper('gt', function(a, b) {
        return a > b;
    });

    // Helper para verificar se um valor é menor que outro
    Handlebars.registerHelper('lt', function(a, b) {
        return a < b;
    });

    // Helper para somar valores
    Handlebars.registerHelper('add', function(a, b) {
        return a + b;
    });

    // Helper para subtrair valores
    Handlebars.registerHelper('subtract', function(a, b) {
        return a - b;
    });

    // Helper para multiplicar valores
    Handlebars.registerHelper('multiply', function(a, b) {
        return a * b;
    });

    // Helper para obter penalidade de mortalidade
    Handlebars.registerHelper('getMortalityPenalty', function(mortality) {
        return getMortalityPenalty(mortality);
    });

    // Helper para obter penalidade de ferimentos
    Handlebars.registerHelper('getWoundPenalty', function(conditions) {
        return getWoundPenalty(conditions);
    });

    // Helper para verificar se um checkbox está marcado
    Handlebars.registerHelper('checked', function(condition) {
        return condition ? 'checked' : '';
    });
}

/**
 * Configura macros da barra de ação
 */
function setupActionBarMacros() {
    // Implementar macros úteis se necessário
}

/**
 * Processa comandos de chat especiais do sistema
 */
function processChatCommand(content, messageDocument) {
    const parts = content.split(' ');
    const command = parts[1];
    
    switch(command) {
        case 'roll':
            // /cds roll atletismo 2
            const skill = parts[2];
            const modifier = parseInt(parts[3]) || 0;
            if (canvas.tokens.controlled.length > 0) {
                const actor = canvas.tokens.controlled[0].actor;
                rollSkill(actor, skill, modifier);
            }
            break;
        case 'sacred':
            // /cds sacred
            if (canvas.tokens.controlled.length > 0) {
                const actor = canvas.tokens.controlled[0].actor;
                useSacredDie(actor);
            }
            break;
        case 'umbral':
            // /cds umbral
            if (canvas.tokens.controlled.length > 0) {
                const actor = canvas.tokens.controlled[0].actor;
                useUmbralDie(actor);
            }
            break;
    }
}

/**
 * Rola uma perícia
 * @param {Actor} actor - O ator que está rolando
 * @param {string} skillName - Nome da perícia
 * @param {number} modifier - Modificador adicional
 * @param {number} difficulty - Dificuldade da rolagem (opcional)
 */
export async function rollSkill(actor, skillName, modifier = 0, difficulty = null) {
    if (!actor) return;

    const skillValue = actor.system.pericias[skillName] || 0;
    const mortalityPenalty = getMortalityPenalty(actor.system.mortalidade.value);
    const woundPenalty = getWoundPenalty(actor.system.health.conditions);
    
    // Aplica bônus de vantagens se aplicável
    const advantageBonus = getAdvantageBonus(actor, skillName);
    
    const totalModifier = modifier + mortalityPenalty + woundPenalty + advantageBonus;
    const formula = `1d12 + ${skillValue} + ${totalModifier}`;
    
    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();
    
    const skillLabel = game.i18n.localize(`CDS.pericias.${skillName}`);
    let resultText = interpretResult(roll.total, difficulty);
    
    // Cria a mensagem de chat
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `<strong>${skillLabel}</strong>`,
        content: `
            <div class="cds-roll">
                <div class="roll-formula">${formula}</div>
                <div class="roll-result">
                    <span class="roll-total">${roll.total}</span>
                    ${difficulty ? `<span class="roll-difficulty">(Dificuldade: ${difficulty})</span>` : ''}
                </div>
                <div class="roll-interpretation">${resultText}</div>
                ${totalModifier !== 0 ? `<div class="roll-modifiers">
                    ${mortalityPenalty !== 0 ? `<span>Mortalidade: ${mortalityPenalty}</span>` : ''}
                    ${woundPenalty !== 0 ? `<span>Ferimentos: ${woundPenalty}</span>` : ''}
                    ${advantageBonus !== 0 ? `<span>Vantagens: +${advantageBonus}</span>` : ''}
                    ${modifier !== 0 ? `<span>Modificador: ${modifier}</span>` : ''}
                </div>` : ''}
            </div>
        `,
        roll: roll,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };
    
    ChatMessage.create(messageData);
}

/**
 * Rola iniciativa
 * @param {Actor} actor - O ator que está rolando iniciativa
 */
export async function rollInitiative(actor) {
    if (!actor) return;

    const defenseValue = actor.system.pericias.defesa || 0;
    const mortalityPenalty = getMortalityPenalty(actor.system.mortalidade.value);
    const woundPenalty = getWoundPenalty(actor.system.health.conditions);
    
    const totalModifier = mortalityPenalty + woundPenalty;
    const formula = `1d12 + ${defenseValue} + ${totalModifier}`;
    
    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();
    
    // Adiciona ao combat tracker se estiver em combate
    if (game.combat) {
        const combatant = game.combat.combatants.find(c => c.actor.id === actor.id);
        if (combatant) {
            await game.combat.setInitiative(combatant.id, roll.total);
        }
    }
    
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `<strong>${game.i18n.localize('CDS.RolarIniciativa')}</strong>`,
        content: `
            <div class="cds-roll">
                <div class="roll-formula">${formula}</div>
                <div class="roll-result">
                    <span class="roll-total">${roll.total}</span>
                </div>
                ${totalModifier !== 0 ? `<div class="roll-modifiers">
                    ${mortalityPenalty !== 0 ? `<span>Mortalidade: ${mortalityPenalty}</span>` : ''}
                    ${woundPenalty !== 0 ? `<span>Ferimentos: ${woundPenalty}</span>` : ''}
                </div>` : ''}
            </div>
        `,
        roll: roll,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };
    
    ChatMessage.create(messageData);
}

/**
 * Rola ataque
 * @param {Actor} actor - O ator que está atacando
 * @param {string} weaponType - Tipo de arma (armasBrancas ou armasDeFogo)
 * @param {number} weaponDamage - Dano da arma
 * @param {number} difficulty - Dificuldade do ataque
 */
export async function rollAttack(actor, weaponType = 'armasBrancas', weaponDamage = 0, difficulty = 10) {
    if (!actor) return;

    const skillValue = actor.system.pericias[weaponType] || 0;
    const mortalityPenalty = getMortalityPenalty(actor.system.mortalidade.value);
    const woundPenalty = getWoundPenalty(actor.system.health.conditions);
    
    const totalModifier = mortalityPenalty + woundPenalty;
    const formula = `1d12 + ${skillValue} + ${totalModifier}`;
    
    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();
    
    const resultText = interpretResult(roll.total, difficulty);
    const weaponLabel = game.i18n.localize(`CDS.pericias.${weaponType}`);
    
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `<strong>${game.i18n.localize('CDS.RolarAtaque')} - ${weaponLabel}</strong>`,
        content: `
            <div class="cds-roll">
                <div class="roll-formula">${formula}</div>
                <div class="roll-result">
                    <span class="roll-total">${roll.total}</span>
                    <span class="roll-difficulty">(Dificuldade: ${difficulty})</span>
                </div>
                <div class="roll-interpretation">${resultText}</div>
                ${weaponDamage > 0 ? `<div class="weapon-damage">Dano da Arma: +${weaponDamage}</div>` : ''}
                ${totalModifier !== 0 ? `<div class="roll-modifiers">
                    ${mortalityPenalty !== 0 ? `<span>Mortalidade: ${mortalityPenalty}</span>` : ''}
                    ${woundPenalty !== 0 ? `<span>Ferimentos: ${woundPenalty}</span>` : ''}
                </div>` : ''}
            </div>
        `,
        roll: roll,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };
    
    ChatMessage.create(messageData);
}

/**
 * Rola defesa
 * @param {Actor} actor - O ator que está se defendendo
 */
export async function rollDefense(actor) {
    if (!actor) return;

    const defenseValue = actor.system.pericias.defesa || 0;
    const mortalityPenalty = getMortalityPenalty(actor.system.mortalidade.value);
    const woundPenalty = getWoundPenalty(actor.system.health.conditions);
    
    const totalModifier = mortalityPenalty + woundPenalty;
    const formula = `1d12 + ${defenseValue} + ${totalModifier}`;
    
    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();
    
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `<strong>${game.i18n.localize('CDS.RolarDefesa')}</strong>`,
        content: `
            <div class="cds-roll">
                <div class="roll-formula">${formula}</div>
                <div class="roll-result">
                    <span class="roll-total">${roll.total}</span>
                </div>
                ${totalModifier !== 0 ? `<div class="roll-modifiers">
                    ${mortalityPenalty !== 0 ? `<span>Mortalidade: ${mortalityPenalty}</span>` : ''}
                    ${woundPenalty !== 0 ? `<span>Ferimentos: ${woundPenalty}</span>` : ''}
                </div>` : ''}
            </div>
        `,
        roll: roll,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };
    
    ChatMessage.create(messageData);
}

/**
 * Usa um Dado Sagrado
 * @param {Actor} actor - O ator que está usando o dado
 */
export async function useSacredDie(actor) {
    if (!actor) return;
    
    if (actor.system.reservaDados.value <= 0) {
        ui.notifications.warn("Você não tem dados na reserva!");
        return;
    }
    
    const roll = new Roll('1d6', actor.getRollData());
    await roll.evaluate();
    
    const bonus = Math.ceil(roll.total / 2); // Metade arredondado para cima
    
    // Reduz a reserva de dados
    await actor.update({
        'system.reservaDados.value': actor.system.reservaDados.value - 1
    });
    
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `<strong>${game.i18n.localize('CDS.DadoSagrado')}</strong>`,
        content: `
            <div class="cds-roll sacred-die">
                <div class="roll-result">
                    <span class="roll-dice">🎲 ${roll.total}</span>
                    <span class="roll-bonus">Bônus: +${bonus}</span>
                </div>
                <div class="roll-description">
                    Poder controlado pela humanidade. Sem consequências negativas.
                </div>
                <div class="reserve-status">
                    Reserva de Dados: ${actor.system.reservaDados.value}/${actor.system.reservaDados.max}
                </div>
            </div>
        `,
        roll: roll,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };
    
    ChatMessage.create(messageData);
}

/**
 * Usa um Dado Umbral
 * @param {Actor} actor - O ator que está usando o dado
 */
export async function useUmbralDie(actor) {
    if (!actor) return;
    
    if (actor.system.reservaDados.value <= 0) {
        ui.notifications.warn("Você não tem dados na reserva!");
        return;
    }
    
    const roll = new Roll('1d6', actor.getRollData());
    await roll.evaluate();
    
    const bonus = roll.total; // Resultado completo
    
    // Aumenta Bestialidade e diminui Humanidade (Balança Eterna)
    const newBestialidade = Math.min(12, actor.system.bestialidade.value + 1);
    const newHumanidade = 12 - newBestialidade;
    
    // Reduz a reserva de dados e atualiza a balança
    await actor.update({
        'system.reservaDados.value': actor.system.reservaDados.value - 1,
        'system.bestialidade.value': newBestialidade,
        'system.humanidade.value': newHumanidade,
        'system.reservaDados.max': newBestialidade + 1
    });
    
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `<strong>${game.i18n.localize('CDS.DadoUmbral')}</strong>`,
        content: `
            <div class="cds-roll umbral-die">
                <div class="roll-result">
                    <span class="roll-dice">🎲 ${roll.total}</span>
                    <span class="roll-bonus">Bônus: +${bonus}</span>
                </div>
                <div class="roll-consequence">
                    <strong>Consequência:</strong> Bestialidade +1 (${newBestialidade}), Humanidade -1 (${newHumanidade})
                </div>
                <div class="roll-description">
                    Poder desenfreado da besta interior.
                </div>
                <div class="reserve-status">
                    Reserva de Dados: ${actor.system.reservaDados.value}/${actor.system.reservaDados.max}
                </div>
            </div>
        `,
        roll: roll,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };
    
    ChatMessage.create(messageData);
    
    ui.notifications.info(`Bestialidade aumentou para ${newBestialidade}. Humanidade diminuiu para ${newHumanidade}.`);
}

/**
 * Interpreta o resultado de uma rolagem
 * @param {number} total - Total da rolagem
 * @param {number} difficulty - Dificuldade da rolagem
 * @returns {string} Interpretação do resultado
 */
export function interpretResult(total, difficulty) {
    if (!difficulty) return '';
    
    const difference = total - difficulty;
    
    if (difference >= 5) {
        return `<span class="success-critical">${game.i18n.localize('CDS.SucessoCritico')}</span>`;
    } else if (difference >= 0) {
        return `<span class="success">${game.i18n.localize('CDS.Sucesso')}</span>`;
    } else if (difference >= -4) {
        return `<span class="failure-partial">${game.i18n.localize('CDS.FalhaParcial')}</span>`;
    } else {
        return `<span class="failure-critical">${game.i18n.localize('CDS.FalhaCritica')}</span>`;
    }
}

/**
 * Obtém a penalidade de mortalidade
 * @param {number} mortality - Valor de mortalidade
 * @returns {number} Penalidade aplicada
 */
export function getMortalityPenalty(mortality) {
    if (mortality >= 13) return -3; // Perde controle
    if (mortality >= 10) return -3; // -3 diariamente
    if (mortality >= 7) return -2;  // -2 duas vezes por semana
    if (mortality >= 4) return -1;  // -1 uma vez por semana
    return 0; // Sem penalidade
}

/**
 * Obtém a penalidade de ferimentos
 * @param {Object} conditions - Condições de ferimento
 * @returns {number} Penalidade total de ferimentos
 */
export function getWoundPenalty(conditions) {
    if (conditions.incapacitado) return -10; // Praticamente impossível agir
    if (conditions.aleijado) return -5;
    if (conditions.feridoGravemente) return -4;
    if (conditions.ferido) return -3;
    if (conditions.machucado) return -2;
    if (conditions.escoriado) return -1;
    return 0;
}

/**
 * Obtém bônus de vantagens para uma perícia
 * @param {Actor} actor - O ator
 * @param {string} skillName - Nome da perícia
 * @returns {number} Bônus total das vantagens
 */
function getAdvantageBonus(actor, skillName) {
    let bonus = 0;
    
    // Verifica vantagens que afetam a perícia
    for (const item of actor.items) {
        if (item.type === 'vantagem' && item.system.ativa) {
            // Mente Afiada: +1 em perícias mentais
            if (item.name.toLowerCase().includes('mente afiada')) {
                const mentalSkills = ['computadores', 'investigacao', 'medicina', 'ocultismo', 'ciencias'];
                if (mentalSkills.includes(skillName)) {
                    bonus += 1;
                }
            }
            
            // Força Bestial: +1 em atletismo
            if (item.name.toLowerCase().includes('força bestial') && skillName === 'atletismo') {
                bonus += 1;
            }
            
            // Instintos Primitivos: +1 em sobrevivência
            if (item.name.toLowerCase().includes('instintos primitivos') && skillName === 'sobrevivencia') {
                bonus += 1;
            }
            
            // Charme Sobrenatural: +1 em perícias sociais (quando aplicável)
            if (item.name.toLowerCase().includes('charme sobrenatural')) {
                const socialSkills = ['empatia', 'expressao', 'intimidacao', 'persuasao', 'subterfugio'];
                if (socialSkills.includes(skillName)) {
                    bonus += 1;
                }
            }
        }
    }
    
    return bonus;
}

