/**
 * Sistema de Automação de Combate para Contrato de Sangue
 * Integra com o Combat Tracker do Foundry VTT
 */

// Hook para inicializar automações de combate
Hooks.once('ready', function() {
    console.log('Contrato de Sangue | Inicializando automações de combate...');
    
    // Registra hooks de combate
    registerCombatHooks();
    
    console.log('Contrato de Sangue | Automações de combate carregadas!');
});

/**
 * Registra hooks relacionados ao combate
 */
function registerCombatHooks() {
    // Hook quando um combate é iniciado
    Hooks.on('combatStart', (combat, updateData) => {
        ui.notifications.cds.info("Combate iniciado! Que o sangue seja derramado...");
        
        // Aplica efeitos de início de combate
        for (const combatant of combat.combatants) {
            if (combatant.actor) {
                applyStartOfCombatEffects(combatant.actor);
            }
        }
    });
    
    // Hook quando um turno muda
    Hooks.on('combatTurn', (combat, updateData, options) => {
        const currentCombatant = combat.combatant;
        if (currentCombatant && currentCombatant.actor) {
            handleTurnStart(currentCombatant.actor, combat);
        }
    });
    
    // Hook quando um combate termina
    Hooks.on('combatEnd', (combat) => {
        ui.notifications.cds.info("Combate finalizado. O silêncio retorna...");
        
        // Aplica efeitos de fim de combate
        for (const combatant of combat.combatants) {
            if (combatant.actor) {
                applyEndOfCombatEffects(combatant.actor);
            }
        }
    });
    
    // Hook para interceptar rolagens de iniciativa
    Hooks.on('preCreateCombatant', (combatant, data, options, userId) => {
        if (combatant.actor && combatant.actor.system) {
            // Calcula iniciativa automaticamente se não foi definida
            if (!data.initiative) {
                rollInitiativeForActor(combatant.actor);
            }
        }
    });
}

/**
 * Aplica efeitos de início de combate
 * @param {Actor} actor - O ator
 */
function applyStartOfCombatEffects(actor) {
    // Verifica se o ator tem poderes que se ativam no início do combate
    for (const item of actor.items) {
        if (item.type === 'poder' && item.system.ativacao === 'inicio_combate') {
            // Ativa poder automaticamente se configurado
            if (item.system.automatico) {
                activatePower(actor, item);
            }
        }
    }
    
    // Aplica modificadores de combate baseados na linhagem
    if (actor.system.linhagem === 'wilkolaki') {
        // Wilkołaki podem entrar em fúria automaticamente
        const furyAdvantage = actor.items.find(i => i.name.toLowerCase().includes('fúria'));
        if (furyAdvantage && Math.random() < 0.3) { // 30% de chance
            ui.notifications.cds.warning(`${actor.name} sente a fúria bestial despertando...`);
        }
    }
}

/**
 * Manipula o início de um turno
 * @param {Actor} actor - O ator cujo turno está começando
 * @param {Combat} combat - O combate atual
 */
function handleTurnStart(actor, combat) {
    // Notifica o jogador
    if (actor.hasPlayerOwner) {
        ui.notifications.cds.info(`É o turno de ${actor.name}!`);
    }
    
    // Aplica regeneração automática se aplicável
    applyRegeneration(actor);
    
    // Verifica condições especiais
    checkSpecialConditions(actor);
    
    // Atualiza interface se necessário
    if (actor.sheet && actor.sheet.rendered) {
        actor.sheet.render(false);
    }
}

/**
 * Aplica efeitos de fim de combate
 * @param {Actor} actor - O ator
 */
function applyEndOfCombatEffects(actor) {
    // Remove efeitos temporários de combate
    removeTemporaryCombatEffects(actor);
    
    // Aplica recuperação pós-combate
    applyPostCombatRecovery(actor);
}

/**
 * Rola iniciativa para um ator
 * @param {Actor} actor - O ator
 */
async function rollInitiativeForActor(actor) {
    const defenseValue = actor.system.pericias.defesa || 0;
    const mortalityPenalty = getMortalityPenalty(actor.system.mortalidade.value);
    const woundPenalty = getWoundPenalty(actor.system.health.conditions);
    
    const totalModifier = mortalityPenalty + woundPenalty;
    const formula = `1d12 + ${defenseValue} + ${totalModifier}`;
    
    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();
    
    // Atualiza a iniciativa no combate
    if (game.combat) {
        const combatant = game.combat.combatants.find(c => c.actor.id === actor.id);
        if (combatant) {
            await game.combat.setInitiative(combatant.id, roll.total);
        }
    }
    
    return roll.total;
}

/**
 * Aplica regeneração automática
 * @param {Actor} actor - O ator
 */
async function applyRegeneration(actor) {
    // Verifica vantagens de regeneração
    const regenAdvantages = actor.items.filter(i => 
        i.type === 'vantagem' && 
        i.name.toLowerCase().includes('regeneração') && 
        i.system.ativa
    );
    
    for (const advantage of regenAdvantages) {
        let healAmount = 0;
        
        if (advantage.name.toLowerCase().includes('acelerada')) {
            // Regeneração Acelerada (Wilkołaki): 1 ponto a cada 10 minutos
            healAmount = 1;
        } else {
            // Regeneração normal (Upiór): 1 ponto por hora
            // Em combate, aplica apenas se passou tempo suficiente
            if (game.combat.round >= 60) { // Aproximadamente 1 hora de combate
                healAmount = 1;
            }
        }
        
        if (healAmount > 0) {
            const currentHealth = actor.system.health.value;
            const maxHealth = actor.system.health.max;
            const newHealth = Math.min(maxHealth, currentHealth + healAmount);
            
            if (newHealth > currentHealth) {
                await actor.update({
                    'system.health.value': newHealth
                });
                
                ui.notifications.cds.success(`${actor.name} regenera ${healAmount} ponto(s) de vida.`);
            }
        }
    }
}

/**
 * Verifica condições especiais
 * @param {Actor} actor - O ator
 */
function checkSpecialConditions(actor) {
    // Verifica se está incapacitado
    if (actor.system.health.conditions.incapacitado) {
        ui.notifications.cds.warning(`${actor.name} está incapacitado e não pode agir normalmente!`);
    }
    
    // Verifica mortalidade crítica
    if (actor.system.mortalidade.value >= 13) {
        ui.notifications.cds.error(`${actor.name} perdeu o controle! A besta assumiu o comando!`);
        
        // Pode forçar ações automáticas baseadas na linhagem
        if (actor.system.linhagem === 'wilkolaki') {
            triggerBestialFury(actor);
        } else if (actor.system.linhagem === 'upior') {
            triggerBloodthirst(actor);
        }
    }
    
    // Verifica necessidade de caça
    const huntInfo = getHuntInfo(actor.system.mortalidade.value);
    if (huntInfo.necessaria && huntInfo.penalidade < -2) {
        ui.notifications.cds.warning(`${actor.name} sente uma fome desesperadora...`);
    }
}

/**
 * Dispara fúria bestial (Wilkołaki)
 * @param {Actor} actor - O ator
 */
function triggerBestialFury(actor) {
    // Aplica efeitos de fúria automática
    const furyEffects = {
        'system.combat.fury': true,
        'system.combat.furyRounds': 3
    };
    
    actor.update(furyEffects);
    
    ui.notifications.cds.error(`${actor.name} entra em fúria bestial incontrolável!`);
    
    // Cria mensagem de chat
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: `
            <div class="cds-fury">
                <h3>🐺 FÚRIA BESTIAL 🐺</h3>
                <p><strong>${actor.name}</strong> perdeu o controle e entrou em fúria!</p>
                <p><strong>Efeitos:</strong></p>
                <ul>
                    <li>+3 em ataques e dano</li>
                    <li>-2 em defesa e testes mentais</li>
                    <li>Deve atacar o alvo mais próximo</li>
                    <li>Duração: 3 rodadas</li>
                </ul>
            </div>
        `
    };
    
    ChatMessage.create(messageData);
}

/**
 * Dispara sede de sangue (Upiór)
 * @param {Actor} actor - O ator
 */
function triggerBloodthirst(actor) {
    // Aplica efeitos de sede de sangue
    const bloodthirstEffects = {
        'system.combat.bloodthirst': true,
        'system.combat.bloodthirstRounds': 3
    };
    
    actor.update(bloodthirstEffects);
    
    ui.notifications.cds.error(`${actor.name} é consumido por uma sede de sangue incontrolável!`);
    
    // Cria mensagem de chat
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: `
            <div class="cds-bloodthirst">
                <h3>🧛 SEDE DE SANGUE 🧛</h3>
                <p><strong>${actor.name}</strong> perdeu o controle e busca sangue!</p>
                <p><strong>Efeitos:</strong></p>
                <ul>
                    <li>+2 em ataques contra criaturas vivas</li>
                    <li>-3 em testes sociais e mentais</li>
                    <li>Deve tentar se alimentar quando possível</li>
                    <li>Duração: 3 rodadas</li>
                </ul>
            </div>
        `
    };
    
    ChatMessage.create(messageData);
}

/**
 * Remove efeitos temporários de combate
 * @param {Actor} actor - O ator
 */
async function removeTemporaryCombatEffects(actor) {
    const updates = {};
    
    // Remove fúria
    if (actor.system.combat?.fury) {
        updates['system.combat.fury'] = false;
        updates['system.combat.furyRounds'] = 0;
    }
    
    // Remove sede de sangue
    if (actor.system.combat?.bloodthirst) {
        updates['system.combat.bloodthirst'] = false;
        updates['system.combat.bloodthirstRounds'] = 0;
    }
    
    if (Object.keys(updates).length > 0) {
        await actor.update(updates);
    }
}

/**
 * Aplica recuperação pós-combate
 * @param {Actor} actor - O ator
 */
async function applyPostCombatRecovery(actor) {
    // Recupera 1 dado da reserva se o combate foi vencido
    if (actor.system.reservaDados.value < actor.system.reservaDados.max) {
        await actor.recoverReserveDice(1);
        ui.notifications.cds.info(`${actor.name} recupera 1 dado da reserva após o combate.`);
    }
}

/**
 * Sistema de aplicação de dano automático
 */
export class DamageApplication {
    /**
     * Aplica dano a um ator
     * @param {Actor} actor - O ator que recebe dano
     * @param {number} damage - Quantidade de dano
     * @param {string} type - Tipo de dano (contusivo, letal, agravado)
     * @param {Actor} source - Fonte do dano (opcional)
     */
    static async applyDamage(actor, damage, type = 'letal', source = null) {
        if (!actor || damage <= 0) return;
        
        // Calcula absorção de armaduras
        const absorption = this.calculateAbsorption(actor, type);
        const finalDamage = Math.max(0, damage - absorption);
        
        if (finalDamage === 0) {
            ui.notifications.cds.info(`${actor.name} absorve todo o dano com sua armadura!`);
            return;
        }
        
        // Aplica o dano
        const currentHealth = actor.system.health.value;
        const newHealth = Math.max(0, currentHealth - finalDamage);
        
        await actor.update({
            'system.health.value': newHealth
        });
        
        // Atualiza condições de ferimento automaticamente
        if (game.settings.get("contrato-de-sangue", "autoWounds")) {
            await this.updateWoundConditions(actor, newHealth);
        }
        
        // Cria mensagem de dano
        this.createDamageMessage(actor, finalDamage, type, absorption, source);
        
        // Verifica se o ator foi incapacitado ou morto
        this.checkIncapacitation(actor, newHealth);
        
        // Aumenta mortalidade se o dano foi causado por ações violentas
        if (source && type === 'letal' && finalDamage >= 3) {
            await this.increaseMortalityFromViolence(source);
        }
    }
    
    /**
     * Calcula absorção de armaduras
     * @param {Actor} actor - O ator
     * @param {string} damageType - Tipo de dano
     * @returns {number} Absorção total
     */
    static calculateAbsorption(actor, damageType) {
        let totalAbsorption = 0;
        
        // Soma absorção de armaduras equipadas
        for (const item of actor.items) {
            if (item.type === 'armadura' && item.system.equipada) {
                let absorption = item.system.absorcao || 0;
                
                // Dano agravado ignora metade da absorção
                if (damageType === 'agravado') {
                    absorption = Math.floor(absorption / 2);
                }
                
                totalAbsorption += absorption;
            }
        }
        
        // Vantagens que aumentam absorção
        for (const item of actor.items) {
            if (item.type === 'vantagem' && item.system.ativa) {
                if (item.name.toLowerCase().includes('pele de ferro')) {
                    totalAbsorption += 1;
                } else if (item.name.toLowerCase().includes('resistência')) {
                    totalAbsorption += 1;
                }
            }
        }
        
        return totalAbsorption;
    }
    
    /**
     * Atualiza condições de ferimento
     * @param {Actor} actor - O ator
     * @param {number} currentHealth - Vida atual
     */
    static async updateWoundConditions(actor, currentHealth) {
        const maxHealth = actor.system.health.max;
        const healthPercentage = currentHealth / maxHealth;
        
        const conditions = {
            escoriado: healthPercentage <= 0.9,
            machucado: healthPercentage <= 0.75,
            ferido: healthPercentage <= 0.5,
            feridoGravemente: healthPercentage <= 0.25,
            aleijado: healthPercentage <= 0.1,
            incapacitado: currentHealth <= 0
        };
        
        await actor.update({
            'system.health.conditions': conditions
        });
    }
    
    /**
     * Cria mensagem de dano no chat
     * @param {Actor} actor - O ator que recebeu dano
     * @param {number} damage - Dano final aplicado
     * @param {string} type - Tipo de dano
     * @param {number} absorption - Absorção aplicada
     * @param {Actor} source - Fonte do dano
     */
    static createDamageMessage(actor, damage, type, absorption, source) {
        const messageData = {
            speaker: source ? ChatMessage.getSpeaker({ actor: source }) : ChatMessage.getSpeaker(),
            content: `
                <div class="cds-damage">
                    <h3>💥 DANO APLICADO 💥</h3>
                    <p><strong>Alvo:</strong> ${actor.name}</p>
                    <p><strong>Dano:</strong> ${damage} (${type})</p>
                    ${absorption > 0 ? `<p><strong>Absorção:</strong> ${absorption}</p>` : ''}
                    <p><strong>Vida:</strong> ${actor.system.health.value}/${actor.system.health.max}</p>
                    ${source ? `<p><strong>Fonte:</strong> ${source.name}</p>` : ''}
                </div>
            `
        };
        
        ChatMessage.create(messageData);
    }
    
    /**
     * Verifica incapacitação
     * @param {Actor} actor - O ator
     * @param {number} currentHealth - Vida atual
     */
    static checkIncapacitation(actor, currentHealth) {
        if (currentHealth <= 0) {
            ui.notifications.cds.error(`${actor.name} foi incapacitado!`);
            
            // Remove do combate se estiver participando
            if (game.combat) {
                const combatant = game.combat.combatants.find(c => c.actor.id === actor.id);
                if (combatant) {
                    // Pode remover ou marcar como derrotado
                    combatant.update({ defeated: true });
                }
            }
        } else if (currentHealth <= actor.system.health.max * 0.25) {
            ui.notifications.cds.warning(`${actor.name} está gravemente ferido!`);
        }
    }
    
    /**
     * Aumenta mortalidade por violência
     * @param {Actor} source - Fonte da violência
     */
    static async increaseMortalityFromViolence(source) {
        if (source.system.linhagem) {
            await source.increaseMortality(1, "Ato de violência extrema");
        }
    }
}

/**
 * Obtém informações sobre caça
 * @param {number} mortality - Valor de mortalidade
 * @returns {Object} Informações sobre caça
 */
function getHuntInfo(mortality) {
    if (mortality >= 13) {
        return { necessaria: true, frequencia: "constantemente", penalidade: -3 };
    } else if (mortality >= 10) {
        return { necessaria: true, frequencia: "diariamente", penalidade: -3 };
    } else if (mortality >= 7) {
        return { necessaria: true, frequencia: "duas vezes por semana", penalidade: -2 };
    } else if (mortality >= 4) {
        return { necessaria: true, frequencia: "uma vez por semana", penalidade: -1 };
    } else {
        return { necessaria: false, frequencia: "nenhuma", penalidade: 0 };
    }
}

/**
 * Obtém penalidade de mortalidade
 * @param {number} mortality - Valor de mortalidade
 * @returns {number} Penalidade
 */
function getMortalityPenalty(mortality) {
    if (mortality >= 13) return -3;
    if (mortality >= 10) return -3;
    if (mortality >= 7) return -2;
    if (mortality >= 4) return -1;
    return 0;
}

/**
 * Obtém penalidade de ferimentos
 * @param {Object} conditions - Condições de ferimento
 * @returns {number} Penalidade total
 */
function getWoundPenalty(conditions) {
    if (conditions.incapacitado) return -10;
    if (conditions.aleijado) return -5;
    if (conditions.feridoGravemente) return -4;
    if (conditions.ferido) return -3;
    if (conditions.machucado) return -2;
    if (conditions.escoriado) return -1;
    return 0;
}

/**
 * Ativa um poder
 * @param {Actor} actor - O ator
 * @param {Item} power - O poder
 */
async function activatePower(actor, power) {
    // Implementa ativação automática de poderes
    const costs = power.system.custo;
    
    // Verifica se tem recursos suficientes
    if (costs.reservaDados > 0 && actor.system.reservaDados.value < costs.reservaDados) {
        return false;
    }
    
    // Aplica custos
    const updates = {};
    
    if (costs.reservaDados > 0) {
        updates['system.reservaDados.value'] = actor.system.reservaDados.value - costs.reservaDados;
    }
    
    if (costs.mortalidade > 0) {
        updates['system.mortalidade.value'] = actor.system.mortalidade.value + costs.mortalidade;
    }
    
    await actor.update(updates);
    
    ui.notifications.cds.info(`${actor.name} ativa ${power.name} automaticamente!`);
    
    return true;
}

// Exporta a classe para uso em outros módulos
window.CDS = window.CDS || {};
window.CDS.DamageApplication = DamageApplication;

