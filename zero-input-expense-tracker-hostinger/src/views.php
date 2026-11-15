<?php
declare(strict_types=1);

function h(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
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

function render_dashboard(array $summary, array $plans, array $categories): void
{
    header('Content-Type: text/html; charset=utf-8');
    $period = h($summary['period']);
    $pendingBadge = $summary['pending_count'] > 0
        ? '<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-300">⏳ ' . (int)$summary['pending_count'] . ' pendente(s) no Telegram</span>'
        : '';
    $saldoColor = $summary['saldo_livre'] >= 0 ? 'text-emerald-300' : 'text-rose-400';

    $catOptions = '';
    foreach ($categories as $c) {
        $catOptions .= '<option value="' . h($c) . '">' . h($c) . '</option>';
    }

    $catListHtml = '';
    if ($summary['category_breakdown']) {
        $catListHtml = '<div class="h-52 flex items-center justify-center mb-4"><canvas id="categoryChart"></canvas></div><ul class="space-y-2 text-xs">';
        foreach ($summary['category_breakdown'] as $item) {
            $catListHtml .= '<li class="flex items-center justify-between text-slate-300"><span>' . h($item['category']) . '</span><span class="font-medium">R$ ' . h($item['total_brl']) . ' <span class="text-slate-500">(' . $item['percentage'] . '%)</span></span></li>';
        }
        $catListHtml .= '</ul>';
    } else {
        $catListHtml = '<p class="text-sm text-slate-500 py-12 text-center">Nenhuma despesa confirmada neste mês.</p>';
    }

    $txRowsHtml = '';
    if ($summary['transactions']) {
        $txRowsHtml = '<table class="w-full text-left text-sm"><thead class="text-xs uppercase text-slate-400 border-b border-slate-800"><tr><th class="pb-3 pr-4">Estabelecimento</th><th class="pb-3 pr-4">Categoria</th><th class="pb-3 pr-4">Origem</th><th class="pb-3 pr-4">Status</th><th class="pb-3 text-right">Valor</th></tr></thead><tbody class="divide-y divide-slate-800/60">';
        foreach ($summary['transactions'] as $tx) {
            $inst = ((int)$tx['installments'] > 1) ? '<span class="ml-1 text-xs text-slate-400">(' . (int)$tx['installments'] . 'x)</span>' : '';
            $statusBadge = $tx['status'] === 'CONFIRMED'
                ? '<span class="rounded px-2 py-0.5 text-xs bg-emerald-500/15 text-emerald-300">CONFIRMED</span>'
                : '<span class="rounded px-2 py-0.5 text-xs bg-amber-500/15 text-amber-300">PENDING</span>';
            $valClass = $tx['type'] === 'INCOME' ? 'text-emerald-400' : 'text-rose-400';
            $sign = $tx['type'] === 'INCOME' ? '+' : '-';
            $txRowsHtml .= '<tr class="hover:bg-slate-800/30"><td class="py-3 pr-4 font-medium text-slate-200">' . h($tx['merchant']) . $inst . '</td><td class="py-3 pr-4 text-slate-300">' . h($tx['category']) . '</td><td class="py-3 pr-4"><span class="rounded px-2 py-0.5 text-xs bg-slate-800 text-slate-300">' . h($tx['source']) . '</span></td><td class="py-3 pr-4">' . $statusBadge . '</td><td class="py-3 text-right font-semibold ' . $valClass . '">' . $sign . ' R$ ' . format_brl((float)$tx['amount']) . '</td></tr>';
        }
        $txRowsHtml .= '</tbody></table>';
    } else {
        $txRowsHtml = '<p class="text-sm text-slate-500 py-8 text-center">Nenhuma transação registrada neste mês.</p>';
    }

    $plansHtml = '';
    if ($plans) {
        foreach ($plans as $p) {
            $pColor = $p['type'] === 'INCOME' ? 'text-emerald-400' : 'text-rose-400';
            $plansHtml .= '<li class="flex items-center justify-between gap-2 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs"><div><p class="font-medium text-slate-200">' . h($p['title']) . '</p><p class="text-slate-400">Dia ' . (int)$p['day_of_month'] . ' • ' . h($p['category']) . ' • <span class="' . $pColor . '">R$ ' . format_brl((float)$p['amount']) . '</span></p></div><form method="post" action="/dashboard/plan/' . (int)$p['id'] . '/delete"><button type="submit" class="text-slate-500 hover:text-rose-400 px-1.5 py-1" title="Remover">✕</button></form></li>';
        }
    } else {
        $plansHtml = '<li class="text-xs text-slate-500 text-center py-4">Nenhum item fixo cadastrado.</li>';
    }

    $burnJson = json_encode($summary['burn_rate'], JSON_UNESCAPED_UNICODE);
    $catJson = json_encode($summary['category_breakdown'], JSON_UNESCAPED_UNICODE);

    echo <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard — Controle Financeiro</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <header class="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl">💳</span>
        <div>
          <h1 class="text-lg font-bold tracking-tight">Zero-Input Finance</h1>
          <p class="text-xs text-slate-400">Competência {$period}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        {$pendingBadge}
        <form method="get" action="/dashboard" class="flex items-center gap-2">
          <input type="month" name="month" value="{$period}" onchange="this.form.submit()"
            class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none" />
        </form>
        <a href="/logout" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors">Sair</a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Entradas do Mês</p>
        <p class="text-2xl font-bold text-emerald-400 mt-2">R$ {$summary['total_income_brl']}</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Saídas Fixas (Plano)</p>
        <p class="text-2xl font-bold text-sky-400 mt-2">R$ {$summary['fixed_expenses_brl']}</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Saídas Variáveis (Cartão/PIX)</p>
        <p class="text-2xl font-bold text-rose-400 mt-2">R$ {$summary['variable_expenses_brl']}</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Saldo Livre do Mês</p>
        <p class="text-2xl font-bold mt-2 {$saldoColor}">R$ {$summary['saldo_livre_brl']}</p>
      </div>
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
        <h2 class="text-base font-semibold mb-1">Breakdown por Categoria</h2>
        <p class="text-xs text-slate-400 mb-4">Total de saídas: R$ {$summary['total_expenses_brl']}</p>
        {$catListHtml}
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-x-auto">
        <h2 class="text-base font-semibold mb-4">Últimas Transações</h2>
        {$txRowsHtml}
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div>
          <h2 class="text-base font-semibold">Planejamento Anual (Fixos)</h2>
          <p class="text-xs text-slate-400">Lançados automaticamente pelo Cron diário</p>
        </div>
        <form method="post" action="/dashboard/plan" class="space-y-3 border-b border-slate-800 pb-5">
          <input name="title" type="text" required placeholder="Ex: Condomínio, Salário, Internet"
            class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none" />
          <div class="grid grid-cols-2 gap-2">
            <select name="type" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none">
              <option value="EXPENSE">Despesa Fixa</option>
              <option value="INCOME">Receita Fixa</option>
            </select>
            <input name="amount" type="number" step="0.01" min="0.01" required placeholder="Valor (R$)"
              class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <select name="category" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none">{$catOptions}</select>
            <input name="day_of_month" type="number" min="1" max="31" required placeholder="Dia (1-31)"
              class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none" />
          </div>
          <button type="submit" class="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors py-2 text-xs font-semibold text-white">+ Adicionar ao Plano</button>
        </form>
        <ul class="space-y-2.5 max-h-72 overflow-y-auto">{$plansHtml}</ul>
      </div>
    </section>
  </main>

  <script>
    const burnData = {$burnJson};
    const catData = {$catJson};
    new Chart(document.getElementById('burnRateChart'), {
      type: 'line',
      data: {
        labels: burnData.labels,
        datasets: [
          { label: 'Gasto Real Acumulado (R$)', data: burnData.actual, borderColor: '#fb7185', backgroundColor: 'rgba(251, 113, 133, 0.12)', fill: true, tension: 0.25 },
          { label: 'Ritmo Planejado (R$)', data: burnData.planned, borderColor: '#38bdf8', borderDash: [6, 4], fill: false, tension: 0 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#cbd5e1' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.08)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.08)' } }
        }
      }
    });
    if (catData.length > 0) {
      new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: { labels: catData.map(c => c.category), datasets: [{ data: catData.map(c => c.total), backgroundColor: ['#10b981','#38bdf8','#f43f5e','#f59e0b','#a855f7','#ec4899','#6366f1','#14b8a6'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
  </script>
</body>
</html>
HTML;
    exit;
}
