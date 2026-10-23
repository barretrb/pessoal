"""
Banco de Questões para Prova Oral da PGE-AL
Carrega as questões extraídas dos arquivos de revisão (.docx)
e disponibiliza questões completas estruturadas no padrão oficial da banca oral (estilo ProGrupo).
"""

import json
import os
import random
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QUESTOES_EXTRAIDAS_PATH = os.path.join(BASE_DIR, "material_apoio", "questoes_extraidas.json")

# Questões oficiais completas estruturadas no formato ProGrupo / PGE-AL
QUESTOES_OFICIAIS = [
    {
        "id": "tributario_denuncia_espontanea",
        "disciplina": "Direito Tributário",
        "topico": "EXTINÇÃO E EXCLUSÃO DO CRÉDITO TRIBUTÁRIO",
        "enunciado": "Candidata, discorra sobre o instituto da Denúncia Espontânea no Direito Tributário, esclarecendo seus requisitos e efeitos, e analise a vedação constante na Súmula 360 do STJ no âmbito dos tributos sujeitos a lançamento por homologação.",
        "enunciado_fala": "Candidata, discorra sobre o instituto da Denúncia Espontânea no Direito Tributário e a vedação constante na Súmula 360 do STJ.",
        "pontos_esperados": [
            "Conceito (Art. 138 do CTN): Causa de exclusão da responsabilidade por infrações tributárias decorrente do pagamento do tributo devido acompanhado de juros e atualização, ou depósito, antes de iniciado qualquer procedimento fiscal.",
            "Efeitos da denúncia espontânea: Exclui integralmente a penalidade pecuniária (multa moratória e multa punitiva/de ofício), mantendo juros de mora e correção monetária.",
            "Súmula 360 do STJ: O benefício da denúncia espontânea não se aplica aos tributos sujeitos a lançamento por homologação regularmente declarados pelo contribuinte, mas pagos a destempo.",
            "Declaração retificadora: Aplica-se a denúncia espontânea se a retificação for apresentada com recolhimento concomitante de diferença antes de qualquer procedimento fiscal."
        ],
        "base_legal": [
            "CTN, art. 138 (com alterações da LC 236)",
            "Súmula 360 do STJ",
            "Súmula 555 do STJ",
            "Jurisprudência pacífica da 1ª Seção do STJ (Tema Repetitivo 385)"
        ],
        "resposta_esperada": (
            "A denúncia espontânea, prevista no art. 138 do CTN, configura causa de exclusão da responsabilidade por infrações fiscais. "
            "Para sua configuração, exige-se que o contribuinte realize o pagamento integral do tributo devido acompanhado de juros de mora "
            "e correção monetária, ou proceda ao depósito prévio da quantia arbitrada, antes de qualquer início de procedimento fiscal ou medida "
            "de fiscalização relacionada à infração. No tocante aos efeitos, a denúncia espontânea afasta exclusivamente as penalidades pecuniárias, "
            "abrangendo tanto a multa de mora quanto a multa punitiva/de ofício, não alcançando os juros e a atualização monetária. "
            "Por outro lado, consoante enunciado da Súmula 360 do STJ, o benefício da denúncia espontânea não se aplica aos tributos sujeitos "
            "a lançamento por homologação regularmente declarados pelo sujeito passivo, mas recolhidos com atraso, uma vez que a entrega da declaração "
            "constitui formalmente o crédito tributário, dispensando qualquer ato prévio do Fisco e afastando a espontaneidade."
        ),
        "criterios_correcao": [
            {
                "descricao": "Conceituar a denúncia espontânea com base no art. 138 do CTN, destacando a necessidade de pagamento prévio antes de qualquer procedimento fiscal.",
                "peso": 2.5
            },
            {
                "descricao": "Explicar os efeitos da denúncia espontânea: exclusão de multas (moratória e punitiva) e manutenção de juros e correção monetária.",
                "peso": 2.5
            },
            {
                "descricao": "Abordar a aplicação da Súmula 360 do STJ nos tributos sujeitos a lançamento por homologação declarados e não pagos.",
                "peso": 2.0
            }
        ],
        "reperguntas_padrao": [
            {
                "pergunta": "Candidata, na hipótese de parcelamento do débito tributário, aplica-se o benefício da denúncia espontânea?",
                "resposta_esperada": "Não. Conforme pacífica jurisprudência do STJ e previsão do art. 155-A do CTN, a concessão de parcelamento não equivale a pagamento integral e não gera exclusão da multa pela denúncia espontânea (Súmula 555 do STJ e Tema 385/STJ)."
            },
            {
                "pergunta": "A denúncia espontânea afasta a exigibilidade dos juros de mora e da correção monetária?",
                "resposta_esperada": "Não, afasta exclusivamente a penalidade pecuniária (multa moratória e punitiva). Os juros de mora e a correção monetária são devidos integralmente."
            }
        ]
    },
    {
        "id": "const_propriedade_reforma_agraria",
        "disciplina": "Direito Constitucional",
        "topico": "17. ORDEM ECONÔMICA E FINANCEIRA",
        "enunciado": "Discorra sobre o instituto da propriedade privada e a função social da propriedade, explicando quais imóveis são insuscetíveis de desapropriação para fins de reforma agrária, fundamentando-se nos dispositivos sobre o tema constantes da Constituição Federal de 1988.",
        "enunciado_fala": "Candidata, discorra sobre a propriedade privada e sua função social, explicando quais imóveis são insuscetíveis de desapropriação para reforma agrária, fundamentando na Constituição de 1988.",
        "pontos_esperados": [
            "A propriedade é direito fundamental (art. 5º, XXII), mas relativizado pela exigência de que atenda à sua função social (art. 5º, XXIII).",
            "Propriedade privada e função social são também princípios fundamentais da ordem econômica (art. 170, II e III da CF).",
            "A função social urbana se define pelo plano diretor (art. 182, §2º), e a rural por quatro requisitos cumulativos: aproveitamento racional e adequado, preservação do meio ambiente, relações de trabalho e exploração que favoreça o bem-estar (art. 186 da CF).",
            "Imóveis insuscetíveis de desapropriação para reforma agrária (art. 185 da CF): a pequena e média propriedade rural, desde que seu proprietário não possua outra; e a propriedade produtiva.",
            "O descumprimento da função social sujeita o proprietário a sanções expropriatórias constitucionais."
        ],
        "base_legal": [
            "CF, art. 5º, XXII e XXIII",
            "CF, art. 170, II e III",
            "CF, art. 182, § 2º",
            "CF, art. 184",
            "CF, art. 185, I e II",
            "CF, art. 186"
        ],
        "resposta_esperada": (
            "A propriedade privada surge no texto constitucional de 1988 dotada de dupla estatura: como direito fundamental "
            "garantido no art. 5º, XXII, indissociavelmente vinculado à cláusula da função social insculpida no inciso XXIII, "
            "e como princípio estruturante da ordem econômica e financeira (art. 170, II e III). "
            "Não se trata de direito absoluto, mas conformável pelo interesse coletivo. No âmbito urbano, a função social "
            "é cumprida quando o imóvel atende às exigências de ordenação expressas no Plano Diretor municipal (art. 182, §2º). "
            "No âmbito rural, o art. 186 da CF estabelece quatro vetores simultâneos: aproveitamento racional e adequado, "
            "utilização adequada dos recursos naturais disponíveis e preservação do meio ambiente, observância das normas trabalhistas "
            "e exploração que favoreça o bem-estar dos proprietários e trabalhadores. "
            "Por expressa dicção do art. 185 da CF, são insuscetíveis de desapropriação para fins de reforma agrária: "
            "I) a pequena e média propriedade rural, assim definida em lei, desde que seu proprietário não possua outra; "
            "e II) a propriedade produtiva, assegurando-se tratamento especial à sua destinação."
        ),
        "criterios_correcao": [
            {
                "descricao": "Explicar que a propriedade é direito fundamental relativo condicionado à função social e princípio da ordem econômica.",
                "peso": 2.0
            },
            {
                "descricao": "Indicar com precisão os imóveis insuscetíveis de desapropriação para reforma agrária (pequena/média com requisito de unicidade patrimonial e propriedade produtiva - art. 185).",
                "peso": 2.0
            },
            {
                "descricao": "Apontar os requisitos da função social rural (aproveitamento adequado, meio ambiente, normas trabalhistas e bem-estar - art. 186 da CF).",
                "peso": 1.5
            },
            {
                "descricao": "Apontar a função social da propriedade urbana vinculada às exigências do plano diretor (art. 182, § 2º da CF).",
                "peso": 1.5
            }
        ],
        "reperguntas_padrao": [
            {
                "pergunta": "A propriedade privada é um direito absoluto na Constituição de 1988?",
                "resposta_esperada": "Não. É um direito fundamental mitigado e condicionado ao cumprimento de sua função social (art. 5º, XXIII e 170, III da CF), permitindo inclusive a desapropriação em caso de descumprimento."
            },
            {
                "pergunta": "Quais são os requisitos constitucionais para que a propriedade rural cumpra sua função social?",
                "resposta_esperada": "Conforme o art. 186 da CF: aproveitamento racional e adequado; uso adequado dos recursos naturais e preservação do meio ambiente; cumprimento das normas trabalhistas; e exploração que promova o bem-estar dos trabalhadores e proprietários."
            }
        ]
    },
    {
        "id": "trib_cautelar_fiscal_competencia",
        "disciplina": "Direito Tributário",
        "topico": "16. PROCESSO JUDICIAL TRIBUTÁRIO E MEDIDA CAUTELAR FISCAL",
        "enunciado": (
            "Determinado contribuinte ingressou com uma ação judicial no juizado especial pretendendo a nulidade de lançamento fiscal efetuado, "
            "mas a liminar foi indeferida pelo juízo. Paralelamente, a fazenda pública ingressou com uma medida cautelar fiscal na vara de fazenda pública "
            "da mesma comarca, alegando que o contribuinte teria caído em insolvência. Em sua defesa, o contribuinte alegou a incompetência deste juízo, "
            "indicando a prevenção do juizado especial que conheceu da primeira ação.\n"
            "Em relação a essa situação hipotética, considerando que ambas as ações têm como objeto o mesmo crédito tributário e que o juizado especial "
            "não tem competência para o julgamento de ações de execução fiscal, responda se é viável a medida cautelar fiscal, indicando:\n"
            "1. Os requisitos a serem demonstrados pela fazenda pública;\n"
            "2. O juízo competente para o conhecimento da medida cautelar;\n"
            "3. Os efeitos do deferimento da medida."
        ),
        "enunciado_fala": (
            "Candidata, leia com atenção a situação hipotética constante na tela envolvendo o ajuizamento de ação anulatória no Juizado Especial "
            "e de Medida Cautelar Fiscal pela Fazenda Pública na Vara de Fazenda Pública. Responda fundamentadamente aos três questionamentos formulados."
        ),
        "pontos_esperados": [
            "Requisitos da cautelar fiscal (Lei 8.397/92, art. 3º): prova literal da constituição do crédito fiscal e prova documental de uma das hipóteses do art. 2º.",
            "A insolvência isolada não autoriza a medida cautelar fiscal: é imprescindível que, após cair em insolvência, o devedor aliene ou tente alienar bens, ou pratique atos de dilapidação (art. 2º, III).",
            "Juízo competente: a medida cautelar deve ser proposta perante o juiz competente para a execução fiscal (art. 5º). O Juizado Especial não detém competência para execução fiscal, logo não há prevenção nem litispendência.",
            "Prazo de propositura da execução fiscal: 60 dias da concessão liminar preparatória, sob pena de cessação de eficácia (art. 11 e 13, I), e apensamento aos autos da execução (art. 14).",
            "Efeitos do deferimento: decretação da indisponibilidade patrimonial do requerido até o limite da dívida (art. 4º), oficiando-se aos cartórios de imóveis, Banco Central (Sisbajud), CVM e capitanias/Detran."
        ],
        "base_legal": [
            "Lei nº 8.397/1992, art. 2º, III",
            "Lei nº 8.397/1992, art. 3º",
            "Lei nº 8.397/1992, art. 4º",
            "Lei nº 8.397/1992, art. 5º",
            "Lei nº 8.397/1992, art. 11, 13, I e 14"
        ],
        "resposta_esperada": (
            "A medida cautelar fiscal encontra-se disciplinada na Lei nº 8.397/1992. No caso concreto:\n"
            "1. Requisitos: Segundo o art. 3º da referida lei, exige-se prova literal da constituição do crédito e prova documental "
            "de uma das hipóteses legais do art. 2º. A mera insolvência, por si só, não basta: o art. 2º, III exige que o devedor, "
            "caindo em insolvência, aliene ou tente alienar bens, ou pratique atos que comprometam a liquidez de seu patrimônio.\n"
            "2. Juízo competente: Nos termos do art. 5º, a cautelar deve ser ajuizada perante o juízo competente para a futura execução fiscal. "
            "Como o Juizado Especial é absolutamente incompetente para execuções fiscais da Fazenda Pública, não há falar em prevenção.\n"
            "3. Efeitos: O deferimento acarreta a decretação de indisponibilidade dos bens do devedor até o montante da dívida (art. 4º), "
            "comunicação imediata aos registros de imóveis, Banco Central e órgãos de custódia, e gera a obrigação da Fazenda ajuizar a execução "
            "em 60 dias (art. 11), sob pena de perda de eficácia."
        ),
        "criterios_correcao": [
            {
                "descricao": "Concluir que a cautelar fiscal exige prova de crédito e ato de alienação/dilapidação posterior à insolvência (art. 2º e 3º da Lei 8.397/92).",
                "peso": 2.5
            },
            {
                "descricao": "Afirmar que o juízo competente é o da execução fiscal e afastar com precisão a prevenção do Juizado Especial (art. 5º).",
                "peso": 2.0
            },
            {
                "descricao": "Apontar o prazo de 60 dias para ajuizar a execução fiscal preparatória sob pena de perda de eficácia e apensamento (arts. 11 e 14).",
                "peso": 1.5
            },
            {
                "descricao": "Indicar o efeito de indisponibilidade de bens até o limite da obrigação com expedição de ofícios a órgãos de registro (art. 4º).",
                "peso": 1.0
            }
        ],
        "reperguntas_padrao": [
            {
                "pergunta": "Basta a insolvência do contribuinte para a Fazenda obter a cautelar fiscal?",
                "resposta_esperada": "Não. A jurisprudência e o art. 2º, III da Lei 8.397/92 exigem que a insolvência esteja associada a atos de disposição patrimonial (alienar ou tentar alienar bens) que comprometam a liquidez da futura execução."
            },
            {
                "pergunta": "Qual é o juízo competente para a cautelar fiscal e por que o Juizado Especial não previne a competência?",
                "resposta_esperada": "O juízo competente é a Vara de Fazenda Pública competente para processar a Execução Fiscal. O Juizado Especial é absolutamente incompetente para execuções fiscais promovidas pelo Estado, afastando qualquer hipótese de prevenção."
            }
        ]
    },
    {
        "id": "civil_responsabilidade_ato_licito_necessidade",
        "disciplina": "Direito Civil",
        "topico": "13. RESPONSABILIDADE CIVIL E ESTADO DE NECESSIDADE",
        "enunciado": (
            "André moveu ação indenizatória por acidente automobilístico contra Henrique, alegando que trafegava pela BR 123 quando seu veículo "
            "foi abalroado lateralmente pelo veículo do requerido, que trafegava de forma desgovernada e em sentido contrário ao da via. "
            "Em contestação, Henrique alegou não ter colaborado para a ocorrência do sinistro, pois trafegava em velocidade moderada, mas fora surpreendido "
            "por um terceiro automóvel que, subitamente, passou pelo acostamento em direção à pista, sendo o réu obrigado a desviar bruscamente para não ser atingido, "
            "rodopiando e colidindo com André.\n"
            "A partir desta situação hipotética, apresente, com fundamento no Código Civil e no entendimento pacificado do STJ:\n"
            "1. Discorra sobre os pressupostos clássicos da responsabilidade civil subjetiva e as excludentes de ilicitude, abordando a viabilidade de responsabilização por ato lícito no ordenamento brasileiro;\n"
            "2. Explique fundamentadamente se a referida demanda indenizatória deve ser julgada procedente ou improcedente."
        ),
        "enunciado_fala": (
            "Candidata, leia o caso hipotético na tela sobre colisão provocada por manobra de desvio em estado de necessidade. "
            "Discorra sobre os pressupostos da responsabilidade civil, o ato lícito indenizável e o desfecho da demanda perante o STJ."
        ),
        "pontos_esperados": [
            "Pressupostos clássicos da responsabilidade subjetiva: conduta (ação/omissão culposa ou dolosa), dano e nexo causal.",
            "Excludentes de ilicitude (art. 188 do CC): legítima defesa, exercício regular de direito e estado de necessidade.",
            "Responsabilização por ato lícito: a licitude do ato não afasta, por si só, o dever de reparar o dano causado a terceiro inocente (fundamento na equidade e teoria do sacrifício / responsabilidade objetiva).",
            "Regra do estado de necessidade contra terceiro inocente (arts. 929 e 930 do CC): o autor da manobra de desvio responde perante a vítima que não concorreu para o perigo.",
            "Direito de regresso: o condutor que pagou a indenização tem ação de regresso contra o terceiro que originou culposamente a situação de perigo.",
            "Conclusão: A demanda deve ser julgada procedente (jurisprudência consolidada do STJ - REsp 1.278.627/SC)."
        ],
        "base_legal": [
            "Código Civil, art. 186 e 927",
            "Código Civil, art. 188, II e parágrafo único",
            "Código Civil, art. 929 e 930",
            "STJ, REsp 1.278.627/SC (Rel. Min. Paulo de Tarso Sanseverino)"
        ],
        "resposta_esperada": (
            "A responsabilidade civil subjetiva extracontratual demanda conduta culposa/dolosa, nexo de causalidade e dano injusto (arts. 186 e 927 do CC). "
            "O art. 188, II do CC consagra o estado de necessidade como causa excludente de ilicitude quando a destruição de coisa alheia for indispensável "
            "para remover perigo iminente. Todavia, a ordem jurídica pátria admite a responsabilidade civil por ato lícito com fulcro na equidade e "
            "na teoria do sacrifício de direito. Em conformidade com os arts. 929 e 930 do CC, se a pessoa lesada não concorreu para o perigo, ela tem direito "
            "à indenização integral em face do causador material do dano, assistindo a este o direito de regresso contra o terceiro culpado. "
            "Dessa forma, a demanda deve ser julgada PROCEDENTE em face de Henrique, conforme assentado pelo Superior Tribunal de Justiça no REsp 1.278.627/SC."
        ),
        "criterios_correcao": [
            {
                "descricao": "Indicar os pressupostos clássicos da responsabilidade subjetiva extracontratual (conduta, dolo/culpa, dano e nexo causal).",
                "peso": 1.0
            },
            {
                "descricao": "Explicar que o estado de necessidade é excludente de ilicitude (art. 188, II), distinguindo-o das excludentes de nexo causal.",
                "peso": 1.0
            },
            {
                "descricao": "Afirmar a viabilidade da responsabilidade civil por ato lícito fundada na equidade / teoria do sacrifício (art. 929).",
                "peso": 2.0
            },
            {
                "descricao": "Concluir pela procedência da demanda conforme jurisprudência pacífica do STJ, assegurando a ação regressiva (art. 930).",
                "peso": 3.0
            }
        ],
        "reperguntas_padrao": [
            {
                "pergunta": "Quem pratica ato em estado de necessidade, sendo o ato lícito, pode ser obrigado a indenizar a vítima?",
                "resposta_esperada": "Sim. Nos termos do art. 929 do CC, responde civilmente se a vítima for terceiro inocente que não concorreu para a criação do perigo, assegurando-se o direito de regresso contra o causador do perigo (art. 930 do CC)."
            },
            {
                "pergunta": "Qual a distinção dogmática entre excludente de ilicitude e excludente de nexo causal neste caso?",
                "resposta_esperada": "A excludente de ilicitude (estado de necessidade) afasta o caráter ilícito da conduta, mas a lei mantém a obrigação reparatória em prol do inocente. Já a excludente de nexo causal (fato exclusivo de terceiro em sentido estrito) rompe o elo causal, exonerando integralmente o réu."
            }
        ]
    },
    {
        "id": "financ_anualidade_restos_a_pagar",
        "disciplina": "Direito Financeiro",
        "topico": "3. PLANO PLURIANUAL (PPA), LDO E LOA - PRINCÍPIOS ORÇAMENTÁRIOS",
        "enunciado": (
            "Acerca do princípio da anualidade no Direito Financeiro, considerando o que dispõem o texto constitucional e a legislação correlata, "
            "atenda, de maneira fundamentada, ao que se pede a seguir:\n"
            "1. Conceitue o princípio da anualidade orçamentária;\n"
            "2. Apresente seus efeitos dogmáticos sobre as dotações orçamentárias;\n"
            "3. Descreva detalhadamente as situações em que as dotações orçamentárias de um exercício financeiro podem ser executadas no exercício seguinte."
        ),
        "enunciado_fala": (
            "Candidata, leia os questionamentos sobre o princípio da anualidade orçamentária no Direito Financeiro. "
            "Conceitue o princípio, seus efeitos sobre as dotações e as situações excepcionais de execução no exercício subsequente."
        ),
        "pontos_esperados": [
            "Conceito da anualidade (art. 2º da Lei 4.320/64 e art. 165 da CF): a lei orçamentária anual vigora por um ano civil (1º de janeiro a 31 de dezembro).",
            "Dois efeitos sobre as dotações: a) vedação de execução antes do início do exercício a que se refere a lei; b) extinção/caducidade dos saldos das dotações ao término do exercício (31 de dezembro).",
            "Três situações de execução no ano seguinte: 1) Reabertura de créditos adicionais especiais e extraordinários autorizados nos últimos 4 meses do exercício (art. 167, §2º da CF); 2) Restos a pagar processados (despesas empenhadas e liquidadas, mas não pagas - art. 36 da Lei 4.320/64); 3) Restos a pagar não processados (despesas empenhadas não liquidadas, cujo serviço/contrato está em vigência)."
        ],
        "base_legal": [
            "Constituição Federal, art. 165 e art. 167, § 2º",
            "Lei nº 4.320/1964, art. 2º e art. 36",
            "Lei de Responsabilidade Fiscal (LC 101/2000), art. 42"
        ],
        "resposta_esperada": (
            "O princípio da anualidade ou periodicidade orçamentária determina que a previsão de receitas e a fixação de despesas devem "
            "corresponder a um período temporal de um exercício financeiro, que no Brasil coincide com o ano civil (art. 34 da Lei 4.320/64). "
            "Seus efeitos dogmáticos são binários: as dotações não podem ser utilizadas antes de 1º de janeiro do exercício correspondente e, "
            "ao final do dia 31 de dezembro, extinguem-se os saldos orçamentários remanescentes não empenhados. "
            "Excepcionalmente, as dotações podem ser executadas no exercício subsequente em três hipóteses expressas: "
            "I) Reabertura de créditos adicionais especiais e extraordinários aprovados nos últimos quatro meses do exercício, nos limites de seus saldos (art. 167, § 2º, CF); "
            "II) Inscrição de restos a pagar processados, atinentes a despesas empenhadas e devidamente liquidadas, pendentes apenas de pagamento pecuniário; "
            "III) Inscrição de restos a pagar não processados, consistentes em despesas empenhadas cuja liquidação ainda não ocorreu mas cujo compromisso ou serviço encontra-se vigente."
        ),
        "criterios_correcao": [
            {
                "descricao": "Conceituar corretamente a anualidade vinculando a vigência da LOA ao ano civil (1º/jan a 31/dez).",
                "peso": 2.2
            },
            {
                "descricao": "Apontar os dois efeitos dogmáticos: vedação de execução antecipada e caducidade dos saldos não empenhados ao fim do exercício.",
                "peso": 2.2
            },
            {
                "descricao": "Descrever as três situações de execução no ano seguinte: reabertura de créditos especiais/extraordinários (art. 167, §2º CF), restos a pagar processados e não processados (art. 36 da Lei 4.320/64).",
                "peso": 2.6
            }
        ],
        "reperguntas_padrao": [
            {
                "pergunta": "Qual é a diferença fundamental entre restos a pagar processados e não processados?",
                "resposta_esperada": "Restos a pagar processados referem-se a despesas que já cumpriram o estágio da liquidação (o serviço foi prestado ou o bem entregue), faltando apenas o pagamento. Os não processados são despesas empenhadas cuja liquidação ainda não ocorreu no encerramento do exercício."
            },
            {
                "pergunta": "Todos os créditos adicionais podem ser reabertos no exercício financeiro seguinte?",
                "resposta_esperada": "Não. Apenas os créditos especiais e extraordinários, e desde que seus atos de autorização tenham sido promulgados nos últimos quatro meses do exercício financeiro, nos limites dos saldos remanescentes (art. 167, § 2º da CF). Os suplementares caducam ao fim do ano."
            }
        ]
    },
    {
        "id": "adm_licitacao_dispensa_inexigibilidade",
        "disciplina": "Direito Administrativo",
        "topico": "CONTRATAÇÕES PÚBLICAS (LEI 14.133/2021) E CONTRATOS ADMINISTRATIVOS",
        "enunciado": (
            "Candidata, à luz da Nova Lei de Licitações e Contratos Administrativos (Lei nº 14.133/2021), discorra sobre a distinção jurídica entre "
            "Licitação Dispensável (art. 75) e Licitação Inexigível (art. 74). Esclareça se o rol de hipóteses do art. 74 é taxativo ou exemplificativo "
            "e aborde os requisitos para a contratação direta de serviços técnicos especializados de natureza predominantemente intelectual."
        ),
        "enunciado_fala": (
            "Candidata, diferencie licitação dispensável de inexigível na Lei 14.133/2021, esclarecendo a natureza do rol do artigo 74 e os requisitos para contratação de serviços técnicos especializados."
        ),
        "pontos_esperados": [
            "Distinção conceitual: Na dispensável há viabilidade de competição, mas a lei autoriza a contratação direta por conveniência/oportunidade ou interesse público; na inexigibilidade há inviabilidade fática ou jurídica de competição.",
            "Natureza do rol: O rol de inexigibilidade (art. 74) é exemplificativo ('em especial'), enquanto o da dispensa (art. 75) é taxativo.",
            "Serviços técnicos especializados (art. 74, III): requisitos cumulativos: serviço técnico especializado de natureza predominantemente intelectual previsto no art. 74, III, com profissional ou empresa de notória especialização, vedada a inexigibilidade para serviços de publicidade e divulgação.",
            "Conceito de notória especialização (art. 74, § 3º) e justificativa formal de preços no processo administrativo."
        ],
        "base_legal": [
            "Lei nº 14.133/2021, art. 74, caput e incisos",
            "Lei nº 14.133/2021, art. 74, § 3º (notória especialização)",
            "Lei nº 14.133/2021, art. 75 (dispensa)",
            "Súmula 252 do TCU"
        ],
        "resposta_esperada": (
            "Na sistemática da Lei nº 14.133/2021, a contratação direta subdivide-se fundamentalmente em dispensa e inexigibilidade. "
            "A licitação dispensável (art. 75) caracteriza-se pela presença material de competição entre eventuais fornecedores, "
            "porém o legislador, mediante rol taxativo, faculta ao administrador público a dispensa do certame com base no valor reduzido "
            "ou em circunstâncias de emergência e conveniência do serviço. Em contrapartida, a inexigibilidade (art. 74) decorre da "
            "inviabilidade fática ou jurídica de competição, possuindo rol meramente exemplificativo (o caput utiliza a expressão 'em especial'). "
            "No tocante aos serviços técnicos especializados de natureza predominantemente intelectual (art. 74, III), a contratação direta "
            "por inexigibilidade exige cumulatividade de: I) enquadramento no rol legal de serviços especializados; II) notória especialização "
            "do profissional ou sociedade, aferida por desempenho pretérito, estudos e publicações; III) singularidade do objeto; sendo vedada "
            "a inexigibilidade para serviços de publicidade e divulgação."
        ),
        "criterios_correcao": [
            {
                "descricao": "Diferenciar dispensabilidade (viabilidade de competição, conveniência legal) e inexigibilidade (inviabilidade de competição).",
                "peso": 2.5
            },
            {
                "descricao": "Apontar a natureza taxativa do art. 75 e exemplificativa do art. 74 da Lei 14.133/2021.",
                "peso": 2.0
            },
            {
                "descricao": "Indicar os requisitos do art. 74, III: serviço técnico de natureza intelectual, notória especialização e vedação a publicidade.",
                "peso": 2.5
            }
        ],
        "reperguntas_padrao": [
            {
                "pergunta": "É possível contratar serviços de publicidade e divulgação por inexigibilidade de licitação?",
                "resposta_esperada": "Não. O art. 74, III da Lei 14.133/2021 veda expressamente a contratação de serviços de publicidade e divulgação por inexigibilidade de licitação."
            },
            {
                "pergunta": "Qual a consequência jurídica se o administrador contratar por inexigibilidade fora das hipóteses legais?",
                "resposta_esperada": "Nulidade absoluta do contrato administrativo, responsabilização pessoal do gestor e do contratado (inclusive ressarcimento ao erário) e eventual enquadramento na Lei de Improbidade Administrativa e no crime do art. 337-E do Código Penal."
            }
        ]
    },
    {
        "id": "proc_civil_fazenda_juizo_prerrogativas",
        "disciplina": "Direito Processual Civil",
        "topico": "FAZENDA PÚBLICA EM JUÍZO, PRERROGATIVAS E HONORÁRIOS SUCUMBENCIAIS",
        "enunciado": (
            "Candidata, no âmbito do Direito Processual Civil aplicado à Fazenda Pública em juízo, aborde as seguintes matérias:\n"
            "1. Quais são as principais prerrogativas processuais da Fazenda Pública no CPC/2015 no tocante a prazos, intimação e remessa necessária?\n"
            "2. Como se dá a fixação de honorários sucumbenciais em causas contra ou a favor da Fazenda Pública nos termos do art. 85, §§ 3º e 8º do CPC e do Tema Repetitivo 1.076 do STJ?"
        ),
        "enunciado_fala": (
            "Candidata, discorra sobre as prerrogativas processuais da Fazenda Pública no CPC/2015 e a disciplina dos honorários sucumbenciais à luz do Tema 1.076 do STJ."
        ),
        "pontos_esperados": [
            "Prazos: prazo em dobro para todas as manifestações processuais (art. 183 do CPC), contados em dias úteis, salvo prazo próprio fixado pela lei.",
            "Intimação: pessoal do procurador público, por meio eletrônico (art. 183, § 1º) ou por carga/remessa.",
            "Remessa Necessária (art. 496): condição de eficácia da sentença desfavorável à Fazenda, com dispensas pelos tetos de salários mínimos (art. 496, § 3º) e vinculação a precedentes obrigatórios (§ 4º).",
            "Honorários sucumbenciais (art. 85, § 3º): escalonamento por faixas percentuais conforme o valor da condenação ou proveito econômico.",
            "Tema 1.076 do STJ: É vedada a fixação de honorários por equidade (art. 85, § 8º) em causas de valor elevado ou proveito expressivo; a fixação por equidade restringe-se a valor inestimável, irrisório ou proveito econômico excessivamente diminuto."
        ],
        "base_legal": [
            "CPC/2015, art. 183 (prazos e intimação)",
            "CPC/2015, art. 496 (remessa necessária)",
            "CPC/2015, art. 85, §§ 3º, 5º e 8º",
            "STJ, Tema Repetitivo 1.076 (REsp 1.850.512/SP e REsp 1.877.883/SP)"
        ],
        "resposta_esperada": (
            "O Código de Processo Civil de 2015 assegura à Fazenda Pública prerrogativas fundadas na indisponibilidade do interesse público. "
            "No tocante aos prazos, o art. 183 estabelece prazo em dobro para todas as manifestações processuais, com contagem estrita em dias úteis, "
            "com intimação de forma pessoal (eletrônica ou por carga). A remessa necessária (art. 496) atua como condição de eficácia da sentença "
            "ilíquida ou que julgar procedente pedido contra o Estado, excetuando-se as condenações inferiores aos limites escalonados de salários "
            "mínimos ou fundadas em teses de repercussão geral ou súmulas vinculantes. "
            "No que concerne aos honorários sucumbenciais, o art. 85, § 3º prevê tarifação escalonada em faixas percentuais regressivas sobre a condenação "
            "ou proveito econômico. O Superior Tribunal de Justiça, ao fixar o Tema 1.076 da repercussão repetitiva, pacificou que a fixação por equidade "
            "(art. 85, § 8º) é excepcional e subsidiária, cabendo apenas quando o valor for inestimável, irrisório ou o proveito muito baixo, "
            "sendo incabível a redução por equidade sob a alegação de valor excessivo da condenação."
        ),
        "criterios_correcao": [
            {
                "descricao": "Apresentar as prerrogativas de prazo em dobro e intimação pessoal por meio eletrônico (art. 183 do CPC).",
                "peso": 2.0
            },
            {
                "descricao": "Abordar a remessa necessária (art. 496) como condição de eficácia e suas hipóteses de dispensa legal.",
                "peso": 2.0
            },
            {
                "descricao": "Discorrer sobre a fixação escalonada de honorários (art. 85, § 3º) e a tese vinculante do Tema 1.076 do STJ vedando a equidade para reduzir verbas de vulto.",
                "peso": 3.0
            }
        ],
        "reperguntas_padrao": [
            {
                "pergunta": "O juiz pode utilizar a fixação por apreciação equitativa (art. 85, § 8º) para reduzir o valor de honorários sucumbenciais em causas de elevado valor?",
                "resposta_esperada": "Não. A 1ª Seção e a Corte Especial do STJ fixaram no Tema 1.076 que a fixação por equidade não é admitida quando os valores da condenação ou da causa forem elevados, devendo ser estritamente observados os percentuais previstos no art. 85, § 3º."
            },
            {
                "pergunta": "A remessa necessária é cabível nos Juizados Especiais da Fazenda Pública?",
                "resposta_esperada": "Não. Por expressa disposição da Lei nº 12.153/2009 (art. 11), não há remessa necessária das sentenças proferidas no âmbito dos Juizados Especiais da Fazenda Pública."
            }
        ]
    }
]

class BancoQuestoes:
    def __init__(self):
        self.questoes_oficiais = QUESTOES_OFICIAIS
        self.questoes_extraidas: Dict[str, List[Dict[str, Any]]] = {}
        self._load_extracted()

    def _load_extracted(self):
        if os.path.exists(QUESTOES_EXTRAIDAS_PATH):
            try:
                with open(QUESTOES_EXTRAIDAS_PATH, "r", encoding="utf-8") as f:
                    self.questoes_extraidas = json.load(f)
            except Exception as e:
                print(f"Erro ao carregar questoes_extraidas.json: {e}")

    def get_disciplinas(self) -> List[str]:
        return [
            "Direito Administrativo",
            "Direito Constitucional",
            "Direito Processual Civil",
            "Direito Tributário",
            "Direito Financeiro",
            "Direito Civil"
        ]

    def get_questoes_por_disciplina(self, disciplina: str) -> List[Dict[str, Any]]:
        oficiais = [q for q in self.questoes_oficiais if q["disciplina"].lower() == disciplina.lower()]
        return oficiais

    def get_todas_oficiais(self) -> List[Dict[str, Any]]:
        return self.questoes_oficiais

    def obter_questao_aleatoria(self, disciplinas: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
        pool = self.questoes_oficiais
        if disciplinas:
            disc_lower = [d.lower() for d in disciplinas]
            pool = [q for q in self.questoes_oficiais if q["disciplina"].lower() in disc_lower]
        if not pool:
            pool = self.questoes_oficiais
        return random.choice(pool) if pool else None

    def obter_simulado(self, disciplinas: List[str], qtd_questoes: int = 4) -> List[Dict[str, Any]]:
        """Gera uma lista de questões para o simulado no formato ProGrupo"""
        selecionadas: List[Dict[str, Any]] = []
        candidatas = [q for q in self.questoes_oficiais if q["disciplina"] in disciplinas]
        
        # Embaralha para variar
        random.shuffle(candidatas)
        
        if len(candidatas) >= qtd_questoes:
            selecionadas = candidatas[:qtd_questoes]
        else:
            selecionadas = list(candidatas)
            # Completa gerando questões baseadas nos tópicos das disciplinas selecionadas
            faltam = qtd_questoes - len(selecionadas)
            for _ in range(faltam):
                disc = random.choice(disciplinas)
                q_gerada = self._gerar_questao_sintetica(disc)
                if q_gerada:
                    selecionadas.append(q_gerada)
        return selecionadas

    def _gerar_questao_sintetica(self, disciplina: str) -> Dict[str, Any]:
        """Cria uma questão no padrão da banca oral a partir dos 3960 pares extraídos do material de revisão"""
        perguntas_disc = self.questoes_extraidas.get(disciplina, [])
        if not perguntas_disc:
            return self.obter_questao_aleatoria([disciplina])
        
        # Pega uma pergunta rica do banco
        candidatas = [p for p in perguntas_disc if len(p.get("pergunta", "")) > 15 and len(p.get("resposta_esperada", "")) > 40]
        item = random.choice(candidatas) if candidatas else random.choice(perguntas_disc)
        
        enunciado_limpo = item["pergunta"].rstrip("?").strip()
        if not enunciado_limpo.lower().startswith("candidata") and not enunciado_limpo.lower().startswith("discorra"):
            enunciado = f"Candidata, à luz da doutrina e da jurisprudência dominante dos Tribunais Superiores, discorra sobre: {enunciado_limpo}."
        else:
            enunciado = item["pergunta"]
            
        return {
            "id": f"sintetica_{disciplina.lower().replace(' ', '_')}_{random.randint(1000, 9999)}",
            "disciplina": disciplina,
            "topico": item.get("topico", "PONTOS CENTRAIS DA DISCIPLINA"),
            "enunciado": enunciado,
            "enunciado_fala": enunciado,
            "pontos_esperados": [
                f"Abordagem conceitual e fundamentação jurídica do tema: {enunciado_limpo}",
                "Demonstração do posicionamento consolidado do STJ/STF aplicável à Fazenda Pública.",
                "Precisão na utilização da terminologia jurídica e capacidade de síntese oral."
            ],
            "base_legal": [
                f"Legislação correlata a {disciplina}",
                "Jurisprudência pacífica do STF e STJ"
            ],
            "resposta_esperada": item["resposta_esperada"],
            "criterios_correcao": [
                {
                    "descricao": f"Conceituação precisa e enfrentamento dos pressupostos dogmáticos de {enunciado_limpo[:60]}...",
                    "peso": 3.5
                },
                {
                    "descricao": "Indicação correta da base legal e da jurisprudência consolidada aplicável.",
                    "peso": 3.5
                }
            ],
            "reperguntas_padrao": [
                {
                    "pergunta": f"Candidata, qual a repercussão prática desse entendimento para a atuação da Procuradoria do Estado?",
                    "resposta_esperada": "Garante a segurança jurídica dos atos estatais, preserva o patrimônio público e orienta a atuação consultiva e contenciosa da Fazenda Pública."
                }
            ]
        }

banco = BancoQuestoes()
