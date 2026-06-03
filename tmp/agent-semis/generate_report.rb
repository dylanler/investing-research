#!/usr/bin/env ruby
# frozen_string_literal: true

require 'csv'
require 'json'
require 'fileutils'

ROOT = File.expand_path('../..', __dir__)
AS_OF = '2026-06-03'

PAGES = [
  {
    page: 'semiconductor-alpha-cpo',
    path: File.join(ROOT, 'public/reports/semiconductor-alpha-cpo/data/unified_alpha_ranking.csv'),
    rank_field: 'unified_rank',
    ticker_field: 'ticker',
    company_field: 'name',
    role_fields: %w[primary_role category alpha_lens broad_notes],
    bull_seed: 'thesis',
    bear_seed: 'risk',
    score_field: 'unified_score',
    ytd_field: 'latest_ytd_return_pct'
  },
  {
    page: 'semiconductor-ai-nodes',
    path: File.join(ROOT, 'public/reports/semiconductor-ai-nodes/data/semiconductor_100_alpha_rankings_v2.csv'),
    rank_field: 'rank',
    ticker_field: 'symbol',
    company_field: 'name',
    role_fields: %w[tier revenue_streams cash_in_summary alpha_reason],
    bull_seed: 'alpha_reason',
    bear_seed: nil,
    score_field: 'alpha_score',
    ytd_field: 'ytd_return_pct'
  }
].freeze

PRIMARY_SOURCES = {
  nvidia_cpo: 'https://nvidianews.nvidia.com/news/nvidia-spectrum-x-co-packaged-optics-networking-switches-ai-factories/',
  nvidia_vera: 'https://nvidianews.nvidia.com/news/vera-rubin-full-production-agentic-ai-factory',
  broadcom_cpo: 'https://investors.broadcom.com/news-releases/news-release-details/broadcom-announces-third-generation-co-packaged-optics-cpo',
  broadcom_10k: 'https://investors.broadcom.com/sec-filings/sec-filing/10-k/0001730168-25-000121',
  marvell_cpo: 'https://www.marvell.com/company/newsroom/marvell-co-packaged-optics-architecture-custom-ai-accelerators.html',
  marvell_results: 'https://investor.marvell.com/index.php?o=0&s=127&year=2025',
  semi_300mm: 'https://www.semi.org/en/semi-press-release/semi-projects-double-digit-growth-in-global-300mm-fab-equipment-spending-for-2026-and-2027',
  tsmc_annual: 'https://investor.tsmc.com/static/annualReports/2025/english/index.html',
  micron_q2: 'https://investors.micron.com/news-releases/news-release-details/micron-technology-inc-reports-results-second-quarter-fiscal-2026',
  samsung_q1: 'https://news.samsung.com/global/samsung-electronics-announces-first-quarter-2026-results',
  skhynix_q1: 'https://news.skhynix.com/q1-2026-business-results/',
  amd_10k: 'https://ir.amd.com/financial-information/sec-filings/content/0000002488-26-000018/amd-20251227.htm'
}.freeze

IR_URLS = {
  'PLAB' => 'https://www.photronics.com/investors/',
  'CAMT' => 'https://www.camtek.com/investors/',
  '3661.TW' => 'https://www.alchip.com/investor-relations/',
  'SKYT' => 'https://ir.skywatertechnology.com/',
  'VECO' => 'https://www.veeco.com/investors/',
  'AMKR' => 'https://ir.amkor.com/',
  'LASR' => 'https://investors.nlight.net/',
  'SMTC' => 'https://ir.semtech.com/',
  'MTSI' => 'https://ir.macom.com/',
  'POET' => 'https://www.poet-technologies.com/investor-relations',
  '6525.T' => 'https://www.kokusai-electric.com/en/ir/',
  'COHR' => 'https://investors.coherent.com/',
  'ONTO' => 'https://investors.ontoinnovation.com/',
  '6488.TW' => 'https://www.sas-globalwafers.com/investor-relations/',
  '6488.TWO' => 'https://www.sas-globalwafers.com/investor-relations/',
  'NVMI' => 'https://www.novami.com/investors/',
  'ENTG' => 'https://investors.entegris.com/',
  '7735.T' => 'https://www.screen.co.jp/en/ir/',
  'BESI.AS' => 'https://www.besi.com/investor-relations/',
  '6920.T' => 'https://www.lasertec.co.jp/en/ir/',
  'CRDO' => 'https://investors.credosemi.com/',
  '688012.SS' => 'https://www.sse.com.cn/assortment/stock/list/info/company/index.shtml?COMPANY_CODE=688012',
  'FORM' => 'https://investors.formfactor.com/',
  'AIXA.DE' => 'https://www.aixtron.com/en/investors',
  '2301.TW' => 'https://www.liteon.com/en-us/investor-relations',
  '5347.TWO' => 'https://www.vis.com.tw/en/Investor/financial_information',
  'COHU' => 'https://investors.cohu.com/',
  'PDFS' => 'https://ir.pdf.com/',
  'ASM.AS' => 'https://www.asm.com/investors',
  'ASMI.AS' => 'https://www.asm.com/investors',
  'RMBS' => 'https://investor.rambus.com/',
  '002371.SZ' => 'https://www.naura.com/en/',
  'GFS' => 'https://investors.gf.com/',
  'IPGP' => 'https://investor.ipgphotonics.com/',
  '3443.TW' => 'https://www.guc-asic.com/en-global/investor',
  '0522.HK' => 'https://www.asmpt.com/en/investors/',
  'ACMR' => 'https://ir.acmrcsh.com/',
  '0981.HK' => 'https://www.smics.com/en/site/company_ir',
  'ALAB' => 'https://ir.asteralabs.com/',
  'SNPS' => 'https://www.synopsys.com/company/investor-relations.html',
  '6857.T' => 'https://www.advantest.com/en/investors/',
  '2379.TW' => 'https://www.realtek.com/investor-relations/',
  '600703.SS' => 'https://www.sanan-e.com/en/',
  'UCTT' => 'https://ir.uct.com/',
  'TPRO.MI' => 'https://www.technoprobe.com/investors/',
  '3529.TWO' => 'https://www.ememory.com.tw/en/investor/',
  'CDNS' => 'https://www.cadence.com/en_US/home/company/investor-relations.html',
  'SOI.PA' => 'https://www.soitec.com/en/investors',
  'LSCC' => 'https://ir.latticesemi.com/',
  'LITE' => 'https://investor.lumentum.com/',
  '688126.SS' => 'https://www.sse.com.cn/assortment/stock/list/info/company/index.shtml?COMPANY_CODE=688126',
  'QRVO' => 'https://ir.qorvo.com/',
  'UMC' => 'https://www.umc.com/en/Investors',
  'IFX.DE' => 'https://www.infineon.com/cms/en/about-infineon/investor/',
  'NXPI' => 'https://investors.nxp.com/',
  'MRVL' => 'https://investor.marvell.com/',
  'SITM' => 'https://investor.sitime.com/',
  'TSEM' => 'https://towersemi.com/investor-relations/',
  'ACLS' => 'https://investors.axcelis.com/',
  '042700.KS' => 'https://www.hanmisemi.com/en/',
  '042700.KQ' => 'https://www.hanmisemi.com/en/',
  '8035.T' => 'https://www.tel.com/ir/',
  'KLAC' => 'https://ir.kla.com/',
  'LRCX' => 'https://investor.lamresearch.com/',
  '6146.T' => 'https://www.disco.co.jp/english/ir/',
  'AMBA' => 'https://investor.ambarella.com/',
  'MXL' => 'https://investors.maxlinear.com/',
  'ASML' => 'https://www.asml.com/en/investors',
  'ASX' => 'https://www.aseglobal.com/en/ir',
  'MPWR' => 'https://ir.monolithicpower.com/',
  'SWKS' => 'https://investor.skyworksinc.com/',
  '1347.HK' => 'https://www.huahonggrace.com/en/Investor-Relations',
  'AMAT' => 'https://ir.appliedmaterials.com/',
  'TSM' => 'https://investor.tsmc.com/english',
  'QCOM' => 'https://investor.qualcomm.com/',
  'AEHR' => 'https://ir.aehr.com/',
  'ALGM' => 'https://investors.allegromicro.com/',
  'NVTS' => 'https://ir.navitassemi.com/',
  'CRUS' => 'https://investor.cirrus.com/',
  'ENA.V' => 'https://enablence.com/investors/',
  '2454.TW' => 'https://corp.mediatek.com/investors',
  '6723.T' => 'https://www.renesas.com/en/about/investor-relations',
  'NVDA' => 'https://investor.nvidia.com/',
  'POWI' => 'https://investors.power.com/',
  'SIVE.ST' => 'https://www.sivers-semiconductors.com/investors/',
  'MCHP' => 'https://www.microchip.com/en-us/about/investor-relations',
  'ICHR' => 'https://ir.ichorsystems.com/',
  'TXN' => 'https://investor.ti.com/',
  '3436.T' => 'https://www.sumcosi.com/english/ir/',
  'ADI' => 'https://investor.analog.com/',
  'AVGO' => 'https://investors.broadcom.com/',
  '603986.SS' => 'https://www.gigadevice.com/about/investor-relations/',
  'STM' => 'https://investors.st.com/',
  'SLAB' => 'https://investor.silabs.com/',
  '6963.T' => 'https://www.rohm.com/investor-relations',
  'TER' => 'https://investor.teradyne.com/',
  'ON' => 'https://investor.onsemi.com/',
  'AXTI' => 'https://investor.axt.com/',
  'PI' => 'https://investor.impinj.com/',
  'WOLF' => 'https://investor.wolfspeed.com/',
  '2408.TW' => 'https://www.nanya.com/en/Investor',
  'AMD' => 'https://ir.amd.com/',
  'SIMO' => 'https://www.siliconmotion.com/investor-relations',
  '3105.TWO' => 'https://www.winfoundry.com/en/investor',
  '005930.KS' => 'https://www.samsung.com/global/ir/',
  '6770.TW' => 'https://www.powerchip.com/en-global/investor-relations',
  'INTC' => 'https://www.intc.com/',
  'KLIC' => 'https://investor.kns.com/',
  '3034.TW' => 'https://www.novatek.com.tw/en-global/investor',
  '000660.KS' => 'https://www.skhynix.com/ir/UI-FR-IR01',
  'SYNA' => 'https://investor.synaptics.com/',
  'MU' => 'https://investors.micron.com/',
  'ARM' => 'https://investors.arm.com/',
  'VLN' => 'https://investors.valens.com/',
  '688256.SS' => 'https://www.sse.com.cn/assortment/stock/list/info/company/index.shtml?COMPANY_CODE=688256',
  'CEVA' => 'https://investors.ceva-ip.com/',
  '300308.SZ' => 'https://www.innolight.com/',
  'DIOD' => 'https://investor.diodes.com/',
  'IMOS' => 'https://investor.chipmos.com/',
  'HIMX' => 'https://www.himax.com.tw/investor-relations/',
  '6415.TW' => 'https://www.silergy.com/en/investor',
  'AAOI' => 'https://investors.ao-inc.com/',
  'AMS.SW' => 'https://ams-osram.com/about-us/investor-relations',
  '6266.T' => 'https://www.towajapan.co.jp/en/ir/',
  '2449.TW' => 'https://www.kyec.com.tw/en/Ir/Quarterly',
  '6590.T' => 'https://www.shibaura.co.jp/en/ir/',
  '6526.T' => 'https://www.socionext.com/en/ir/',
  '084370.KQ' => 'https://www.eugenetech.co.kr/en/',
  '002156.SZ' => 'https://en.tfme.com/',
  '5274.TW' => 'https://www.aspeedtech.com/en/investor/',
  '4966.TW' => 'https://www.paradetech.com/en/investor-relations/',
  'MKSI' => 'https://investor.mks.com/',
  '4063.T' => 'https://www.shinetsu.co.jp/en/ir/',
  '4186.T' => 'https://www.tok.co.jp/eng/ir/',
  'WAF.DE' => 'https://www.siltronic.com/en/investors.html',
  'INDI' => 'https://investors.indiesemi.com/',
  'AOSL' => 'https://investor.aosmd.com/',
  '000990.KS' => 'https://www.dbhitek.com/en/ir',
  '2344.TW' => 'https://www.winbond.com/hq/about-winbond/investor-relations/',
  '2337.TW' => 'https://www.macronix.com/en-us/investors/Pages/default.aspx'
}.freeze

ALIASES = {
  'UMC / 2303.TW' => 'UMC',
  'TSM / 2330.TW' => 'TSM',
  'ASX / 3711.TW' => 'ASX',
  'STM / STMPA' => 'STM'
}.freeze

SPECIAL_SOURCE_URLS = {
  'NVDA' => [PRIMARY_SOURCES[:nvidia_vera], PRIMARY_SOURCES[:nvidia_cpo]],
  'AVGO' => [PRIMARY_SOURCES[:broadcom_10k], PRIMARY_SOURCES[:broadcom_cpo]],
  'MRVL' => [PRIMARY_SOURCES[:marvell_results], PRIMARY_SOURCES[:marvell_cpo]],
  'MU' => [PRIMARY_SOURCES[:micron_q2]],
  '000660.KS' => [PRIMARY_SOURCES[:skhynix_q1]],
  '005930.KS' => [PRIMARY_SOURCES[:samsung_q1]],
  'TSM' => [PRIMARY_SOURCES[:tsmc_annual]],
  'AMD' => [PRIMARY_SOURCES[:amd_10k]],
  '2449.TW' => [PRIMARY_SOURCES[:amd_10k]],
  '002156.SZ' => [PRIMARY_SOURCES[:amd_10k]],
  'LITE' => [PRIMARY_SOURCES[:nvidia_cpo]],
  'COHR' => [PRIMARY_SOURCES[:nvidia_cpo]],
  'CRDO' => [PRIMARY_SOURCES[:nvidia_cpo], PRIMARY_SOURCES[:marvell_cpo]],
  'ALAB' => [PRIMARY_SOURCES[:nvidia_cpo], PRIMARY_SOURCES[:marvell_cpo]],
  'MTSI' => [PRIMARY_SOURCES[:broadcom_cpo]],
  'POET' => ['https://www.poet-technologies.com/news/poet-technologies-and-liteon-announce-joint-development-of-optical-modules-for-ai-applications'],
  '2301.TW' => ['https://www.poet-technologies.com/news/poet-technologies-and-liteon-announce-joint-development-of-optical-modules-for-ai-applications']
}.freeze

EXPLICIT_UP = {
  ['semiconductor-alpha-cpo', 'MRVL'] => true,
  ['semiconductor-alpha-cpo', 'LITE'] => true,
  ['semiconductor-alpha-cpo', 'AXTI'] => true,
  ['semiconductor-alpha-cpo', 'ENA.V'] => true,
  ['semiconductor-alpha-cpo', 'SIVE.ST'] => true,
  ['semiconductor-alpha-cpo', 'SOI.PA'] => true,
  ['semiconductor-alpha-cpo', 'MXL'] => true,
  ['semiconductor-alpha-cpo', 'AAOI'] => true,
  ['semiconductor-ai-nodes', 'MRVL'] => true,
  ['semiconductor-ai-nodes', 'MU'] => true,
  ['semiconductor-ai-nodes', '000660.KS'] => true,
  ['semiconductor-ai-nodes', '005930.KS'] => true,
  ['semiconductor-ai-nodes', '2449.TW'] => true,
  ['semiconductor-ai-nodes', '002156.SZ'] => true,
  ['semiconductor-ai-nodes', '042700.KQ'] => true,
  ['semiconductor-ai-nodes', '6266.T'] => true,
  ['semiconductor-ai-nodes', '6590.T'] => true,
  ['semiconductor-ai-nodes', 'SOI.PA'] => true,
  ['semiconductor-ai-nodes', 'ICHR'] => true
}.freeze

EXPLICIT_DOWN = {
  ['semiconductor-alpha-cpo', 'PLAB'] => true,
  ['semiconductor-alpha-cpo', 'SKYT'] => true,
  ['semiconductor-alpha-cpo', 'LASR'] => true,
  ['semiconductor-alpha-cpo', 'POET'] => true,
  ['semiconductor-alpha-cpo', 'IPGP'] => true,
  ['semiconductor-alpha-cpo', '2379.TW'] => true,
  ['semiconductor-alpha-cpo', '600703.SS'] => true,
  ['semiconductor-alpha-cpo', '3529.TWO'] => true,
  ['semiconductor-alpha-cpo', 'QRVO'] => true,
  ['semiconductor-alpha-cpo', 'CRUS'] => true,
  ['semiconductor-alpha-cpo', 'AMBA'] => true,
  ['semiconductor-alpha-cpo', 'SLAB'] => true,
  ['semiconductor-alpha-cpo', 'PI'] => true,
  ['semiconductor-alpha-cpo', '688256.SS'] => true,
  ['semiconductor-alpha-cpo', '300308.SZ'] => true,
  ['semiconductor-alpha-cpo', 'AMS.SW'] => true,
  ['semiconductor-ai-nodes', '5274.TW'] => true,
  ['semiconductor-ai-nodes', '4966.TW'] => true,
  ['semiconductor-ai-nodes', 'QCOM'] => true,
  ['semiconductor-ai-nodes', 'NXPI'] => true,
  ['semiconductor-ai-nodes', 'IFX.DE'] => true,
  ['semiconductor-ai-nodes', '2379.TW'] => true,
  ['semiconductor-ai-nodes', '3034.TW'] => true,
  ['semiconductor-ai-nodes', 'AMBA'] => true,
  ['semiconductor-ai-nodes', 'NVTS'] => true,
  ['semiconductor-ai-nodes', 'SYNA'] => true,
  ['semiconductor-ai-nodes', 'CRUS'] => true,
  ['semiconductor-ai-nodes', 'SLAB'] => true,
  ['semiconductor-ai-nodes', 'SWKS'] => true,
  ['semiconductor-ai-nodes', 'QRVO'] => true,
  ['semiconductor-ai-nodes', 'INDI'] => true,
  ['semiconductor-ai-nodes', 'AOSL'] => true,
  ['semiconductor-ai-nodes', 'POWI'] => true,
  ['semiconductor-ai-nodes', 'DIOD'] => true,
  ['semiconductor-ai-nodes', 'ON'] => true,
  ['semiconductor-ai-nodes', 'MXL'] => true
}.freeze

def symbol_key(symbol)
  ALIASES[symbol] || symbol.to_s.split('/').first.strip
end

def clean_sentence(value)
  value.to_s.strip.gsub(/\s+/, ' ').sub(/[.;]\z/, '')
end

def role_text(row, config)
  config[:role_fields].map { |field| row[field].to_s }.join(' ')
end

def classify(row, config, company)
  text = "#{role_text(row, config)} #{company}".downcase
  return 'materials' if text.match?(%r{materials?\s*/|silicon wafers|wafer materials|photomask|photoresist|engineered substrates|substrate|chemicals|consumables})
  return 'memory' if text.match?(/\b(memory|dram|nand|hbm|socomm|storage controllers)\b/)
  return 'optics_interconnect' if text.match?(/cpo|co-pack|optical|optic|photon|laser|transceiver|serdes|aec|aoc|connectivity|signal integrity|copper|dfb|infiniband|ethernet|pam4|dsp|plc|in p|ingaas|inga|gaas/)
  return 'custom_asic_eda' if text.match?(/custom asic|design services|eda|ip|chiplet|accelerator|xpu|soc|semiconductor ecosystem|fpga/)
  return 'foundry' if text.match?(/foundry|fab|wafer fabrication|manufacturing tollgate/)
  return 'packaging' if text.match?(/osat|packag|assembly|bond|dicing|thinning|atmp|backend|hybrid bonding/)
  return 'test_metrology' if text.match?(/\btest\b|probe|metrology|inspection|yield|\bate\b|burn-in/)
  return 'wafer_equipment' if text.match?(/equipment|lithography|etch|deposition|cleaning|process tools|thermal|mocvd|implant/)
  return 'materials' if text.match?(/material|wafer|substrate|photomask|photoresist|silicon wafers|chemicals/)
  return 'analog_power_rf' if text.match?(/analog|power|rf|auto|industrial|mobile|edge|iot|display|mixed signal|sensor|sic|gan|discrete/)

  'semiconductor_ecosystem'
end

def group_sources(group)
  case group
  when 'memory'
    [PRIMARY_SOURCES[:micron_q2], PRIMARY_SOURCES[:skhynix_q1], PRIMARY_SOURCES[:samsung_q1]]
  when 'optics_interconnect'
    [PRIMARY_SOURCES[:nvidia_cpo], PRIMARY_SOURCES[:broadcom_cpo], PRIMARY_SOURCES[:marvell_cpo]]
  when 'custom_asic_eda'
    [PRIMARY_SOURCES[:tsmc_annual], PRIMARY_SOURCES[:amd_10k], PRIMARY_SOURCES[:broadcom_10k]]
  when 'foundry'
    [PRIMARY_SOURCES[:tsmc_annual], PRIMARY_SOURCES[:semi_300mm], PRIMARY_SOURCES[:amd_10k]]
  when 'packaging'
    [PRIMARY_SOURCES[:tsmc_annual], PRIMARY_SOURCES[:semi_300mm], PRIMARY_SOURCES[:amd_10k]]
  when 'test_metrology', 'wafer_equipment'
    [PRIMARY_SOURCES[:semi_300mm], PRIMARY_SOURCES[:tsmc_annual], PRIMARY_SOURCES[:nvidia_cpo]]
  when 'materials'
    [PRIMARY_SOURCES[:semi_300mm], PRIMARY_SOURCES[:tsmc_annual], PRIMARY_SOURCES[:nvidia_cpo]]
  else
    [PRIMARY_SOURCES[:semi_300mm], PRIMARY_SOURCES[:tsmc_annual]]
  end
end

def source_urls(symbol, group)
  key = symbol_key(symbol)
  urls = []
  urls << IR_URLS[key]
  urls.concat(SPECIAL_SOURCE_URLS.fetch(key, []))
  urls.concat(group_sources(group))
  urls.compact.uniq.first(3)
end

def rank_action(page, symbol, group, rank, ytd, score, row)
  key = symbol_key(symbol)
  return 'up' if EXPLICIT_UP[[page, key]]
  return 'down' if EXPLICIT_DOWN[[page, key]]

  text = row.to_h.values.join(' ').downcase
  ytd ||= 0.0
  rank ||= 999
  score ||= 0.0

  if %w[analog_power_rf semiconductor_ecosystem].include?(group)
    return 'down' if rank <= 55 || ytd > 70
    return 'hold'
  end

  if group == 'optics_interconnect'
    return 'down' if ytd > 115 && rank <= 25 && !%w[COHR LITE CRDO ALAB MRVL AVGO NVDA].include?(key)
    return 'up' if rank > 40 && ytd < 130
    return 'hold'
  end

  if %w[memory packaging test_metrology wafer_equipment].include?(group)
    return 'up' if rank > 35 && ytd < 80
    return 'down' if ytd > 120 && rank <= 20
    return 'hold'
  end

  if group == 'materials'
    return 'down' if text.include?('single-bundle') && rank <= 25
    return 'up' if rank > 75 && ytd < 80
    return 'hold'
  end

  if group == 'foundry'
    return 'up' if rank > 45 && text.match?(/tsmc|globalfoundries|tower|silicon photonics|advanced packaging/)
    return 'hold'
  end

  if group == 'custom_asic_eda'
    return 'down' if ytd > 120 && rank <= 20
    return 'up' if rank > 35 && ytd < 80 && score >= 55
    return 'hold'
  end

  'hold'
end

def bull_case(company, group, role, seed)
  base = case group
         when 'memory'
           "#{company} can outperform if HBM, server DRAM and AI eSSD remain gating bottlenecks for accelerator shipments"
         when 'optics_interconnect'
           "#{company} can outperform if AI clusters move faster toward 200G/lane optical links, CPO, LPO and active-cable architectures"
         when 'custom_asic_eda'
           "#{company} can outperform if hyperscaler custom silicon, chiplets and SerDes-heavy designs keep shifting value toward design services, IP and verification"
         when 'foundry'
           "#{company} can outperform if AI/HPC wafer starts, silicon photonics and advanced-node capacity keep foundry utilization tight"
         when 'packaging'
           "#{company} can outperform if HBM, chiplets and advanced packaging stay capacity-constrained through the next AI accelerator ramps"
         when 'test_metrology'
           "#{company} can outperform if known-good-die, HBM, chiplet and silicon-photonics yield control consumes more test and metrology budget"
         when 'wafer_equipment'
           "#{company} can outperform if AI-driven 300mm, HBM and advanced-node capex lands in the process steps where it has tool exposure"
         when 'materials'
           "#{company} can outperform if AI/HPC fab starts and advanced packaging raise recurring demand for high-purity wafers, masks, substrates and consumables"
         when 'analog_power_rf'
           "#{company} can outperform if AI servers, edge devices and data-center power density pull more analog, power or RF content than the page currently credits"
         else
           "#{company} can outperform if its semiconductor ecosystem role converts into visible AI infrastructure revenue"
         end

  seed = clean_sentence(seed)
  detail = seed.empty? ? role : seed
  "#{AS_OF}: #{base}; the page thesis to verify is #{detail}."
end

def neutral_case(company, group, action)
  qualifier = case action
              when 'up'
                'a modest move up is warranted only if named orders, backlog or customer concentration checks confirm the exposure'
              when 'down'
                'a move down is prudent unless direct AI/CPO revenue evidence becomes more specific'
              else
                'the current placement already balances exposure, valuation discovery and cycle risk'
              end

  directness = case group
               when 'memory', 'optics_interconnect', 'packaging'
                 'direct'
               when 'test_metrology', 'wafer_equipment', 'foundry', 'custom_asic_eda'
                 'enabling'
               else
                 'indirect'
               end

  "#{AS_OF}: Neutral case for #{company} is #{directness} but not risk-free AI bottleneck exposure, so #{qualifier}."
end

def bear_case(company, group, risk)
  risk = clean_sentence(risk)
  risk = 'valuation, customer concentration and semiconductor cycle timing' if risk.empty?
  cycle = case group
          when 'memory'
            'HBM or DRAM pricing normalizes'
          when 'optics_interconnect'
            'optical/CPO adoption slips or hyperscalers keep using pluggable and copper links longer'
          when 'packaging'
            'advanced-packaging capacity catches up or OSAT pricing weakens'
          when 'test_metrology'
            'inspection and probe intensity fails to rise with package complexity'
          when 'wafer_equipment', 'materials', 'foundry'
            'foundry and memory capex pauses after the current AI build-out'
          when 'custom_asic_eda'
            'custom silicon programs consolidate around fewer winners'
          else
            'non-AI end markets dominate the revenue mix'
          end

  "#{AS_OF}: Bear case for #{company} is that #{risk} compounds if #{cycle}."
end

entries = []

PAGES.each do |config|
  CSV.foreach(config[:path], headers: true) do |row|
    symbol = row[config[:ticker_field]]
    company = row[config[:company_field]]
    rank = row[config[:rank_field]].to_i
    score = row[config[:score_field]].to_s.empty? ? nil : row[config[:score_field]].to_f
    ytd = row[config[:ytd_field]].to_s.empty? ? nil : row[config[:ytd_field]].to_f
    role = clean_sentence(role_text(row, config))
    group = classify(row, config, company)
    action = rank_action(config[:page], symbol, group, rank, ytd, score, row)
    risk = config[:bear_seed] ? row[config[:bear_seed]] : row['valuation_alpha_summary']

    entries << {
      ticker: symbol,
      company: company,
      page: config[:page],
      case_date: AS_OF,
      current_rank: rank,
      current_score: score,
      rank_should_move: action,
      exposure_group: group,
      bull_case: bull_case(company, group, role, row[config[:bull_seed]]),
      neutral_case: neutral_case(company, group, action),
      bear_case: bear_case(company, group, risk),
      source_urls: source_urls(symbol, group)
    }
  end
end

report = {
  as_of: AS_OF,
  generated_from: PAGES.map { |page| page.slice(:page, :path) },
  scope_note: 'Page-specific entries for the assigned semiconductor/CPO and semiconductor AI nodes CSVs; overlapping tickers appear once per page.',
  source_note: 'Sources prioritize official company IR/news pages, SEC/company filings, SEMI, TSMC, NVIDIA, Micron, Broadcom, Marvell, Samsung and SK hynix primary material.',
  entry_count: entries.length,
  unique_ticker_count: entries.map { |entry| entry[:ticker] }.uniq.length,
  entries: entries
}

out = File.join(ROOT, 'tmp/agent-semis/report.json')
FileUtils.mkdir_p(File.dirname(out))
File.write(out, JSON.pretty_generate(report))
puts "wrote #{out} with #{entries.length} entries"
