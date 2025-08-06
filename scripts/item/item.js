/**
 * Classe do Item para o sistema Contrato de Sangue
 * Estende a classe Item do Foundry VTT com funcionalidades específicas do sistema
 */
export class ContratoDeSangueItem extends Item {

    /**
     * Prepara os dados do item para renderização
     */
    prepareData() {
        super.prepareData();
        
        const itemData = this;
        const systemData = itemData.system;
        const flags = itemData.flags.contratoDeSangue || {};

        // Aplica preparações específicas por tipo de item
        switch (itemData.type) {
            case 'vantagem':
                this._prepareVantagemData(itemData);
                break;
            case 'arma':
                this._prepareArmaData(itemData);
                break;
            case 'armadura':
                this._prepareArmaduraData(itemData);
                break;
            case 'equipamento':
                this._prepareEquipamentoData(itemData);
                break;
            case 'poder':
                this._preparePoderData(itemData);
                break;
        }
    }

    /**
     * Prepara dados específicos de vantagem
     * @param {Object} itemData - Dados do item
     */
    _prepareVantagemData(itemData) {
        const system = itemData.system;
        
        // Garante que a vantagem tenha uma linhagem válida
        if (!['upior', 'wilkolaki', 'ambas'].includes(system.linhagem)) {
            system.linhagem = 'ambas';
        }
        
        // Garante que o bônus tenha uma estrutura válida
        if (!system.bonus) {
            system.bonus = {
                tipo: 'pericia',
                valor: 0,
                aplicacao: ''
            };
        }
    }

    /**
     * Prepara dados específicos de arma
     * @param {Object} itemData - Dados do item
     */
    _prepareArmaData(itemData) {
        const system = itemData.system;
        
        // Garante valores mínimos
        system.dano = Math.max(0, system.dano || 0);
        
        // Define alcance padrão se não especificado
        if (!['curto', 'medio', 'longo'].includes(system.alcance)) {
            system.alcance = 'curto';
        }
        
        // Define tipo padrão se não especificado
        if (!['branca', 'fogo'].includes(system.tipo)) {
            system.tipo = 'branca';
        }
    }

    /**
     * Prepara dados específicos de armadura
     * @param {Object} itemData - Dados do item
     */
    _prepareArmaduraData(itemData) {
        const system = itemData.system;
        
        // Garante valores mínimos
        system.absorcao = Math.max(0, system.absorcao || 0);
        system.penalidade = Math.max(0, system.penalidade || 0);
    }

    /**
     * Prepara dados específicos de equipamento
     * @param {Object} itemData - Dados do item
     */
    _prepareEquipamentoData(itemData) {
        const system = itemData.system;
        
        // Garante valores mínimos
        system.peso = Math.max(0, system.peso || 0);
        system.preco = Math.max(0, system.preco || 0);
        system.quantidade = Math.max(1, system.quantidade || 1);
    }

    /**
     * Prepara dados específicos de poder
     * @param {Object} itemData - Dados do item
     */
    _preparePoderData(itemData) {
        const system = itemData.system;
        
        // Garante que o poder tenha uma linhagem válida
        if (!['upior', 'wilkolaki'].includes(system.linhagem)) {
            system.linhagem = 'upior';
        }
        
        // Garante que o custo tenha uma estrutura válida
        if (!system.custo) {
            system.custo = {
                reservaDados: 0,
                mortalidade: 0,
                pontosEntendimento: 0
            };
        }
        
        // Garante valores mínimos para custos
        system.custo.reservaDados = Math.max(0, system.custo.reservaDados || 0);
        system.custo.mortalidade = Math.max(0, system.custo.mortalidade || 0);
        system.custo.pontosEntendimento = Math.max(0, system.custo.pontosEntendimento || 0);
    }

    /**
     * Rola o item (para armas e poderes)
     */
    async roll() {
        const actor = this.parent;
        if (!actor) return;

        switch (this.type) {
            case 'arma':
                await this._rollWeapon(actor);
                break;
            case 'poder':
                await this._rollPower(actor);
                break;
            default:
                // Para outros tipos, apenas mostra informações
                await this._showItemInfo();
                break;
        }
    }

    /**
     * Rola uma arma
     * @param {Actor} actor - O ator que possui a arma
     */
    async _rollWeapon(actor) {
        const weaponType = this.system.tipo === 'branca' ? 'armasBrancas' : 'armasDeFogo';
        const weaponDamage = this.system.dano || 0;
        
        // Abre diálogo para dificuldade
        const dialogContent = `
            <form>
                <div class="form-group">
                    <label>Dificuldade do Ataque:</label>
                    <input type="number" name="difficulty" value="10" />
                </div>
                <div class="form-group">
                    <label>Modificador Adicional:</label>
                    <input type="number" name="modifier" value="0" />
                </div>
            </form>
        `;
        
        new Dialog({
            title: `Atacar com ${this.name}`,
            content: dialogContent,
            buttons: {
                attack: {
                    label: "Atacar",
                    callback: (html) => {
                        const difficulty = parseInt(html.find('[name="difficulty"]').val()) || 10;
                        const modifier = parseInt(html.find('[name="modifier"]').val()) || 0;
                        
                        // Modifica temporariamente a função de ataque para incluir o modificador
                        const originalRollAttack = actor.rollAttack;
                        actor.rollAttack = async function(wType, wDamage, diff) {
                            return game.contratoDeSangue.rollAttack(this, wType, wDamage, diff, modifier);
                        };
                        
                        actor.rollAttack(weaponType, weaponDamage, difficulty);
                        
                        // Restaura a função original
                        actor.rollAttack = originalRollAttack;
                    }
                },
                cancel: {
                    label: "Cancelar"
                }
            },
            default: "attack"
        }).render(true);
    }

    /**
     * Usa um poder
     * @param {Actor} actor - O ator que possui o poder
     */
    async _rollPower(actor) {
        const costs = this.system.custo;
        let canUse = true;
        let messages = [];
        
        // Verifica se tem recursos suficientes
        if (costs.reservaDados > 0 && actor.system.reservaDados.value < costs.reservaDados) {
            canUse = false;
            messages.push(`Reserva de Dados insuficiente (necessário: ${costs.reservaDados}, atual: ${actor.system.reservaDados.value})`);
        }
        
        if (costs.pontosEntendimento > 0 && actor.system.pontosEntendimento.value < costs.pontosEntendimento) {
            canUse = false;
            messages.push(`Pontos de Entendimento insuficientes (necessário: ${costs.pontosEntendimento}, atual: ${actor.system.pontosEntendimento.value})`);
        }
        
        if (!canUse) {
            ui.notifications.warn(messages.join('. '));
            return;
        }
        
        // Confirma o uso do poder
        const confirmed = await Dialog.confirm({
            title: `Usar ${this.name}`,
            content: `
                <div class="power-use-dialog">
                    <p><strong>Efeito:</strong> ${this.system.efeito}</p>
                    <p><strong>Duração:</strong> ${this.system.duracao}</p>
                    <p><strong>Alcance:</strong> ${this.system.alcance}</p>
                    ${costs.reservaDados > 0 ? `<p><strong>Custo:</strong> ${costs.reservaDados} dados da reserva</p>` : ''}
                    ${costs.mortalidade > 0 ? `<p><strong>Consequência:</strong> +${costs.mortalidade} Mortalidade</p>` : ''}
                    ${costs.pontosEntendimento > 0 ? `<p><strong>Custo:</strong> ${costs.pontosEntendimento} Pontos de Entendimento</p>` : ''}
                    <p>Deseja usar este poder?</p>
                </div>
            `
        });
        
        if (!confirmed) return;
        
        // Aplica os custos
        const updates = {};
        
        if (costs.reservaDados > 0) {
            updates['system.reservaDados.value'] = actor.system.reservaDados.value - costs.reservaDados;
        }
        
        if (costs.pontosEntendimento > 0) {
            updates['system.pontosEntendimento.value'] = actor.system.pontosEntendimento.value - costs.pontosEntendimento;
        }
        
        if (costs.mortalidade > 0) {
            updates['system.mortalidade.value'] = actor.system.mortalidade.value + costs.mortalidade;
        }
        
        await actor.update(updates);
        
        // Cria mensagem de chat
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: `<strong>${this.name}</strong> (${game.i18n.localize(`CDS.${this.system.linhagem.charAt(0).toUpperCase() + this.system.linhagem.slice(1)}`)})`,
            content: `
                <div class="cds-power">
                    <div class="power-effect">
                        <strong>Efeito:</strong> ${this.system.efeito}
                    </div>
                    <div class="power-details">
                        <p><strong>Duração:</strong> ${this.system.duracao}</p>
                        <p><strong>Alcance:</strong> ${this.system.alcance}</p>
                    </div>
                    ${this.system.description ? `<div class="power-description">${this.system.description}</div>` : ''}
                    ${costs.reservaDados > 0 || costs.mortalidade > 0 || costs.pontosEntendimento > 0 ? `
                        <div class="power-costs">
                            <strong>Custos Aplicados:</strong>
                            ${costs.reservaDados > 0 ? `<span>-${costs.reservaDados} Reserva de Dados</span>` : ''}
                            ${costs.mortalidade > 0 ? `<span>+${costs.mortalidade} Mortalidade</span>` : ''}
                            ${costs.pontosEntendimento > 0 ? `<span>-${costs.pontosEntendimento} Pontos de Entendimento</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `
        };
        
        ChatMessage.create(messageData);
        
        // Notifica sobre mudanças importantes
        if (costs.mortalidade > 0) {
            ui.notifications.warn(`Mortalidade aumentou em ${costs.mortalidade}. Total atual: ${actor.system.mortalidade.value + costs.mortalidade}`);
        }
    }

    /**
     * Mostra informações do item no chat
     */
    async _showItemInfo() {
        const messageData = {
            speaker: ChatMessage.getSpeaker(),
            flavor: `<strong>${this.name}</strong>`,
            content: `
                <div class="cds-item-info">
                    ${this.system.description ? `<p>${this.system.description}</p>` : ''}
                    ${this._getItemSpecificInfo()}
                </div>
            `
        };
        
        ChatMessage.create(messageData);
    }

    /**
     * Obtém informações específicas do tipo de item
     * @returns {string} HTML com informações específicas
     */
    _getItemSpecificInfo() {
        switch (this.type) {
            case 'vantagem':
                return `
                    <p><strong>Linhagem:</strong> ${game.i18n.localize(`CDS.${this.system.linhagem.charAt(0).toUpperCase() + this.system.linhagem.slice(1)}`)}</p>
                    ${this.system.bonus.valor > 0 ? `<p><strong>Bônus:</strong> +${this.system.bonus.valor} em ${this.system.bonus.aplicacao}</p>` : ''}
                `;
            case 'arma':
                return `
                    <p><strong>Dano:</strong> +${this.system.dano}</p>
                    <p><strong>Alcance:</strong> ${game.i18n.localize(`CDS.Alcance${this.system.alcance.charAt(0).toUpperCase() + this.system.alcance.slice(1)}`)}</p>
                    <p><strong>Tipo:</strong> ${this.system.tipo === 'branca' ? 'Arma Branca' : 'Arma de Fogo'}</p>
                    ${this.system.especial ? `<p><strong>Especial:</strong> ${this.system.especial}</p>` : ''}
                `;
            case 'armadura':
                return `
                    <p><strong>Absorção:</strong> ${this.system.absorcao}</p>
                    <p><strong>Penalidade:</strong> -${this.system.penalidade}</p>
                `;
            case 'equipamento':
                return `
                    <p><strong>Quantidade:</strong> ${this.system.quantidade}</p>
                    ${this.system.peso > 0 ? `<p><strong>Peso:</strong> ${this.system.peso} kg</p>` : ''}
                    ${this.system.preco > 0 ? `<p><strong>Preço:</strong> $${this.system.preco}</p>` : ''}
                `;
            case 'poder':
                return `
                    <p><strong>Linhagem:</strong> ${game.i18n.localize(`CDS.${this.system.linhagem.charAt(0).toUpperCase() + this.system.linhagem.slice(1)}`)}</p>
                    <p><strong>Efeito:</strong> ${this.system.efeito}</p>
                    <p><strong>Duração:</strong> ${this.system.duracao}</p>
                    <p><strong>Alcance:</strong> ${this.system.alcance}</p>
                    ${this.system.custo.reservaDados > 0 || this.system.custo.mortalidade > 0 || this.system.custo.pontosEntendimento > 0 ? `
                        <p><strong>Custos:</strong>
                        ${this.system.custo.reservaDados > 0 ? ` ${this.system.custo.reservaDados} Reserva de Dados` : ''}
                        ${this.system.custo.mortalidade > 0 ? ` +${this.system.custo.mortalidade} Mortalidade` : ''}
                        ${this.system.custo.pontosEntendimento > 0 ? ` ${this.system.custo.pontosEntendimento} Pontos de Entendimento` : ''}
                        </p>
                    ` : ''}
                `;
            default:
                return '';
        }
    }

    /**
     * Verifica se o item pode ser usado pelo ator
     * @param {Actor} actor - O ator que possui o item
     * @returns {boolean} Se o item pode ser usado
     */
    canBeUsedBy(actor) {
        if (!actor) return false;
        
        switch (this.type) {
            case 'vantagem':
                // Verifica se a vantagem é compatível com a linhagem do ator
                return this.system.linhagem === 'ambas' || this.system.linhagem === actor.system.linhagem;
            
            case 'poder':
                // Verifica se o poder é compatível com a linhagem do ator
                return this.system.linhagem === actor.system.linhagem;
            
            default:
                return true;
        }
    }

    /**
     * Obtém o bônus que este item fornece para uma perícia específica
     * @param {string} skillName - Nome da perícia
     * @returns {number} Bônus fornecido
     */
    getSkillBonus(skillName) {
        if (this.type !== 'vantagem' || !this.system.ativa) return 0;
        
        // Verifica vantagens específicas
        const itemName = this.name.toLowerCase();
        
        // Mente Afiada: +1 em perícias mentais
        if (itemName.includes('mente afiada')) {
            const mentalSkills = ['computadores', 'investigacao', 'medicina', 'ocultismo', 'ciencias'];
            return mentalSkills.includes(skillName) ? 1 : 0;
        }
        
        // Força Bestial: +1 em atletismo
        if (itemName.includes('força bestial') && skillName === 'atletismo') {
            return 1;
        }
        
        // Instintos Primitivos: +1 em sobrevivência
        if (itemName.includes('instintos primitivos') && skillName === 'sobrevivencia') {
            return 1;
        }
        
        // Charme Sobrenatural: +1 em perícias sociais
        if (itemName.includes('charme sobrenatural')) {
            const socialSkills = ['empatia', 'expressao', 'intimidacao', 'persuasao', 'subterfugio'];
            return socialSkills.includes(skillName) ? 1 : 0;
        }
        
        // Resistência: +1 contra efeitos mentais (implementar conforme necessário)
        if (itemName.includes('resistencia')) {
            // Pode ser implementado para rolagens específicas
            return 0;
        }
        
        // Bônus genérico baseado na configuração da vantagem
        if (this.system.bonus.tipo === 'pericia' && this.system.bonus.aplicacao === skillName) {
            return this.system.bonus.valor;
        }
        
        return 0;
    }

    /**
     * Obtém dados para rolagens
     */
    getRollData() {
        const data = super.getRollData();
        
        // Adiciona dados específicos do sistema
        if (this.system) {
            switch (this.type) {
                case 'arma':
                    data.dano = this.system.dano;
                    data.alcance = this.system.alcance;
                    data.tipo = this.system.tipo;
                    break;
                case 'armadura':
                    data.absorcao = this.system.absorcao;
                    data.penalidade = this.system.penalidade;
                    break;
                case 'poder':
                    data.custo = this.system.custo;
                    data.linhagem = this.system.linhagem;
                    break;
            }
        }
        
        return data;
    }
}

