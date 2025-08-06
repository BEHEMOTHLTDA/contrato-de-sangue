/**
 * Macros Úteis para o Sistema Contrato de Sangue
 * Coleção de macros que facilitam o uso do sistema
 */

/**
 * Macro: Rolagem Rápida de Perícia
 */
const MACRO_QUICK_SKILL_ROLL = `
// Macro: Rolagem Rápida de Perícia
const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
if (!actor) {
    ui.notifications.warn("Selecione um personagem primeiro.");
    return;
}

const skills = Object.keys(actor.system.pericias);
const skillOptions = skills.map(skill => 
    \`<option value="\${skill}">\${game.i18n.localize(\`CDS.pericias.\${skill}\`)}</option>\`
).join('');

const dialogContent = \`
    <form>
        <div class="form-group">
            <label>Perícia:</label>
            <select name="skill">\${skillOptions}</select>
        </div>
        <div class="form-group">
            <label>Modificador:</label>
            <input type="number" name="modifier" value="0" />
        </div>
        <div class="form-group">
            <label>Dificuldade:</label>
            <select name="difficulty">
                <option value="">Sem dificuldade específica</option>
                <option value="5">Trivial (5)</option>
                <option value="8">Fácil (8)</option>
                <option value="10">Médio (10)</option>
                <option value="12">Difícil (12)</option>
                <option value="15">Extremo (15)</option>
                <option value="18">Lendário (18)</option>
            </select>
        </div>
    </form>
\`;

new Dialog({
    title: "Rolagem Rápida de Perícia",
    content: dialogContent,
    buttons: {
        roll: {
            label: "Rolar",
            callback: (html) => {
                const skill = html.find('[name="skill"]').val();
                const modifier = parseInt(html.find('[name="modifier"]').val()) || 0;
                const difficulty = parseInt(html.find('[name="difficulty"]').val()) || null;
                actor.rollSkill(skill, modifier, difficulty);
            }
        },
        cancel: {
            label: "Cancelar"
        }
    },
    default: "roll"
}).render(true);
`;

/**
 * Macro: Usar Dado Sagrado
 */
const MACRO_USE_SACRED_DIE = `
// Macro: Usar Dado Sagrado
const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
if (!actor) {
    ui.notifications.warn("Selecione um personagem primeiro.");
    return;
}

actor.useSacredDie();
`;

/**
 * Macro: Usar Dado Umbral
 */
const MACRO_USE_UMBRAL_DIE = `
// Macro: Usar Dado Umbral
const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
if (!actor) {
    ui.notifications.warn("Selecione um personagem primeiro.");
    return;
}

// Confirma o uso devido às consequências
Dialog.confirm({
    title: "Usar Dado Umbral",
    content: \`
        <p><strong>Atenção!</strong> Usar um Dado Umbral terá as seguintes consequências:</p>
        <ul>
            <li>Você rolará 1d6 e adicionará o resultado completo</li>
            <li>Sua Bestialidade aumentará permanentemente em 1</li>
            <li>Sua Humanidade diminuirá permanentemente em 1</li>
        </ul>
        <p>Deseja continuar?</p>
    \`,
    yes: () => actor.useUmbralDie(),
    no: () => {}
});
`;

/**
 * Macro: Aplicar Dano
 */
const MACRO_APPLY_DAMAGE = `
// Macro: Aplicar Dano
const targets = canvas.tokens.controlled;
if (targets.length === 0) {
    ui.notifications.warn("Selecione os alvos que receberão dano.");
    return;
}

const dialogContent = \`
    <form>
        <div class="form-group">
            <label>Quantidade de Dano:</label>
            <input type="number" name="damage" value="1" min="0" />
        </div>
        <div class="form-group">
            <label>Tipo de Dano:</label>
            <select name="damageType">
                <option value="contusivo">Contusivo</option>
                <option value="letal" selected>Letal</option>
                <option value="agravado">Agravado</option>
            </select>
        </div>
    </form>
\`;

new Dialog({
    title: "Aplicar Dano",
    content: dialogContent,
    buttons: {
        apply: {
            label: "Aplicar",
            callback: (html) => {
                const damage = parseInt(html.find('[name="damage"]').val()) || 0;
                const damageType = html.find('[name="damageType"]').val();
                
                for (const token of targets) {
                    if (token.actor) {
                        window.CDS.DamageApplication.applyDamage(token.actor, damage, damageType);
                    }
                }
            }
        },
        cancel: {
            label: "Cancelar"
        }
    },
    default: "apply"
}).render(true);
`;

/**
 * Macro: Realizar Caça
 */
const MACRO_PERFORM_HUNT = `
// Macro: Realizar Caça
const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
if (!actor) {
    ui.notifications.warn("Selecione um personagem primeiro.");
    return;
}

const dialogContent = \`
    <form>
        <div class="form-group">
            <label>Redução de Mortalidade:</label>
            <input type="number" name="reduction" value="1" min="1" />
        </div>
        <div class="form-group">
            <label>Descrição da caça:</label>
            <textarea name="description" placeholder="Descreva como a caça foi realizada..."></textarea>
        </div>
    </form>
\`;

new Dialog({
    title: "Realizar Caça",
    content: dialogContent,
    buttons: {
        hunt: {
            label: "Caçar",
            callback: (html) => {
                const reduction = parseInt(html.find('[name="reduction"]').val()) || 1;
                const description = html.find('[name="description"]').val();
                
                actor.performHunt(reduction);
                
                if (description) {
                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ actor: actor }),
                        content: \`
                            <div class="cds-hunt-description">
                                <h3>🩸 DESCRIÇÃO DA CAÇA 🩸</h3>
                                <p><strong>\${actor.name}</strong> realizou uma caça:</p>
                                <p><em>"\${description}"</em></p>
                            </div>
                        \`
                    });
                }
            }
        },
        cancel: {
            label: "Cancelar"
        }
    },
    default: "hunt"
}).render(true);
`;

/**
 * Macro: Status do Personagem
 */
const MACRO_CHARACTER_STATUS = `
// Macro: Status do Personagem
const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
if (!actor) {
    ui.notifications.warn("Selecione um personagem primeiro.");
    return;
}

const system = actor.system;
const mortalityPenalty = game.contratoDeSangue.getMortalityPenalty(system.mortalidade.value);
const woundPenalty = game.contratoDeSangue.getWoundPenalty(system.health.conditions);
const totalPenalty = mortalityPenalty + woundPenalty;

// Determina condição geral
let condition = "Saudável";
let conditionColor = "#00FF00";

if (system.health.value <= 0) {
    condition = "Incapacitado";
    conditionColor = "#800080";
} else if (system.health.value <= system.health.max * 0.25) {
    condition = "Crítico";
    conditionColor = "#FF0000";
} else if (system.health.value <= system.health.max * 0.5) {
    condition = "Ferido";
    conditionColor = "#FFFF00";
} else if (totalPenalty < -2) {
    condition = "Debilitado";
    conditionColor = "#FFA500";
}

const statusContent = \`
    <div class="cds-status-report">
        <h3>📊 STATUS DE \${actor.name.toUpperCase()} 📊</h3>
        
        <div class="status-section">
            <h4>Condição Geral</h4>
            <p style="color: \${conditionColor}; font-weight: bold;">\${condition}</p>
        </div>
        
        <div class="status-section">
            <h4>Atributos Principais</h4>
            <p><strong>Humanidade:</strong> \${system.humanidade.value}/12</p>
            <p><strong>Bestialidade:</strong> \${system.bestialidade.value}/12</p>
            <p><strong>Mortalidade:</strong> \${system.mortalidade.value}</p>
        </div>
        
        <div class="status-section">
            <h4>Recursos</h4>
            <p><strong>Vida:</strong> \${system.health.value}/\${system.health.max}</p>
            <p><strong>Reserva de Dados:</strong> \${system.reservaDados.value}/\${system.reservaDados.max}</p>
            <p><strong>Pontos de Entendimento:</strong> \${system.pontosEntendimento.value}/\${system.pontosEntendimento.max}</p>
        </div>
        
        <div class="status-section">
            <h4>Penalidades</h4>
            <p><strong>Mortalidade:</strong> \${mortalityPenalty}</p>
            <p><strong>Ferimentos:</strong> \${woundPenalty}</p>
            <p><strong>Total:</strong> \${totalPenalty}</p>
        </div>
        
        <div class="status-section">
            <h4>Condições Ativas</h4>
            \${Object.entries(system.health.conditions)
                .filter(([key, value]) => value)
                .map(([key, value]) => \`<p>• \${key.charAt(0).toUpperCase() + key.slice(1)}</p>\`)
                .join('') || '<p><em>Nenhuma condição ativa</em></p>'}
        </div>
    </div>
\`;

ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: statusContent
});
`;

/**
 * Macro: Investigação Rápida
 */
const MACRO_QUICK_INVESTIGATION = `
// Macro: Investigação Rápida
const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
if (!actor) {
    ui.notifications.warn("Selecione um personagem primeiro.");
    return;
}

const dialogContent = \`
    <form>
        <div class="form-group">
            <label>O que está investigando?</label>
            <input type="text" name="target" placeholder="Ex: Cena do crime, documento suspeito..." />
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
            <label>Gastar Pontos de Entendimento:</label>
            <select name="spendPoints">
                <option value="0">Não gastar</option>
                <option value="1">1 ponto (+1 bônus)</option>
                <option value="3">3 pontos (+3 bônus)</option>
                <option value="5">5 pontos (+5 bônus)</option>
            </select>
        </div>
    </form>
\`;

new Dialog({
    title: "Investigação Rápida",
    content: dialogContent,
    buttons: {
        investigate: {
            label: "Investigar",
            callback: async (html) => {
                const target = html.find('[name="target"]').val() || "algo misterioso";
                const skill = html.find('[name="skill"]').val();
                const spendPoints = parseInt(html.find('[name="spendPoints"]').val()) || 0;
                
                // Verifica se pode gastar os pontos
                if (spendPoints > 0) {
                    if (actor.system.pontosEntendimento.value < spendPoints) {
                        ui.notifications.warn("Pontos de Entendimento insuficientes!");
                        return;
                    }
                    
                    await actor.spendUnderstandingPoints(spendPoints, \`Investigação: \${target}\`);
                }
                
                // Faz a rolagem
                await actor.rollSkill(skill, spendPoints, 10);
                
                // Cria mensagem de investigação
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor: actor }),
                    content: \`
                        <div class="cds-investigation">
                            <h3>🔍 INVESTIGAÇÃO 🔍</h3>
                            <p><strong>\${actor.name}</strong> investiga: <em>\${target}</em></p>
                            <p><strong>Método:</strong> \${game.i18n.localize(\`CDS.pericias.\${skill}\`)}</p>
                            \${spendPoints > 0 ? \`<p><strong>Pontos Gastos:</strong> \${spendPoints} (+\${spendPoints} bônus)</p>\` : ''}
                        </div>
                    \`
                });
            }
        },
        cancel: {
            label: "Cancelar"
        }
    },
    default: "investigate"
}).render(true);
`;

/**
 * Função para criar todas as macros
 */
export async function createSystemMacros() {
    console.log('Contrato de Sangue | Criando macros do sistema...');
    
    const macros = [
        {
            name: "CDS - Rolagem Rápida",
            type: "script",
            command: MACRO_QUICK_SKILL_ROLL,
            img: "icons/dice/d12black.svg",
            folder: null
        },
        {
            name: "CDS - Dado Sagrado",
            type: "script",
            command: MACRO_USE_SACRED_DIE,
            img: "icons/magic/holy/angel-wings-blue.svg",
            folder: null
        },
        {
            name: "CDS - Dado Umbral",
            type: "script",
            command: MACRO_USE_UMBRAL_DIE,
            img: "icons/magic/unholy/strike-body-explode-disintegrate.svg",
            folder: null
        },
        {
            name: "CDS - Aplicar Dano",
            type: "script",
            command: MACRO_APPLY_DAMAGE,
            img: "icons/skills/wounds/blood-spurt-spray-red.svg",
            folder: null
        },
        {
            name: "CDS - Realizar Caça",
            type: "script",
            command: MACRO_PERFORM_HUNT,
            img: "icons/creatures/abilities/mouth-teeth-rows-red.svg",
            folder: null
        },
        {
            name: "CDS - Status do Personagem",
            type: "script",
            command: MACRO_CHARACTER_STATUS,
            img: "icons/magic/perception/eye-ringed-glow-black.svg",
            folder: null
        },
        {
            name: "CDS - Investigação Rápida",
            type: "script",
            command: MACRO_QUICK_INVESTIGATION,
            img: "icons/tools/scribal/magnifying-glass.svg",
            folder: null
        }
    ];
    
    // Cria pasta para as macros se não existir
    let folder = game.folders.find(f => f.name === "Contrato de Sangue" && f.type === "Macro");
    if (!folder) {
        folder = await Folder.create({
            name: "Contrato de Sangue",
            type: "Macro",
            color: "#8B0000"
        });
    }
    
    // Cria as macros
    for (const macroData of macros) {
        const existingMacro = game.macros.find(m => m.name === macroData.name);
        if (!existingMacro) {
            macroData.folder = folder.id;
            await Macro.create(macroData);
        }
    }
    
    console.log('Contrato de Sangue | Macros criadas com sucesso!');
    ui.notifications.cds.success("Macros do sistema Contrato de Sangue criadas!");
}

// Hook para criar macros quando o mundo é carregado
Hooks.once('ready', async function() {
    // Só cria macros se for GM e se não existirem ainda
    if (game.user.isGM) {
        const existingMacros = game.macros.filter(m => m.name.startsWith("CDS -"));
        if (existingMacros.length === 0) {
            await createSystemMacros();
        }
    }
});

// Comando de chat para recriar macros
Hooks.on('chatMessage', (chatLog, messageText, chatData) => {
    if (messageText === '/cds-create-macros' && game.user.isGM) {
        createSystemMacros();
        return false;
    }
});

