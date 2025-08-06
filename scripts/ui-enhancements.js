/**
 * Melhorias de Interface para o sistema Contrato de Sangue
 * Adiciona funcionalidades avançadas de UI/UX
 */

// Hook para inicializar melhorias de interface
Hooks.once('ready', function() {
    console.log('Contrato de Sangue | Inicializando melhorias de interface...');
    
    // Inicializa componentes de interface
    initializeNotificationSystem();
    initializeTooltips();
    initializeDragAndDrop();
    initializeAnimations();
    initializeKeyboardShortcuts();
    
    console.log('Contrato de Sangue | Melhorias de interface carregadas!');
});

/**
 * Sistema de Notificações Customizado
 */
function initializeNotificationSystem() {
    // Sobrescreve o sistema de notificações padrão para o estilo do sistema
    const originalNotify = ui.notifications.notify;
    
    ui.notifications.notify = function(message, type = "info", options = {}) {
        showCustomNotification(message, type, options);
        return originalNotify.call(this, message, type, options);
    };
    
    // Adiciona método para notificações específicas do sistema
    ui.notifications.cds = {
        info: (message, options = {}) => showCustomNotification(message, "info", options),
        success: (message, options = {}) => showCustomNotification(message, "success", options),
        warning: (message, options = {}) => showCustomNotification(message, "warning", options),
        error: (message, options = {}) => showCustomNotification(message, "error", options),
        mortality: (message, options = {}) => showCustomNotification(message, "mortality", options),
        hunt: (message, options = {}) => showCustomNotification(message, "hunt", options)
    };
}

/**
 * Mostra uma notificação customizada
 */
function showCustomNotification(message, type = "info", options = {}) {
    const notification = document.createElement('div');
    notification.className = `cds-notification ${type}`;
    
    // Adiciona ícone baseado no tipo
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">${icon}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove a notificação após o tempo especificado
    const duration = options.duration || 4000;
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, duration);
}

/**
 * Obtém o ícone para o tipo de notificação
 */
function getNotificationIcon(type) {
    const icons = {
        info: "ℹ️",
        success: "✅",
        warning: "⚠️",
        error: "❌",
        mortality: "💀",
        hunt: "🩸"
    };
    return icons[type] || icons.info;
}

/**
 * Inicializa sistema de tooltips
 */
function initializeTooltips() {
    // Adiciona tooltips dinâmicos para elementos do sistema
    document.addEventListener('mouseover', function(event) {
        const element = event.target;
        
        // Tooltips para perícias
        if (element.classList.contains('skill-name')) {
            const skillKey = element.dataset.skill;
            if (skillKey) {
                const tooltip = getSkillTooltip(skillKey);
                element.setAttribute('data-tooltip', tooltip);
                element.classList.add('tooltip');
            }
        }
        
        // Tooltips para vantagens
        if (element.classList.contains('advantage-name')) {
            const advantageName = element.textContent;
            const tooltip = getAdvantageTooltip(advantageName);
            element.setAttribute('data-tooltip', tooltip);
            element.classList.add('tooltip');
        }
        
        // Tooltips para dados da reserva
        if (element.classList.contains('dice-icon')) {
            const tooltip = getDiceTooltip(element);
            element.setAttribute('data-tooltip', tooltip);
            element.classList.add('tooltip');
        }
    });
}

/**
 * Obtém tooltip para perícias
 */
function getSkillTooltip(skillKey) {
    const tooltips = {
        atletismo: "Força física, escalada, natação, corrida",
        briga: "Combate desarmado, artes marciais",
        conducao: "Dirigir veículos, pilotar",
        furtividade: "Mover-se sem ser detectado, esconder-se",
        sobrevivencia: "Vida selvagem, rastreamento, orientação",
        computadores: "Hacking, programação, sistemas digitais",
        investigacao: "Buscar pistas, analisar evidências",
        medicina: "Primeiros socorros, diagnósticos, cirurgia",
        ocultismo: "Conhecimento sobrenatural, rituais",
        ciencias: "Conhecimento científico geral",
        empatia: "Ler emoções, compreender motivações",
        expressao: "Arte, performance, criatividade",
        intimidacao: "Ameaçar, coagir, causar medo",
        persuasao: "Convencer, negociar, influenciar",
        subterfugio: "Mentir, enganar, manipular",
        armasBrancas: "Combate com espadas, facas, etc.",
        armasDeFogo: "Combate com pistolas, rifles, etc.",
        defesa: "Esquivar, bloquear, resistir a ataques"
    };
    return tooltips[skillKey] || "Perícia do sistema";
}

/**
 * Obtém tooltip para vantagens
 */
function getAdvantageTooltip(advantageName) {
    // Implementar tooltips específicos para vantagens
    return `${advantageName}: Clique para mais detalhes`;
}

/**
 * Obtém tooltip para dados da reserva
 */
function getDiceTooltip(diceElement) {
    if (diceElement.classList.contains('used')) {
        return "Dado já utilizado - recupere através de descanso ou alimentação";
    } else if (diceElement.classList.contains('sacred')) {
        return "Dado Sagrado - Role 1d6, adicione metade do resultado (sem consequências)";
    } else if (diceElement.classList.contains('umbral')) {
        return "Dado Umbral - Role 1d6, adicione o resultado completo (+1 Bestialidade, -1 Humanidade)";
    } else {
        return "Dado da Reserva - Clique para usar como Sagrado ou Umbral";
    }
}

/**
 * Inicializa sistema de drag & drop
 */
function initializeDragAndDrop() {
    // Adiciona funcionalidade de drag & drop para itens
    document.addEventListener('dragstart', function(event) {
        if (event.target.classList.contains('item-entry')) {
            event.target.classList.add('dragging');
            event.dataTransfer.setData('text/plain', event.target.dataset.itemId);
        }
    });
    
    document.addEventListener('dragend', function(event) {
        if (event.target.classList.contains('item-entry')) {
            event.target.classList.remove('dragging');
        }
    });
    
    document.addEventListener('dragover', function(event) {
        if (event.target.classList.contains('drop-zone')) {
            event.preventDefault();
            event.target.classList.add('drag-over');
        }
    });
    
    document.addEventListener('dragleave', function(event) {
        if (event.target.classList.contains('drop-zone')) {
            event.target.classList.remove('drag-over');
        }
    });
    
    document.addEventListener('drop', function(event) {
        if (event.target.classList.contains('drop-zone')) {
            event.preventDefault();
            event.target.classList.remove('drag-over');
            
            const itemId = event.dataTransfer.getData('text/plain');
            handleItemDrop(itemId, event.target);
        }
    });
}

/**
 * Manipula o drop de itens
 */
function handleItemDrop(itemId, dropZone) {
    // Implementar lógica de drop baseada no tipo de zona
    const zoneType = dropZone.dataset.dropType;
    
    switch (zoneType) {
        case 'equipment':
            equipItem(itemId);
            break;
        case 'inventory':
            moveToInventory(itemId);
            break;
        case 'trash':
            deleteItem(itemId);
            break;
    }
}

/**
 * Inicializa animações
 */
function initializeAnimations() {
    // Adiciona animações de entrada para elementos
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.5s ease';
            }
        });
    });
    
    // Observa elementos que devem ser animados
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // Adiciona efeito de glitch em elementos críticos
    setInterval(() => {
        const criticalElements = document.querySelectorAll('.critical-status');
        criticalElements.forEach(el => {
            if (Math.random() < 0.1) { // 10% de chance
                el.classList.add('glitch-effect');
                setTimeout(() => {
                    el.classList.remove('glitch-effect');
                }, 300);
            }
        });
    }, 2000);
}

/**
 * Inicializa atalhos de teclado
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Verifica se uma ficha está aberta
        const activeSheet = document.querySelector('.contrato-de-sangue.sheet.actor');
        if (!activeSheet) return;
        
        // Atalhos apenas se Ctrl estiver pressionado
        if (!event.ctrlKey) return;
        
        switch (event.key.toLowerCase()) {
            case 'r':
                event.preventDefault();
                openSkillRollDialog();
                break;
            case 's':
                event.preventDefault();
                useSacredDie();
                break;
            case 'u':
                event.preventDefault();
                useUmbralDie();
                break;
            case 'i':
                event.preventDefault();
                rollInitiative();
                break;
            case 'h':
                event.preventDefault();
                showHelpDialog();
                break;
        }
    });
}

/**
 * Abre diálogo de rolagem de perícia
 */
function openSkillRollDialog() {
    const actor = getActiveActor();
    if (!actor) return;
    
    const skills = Object.keys(actor.system.pericias);
    const skillOptions = skills.map(skill => 
        `<option value="${skill}">${game.i18n.localize(`CDS.pericias.${skill}`)}</option>`
    ).join('');
    
    const dialogContent = `
        <form>
            <div class="form-group">
                <label>Perícia:</label>
                <select name="skill">${skillOptions}</select>
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
    `;
    
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
}

/**
 * Usa um Dado Sagrado via atalho
 */
function useSacredDie() {
    const actor = getActiveActor();
    if (actor) {
        actor.useSacredDie();
    }
}

/**
 * Usa um Dado Umbral via atalho
 */
function useUmbralDie() {
    const actor = getActiveActor();
    if (actor) {
        actor.useUmbralDie();
    }
}

/**
 * Rola iniciativa via atalho
 */
function rollInitiative() {
    const actor = getActiveActor();
    if (actor) {
        actor.rollInitiative();
    }
}

/**
 * Mostra diálogo de ajuda
 */
function showHelpDialog() {
    const helpContent = `
        <div class="cds-help">
            <h3>Atalhos de Teclado</h3>
            <ul>
                <li><strong>Ctrl + R:</strong> Rolagem rápida de perícia</li>
                <li><strong>Ctrl + S:</strong> Usar Dado Sagrado</li>
                <li><strong>Ctrl + U:</strong> Usar Dado Umbral</li>
                <li><strong>Ctrl + I:</strong> Rolar iniciativa</li>
                <li><strong>Ctrl + H:</strong> Mostrar esta ajuda</li>
            </ul>
            
            <h3>Dicas de Interface</h3>
            <ul>
                <li>Passe o mouse sobre elementos para ver tooltips</li>
                <li>Arraste itens para equipar ou mover</li>
                <li>Clique nos dados da reserva para usá-los</li>
                <li>Use o botão direito para opções avançadas</li>
            </ul>
            
            <h3>Sistema de Jogo</h3>
            <ul>
                <li><strong>Balança Eterna:</strong> Humanidade + Bestialidade = 12</li>
                <li><strong>Reserva de Dados:</strong> Bestialidade + 1</li>
                <li><strong>Dados Sagrados:</strong> 1d6 ÷ 2 (sem consequências)</li>
                <li><strong>Dados Umbrais:</strong> 1d6 completo (+1 Bestialidade)</li>
            </ul>
        </div>
    `;
    
    new Dialog({
        title: "Ajuda - Contrato de Sangue",
        content: helpContent,
        buttons: {
            close: {
                label: "Fechar"
            }
        }
    }).render(true);
}

/**
 * Obtém o ator ativo
 */
function getActiveActor() {
    if (canvas.tokens.controlled.length > 0) {
        return canvas.tokens.controlled[0].actor;
    }
    
    const activeSheet = Object.values(ui.windows).find(w => 
        w instanceof ActorSheet && w.rendered
    );
    
    return activeSheet ? activeSheet.actor : null;
}

/**
 * Adiciona efeitos visuais para rolagens
 */
Hooks.on('createChatMessage', (message) => {
    if (message.isRoll && message.speaker.actor) {
        // Adiciona efeitos visuais baseados no resultado
        const roll = message.rolls[0];
        if (roll) {
            const total = roll.total;
            const diceResult = roll.dice[0]?.results[0]?.result;
            
            // Efeito especial para rolagens críticas (12 no d12)
            if (diceResult === 12) {
                showCriticalEffect();
            }
            
            // Efeito especial para falhas críticas (1 no d12)
            if (diceResult === 1) {
                showFailureEffect();
            }
        }
    }
});

/**
 * Mostra efeito visual para acerto crítico
 */
function showCriticalEffect() {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        color: #FFD700;
        text-shadow: 0 0 20px #FFD700;
        z-index: 10000;
        pointer-events: none;
        animation: criticalPulse 1s ease-out;
    `;
    effect.textContent = '⚡ CRÍTICO! ⚡';
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

/**
 * Mostra efeito visual para falha crítica
 */
function showFailureEffect() {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        color: #FF0000;
        text-shadow: 0 0 20px #FF0000;
        z-index: 10000;
        pointer-events: none;
        animation: failureShake 1s ease-out;
    `;
    effect.textContent = '💀 FALHA CRÍTICA! 💀';
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

// Adiciona animações CSS para os efeitos
const style = document.createElement('style');
style.textContent = `
    @keyframes criticalPulse {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
    
    @keyframes failureShake {
        0%, 100% { transform: translate(-50%, -50%); }
        10%, 30%, 50%, 70%, 90% { transform: translate(-52%, -50%); }
        20%, 40%, 60%, 80% { transform: translate(-48%, -50%); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);

