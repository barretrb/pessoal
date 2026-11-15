<?php
declare(strict_types=1);

function h(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
}

function sortable_js(): string
{
    return <<<JS
    function makeTableSortable(table) {
      const headers = table.querySelectorAll('thead th[data-sort]');
      headers.forEach((th, colIdx) => {
        th.addEventListener('click', () => {
          const tbody = table.querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const current = th.getAttribute('data-sort');
          const nextDir = current === 'asc' ? 'desc' : 'asc';
          const type = th.getAttribute('data-type') || 'text';

          headers.forEach(h => h.setAttribute('data-sort', 'none'));
          th.setAttribute('data-sort', nextDir);

          rows.sort((a, b) => {
            const cellA = a.children[colIdx];
            const cellB = b.children[colIdx];
            const rawA = (cellA.getAttribute('data-value') || cellA.textContent || '').trim();
            const rawB = (cellB.getAttribute('data-value') || cellB.textContent || '').trim();

            let cmp = 0;
            if (type === 'num') {
              const nA = parseFloat(rawA.replace(/[^\d.-]/g, '')) || 0;
              const nB = parseFloat(rawB.replace(/[^\d.-]/g, '')) || 0;
              cmp = nA - nB;
            } else if (type === 'date') {
              cmp = rawA.localeCompare(rawB);
            } else {
              cmp = rawA.localeCompare(rawB, 'pt-BR', { sensitivity: 'base' });
            }
            return nextDir === 'asc' ? cmp : -cmp;
          });

          rows.forEach(r => tbody.appendChild(r));
        });
      });
    }
    document.querySelectorAll('table[data-sortable]').forEach(makeTableSortable);
JS;
}

function render_login(?string $error = null): void
{
    header('Content-Type: text/html; charset=utf-8');
    $errHtml = $error ? '<div class="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-sm text-rose-300">' . h($error) . '</div>' : '';
    echo <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login — Controle Financeiro</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center px-4">
  <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
    <div class="mb-6 text-center">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 text-2xl mb-3">💳</div>
      <h1 class="text-xl font-bold tracking-tight">Controle Financeiro</h1>
      <p class="text-sm text-slate-400 mt-1">Zero-Input Expense Tracker</p>
    </div>
    {$errHtml}
    <form method="post" action="/login" class="space-y-4">
      <div>
        <label for="password" class="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">Senha do Dashboard</label>
        <input id="password" name="password" type="password" required autofocus placeholder="••••••••"
          class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
      </div>
      <button type="submit" class="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors py-2.5 text-sm font-semibold text-white">Entrar</button>
    </form>
  </div>
</body>
</html>
HTML;
    exit;
}

function render_dashboard(array $summary, array $yearly, array $plans, array $categories): void
{
    header('Content-Type: text/html; charset=utf-8');
    $period = h($summary['period']);
    $yearNum = (int)$summary['year'];
    $monthNum = (int)$summary['month'];
    $pendingBadge = $summary['pending_count'] > 0
        ? '<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-300">⏳ ' . (int)$summary['pending_count'] . ' pendente(s)</span>'
        : '';
    $saldoBorder = $summary['saldo_livre'] >= 0 ? 'border-emerald-400/40' : 'border-rose-500/40';
    $saldoColor = $summary['saldo_livre'] >= 0 ? 'text-emerald-300' : 'text-rose-400';

    $catOptions = '';
    foreach ($categories as $c) {
        $catOptions .= '<option value="' . h($c) . '">' . h($c) . '</option>';
    }

    // Consumption Bills HTML
    $billsHtml = '';
    if (!empty($summary['consumption_bills'])) {
        $billsHtml .= '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
        foreach ($summary['consumption_bills'] as $b) {
            $bStatus = $b['status'];
            if ($bStatus === 'CONFIRMED') {
                $bBadge = '<span class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Real Confirmado</span>';
                $btnLabel = 'Corrigir Valor Real';
            } elseif ($bStatus === 'ESTIMATED') {
                $bBadge = '<span class="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">Provisionado (Estimado)</span>';
                $btnLabel = 'Confirmar Valor Real';
            } else {
                $bBadge = '<span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Não provisionado</span>';
                $btnLabel = 'Confirmar Valor Real';
            }
            $formHtml = '';
            if (!empty($b['transaction_id'])) {
                $valAttr = number_format((float)$b['current_amount'], 2, '.', '');
                $txIdInt = (int)$b['transaction_id'];
                $formHtml = <<<HTML
                <form method="post" action="/dashboard/reconcile" class="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <input type="hidden" name="transaction_id" value="{$txIdInt}" />
                  <input type="hidden" name="month" value="{$period}" />
                  <input type="number" step="0.01" min="0.01" name="real_amount" value="{$valAttr}" required class="w-36 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none" />
                  <button type="submit" class="rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors">{$btnLabel}</button>
                </form>
HTML;
            }
            $bTitle = h($b['title']);
            $bMethod = h($b['payment_method']);
            $bDue = (int)$b['due_day'];
            $bCurBrl = h($b['current_amount_brl']);
            $bAvgBrl = h($b['rolling_avg_3m_brl']);
            $bMonths = (int)$b['confirmed_months'];
            $billsHtml .= <<<HTML
            <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-sm text-slate-100">{$bTitle}</h3>
                    {$bBadge}
                  </div>
                  <p class="text-xs text-slate-400 mt-1">Vencimento dia {$bDue} · {$bMethod}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-sky-300">R$ {$bCurBrl}</p>
                  <p class="text-[11px] text-slate-400">Média 3M: R$ {$bAvgBrl} ({$bMonths}m)</p>
                </div>
              </div>
              {$formHtml}
            </div>
HTML;
        }
        $billsHtml .= '</div>';
    } else {
        $billsHtml = '<p class="text-sm text-slate-400">Nenhuma conta de consumo com média móvel cadastrada.</p>';
    }

    // Category Breakdown
    $catListHtml = '';
    if ($summary['category_breakdown']) {
        $items = '';
        foreach ($summary['category_breakdown'] as $item) {
            $items .= '<li class="flex items-center justify-between text-slate-300"><span>' . h($item['category']) . '</span><span class="font-medium">R$ ' . h($item['total_brl']) . ' (' . $item['percentage'] . '%)</span></li>';
        }
        $catListHtml = '<div class="h-52 flex items-center justify-center"><canvas id="categoryChart"></canvas></div><ul class="mt-4 space-y-1.5 text-xs">' . $items . '</ul>';
    } else {
        $catListHtml = '<div class="h-56 flex items-center justify-center text-sm text-slate-500">Nenhuma despesa registrada neste mês.</div>';
    }

    // Yearly Rows
    $yearlyYear = (int)$yearly['year'];
    $yearlySaldoColor = $yearly['totals']['saldo_livre'] >= 0 ? 'text-emerald-400' : 'text-rose-400';
    $yearlySaldoBrl = h($yearly['totals']['saldo_livre_brl']);
    $yearlyRows = '';
    foreach ($yearly['months'] as $ym) {
        $mNum = (int)$ym['month'];
        $mPeriod = sprintf('%04d-%02d', $yearlyYear, $mNum);
        $rowHighlight = ($mNum === $monthNum) ? 'bg-slate-800/40' : '';
        $ymSaldoColor = $ym['saldo_livre'] >= 0 ? 'text-emerald-300' : 'text-rose-400';
        $yearlyRows .= '<tr class="hover:bg-slate-800/30 ' . $rowHighlight . '">'
            . '<td class="py-2.5 pr-4 font-medium" data-value="' . $mNum . '">' . h($ym['label']) . '/' . $yearlyYear . '</td>'
            . '<td class="py-2.5 pr-4 text-right text-emerald-400" data-value="' . $ym['income'] . '">R$ ' . h($ym['income_brl']) . '</td>'
            . '<td class="py-2.5 pr-4 text-right text-sky-400" data-value="' . $ym['fixed_expenses'] . '">R$ ' . h($ym['fixed_expenses_brl']) . '</td>'
            . '<td class="py-2.5 pr-4 text-right text-rose-400" data-value="' . $ym['variable_expenses'] . '">R$ ' . h($ym['variable_expenses_brl']) . '</td>'
            . '<td class="py-2.5 pr-4 text-right text-slate-200" data-value="' . $ym['total_expenses'] . '">R$ ' . h($ym['total_expenses_brl']) . '</td>'
            . '<td class="py-2.5 pr-4 text-right font-semibold ' . $ymSaldoColor . '" data-value="' . $ym['saldo_livre'] . '">R$ ' . h($ym['saldo_livre_brl']) . '</td>'
            . '<td class="py-2.5 text-right whitespace-nowrap"><a href="/dashboard?month=' . $mPeriod . '" class="text-xs text-sky-400 hover:text-sky-300 mr-2">Abrir</a><a href="/transactions?year=' . $yearlyYear . '&month=' . $mNum . '" class="text-xs text-slate-400 hover:text-slate-200">Gastos</a></td>'
            . '</tr>';
    }

    // Plans Table
    $plansHtml = '';
    if ($plans) {
        $rows = '';
        foreach ($plans as $p) {
            $badge = $p['type'] === 'INCOME'
                ? '<span class="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">Receita</span>'
                : '<span class="text-xs px-2 py-0.5 rounded bg-rose-500/15 text-rose-300">Despesa</span>';
            $ptBadge = ($p['plan_type'] ?? 'FIXED') === 'ROLLING_AVERAGE'
                ? '<span class="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300">Média Móvel</span>'
                : '<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Fixo</span>';
            $pmText = h($p['payment_method'] ?? 'PIX');
            $dayNum = (int)$p['day_of_month'];
            $amtVal = (float)$p['amount'];
            $rows .= '<tr class="hover:bg-slate-800/30">'
                . '<td class="py-2.5 pr-4 text-slate-300" data-value="' . $dayNum . '">Dia ' . sprintf('%02d', $dayNum) . '</td>'
                . '<td class="py-2.5 pr-4 font-medium">' . h($p['title']) . '</td>'
                . '<td class="py-2.5 pr-4">' . $badge . '</td>'
                . '<td class="py-2.5 pr-4 text-xs">' . $ptBadge . '</td>'
                . '<td class="py-2.5 pr-4 text-xs text-slate-400">' . $pmText . '</td>'
                . '<td class="py-2.5 pr-4 text-slate-300">' . h($p['category']) . '</td>'
                . '<td class="py-2.5 pr-4 text-right font-medium" data-value="' . $amtVal . '">R$ ' . format_brl($amtVal) . '</td>'
                . '<td class="py-2.5 text-right"><form method="post" action="/dashboard/plan/' . (int)$p['id'] . '/delete" class="inline"><button type="submit" class="text-xs text-rose-400 hover:text-rose-300">Remover</button></form></td>'
                . '</tr>';
        }
        $plansHtml = '<div class="overflow-x-auto"><table class="w-full text-sm text-left" data-sortable><thead class="text-xs uppercase text-slate-400 border-b border-slate-800"><tr><th class="py-2 pr-4" data-sort="none" data-type="num">Dia</th><th class="py-2 pr-4" data-sort="none" data-type="text">Descrição</th><th class="py-2 pr-4" data-sort="none" data-type="text">Tipo</th><th class="py-2 pr-4" data-sort="none" data-type="text">Modelo</th><th class="py-2 pr-4" data-sort="none" data-type="text">Método</th><th class="py-2 pr-4" data-sort="none" data-type="text">Categoria</th><th class="py-2 pr-4 text-right" data-sort="none" data-type="num">Valor</th><th class="py-2 text-right">Ação</th></tr></thead><tbody class="divide-y divide-slate-800/70">' . $rows . '</tbody></table></div>';
    } else {
        $plansHtml = '<p class="text-sm text-slate-500">Nenhum item cadastrado no planejamento anual.</p>';
    }

    // Recent Transactions
    $txsHtml = '';
    if ($summary['transactions']) {
        $rows = '';
        foreach ($summary['transactions'] as $tx) {
            $dt = (new DateTimeImmutable($tx['occurred_at'], new DateTimeZone('UTC')))
                ->setTimezone(new DateTimeZone('America/Sao_Paulo'))->format('d/m H:i');
            $inst = (int)$tx['installments'] > 1 ? ' <span class="text-xs text-slate-400">(' . (int)$tx['installments'] . 'x)</span>' : '';
            if ($tx['status'] === 'CONFIRMED') {
                $stBadge = '<span class="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">Confirmado</span>';
            } elseif ($tx['status'] === 'ESTIMATED') {
                $stBadge = '<span class="text-xs px-2 py-0.5 rounded bg-sky-500/15 text-sky-300">Estimado</span>';
            } else {
                $stBadge = '<span class="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">Pendente</span>';
            }
            $sign = $tx['type'] === 'INCOME' ? '+' : '-';
            $valColor = $tx['type'] === 'INCOME' ? 'text-emerald-400' : 'text-rose-400';
            $amtVal = (float)$tx['amount'];
            $rows .= '<tr class="hover:bg-slate-800/30">'
                . '<td class="py-2.5 pr-4 text-slate-400 text-xs whitespace-nowrap" data-value="' . h($tx['occurred_at']) . '">' . $dt . '</td>'
                . '<td class="py-2.5 pr-4 font-medium">' . h($tx['merchant']) . $inst . '</td>'
                . '<td class="py-2.5 pr-4 text-slate-300">' . h($tx['category']) . '</td>'
                . '<td class="py-2.5 pr-4 text-xs text-slate-400">' . h($tx['source']) . '</td>'
                . '<td class="py-2.5 pr-4">' . $stBadge . '</td>'
                . '<td class="py-2.5 text-right font-medium ' . $valColor . '" data-value="' . $amtVal . '">' . $sign . ' R$ ' . format_brl($amtVal) . '</td>'
                . '</tr>';
        }
        $txsHtml = '<div class="overflow-x-auto"><table class="w-full text-sm text-left" data-sortable><thead class="text-xs uppercase text-slate-400 border-b border-slate-800"><tr><th class="py-2 pr-4" data-sort="none" data-type="date">Data</th><th class="py-2 pr-4" data-sort="none" data-type="text">Estabelecimento / Conta</th><th class="py-2 pr-4" data-sort="none" data-type="text">Categoria</th><th class="py-2 pr-4" data-sort="none" data-type="text">Origem</th><th class="py-2 pr-4" data-sort="none" data-type="text">Status</th><th class="py-2 text-right" data-sort="none" data-type="num">Valor</th></tr></thead><tbody class="divide-y divide-slate-800/70">' . $rows . '</tbody></table></div>';
    } else {
        $txsHtml = '<p class="text-sm text-slate-500">Nenhuma transação registrada nesta competência.</p>';
    }

    $burnJson = json_encode($summary['burn_rate'], JSON_UNESCAPED_UNICODE);
    $catJson = json_encode($summary['category_breakdown'], JSON_UNESCAPED_UNICODE);
    $yearlyJson = json_encode($yearly['months'], JSON_UNESCAPED_UNICODE);
    $sortJs = sortable_js();

    echo <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard — Controle Financeiro</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  <style>
    th[data-sort] { cursor: pointer; user-select: none; }
    th[data-sort]:hover { color: #e2e8f0; }
    th[data-sort]::after { content: " ↕"; opacity: 0.4; font-size: 0.7em; }
    th[data-sort="asc"]::after { content: " ↑"; opacity: 1; color: #34d399; }
    th[data-sort="desc"]::after { content: " ↓"; opacity: 1; color: #34d399; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
          <span class="text-2xl">💳</span>
          <div>
            <h1 class="text-lg font-bold tracking-tight">Zero-Input Finance</h1>
            <p class="text-xs text-slate-400">Competência {$period}</p>
          </div>
        </div>
        <nav class="hidden md:flex items-center gap-2">
          <a href="/dashboard?month={$period}" class="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-emerald-300">Visão Geral</a>
          <a href="/transactions?year={$yearNum}&month={$monthNum}" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors">Gastos Detalhados</a>
        </nav>
      </div>
      <div class="flex flex-wrap items-center gap-2.5">
        {$pendingBadge}
        <button type="button" onclick="openQuickModal('INCOME')" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors">+ Receita / Lançamento</button>
        <form method="get" action="/dashboard" class="flex items-center gap-2">
          <input type="month" name="month" value="{$period}" onchange="this.form.submit()" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none" />
        </form>
        <a href="/transactions?year={$yearNum}&month={$monthNum}" class="md:hidden rounded-lg border border-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300">Detalhes</a>
        <a href="/logout" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors">Sair</a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-slate-900 border border-emerald-500/30 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wider text-emerald-300/80">Receita Total</p>
          <span class="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">Entradas</span>
        </div>
        <p class="text-2xl font-bold text-emerald-400 mt-2">R$ {$summary['total_income_brl']}</p>
        <p class="text-[11px] text-slate-400 mt-1">Salário + receitas extras do mês</p>
      </div>
      <div class="bg-slate-900 border border-sky-500/30 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wider text-sky-300/80">Custos Fixos &amp; Médias</p>
          <span class="text-xs px-2 py-0.5 rounded bg-sky-500/15 text-sky-300">Provisionado</span>
        </div>
        <p class="text-2xl font-bold text-sky-400 mt-2">R$ {$summary['fixed_expenses_brl']}</p>
        <p class="text-[11px] text-slate-400 mt-1">Fixos + Enel/Naturgy (média/real)</p>
      </div>
      <div class="bg-slate-900 border border-rose-500/30 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wider text-rose-300/80">Gastos Variáveis (Cartão)</p>
          <span class="text-xs px-2 py-0.5 rounded bg-rose-500/15 text-rose-300">Tempo Real</span>
        </div>
        <p class="text-2xl font-bold text-rose-400 mt-2">R$ {$summary['variable_expenses_brl']}</p>
        <p class="text-[11px] text-slate-400 mt-1">Compras de cartão, PIX e avulsos</p>
      </div>
      <div class="bg-slate-900 border {$saldoBorder} rounded-xl p-5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wider text-slate-300">Saldo Livre Atual</p>
          <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Disponível</span>
        </div>
        <p class="text-2xl font-bold mt-2 {$saldoColor}">R$ {$summary['saldo_livre_brl']}</p>
        <p class="text-[11px] text-slate-400 mt-1">Receita − (Fixos &amp; Médias + Variáveis)</p>
      </div>
    </section>

    <section class="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div class="mb-4">
        <h2 class="text-base font-semibold">Contas de Consumo (Média vs. Real)</h2>
        <p class="text-xs text-slate-400">Provisionadas no dia 1º pela média móvel dos últimos 3 meses confirmados. Ao informar o valor real, substitui a estimativa sem duplicar.</p>
      </div>
      {$billsHtml}
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="mb-4">
          <h2 class="text-base font-semibold">Burn Rate Mensal</h2>
          <p class="text-xs text-slate-400">Gasto acumulado vs. Limite planejado (R$ {$summary['budget_limit_brl']})</p>
        </div>
        <div class="h-72"><canvas id="burnRateChart"></canvas></div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-base font-semibold mb-1">Distribuição por Categoria</h2>
        <p class="text-xs text-slate-400 mb-4">Total de despesas: R$ {$summary['total_expenses_brl']}</p>
        {$catListHtml}
      </div>
    </section>

    <section class="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold">Visão do Ano por Mês ({$yearlyYear})</h2>
          <p class="text-xs text-slate-400">Comparativo mensal de Receitas, Fixos &amp; Médias, Variáveis e Saldo Livre. Clique no cabeçalho para ordenar.</p>
        </div>
        <div class="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
          Saldo Anual Acumulado: <strong class="{$yearlySaldoColor}">R$ {$yearlySaldoBrl}</strong>
        </div>
      </div>
      <div class="h-64"><canvas id="yearlyChart"></canvas></div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left" data-sortable>
          <thead class="text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th class="py-2.5 pr-4" data-sort="none" data-type="num">Mês</th>
              <th class="py-2.5 pr-4 text-right" data-sort="none" data-type="num">Receita</th>
              <th class="py-2.5 pr-4 text-right" data-sort="none" data-type="num">Fixos &amp; Médias</th>
              <th class="py-2.5 pr-4 text-right" data-sort="none" data-type="num">Variáveis</th>
              <th class="py-2.5 pr-4 text-right" data-sort="none" data-type="num">Total Saídas</th>
              <th class="py-2.5 pr-4 text-right" data-sort="none" data-type="num">Saldo Livre</th>
              <th class="py-2.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/70">{$yearlyRows}</tbody>
        </table>
      </div>
    </section>

    <section class="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div>
        <h2 class="text-base font-semibold">Planejamento Anual (Receitas, Custos Fixos &amp; Médias)</h2>
        <p class="text-xs text-slate-400">Lançados automaticamente no início de cada mês. Clique nos títulos para ordenar.</p>
      </div>
      <form method="post" action="/dashboard/plan" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-3">
        <input type="text" name="title" placeholder="Descrição (ex: Aluguel)" required class="lg:col-span-2 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
        <select name="type" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"><option value="EXPENSE">Despesa</option><option value="INCOME">Receita</option></select>
        <input type="number" step="0.01" min="0.01" name="amount" placeholder="Valor (R$)" required class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
        <select name="category" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">{$catOptions}</select>
        <select name="plan_type" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"><option value="FIXED">Fixo</option><option value="ROLLING_AVERAGE">Média Móvel</option></select>
        <div class="flex gap-2">
          <select name="payment_method" class="w-1/2 rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"><option value="PIX">PIX</option><option value="Cartão">Cartão</option></select>
          <input type="number" min="1" max="31" name="day_of_month" placeholder="Dia" required class="w-1/2 rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
        </div>
        <button type="submit" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors">Adicionar</button>
      </form>
      {$plansHtml}
    </section>

    <section class="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 class="text-base font-semibold">Transações Recentes ({$period})</h2>
          <p class="text-xs text-slate-400">Clique no cabeçalho das colunas para ordenar.</p>
        </div>
        <a href="/transactions?year={$yearNum}&month={$monthNum}" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300">Ver todas com filtros →</a>
      </div>
      {$txsHtml}
    </section>
  </main>

  <div id="quickModal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold">Lançamento Rápido</h3>
        <button type="button" onclick="closeQuickModal()" class="text-slate-400 hover:text-slate-200 text-lg">&times;</button>
      </div>
      <form method="post" action="/dashboard/income" class="space-y-3">
        <input type="hidden" name="month" value="{$period}" />
        <div>
          <label class="block text-xs text-slate-400 mb-1">Tipo</label>
          <select name="tx_type" id="quickTxType" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm">
            <option value="INCOME">Receita Extra (13º, Reembolso, Bônus)</option>
            <option value="EXPENSE">Despesa Avulsa</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-slate-400 mb-1">Descrição</label>
          <input type="text" name="title" required placeholder="Ex: Reembolso médico, 13º Salário" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Valor (R$)</label>
            <input type="number" step="0.01" min="0.01" name="amount" required placeholder="0,00" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Categoria</label>
            <select name="category" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm">{$catOptions}</select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeQuickModal()" class="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300">Cancelar</button>
          <button type="submit" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">Salvar</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function openQuickModal(type) {
      document.getElementById('quickTxType').value = type || 'INCOME';
      document.getElementById('quickModal').classList.remove('hidden');
    }
    function closeQuickModal() {
      document.getElementById('quickModal').classList.add('hidden');
    }
    {$sortJs}
    const burnData = {$burnJson};
    new Chart(document.getElementById('burnRateChart').getContext('2d'), {
      type: 'line',
      data: {
        labels: burnData.labels,
        datasets: [
          { label: 'Gasto Real Acumulado (R$)', data: burnData.actual, borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.15)', fill: true, tension: 0.25, borderWidth: 2.5 },
          { label: 'Meta Linear (R$)', data: burnData.planned, borderColor: '#38bdf8', borderDash: [6,6], fill: false, tension: 0, borderWidth: 2 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } } } },
    });
    const catBreakdown = {$catJson};
    if (catBreakdown.length > 0) {
      new Chart(document.getElementById('categoryChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: catBreakdown.map(c => c.category), datasets: [{ data: catBreakdown.map(c => c.total), backgroundColor: ['#10b981','#38bdf8','#f43f5e','#f59e0b','#a855f7','#ec4899','#14b8a6','#6366f1','#eab308','#f97316','#64748b'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
      });
    }
    const yearlyMonths = {$yearlyJson};
    new Chart(document.getElementById('yearlyChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: yearlyMonths.map(m => m.label),
        datasets: [
          { label: 'Receita', data: yearlyMonths.map(m => m.income), backgroundColor: 'rgba(16, 185, 129, 0.75)' },
          { label: 'Fixos & Médias', data: yearlyMonths.map(m => m.fixed_expenses), backgroundColor: 'rgba(56, 189, 248, 0.75)' },
          { label: 'Variáveis (Cartão)', data: yearlyMonths.map(m => m.variable_expenses), backgroundColor: 'rgba(244, 63, 94, 0.75)' },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } } } },
    });
  </script>
</body>
</html>
HTML;
    exit;
}

function render_transactions(array $result, array $categories, array $filters): void
{
    header('Content-Type: text/html; charset=utf-8');
    $yearVal = (int)$filters['year'];
    $monthVal = (int)$filters['month'];
    $selAllMonths = $monthVal === 0 ? 'selected' : '';
    $monthOpts = '';
    foreach (MONTH_NAMES_PT as $idx => $mName) {
        $mNum = $idx + 1;
        $sel = ($monthVal === $mNum) ? 'selected' : '';
        $monthOpts .= '<option value="' . $mNum . '" ' . $sel . '>' . sprintf('%02d', $mNum) . ' - ' . h($mName) . '</option>';
    }
    $catOpts = '';
    foreach ($categories as $c) {
        $sel = ($filters['category'] === $c) ? 'selected' : '';
        $catOpts .= '<option value="' . h($c) . '" ' . $sel . '>' . h($c) . '</option>';
    }
    $selExp = $filters['tx_type'] === 'EXPENSE' ? 'selected' : '';
    $selInc = $filters['tx_type'] === 'INCOME' ? 'selected' : '';
    $selNotif = $filters['source'] === 'NOTIFICATION' ? 'selected' : '';
    $selPlan = $filters['source'] === 'FIXED_PLAN' ? 'selected' : '';
    $selMan = $filters['source'] === 'MANUAL' ? 'selected' : '';
    $selConf = $filters['status'] === 'CONFIRMED' ? 'selected' : '';
    $selEst = $filters['status'] === 'ESTIMATED' ? 'selected' : '';
    $selPend = $filters['status'] === 'PENDING' ? 'selected' : '';
    $minAmt = h((string)$filters['min_amount']);
    $maxAmt = h((string)$filters['max_amount']);
    $qVal = h((string)$filters['q']);
    $netColor = $result['net'] >= 0 ? 'text-emerald-300' : 'text-rose-400';

    $tableHtml = '';
    if (!empty($result['transactions'])) {
        $rows = '';
        foreach ($result['transactions'] as $tx) {
            $dt = (new DateTimeImmutable($tx['occurred_at'], new DateTimeZone('UTC')))
                ->setTimezone(new DateTimeZone('America/Sao_Paulo'))->format('d/m/Y H:i');
            $inst = (int)$tx['installments'] > 1 ? ' <span class="text-xs text-slate-400">(' . (int)$tx['installments'] . 'x)</span>' : '';
            $appSub = !empty($tx['app_name']) ? '<span class="block text-[11px] text-slate-500">' . h($tx['app_name']) . '</span>' : '';
            $typeTxt = $tx['type'] === 'INCOME' ? '<span class="text-emerald-300">Receita</span>' : '<span class="text-rose-300">Despesa</span>';
            if ($tx['status'] === 'CONFIRMED') {
                $stBadge = '<span class="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">Confirmado</span>';
            } elseif ($tx['status'] === 'ESTIMATED') {
                $stBadge = '<span class="text-xs px-2 py-0.5 rounded bg-sky-500/15 text-sky-300">Estimado</span>';
            } else {
                $stBadge = '<span class="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">Pendente</span>';
            }
            $sign = $tx['type'] === 'INCOME' ? '+' : '-';
            $valColor = $tx['type'] === 'INCOME' ? 'text-emerald-400' : 'text-rose-400';
            $amtVal = (float)$tx['amount'];
            $rows .= '<tr class="hover:bg-slate-800/30">'
                . '<td class="py-2.5 pr-4 text-xs text-slate-400 whitespace-nowrap" data-value="' . h($tx['occurred_at']) . '">' . $dt . '</td>'
                . '<td class="py-2.5 pr-4 font-medium">' . h($tx['merchant']) . $inst . $appSub . '</td>'
                . '<td class="py-2.5 pr-4 text-slate-300">' . h($tx['category']) . '</td>'
                . '<td class="py-2.5 pr-4 text-xs">' . $typeTxt . '</td>'
                . '<td class="py-2.5 pr-4 text-xs text-slate-400">' . h($tx['source']) . '</td>'
                . '<td class="py-2.5 pr-4">' . $stBadge . '</td>'
                . '<td class="py-2.5 text-right font-semibold whitespace-nowrap ' . $valColor . '" data-value="' . $amtVal . '">' . $sign . ' R$ ' . format_brl($amtVal) . '</td>'
                . '</tr>';
        }
        $tableHtml = '<div class="overflow-x-auto"><table class="w-full text-sm text-left" data-sortable><thead class="text-xs uppercase text-slate-400 border-b border-slate-800"><tr><th class="py-2.5 pr-4" data-sort="none" data-type="date">Data/Hora</th><th class="py-2.5 pr-4" data-sort="none" data-type="text">Despesa / Estabelecimento</th><th class="py-2.5 pr-4" data-sort="none" data-type="text">Categoria</th><th class="py-2.5 pr-4" data-sort="none" data-type="text">Tipo</th><th class="py-2.5 pr-4" data-sort="none" data-type="text">Origem</th><th class="py-2.5 pr-4" data-sort="none" data-type="text">Status</th><th class="py-2.5 text-right" data-sort="none" data-type="num">Valor</th></tr></thead><tbody class="divide-y divide-slate-800/70">' . $rows . '</tbody></table></div>';
    } else {
        $tableHtml = '<p class="text-sm text-slate-500">Nenhuma transação encontrada para os filtros selecionados.</p>';
    }

    $sortJs = sortable_js();
    echo <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gastos Detalhados — Zero-Input Finance</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    th[data-sort] { cursor: pointer; user-select: none; }
    th[data-sort]:hover { color: #e2e8f0; }
    th[data-sort]::after { content: " ↕"; opacity: 0.4; font-size: 0.7em; }
    th[data-sort="asc"]::after { content: " ↑"; opacity: 1; color: #34d399; }
    th[data-sort="desc"]::after { content: " ↓"; opacity: 1; color: #34d399; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
          <span class="text-2xl">💳</span>
          <div>
            <h1 class="text-lg font-bold tracking-tight">Gastos Detalhados</h1>
            <p class="text-xs text-slate-400">Filtros avançados e ordenação</p>
          </div>
        </div>
        <nav class="flex items-center gap-2">
          <a href="/dashboard" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors">Visão Geral</a>
          <a href="/transactions" class="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-emerald-300">Gastos Detalhados</a>
        </nav>
      </div>
      <a href="/logout" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300">Sair</a>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <section class="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <form method="get" action="/transactions" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Ano</label>
          <input type="number" name="year" min="2020" max="2100" value="{$yearVal}" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Mês</label>
          <select name="month" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100"><option value="0" {$selAllMonths}>Todos os meses</option>{$monthOpts}</select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Categoria</label>
          <select name="category" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100"><option value="">Todas</option>{$catOpts}</select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Tipo</label>
          <select name="tx_type" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100"><option value="">Todos</option><option value="EXPENSE" {$selExp}>Despesa</option><option value="INCOME" {$selInc}>Receita</option></select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Origem</label>
          <select name="source" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100"><option value="">Todas</option><option value="NOTIFICATION" {$selNotif}>Notificação</option><option value="FIXED_PLAN" {$selPlan}>Plano Fixo/Média</option><option value="MANUAL" {$selMan}>Manual</option></select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Status</label>
          <select name="status" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100"><option value="">Todos</option><option value="CONFIRMED" {$selConf}>Confirmado</option><option value="ESTIMATED" {$selEst}>Estimado</option><option value="PENDING" {$selPend}>Pendente</option></select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Valor Mín / Máx</label>
          <div class="flex gap-1.5">
            <input type="text" name="min_amount" value="{$minAmt}" placeholder="Mín" class="w-1/2 rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-xs text-slate-100" />
            <input type="text" name="max_amount" value="{$maxAmt}" placeholder="Máx" class="w-1/2 rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-xs text-slate-100" />
          </div>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Despesa / Busca</label>
          <input type="text" name="q" value="{$qVal}" placeholder="Ex: Uber, Enel..." class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100" />
        </div>
        <div class="sm:col-span-2 md:col-span-4 lg:col-span-8 flex items-center justify-end gap-2 pt-1">
          <a href="/transactions" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs text-slate-300">Limpar</a>
          <button type="submit" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white">Filtrar</button>
        </div>
      </form>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><p class="text-xs text-slate-400">Registros Encontrados</p><p class="text-xl font-bold text-slate-100 mt-1">{$result['total_count']}</p></div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><p class="text-xs text-slate-400">Receitas Filtradas</p><p class="text-xl font-bold text-emerald-400 mt-1">R$ {$result['total_income_brl']}</p></div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><p class="text-xs text-slate-400">Despesas Filtradas</p><p class="text-xl font-bold text-rose-400 mt-1">R$ {$result['total_expense_brl']}</p></div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><p class="text-xs text-slate-400">Saldo Líquido Filtrado</p><p class="text-xl font-bold mt-1 {$netColor}">R$ {$result['net_brl']}</p></div>
    </section>

    <section class="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold">Lista de Lançamentos</h2>
        <span class="text-xs text-slate-400">Clique em qualquer coluna para ordenar</span>
      </div>
      {$tableHtml}
    </section>
  </main>

  <script>{$sortJs}</script>
</body>
</html>
HTML;
    exit;
}
