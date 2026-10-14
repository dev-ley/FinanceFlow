
/**
 * Componente visual lateral da autenticação do FinanceFlow.
 * Apresenta a mensagem institucional e o cartão demonstrativo
 * que acompanha as páginas de login e cadastro.
 */

export default function AuthVisualPanel() {
  return (
    <aside className="visual-panel">
      <div className="visual-content">
        <div className="visual-label">
          <span className="visual-label-dot" />
          VISÃO CLARA DO SEU DINHEIRO
        </div>

        <h2>
          Suas escolhas.
          <br />
          Seus planos.
          <br />
          <span>Seu futuro.</span>
        </h2>

        <p>
          Organize sua vida financeira com mais clareza e tome decisões
          com confiança.
        </p>

        <div className="preview-card">
          <div className="preview-top">
            <span>Resumo financeiro</span>
            <span className="preview-period">DEMONSTRAÇÃO</span>
          </div>

          <div className="preview-label">
            Controle em um só lugar
          </div>

          <div className="preview-line">
            <span>Receitas</span>
            <span className="preview-positive">Organizadas</span>
          </div>

          <div className="preview-line">
            <span>Despesas</span>
            <span>Monitoradas</span>
          </div>

          <div className="preview-line">
            <span>Metas</span>
            <span>Planejadas</span>
          </div>

          <div className="preview-bars" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      </div>

      <div className="visual-footer">
        <span>FINANCEFLOW</span>
        <span>ORGANIZAÇÃO QUE TRANSFORMA</span>
      </div>
    </aside>
  );
}
