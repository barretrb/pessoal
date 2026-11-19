<?php
declare(strict_types=1);

function h(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
}

function build_period_select_options(string $selectedPeriod, array $availablePeriods = []): string
{
    $periods = $availablePeriods;
    if (!in_array($selectedPeriod, $periods, true) && preg_match('/^\d{4}-\d{2}$/', $selectedPeriod)) {
        $periods[] = $selectedPeriod;
    }
    if (empty($periods)) {
        $periods = [$selectedPeriod];
    }
    rsort($periods);
    $html = '';
    foreach ($periods as $val) {
        if (!preg_match('/^(\d{4})-(\d{2})$/', (string)$val, $m)) {
            continue;
        }
        $y = (int)$m[1];
        $mIdx = max(1, min(12, (int)$m[2]));
        $label = MONTH_NAMES_PT[$mIdx - 1] . '/' . $y;
        $sel = ($val === $selectedPeriod) ? 'selected' : '';
        $html .= '<option value="' . $val . '" ' . $sel . '>' . $label . '</option>';
    }
    $html .= '<option value="__CUSTOM__">⌨️ Digitar período...</option>';
    return $html;
}

function build_period_select_options_legacy(string $selectedPeriod): string
{
    $selYear = (int)substr($selectedPeriod, 0, 4);
    if ($selYear < 2020 || $selYear > 2100) {
        $selYear = (int)date('Y');
    }
    $years = [$selYear - 1, $selYear, $selYear + 1];
    $html = '';
    foreach ($years as $y) {
        for ($m = 1; $m <= 12; $m++) {
            $val = sprintf('%04d-%02d', $y, $m);
            $label = MONTH_NAMES_PT[$m - 1] . '/' . $y;
            $sel = ($val === $selectedPeriod) ? 'selected' : '';
            $html .= '<option value="' . $val . '" ' . $sel . '>' . $label . '</option>';
        }
    }
    return $html;
}

function render_categories_modal(array $categories, string $redirectTo): string
{
    $redir = h($redirectTo);
    $rows = '';
    foreach ($categories as $cat) {
        $cEsc = h($cat);
        $delBtn = ($cat !== 'Outros')
            ? '<form method="post" action="/dashboard/categories/delete" class="inline" onsubmit="return confirm(\'Excluir a categoria ' . $cEsc . '? Os itens dela irão para Outros.\')"><input type="hidden" name="name" value="' . $cEsc . '" /><input type="hidden" name="redirect_to" value="' . $redir . '" /><button type="submit" class="rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 px-2.5 py-1.5 text-xs">Excluir</button></form>'
            : '<span class="text-[11px] text-slate-500 px-2">Padrão</span>';
        $rows .= '<div class="flex items-center gap-2">'
            . '<form method="post" action="/dashboard/categories/rename" class="flex-1 flex items-center gap-2">'
            . '<input type="hidden" name="old_name" value="' . $cEsc . '" />'
            . '<input type="hidden" name="redirect_to" value="' . $redir . '" />'
            . '<input type="text" name="new_name" value="' . $cEsc . '" required class="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none" />'
            . '<button type="submit" class="rounded-lg bg-sky-600 hover:bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white">Renomear</button>'
            . '</form>'
            . $delBtn
            . '</div>';
    }
    return <<<HTML
  <div id="categoriesModal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[85vh] flex flex-col">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold">🏷️ Gerenciar Categorias</h3>
          <p class="text-[11px] text-slate-400">Renomeie (atualiza todos os gastos), crie ou exclua categorias.</p>
        </div>
        <button type="button" onclick="closeCategoriesModal()" class="text-slate-400 hover:text-slate-200 text-lg">&times;</button>
      </div>
      <form method="post" action="/dashboard/categories/add" class="flex items-center gap-2 pb-3 border-b border-slate-800">
        <input type="hidden" name="redirect_to" value="{$redir}" />
        <input type="text" name="name" required placeholder="Nova categoria (ex: Viagens, Pet...)" class="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none" />
        <button type="submit" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white whitespace-nowrap">+ Criar</button>
      </form>
      <div class="space-y-2 overflow-y-auto pr-1 flex-1">
        {$rows}
      </div>
      <div class="flex justify-end pt-2 border-t border-slate-800">
        <button type="button" onclick="closeCategoriesModal()" class="rounded-lg border border-slate-700 px-4 py-1.5 text-xs text-slate-300">Fechar</button>
      </div>
    </div>
  </div>
  <script>
    function openCategoriesModal() { document.getElementById('categoriesModal').classList.remove('hidden'); }
    function closeCategoriesModal() { document.getElementById('categoriesModal').classList.add('hidden'); }
    function handlePeriodSelect(sel) {
      if (sel.value === '__CUSTOM__') {
        const raw = window.prompt('Digite o período desejado (ex: 2026-12 ou 12/2026):', sel.getAttribute('data-current') || '');
        if (!raw || !raw.trim()) {
          sel.value = sel.getAttribute('data-current') || sel.options[0].value;
          return;
        }
        let val = raw.trim();
        const mBr = val.match(/^(\d{1,2})\/(\d{4})$/);
        if (mBr) {
          val = mBr[2] + '-' + String(mBr[1]).padStart(2, '0');
        }
        if (!/^\d{4}-\d{2}$/.test(val)) {
          alert('Formato inválido. Use AAAA-MM (ex: 2026-12) ou MM/AAAA (ex: 12/2026).');
          sel.value = sel.getAttribute('data-current') || sel.options[0].value;
          return;
        }
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        opt.selected = true;
        sel.appendChild(opt);
      }
      sel.form.submit();
    }
    function handleTxYearSelect(sel) {
      if (sel.value === '__CUSTOM__') {
        const raw = window.prompt('Digite o ano (ex: 2026):', sel.getAttribute('data-current') || '');
        if (!raw || !/^\d{4}$/.test(raw.trim())) {
          sel.value = sel.getAttribute('data-current') || sel.options[0].value;
          return;
        }
        const opt = document.createElement('option');
        opt.value = raw.trim();
        opt.selected = true;
        sel.appendChild(opt);
      }
      sel.form.submit();
    }
    function handleTxMonthSelect(sel) {
      if (sel.value === '__CUSTOM__') {
        const raw = window.prompt('Digite o número do mês (1 a 12, ou 0 para todos):', sel.getAttribute('data-current') || '');
        const n = parseInt((raw || '').trim(), 10);
        if (isNaN(n) || n < 0 || n > 12) {
          sel.value = sel.getAttribute('data-current') || '0';
          return;
        }
        const opt = document.createElement('option');
        opt.value = String(n);
        opt.selected = true;
        sel.appendChild(opt);
      }
      sel.form.submit();
    }
  </script>
HTML;
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

function split_and_collapse_js(): string
{
    return <<<JS
    function updateTxRowUI(item) {
      const row = document.querySelector('tr[data-tx-id="' + item.id + '"]');
      if (!row) return;
      const amtCell = row.querySelector('.tx-amount-cell');
      if (amtCell) {
        const sign = amtCell.getAttribute('data-sign') || '-';
        amtCell.setAttribute('data-value', String(item.amount));
        const sub = item.is_shared
          ? '<span class="tx-full-sub block text-[10px] text-violet-300/80">50% de R$ ' + item.full_amount_brl + '</span>'
          : '<span class="tx-full-sub hidden"></span>';
        amtCell.innerHTML = sign + ' R$ ' + item.amount_brl + sub;
      }
      const badge = row.querySelector('.tx-shared-badge');
      if (badge) {
        badge.classList.toggle('hidden', !item.is_shared);
      }
      const btn = row.querySelector('.tx-split-btn');
      if (btn) {
        btn.className = 'tx-split-btn text-[11px] px-1.5 py-0.5 rounded mr-2 ' + (item.is_shared
          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
          : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700');
      }
    }

    async function toggleSplitAjax(btn) {
      const id = btn.getAttribute('data-id');
      if (!id) return;
      btn.disabled = true;
      btn.style.opacity = '0.5';
      try {
        const res = await fetch('/dashboard/transaction/' + id + '/toggle-split', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'fetch' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok) {
            updateTxRowUI(data);
          }
        }
      } finally {
        btn.disabled = false;
        btn.style.opacity = '';
      }
    }

    function updateBulkBar() {
      const checks = Array.from(document.querySelectorAll('.tx-row-check:checked'));
      const bar = document.getElementById('bulkSplitBar');
      const countEl = document.getElementById('bulkSelectedCount');
      if (!bar || !countEl) return;
      countEl.textContent = String(checks.length);
      bar.classList.toggle('hidden', checks.length === 0);
    }

    function toggleAllTxChecks(master) {
      document.querySelectorAll('.tx-row-check').forEach(cb => {
        cb.checked = master.checked;
      });
      updateBulkBar();
    }

    function clearTxSelection() {
      document.querySelectorAll('.tx-row-check, .tx-select-all').forEach(cb => {
        cb.checked = false;
      });
      updateBulkBar();
    }

    async function applyBulkSplit(mode) {
      const ids = Array.from(document.querySelectorAll('.tx-row-check:checked'))
        .map(cb => parseInt(cb.value, 10))
        .filter(n => !isNaN(n) && n > 0);
      if (ids.length === 0) return;
      const bar = document.getElementById('bulkSplitBar');
      if (bar) bar.style.opacity = '0.6';
      try {
        const res = await fetch('/dashboard/transactions/bulk-split', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ ids: ids, mode: mode })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.updated)) {
            data.updated.forEach(updateTxRowUI);
          }
          clearTxSelection();
        }
      } finally {
        if (bar) bar.style.opacity = '';
      }
    }

    function setSectionCollapsed(section, collapsed) {
      const id = section.getAttribute('data-collapse-id');
      const body = section.querySelector('.collapse-body');
      const icon = section.querySelector('.collapse-icon');
      if (!body) return;
      body.classList.toggle('hidden', collapsed);
      if (icon) icon.textContent = collapsed ? '▸' : '▾';
      if (id) {
        try { localStorage.setItem('fc_col_' + id, collapsed ? '1' : '0'); } catch (e) {}
      }
    }

    function toggleSectionCollapse(btn) {
      const section = btn.closest('section[data-collapse-id]');
      if (!section) return;
      const body = section.querySelector('.collapse-body');
      if (!body) return;
      setSectionCollapsed(section, !body.classList.contains('hidden'));
    }

    function toggleAllSections(collapse) {
      document.querySelectorAll('section[data-collapse-id]').forEach(sec => {
        setSectionCollapsed(sec, collapse);
      });
    }

    document.querySelectorAll('section[data-collapse-id]').forEach(sec => {
      const id = sec.getAttribute('data-collapse-id');
      if (!id) return;
      try {
        if (localStorage.getItem('fc_col_' + id) === '1') {
          setSectionCollapsed(sec, true);
        }
      } catch (e) {}
    });
JS;
}

function render_tx_table(array $txs, bool $showAppSub = false, string $emptyMsg = 'Nenhuma transação encontrada.'): string
{
    if (empty($txs)) {
        return '<p class="text-sm text-slate-500">' . h($emptyMsg) . '</p>';
    }

    $rows = '';
    foreach ($txs as $tx) {
        $dt = (new DateTimeImmutable($tx['occurred_at'], new DateTimeZone('UTC')))
            ->setTimezone(new DateTimeZone('America/Sao_Paulo'))->format('d/m H:i');
        $inst = (int)$tx['installments'] > 1 ? ' <span class="text-xs text-slate-400">(' . (int)$tx['installments'] . 'x)</span>' : '';
        $appSub = ($showAppSub && !empty($tx['app_name'])) ? ' · ' . h($tx['app_name']) : '';
        if ($tx['status'] === 'CONFIRMED') {
            $stBadge = '<span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">Confirmado</span>';
        } elseif ($tx['status'] === 'ESTIMATED') {
            $stBadge = '<span class="text-[11px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300">Estimado</span>';
        } else {
            $stBadge = '<span class="text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">Pendente</span>';
        }
        $sign = $tx['type'] === 'INCOME' ? '+' : '-';
        $valColor = $tx['type'] === 'INCOME' ? 'text-emerald-400' : 'text-rose-400';
        $amtVal = (float)$tx['amount'];
        $txId = (int)$tx['id'];
        $occLocalDate = (new DateTimeImmutable($tx['occurred_at'], new DateTimeZone('UTC')))
            ->setTimezone(new DateTimeZone('America/Sao_Paulo'))->format('Y-m-d');
        $isTxShared = ((int)($tx['is_shared'] ?? 0) === 1);
        $sharedBadgeClass = $isTxShared ? '' : 'hidden ';
        $sharedBadge = ' <span class="tx-shared-badge ' . $sharedBadgeClass . 'text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">50/50</span>';
        $fullSub = ($isTxShared && !empty($tx['full_amount']))
            ? '<span class="tx-full-sub block text-[10px] text-violet-300/80">50% de R$ ' . format_brl((float)$tx['full_amount']) . '</span>'
            : '<span class="tx-full-sub hidden"></span>';

        $checkboxCell = $tx['type'] === 'EXPENSE'
            ? '<td class="py-2 pr-2 w-6"><input type="checkbox" class="tx-row-check rounded border-slate-700 bg-slate-950 text-violet-500" value="' . $txId . '" onchange="updateBulkBar()" /></td>'
            : '<td class="py-2 pr-2 w-6"></td>';

        $splitBtn = $tx['type'] === 'EXPENSE'
            ? '<button type="button" data-id="' . $txId . '" onclick="toggleSplitAjax(this)" title="Dividir 50/50 (Settle Up)" class="tx-split-btn text-[11px] px-1.5 py-0.5 rounded mr-2 '
              . ($isTxShared ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700')
              . '">÷2</button>'
            : '';

        $editBtn = '<button type="button" data-id="' . $txId . '" data-merchant="' . h($tx['merchant']) . '" data-category="' . h($tx['category']) . '" data-date="' . $occLocalDate . '" onclick="openEditTxModal(this)" class="text-xs text-sky-400 hover:text-sky-300">Editar</button>';

        $rows .= '<tr data-tx-id="' . $txId . '" class="hover:bg-slate-800/30">'
            . $checkboxCell
            . '<td class="py-2 pr-3 text-xs text-slate-400 whitespace-nowrap" data-value="' . h($tx['occurred_at']) . '">' . $dt . '</td>'
            . '<td class="py-2 pr-3 font-medium">' . h($tx['merchant']) . $inst . $sharedBadge . '<span class="block text-[10px] text-slate-500">' . h($tx['source']) . $appSub . '</span></td>'
            . '<td class="py-2 pr-3 text-slate-300 whitespace-nowrap">' . h($tx['category']) . '</td>'
            . '<td class="py-2 pr-3 whitespace-nowrap">' . $stBadge . '</td>'
            . '<td class="tx-amount-cell py-2 pr-3 text-right font-semibold whitespace-nowrap ' . $valColor . '" data-sign="' . $sign . '" data-value="' . $amtVal . '">' . $sign . ' R$ ' . format_brl($amtVal) . $fullSub . '</td>'
            . '<td class="py-2 text-right whitespace-nowrap">' . $splitBtn . $editBtn . '</td>'
            . '</tr>';
    }

    $bulkBar = '<div id="bulkSplitBar" class="hidden mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs">'
        . '<span class="text-violet-200"><strong id="bulkSelectedCount">0</strong> despesa(s) selecionada(s)</span>'
        . '<div class="flex flex-wrap items-center gap-1.5">'
        . '<button type="button" onclick="applyBulkSplit(\'half\')" class="rounded bg-violet-600 hover:bg-violet-500 px-2.5 py-1 font-semibold text-white">👥 Aplicar 50/50</button>'
        . '<button type="button" onclick="applyBulkSplit(\'full\')" class="rounded bg-slate-700 hover:bg-slate-600 px-2.5 py-1 font-semibold text-slate-100">💯 Restaurar 100%</button>'
        . '<button type="button" onclick="applyBulkSplit(\'toggle\')" class="rounded border border-slate-600 hover:bg-slate-800 px-2.5 py-1 text-slate-200">🔄 Inverter (÷2)</button>'
        . '<button type="button" onclick="clearTxSelection()" class="px-2 py-1 text-slate-400 hover:text-slate-200">Limpar</button>'
        . '</div></div>';

    return $bulkBar
        . '<div class="overflow-x-auto"><table class="w-full text-xs sm:text-sm text-left" data-sortable>'
        . '<thead class="text-[11px] uppercase text-slate-400 border-b border-slate-800"><tr>'
        . '<th class="py-2 pr-2 w-6"><input type="checkbox" class="tx-select-all rounded border-slate-700 bg-slate-950 text-violet-500" onchange="toggleAllTxChecks(this)" title="Selecionar todas" /></th>'
        . '<th class="py-2 pr-3" data-sort="none" data-type="date">Data</th>'
        . '<th class="py-2 pr-3" data-sort="none" data-type="text">Despesa / Estabelecimento</th>'
        . '<th class="py-2 pr-3" data-sort="none" data-type="text">Categoria</th>'
        . '<th class="py-2 pr-3" data-sort="none" data-type="text">Status</th>'
        . '<th class="py-2 pr-3 text-right" data-sort="none" data-type="num">Valor</th>'
        . '<th class="py-2 text-right">Rateio / Ação</th>'
        . '</tr></thead><tbody class="divide-y divide-slate-800/70">' . $rows . '</tbody></table></div>';
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
      <p class="text-sm text-slate-400 mt-1">FinControl</p>
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
        ? '<span class="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium text-amber-300" title="Pendentes no Telegram">⏳ ' . (int)$summary['pending_count'] . '</span>'
        : '';
    $saldoBorder = $summary['saldo_livre'] >= 0 ? 'border-emerald-400/40' : 'border-rose-500/40';
    $saldoColor = $summary['saldo_livre'] >= 0 ? 'text-emerald-300' : 'text-rose-400';

    $catOptions = '';
    foreach ($categories as $c) {
        $catOptions .= '<option value="' . h($c) . '">' . h($c) . '</option>';
    }
    $catOptionsWithNew = $catOptions . '<option value="__NEW__">+ Nova categoria...</option>';
    $periodSelectOpts = build_period_select_options($summary['period'], $summary['available_periods'] ?? []);
    $monthLabelPt = MONTH_NAMES_PT[$monthNum - 1] . '/' . $yearNum;
    $billingDatalistOpts = '';
    foreach ($summary['available_periods'] ?? [$summary['period']] as $ap) {
        $billingDatalistOpts .= '<option value="' . h((string)$ap) . '"></option>';
    }
    $catModalHtml = render_categories_modal($categories, "/dashboard?month={$period}");

    // Consumption Bills HTML
    $pendingBills = array_values(array_filter($summary['consumption_bills'] ?? [], fn($b) => ($b['status'] ?? '') !== 'CONFIRMED'));
    $billsHtml = '';
    if (!empty($pendingBills)) {
        $billsHtml .= '<div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">';
        foreach ($pendingBills as $b) {
            $bStatus = $b['status'];
            if ($bStatus === 'CONFIRMED') {
                $bBadge = '<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Real</span>';
                $btnLabel = 'Corrigir ' . $monthLabelPt;
            } elseif ($bStatus === 'ESTIMATED') {
                $bBadge = '<span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">Estimado</span>';
                $btnLabel = 'Confirmar ' . $monthLabelPt;
            } else {
                $bBadge = '<span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Não provisionado</span>';
                $btnLabel = 'Confirmar ' . $monthLabelPt;
            }
            $formHtml = '';
            if (!empty($b['transaction_id'])) {
                $valAttr = number_format((float)$b['current_amount'], 2, '.', '');
                $txIdInt = (int)$b['transaction_id'];
                $formHtml = <<<HTML
                <form method="post" action="/dashboard/reconcile" class="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <input type="hidden" name="transaction_id" value="{$txIdInt}" />
                  <input type="hidden" name="month" value="{$period}" />
                  <input type="number" step="0.01" min="0.01" name="real_amount" value="{$valAttr}" required class="w-28 sm:w-36 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none" />
                  <button type="submit" class="flex-1 sm:flex-none rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors">{$btnLabel}</button>
                </form>
HTML;
            }
            $bTitle = h($b['title']);
            $bMethod = h($b['payment_method']);
            $bDue = (int)$b['due_day'];
            $bCurBrl = h($b['current_amount_brl']);
            $bAvgBrl = h($b['rolling_avg_3m_brl']);
            $billsHtml .= <<<HTML
            <div class="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex flex-wrap items-center gap-1.5">
                    <h3 class="font-semibold text-sm text-slate-100">{$bTitle}</h3>
                    {$bBadge}
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5">Competência: <strong class="text-sky-300">{$monthLabelPt}</strong> · Venc. dia {$bDue}/{$monthNum}/{$yearNum} · {$bMethod}</p>
                </div>
                <div class="text-right">
                  <p class="text-base sm:text-lg font-bold text-sky-300">R$ {$bCurBrl}</p>
                  <p class="text-[11px] text-slate-400">Média 3M: R$ {$bAvgBrl}</p>
                </div>
              </div>
              {$formHtml}
            </div>
HTML;
        }
        $billsHtml .= '</div>';
    } else {
        $billsHtml = '<p class="text-sm text-slate-400">Nenhuma conta de consumo cadastrada.</p>';
    }

    $consumptionHideClass = empty($pendingBills) ? 'hidden' : '';
    if (false) {
        $consumptionSectionHtml = <<<HTML
    <section data-collapse-id="consumption" class="{$consumptionHideClass} bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
      <div class="flex items-center justify-between gap-2 mb-3">
        <div>
          <h2 class="text-sm sm:text-base font-semibold">Contas de Consumo Pendentes — <span class="text-sky-400">Mês: {$monthLabelPt}</span></h2>
          <p class="text-xs text-slate-400">Confirme o valor real da conta quando ela chegar (após confirmado, este aviso some automaticamente).</p>
        </div>
        <button type="button" onclick="toggleSectionCollapse(this)" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-300 shrink-0"><span class="collapse-icon">▾</span></button>
      </div>
      <div class="collapse-body">{$billsHtml}</div>
    </section>
HTML;
    }

    // Category Breakdown
    $catListHtml = '';
    if ($summary['category_breakdown']) {
        $items = '';
        foreach ($summary['category_breakdown'] as $item) {
            $items .= '<li class="flex items-center justify-between text-slate-300 border-b border-slate-800/50 pb-1"><span>' . h($item['category']) . '</span><span class="font-medium">R$ ' . h($item['total_brl']) . ' <span class="text-slate-400">(' . $item['percentage'] . '%)</span></span></li>';
        }
        $catListHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"><div class="h-52 flex items-center justify-center"><canvas id="categoryChart"></canvas></div><ul class="space-y-2 text-xs sm:text-sm">' . $items . '</ul></div>';
    } else {
        $catListHtml = '<div class="py-8 text-center text-sm text-slate-500">Nenhuma despesa registrada neste mês.</div>';
    }

    // Yearly Rows (2 dimensions: Receita vs Despesa)
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
            . '<td class="py-2 pr-3 font-medium whitespace-nowrap" data-value="' . $mNum . '">' . h($ym['label']) . '/' . $yearlyYear . '</td>'
            . '<td class="py-2 pr-3 text-right text-emerald-400 whitespace-nowrap" data-value="' . $ym['income'] . '">R$ ' . h($ym['income_brl']) . '</td>'
            . '<td class="py-2 pr-3 text-right text-rose-400 whitespace-nowrap" data-value="' . $ym['total_expenses'] . '">R$ ' . h($ym['total_expenses_brl']) . '</td>'
            . '<td class="py-2 pr-3 text-right font-semibold whitespace-nowrap ' . $ymSaldoColor . '" data-value="' . $ym['saldo_livre'] . '">R$ ' . h($ym['saldo_livre_brl']) . '</td>'
            . '<td class="py-2 text-right whitespace-nowrap"><a href="/dashboard?month=' . $mPeriod . '" class="text-xs text-sky-400 hover:text-sky-300 mr-2">Abrir</a><a href="/transactions?year=' . $yearlyYear . '&month=' . $mNum . '" class="text-xs text-slate-400 hover:text-slate-200">Lista</a></td>'
            . '</tr>';
    }

    // Plans Table (with inline Category editing!)
    $plansHtml = '';
    if ($plans) {
        $rows = '';
        foreach ($plans as $p) {
            $badge = $p['type'] === 'INCOME'
                ? '<span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">Receita</span>'
                : '<span class="text-[11px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-300">Despesa</span>';
            $ptLabel = ($p['plan_type'] ?? 'FIXED') === 'ROLLING_AVERAGE' ? 'Média Móvel' : 'Fixo';
            $pmText = h($p['payment_method'] ?? 'PIX');
            $dayNum = (int)$p['day_of_month'];
            $amtVal = (float)$p['amount'];
            $pId = (int)$p['id'];

            $planCatOpts = '';
            foreach ($categories as $c) {
                $sel = ($p['category'] === $c) ? 'selected' : '';
                $planCatOpts .= '<option value="' . h($c) . '" ' . $sel . '>' . h($c) . '</option>';
            }
            $catSelectHtml = '<form method="post" action="/dashboard/plan/' . $pId . '/update" class="inline">'
                . '<input type="hidden" name="month" value="' . $period . '" />'
                . '<input type="hidden" name="new_category" value="" />'
                . '<select name="category" data-prev="' . h($p['category']) . '" onchange="handleInlinePlanCategory(this)" class="rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none">'
                . $planCatOpts . '<option value="__NEW__">+ Nova categoria...</option>'
                . '</select></form>';

            $planSplit = (float)($p['split_ratio'] ?? 1.0);
            $isPlanShared = $planSplit < 0.99;
            $splitBtnClass = $isPlanShared
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200';
            $splitBtnText = $isPlanShared ? '50/50' : '100%';
            $splitToggleHtml = '<form method="post" action="/dashboard/plan/' . $pId . '/toggle-split" class="inline mr-2">'
                . '<input type="hidden" name="month" value="' . $period . '" />'
                . '<button type="submit" title="Alternar rateio 50/50 Settle Up" class="text-[11px] px-2 py-0.5 rounded ' . $splitBtnClass . '">' . $splitBtnText . '</button></form>';
            $effPlanAmt = $isPlanShared ? round($amtVal * $planSplit, 2) : $amtVal;
            $amtSub = $isPlanShared ? '<span class="block text-[10px] text-violet-300/80">50% de R$ ' . format_brl($amtVal) . '</span>' : '';

            $rows .= '<tr class="hover:bg-slate-800/30">'
                . '<td class="py-2 pr-3 text-slate-300 whitespace-nowrap" data-value="' . $dayNum . '">Dia ' . sprintf('%02d', $dayNum) . '</td>'
                . '<td class="py-2 pr-3 font-medium">' . h($p['title']) . '<span class="block text-[10px] text-slate-400">' . $ptLabel . ' · ' . $pmText . '</span></td>'
                . '<td class="py-2 pr-3 whitespace-nowrap">' . $badge . '</td>'
                . '<td class="py-2 pr-3" data-value="' . h($p['category']) . '">' . $catSelectHtml . '</td>'
                . '<td class="py-2 pr-3 text-right font-medium whitespace-nowrap" data-value="' . $effPlanAmt . '">R$ ' . format_brl($effPlanAmt) . $amtSub . '</td>'
                . '<td class="py-2 text-right whitespace-nowrap">' . $splitToggleHtml . '<form method="post" action="/dashboard/plan/' . $pId . '/delete" class="inline"><button type="submit" class="text-xs text-rose-400 hover:text-rose-300">Remover</button></form></td>'
                . '</tr>';
        }
        $plansHtml = '<div class="overflow-x-auto"><table class="w-full text-xs sm:text-sm text-left" data-sortable><thead class="text-[11px] uppercase text-slate-400 border-b border-slate-800"><tr><th class="py-2 pr-3" data-sort="none" data-type="num">Dia</th><th class="py-2 pr-3" data-sort="none" data-type="text">Descrição</th><th class="py-2 pr-3" data-sort="none" data-type="text">Tipo</th><th class="py-2 pr-3" data-sort="none" data-type="text">Categoria</th><th class="py-2 pr-3 text-right" data-sort="none" data-type="num">Sua Parte</th><th class="py-2 text-right">Rateio / Ação</th></tr></thead><tbody class="divide-y divide-slate-800/70">' . $rows . '</tbody></table></div>';
    } else {
        $plansHtml = '<p class="text-sm text-slate-500">Nenhum item cadastrado no planejamento anual.</p>';
    }

    $txsHtml = render_tx_table($summary['transactions'], false, 'Nenhuma transação registrada nesta competência.');

    $catJson = json_encode($summary['category_breakdown'], JSON_UNESCAPED_UNICODE);
    $yearlyJson = json_encode($yearly['months'], JSON_UNESCAPED_UNICODE);
    $sortJs = sortable_js();
    $splitCollapseJs = split_and_collapse_js();
    $importBanner = '';
    if (isset($_GET['imp'])) {
        $impCount = (int)$_GET['imp'];
        $dupCount = (int)($_GET['dup'] ?? 0);
        $ignCount = (int)($_GET['ign'] ?? 0);
        $importBanner = '<div class="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-200 flex items-center justify-between">'
            . "<span>📄 Fatura processada: <strong>{$impCount}</strong> importadas · <strong>{$dupCount}</strong> duplicadas ignoradas · <strong>{$ignCount}</strong> pagamentos/linhas ignoradas.</span>"
            . '<a href="/dashboard?month=' . $period . '" class="text-emerald-300 underline ml-3">Fechar</a></div>';
    }

    echo <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard — FinControl</title>
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
  <!-- Compact Mobile-First Header -->
  <header class="border-b border-slate-800 bg-slate-900/90">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-lg">💳</span>
        <h1 class="text-sm sm:text-base font-bold tracking-tight truncate">FinControl</h1>
        <nav class="hidden sm:flex items-center gap-1.5 ml-3">
          <a href="/dashboard?month={$period}" class="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-semibold text-emerald-300">Visão Geral</a>
          <a href="/transactions?year={$yearNum}&month={$monthNum}" class="px-2.5 py-1 rounded-md hover:bg-slate-800 text-xs font-medium text-slate-300">Gastos</a>
          <a href="/manual" class="px-2.5 py-1 rounded-md hover:bg-slate-800 text-xs font-medium text-slate-300">Ajuda</a>
        </nav>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2">
        {$pendingBadge}
        <form method="get" action="/dashboard" class="flex items-center">
          <select name="month" data-current="{$period}" onchange="handlePeriodSelect(this)" class="rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none">{$periodSelectOpts}</select>
        </form>
        <button type="button" onclick="openCategoriesModal()" class="rounded-md border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 whitespace-nowrap" title="Editar / Gerenciar Categorias">🏷️ <span class="hidden sm:inline">Categorias</span></button>
        <button type="button" onclick="openImportModal()" class="rounded-md bg-sky-600 hover:bg-sky-500 px-2.5 py-1 text-xs font-semibold text-white whitespace-nowrap">📄 <span class="hidden sm:inline">Importar Fatura</span></button>
        <button type="button" onclick="openQuickModal('INCOME')" class="rounded-md bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white whitespace-nowrap">+ <span class="hidden sm:inline">Receita / Gasto</span></button>
        <a href="/transactions?year={$yearNum}&month={$monthNum}" class="sm:hidden rounded-md border border-slate-700 hover:bg-slate-800 px-2 py-1 text-xs text-slate-300">Lista</a>
        <a href="/manual" title="Ajuda / Manual" class="sm:hidden rounded-md border border-slate-700 hover:bg-slate-800 px-2 py-1 text-xs text-slate-300">?</a>
        <a href="/logout" class="rounded-md border border-slate-700 hover:bg-slate-800 px-2 py-1 text-xs text-slate-300">Sair</a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
    {$importBanner}
    <!-- 2x2 KPIs on Mobile -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 sm:p-5">
        <p class="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-emerald-300/80">Receita Total</p>
        <p class="text-lg sm:text-2xl font-bold text-emerald-400 mt-1">R$ {$summary['total_income_brl']}</p>
        <p class="hidden sm:block text-[11px] text-slate-400 mt-1">Salário + extras</p>
      </div>
      <div class="bg-slate-900 border border-sky-500/30 rounded-xl p-3.5 sm:p-5">
        <p class="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-sky-300/80">Fixos &amp; Médias</p>
        <p class="text-lg sm:text-2xl font-bold text-sky-400 mt-1">R$ {$summary['fixed_expenses_brl']}</p>
        <p class="hidden sm:block text-[11px] text-slate-400 mt-1">Provisionado + consumo</p>
      </div>
      <div class="bg-slate-900 border border-rose-500/30 rounded-xl p-3.5 sm:p-5">
        <p class="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-rose-300/80">Variáveis (Cartão)</p>
        <p class="text-lg sm:text-2xl font-bold text-rose-400 mt-1">R$ {$summary['variable_expenses_brl']}</p>
        <p class="hidden sm:block text-[11px] text-slate-400 mt-1">Cartão, PIX e avulsos</p>
      </div>
      <div class="bg-slate-900 border {$saldoBorder} rounded-xl p-3.5 sm:p-5">
        <p class="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-slate-300">Saldo Livre Atual</p>
        <p class="text-lg sm:text-2xl font-bold mt-1 {$saldoColor}">R$ {$summary['saldo_livre_brl']}</p>
        <p class="hidden sm:block text-[11px] text-slate-400 mt-1">Disponível no mês</p>
      </div>
    </section>

    <div class="flex items-center justify-end gap-2">
      <button type="button" onclick="toggleAllSections(true)" class="rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300">▸ Recolher blocos</button>
      <button type="button" onclick="toggleAllSections(false)" class="rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300">▾ Expandir blocos</button>
    </div>

    <section data-collapse-id="consumption" class="{$consumptionHideClass} bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
      <div class="flex items-center justify-between gap-2 mb-3">
        <div>
          <h2 class="text-sm sm:text-base font-semibold">Contas de Consumo (Média vs. Real) — <span class="text-sky-400">Mês: {$monthLabelPt}</span></h2>
          <p class="text-xs text-slate-400">Ao confirmar o valor real, substitui a estimativa sem duplicar e atualiza a média móvel 3M.</p>
        </div>
        <button type="button" onclick="toggleSectionCollapse(this)" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-300 shrink-0"><span class="collapse-icon">▾</span></button>
      </div>
      <div class="collapse-body">{$billsHtml}</div>
    </section>

    <section data-collapse-id="categories" class="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
      <div class="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 class="text-sm sm:text-base font-semibold">Distribuição por Categoria</h2>
          <p class="text-xs text-slate-400">Total de despesas no mês: R$ {$summary['total_expenses_brl']}</p>
        </div>
        <button type="button" onclick="toggleSectionCollapse(this)" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-300 shrink-0"><span class="collapse-icon">▾</span></button>
      </div>
      <div class="collapse-body">{$catListHtml}</div>
    </section>

    <section data-collapse-id="yearly" class="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-sm sm:text-base font-semibold">Visão do Ano por Mês ({$yearlyYear})</h2>
          <p class="text-xs text-slate-400">Receita vs. Despesa total por mês.</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1">
            Saldo Anual: <strong class="{$yearlySaldoColor}">R$ {$yearlySaldoBrl}</strong>
          </div>
          <button type="button" onclick="toggleSectionCollapse(this)" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-300 shrink-0"><span class="collapse-icon">▾</span></button>
        </div>
      </div>
      <div class="collapse-body space-y-4">
        <div class="h-56 sm:h-64"><canvas id="yearlyChart"></canvas></div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs sm:text-sm text-left" data-sortable>
            <thead class="text-[11px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th class="py-2 pr-3" data-sort="none" data-type="num">Mês</th>
                <th class="py-2 pr-3 text-right" data-sort="none" data-type="num">Receita</th>
                <th class="py-2 pr-3 text-right" data-sort="none" data-type="num">Despesa</th>
                <th class="py-2 pr-3 text-right" data-sort="none" data-type="num">Saldo</th>
                <th class="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/70">{$yearlyRows}</tbody>
          </table>
        </div>
      </div>
    </section>

    <section data-collapse-id="plan" class="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-5">
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="text-sm sm:text-base font-semibold">Planejamento Anual (Receitas, Fixos &amp; Médias)</h2>
          <p class="text-xs text-slate-400">Altere a categoria diretamente na lista abaixo ou adicione um novo item.</p>
        </div>
        <button type="button" onclick="toggleSectionCollapse(this)" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-300 shrink-0"><span class="collapse-icon">▾</span></button>
      </div>
      <div class="collapse-body space-y-5">
        <form method="post" action="/dashboard/plan" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-9 gap-2.5">
          <input type="text" name="title" placeholder="Descrição (ex: Aluguel)" required class="lg:col-span-2 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none" />
          <select name="type" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"><option value="EXPENSE">Despesa</option><option value="INCOME">Receita</option></select>
          <input type="number" step="0.01" min="0.01" name="amount" placeholder="Valor (R$)" required class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none" />
          <select name="category" onchange="toggleNewCatInput(this, 'planNewCat')" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none">{$catOptionsWithNew}</select>
          <input type="text" name="new_category" id="planNewCat" placeholder="Nome da nova categoria" class="hidden rounded-lg bg-slate-950 border border-emerald-500 px-3 py-2 text-xs sm:text-sm focus:outline-none" />
          <select name="plan_type" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"><option value="FIXED">Fixo</option><option value="ROLLING_AVERAGE">Média Móvel</option></select>
          <select name="split_ratio" class="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"><option value="1.0">100% Meu</option><option value="0.5">50/50 Settle Up</option></select>
          <div class="flex gap-2">
            <select name="payment_method" class="w-1/2 rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"><option value="PIX">PIX</option><option value="Cartão">Cartão</option></select>
            <input type="number" min="1" max="31" name="day_of_month" placeholder="Dia" required class="w-1/2 rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
          <button type="submit" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors">Adicionar</button>
        </form>
        {$plansHtml}
      </div>
    </section>

    <section data-collapse-id="txs" class="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 class="text-sm sm:text-base font-semibold">Transações Recentes ({$period})</h2>
          <p class="text-xs text-slate-400">Selecione várias para rateio em massa ou clique em "÷2" sem perder sua posição.</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="/transactions?year={$yearNum}&month={$monthNum}" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300">Ver todas com filtros →</a>
          <button type="button" onclick="toggleSectionCollapse(this)" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-300 shrink-0"><span class="collapse-icon">▾</span></button>
        </div>
      </div>
      <div class="collapse-body">{$txsHtml}</div>
    </section>
  </main>

  <div id="quickModal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4">
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
            <select name="category" onchange="toggleNewCatInput(this, 'quickNewCat')" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm">{$catOptionsWithNew}</select>
          </div>
        </div>
        <input type="text" name="new_category" id="quickNewCat" placeholder="Nome da nova categoria" class="hidden w-full rounded-lg bg-slate-950 border border-emerald-500 px-3 py-2 text-sm" />
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeQuickModal()" class="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300">Cancelar</button>
          <button type="submit" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">Salvar</button>
        </div>
      </form>
    </div>
  </div>

  {$catModalHtml}
  <div id="editTxModal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold">Editar Despesa / Lançamento</h3>
        <button type="button" onclick="closeEditTxModal()" class="text-slate-400 hover:text-slate-200 text-lg">&times;</button>
      </div>
      <form id="editTxForm" method="post" action="/dashboard/transaction/0/update" class="space-y-3">
        <input type="hidden" name="redirect_to" value="/dashboard?month={$period}" />
        <div>
          <label class="block text-xs text-slate-400 mb-1">Título / Estabelecimento</label>
          <input type="text" name="merchant" id="editTxMerchant" required class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Categoria</label>
            <select name="category" id="editTxCategory" onchange="toggleNewCatInput(this, 'editTxNewCat')" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm">{$catOptionsWithNew}</select>
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Data (Competência)</label>
            <input type="date" name="occurred_date" id="editTxDate" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" />
          </div>
        </div>
        <input type="text" name="new_category" id="editTxNewCat" placeholder="Nome da nova categoria" class="hidden w-full rounded-lg bg-slate-950 border border-emerald-500 px-3 py-2 text-sm" />
        <div class="flex items-center justify-between pt-2">
          <button type="submit" id="deleteTxBtn" formaction="/dashboard/transaction/0/delete" onclick="return confirm('Excluir este lançamento?')" class="rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 px-3 py-2 text-xs">Excluir</button>
          <div class="flex gap-2">
            <button type="button" onclick="closeEditTxModal()" class="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300">Cancelar</button>
            <button type="submit" class="rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white">Salvar</button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <div id="importCsvModal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold">Importar Fatura Nubank (CSV)</h3>
        <button type="button" onclick="closeImportModal()" class="text-slate-400 hover:text-slate-200 text-lg">&times;</button>
      </div>
      <form method="post" action="/dashboard/import-csv" enctype="multipart/form-data" class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Competência da Fatura</label>
            <input type="text" name="billing_month" list="billingPeriodsList" value="{$period}" required placeholder="AAAA-MM (ex: 2026-12)" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" /><datalist id="billingPeriodsList">{$billingDatalistOpts}</datalist>
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Alocação de Data</label>
            <select name="date_mode" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm">
              <option value="billing">Competência da fatura acima</option>
              <option value="original">Data original da compra</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs text-slate-400 mb-1">Arquivo .csv</label>
          <input type="file" name="csv_file" accept=".csv,text/csv" class="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700" />
        </div>
        <div>
          <label class="block text-xs text-slate-400 mb-1">Ou cole o conteúdo CSV (date,title,amount)</label>
          <textarea name="csv_text" rows="5" placeholder="date,title,amount&#10;2026-11-16,Pao de Acucar-1721,&quot;247,93&quot;" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono"></textarea>
        </div>
        <label class="flex items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" name="auto_split_groceries" value="1" checked class="rounded border-slate-700 bg-slate-950 text-emerald-500" />
          Dividir 50/50 automaticamente compras de Mercado/Casa (Settle Up)
        </label>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeImportModal()" class="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300">Cancelar</button>
          <button type="submit" class="rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white">Importar Fatura</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function toggleNewCatInput(selectEl, inputId) {
      const inp = document.getElementById(inputId);
      if (!inp) return;
      if (selectEl.value === '__NEW__') {
        inp.classList.remove('hidden');
        inp.required = true;
        inp.focus();
      } else {
        inp.classList.add('hidden');
        inp.required = false;
        inp.value = '';
      }
    }
    function handleInlinePlanCategory(selectEl) {
      if (selectEl.value === '__NEW__') {
        const name = window.prompt('Digite o nome da nova categoria:');
        if (name && name.trim()) {
          selectEl.form.querySelector('input[name="new_category"]').value = name.trim();
          selectEl.form.submit();
        } else {
          selectEl.value = selectEl.getAttribute('data-prev') || 'Outros';
        }
      } else {
        selectEl.form.submit();
      }
    }
    function openImportModal() {
      document.getElementById('importCsvModal').classList.remove('hidden');
    }
    function closeImportModal() {
      document.getElementById('importCsvModal').classList.add('hidden');
    }
    function openQuickModal(type) {
      document.getElementById('quickTxType').value = type || 'INCOME';
      document.getElementById('quickModal').classList.remove('hidden');
    }
    function closeQuickModal() {
      document.getElementById('quickModal').classList.add('hidden');
    }
    function openEditTxModal(btn) {
      const id = btn.getAttribute('data-id');
      document.getElementById('editTxForm').action = '/dashboard/transaction/' + id + '/update';
      document.getElementById('deleteTxBtn').setAttribute('formaction', '/dashboard/transaction/' + id + '/delete');
      document.getElementById('editTxMerchant').value = btn.getAttribute('data-merchant') || '';
      document.getElementById('editTxCategory').value = btn.getAttribute('data-category') || 'Outros';
      document.getElementById('editTxDate').value = btn.getAttribute('data-date') || '';
      const newInp = document.getElementById('editTxNewCat');
      newInp.classList.add('hidden');
      newInp.required = false;
      newInp.value = '';
      document.getElementById('editTxModal').classList.remove('hidden');
    }
    function closeEditTxModal() {
      document.getElementById('editTxModal').classList.add('hidden');
    }
    {$sortJs}
    {$splitCollapseJs}
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
          { label: 'Receita', data: yearlyMonths.map(m => m.income), backgroundColor: 'rgba(16, 185, 129, 0.8)' },
          { label: 'Despesa', data: yearlyMonths.map(m => m.total_expenses), backgroundColor: 'rgba(244, 63, 94, 0.8)' },
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
    $availPeriods = $result['available_periods'] ?? [];
    $availYearsMap = [$yearVal => true];
    $availMonthsForYearMap = [];
    if ($monthVal >= 1 && $monthVal <= 12) {
        $availMonthsForYearMap[$monthVal] = true;
    }
    foreach ($availPeriods as $ap) {
        if (preg_match('/^(\d{4})-(\d{2})$/', (string)$ap, $mm)) {
            $yInt = (int)$mm[1];
            $mInt = (int)$mm[2];
            $availYearsMap[$yInt] = true;
            if ($yInt === $yearVal) {
                $availMonthsForYearMap[$mInt] = true;
            }
        }
    }
    $availYears = array_keys($availYearsMap);
    rsort($availYears);
    $availMonths = array_keys($availMonthsForYearMap);
    rsort($availMonths);
    $monthOpts = '';
    foreach (MONTH_NAMES_PT as $idx => $mName) {
        $mNum = $idx + 1;
        if (!in_array($mNum, $availMonths, true)) { continue; }
        $sel = ($monthVal === $mNum) ? 'selected' : '';
        $monthOpts .= '<option value="' . $mNum . '" ' . $sel . '>' . sprintf('%02d', $mNum) . ' - ' . h($mName) . '</option>';
    }
    $monthOpts = '';
    foreach ($availMonths as $mNum) {
        $mName = MONTH_NAMES_PT[$mNum - 1] ?? '';
        $sel = ($monthVal === $mNum) ? 'selected' : '';
        $monthOpts .= '<option value="' . $mNum . '" ' . $sel . '>' . sprintf('%02d', $mNum) . ' - ' . h($mName) . '</option>';
    }
    $monthOpts .= '<option value="__CUSTOM__">⌨️ Digitar mês...</option>';
    $catOpts = '';
    $catPlainOpts = '';
    foreach ($categories as $c) {
        $sel = ($filters['category'] === $c) ? 'selected' : '';
        $catOpts .= '<option value="' . h($c) . '" ' . $sel . '>' . h($c) . '</option>';
        $catPlainOpts .= '<option value="' . h($c) . '">' . h($c) . '</option>';
    }
    $selExp = $filters['tx_type'] === 'EXPENSE' ? 'selected' : '';
    $selInc = $filters['tx_type'] === 'INCOME' ? 'selected' : '';
    $selNotif = $filters['source'] === 'NOTIFICATION' ? 'selected' : '';
    $selPlan = $filters['source'] === 'FIXED_PLAN' ? 'selected' : '';
    $selMan = $filters['source'] === 'MANUAL' ? 'selected' : '';
    $selCsv = $filters['source'] === 'CSV_FATURA' ? 'selected' : '';
    $selConf = $filters['status'] === 'CONFIRMED' ? 'selected' : '';
    $selEst = $filters['status'] === 'ESTIMATED' ? 'selected' : '';
    $selPend = $filters['status'] === 'PENDING' ? 'selected' : '';
    $minAmt = h((string)$filters['min_amount']);
    $maxAmt = h((string)$filters['max_amount']);
    $qVal = h((string)$filters['q']);
    $netColor = $result['net'] >= 0 ? 'text-emerald-300' : 'text-rose-400';

    $tableHtml = render_tx_table($result['transactions'] ?? [], true, 'Nenhuma transação encontrada para os filtros selecionados.');

    $sortJs = sortable_js();
    $splitCollapseJs = split_and_collapse_js();
    $currentReqUri = h((string)($_SERVER['REQUEST_URI'] ?? "/transactions?year={$yearVal}&month={$monthVal}"));
    $catModalHtml = render_categories_modal($categories, "/transactions?year={$yearVal}&month={$monthVal}");
    $yearOpts = '';
    foreach ($availYears as $y) {
        $selY = ($y === $yearVal) ? 'selected' : '';
        $yearOpts .= '<option value="' . $y . '" ' . $selY . '>' . $y . '</option>';
    }
    $yearOpts .= '<option value="__CUSTOM__">⌨️ Digitar ano...</option>';
    for ($y = 1; $y <= 0; $y++) {
        $selY = ($y === $yearVal) ? 'selected' : '';
        $yearOpts .= '<option value="' . $y . '" ' . $selY . '>' . $y . '</option>';
    }
    echo <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gastos Detalhados — FinControl</title>
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
  <header class="border-b border-slate-800 bg-slate-900/90">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-lg">💳</span>
        <h1 class="text-sm sm:text-base font-bold tracking-tight">Gastos Detalhados</h1>
        <nav class="hidden sm:flex items-center gap-1.5 ml-3">
          <a href="/dashboard" class="px-2.5 py-1 rounded-md hover:bg-slate-800 text-xs font-medium text-slate-300">Visão Geral</a>
          <a href="/transactions" class="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-semibold text-emerald-300">Gastos</a>
        </nav>
      </div>
      <div class="flex items-center gap-1.5">
        <button type="button" onclick="openCategoriesModal()" class="rounded-md border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 whitespace-nowrap" title="Editar / Gerenciar Categorias">🏷️ <span class="hidden sm:inline">Categorias</span></button>
        <a href="/manual" class="rounded-md border border-slate-700 hover:bg-slate-800 px-2 py-1 text-xs text-slate-300">Ajuda</a>
        <a href="/dashboard" class="sm:hidden rounded-md border border-slate-700 hover:bg-slate-800 px-2 py-1 text-xs text-slate-300">Dashboard</a>
        <a href="/logout" class="rounded-md border border-slate-700 hover:bg-slate-800 px-2 py-1 text-xs text-slate-300">Sair</a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
    <section data-collapse-id="tx_filters" class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xs sm:text-sm font-semibold text-slate-200">Filtros</h2>
        <button type="button" onclick="toggleSectionCollapse(this)" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-300 shrink-0"><span class="collapse-icon">▾</span></button>
      </div>
      <form method="get" action="/transactions" class="collapse-body grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Ano</label>
          <select name="year" data-current="{$yearVal}" onchange="handleTxYearSelect(this)" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100">{$yearOpts}</select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Mês</label>
          <select name="month" data-current="{$monthVal}" onchange="handleTxMonthSelect(this)" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100"><option value="0" {$selAllMonths}>Todos</option>{$monthOpts}</select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Categoria</label>
          <select name="category" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100"><option value="">Todas</option>{$catOpts}</select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Tipo</label>
          <select name="tx_type" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100"><option value="">Todos</option><option value="EXPENSE" {$selExp}>Despesa</option><option value="INCOME" {$selInc}>Receita</option></select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Origem</label>
          <select name="source" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100"><option value="">Todas</option><option value="NOTIFICATION" {$selNotif}>Notificação</option><option value="CSV_FATURA" {$selCsv}>Fatura CSV</option><option value="FIXED_PLAN" {$selPlan}>Plano Fixo</option><option value="MANUAL" {$selMan}>Manual</option></select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Status</label>
          <select name="status" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100"><option value="">Todos</option><option value="CONFIRMED" {$selConf}>Confirmado</option><option value="ESTIMATED" {$selEst}>Estimado</option><option value="PENDING" {$selPend}>Pendente</option></select>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Valor Mín/Máx</label>
          <div class="flex gap-1">
            <input type="text" name="min_amount" value="{$minAmt}" placeholder="Mín" class="w-1/2 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-slate-100" />
            <input type="text" name="max_amount" value="{$maxAmt}" placeholder="Máx" class="w-1/2 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-slate-100" />
          </div>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Busca</label>
          <input type="text" name="q" value="{$qVal}" placeholder="Uber, Enel..." class="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100" />
        </div>
        <div class="col-span-2 sm:col-span-4 lg:col-span-8 flex items-center justify-end gap-2 pt-1">
          <a href="/transactions" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs text-slate-300">Limpar</a>
          <button type="submit" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white">Filtrar</button>
        </div>
      </form>
    </section>

    <section class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5"><p class="text-[11px] text-slate-400">Registros</p><p class="text-lg font-bold text-slate-100 mt-0.5">{$result['total_count']}</p></div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5"><p class="text-[11px] text-slate-400">Receitas</p><p class="text-lg font-bold text-emerald-400 mt-0.5">R$ {$result['total_income_brl']}</p></div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5"><p class="text-[11px] text-slate-400">Despesas</p><p class="text-lg font-bold text-rose-400 mt-0.5">R$ {$result['total_expense_brl']}</p></div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5"><p class="text-[11px] text-slate-400">Saldo Filtrado</p><p class="text-lg font-bold mt-0.5 {$netColor}">R$ {$result['net_brl']}</p></div>
    </section>

    <section data-collapse-id="tx_list" class="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-sm sm:text-base font-semibold">Lista de Lançamentos</h2>
          <span class="text-[11px] text-slate-400">Toque na coluna para ordenar · Marque várias para editar rateio em massa</span>
        </div>
        <button type="button" onclick="toggleSectionCollapse(this)" class="rounded-lg border border-slate-700 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-300 shrink-0"><span class="collapse-icon">▾</span></button>
      </div>
      <div class="collapse-body">{$tableHtml}</div>
    </section>
  </main>

  {$catModalHtml}
  <div id="editTxModal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold">Editar Despesa / Lançamento</h3>
        <button type="button" onclick="closeEditTxModal()" class="text-slate-400 hover:text-slate-200 text-lg">&times;</button>
      </div>
      <form id="editTxForm" method="post" action="/dashboard/transaction/0/update" class="space-y-3">
        <input type="hidden" name="redirect_to" value="{$currentReqUri}" />
        <div>
          <label class="block text-xs text-slate-400 mb-1">Título / Estabelecimento</label>
          <input type="text" name="merchant" id="editTxMerchant" required class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Categoria</label>
            <select name="category" id="editTxCategory" onchange="toggleNewCatInput(this, 'editTxNewCat')" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm">{$catPlainOpts}<option value="__NEW__">+ Nova categoria...</option></select>
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Data (Competência)</label>
            <input type="date" name="occurred_date" id="editTxDate" class="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" />
          </div>
        </div>
        <input type="text" name="new_category" id="editTxNewCat" placeholder="Nome da nova categoria" class="hidden w-full rounded-lg bg-slate-950 border border-emerald-500 px-3 py-2 text-sm" />
        <div class="flex items-center justify-between pt-2">
          <button type="submit" id="deleteTxBtn" formaction="/dashboard/transaction/0/delete" onclick="return confirm('Excluir este lançamento?')" class="rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 px-3 py-2 text-xs">Excluir</button>
          <div class="flex gap-2">
            <button type="button" onclick="closeEditTxModal()" class="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300">Cancelar</button>
            <button type="submit" class="rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white">Salvar</button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <script>
    function toggleNewCatInput(selectEl, inputId) {
      const inp = document.getElementById(inputId);
      if (!inp) return;
      if (selectEl.value === '__NEW__') {
        inp.classList.remove('hidden');
        inp.required = true;
        inp.focus();
      } else {
        inp.classList.add('hidden');
        inp.required = false;
        inp.value = '';
      }
    }
    function openEditTxModal(btn) {
      const id = btn.getAttribute('data-id');
      document.getElementById('editTxForm').action = '/dashboard/transaction/' + id + '/update';
      document.getElementById('deleteTxBtn').setAttribute('formaction', '/dashboard/transaction/' + id + '/delete');
      document.getElementById('editTxMerchant').value = btn.getAttribute('data-merchant') || '';
      document.getElementById('editTxCategory').value = btn.getAttribute('data-category') || 'Outros';
      document.getElementById('editTxDate').value = btn.getAttribute('data-date') || '';
      const newInp = document.getElementById('editTxNewCat');
      newInp.classList.add('hidden');
      newInp.required = false;
      newInp.value = '';
      document.getElementById('editTxModal').classList.remove('hidden');
    }
    function closeEditTxModal() {
      document.getElementById('editTxModal').classList.add('hidden');
    }
    {$sortJs}
    {$splitCollapseJs}
  </script>
</body>
</html>
HTML;
    exit;
}
