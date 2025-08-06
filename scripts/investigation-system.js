/**
 * Sistema de Investigação para Contrato de Sangue
 * Gerencia Pontos de Entendimento e automações de investigação
 */

// Hook para inicializar sistema de investigação
Hooks.once('ready', function() {
    console.log('Contrato de Sangue | Inicializando sistema de investigação...');
    
    // Registra hooks de investigação
    registerInvestigationHooks();
    
    // Registra comandos de chat para investigação
    registerInvestigationCommands();
    
    console.log('Contrato de Sangue | Sistema de investigação carregado!');
});

/**
 * Registra hooks relacionados à investigação
 */
function registerInvestigationHooks() {
    // Hook para rolagens de investigação
    Hooks.on('createChatMessage', (message) => {
        if (message.isRoll && message.speaker.actor) {
            const actor = game.actors.get(message.speaker.actor);
            if (actor && actor.system) {
                checkInvestigationRoll(message, actor);
            }
        }
    });
    
    // Hook para quando um ator é atualizado
    Hooks.on('updateActor', (actor, updateData, options, userId) => {
        if (updateData.system?.pontosEntendimento) {
            handleUnderstandingPointsChange(actor, updateData);
        }
    });
}

/**
 * Registra comandos de chat para investigação
 */
function registerInvestigationCommands() {
    Hooks.on('chatMessage', (chatLog, messageText, chatData) => {
        const parts = messageText.split(' ');
        const command = parts[0].toLowerCase();
        
        switch (command) {
            case '/investigar':
                handleInvestigateCommand(parts.slice(1));
                return false;
            case '/pista':
                handleClueCommand(parts.slice(1));
                return false;
            case '/conexao':
                handleConnectionCommand(parts.slice(1));
                return false;
            case '/entendimento':
                handleUnderstandingCommand(parts.slice(1));
                return false;
        }
    });
}

/**
 * Verifica rolagens de investigação
 * @param {ChatMessage} message - Mensagem de chat
 * @param {Actor} actor - Ator que fez a rolagem
 */
function checkInvestigationRoll(message, actor) {
    const roll = message.rolls[0];
    if (!roll) return;
    
    // Verifica se é uma rolagem de perícia de investigação
    const investigationSkills = ['investigacao', 'ocultismo', 'computadores', 'medicina'];
    const rollData = roll.data;
    
    // Analisa a fórmula da rolagem para identificar a perícia
    const formula = roll.formula;
    let skillUsed = null;
    
    for (const skill of investigationSkills) {
        if (formula.includes(`@pericias.${skill}`)) {
            skillUsed = skill;
            break;
        }
    }
    
    if (skillUsed) {
        handleInvestigationSkillRoll(actor, skillUsed, roll.total, message);
    }
}

/**
 * Manipula rolagem de perícia de investigação
 * @param {Actor} actor - O ator
 * @param {string} skill - Perícia usada
 * @param {number} total - Total da rolagem
 * @param {ChatMessage} message - Mensagem original
 */
async function handleInvestigationSkillRoll(actor, skill, total, message) {
    // Determina se a rolagem foi bem-sucedida o suficiente para gerar pontos
    let pointsGained = 0;
    
    if (total >= 18) {
        pointsGained = 3; // Sucesso excepcional
    } else if (total >= 15) {
        pointsGained = 2; // Sucesso notável
    } else if (total >= 12) {
        pointsGained = 1; // Sucesso básico
    }
    
    if (pointsGained > 0) {
        await actor.addUnderstandingPoints(pointsGained, `Rolagem de ${game.i18n.localize(`CDS.pericias.${skill}`)}`);
        
        // Adiciona informação à mensagem original
        const additionalContent = `
            <div class="cds-investigation-bonus">
                <p><strong>🔍 Investigação Bem-sucedida!</strong></p>
                <p>Ganhou ${pointsGained} Ponto(s) de Entendimento</p>
            </div>
        `;
        
        // Cria nova mensagem com o bônus
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            content: additionalContent
        });
    }
}

/**
 * Manipula mudanças nos Pontos de Entendimento
 * @param {Actor} actor - O ator
 * @param {Object} updateData - Dados da atualização
 */
function handleUnderstandingPointsChange(actor, updateData) {
    const newPoints = updateData.system.pontosEntendimento.value;
    const oldPoints = actor.system.pontosEntendimento.value;
    
    if (newPoints !== oldPoints) {
        const difference = newPoints - oldPoints;
        
        if (difference > 0) {
            ui.notifications.cds.success(`${actor.name} ganhou ${difference} Ponto(s) de Entendimento!`);
        } else {
            ui.notifications.cds.info(`${actor.name} gastou ${Math.abs(difference)} Ponto(s) de Entendimento.`);
        }
        
        // Verifica se atingiu marcos importantes
        checkUnderstandingMilestones(actor, newPoints);
    }
}

/**
 * Verifica marcos de entendimento
 * @param {Actor} actor - O ator
 * @param {number} points - Pontos atuais
 */
function checkUnderstandingMilestones(actor, points) {
    const maxPoints = actor.system.pontosEntendimento.max;
    const percentage = points / maxPoints;
    
    if (points === maxPoints) {
        ui.notifications.cds.success(`${actor.name} atingiu o máximo de Pontos de Entendimento! Compreensão total do mistério!`);
        
        // Pode desbloquear revelações especiais
        triggerMysteryRevelation(actor);
    } else if (percentage >= 0.75) {
        ui.notifications.cds.info(`${actor.name} está próximo de desvendar o mistério...`);
    } else if (percentage >= 0.5) {
        ui.notifications.cds.info(`${actor.name} começa a compreender a verdade por trás dos eventos.`);
    }
}

/**
 * Dispara revelação de mistério
 * @param {Actor} actor - O ator
 */
function triggerMysteryRevelation(actor) {
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: `
            <div class="cds-revelation">
                <h3>🌟 REVELAÇÃO COMPLETA 🌟</h3>
                <p><strong>${actor.name}</strong> desvendou completamente o mistério!</p>
                <p>Todas as peças do quebra-cabeças se encaixaram. A verdade é revelada em sua totalidade.</p>
                <p><em>O Mestre deve revelar todos os segredos restantes da investigação.</em></p>
            </div>
        `
    };
    
    ChatMessage.create(messageData);
}

/**
 * Manipula comando /investigar
 * @param {Array} args - Argumentos do comando
 */
function handleInvestigateCommand(args) {
    const actor = getSelectedActor();
    if (!actor) {
        ui.notifications.warn("Selecione um personagem primeiro.");
        return;
    }
    
    const location = args.join(' ') || 'local desconhecido';
    
    // Cria diálogo de investigação
    const dialogContent = `
        <form>
            <div class="form-group">
                <label>Local da Investigação:</label>
                <input type="text" name="location" value="${location}" />
            </div>
            <div class="form-group">
                <label>Perícia a usar:</label>
                <select name="skill">
                    <option value="investigacao">Investigação</option>
                    <option value="ocultismo">Ocultismo</option>
                    <option value="computadores">Computadores</option>
                    <option value="medicina">Medicina</option>
                    <option value="ciencias">Ciências</option>
                </select>
            </div>
            <div class="form-group">
                <label>Dificuldade:</label>
                <select name="difficulty">
                    <option value="8">Fácil (8)</option>
                    <option value="10" selected>Médio (10)</option>
                    <option value="12">Difícil (12)</option>
                    <option value="15">Extremo (15)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Gastar Pontos de Entendimento:</label>
                <select name="spendPoints">
                    <option value="0">Não gastar</option>
                    <option value="1">1 ponto (+1 bônus)</option>
                    <option value="3">3 pontos (+3 bônus)</option>
                    <option value="5">5 pontos (+5 bônus)</option>
                </select>
            </div>
        </form>
    `;
    
    new Dialog({
        title: "Investigação",
        content: dialogContent,
        buttons: {
            investigate: {
                label: "Investigar",
                callback: async (html) => {
                    const formData = new FormData(html[0].querySelector('form'));
                    const data = Object.fromEntries(formData);
                    
                    await performInvestigation(actor, data);
                }
            },
            cancel: {
                label: "Cancelar"
            }
        },
        default: "investigate"
    }).render(true);
}

/**
 * Realiza uma investigação
 * @param {Actor} actor - O ator
 * @param {Object} data - Dados da investigação
 */
async function performInvestigation(actor, data) {
    const skill = data.skill;
    const difficulty = parseInt(data.difficulty);
    const spendPoints = parseInt(data.spendPoints);
    const location = data.location;
    
    // Verifica se pode gastar os pontos
    if (spendPoints > 0) {
        if (actor.system.pontosEntendimento.value < spendPoints) {
            ui.notifications.warn("Pontos de Entendimento insuficientes!");
            return;
        }
        
        await actor.spendUnderstandingPoints(spendPoints, `Investigação em ${location}`);
    }
    
    // Faz a rolagem com bônus dos pontos gastos
    await actor.rollSkill(skill, spendPoints, difficulty);
    
    // Cria mensagem de investigação
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: `
            <div class="cds-investigation">
                <h3>🔍 INVESTIGAÇÃO 🔍</h3>
                <p><strong>Investigador:</strong> ${actor.name}</p>
                <p><strong>Local:</strong> ${location}</p>
                <p><strong>Método:</strong> ${game.i18n.localize(`CDS.pericias.${skill}`)}</p>
                ${spendPoints > 0 ? `<p><strong>Pontos Gastos:</strong> ${spendPoints} (+${spendPoints} bônus)</p>` : ''}
                <p><em>Procurando por pistas e evidências...</em></p>
            </div>
        `
    };
    
    ChatMessage.create(messageData);
}

/**
 * Manipula comando /pista
 * @param {Array} args - Argumentos do comando
 */
function handleClueCommand(args) {
    if (!game.user.isGM) {
        ui.notifications.warn("Apenas o Mestre pode criar pistas.");
        return;
    }
    
    const clueText = args.join(' ');
    if (!clueText) {
        ui.notifications.warn("Especifique o texto da pista.");
        return;
    }
    
    // Cria pista
    const messageData = {
        speaker: ChatMessage.getSpeaker(),
        content: `
            <div class="cds-clue">
                <h3>🔎 PISTA DESCOBERTA 🔎</h3>
                <p>${clueText}</p>
                <p><em>Esta informação pode ser importante para a investigação.</em></p>
            </div>
        `
    };
    
    ChatMessage.create(messageData);
}

/**
 * Manipula comando /conexao
 * @param {Array} args - Argumentos do comando
 */
function handleConnectionCommand(args) {
    const actor = getSelectedActor();
    if (!actor) {
        ui.notifications.warn("Selecione um personagem primeiro.");
        return;
    }
    
    const connectionText = args.join(' ');
    if (!connectionText) {
        ui.notifications.warn("Especifique a conexão descoberta.");
        return;
    }
    
    // Ganha 1 ponto de entendimento por fazer uma conexão
    actor.addUnderstandingPoints(1, "Conexão descoberta");
    
    const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: `
            <div class="cds-connection">
                <h3>🧩 CONEXÃO DESCOBERTA 🧩</h3>
                <p><strong>${actor.name}</strong> fez uma conexão importante:</p>
                <p><em>"${connectionText}"</em></p>
                <p><strong>Ganhou 1 Ponto de Entendimento!</strong></p>
            </div>
        `
    };
    
    ChatMessage.create(messageData);
}

/**
 * Manipula comando /entendimento
 * @param {Array} args - Argumentos do comando
 */
function handleUnderstandingCommand(args) {
    const actor = getSelectedActor();
    if (!actor) {
        ui.notifications.warn("Selecione um personagem primeiro.");
        return;
    }
    
    const action = args[0];
    const amount = parseInt(args[1]) || 1;
    
    switch (action) {
        case 'add':
        case 'adicionar':
            actor.addUnderstandingPoints(amount, "Comando manual");
            break;
        case 'spend':
        case 'gastar':
            actor.spendUnderstandingPoints(amount, "Comando manual");
            break;
        case 'reset':
        case 'resetar':
            actor.update({ 'system.pontosEntendimento.value': 0 });
            ui.notifications.info(`Pontos de Entendimento de ${actor.name} resetados.`);
            break;
        default:
            ui.notifications.info(`
                Comandos de Entendimento:
                /entendimento add [quantidade] - Adiciona pontos
                /entendimento gastar [quantidade] - Gasta pontos
                /entendimento reset - Reseta pontos para 0
            `);
            break;
    }
}

/**
 * Sistema de Revelações Progressivas
 */
export class RevelationSystem {
    /**
     * Cria uma nova revelação
     * @param {string} title - Título da revelação
     * @param {string} content - Conteúdo da revelação
     * @param {number} requiredPoints - Pontos necessários para desbloquear
     * @param {string} category - Categoria da revelação
     */
    static createRevelation(title, content, requiredPoints = 5, category = 'mystery') {
        const revelation = {
            id: foundry.utils.randomID(),
            title: title,
            content: content,
            requiredPoints: requiredPoints,
            category: category,
            unlocked: false,
            timestamp: Date.now()
        };
        
        // Armazena na flag do mundo
        const revelations = game.settings.get("contrato-de-sangue", "revelations") || [];
        revelations.push(revelation);
        game.settings.set("contrato-de-sangue", "revelations", revelations);
        
        return revelation;
    }
    
    /**
     * Verifica se um ator pode desbloquear revelações
     * @param {Actor} actor - O ator
     */
    static checkRevelations(actor) {
        const revelations = game.settings.get("contrato-de-sangue", "revelations") || [];
        const actorPoints = actor.system.pontosEntendimento.value;
        
        for (const revelation of revelations) {
            if (!revelation.unlocked && actorPoints >= revelation.requiredPoints) {
                this.unlockRevelation(actor, revelation);
            }
        }
    }
    
    /**
     * Desbloqueia uma revelação
     * @param {Actor} actor - O ator
     * @param {Object} revelation - A revelação
     */
    static unlockRevelation(actor, revelation) {
        revelation.unlocked = true;
        revelation.unlockedBy = actor.id;
        revelation.unlockedAt = Date.now();
        
        // Atualiza as revelações
        const revelations = game.settings.get("contrato-de-sangue", "revelations") || [];
        const index = revelations.findIndex(r => r.id === revelation.id);
        if (index !== -1) {
            revelations[index] = revelation;
            game.settings.set("contrato-de-sangue", "revelations", revelations);
        }
        
        // Cria mensagem de revelação
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            content: `
                <div class="cds-revelation">
                    <h3>💡 REVELAÇÃO DESBLOQUEADA 💡</h3>
                    <h4>${revelation.title}</h4>
                    <p>${revelation.content}</p>
                    <p><strong>Desbloqueada por:</strong> ${actor.name}</p>
                    <p><strong>Pontos necessários:</strong> ${revelation.requiredPoints}</p>
                </div>
            `
        };
        
        ChatMessage.create(messageData);
        
        ui.notifications.cds.success(`Revelação desbloqueada: ${revelation.title}`);
    }
    
    /**
     * Lista todas as revelações desbloqueadas
     */
    static showRevelations() {
        const revelations = game.settings.get("contrato-de-sangue", "revelations") || [];
        const unlockedRevelations = revelations.filter(r => r.unlocked);
        
        if (unlockedRevelations.length === 0) {
            ui.notifications.info("Nenhuma revelação foi desbloqueada ainda.");
            return;
        }
        
        let content = "<h3>Revelações Desbloqueadas</h3>";
        for (const revelation of unlockedRevelations) {
            content += `
                <div class="revelation-entry">
                    <h4>${revelation.title}</h4>
                    <p>${revelation.content}</p>
                    <small>Desbloqueada em ${new Date(revelation.unlockedAt).toLocaleString()}</small>
                </div>
                <hr>
            `;
        }
        
        new Dialog({
            title: "Revelações da Investigação",
            content: content,
            buttons: {
                close: {
                    label: "Fechar"
                }
            }
        }).render(true);
    }
}

/**
 * Obtém o ator selecionado
 * @returns {Actor|null} O ator selecionado
 */
function getSelectedActor() {
    if (canvas.tokens.controlled.length > 0) {
        return canvas.tokens.controlled[0].actor;
    }
    
    const activeSheet = Object.values(ui.windows).find(w => 
        w instanceof ActorSheet && w.rendered
    );
    
    return activeSheet ? activeSheet.actor : null;
}

// Registra configurações do sistema de investigação
Hooks.once('init', function() {
    game.settings.register("contrato-de-sangue", "revelations", {
        scope: "world",
        config: false,
        type: Array,
        default: []
    });
});

// Exporta classes para uso global
window.CDS = window.CDS || {};
window.CDS.RevelationSystem = RevelationSystem;

