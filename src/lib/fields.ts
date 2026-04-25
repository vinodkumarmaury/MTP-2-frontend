// Shared field & section definitions — used by Predict and History pages
// OC Running Mine focus (lifecycle_stage = Producing)

export type FieldType = 'number' | 'select';

export interface FieldDef {
  k: string;
  label: string;
  unit: string;
  type: FieldType;
  opts?: string[];
  help?: string;
}

export interface SectionDef {
  id: string;
  label: string;
  color: string;
  icon: string;
  fields: FieldDef[];
}

// ── Core Sections (8) ─────────────────────────────────────────────────────

export const CORE_SECTIONS: SectionDef[] = [
  { id:'eco', label:'Economic', color:'#1D9E75', icon:'₹', fields:[
    {k:'npv_cr',              label:'Net Present Value (NPV)',         unit:'₹ Crore',         type:'number'},
    {k:'irr_pct',             label:'Internal Rate of Return (IRR)',   unit:'%',               type:'number'},
    {k:'payback_period_yr',   label:'Payback Period',                 unit:'years',           type:'number'},
    {k:'capex_cr',            label:'Capital Expenditure (CAPEX)',    unit:'₹ Crore',         type:'number'},
    {k:'sustaining_capex_cr', label:'Sustaining Capital Expenditure (CAPEX)',   unit:'₹ Cr/yr',         type:'number'},
    {k:'opex_per_tonne',      label:'Operating Expenditure (OPEX) per Tonne',   unit:'₹/t',             type:'number'},
    {k:'ob_mining_cost',      label:'Overburden Mining Cost',         unit:'₹/BCM',           type:'number'},
    {k:'coal_price_t',        label:'Coal Sale Price (CIL Notified)', unit:'₹/tonne',         type:'number'},
    {k:'annual_revenue_cr',   label:'Annual Revenue',                 unit:'₹ Cr/yr',         type:'number'},
    {k:'royalty_pct',         label:'Royalty Rate',                   unit:'%',               type:'number'},
    {k:'wacc_pct',            label:'Weighted Average Cost of Capital (WACC)',  unit:'%',               type:'number'},
    {k:'discount_rate_pct',   label:'Discount Rate',                  unit:'%',               type:'number'},
    {k:'besr',                label:'Break-Even Stripping Ratio',     unit:'BCM:t',           type:'number'},
    {k:'cit_pct',             label:'Corporate Income Tax Rate',      unit:'%',               type:'number'},
    {k:'epcm_pct',            label:'EPCM Cost',                      unit:'% of direct cost', type:'number'},
    {k:'contingency_pct',     label:'Contingency Allowance',          unit:'%',               type:'number'},
    {k:'annual_depreciation_cr', label:'Annual Depreciation',         unit:'₹ Crore/yr',      type:'number'},
    {k:'closure_bond_cr',     label:'Mine Closure Bond Provision',    unit:'₹ Crore',         type:'number'},
    {k:'coal_grade',          label:'CIL Coal Grade',                 unit:'',                type:'select', opts:['Grade A','Grade B','Grade C','Grade D','Grade E','Grade F','Grade G']},
    {k:'debt_equity_ratio',   label:'Debt-to-Equity (D/E) Ratio',     unit:'D/E',             type:'number', help:'Financial leverage — lower is better (0 = all equity)},
    {k:'coal_price_volatility_pct', label:'Coal Price Volatility',    unit:'% CV',            type:'number', help:'Coefficient of variation of coal price over 3 yrs'},
    {k:'export_revenue_pct',  label:'Export / Spot Revenue Share',    unit:'%',               type:'number', help:'% revenue from spot markets / exports (premium pricing)'},
  ]},
  { id:'tech', label:'Technical', color:'#185FA5', icon:'⚙', fields:[
    {k:'stripping_ratio_overall', label:'Overall Stripping Ratio',    unit:'BCM:t',           type:'number'},
    {k:'hemm_availability',   label:'HEMM Mechanical Availability',   unit:'%',               type:'number'},
    {k:'hemm_utilisation',    label:'HEMM Utilisation',               unit:'%',               type:'number'},
    {k:'recovery_pct',        label:'Coal Recovery',                  unit:'%',               type:'number'},
    {k:'dilution_oc_pct',     label:'Mining Dilution',                unit:'%',               type:'number'},
    {k:'highwall_fos',        label:'Highwall Factor of Safety',      unit:'—',               type:'number'},
    {k:'annual_prod_mty',     label:'Annual Production',              unit:'MTY',             type:'number'},
    {k:'mine_life_yr',        label:'Mine Life',                      unit:'years',           type:'number'},
    {k:'fuel_consumption_ltr_t', label:'Fuel Consumption',            unit:'L/tonne',         type:'number', help:'Diesel consumed per tonne of material moved (2–8 L/t typical)'},
    {k:'advance_rate_m_month',   label:'Mining Advance Rate',         unit:'m/month',         type:'number', help:'Face advance per month (higher = faster extraction)'},
  ]},
  { id:'geo', label:'Geological', color:'#534AB7', icon:'⛏', fields:[
    {k:'reserve_mt',          label:'Mineable Coal Reserve',          unit:'Mt',              type:'number'},
    {k:'resource_mt',         label:'Geological Resource',            unit:'Mt',              type:'number'},
    {k:'gcv_blended',         label:'Blended Gross Calorific Value (GCV)', unit:'kcal/kg', type:'number', help:'Grade A(>6700), B(6201-6700), C(5601-6200), D(4941-5600), E(4201-4940), F(3361-4200), G(≤3360)'},
    {k:'ash_pct',             label:'Ash Content',                    unit:'%',               type:'number'},
    {k:'seam_thickness_avg_m',label:'Average Seam Thickness',        unit:'m',               type:'number'},
    {k:'seam_dip_deg',        label:'Seam Dip',                      unit:'°',               type:'number'},
    {k:'insitu_density_tm3',  label:'In-Situ Coal Density',           unit:'t/m³',            type:'number'},
    {k:'recovery_factor_oc',  label:'Recovery Factor',                unit:'%',               type:'number'},
    {k:'borehole_density',    label:'Borehole Density',               unit:'no./km²',         type:'number'},
    {k:'ob_thickness_avg_m',  label:'OB Thickness (average)',         unit:'m',               type:'number'},
    {k:'ob_density_tm3',      label:'OB In-Situ Density',             unit:'t/m³',            type:'number'},
  ]},
  { id:'env', label:'Environmental', color:'#3B6D11', icon:'🌿', fields:[
    {k:'ec_status',           label:'Environmental Clearance Status', unit:'',                type:'select', opts:['Granted','Conditions','Pending','Refused']},
    {k:'fc_status',           label:'Forest Clearance Status',        unit:'',                type:'select', opts:['Granted','Not Required','Pending','Refused']},
    {k:'forest_clearance_ha_pending', label:'Forest Area Pending Clearance', unit:'ha',       type:'number'},
    {k:'seismic_zone',        label:'Seismic Zone (IS 1893)',         unit:'1–5',             type:'number'},
    {k:'closure_plan_status', label:'Mine Closure Plan Status',       unit:'',                type:'select', opts:['Approved','Draft','Not Prepared']},
    {k:'ob_dump_fos',         label:'Overburden (OB) Dump Factor of Safety (FoS)', unit:'—', type:'number'},
    {k:'backfill_ratio',      label:'Progressive Backfilling Ratio',  unit:'%',               type:'number'},
    {k:'ghg_scope1_tco2yr',   label:'Greenhouse Gas (GHG) Scope 1 Emissions', unit:'tCO₂e/yr', type:'number'},
    {k:'ghg_scope2_tco2yr',   label:'Greenhouse Gas (GHG) Scope 2 Emissions', unit:'tCO₂e/yr', type:'number'},
    {k:'ghg_intensity',       label:'Greenhouse Gas (GHG) Intensity (Scope 1+2)', unit:'tCO₂e/t', type:'number'},
    {k:'diesel_kl_yr',        label:'Annual Diesel Consumption',       unit:'kL/yr',           type:'number'},
    {k:'forest_area_ha',      label:'Forest Area within Lease',       unit:'ha',              type:'number'},
    {k:'lease_area_ha',       label:'Mine Lease Area',                unit:'ha',              type:'number'},
    {k:'annual_rainfall_mm',  label:'Annual Rainfall (IMD)',          unit:'mm/yr',           type:'number'},
    {k:'pm10_ambient_ugm3',   label:'Ambient PM10 Level',             unit:'μg/m³',           type:'number', help:'CPCB standard ≤100 μg/m³; lower is better'},
    {k:'water_recycling_pct', label:'Mine Water Recycling Rate',      unit:'%',               type:'number', help:'% of mine water reused or recycled on-site'},
    {k:'renewable_energy_pct',label:'Renewable Energy Share',         unit:'%',               type:'number', help:'% of mine power from solar/wind/hydro'},
    {k:'land_reclamation_pct',label:'Land Reclamation Progress',      unit:'%',               type:'number', help:'% of mined-out area progressively restored'},
    {k:'top_soil_management', label:'Top-Soil Management',            unit:'',                type:'select', opts:['Good','Partial','Poor'], help:'Quality of top-soil stripping, storage, and reuse practice'},
  ]},
  { id:'soc', label:'Social', color:'#BA7517', icon:'👥', fields:[
    {k:'ltifr',               label:'Lost Time Injury Frequency Rate (LTIFR)', unit:'per 10⁶ man-hrs', type:'number'},
    {k:'far',                 label:'Fatal Accident Rate (FAR)',       unit:'per 10⁸ man-hrs', type:'number'},
    {k:'fatalities_annual',   label:'Fatalities per Year',             unit:'count',           type:'number'},
    {k:'lti_count_annual',    label:'LTI Count (Annual)',               unit:'count',           type:'number'},
    {k:'man_hours_annual',    label:'Total Man-Hours (Annual)',          unit:'man-hrs',         type:'number'},
    {k:'local_employment_pct',label:'Local Employment Ratio',          unit:'%',               type:'number'},
    {k:'workforce_count',     label:'Total Workforce',                  unit:'count',           type:'number'},
    {k:'paf_count',           label:'Project Affected Families (PAF)',  unit:'count',           type:'number'},
    {k:'land_acquisition_ha', label:'Land Acquisition Area',           unit:'ha',              type:'number'},
    {k:'rr_cost_cr',          label:'Resettlement and Rehabilitation (R&R) Cost', unit:'₹ Crore', type:'number'},
    {k:'csr_spend_cr',        label:'Corporate Social Responsibility (CSR) Mandatory Spend', unit:'₹ Cr/yr', type:'number'},
    {k:'training_hrs_worker', label:'Safety Training per Worker',      unit:'hrs/yr',          type:'number', help:'DGMS Mines Vocational Training Rules — sector avg 40-60 hrs'},
    {k:'women_employment_pct',label:'Women Employment',                unit:'%',               type:'number', help:'% female workers (direct + contract); national average ~4%'},
    {k:'community_projects_count', label:'Active Community Projects',  unit:'count',           type:'number', help:'No. of active CSR/community development projects'},
    {k:'contractor_ltifr',    label:'Contractor Lost Time Injury Frequency Rate (LTIFR)', unit:'per 10⁶ man-hrs', type:'number', help:'LTIFR for contract workers (usually higher than direct)'},
  ]},
  { id:'geoL', label:'Geographical', color:'#7C5A00', icon:'🗺', fields:[
    {k:'rail_dist_km',        label:'Mine to Rail Siding Distance',   unit:'km',              type:'number'},
    {k:'total_logistics_cost_t', label:'Total Logistics Cost',        unit:'₹/tonne',         type:'number'},
    {k:'annual_working_days', label:'Annual Working Days',             unit:'days/yr',         type:'number'},
    {k:'monsoon_disruption_days', label:'Monsoon Disruption Days',    unit:'days/yr',         type:'number'},
    {k:'grid_power_availability_pct', label:'Grid Power Availability', unit:'%',              type:'number'},
    {k:'power_tariff_kwh',    label:'Power Tariff',                   unit:'₹/kWh',           type:'number'},
  ]},
  { id:'risk', label:'Risk', color:'#A32D2D', icon:'⚠', fields:[
    {k:'slope_fos_mean',      label:'Slope Factor of Safety (FoS) (mean)', unit:'—', type:'number'},
    {k:'slope_fos_sd',        label:'Slope Factor of Safety (FoS) (std deviation σ)', unit:'—', type:'number'},
    {k:'prob_of_failure_pct', label:'Probability of Failure (POF) (Monte Carlo)', unit:'%', type:'number'},
    {k:'flood_inflow_q100',   label:'100-Year Flood Inflow',          unit:'m³/hr',           type:'number'},
    {k:'expected_loss_cr',    label:'Actuarial Expected Loss E[L]',   unit:'₹ Crore',         type:'number'},
    {k:'cpt_deg',             label:'Crossing Point Temperature (CPT)', unit:'°C', type:'number', help:'<140°C = high spontaneous combustion risk; >175°C = low risk'},
    {k:'seam_methane_m3t',    label:'Seam Methane Gas Content',       unit:'m³/tonne',        type:'number'},
    {k:'lease_years_remaining', label:'Mining Lease Years Remaining', unit:'years',           type:'number'},
    {k:'litigation_count',    label:'Active Litigation Count',        unit:'count',           type:'number'},
    {k:'insurance_premium_pct', label:'Insurance Premium',            unit:'%/yr',            type:'number'},
    {k:'near_miss_count_annual', label:'Near-Miss Incidents per Year', unit:'count',          type:'number', help:'Near misses (Heinrich ratio: ~30× LTIs expected)'},
    {k:'fire_incident_count_annual', label:'Coal Fire Incidents per Year', unit:'count',      type:'number', help:'Spontaneous combustion or fire events per year'},
    {k:'dgms_compliance_pct', label:'Directorate General of Mining Safety (DGMS) Audit Compliance Score', unit:'%', type:'number', help:'% compliance in DGMS safety audit (CIL avg ~75%)'},
  ]},
  { id:'gov', label:'Governance', color:'#6B48C4', icon:'🏛', fields:[
    {k:'iso_14001',           label:'ISO 14001 Environmental Management System Certification', unit:'', type:'select', opts:['Certified','In Progress','Not Started'], help:'Environmental Management System certification'},
    {k:'iso_45001',           label:'ISO 45001 Occupational Health & Safety Management System Certification', unit:'', type:'select', opts:['Certified','In Progress','Not Started'], help:'Occupational Health & Safety Management System certification'},
    {k:'regulatory_violations_annual', label:'Regulatory Violations per Year', unit:'count', type:'number', help:'Violations of statutory/regulatory requirements (MMDR, CMR, etc.)'},
    {k:'esg_disclosure_score',label:'Environmental, Social, and Governance (ESG) Disclosure Quality Score', unit:'0-100', type:'number', help:'Quality of ESG reporting and transparency (0=no reporting, 100=best-in-class)'},
    {k:'audit_findings_critical', label:'Critical Audit Findings per Year', unit:'count',    type:'number', help:'Critical findings in internal/statutory audits per year'},
    {k:'dgms_compliance_pct', label:'DGMS Audit Compliance Score',     unit:'%',              type:'number', help:'% compliance score in DGMS safety audit'},
  ]},
];

// ── Sub-Topic Sections (7) ────────────────────────────────────────────────

export const SUBTOPIC_SECTIONS: SectionDef[] = [
  { id:'minelife', label:'Mine Life', color:'#185FA5', icon:'⏱', fields:[
    {k:'reserve_mt',          label:'Mineable Coal Reserve',          unit:'Million Tonnes (Mt)',              type:'number'},
    {k:'annual_prod_mty',     label:'Annual Production Rate',         unit:'Million Tonnes per Year (MTY)',             type:'number'},
    {k:'mine_life_yr',        label:'Mine Life',                      unit:'years',           type:'number', help:'Auto: Reserve ÷ Production. Fill directly or let formula compute.'},
    {k:'stripping_ratio_overall', label:'Overall Stripping Ratio (OSR)',    unit:'Bank Cubic Meter (BCM):tonne',           type:'number'},
    {k:'hemm_availability',   label:'Heavy Earth-Moving Machinery (HEMM) Mechanical Availability',   unit:'%',               type:'number'},
    {k:'hemm_utilisation',    label:'Heavy Earth-Moving Machinery (HEMM) Utilisation',               unit:'%',               type:'number'},
    {k:'advance_rate_m_month',label:'Mining Advance Rate',            unit:'m/month',         type:'number'},
  ]},
  { id:'hemm', label:'Heavy Earth-Moving Machinery (HEMM) & Cost', color:'#185FA5', icon:'🚛', fields:[
    {k:'shovel_bucket_m3',    label:'Shovel Bucket Capacity',         unit:'m³',              type:'number'},
    {k:'bucket_fill_factor',  label:'Bucket Fill Factor',             unit:'—',               type:'number'},
    {k:'shovel_swing_sec',    label:'Shovel Swing Cycle Time',        unit:'seconds',         type:'number'},
    {k:'shovel_output_bcmhr', label:'Shovel Output Rate',             unit:'Bank Cubic Meter (BCM)/hr',          type:'number'},
    {k:'num_shovels',         label:'Number of Shovels',              unit:'count',           type:'number'},
    {k:'dumper_payload_t',    label:'Dumper Payload',                 unit:'tonnes',          type:'number'},
    {k:'haul_dist_m',         label:'Haul Distance (one way)',        unit:'metres',          type:'number'},
    {k:'laden_speed_kmhr',    label:'Dumper Laden Speed',             unit:'km/hr',           type:'number'},
    {k:'empty_speed_kmhr',    label:'Dumper Empty Speed',             unit:'km/hr',           type:'number'},
    {k:'truck_cycle_min',     label:'Truck Cycle Time',               unit:'minutes',         type:'number'},
    {k:'num_dumpers',         label:'Number of Dumpers',              unit:'count',           type:'number'},
    {k:'capex_cr',            label:'Total Heavy Earth-Moving Machinery (HEMM) + Civil Capital Expenditure (CAPEX)', unit:'₹ Crore', type:'number'},
    {k:'opex_per_tonne',      label:'Operating Expenditure (OPEX) (all-in per tonne)', unit:'₹/tonne', type:'number'},
    {k:'ob_mining_cost',      label:'Overburden (OB) Mining Cost',     unit:'₹/Bank Cubic Meter (BCM)', type:'number'},
    {k:'fuel_consumption_ltr_t', label:'Fuel Consumption',            unit:'L/tonne',         type:'number'},
  ]},
  { id:'sr', label:'Stripping Ratio', color:'#185FA5', icon:'📐', fields:[
    {k:'stripping_ratio_instantaneous', label:'Instantaneous Stripping Ratio (ISR)', unit:'Bank Cubic Meter (BCM):tonne', type:'number'},
    {k:'stripping_ratio_overall', label:'Overall Stripping Ratio (OSR)', unit:'Bank Cubic Meter (BCM):tonne', type:'number'},
    {k:'besr',                label:'Break-Even Stripping Ratio (BESR)', unit:'Bank Cubic Meter (BCM):tonne', type:'number'},
    {k:'coal_price_t',        label:'Coal Sale Price',                unit:'₹/tonne',         type:'number'},
    {k:'ob_thickness_avg_m',  label:'Overburden (OB) Thickness (average)',         unit:'m',               type:'number'},
    {k:'seam_thickness_avg_m',label:'Seam Thickness (average)',       unit:'m',               type:'number'},
    {k:'seam_dip_deg',        label:'Seam Dip',                      unit:'degrees',          type:'number'},
  ]},
  { id:'coal', label:'Coal Quality', color:'#534AB7', icon:'🔬', fields:[
    {k:'gcv_seamwise',        label:'Gross Calorific Value (GCV) — Seam-wise', unit:'kcal/kg', type:'number'},
    {k:'gcv_blended',         label:'Blended Gross Calorific Value (GCV) (weighted avg)', unit:'kcal/kg', type:'number', help:'Coal India Limited (CIL) Grade: A(>6700), B(6201-6700), C(5601-6200), D(4941-5600), E(4201-4940), F(3361-4200), G(≤3360)'},
    {k:'ash_pct',             label:'Ash Content',                   unit:'%',                type:'number'},
    {k:'total_moisture_pct',  label:'Total Moisture',                unit:'%',                type:'number'},
    {k:'inherent_moisture_pct', label:'Inherent Moisture',           unit:'%',                type:'number'},
    {k:'volatile_matter_pct', label:'Volatile Matter',               unit:'%',                type:'number'},
    {k:'fixed_carbon_pct',    label:'Fixed Carbon',                  unit:'%',                type:'number'},
    {k:'sulphur_pct',         label:'Sulphur Content',               unit:'%',                type:'number'},
    {k:'cpt_deg',             label:'Crossing Point Temperature (CPT)',    unit:'°C',               type:'number', help:'Spontaneous combustion index: <140°C = high risk'},
  ]},
  { id:'blast', label:'Bench & Blast', color:'#185FA5', icon:'💥', fields:[
    {k:'bench_height_ob_m',   label:'Overburden (OB) Bench Height', unit:'m', type:'number'},
    {k:'bench_height_coal_m', label:'Coal Bench Height',             unit:'m',                type:'number'},
    {k:'blast_hole_dia_mm',   label:'Blast Hole Diameter',           unit:'mm',               type:'number'},
    {k:'blast_burden_m',      label:'Blast Burden (B)',              unit:'m',                type:'number'},
    {k:'blast_spacing_m',     label:'Blast Spacing (S)',             unit:'m',                type:'number'},
    {k:'powder_factor_kgbcm', label:'Powder Factor',                 unit:'kg/BCM',           type:'number'},
    {k:'ucs_ob_mpa',          label:'UCS of OB Rock',                unit:'MPa',              type:'number'},
    {k:'rqd_ob',              label:'Rock Quality Designation — OB', unit:'%',                type:'number'},
    {k:'highwall_fos',        label:'Highwall FoS (Bishop)',         unit:'—',                type:'number'},
    {k:'haul_road_width_m',   label:'Haul Road Width',               unit:'m',                type:'number'},
    {k:'haul_road_gradient_pct', label:'Haul Road Max Gradient',     unit:'%',                type:'number', help:'Maximum laden gradient — typically ≤8% for 85 t dumpers'},
    {k:'rolling_resistance_kgt', label:'Rolling Resistance',         unit:'kg/tonne',         type:'number'},
  ]},
  { id:'dewater', label:'Dewatering', color:'#3B6D11', icon:'💧', fields:[
    {k:'hydraulic_conductivity_mday', label:'Hydraulic Conductivity', unit:'m/day',           type:'number'},
    {k:'aquifer_thickness_m', label:'Aquifer Thickness',             unit:'m',                type:'number'},
    {k:'depth_below_wt_m',    label:'Depth Below Water Table',       unit:'m',                type:'number'},
    {k:'catchment_area_km2',  label:'Mine Catchment Area',           unit:'km²',              type:'number'},
    {k:'annual_rainfall_mm',  label:'Annual Rainfall (IMD)',         unit:'mm/yr',            type:'number'},
    {k:'runoff_coefficient',  label:'Catchment Runoff Coefficient',  unit:'—',                type:'number'},
    {k:'water_inflow_m3hr',   label:'Total Mine Water Inflow Rate',  unit:'m³/hr',            type:'number'},
    {k:'pump_capacity_m3hr',  label:'Installed Pump Capacity',       unit:'m³/hr',            type:'number'},
    {k:'pumping_head_m',      label:'Total Pumping Head',            unit:'m',                type:'number'},
    {k:'power_tariff_kwh',    label:'Power Tariff (for pumping)',    unit:'₹/kWh',            type:'number'},
    {k:'water_recycling_pct', label:'Mine Water Recycling Rate',     unit:'%',                type:'number'},
  ]},
  { id:'infra', label:'Infrastructure', color:'#534AB7', icon:'🏗', fields:[
    {k:'rail_dist_km',        label:'Mine to Rail Siding Distance',  unit:'km',               type:'number'},
    {k:'rail_tariff',         label:'FOIS Rail Freight Tariff',      unit:'₹/t-km',           type:'number'},
    {k:'road_haulage_cost',   label:'Road Haulage Cost',             unit:'₹/t-km',           type:'number'},
    {k:'annual_despatch_mty', label:'Annual Coal Despatch Volume',   unit:'Mtpa',             type:'number'},
    {k:'total_logistics_cost_t', label:'Total Logistics Cost',       unit:'₹/tonne',          type:'number'},
    {k:'grid_power_availability_pct', label:'Grid Power Availability', unit:'% hrs/yr',       type:'number'},
    {k:'energy_demand_mwh',   label:'Annual Energy Demand',          unit:'MWh/yr',           type:'number'},
    {k:'power_tariff_kwh',    label:'Power Tariff — DISCOM',         unit:'₹/kWh',            type:'number'},
    {k:'process_water_demand_m3day', label:'Process Water Demand',   unit:'m³/day',           type:'number'},
    {k:'renewable_energy_pct',label:'Renewable Energy Share',        unit:'%',                type:'number'},
  ]},
];
