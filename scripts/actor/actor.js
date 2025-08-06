/**
 * Classe do Ator para o sistema Contrato de Sangue
 * Estende a classe Actor do Foundry VTT com funcionalidades específicas do sistema
 */
export class ContratoDeSangueActor extends Actor {

    /**
     * Prepara os dados do ator para renderização
     */
    prepareData() {
        super.prepareData();
        
        const actorData = this;
        const systemData = actorData.system;
        const flags = actorData.flags.contratoDeSangue || {};

        // Aplica preparações específicas por tipo de ator
        if (actorData.type === 'personagem') {
            this._prepareCharacterData(actorData);
        }
    }

    /**
     * Prepara dados específicos de personagem
     * @param {Object} actorData - Dados do ator
     */
    _prepareCharacterData(actorData) {
        const system = actorData.system;

        // Garante que a Balança Eterna seja respeitada
        this._enforceEternalBalance(system);

        // Calcula a reserva de dados máxima
        system.reservaDados.max = system.bestialidade.value + 1;

        // Garante que a reserva atual não exceda o máximo
        if (system.reservaDados.value > system.reservaDados.max) {
            system.reservaDados.value = system.reservaDados.max;
        }

        // Calcula penalidades
        system.penalidades = {
            mortalidade: this._getMortalityPenalty(system.mortalidade.value),
            ferimentos: this._getWoundPenalty(system.health.conditions),
            total: 0
        };
        system.penalidades.total = system.penalidades.mortalidade + system.penalidades.ferimentos;

        // Determina a frequência de caça necessária
        system.cacaFrequencia = this._getCacaFrequencia(system.mortalidade.value);

        // Calcula pontos de entendimento máximos para investigações
        const investigacao = system.pericias.investigacao || 0;
        const ocultismo = system.pericias.ocultismo || 0;
        system.pontosEntendimento.max = investigacao + ocultismo;
    }

    /**
     * Garante que a Balança Eterna seja respeitada (Humanidade + Bestialidade = 12)
     * @param {Object} system - Dados do sistema do ator
     */
    _enforceEternalBalance(system) {
        const total = system.humanidade.value + system.bestialidade.value;
        
        if (total !== 12) {
            // Se o total não é 12, ajusta a humanidade para manter o equilíbrio
            system.humanidade.value = 12 - system.bestialidade.value;
            
            // Garante que os valores estejam dentro dos limites
            if (system.humanidade.value < 0) {
                system.humanidade.value = 0;
                system.bestialidade.value = 12;
            } else if (system.humanidade.value > 12) {
                system.humanidade.value = 12;
                system.bestialidade.value = 0;
            }
        }
    }

    /**
     * Calcula a penalidade de mortalidade
     * @param {number} mortality - Valor de mortalidade
     * @returns {number} Penalidade aplicada
     */
    _getMortalityPenalty(mortality) {
        if (mortality >= 13) return -3; // Perde controle
        if (mortality >= 10) return -3; // -3 diariamente
        if (mortality >= 7) return -2;  // -2 duas vezes por semana
        if (mortality >= 4) return -1;  // -1 uma vez por semana
        return 0; // Sem penalidade
    }

    /**
     * Calcula a penalidade de ferimentos
     * @param {Object} conditions - Condições de ferimento
     * @returns {number} Penalidade total de ferimentos
     */
    _getWoundPenalty(conditions) {
        if (conditions.incapacitado) return -10; // Praticamente impossível agir
        if (conditions.aleijado) return -5;
        if (conditions.feridoGravemente) return -4;
        if (conditions.ferido) return -3;
        if (conditions.machucado) return -2;
        if (conditions.escoriado) return -1;
        return 0;
    }

    /**
     * Determina a frequência de caça necessária baseada na mortalidade
     * @param {number} mortality - Valor de mortalidade
     * @returns {Object} Informações sobre a caça
     */
    _getCacaFrequencia(mortality) {
        if (mortality >= 13) {
            return { necessaria: true, frequencia: "constantemente" };
        } else if (mortality >= 10) {
            return { necessaria: true, frequencia: "diariamente" };
        } else if (mortality >= 7) {
            return { necessaria: true, frequencia: "duas vezes por semana" };
        } else if (mortality >= 4) {
            return { necessaria: true, frequencia: "uma vez por semana" };
        } else {
            return { necessaria: false, frequencia: "nenhuma" };
        }
    }

    /**
     * Rola uma perícia
     * @param {string} skillName - Nome da perícia
     * @param {number} modifier - Modificador adicional
     * @param {number} difficulty - Dificuldade da rolagem
     */
    async rollSkill(skillName, modifier = 0, difficulty = null) {
        return game.contratoDeSangue.rollSkill(this, skillName, modifier, difficulty);
    }

    /**
     * Rola iniciativa
     */
    async rollInitiative() {
        return game.contratoDeSangue.rollInitiative(this);
    }

    /**
     * Rola ataque
     * @param {string} weaponType - Tipo de arma
     * @param {number} weaponDamage - Dano da arma
     * @param {number} difficulty - Dificuldade do ataque
     */
    async rollAttack(weaponType = 'armasBrancas', weaponDamage = 0, difficulty = 10) {
        return game.contratoDeSangue.rollAttack(this, weaponType, weaponDamage, difficulty);
    }

    /**
     * Rola defesa
     */
    async rollDefense() {
        return game.contratoDeSangue.rollDefense(this);
    }

    /**
     * Usa um Dado Sagrado
     */
    async useSacredDie() {
        return game.contratoDeSangue.useSacredDie(this);
    }

    /**
     * Usa um Dado Umbral
     */
    async useUmbralDie() {
        return game.contratoDeSangue.useUmbralDie(this);
    }

    /**
     * Recupera dados da reserva
     * @param {number} amount - Quantidade de dados a recuperar
     */
    async recoverReserveDice(amount = 1) {
        const currentReserve = this.system.reservaDados.value;
        const maxReserve = this.system.reservaDados.max;
        const newReserve = Math.min(maxReserve, currentReserve + amount);
        
        await this.update({
            'system.reservaDados.value': newReserve
        });
        
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this }),
            content: `
                <div class="cds-recovery">
                    <strong>Recuperação de Reserva</strong>
                    <p>Recuperou ${amount} dado(s). Reserva atual: ${newReserve}/${maxReserve}</p>
                </div>
            `
        };
        
        ChatMessage.create(messageData);
        
        ui.notifications.info(`Reserva de dados recuperada: ${newReserve}/${maxReserve}`);
    }

    /**
     * Aplica dano ao personagem
     * @param {number} damage - Quantidade de dano
     * @param {string} type - Tipo de dano (contusivo, letal, agravado)
     */
    async applyDamage(damage, type = 'letal') {
        const currentHealth = this.system.health.value;
        const newHealth = Math.max(0, currentHealth - damage);
        
        await this.update({
            'system.health.value': newHealth
        });
        
        // Atualiza condições de ferimento se a automação estiver ativada
        if (game.settings.get("contrato-de-sangue", "autoWounds")) {
            await this._updateWoundConditions(newHealth);
        }
        
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this }),
            content: `
                <div class="cds-damage">
                    <strong>Dano Aplicado</strong>
                    <p>Tipo: ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                    <p>Dano: ${damage}</p>
                    <p>Vida: ${currentHealth} → ${newHealth}</p>
                </div>
            `
        };
        
        ChatMessage.create(messageData);
    }

    /**
     * Atualiza as condições de ferimento baseadas na vida atual
     * @param {number} currentHealth - Vida atual
     */
    async _updateWoundConditions(currentHealth) {
        const maxHealth = this.system.health.max;
        const healthPercentage = currentHealth / maxHealth;
        
        const conditions = {
            escoriado: healthPercentage <= 0.9,
            machucado: healthPercentage <= 0.75,
            ferido: healthPercentage <= 0.5,
            feridoGravemente: healthPercentage <= 0.25,
            aleijado: healthPercentage <= 0.1,
            incapacitado: currentHealth <= 0
        };
        
        await this.update({
            'system.health.conditions': conditions
        });
    }

    /**
     * Aumenta a mortalidade
     * @param {number} amount - Quantidade a aumentar
     * @param {string} reason - Razão do aumento
     */
    async increaseMortality(amount = 1, reason = '') {
        const currentMortality = this.system.mortalidade.value;
        const newMortality = currentMortality + amount;
        
        await this.update({
            'system.mortalidade.value': newMortality
        });
        
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this }),
            content: `
                <div class="cds-mortality">
                    <strong>Mortalidade Aumentada</strong>
                    <p>Mortalidade: ${currentMortality} → ${newMortality}</p>
                    ${reason ? `<p>Razão: ${reason}</p>` : ''}
                    <p><em>O peso das ações sombrias se acumula...</em></p>
                </div>
            `
        };
        
        ChatMessage.create(messageData);
        
        ui.notifications.warn(`Mortalidade aumentou para ${newMortality}. ${reason}`);
    }

    /**
     * Realiza uma caça (reduz mortalidade)
     * @param {number} reduction - Redução de mortalidade
     */
    async performHunt(reduction = 1) {
        const currentMortality = this.system.mortalidade.value;
        const newMortality = Math.max(0, currentMortality - reduction);
        
        await this.update({
            'system.mortalidade.value': newMortality
        });
        
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this }),
            content: `
                <div class="cds-hunt">
                    <strong>Caça Realizada</strong>
                    <p>Mortalidade: ${currentMortality} → ${newMortality}</p>
                    <p><em>A besta interior foi temporariamente saciada...</em></p>
                </div>
            `
        };
        
        ChatMessage.create(messageData);
        
        ui.notifications.info(`Caça realizada. Mortalidade reduzida para ${newMortality}.`);
    }

    /**
     * Gasta pontos de entendimento
     * @param {number} amount - Quantidade de pontos a gastar
     * @param {string} purpose - Propósito do gasto
     */
    async spendUnderstandingPoints(amount, purpose = '') {
        const currentPoints = this.system.pontosEntendimento.value;
        
        if (currentPoints < amount) {
            ui.notifications.warn("Pontos de Entendimento insuficientes!");
            return false;
        }
        
        const newPoints = currentPoints - amount;
        
        await this.update({
            'system.pontosEntendimento.value': newPoints
        });
        
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this }),
            content: `
                <div class="cds-understanding">
                    <strong>Pontos de Entendimento Gastos</strong>
                    <p>Pontos gastos: ${amount}</p>
                    <p>Pontos restantes: ${newPoints}</p>
                    ${purpose ? `<p>Propósito: ${purpose}</p>` : ''}
                </div>
            `
        };
        
        ChatMessage.create(messageData);
        
        return true;
    }

    /**
     * Adiciona pontos de entendimento
     * @param {number} amount - Quantidade de pontos a adicionar
     * @param {string} source - Fonte dos pontos
     */
    async addUnderstandingPoints(amount, source = '') {
        const currentPoints = this.system.pontosEntendimento.value;
        const maxPoints = this.system.pontosEntendimento.max;
        const newPoints = Math.min(maxPoints, currentPoints + amount);
        
        await this.update({
            'system.pontosEntendimento.value': newPoints
        });
        
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this }),
            content: `
                <div class="cds-understanding">
                    <strong>Pontos de Entendimento Obtidos</strong>
                    <p>Pontos obtidos: ${amount}</p>
                    <p>Pontos atuais: ${newPoints}/${maxPoints}</p>
                    ${source ? `<p>Fonte: ${source}</p>` : ''}
                </div>
            `
        };
        
        ChatMessage.create(messageData);
        
        ui.notifications.info(`Pontos de Entendimento obtidos: ${amount}`);
    }

    /**
     * Obtém dados para rolagens
     */
    getRollData() {
        const data = super.getRollData();
        
        // Adiciona dados específicos do sistema
        if (this.system) {
            data.humanidade = this.system.humanidade.value;
            data.bestialidade = this.system.bestialidade.value;
            data.mortalidade = this.system.mortalidade.value;
            data.reservaDados = this.system.reservaDados.value;
            data.pontosEntendimento = this.system.pontosEntendimento.value;
            data.pericias = this.system.pericias;
            data.penalidades = this.system.penalidades || { total: 0 };
        }
        
        return data;
    }
}

