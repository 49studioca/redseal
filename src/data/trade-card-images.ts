/** Trade card hero images — synced to Supabase Storage via npm run db:sync-trade-card-images */
export const TRADE_CARD_IMAGES: Record<
  string,
  { sourceUrl: string; storagePath: string; alt: string }
> = {
  "agricultural-equipment-technician": {
    "sourceUrl": "https://www.oldscollege.ca/_media/trades_student_instructor.jpg",
    "storagePath": "trade-cards/agricultural-equipment-technician.jpg",
    "alt": "Agricultural Equipment Technician Apprenticeship | Olds College | Alberta, Canada"
  },
  "appliance-service-technician": {
    "sourceUrl": "https://atinstitute.ca/wp-content/uploads/2023/05/Mr.-Soni-Appliance-Repair.jpeg",
    "storagePath": "trade-cards/appliance-service-technician.jpg",
    "alt": "APPLIANCE SERVICE TECHNICIAN - THE BEST DECISION OF MY LIFE · Appliance Technical Institute of Canada Inc."
  },
  "automotive-refinishing-technician": {
    "sourceUrl": "https://skilledtradesbc.ca/sites/default/files/2023-01/art-01.jpg",
    "storagePath": "trade-cards/automotive-refinishing-technician.jpg",
    "alt": "Automotive Refinishing Technician | SkilledTradesBC"
  },
  "automotive-service-technician": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Mr._Green%2C_and_automotive_technician_with_Northrop-Grumman%2C_the_contractor_for_most_support_functions_at_Vance_Air_Force_Base%2C_performs_routine_maintenance_on_an_Air_Force_light_tru_-_DPLA_-_be40723136bb923f28e96c38f2f9f3ea.jpeg/1280px-thumbnail.jpeg",
    "storagePath": "trade-cards/automotive-service-technician.jpg",
    "alt": "Mr. Green, and automotive technician with Northrop-Grumman, the contractor for most support functions at Vance Air Forc…"
  },
  "baker": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Photograph_of_horse_and_cart_outside_a_house._The_cart_bears_the_words_%22B._L._Detlor%2C_Baker_%26_Confectioner%2C_Home-Made_Bread%22._Bismark_Leroy_Detlor_owned_a_bake_shop_in_St._George_Street%2C_%285934476424%29.jpg/960px-thumbnail.jpg",
    "storagePath": "trade-cards/baker.jpg",
    "alt": "Photograph of horse and cart outside a house. The cart bears the words \"B. L. Detlor, Baker & Confectioner, Home-Made B…"
  },
  "boilermaker": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Boilermaker_-_Alfred_T_Palmer.jpg",
    "storagePath": "trade-cards/boilermaker.jpg",
    "alt": "Boilermaker - Alfred T Palmer"
  },
  "bricklayer": {
    "sourceUrl": "https://www.bacalberta.ca/uploads/thumbnails/bricklayers2.jpg.3390dc50.jpg",
    "storagePath": "trade-cards/bricklayer.jpg",
    "alt": "Bricklayers Local 1 Alberta"
  },
  "cabinetmaker": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Cabinetmaker_in_workshop.jpg",
    "storagePath": "trade-cards/cabinetmaker.jpg",
    "alt": "Cabinetmaker in workshop"
  },
  "carpenter": {
    "sourceUrl": "https://maderaprojects.ca/wp-content/uploads/bb-plugin/cache/residential-roof-framing-carpenter-installation-landscape-357784858fee8a6abfd88b4e12b6bdaf-2epkc94tbw1o.jpg",
    "storagePath": "trade-cards/carpenter.jpg",
    "alt": "Red Seal Carpenter in Vancouver, BC | Madera Projects"
  },
  "concrete-finisher": {
    "sourceUrl": "https://www.ctaontario.ca/wp-content/uploads/2023/06/cement_concrete_finisher_800x800_150dpi-min-768x768.jpg",
    "storagePath": "trade-cards/concrete-finisher.jpg",
    "alt": "Cement & Concrete Finisher - Construction Training & Apprenticeship Ontario (CTAO)"
  },
  "concrete-pump-operator": {
    "sourceUrl": "https://www.ctaontario.ca/wp-content/uploads/2023/06/Concrete-Pump-Operator.jpg",
    "storagePath": "trade-cards/concrete-pump-operator.jpg",
    "alt": "Concrete Pump Operator - Construction Training & Apprenticeship Ontario (CTAO)"
  },
  "construction-craft-worker": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/6/61/Fotothek_df_n-22_0000341_Dachdecker%2C_Schlachthof.jpg",
    "storagePath": "trade-cards/construction-craft-worker.jpg",
    "alt": "Fotothek df n-22 0000341 Dachdecker, Schlachthof"
  },
  "construction-electrician": {
    "sourceUrl": "https://saskapprenticeship.ca/wp-content/uploads/2023/05/Con-Elect-Gordon-AUS_0727-scaled.jpg",
    "storagePath": "trade-cards/construction-electrician.jpg",
    "alt": "Construction Electrician | SATCC"
  },
  "cook": {
    "sourceUrl": "https://cdninterior.s3.ca-central-1.amazonaws.com/wp-content/uploads/2026/05/FredsKitchen_Foundry-1024x683.jpg",
    "storagePath": "trade-cards/cook.jpg",
    "alt": "The future of commercial kitchens is electric, but it will not be simple - Canadian Interiors"
  },
  "drywall-finisher-plasterer": {
    "sourceUrl": "https://www.ctaontario.ca/wp-content/uploads/2023/06/drywall_finisher_plasterer_800x800_150dpi-min-768x768.jpg",
    "storagePath": "trade-cards/drywall-finisher-plasterer.jpg",
    "alt": "Drywall Finisher & Plasterer - Construction Training & Apprenticeship Ontario (CTAO)"
  },
  "electric-motor-systems-technician": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/A_technician_at_AeroVironment%27s_Design_Development_Center_in_Simi_Valley%2C_California%2C_checks_a_panel_of_silicon_solar_cells_for_conductivity_and_voltage_%28EC00-0283-9%29.jpg/1280px-thumbnail.jpg",
    "storagePath": "trade-cards/electric-motor-systems-technician.jpg",
    "alt": "A technician at AeroVironment's Design Development Center in Simi Valley, California, checks a panel of silicon solar c…"
  },
  "elevator-constructor": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Ruins_of_the_remaining_grain_elevator_on_Toronto%27s_old_rooster_squat_-a.jpg/960px-Ruins_of_the_remaining_grain_elevator_on_Toronto%27s_old_rooster_squat_-a.jpg",
    "storagePath": "trade-cards/elevator-constructor.jpg",
    "alt": "Ruins of the remaining grain elevator on Toronto's old rooster squat -a"
  },
  "floorcovering-installer": {
    "sourceUrl": "https://www.ctaontario.ca/wp-content/uploads/2023/06/floor_covering_installer_800x800_150dpi-min-768x768.jpg",
    "storagePath": "trade-cards/floorcovering-installer.jpg",
    "alt": "Floor Covering Installer - Construction Training & Apprenticeship Ontario (CTAO)"
  },
  "gasfitter": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/2/27/Guitar%2C_Amp_and_Keyboard_Centre_%28GAK%29%2C_79-80_North_Road%2C_Brighton%2C_by_Simon_Carey%2C_geograph.co.uk_2683317.jpg",
    "storagePath": "trade-cards/gasfitter.jpg",
    "alt": "Guitar, Amp and Keyboard Centre (GAK), 79-80 North Road, Brighton, by Simon Carey, geograph.co.uk 2683317"
  },
  "glazier": {
    "sourceUrl": "https://www.glasscanadamag.com/wp-content/uploads/2025/10/IMG_2410-scaled.jpeg",
    "storagePath": "trade-cards/glazier.jpg",
    "alt": "Glazier Expo is something new and fun - Glass CanadaGlass Canada"
  },
  "hairstylist": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Haircut_or_hair_Salon_From_Iran-_Canon_Photography-_Mostafa_Meraji-_fashion_Photo_02.jpg/960px-Haircut_or_hair_Salon_From_Iran-_Canon_Photography-_Mostafa_Meraji-_fashion_Photo_02.jpg",
    "storagePath": "trade-cards/hairstylist.jpg",
    "alt": "Haircut or hair Salon From Iran- Canon Photography- Mostafa Meraji- fashion Photo 02"
  },
  "heavy-duty-equipment-technician": {
    "sourceUrl": "https://alis.alberta.ca/media/tzqfbfn0/heavy-equipment-technician.jpg",
    "storagePath": "trade-cards/heavy-duty-equipment-technician.jpg",
    "alt": "Heavy Equipment Technician: Occupations in Alberta - alis"
  },
  "heavy-equipment-operator-dozer": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Dozer_and_Piece_of_Heavy_Equipment_-_DPLA_-_7c8b0f09bf9b49c8a54048f22955025b.jpg/1280px-Dozer_and_Piece_of_Heavy_Equipment_-_DPLA_-_7c8b0f09bf9b49c8a54048f22955025b.jpg",
    "storagePath": "trade-cards/heavy-equipment-operator-dozer.jpg",
    "alt": "Dozer and Piece of Heavy Equipment - DPLA - 7c8b0f09bf9b49c8a54048f22955025b"
  },
  "industrial-electrician": {
    "sourceUrl": "https://novastaffing.com/wp-content/uploads/2023/12/man-electrical-technician.jpg",
    "storagePath": "trade-cards/industrial-electrician.jpg",
    "alt": "Average salary for electricians in Canada for 2023-2024"
  },
  "industrial-instrument-technician": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Perkin-Elmer_atomic_absorption_spectrophotometer_in_use_at_industrial_hygiene_laboratory_-_DPLA_-_efdd66886154b0c94e9c47c8b46a5a96.jpg/1280px-Perkin-Elmer_atomic_absorption_spectrophotometer_in_use_at_industrial_hygiene_laboratory_-_DPLA_-_efdd66886154b0c94e9c47c8b46a5a96.jpg",
    "storagePath": "trade-cards/industrial-instrument-technician.jpg",
    "alt": "Perkin-Elmer atomic absorption spectrophotometer in use at industrial hygiene laboratory - DPLA - efdd66886154b0c94e9c4…"
  },
  "instrumentation-control-technician": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Blue_Grass_Chemical_Agent-Destruction_Pilot_Plant_Instrumentation_and_Controls_Technician_%2849060275357%29.jpg/1280px-Blue_Grass_Chemical_Agent-Destruction_Pilot_Plant_Instrumentation_and_Controls_Technician_%2849060275357%29.jpg",
    "storagePath": "trade-cards/instrumentation-control-technician.jpg",
    "alt": "Blue Grass Chemical Agent-Destruction Pilot Plant Instrumentation and Controls Technician (49060275357)"
  },
  "insulator-heat-frost": {
    "sourceUrl": "https://www.ctaontario.ca/wp-content/uploads/2023/06/1-2.jpg",
    "storagePath": "trade-cards/insulator-heat-frost.jpg",
    "alt": "Heat & Frost Insulator - Construction Training & Apprenticeship Ontario (CTAO)"
  },
  "ironworker-reinforcing": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Workers_bend_reinforcing_bar%2C_or_rebar%2C_to_strengthen_concrete_for_a_facility_that_will_house_372_students_as_part_of_the_Herat_University_Women%27s_Dormitory_Project_in_Herat_province%2C_Afghanistan%2C_March_11_140311-A-DT641-067.jpg/1280px-thumbnail.jpg",
    "storagePath": "trade-cards/ironworker-reinforcing.jpg",
    "alt": "Workers bend reinforcing bar, or rebar, to strengthen concrete for a facility that will house 372 students as part of t…"
  },
  "ironworker-structural": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Ironworkers_fabricating_structural_steel_for_the_architectural_framing_by_47th_Street_in_the_future_LIRR_passenger_concourse._%2849434605136%29.jpg/1280px-Ironworkers_fabricating_structural_steel_for_the_architectural_framing_by_47th_Street_in_the_future_LIRR_passenger_concourse._%2849434605136%29.jpg",
    "storagePath": "trade-cards/ironworker-structural.jpg",
    "alt": "Ironworkers fabricating structural steel for the architectural framing by 47th Street in the future LIRR passenger conc…"
  },
  "landscape-horticulturist": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/William_Emes_-_Garden_Design_for_Northwick_Park_-_B1975.2.350_-_Yale_Center_for_British_Art.jpg/1280px-William_Emes_-_Garden_Design_for_Northwick_Park_-_B1975.2.350_-_Yale_Center_for_British_Art.jpg",
    "storagePath": "trade-cards/landscape-horticulturist.jpg",
    "alt": "William Emes - Garden Design for Northwick Park - B1975.2.350 - Yale Center for British Art"
  },
  "lather-interior-systems": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Peking_Observatory_1.jpg/1280px-Peking_Observatory_1.jpg",
    "storagePath": "trade-cards/lather-interior-systems.jpg",
    "alt": "Peking Observatory 1"
  },
  "locksmith": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Schlage_Door_Lock_Keypad_System_Installed.jpg/1280px-Schlage_Door_Lock_Keypad_System_Installed.jpg",
    "storagePath": "trade-cards/locksmith.jpg",
    "alt": "Schlage Door Lock Keypad System Installed"
  },
  "machinist": {
    "sourceUrl": "https://d29ao6x945u76k.cloudfront.net/feeds/1/dd8407e7211c29315b57542bd0ec970d.jpg",
    "storagePath": "trade-cards/machinist.jpg",
    "alt": "Work in Canada as a Machinist | CanaMigrate | CanaMigrate.com"
  },
  "metal-fabricator": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Metal_movable_text.jpg",
    "storagePath": "trade-cards/metal-fabricator.jpg",
    "alt": "Metal movable text"
  },
  "millwright": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Armco_Bulletin%2C_December_1914_-_DPLA_-_a4c9e8f5a6bca44734def14ff8551460_%28page_5%29.jpg",
    "storagePath": "trade-cards/millwright.jpg",
    "alt": "Armco Bulletin, December 1914 - DPLA - a4c9e8f5a6bca44734def14ff8551460 (page 5)"
  },
  "mobile-crane-operator": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Turbine_Tower_No_23_construction_site_in_June_2008_-_geograph.org.uk_-_960072.jpg",
    "storagePath": "trade-cards/mobile-crane-operator.jpg",
    "alt": "Turbine Tower No 23 construction site in June 2008 - geograph.org.uk - 960072"
  },
  "motor-vehicle-body-repairer": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/DSC00529_-_Motorized_draisine_GTR_10_%2848167665491%29.jpg/960px-DSC00529_-_Motorized_draisine_GTR_10_%2848167665491%29.jpg",
    "storagePath": "trade-cards/motor-vehicle-body-repairer.jpg",
    "alt": "DSC00529 - Motorized draisine GTR 10 (48167665491)"
  },
  "motorcycle-technician": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/US_Navy_080626-N-3885H-008_Hull_maintenance_Technician_1st_Class_Nicholas_Brunney%2C_assigned_to_Pre-Commissioning_Unit_George_H.W._Bush_%28CVN_77%29%2C_checks_in_a_motorcycle_rider_at_the_2nd_annual_Motorcycle_Rally_at_Naval_Station_N.jpg/1280px-thumbnail.jpg",
    "storagePath": "trade-cards/motorcycle-technician.jpg",
    "alt": "US Navy 080626-N-3885H-008 Hull maintenance Technician 1st Class Nicholas Brunney, assigned to Pre-Commissioning Unit G…"
  },
  "painter-decorator": {
    "sourceUrl": "https://www.ctaontario.ca/wp-content/uploads/2023/06/painter_decorator_industrial_800x800_150dpi-min-768x768.jpg",
    "storagePath": "trade-cards/painter-decorator.jpg",
    "alt": "Painter & Decorator (Industrial) - Construction Training & Apprenticeship Ontario (CTAO)"
  },
  "parts-technician": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/AIRMAN_1ST_Class_Demoss%2C_a_jet_engine_technician_assigned_to_the_37th_Component_Repair_Squadron%2C_works_on_jet_engine_parts_during_an_operational_readiness_inspection_-_DPLA_-_4f3a8e2732a63b2b39cc066aeef53219.jpeg/1280px-thumbnail.jpeg",
    "storagePath": "trade-cards/parts-technician.jpg",
    "alt": "AIRMAN 1ST Class Demoss, a jet engine technician assigned to the 37th Component Repair Squadron, works on jet engine pa…"
  },
  "plumber": {
    "sourceUrl": "https://www.ctaontario.ca/wp-content/uploads/2023/06/Plumber.jpg",
    "storagePath": "trade-cards/plumber.jpg",
    "alt": "Plumber - Construction Training & Apprenticeship Ontario (CTAO)"
  },
  "powerline-technician": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Hino_500_Ranger_Lineman_Repair_Truck.jpg/1280px-Hino_500_Ranger_Lineman_Repair_Truck.jpg",
    "storagePath": "trade-cards/powerline-technician.jpg",
    "alt": "Hino 500 Ranger Lineman Repair Truck"
  },
  "recreation-vehicle-technician": {
    "sourceUrl": "https://tradesappliedtech.viu.ca/sites/default/files/styles/viu_responsive_bg_medium_landscape/public/viu-rv-service-technician_1.jpg?h=9eb0d413&itok=iYuwXBUU",
    "storagePath": "trade-cards/recreation-vehicle-technician.jpg",
    "alt": "Recreational Vehicle (RV) Service Technician Apprenticeship program | Vancouver Island University | Canada"
  },
  "refrigeration-ac-mechanic": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Shintaro_Sato%2C_Refrigeration_and_AIC_Mechanic_Foreman-A_%28PRY312Al%29_%287786493916%29.jpg/1280px-Shintaro_Sato%2C_Refrigeration_and_AIC_Mechanic_Foreman-A_%28PRY312Al%29_%287786493916%29.jpg",
    "storagePath": "trade-cards/refrigeration-ac-mechanic.jpg",
    "alt": "Shintaro Sato, Refrigeration and AIC Mechanic Foreman-A (PRY312Al) (7786493916)"
  },
  "rig-technician": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/A_technician_inspects_an_experimental_copper_nozzle_GRC-1962-P-01214.jpg/1280px-A_technician_inspects_an_experimental_copper_nozzle_GRC-1962-P-01214.jpg",
    "storagePath": "trade-cards/rig-technician.jpg",
    "alt": "A technician inspects an experimental copper nozzle GRC-1962-P-01214"
  },
  "roofer": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Pre_demolition_photos_of_NASA_MSFC_building_4201_from_the_roof_o_%28MSFC-202200839%29.tiff/lossy-page1-1280px-Pre_demolition_photos_of_NASA_MSFC_building_4201_from_the_roof_o_%28MSFC-202200839%29.tiff.jpg",
    "storagePath": "trade-cards/roofer.jpg",
    "alt": "Pre demolition photos of NASA MSFC building 4201 from the roof o (MSFC-202200839)"
  },
  "sheet-metal-worker": {
    "sourceUrl": "http://tradeupmanitoba.com/wp-content/uploads/2018/08/SheetMetalWorker_Banner.jpg",
    "storagePath": "trade-cards/sheet-metal-worker.jpg",
    "alt": "Sheet Metal Worker | Trade Up Manitoba"
  },
  "sprinkler-fitter": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/United_States_President_Joe_Biden_walks_onstage_to_deliver_remarks_at_the_Sprinkler_Fitters_Local_692_Hall_on_November_1%2C_2024%2C_in_Philadelphia%2C_Pennsylvania.jpg/1280px-thumbnail.jpg",
    "storagePath": "trade-cards/sprinkler-fitter.jpg",
    "alt": "United States President Joe Biden walks onstage to deliver remarks at the Sprinkler Fitters Local 692 Hall on November …"
  },
  "steamfitter-pipefitter": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/List_of_residents_4.djvu/page1-1280px-List_of_residents_4.djvu.jpg",
    "storagePath": "trade-cards/steamfitter-pipefitter.jpg",
    "alt": "List of residents 4"
  },
  "tilesetter": {
    "sourceUrl": "https://www.workbc.ca/sites/default/files/styles/hero_image/public/NTI5NzE_VdlDE67wXQIXL9u1-7283-NOC.jpg?itok=kFUsch00",
    "storagePath": "trade-cards/tilesetter.jpg",
    "alt": "Tilesetters | WorkBC"
  },
  "tool-die-maker": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Model_maker_at_work_at_the_North_Sands_shipyard_%2815693791574%29.jpg",
    "storagePath": "trade-cards/tool-die-maker.jpg",
    "alt": "Model maker at work at the North Sands shipyard (15693791574)"
  },
  "tower-crane-operator": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Turbine_Tower_No_23_construction_site_in_June_2008_-_geograph.org.uk_-_960072.jpg",
    "storagePath": "trade-cards/tower-crane-operator.jpg",
    "alt": "Turbine Tower No 23 construction site in June 2008 - geograph.org.uk - 960072"
  },
  "truck-transport-mechanic": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Royal_Electrical_and_Mechanical_Engineers_put_their_training_into_practice_MOD_45167724.jpg/1280px-Royal_Electrical_and_Mechanical_Engineers_put_their_training_into_practice_MOD_45167724.jpg",
    "storagePath": "trade-cards/truck-transport-mechanic.jpg",
    "alt": "Royal Electrical and Mechanical Engineers put their training into practice MOD 45167724"
  },
  "turbine-technician": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/De_Havilland_Canada_DHC-3T_Vazar_Turbine_Otter%2C_Watson%27s_Skyways_AN1399744.jpg/960px-De_Havilland_Canada_DHC-3T_Vazar_Turbine_Otter%2C_Watson%27s_Skyways_AN1399744.jpg",
    "storagePath": "trade-cards/turbine-technician.jpg",
    "alt": "De Havilland Canada DHC-3T Vazar Turbine Otter, Watson's Skyways AN1399744"
  },
  "water-well-driller": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/View_across_Canada_Water%2C_Rotherhithe_-_geograph.org.uk_-_8032898.jpg/960px-View_across_Canada_Water%2C_Rotherhithe_-_geograph.org.uk_-_8032898.jpg",
    "storagePath": "trade-cards/water-well-driller.jpg",
    "alt": "View across Canada Water, Rotherhithe - geograph.org.uk - 8032898"
  },
  "welder": {
    "sourceUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Male_welder_wearing_welding_mask_joins_Y-shaped_steam_pipe_in_the_Polymer_Corporation_Limited_plant%2C_Sarnia%2C_Ontario_%2836130820183%29.jpg",
    "storagePath": "trade-cards/welder.jpg",
    "alt": "Male welder wearing welding mask joins Y-shaped steam pipe in the Polymer Corporation Limited plant, Sarnia, Ontario (3…"
  }
};

export type TradeCardImageSlug = keyof typeof TRADE_CARD_IMAGES;
