(() => {
  // js/engine/gameState.js
  var gameState = {
    resources: {},
    buildings: {},
    technologies: {},
    upgrades: {},
    workers: {},
    unlocked: {
      resources: /* @__PURE__ */ new Set(),
      buildings: /* @__PURE__ */ new Set(),
      technologies: /* @__PURE__ */ new Set(),
      upgrades: /* @__PURE__ */ new Set(),
      workers: /* @__PURE__ */ new Set(),
      trades: /* @__PURE__ */ new Set()
    },
    time: {
      totalTicks: 0,
      currentDay: 1,
      currentSeason: 0,
      currentYear: 1
    },
    statistics: {
      totalBuildingsBuilt: 0,
      totalWorkersHired: 0,
      totalTechsResearched: 0,
      eventsExperienced: [],
      totalPrestigeResets: 0,
      totalClicks: 0,
      totalTradesCompleted: 0,
      allTime: {
        totalBuildingsBuilt: 0,
        totalWorkersHired: 0,
        totalTechsResearched: 0,
        totalClicks: 0,
        totalTradesCompleted: 0,
        totalPlayTimeMs: 0,
        totalRunsCompleted: 0
      }
    },
    meta: {
      version: 1,
      lastSaveTimestamp: null
    },
    trades: {},
    events: {
      activeEvent: null,
      eventHistory: [],
      cooldowns: {},
      timedEffects: [],
      eventQueue: []
    },
    calendar: {
      activeSeasons: []
    },
    prestige: {
      industryCred: 0,
      totalResets: 0,
      purchasedUpgrades: {},
      currentRunStartTick: 0,
      currentRunStartTime: Date.now(),
      runHistory: []
    },
    philosophy: {
      conviction: 0,
      allocations: {},
      lastConvictionThreshold: 0
    },
    achievements: {
      unlocked: {}
    }
  };
  function resetState(data2) {
    gameState.resources = {};
    for (const [id, def] of data2.resources) {
      gameState.resources[id] = {
        amount: def.startAmount || 0,
        cap: def.baseCap,
        lifetimeTotal: 0
      };
    }
    gameState.buildings = {};
    for (const [id] of data2.buildings) {
      gameState.buildings[id] = { count: 0 };
    }
    gameState.technologies = {};
    for (const [id] of data2.technologies) {
      gameState.technologies[id] = { researched: false, researchProgress: 0 };
    }
    gameState.upgrades = {};
    for (const [id] of data2.upgrades) {
      gameState.upgrades[id] = { purchased: false };
    }
    gameState.workers = {};
    for (const [id] of data2.workers) {
      gameState.workers[id] = { count: 0 };
    }
    gameState.research = { activeId: null };
    gameState.crafting = {};
    if (data2.crafting) {
      for (const [id] of data2.crafting) {
        gameState.crafting[id] = { craftProgress: 0, craftCount: 0 };
      }
    }
    gameState.unlocked = {
      resources: /* @__PURE__ */ new Set(),
      buildings: /* @__PURE__ */ new Set(),
      technologies: /* @__PURE__ */ new Set(),
      upgrades: /* @__PURE__ */ new Set(),
      workers: /* @__PURE__ */ new Set(),
      trades: /* @__PURE__ */ new Set(),
      crafting: /* @__PURE__ */ new Set()
    };
    for (const [id, def] of data2.resources) {
      if (def.visible === true || def.unlockCondition === null) {
        gameState.unlocked.resources.add(id);
      }
    }
    for (const [id, def] of data2.buildings) {
      if (def.unlockCondition === null) {
        gameState.unlocked.buildings.add(id);
      }
    }
    for (const [id, def] of data2.technologies) {
      if (def.prerequisites.length === 0 && def.unlockCondition == null) {
        gameState.unlocked.technologies.add(id);
      }
    }
    for (const [id, def] of data2.upgrades) {
      if (def.unlockCondition === null) {
        gameState.unlocked.upgrades.add(id);
      }
    }
    for (const [id, def] of data2.workers) {
      if (def.unlockCondition === null) {
        gameState.unlocked.workers.add(id);
      }
    }
    if (data2.crafting) {
      for (const [id, def] of data2.crafting) {
        if (def.unlockCondition === null) {
          gameState.unlocked.crafting.add(id);
        }
      }
    }
    gameState.population = {
      total: 0,
      free: 0,
      happiness: 100,
      names: []
    };
    gameState.trades = {};
    for (const [id] of data2.trades) {
      gameState.trades[id] = { attitude: 0, totalTradesCompleted: 0, lastTradeDay: 0 };
    }
    gameState.events = {
      activeEvent: null,
      eventHistory: [],
      cooldowns: {},
      timedEffects: [],
      eventQueue: []
    };
    gameState.calendar = {
      activeSeasons: []
    };
    gameState.time = { totalTicks: 0, currentDay: 1, currentSeason: 0, currentYear: 1 };
    const prevAllTime = gameState.statistics?.allTime;
    gameState.statistics = {
      totalBuildingsBuilt: 0,
      totalWorkersHired: 0,
      totalTechsResearched: 0,
      eventsExperienced: [],
      totalPrestigeResets: gameState.statistics?.totalPrestigeResets || 0,
      totalClicks: 0,
      totalTradesCompleted: 0,
      allTime: prevAllTime || {
        totalBuildingsBuilt: 0,
        totalWorkersHired: 0,
        totalTechsResearched: 0,
        totalClicks: 0,
        totalTradesCompleted: 0,
        totalPlayTimeMs: 0,
        totalRunsCompleted: 0
      }
    };
    gameState.meta = { version: 1, lastSaveTimestamp: null };
    if (!gameState.prestige) {
      gameState.prestige = {
        industryCred: 0,
        totalResets: 0,
        purchasedUpgrades: {},
        currentRunStartTick: 0,
        currentRunStartTime: Date.now(),
        runHistory: []
      };
    }
    gameState.prestige.currentRunStartTick = 0;
    gameState.prestige.currentRunStartTime = Date.now();
    if (!gameState.philosophy) {
      gameState.philosophy = {
        conviction: 0,
        allocations: {},
        lastConvictionThreshold: 0
      };
    }
    if (!gameState.achievements) {
      gameState.achievements = { unlocked: {} };
    }
  }
  function getResource(id) {
    return gameState.resources[id];
  }
  function setResource(id, amount) {
    const res = gameState.resources[id];
    if (!res) return;
    const oldAmount = res.amount;
    res.amount = Math.max(0, Math.min(amount, res.cap));
    const delta = res.amount - oldAmount;
    if (delta > 0) {
      res.lifetimeTotal += delta;
    }
  }
  function addResource(id, delta) {
    const res = gameState.resources[id];
    if (!res) return;
    setResource(id, res.amount + delta);
  }

  // data/resources.json
  var resources_default = [
    {
      id: "cli_commands",
      name: "CLI Commands",
      description: "show run, show int status, the classics. You could type them in your sleep. You have.",
      category: "basic",
      baseCap: 500,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "ping_responses",
      name: "Ping Responses",
      description: "That satisfying !!!!! \u2014 proof that something, somewhere, is alive.",
      category: "basic",
      baseCap: 200,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "log_entries",
      name: "Log Entries",
      description: "Mostly %LINEPROTO-5-UPDOWN. Sometimes something useful.",
      category: "basic",
      baseCap: 1e3,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "coffee",
      name: "Coffee",
      description: "The fuel of infrastructure. Measured in mass-produced cups. Goes stale over time.",
      category: "basic",
      baseCap: 100,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: true
    },
    {
      id: "console_cables",
      name: "Console Cables",
      description: "The blue ones. You have a drawer full. None of them are the right one.",
      category: "basic",
      baseCap: 50,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "documentation_pages",
      name: "Documentation Pages",
      description: 'Technically they exist. Technically. Last updated: "a while ago."',
      category: "basic",
      baseCap: 300,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "copper_cables",
      name: "Copper Cables",
      description: "Cat5e, Cat6, Cat6a \u2014 the veins of the network. Some are even labeled.",
      category: "basic",
      baseCap: 500,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "ip_addresses",
      name: "IP Addresses",
      description: `Theoretically unlimited. Practically, someone put the DHCP scope at /28 and now we're "out of IPs."`,
      category: "basic",
      baseCap: 256,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "vlans" },
      transient: false
    },
    {
      id: "python_scripts",
      name: "Python Scripts",
      description: "import netmiko; # TODO: add error handling \u2014 Narrator: error handling was never added.",
      category: "intermediate",
      baseCap: 200,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "python_basics" },
      transient: false
    },
    {
      id: "yaml_files",
      name: "YAML Files",
      description: "Indentation: the final boss. One wrong space and your entire inventory is null.",
      category: "intermediate",
      baseCap: 300,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "yaml" },
      transient: false
    },
    {
      id: "jinja_templates",
      name: "Jinja Templates",
      description: "{{ interface.name }} \u2014 simple until someone needs a nested for loop with conditionals.",
      category: "intermediate",
      baseCap: 150,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "configuration_templating" },
      transient: false
    },
    {
      id: "git_commits",
      name: "Git Commits",
      description: '"fixed it", "fixed it for real", "ok actually fixed now", "please work"',
      category: "intermediate",
      baseCap: 500,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "version_control" },
      transient: false
    },
    {
      id: "api_tokens",
      name: "API Tokens",
      description: "64 characters of power. Stored in a sticky note under a keyboard somewhere.",
      category: "intermediate",
      baseCap: 50,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "rest_apis" },
      transient: false
    },
    {
      id: "json_blobs",
      name: "JSON Blobs",
      description: "The universal interchange format. Readable by machines. Technically readable by humans.",
      category: "intermediate",
      baseCap: 800,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "rest_apis" },
      transient: false
    },
    {
      id: "ssh_keys",
      name: "SSH Keys",
      description: "Finally, no more passwords. Now you just need to manage 200 public keys across 500 devices.",
      category: "intermediate",
      baseCap: 100,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "key_based_auth" },
      transient: false
    },
    {
      id: "pull_requests",
      name: "Pull Requests",
      description: '"LGTM" \u2014 the reviewer who definitely did not read your code',
      category: "intermediate",
      baseCap: 100,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "continuous_integration" },
      transient: false
    },
    {
      id: "container_images",
      name: "Container Images",
      description: "It works on your machine. Now it works on everyone's machine. Mostly.",
      category: "intermediate",
      baseCap: 75,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "containers" },
      transient: false
    },
    {
      id: "subnet_allocations",
      name: "Subnet Allocations",
      description: "/24 for the office. /30 for the point-to-point. /32 for that one loopback nobody documented.",
      category: "intermediate",
      baseCap: 200,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "subnetting" },
      transient: false
    },
    {
      id: "ansible_playbooks",
      name: "Ansible Playbooks",
      description: "400 lines of YAML that replace 20 minutes of CLI work. Took 3 days to write. Net positive after device #7.",
      category: "advanced",
      baseCap: 100,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "configuration_management" },
      transient: false
    },
    {
      id: "nornir_inventories",
      name: "Nornir Inventories",
      description: "Like Ansible inventories but you get to feel superior about using pure Python.",
      category: "advanced",
      baseCap: 75,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "nornir" },
      transient: false
    },
    {
      id: "graphql_queries",
      name: "GraphQL Queries",
      description: "{ devices { name interfaces { ip_addresses } } } \u2014 elegant, powerful, and absolutely impenetrable to the NOC team.",
      category: "advanced",
      baseCap: 150,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "graphql" },
      transient: false
    },
    {
      id: "automation_jobs",
      name: "Automation Jobs",
      description: "Scheduled, triggered, or run at 3 AM because someone forgot to set the cron right.",
      category: "advanced",
      baseCap: 200,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "nautobot_jobs" },
      transient: false
    },
    {
      id: "nautobot_apps",
      name: "Nautobot Apps",
      description: "Plugins that extend Nautobot. You'll write one. Then five. Then you'll lose track.",
      category: "advanced",
      baseCap: 30,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "nautobot_app_development" },
      transient: false
    },
    {
      id: "webhook_events",
      name: "Webhook Events",
      description: 'Fire-and-forget notifications. Emphasis on "forget" when the receiving end is down.',
      category: "advanced",
      baseCap: 500,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "event_driven_automation" },
      transient: false
    },
    {
      id: "test_results",
      name: "Test Results",
      description: "Green is good. Red is character-building.",
      category: "advanced",
      baseCap: 300,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "network_testing" },
      transient: false
    },
    {
      id: "config_diffs",
      name: "Config Diffs",
      description: 'The terrifying delta between "what we think the config is" and "what the config actually is."',
      category: "advanced",
      baseCap: 200,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "config_compliance" },
      transient: false
    },
    {
      id: "circuit_ids",
      name: "Circuit IDs",
      description: "The 47-character alphanumeric string that the carrier swears is correct but doesn't match anything in the portal.",
      category: "advanced",
      baseCap: 150,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "era", era: "full_netdevops" },
      transient: false
    },
    {
      id: "design_documents",
      name: "Design Documents",
      description: "Aspirational network diagrams. Beautiful in Visio. Partially implemented in reality.",
      category: "advanced",
      baseCap: 50,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "era", era: "full_netdevops" },
      transient: false
    },
    {
      id: "compliance_reports",
      name: "Compliance Reports",
      description: "The auditors are satisfied. For now. They'll be back in 90 days with new requirements.",
      category: "rare",
      baseCap: 50,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "config_compliance" },
      transient: false
    },
    {
      id: "zero_touch_provisions",
      name: "Zero-Touch Provisions",
      description: "A device arrives, plugs in, configures itself, and joins the network. You almost cried the first time it worked.",
      category: "rare",
      baseCap: 25,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "era", era: "multi_site_empire" },
      transient: false
    },
    {
      id: "golden_configs",
      name: "Golden Configs",
      description: "The platonic ideal of a device configuration. Jinja-rendered, Git-versioned, compliance-checked. Chef's kiss.",
      category: "rare",
      baseCap: 40,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "config_compliance" },
      transient: false
    },
    {
      id: "fully_documented_networks",
      name: "Fully Documented Networks",
      description: "The mythical, fully documented network. Some say it exists. Nobody has seen one in the wild. Each one represents one documented site.",
      category: "rare",
      baseCap: 10,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "era", era: "multi_site_empire" },
      transient: false
    },
    {
      id: "intent_declarations",
      name: "Intent Declarations",
      description: "What the network should be. The gap between this and reality is where sadness lives.",
      category: "rare",
      baseCap: 100,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "era", era: "multi_site_empire" },
      transient: false
    },
    {
      id: "terraform_plans",
      name: "Terraform Plans",
      description: "Plan: 47 to add, 0 to change, 0 to destroy. You run apply and hold your breath.",
      category: "rare",
      baseCap: 75,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "tech", techId: "infrastructure_as_code" },
      transient: false
    },
    {
      id: "service_mesh_configs",
      name: "Service Mesh Configs",
      description: "It's just YAML all the way down. Always has been.",
      category: "rare",
      baseCap: 100,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "era", era: "multi_site_empire" },
      transient: false
    },
    {
      id: "digital_twin_snapshots",
      name: "Digital Twin Snapshots",
      description: "A simulation of your network that's only three weeks out of date. So close.",
      category: "rare",
      baseCap: 30,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "era", era: "multi_site_empire" },
      transient: false
    },
    {
      id: "sanity",
      name: "Sanity",
      description: "Your mental health. Finite. Precious. Gone after the third P1 this week.",
      category: "meta",
      baseCap: 100,
      startAmount: 100,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "uptime_points",
      name: "Uptime Points",
      description: "Continuous uptime accrual. Resets to zero on outages. High uptime = bonuses. Feels like Jenga.",
      category: "meta",
      baseCap: 999,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "change_window_tokens",
      name: "Change Window Tokens",
      description: "You may only make changes during approved windows. Usually Tuesday 2-6 AM. How generous.",
      category: "meta",
      baseCap: 5,
      startAmount: 2,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "budget",
      name: "Budget",
      description: "Money. Refreshes quarterly. Never enough. Always cut mid-year.",
      category: "meta",
      baseCap: 1e3,
      startAmount: 100,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "technical_debt",
      name: "Technical Debt",
      description: "It accumulates. Silently. Relentlessly. Like snow, except it's load-bearing.",
      category: "meta",
      baseCap: 500,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "goodwill",
      name: "Goodwill",
      description: "Political capital with management. Earned by uptime. Spent on projects.",
      category: "meta",
      baseCap: 100,
      startAmount: 0,
      visible: true,
      unlockCondition: null,
      transient: false
    },
    {
      id: "meeting_minutes",
      name: "Meeting Minutes",
      description: "An unavoidable byproduct of organizational life. Take up storage, produce nothing.",
      category: "meta",
      baseCap: 200,
      startAmount: 0,
      visible: false,
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      transient: false
    }
  ];

  // data/buildings.json
  var buildings_default = [
    {
      id: "terminal_emulator",
      name: "Terminal Emulator",
      description: "SecureCRT? PuTTY? iTerm2? The religious wars have begun and the game just started.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", baseAmount: 10, priceRatio: 1.12 }
      ],
      effects: [
        { type: "production", resourceId: "cli_commands", amount: 0.5 },
        { type: "production", resourceId: "ping_responses", amount: 0.1 },
        { type: "cap_increase", resourceId: "cli_commands", amount: 75 }
      ],
      maxCount: null,
      unlockCondition: null,
      flavorOnBuild: "Another terminal window opens. The NOC grows stronger.",
      upgrades: []
    },
    {
      id: "console_cable_drawer",
      name: "Console Cable Drawer",
      description: "A tangled mass of light blue spaghetti. You'll need the right one. You won't find it.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", baseAmount: 25, priceRatio: 1.12 },
        { resourceId: "copper_cables", baseAmount: 5, priceRatio: 1.12 }
      ],
      effects: [
        { type: "production", resourceId: "console_cables", amount: 0.3 },
        { type: "cap_increase", resourceId: "console_cables", amount: 10 }
      ],
      maxCount: null,
      unlockCondition: null,
      flavorOnBuild: "You'll find the right cable. Eventually.",
      upgrades: []
    },
    {
      id: "coffee_machine",
      name: "Coffee Machine",
      description: "Drip coffee. It's not good. It doesn't need to be good. It needs to be available.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", baseAmount: 15, priceRatio: 1.12 }
      ],
      effects: [
        { type: "production", resourceId: "coffee", amount: 0.5 },
        { type: "cap_increase", resourceId: "coffee", amount: 15 }
      ],
      maxCount: null,
      unlockCondition: null,
      flavorOnBuild: "The coffee flows. The engineers live.",
      upgrades: []
    },
    {
      id: "patch_panel",
      name: "Patch Panel",
      description: "Rows of RJ45 ports. Some labeled. Some labeled correctly.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", baseAmount: 50, priceRatio: 1.12 },
        { resourceId: "copper_cables", baseAmount: 10, priceRatio: 1.12 }
      ],
      effects: [
        { type: "production", resourceId: "copper_cables", amount: 0.2 },
        { type: "production", resourceId: "console_cables", amount: 0.1 },
        { type: "cap_increase", resourceId: "copper_cables", amount: 75 }
      ],
      maxCount: null,
      unlockCondition: null,
      flavorOnBuild: "Another row of ports. Some might even be labeled.",
      upgrades: []
    },
    {
      id: "syslog_server",
      name: "Syslog Server",
      description: "An old Linux box under a desk receiving logs that nobody reads. Until something breaks. Then everyone reads them.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", baseAmount: 100, priceRatio: 1.12 },
        { resourceId: "log_entries", baseAmount: 20, priceRatio: 1.12 }
      ],
      effects: [
        { type: "production", resourceId: "log_entries", amount: 1.5 },
        { type: "cap_increase", resourceId: "log_entries", amount: 150 }
      ],
      maxCount: null,
      unlockCondition: { type: "resource", resourceId: "log_entries", amount: 50 },
      flavorOnBuild: "Logs flow in. Nobody reads them. Yet.",
      upgrades: []
    },
    {
      id: "the_spreadsheet_of_truth",
      name: "The Spreadsheet of Truth",
      description: "An Excel file on a shared drive. Fourteen tabs. Three contradictory 'master' sheets. Last saved by someone named 'Temp_User.' This is your source of truth. For now.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", baseAmount: 75, priceRatio: 1.12 },
        { resourceId: "documentation_pages", baseAmount: 30, priceRatio: 1.12 }
      ],
      effects: [
        { type: "production", resourceId: "documentation_pages", amount: 0.3 },
        { type: "production", resourceId: "ip_addresses", amount: 0.1 },
        { type: "production", resourceId: "subnet_allocations", amount: 0.1 },
        { type: "production", resourceId: "technical_debt", amount: 0.15 },
        { type: "cap_increase", resourceId: "documentation_pages", amount: 50 },
        { type: "cap_increase", resourceId: "ip_addresses", amount: 40 }
      ],
      maxCount: null,
      unlockCondition: { type: "resource", resourceId: "documentation_pages", amount: 20 },
      flavorOnBuild: "The spreadsheet lives. Kevin's legacy endures.",
      upgrades: []
    },
    {
      id: "whiteboard",
      name: "Whiteboard",
      description: "For drawing network diagrams that will be erased next week when someone needs the board for a meeting about meetings.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", baseAmount: 30, priceRatio: 1.12 }
      ],
      effects: [
        { type: "production", resourceId: "documentation_pages", amount: 0.2 },
        { type: "production", resourceId: "design_documents", amount: 0.05 }
      ],
      maxCount: null,
      unlockCondition: null,
      flavorOnBuild: "A blank canvas for network diagrams that will never be updated.",
      upgrades: []
    },
    {
      id: "tftp_server",
      name: "TFTP Server",
      description: "Living proof that some protocols never die. They just keep serving IOS images in the background, judging newer protocols silently.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", baseAmount: 80, priceRatio: 1.12 },
        { resourceId: "log_entries", baseAmount: 15, priceRatio: 1.12 }
      ],
      effects: [
        { type: "production", resourceId: "cli_commands", amount: 0.2 },
        { type: "production", resourceId: "technical_debt", amount: 0.05 },
        { type: "cap_increase", resourceId: "cli_commands", amount: 50 }
      ],
      maxCount: null,
      unlockCondition: { type: "resource", resourceId: "cli_commands", amount: 100 },
      flavorOnBuild: "TFTP: because FTP was too feature-rich.",
      upgrades: []
    },
    {
      id: "ide",
      name: "IDE",
      description: "VS Code, obviously. With 47 extensions. The Python one, the YAML one, the one that makes your bracket colors pretty, and 44 you installed once and forgot about.",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", baseAmount: 200, priceRatio: 1.13 },
        { resourceId: "python_scripts", baseAmount: 20, priceRatio: 1.13 }
      ],
      effects: [
        { type: "production", resourceId: "python_scripts", amount: 0.5 },
        { type: "cap_increase", resourceId: "python_scripts", amount: 30 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "python_basics" },
      flavorOnBuild: "VS Code launches. 47 extensions begin updating.",
      upgrades: []
    },
    {
      id: "git_repository",
      name: "Git Repository",
      description: "git init. Two words that separate the before times from the after times. Your commit messages will not get better.",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", baseAmount: 150, priceRatio: 1.13 },
        { resourceId: "python_scripts", baseAmount: 30, priceRatio: 1.13 }
      ],
      effects: [
        { type: "production", resourceId: "git_commits", amount: 0.8 },
        { type: "production", resourceId: "pull_requests", amount: 0.1 },
        { type: "cap_increase", resourceId: "git_commits", amount: 75 },
        { type: "cap_increase", resourceId: "pull_requests", amount: 15 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "version_control" },
      flavorOnBuild: "git init. The commit history begins. 'initial commit'.",
      upgrades: []
    },
    {
      id: "token_generator",
      name: "Token Generator",
      description: "Produces API tokens. Rotates them on a schedule. The schedule is 'when the last one gets leaked to GitHub.'",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", baseAmount: 100, priceRatio: 1.13 },
        { resourceId: "api_tokens", baseAmount: 10, priceRatio: 1.13 }
      ],
      effects: [
        { type: "production", resourceId: "api_tokens", amount: 0.2 },
        { type: "cap_increase", resourceId: "api_tokens", amount: 15 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "rest_apis" },
      flavorOnBuild: "Tokens generated. Please don't commit them to GitHub.",
      upgrades: []
    },
    {
      id: "template_workshop",
      name: "Template Workshop",
      description: "Where Jinja templates are lovingly crafted, painstakingly tested, and then immediately broken by a device running an OS version from 2014.",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", baseAmount: 200, priceRatio: 1.13 },
        { resourceId: "yaml_files", baseAmount: 15, priceRatio: 1.13 }
      ],
      effects: [
        { type: "production", resourceId: "jinja_templates", amount: 0.3 },
        { type: "production", resourceId: "yaml_files", amount: 0.2 },
        { type: "production", resourceId: "technical_debt", amount: 0.08 },
        { type: "cap_increase", resourceId: "jinja_templates", amount: 25 },
        { type: "cap_increase", resourceId: "yaml_files", amount: 40 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "configuration_templating" },
      flavorOnBuild: "{{ building.status }}: operational",
      upgrades: []
    },
    {
      id: "jump_host",
      name: "Jump Host",
      description: "The sacred bastion. The gateway between you and 500 devices. Running Ubuntu 18.04 because 'it's not broken.'",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", baseAmount: 300, priceRatio: 1.13 },
        { resourceId: "ssh_keys", baseAmount: 20, priceRatio: 1.13 }
      ],
      effects: [
        { type: "production", resourceId: "cli_commands", amount: 0.5 },
        { type: "production", resourceId: "ssh_keys", amount: 0.3 },
        { type: "production", resourceId: "technical_debt", amount: 0.1 },
        { type: "cap_increase", resourceId: "cli_commands", amount: 150 },
        { type: "cap_increase", resourceId: "ssh_keys", amount: 15 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "ssh" },
      flavorOnBuild: "The bastion stands. Ubuntu 18.04 forever.",
      upgrades: []
    },
    {
      id: "wiki",
      name: "Wiki",
      description: "Confluence. Or MediaWiki. Or a folder of text files. The medium doesn't matter. What matters is that someone writes something. Anyone. Please.",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", baseAmount: 250, priceRatio: 1.13 },
        { resourceId: "documentation_pages", baseAmount: 40, priceRatio: 1.13 }
      ],
      effects: [
        { type: "production", resourceId: "documentation_pages", amount: 0.6 },
        { type: "cap_increase", resourceId: "documentation_pages", amount: 75 },
        { type: "cap_increase", resourceId: "fully_documented_networks", amount: 3 }
      ],
      maxCount: null,
      unlockCondition: { type: "resource", resourceId: "documentation_pages", amount: 100 },
      flavorOnBuild: "A wiki is born. It will be updated. Probably.",
      upgrades: []
    },
    {
      id: "monitoring_dashboard",
      name: "Monitoring Dashboard",
      description: "Grafana graphs. Green is good. Yellow is 'we should look at that.' Red is 'we should have looked at that yesterday.'",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", baseAmount: 400, priceRatio: 1.13 },
        { resourceId: "log_entries", baseAmount: 50, priceRatio: 1.13 },
        { resourceId: "ping_responses", baseAmount: 30, priceRatio: 1.13 }
      ],
      effects: [
        { type: "production", resourceId: "ping_responses", amount: 1 },
        { type: "production", resourceId: "uptime_points", amount: 0.3 },
        { type: "cap_increase", resourceId: "ping_responses", amount: 50 },
        { type: "cap_increase", resourceId: "log_entries", amount: 100 },
        { type: "cap_increase", resourceId: "uptime_points", amount: 25 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "snmp_monitoring" },
      flavorOnBuild: "Dashboard deployed. Everything is green. Suspiciously green.",
      upgrades: []
    },
    {
      id: "nautobot_instance",
      name: "Nautobot Instance",
      description: "The Source of Truth. For real this time. Not a spreadsheet. An actual, queryable, API-driven, Git-backed source of truth. Your spreadsheet weeps softly.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", baseAmount: 1e3, priceRatio: 1.14 },
        { resourceId: "python_scripts", baseAmount: 200, priceRatio: 1.14 },
        { resourceId: "yaml_files", baseAmount: 100, priceRatio: 1.14 },
        { resourceId: "git_commits", baseAmount: 50, priceRatio: 1.14 }
      ],
      effects: [
        { type: "production", resourceId: "graphql_queries", amount: 1 },
        { type: "production", resourceId: "api_tokens", amount: 0.5 },
        { type: "production", resourceId: "automation_jobs", amount: 0.3 },
        { type: "production", resourceId: "json_blobs", amount: 0.5 },
        { type: "production", resourceId: "webhook_events", amount: 0.3 },
        { type: "cap_increase", resourceId: "cli_commands", amount: 500 },
        { type: "cap_increase", resourceId: "graphql_queries", amount: 30 },
        { type: "cap_increase", resourceId: "api_tokens", amount: 10 },
        { type: "cap_increase", resourceId: "json_blobs", amount: 20 },
        { type: "cap_increase", resourceId: "nautobot_apps", amount: 15 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "source_of_truth" },
      flavorOnBuild: "Nautobot is alive. The spreadsheet is dead. Long live the source of truth.",
      upgrades: []
    },
    {
      id: "ansible_control_node",
      name: "Ansible Control Node",
      description: "ansible-playbook site.yml -i inventory.yml --limit 'please-dont-break-prod'",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", baseAmount: 500, priceRatio: 1.14 },
        { resourceId: "yaml_files", baseAmount: 100, priceRatio: 1.14 },
        { resourceId: "ssh_keys", baseAmount: 50, priceRatio: 1.14 }
      ],
      effects: [
        { type: "production", resourceId: "ansible_playbooks", amount: 0.5 },
        { type: "production", resourceId: "automation_jobs", amount: 0.3 },
        { type: "production", resourceId: "config_diffs", amount: 0.2 },
        { type: "cap_increase", resourceId: "yaml_files", amount: 60 },
        { type: "cap_increase", resourceId: "ssh_keys", amount: 20 },
        { type: "cap_increase", resourceId: "ansible_playbooks", amount: 15 },
        { type: "cap_increase", resourceId: "golden_configs", amount: 30 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "configuration_management" },
      flavorOnBuild: "Ansible is ready. The playbooks await. YAML indentation intensifies.",
      upgrades: []
    },
    {
      id: "ci_cd_pipeline",
      name: "CI/CD Pipeline",
      description: "Jenkins. No wait, GitLab CI. Actually, GitHub Actions. You know what, let's just use cron and a bash script.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", baseAmount: 800, priceRatio: 1.14 },
        { resourceId: "git_commits", baseAmount: 100, priceRatio: 1.14 },
        { resourceId: "python_scripts", baseAmount: 50, priceRatio: 1.14 }
      ],
      effects: [
        { type: "production", resourceId: "container_images", amount: 0.3 },
        { type: "production", resourceId: "test_results", amount: 0.5 },
        { type: "production", resourceId: "pull_requests", amount: 0.2 },
        { type: "cap_increase", resourceId: "git_commits", amount: 75 },
        { type: "cap_increase", resourceId: "container_images", amount: 15 },
        { type: "cap_increase", resourceId: "terraform_plans", amount: 20 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "continuous_integration" },
      flavorOnBuild: "Pipeline deployed. Build #1 is already failing.",
      upgrades: []
    },
    {
      id: "ipam_system",
      name: "IPAM System",
      description: "No more 'who has 10.0.1.47?' emails. The IPAM knows. The IPAM remembers. The IPAM judges.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", baseAmount: 600, priceRatio: 1.14 },
        { resourceId: "ip_addresses", baseAmount: 50, priceRatio: 1.14 },
        { resourceId: "subnet_allocations", baseAmount: 30, priceRatio: 1.14 }
      ],
      effects: [
        { type: "production", resourceId: "ip_addresses", amount: 0.8 },
        { type: "production", resourceId: "subnet_allocations", amount: 0.5 },
        { type: "production", resourceId: "circuit_ids", amount: 0.3 },
        { type: "cap_increase", resourceId: "ip_addresses", amount: 50 },
        { type: "cap_increase", resourceId: "subnet_allocations", amount: 30 },
        { type: "cap_increase", resourceId: "circuit_ids", amount: 20 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "ip_address_management" },
      flavorOnBuild: "IPAM deployed. The IP address chaos begins to yield to order.",
      upgrades: []
    },
    {
      id: "container_registry",
      name: "Container Registry",
      description: "Where container images go to live, version, and occasionally haunt you when someone pulls latest in production.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", baseAmount: 500, priceRatio: 1.14 },
        { resourceId: "container_images", baseAmount: 30, priceRatio: 1.14 }
      ],
      effects: [
        { type: "production", resourceId: "container_images", amount: 0.3 },
        { type: "cap_increase", resourceId: "container_images", amount: 20 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "containers" },
      flavorOnBuild: "Registry online. Please don't use :latest in production.",
      upgrades: []
    },
    {
      id: "secrets_vault",
      name: "Secrets Vault",
      description: "HashiCorp Vault. Or AWS Secrets Manager. Or that encrypted text file that Dave swears is 'just as secure.'",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", baseAmount: 700, priceRatio: 1.14 },
        { resourceId: "api_tokens", baseAmount: 30, priceRatio: 1.14 },
        { resourceId: "ssh_keys", baseAmount: 20, priceRatio: 1.14 }
      ],
      effects: [
        { type: "production", resourceId: "api_tokens", amount: 0.3 },
        { type: "production", resourceId: "ssh_keys", amount: 0.3 },
        { type: "production", resourceId: "technical_debt", amount: -0.1 },
        { type: "cap_increase", resourceId: "api_tokens", amount: 15 },
        { type: "cap_increase", resourceId: "ssh_keys", amount: 15 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "secrets_management" },
      flavorOnBuild: "Secrets secured. Dave's text file has been retired.",
      upgrades: []
    },
    {
      id: "nornir_runner",
      name: "Nornir Runner",
      description: "Like Ansible but in pure Python. Your DevOps engineers love it. Your network engineers are suspicious. Both are valid.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", baseAmount: 600, priceRatio: 1.14 },
        { resourceId: "python_scripts", baseAmount: 80, priceRatio: 1.14 },
        { resourceId: "ssh_keys", baseAmount: 30, priceRatio: 1.14 }
      ],
      effects: [
        { type: "production", resourceId: "nornir_inventories", amount: 0.4 },
        { type: "production", resourceId: "automation_jobs", amount: 0.5 },
        { type: "cap_increase", resourceId: "python_scripts", amount: 30 },
        { type: "cap_increase", resourceId: "nornir_inventories", amount: 10 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "nornir" },
      flavorOnBuild: "Nornir runs. Pure Python automation. The Ansible team is watching nervously.",
      upgrades: []
    },
    {
      id: "config_compliance_engine",
      name: "Config Compliance Engine",
      description: "Compares intended state to actual state. The results are educational. And a little upsetting.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", baseAmount: 1500, priceRatio: 1.15 },
        { resourceId: "golden_configs", baseAmount: 100, priceRatio: 1.15 },
        { resourceId: "graphql_queries", baseAmount: 50, priceRatio: 1.15 }
      ],
      effects: [
        { type: "production", resourceId: "config_diffs", amount: 0.5 },
        { type: "production", resourceId: "compliance_reports", amount: 0.3 },
        { type: "production", resourceId: "golden_configs", amount: 0.2 },
        { type: "cap_increase", resourceId: "golden_configs", amount: 10 },
        { type: "cap_increase", resourceId: "config_diffs", amount: 30 },
        { type: "cap_increase", resourceId: "compliance_reports", amount: 10 },
        { type: "cap_increase", resourceId: "design_documents", amount: 25 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "config_compliance" },
      flavorOnBuild: "Compliance engine online. The config drift cannot hide.",
      upgrades: []
    },
    {
      id: "chatops_bot",
      name: "ChatOps Bot",
      description: "/deploy site-a in Slack. Your manager thinks this is reckless. Your team thinks this is the future. You think it's both.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", baseAmount: 1e3, priceRatio: 1.15 },
        { resourceId: "webhook_events", baseAmount: 50, priceRatio: 1.15 },
        { resourceId: "api_tokens", baseAmount: 30, priceRatio: 1.15 }
      ],
      effects: [
        { type: "production", resourceId: "automation_jobs", amount: 0.5 },
        { type: "production", resourceId: "goodwill", amount: 0.2 },
        { type: "cap_increase", resourceId: "automation_jobs", amount: 50 },
        { type: "cap_increase", resourceId: "webhook_events", amount: 15 },
        { type: "cap_increase", resourceId: "goodwill", amount: 15 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "chatops" },
      flavorOnBuild: "ChatOps bot deployed. /deploy is now the most powerful slash command.",
      upgrades: []
    },
    {
      id: "test_lab",
      name: "Test Lab",
      description: "A miniature version of your production network. It's supposed to mirror prod. It mirrors prod from six months ago. Close enough.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", baseAmount: 2e3, priceRatio: 1.15 },
        { resourceId: "copper_cables", baseAmount: 200, priceRatio: 1.15 },
        { resourceId: "yaml_files", baseAmount: 100, priceRatio: 1.15 }
      ],
      effects: [
        { type: "production", resourceId: "test_results", amount: 0.5 },
        { type: "production", resourceId: "technical_debt", amount: -0.2 },
        { type: "cap_increase", resourceId: "cli_commands", amount: 750 },
        { type: "cap_increase", resourceId: "test_results", amount: 50 },
        { type: "cap_increase", resourceId: "technical_debt", amount: 100 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "network_testing" },
      flavorOnBuild: "Lab built. It almost looks like production. Almost.",
      upgrades: []
    },
    {
      id: "change_advisory_board_room",
      name: "Change Advisory Board Room",
      description: "A conference room where changes go to be questioned, delayed, and occasionally approved. The donuts are the best part.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", baseAmount: 800, priceRatio: 1.15 },
        { resourceId: "meeting_minutes", baseAmount: 30, priceRatio: 1.15 },
        { resourceId: "documentation_pages", baseAmount: 20, priceRatio: 1.15 }
      ],
      effects: [
        { type: "production", resourceId: "change_window_tokens", amount: 0.3 },
        { type: "production", resourceId: "meeting_minutes", amount: 0.2 },
        { type: "cap_increase", resourceId: "change_window_tokens", amount: 2 },
        { type: "cap_increase", resourceId: "meeting_minutes", amount: 30 },
        { type: "cap_increase", resourceId: "design_documents", amount: 15 }
      ],
      maxCount: null,
      unlockCondition: { type: "resource", resourceId: "change_window_tokens", amount: 4 },
      flavorOnBuild: "The CAB room is ready. Bring donuts.",
      upgrades: []
    },
    {
      id: "webhook_relay",
      name: "Webhook Relay",
      description: "Events in, actions out. The plumbing behind event-driven automation. When it works, it's magic. When it doesn't, it's 3 AM.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", baseAmount: 1200, priceRatio: 1.15 },
        { resourceId: "api_tokens", baseAmount: 40, priceRatio: 1.15 },
        { resourceId: "automation_jobs", baseAmount: 30, priceRatio: 1.15 }
      ],
      effects: [
        { type: "production", resourceId: "webhook_events", amount: 0.8 },
        { type: "production", resourceId: "automation_jobs", amount: 0.3 },
        { type: "cap_increase", resourceId: "webhook_events", amount: 75 },
        { type: "cap_increase", resourceId: "automation_jobs", amount: 30 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "event_driven_automation" },
      flavorOnBuild: "Webhooks flowing. Events triggering actions. What could go wrong?",
      upgrades: []
    },
    {
      id: "regional_nautobot_cluster",
      name: "Regional Nautobot Cluster",
      description: "Nautobot, but with HA. Active/standby. Read replicas. The kind of resilience that makes you sleep slightly better. Slightly.",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", baseAmount: 5e3, priceRatio: 1.16 },
        { resourceId: "graphql_queries", baseAmount: 500, priceRatio: 1.16 },
        { resourceId: "container_images", baseAmount: 200, priceRatio: 1.16 }
      ],
      effects: [
        { type: "production", resourceId: "graphql_queries", amount: 3 },
        { type: "production", resourceId: "automation_jobs", amount: 1 },
        { type: "production", resourceId: "uptime_points", amount: 0.5 },
        { type: "cap_increase", resourceId: "cli_commands", amount: 2e3 },
        { type: "cap_increase", resourceId: "graphql_queries", amount: 75 },
        { type: "cap_increase", resourceId: "automation_jobs", amount: 50 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "high_availability" },
      flavorOnBuild: "Nautobot cluster online. Redundancy achieved. Sleep slightly improved.",
      upgrades: []
    },
    {
      id: "ztp_server",
      name: "ZTP Server",
      description: "Zero-Touch Provisioning. A new switch arrives, gets racked, gets cabled, gets an IP via DHCP, pulls its config, and joins the network. No human touched it. You feel both proud and obsolete.",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", baseAmount: 3e3, priceRatio: 1.16 },
        { resourceId: "golden_configs", baseAmount: 100, priceRatio: 1.16 },
        { resourceId: "ansible_playbooks", baseAmount: 50, priceRatio: 1.16 }
      ],
      effects: [
        { type: "production", resourceId: "zero_touch_provisions", amount: 0.5 },
        { type: "cap_increase", resourceId: "golden_configs", amount: 10 },
        { type: "cap_increase", resourceId: "zero_touch_provisions", amount: 5 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "zero_touch_provisioning" },
      flavorOnBuild: "ZTP server online. The switches configure themselves now.",
      upgrades: []
    },
    {
      id: "automated_compliance_engine",
      name: "Automated Compliance Engine",
      description: "Scans every device, every hour, against the golden config. Deviations get flagged, tickets get opened, and someone gets a Slack ping at an inconvenient time.",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", baseAmount: 4e3, priceRatio: 1.16 },
        { resourceId: "config_diffs", baseAmount: 200, priceRatio: 1.16 },
        { resourceId: "compliance_reports", baseAmount: 100, priceRatio: 1.16 }
      ],
      effects: [
        { type: "production", resourceId: "compliance_reports", amount: 1 },
        { type: "production", resourceId: "golden_configs", amount: 0.5 },
        { type: "production", resourceId: "fully_documented_networks", amount: 0.05 },
        { type: "cap_increase", resourceId: "compliance_reports", amount: 10 },
        { type: "cap_increase", resourceId: "golden_configs", amount: 10 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "continuous_compliance" },
      flavorOnBuild: "Continuous compliance engaged. Deviations will be found. And judged.",
      upgrades: []
    },
    {
      id: "network_digital_twin",
      name: "Network Digital Twin",
      description: "A simulation of your entire network. You can test changes here first. The simulation is only slightly wrong, which is an improvement over guessing.",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", baseAmount: 6e3, priceRatio: 1.16 },
        { resourceId: "design_documents", baseAmount: 150, priceRatio: 1.16 },
        { resourceId: "test_results", baseAmount: 200, priceRatio: 1.16 }
      ],
      effects: [
        { type: "production", resourceId: "digital_twin_snapshots", amount: 0.3 },
        { type: "production", resourceId: "test_results", amount: 1 },
        { type: "cap_increase", resourceId: "design_documents", amount: 15 },
        { type: "cap_increase", resourceId: "test_results", amount: 50 },
        { type: "cap_increase", resourceId: "digital_twin_snapshots", amount: 10 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "digital_twin" },
      flavorOnBuild: "Digital twin online. Your network has a digital doppelg\xE4nger.",
      upgrades: []
    },
    {
      id: "multi_site_orchestrator",
      name: "Multi-Site Orchestrator",
      description: "One pane of glass to rule them all. And in the darkness, automate them.",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", baseAmount: 8e3, priceRatio: 1.16 },
        { resourceId: "automation_jobs", baseAmount: 500, priceRatio: 1.16 },
        { resourceId: "graphql_queries", baseAmount: 200, priceRatio: 1.16 }
      ],
      effects: [
        { type: "production", resourceId: "automation_jobs", amount: 2 },
        { type: "production", resourceId: "webhook_events", amount: 1 },
        { type: "production", resourceId: "intent_declarations", amount: 0.3 },
        { type: "production", resourceId: "circuit_ids", amount: 0.5 },
        { type: "cap_increase", resourceId: "automation_jobs", amount: 75 },
        { type: "cap_increase", resourceId: "webhook_events", amount: 75 },
        { type: "cap_increase", resourceId: "intent_declarations", amount: 20 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "multi_site_automation" },
      flavorOnBuild: "Multi-site orchestration achieved. One pane to rule them all.",
      upgrades: []
    },
    {
      id: "cloud_gateway",
      name: "Cloud Gateway",
      description: "The bridge between your lovingly crafted on-prem network and the cloud provider's 'we'll handle networking, trust us' approach.",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", baseAmount: 1e4, priceRatio: 1.18 },
        { resourceId: "api_tokens", baseAmount: 500, priceRatio: 1.18 },
        { resourceId: "terraform_plans", baseAmount: 200, priceRatio: 1.18 }
      ],
      effects: [
        { type: "production", resourceId: "terraform_plans", amount: 1 },
        { type: "production", resourceId: "service_mesh_configs", amount: 0.5 },
        { type: "cap_increase", resourceId: "terraform_plans", amount: 25 },
        { type: "cap_increase", resourceId: "api_tokens", amount: 25 },
        { type: "cap_increase", resourceId: "service_mesh_configs", amount: 15 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "hybrid_cloud" },
      flavorOnBuild: "Cloud gateway established. On-prem meets cloud. It's complicated.",
      upgrades: []
    },
    {
      id: "self_healing_network_fabric",
      name: "Self-Healing Network Fabric",
      description: "Detects faults. Reroutes traffic. Opens a ticket. Resolves the ticket. Closes the ticket. You found out about the outage from the 'Resolved' notification.",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", baseAmount: 15e3, priceRatio: 1.18 },
        { resourceId: "automation_jobs", baseAmount: 500, priceRatio: 1.18 },
        { resourceId: "intent_declarations", baseAmount: 300, priceRatio: 1.18 }
      ],
      effects: [
        { type: "production", resourceId: "uptime_points", amount: 2 },
        { type: "production", resourceId: "automation_jobs", amount: 1 },
        { type: "production", resourceId: "technical_debt", amount: -1 },
        { type: "cap_increase", resourceId: "cli_commands", amount: 5e3 },
        { type: "cap_increase", resourceId: "automation_jobs", amount: 100 },
        { type: "cap_increase", resourceId: "uptime_points", amount: 100 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "intent_based_networking" },
      flavorOnBuild: "The network heals itself. You're not sure if you should be proud or scared.",
      upgrades: []
    },
    {
      id: "nautobot_ecosystem_hub",
      name: "Nautobot Ecosystem Hub",
      description: "A marketplace of Nautobot Apps, community-maintained. Your little platform has become a platform for platforms.",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", baseAmount: 12e3, priceRatio: 1.18 },
        { resourceId: "nautobot_apps", baseAmount: 200, priceRatio: 1.18 },
        { resourceId: "graphql_queries", baseAmount: 500, priceRatio: 1.18 }
      ],
      effects: [
        { type: "production", resourceId: "nautobot_apps", amount: 1 },
        { type: "production", resourceId: "graphql_queries", amount: 2 },
        { type: "cap_increase", resourceId: "nautobot_apps", amount: 10 },
        { type: "cap_increase", resourceId: "graphql_queries", amount: 50 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "app_ecosystem" },
      flavorOnBuild: "The ecosystem thrives. Nautobot has become a platform for platforms.",
      upgrades: []
    },
    {
      id: "the_war_room",
      name: "The War Room",
      description: "Not a room. A state of mind. A Slack channel. A Zoom call that never ends. Major incident command, fully automated.",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", baseAmount: 2e4, priceRatio: 1.18 },
        { resourceId: "automation_jobs", baseAmount: 1e3, priceRatio: 1.18 },
        { resourceId: "webhook_events", baseAmount: 500, priceRatio: 1.18 }
      ],
      effects: [
        { type: "production", resourceId: "uptime_points", amount: 3 },
        { type: "production", resourceId: "goodwill", amount: 2 },
        { type: "production", resourceId: "sanity", amount: 1 },
        { type: "cap_increase", resourceId: "cli_commands", amount: 1e4 },
        { type: "cap_increase", resourceId: "sanity", amount: 50 },
        { type: "cap_increase", resourceId: "goodwill", amount: 50 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "aiops" },
      flavorOnBuild: "The War Room is operational. Incidents manage themselves. Mostly.",
      upgrades: []
    },
    {
      id: "cubicle_farm",
      name: "Cubicle Farm",
      description: "Housing for engineers. Gray walls, adjustable chairs (that nobody has adjusted correctly), and a shared printer that works 60% of the time.",
      era: "support",
      costs: [
        { resourceId: "cli_commands", baseAmount: 100, priceRatio: 1.15 },
        { resourceId: "budget", baseAmount: 50, priceRatio: 1.15 }
      ],
      effects: [
        { type: "housing", amount: 2 }
      ],
      maxCount: null,
      unlockCondition: null,
      flavorOnBuild: "Two more cubicles. Two more engineers. The hum of productivity grows.",
      upgrades: []
    },
    {
      id: "home_office",
      name: "Home Office",
      description: "A spare bedroom with a desk, a ring light for video calls, and a cat that walks across the keyboard during change windows.",
      era: "support",
      costs: [
        { resourceId: "cli_commands", baseAmount: 200, priceRatio: 1.15 },
        { resourceId: "budget", baseAmount: 100, priceRatio: 1.15 }
      ],
      effects: [
        { type: "housing", amount: 1 },
        { type: "productivity_bonus", amount: 0.05 }
      ],
      maxCount: null,
      unlockCondition: { type: "tech", techId: "remote_work" },
      flavorOnBuild: "Remote work enabled. Cat-on-keyboard incidents: inevitable.",
      upgrades: []
    },
    {
      id: "coworking_space",
      name: "Coworking Space",
      description: "Open floor plan. Standing desks. Kombucha on tap. The WiFi drops every 45 minutes. The irony is not lost on the network engineers.",
      era: "support",
      costs: [
        { resourceId: "cli_commands", baseAmount: 350, priceRatio: 1.15 },
        { resourceId: "budget", baseAmount: 150, priceRatio: 1.15 }
      ],
      effects: [
        { type: "housing", amount: 3 },
        { type: "productivity_bonus", amount: -0.03 },
        { type: "cap_increase", resourceId: "budget", amount: 100 }
      ],
      maxCount: null,
      unlockCondition: { type: "era", era: "the_platform" },
      flavorOnBuild: "Open office acquired. Productivity debates begin.",
      upgrades: []
    },
    {
      id: "espresso_machine",
      name: "Espresso Machine",
      description: "Upgrades the break room coffee situation from 'technically coffee' to 'actually coffee.' Engineers work 10% faster. Meetings run 10% longer because everyone's wired.",
      era: "support",
      costs: [
        { resourceId: "cli_commands", baseAmount: 500, priceRatio: 1.15 },
        { resourceId: "budget", baseAmount: 200, priceRatio: 1.15 }
      ],
      effects: [
        { type: "production", resourceId: "coffee", amount: 1 },
        { type: "speed_bonus", amount: 0.05 },
        { type: "cap_increase", resourceId: "coffee", amount: 25 }
      ],
      maxCount: null,
      unlockCondition: { type: "resource", resourceId: "coffee", amount: 200 },
      flavorOnBuild: "Espresso flows. Productivity surges. Meeting length increases.",
      upgrades: []
    },
    {
      id: "snack_wall",
      name: "Snack Wall",
      description: "A curated selection of trail mix, protein bars, and gummy bears. The gummy bears are always gone.",
      era: "support",
      costs: [
        { resourceId: "cli_commands", baseAmount: 300, priceRatio: 1.15 },
        { resourceId: "budget", baseAmount: 100, priceRatio: 1.15 }
      ],
      effects: [
        { type: "production", resourceId: "sanity", amount: 0.3 },
        { type: "happiness_bonus", amount: 0.05 },
        { type: "cap_increase", resourceId: "sanity", amount: 25 }
      ],
      maxCount: null,
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      flavorOnBuild: "Snacks deployed. The gummy bears won't last the day.",
      upgrades: []
    },
    {
      id: "standing_desk",
      name: "Standing Desk",
      description: "Because sitting is the new smoking and your back has filed a formal complaint.",
      era: "support",
      costs: [
        { resourceId: "budget", baseAmount: 200, priceRatio: 1.15 }
      ],
      effects: [
        { type: "productivity_bonus", amount: 0.03 }
      ],
      maxCount: null,
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      flavorOnBuild: "Standing desk installed. Your back thanks you. Your legs will complain later.",
      upgrades: []
    }
  ];

  // data/workers.json
  var workers_default = [
    {
      id: "noc_technician",
      name: "NOC Technician",
      description: "Watches dashboards. Escalates tickets. Drinks more coffee than anyone thought possible. The first responders of the network.",
      era: "the_terminal",
      baseCost: 50,
      costRatio: 1.2,
      produces: [
        { resourceId: "ping_responses", amount: 2 },
        { resourceId: "log_entries", amount: 1 },
        { resourceId: "cli_commands", amount: 0.5 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "tech", techId: "snmp_monitoring" },
      special: "Can be assigned to monitoring buildings for 2x output",
      happinessFactors: ["on_call_rotation", "monitoring_quality", "coffee_supply"]
    },
    {
      id: "cable_monkey",
      name: "Cable Monkey",
      description: "Can run 200 feet of Cat6 through a ceiling in under an hour. Knows which ceiling tiles are load-bearing (the hard way).",
      era: "the_terminal",
      baseCost: 40,
      costRatio: 1.2,
      produces: [
        { resourceId: "copper_cables", amount: 2 },
        { resourceId: "console_cables", amount: 0.5 },
        { resourceId: "documentation_pages", amount: 0.3 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: null,
      special: "2x output from Patch Panels",
      happinessFactors: ["physical_workspace", "cable_quality", "ceiling_tile_integrity"]
    },
    {
      id: "network_engineer",
      name: "Network Engineer",
      description: "Speaks fluent BGP. Dreams in subnet masks. Has strong opinions about OSPF vs. IS-IS that they will share unprompted.",
      era: "scripting_and_hope",
      baseCost: 100,
      costRatio: 1.2,
      produces: [
        { resourceId: "cli_commands", amount: 1 },
        { resourceId: "python_scripts", amount: 0.5 },
        { resourceId: "yaml_files", amount: 0.3 },
        { resourceId: "documentation_pages", amount: 0.2 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      special: "Can research networking techs",
      happinessFactors: ["network_complexity", "protocol_debates", "documentation_quality"]
    },
    {
      id: "systems_administrator",
      name: "Systems Administrator",
      description: "Have you tried turning it off and on again? Yes. They have. Several times. They've also patched the kernel, rebuilt the RAID, and migrated the VM. Before lunch.",
      era: "scripting_and_hope",
      baseCost: 100,
      costRatio: 1.2,
      produces: [
        { resourceId: "container_images", amount: 0.5 },
        { resourceId: "log_entries", amount: 0.5 },
        { resourceId: "ssh_keys", amount: 0.3 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      special: "2x output from servers/infrastructure buildings",
      happinessFactors: ["server_stability", "patch_schedule", "coffee_supply"]
    },
    {
      id: "python_developer",
      name: "Python Developer",
      description: "Writes scripts that work. Writes scripts that have tests. Writes scripts that have docstrings. A rare and beautiful creature.",
      era: "scripting_and_hope",
      baseCost: 120,
      costRatio: 1.2,
      produces: [
        { resourceId: "python_scripts", amount: 1.5 },
        { resourceId: "git_commits", amount: 0.3 },
        { resourceId: "jinja_templates", amount: 0.2 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "tech", techId: "python_basics" },
      special: "2x output from IDE",
      happinessFactors: ["code_quality", "test_coverage", "ide_setup"]
    },
    {
      id: "devops_engineer",
      name: "DevOps Engineer",
      description: "It's not DevOps if it's just one person doing both jobs \u2014 a DevOps engineer, doing both jobs.",
      era: "the_platform",
      baseCost: 150,
      costRatio: 1.2,
      produces: [
        { resourceId: "git_commits", amount: 0.5 },
        { resourceId: "container_images", amount: 0.3 },
        { resourceId: "ansible_playbooks", amount: 0.3 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "era", era: "the_platform" },
      special: "2x output from CI/CD Pipeline",
      happinessFactors: ["pipeline_reliability", "deployment_frequency", "on_call_rotation"]
    },
    {
      id: "automation_engineer",
      name: "Automation Engineer",
      description: "The person who spent 6 hours automating a 5-minute task. Will break even by next quarter. Probably.",
      era: "the_platform",
      baseCost: 175,
      costRatio: 1.2,
      produces: [
        { resourceId: "automation_jobs", amount: 0.5 },
        { resourceId: "ansible_playbooks", amount: 0.3 },
        { resourceId: "nornir_inventories", amount: 0.3 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "era", era: "the_platform" },
      special: "2x output from Nautobot Instance",
      happinessFactors: ["automation_coverage", "manual_task_ratio", "tool_quality"]
    },
    {
      id: "security_engineer",
      name: "Security Engineer",
      description: "No. Their default answer to every request. Followed by a 47-slide deck on why. But honestly? They're usually right.",
      era: "the_platform",
      baseCost: 200,
      costRatio: 1.2,
      produces: [
        { resourceId: "compliance_reports", amount: 0.3 },
        { resourceId: "ssh_keys", amount: 0.2 },
        { resourceId: "technical_debt", amount: -0.5 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "era", era: "the_platform" },
      special: "Reduces Event probability by 5% per engineer, -0.5 technical_debt/tick",
      happinessFactors: ["security_posture", "compliance_status", "incident_frequency"]
    },
    {
      id: "automation_architect",
      name: "Automation Architect",
      description: "Designs the automation framework. Writes the standards. Reviews the pull requests. Has opinions about everything and the authority to enforce them.",
      era: "full_netdevops",
      baseCost: 300,
      costRatio: 1.2,
      produces: [
        { resourceId: "design_documents", amount: 0.3 },
        { resourceId: "nautobot_apps", amount: 0.5 },
        { resourceId: "golden_configs", amount: 0.3 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "era", era: "full_netdevops" },
      special: "Can research any tech",
      happinessFactors: ["architecture_quality", "standards_compliance", "code_review_backlog"]
    },
    {
      id: "site_reliability_engineer",
      name: "Site Reliability Engineer",
      description: "Carries a pager. Writes postmortems. Has developed a Pavlovian anxiety response to the PagerDuty notification sound.",
      era: "full_netdevops",
      baseCost: 250,
      costRatio: 1.2,
      produces: [
        { resourceId: "uptime_points", amount: 1 },
        { resourceId: "automation_jobs", amount: 0.3 },
        { resourceId: "technical_debt", amount: -0.3 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "era", era: "full_netdevops" },
      special: "2x output from monitoring buildings, -0.3 technical_debt/tick",
      happinessFactors: ["on_call_rotation", "incident_frequency", "postmortem_quality"]
    },
    {
      id: "cloud_engineer",
      name: "Cloud Engineer",
      description: "We can just move it to the cloud. The solution to every problem, and the cause of several new ones.",
      era: "multi_site_empire",
      baseCost: 300,
      costRatio: 1.2,
      produces: [
        { resourceId: "terraform_plans", amount: 0.5 },
        { resourceId: "service_mesh_configs", amount: 0.3 },
        { resourceId: "container_images", amount: 0.2 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "era", era: "multi_site_empire" },
      special: "Required for Era VI buildings",
      happinessFactors: ["cloud_budget", "multi_cloud_complexity", "on_prem_legacy"]
    },
    {
      id: "data_scientist",
      name: "Data Scientist",
      description: "You don't fully understand what they do. They don't fully understand your network. Together, you're building something that scares you both.",
      era: "the_cloud",
      baseCost: 400,
      costRatio: 1.2,
      produces: [
        { resourceId: "intent_declarations", amount: 0.3 },
        { resourceId: "digital_twin_snapshots", amount: 0.2 }
      ],
      consumes: [{ resourceId: "coffee", amount: 1 }],
      unlockCondition: { type: "tech", techId: "aiops" },
      special: "Enables AIOps research",
      happinessFactors: ["data_quality", "model_accuracy", "gpu_budget"]
    }
  ];

  // data/technologies.json
  var technologies_default = [
    {
      id: "ssh",
      name: "SSH",
      description: "Telnet but your password isn't broadcast in cleartext to everyone on the subnet. Revolutionary.",
      era: "the_terminal",
      costs: [{ resourceId: "cli_commands", amount: 50 }],
      researchTicks: 30,
      unlocks: {
        buildings: ["jump_host"],
        resources: [],
        upgrades: [],
        technologies: ["key_based_auth"],
        workers: [],
        other: []
      },
      prerequisites: [],
      flavorOnResearch: "You can now access devices without walking to the server room. Revolutionary."
    },
    {
      id: "snmp_monitoring",
      name: "SNMP Monitoring",
      description: "Simple Network Management Protocol. A name so misleading it should be illegal.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", amount: 100 },
        { resourceId: "log_entries", amount: 20 }
      ],
      researchTicks: 45,
      unlocks: {
        buildings: ["monitoring_dashboard"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: ["noc_technician"],
        other: ["NOC Technician hiring"]
      },
      prerequisites: [],
      flavorOnResearch: "You can now monitor your network. What you discover may disturb you."
    },
    {
      id: "vlans",
      name: "VLANs",
      description: "Virtual LANs. Because the network isn't complicated enough with just physical segments.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", amount: 80 },
        { resourceId: "documentation_pages", amount: 10 }
      ],
      researchTicks: 40,
      unlocks: {
        buildings: [],
        resources: ["ip_addresses"],
        upgrades: [],
        technologies: ["spanning_tree"],
        workers: [],
        other: ["Increased IP Address cap (+256)"]
      },
      prerequisites: [],
      flavorOnResearch: "VLANs configured. The broadcast domains are now smaller. The arguments are not."
    },
    {
      id: "subnetting",
      name: "Subnetting",
      description: "And on the seventh day, God created CIDR notation, and the network engineers wept.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", amount: 120 },
        { resourceId: "ip_addresses", amount: 20 }
      ],
      researchTicks: 50,
      unlocks: {
        buildings: [],
        resources: ["subnet_allocations"],
        upgrades: [],
        technologies: ["ospf"],
        workers: [],
        other: ["IPAM activities"]
      },
      prerequisites: [],
      flavorOnResearch: "You understand subnetting. /24 for everything is no longer acceptable."
    },
    {
      id: "spanning_tree",
      name: "Spanning Tree",
      description: "The protocol that prevents loops by creating a tree. Also the protocol that, when misconfigured, creates loops.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", amount: 150 },
        { resourceId: "log_entries", amount: 30 }
      ],
      researchTicks: 60,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["Redundant links", "-5% outage event chance"]
      },
      prerequisites: ["vlans"],
      flavorOnResearch: "Spanning tree converged. The loops are tamed. For now."
    },
    {
      id: "ospf",
      name: "OSPF",
      description: "Open Shortest Path First. The 'open' refers to the standard, not to the 400-page RFC you need to read.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", amount: 200 },
        { resourceId: "log_entries", amount: 50 }
      ],
      researchTicks: 70,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: ["bgp_basics"],
        workers: [],
        other: ["Dynamic routing", "Multi-Area Networks"]
      },
      prerequisites: ["subnetting"],
      flavorOnResearch: "OSPF areas configured. Your routes are now dynamic. Your anxiety is also dynamic."
    },
    {
      id: "bgp_basics",
      name: "BGP Basics",
      description: "The protocol that holds the internet together with the digital equivalent of duct tape and good intentions.",
      era: "the_terminal",
      costs: [
        { resourceId: "cli_commands", amount: 300 },
        { resourceId: "log_entries", amount: 100 }
      ],
      researchTicks: 90,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: ["evpn_vxlan"],
        workers: [],
        other: ["BGP peering", "ISP Trading"]
      },
      prerequisites: ["ospf"],
      flavorOnResearch: "BGP sessions established. You are now part of the internet's trust network. No pressure."
    },
    {
      id: "python_basics",
      name: "Python Basics",
      description: "print('Hello, Network') \u2014 and just like that, a new automation engineer is born.",
      era: "scripting_and_hope",
      costs: [{ resourceId: "cli_commands", amount: 100 }],
      researchTicks: 40,
      unlocks: {
        buildings: ["ide"],
        resources: ["python_scripts"],
        upgrades: [],
        technologies: ["version_control", "rest_apis", "configuration_templating", "regular_expressions", "yaml"],
        workers: ["python_developer"],
        other: []
      },
      prerequisites: [],
      flavorOnResearch: "You can write Python. The network will never be the same."
    },
    {
      id: "version_control",
      name: "Version Control",
      description: "The first git commit. The message is 'initial commit.' The repository will contain 47 more commits with the message 'fix.'",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", amount: 150 },
        { resourceId: "python_scripts", amount: 20 }
      ],
      researchTicks: 50,
      unlocks: {
        buildings: ["git_repository"],
        resources: ["git_commits"],
        upgrades: ["pre_commit_hooks"],
        technologies: ["remote_work"],
        workers: [],
        other: []
      },
      prerequisites: ["python_basics"],
      flavorOnResearch: "Version control achieved. Your commit messages will not improve."
    },
    {
      id: "rest_apis",
      name: "REST APIs",
      description: "GET /api/v1/devices/. 200 OK. You have just experienced the joy that launched a thousand integrations.",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", amount: 200 },
        { resourceId: "python_scripts", amount: 30 }
      ],
      researchTicks: 60,
      unlocks: {
        buildings: ["token_generator"],
        resources: ["api_tokens", "json_blobs"],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["python_basics"],
      flavorOnResearch: "REST APIs unlocked. GET, POST, PUT, DELETE. The four verbs of creation."
    },
    {
      id: "configuration_templating",
      name: "Configuration Templating",
      description: "Jinja2. Because generating 500 configs by hand is not 'job security,' it's 'a cry for help.'",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", amount: 250 },
        { resourceId: "python_scripts", amount: 40 },
        { resourceId: "yaml_files", amount: 20 }
      ],
      researchTicks: 70,
      effects: [
        { type: "cap_increase", resourceId: "python_scripts", amount: 300 }
      ],
      unlocks: {
        buildings: ["template_workshop"],
        resources: ["jinja_templates"],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["python_basics"],
      flavorOnResearch: "Jinja2 mastered. No more copy-paste configs. The templates have arrived."
    },
    {
      id: "key_based_auth",
      name: "Key-Based Auth",
      description: "No more passwords. Just a public key, a private key, and a passphrase you'll forget in three weeks.",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", amount: 150 },
        { resourceId: "ssh_keys", amount: 20 }
      ],
      researchTicks: 45,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["SSH Key resource boost", "+0.3 SSH Keys/tick"]
      },
      prerequisites: ["ssh"],
      flavorOnResearch: "Key-based auth enabled. Passwords are so last era."
    },
    {
      id: "regular_expressions",
      name: "Regular Expressions",
      description: "Now you have two problems. But at least one of them can parse a show ip route output.",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", amount: 200 },
        { resourceId: "python_scripts", amount: 30 }
      ],
      researchTicks: 55,
      effects: [
        { type: "cap_increase", resourceId: "python_scripts", amount: 200 }
      ],
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["+20% Python Script production"]
      },
      prerequisites: ["python_basics"],
      flavorOnResearch: "Regex mastered. You have solved one problem. The regex is the other."
    },
    {
      id: "yaml",
      name: "YAML",
      description: "It's like JSON but for people who enjoy counting spaces. Tab characters are a federal crime.",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", amount: 100 },
        { resourceId: "documentation_pages", amount: 20 }
      ],
      researchTicks: 35,
      unlocks: {
        buildings: [],
        resources: ["yaml_files"],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["enables Ansible path"]
      },
      prerequisites: ["python_basics"],
      flavorOnResearch: "YAML understood. Indentation anxiety: permanent."
    },
    {
      id: "remote_work",
      name: "Remote Work",
      description: "You can SSH from home. You could always SSH from home. Management just finally admitted it.",
      era: "scripting_and_hope",
      costs: [
        { resourceId: "cli_commands", amount: 300 },
        { resourceId: "documentation_pages", amount: 50 },
        { resourceId: "budget", amount: 30 }
      ],
      researchTicks: 60,
      unlocks: {
        buildings: ["home_office"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["+10% all production"]
      },
      prerequisites: ["version_control"],
      flavorOnResearch: "Remote work unlocked. Your commute is now 15 steps."
    },
    {
      id: "source_of_truth",
      name: "Source of Truth",
      description: "The moment you realize that the spreadsheet is not a source of truth. It's a source of arguments.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", amount: 500 },
        { resourceId: "python_scripts", amount: 100 },
        { resourceId: "yaml_files", amount: 50 }
      ],
      researchTicks: 100,
      unlocks: {
        buildings: ["nautobot_instance"],
        resources: [],
        upgrades: [],
        technologies: ["ip_address_management", "graphql", "nautobot_jobs"],
        workers: [],
        other: ["retirement of The Spreadsheet of Truth"]
      },
      prerequisites: ["rest_apis", "yaml"],
      flavorOnResearch: "The source of truth has been established. The spreadsheet has been... deprecated."
    },
    {
      id: "configuration_management",
      name: "Configuration Management",
      description: "Desired state: all devices configured correctly. Current state: lol.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", amount: 400 },
        { resourceId: "yaml_files", amount: 80 },
        { resourceId: "jinja_templates", amount: 40 }
      ],
      researchTicks: 90,
      unlocks: {
        buildings: ["ansible_control_node"],
        resources: ["ansible_playbooks"],
        upgrades: ["parallel_execution"],
        technologies: ["nornir"],
        workers: [],
        other: []
      },
      prerequisites: ["configuration_templating", "yaml"],
      flavorOnResearch: "Configuration management achieved. Desired state defined. Actual state: working on it."
    },
    {
      id: "ip_address_management",
      name: "IP Address Management",
      description: "An IPAM is just a spreadsheet that has opinions and enforces them. This is an upgrade.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", amount: 350 },
        { resourceId: "ip_addresses", amount: 60 },
        { resourceId: "subnet_allocations", amount: 30 }
      ],
      researchTicks: 80,
      unlocks: {
        buildings: ["ipam_system"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["source_of_truth", "subnetting"],
      flavorOnResearch: "IPAM deployed. No more 'who has this IP?' emails. The IPAM knows all."
    },
    {
      id: "containers",
      name: "Containers",
      description: "docker run nautobot \u2014 four words that replace 47 pages of installation documentation.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", amount: 400 },
        { resourceId: "python_scripts", amount: 50 },
        { resourceId: "git_commits", amount: 30 }
      ],
      researchTicks: 85,
      unlocks: {
        buildings: ["container_registry"],
        resources: ["container_images"],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["python_basics", "version_control"],
      flavorOnResearch: "Containers understood. 'It works on my machine' is now everyone's machine."
    },
    {
      id: "continuous_integration",
      name: "Continuous Integration",
      description: "Every git push triggers a build, a lint, 200 tests, and a moment of existential dread.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", amount: 500 },
        { resourceId: "git_commits", amount: 100 },
        { resourceId: "python_scripts", amount: 40 }
      ],
      researchTicks: 95,
      unlocks: {
        buildings: ["ci_cd_pipeline"],
        resources: [],
        upgrades: ["linters"],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["version_control", "containers"],
      flavorOnResearch: "CI/CD pipeline online. Every push is now judged. Automatically."
    },
    {
      id: "nornir",
      name: "Nornir",
      description: "Ansible said 'YAML is the interface.' Nornir said 'Python is the interface.' The war rages on.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", amount: 400 },
        { resourceId: "python_scripts", amount: 80 },
        { resourceId: "ssh_keys", amount: 30 }
      ],
      researchTicks: 85,
      effects: [
        { type: "cap_increase", resourceId: "python_scripts", amount: 500 }
      ],
      unlocks: {
        buildings: ["nornir_runner"],
        resources: ["nornir_inventories"],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["python_basics", "configuration_management"],
      flavorOnResearch: "Nornir unleashed. Pure Python automation. The YAML vs Python debate intensifies."
    },
    {
      id: "secrets_management",
      name: "Secrets Management",
      description: "Passwords in plaintext in a Git repo: a rite of passage. Vault: the graduation ceremony.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", amount: 350 },
        { resourceId: "api_tokens", amount: 40 },
        { resourceId: "ssh_keys", amount: 30 }
      ],
      researchTicks: 75,
      unlocks: {
        buildings: ["secrets_vault"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["key_based_auth", "containers"],
      flavorOnResearch: "Secrets managed. No more plaintext passwords in Git. A new era of maturity."
    },
    {
      id: "graphql",
      name: "GraphQL",
      description: "{ devices { name } } \u2014 get exactly the data you need. Not a byte more. Your REST endpoints are jealous.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", amount: 300 },
        { resourceId: "api_tokens", amount: 50 },
        { resourceId: "json_blobs", amount: 30 }
      ],
      researchTicks: 70,
      unlocks: {
        buildings: [],
        resources: ["graphql_queries"],
        upgrades: ["caching_layer"],
        technologies: [],
        workers: [],
        other: ["enhanced Nautobot output"]
      },
      prerequisites: ["rest_apis", "source_of_truth"],
      flavorOnResearch: "GraphQL mastered. Your queries are surgical. Your REST endpoints weep."
    },
    {
      id: "nautobot_jobs",
      name: "Nautobot Jobs",
      description: "Scheduled automation in the platform. Like cron, but with a UI, logging, approval workflows, and fewer regrets.",
      era: "the_platform",
      costs: [
        { resourceId: "cli_commands", amount: 400 },
        { resourceId: "automation_jobs", amount: 50 },
        { resourceId: "graphql_queries", amount: 30 }
      ],
      researchTicks: 80,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["Automation Jobs production boost"]
      },
      prerequisites: ["source_of_truth", "python_basics"],
      flavorOnResearch: "Nautobot Jobs configured. Automation on a schedule. With approval workflows."
    },
    {
      id: "config_compliance",
      name: "Config Compliance",
      description: "The config says one thing. The device says another. The compliance engine says 'we need to talk.'",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", amount: 800 },
        { resourceId: "golden_configs", amount: 100 },
        { resourceId: "config_diffs", amount: 50 }
      ],
      researchTicks: 120,
      unlocks: {
        buildings: ["config_compliance_engine"],
        resources: ["golden_configs"],
        upgrades: ["automated_rollback"],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["configuration_management", "source_of_truth"],
      flavorOnResearch: "Config compliance online. The gap between intent and reality is now measurable."
    },
    {
      id: "chatops",
      name: "ChatOps",
      description: "Type /deploy in Slack. Watch the automation run. Get high-fived by people who have no idea how hard that was to set up.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", amount: 600 },
        { resourceId: "api_tokens", amount: 50 },
        { resourceId: "webhook_events", amount: 30 }
      ],
      researchTicks: 90,
      unlocks: {
        buildings: ["chatops_bot"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["rest_apis", "continuous_integration"],
      flavorOnResearch: "ChatOps enabled. Slack is now a deployment tool. Management is concerned."
    },
    {
      id: "network_testing",
      name: "Network Testing",
      description: "Test the network before deploying. A concept so revolutionary it has its own conference talks.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", amount: 700 },
        { resourceId: "python_scripts", amount: 100 },
        { resourceId: "test_results", amount: 50 }
      ],
      researchTicks: 100,
      effects: [
        { type: "cap_increase", resourceId: "python_scripts", amount: 1e3 }
      ],
      unlocks: {
        buildings: ["test_lab"],
        resources: [],
        upgrades: ["dedicated_lab_environment"],
        technologies: [],
        workers: [],
        other: ["Test Results production boost"]
      },
      prerequisites: ["continuous_integration", "nornir"],
      flavorOnResearch: "Network testing framework deployed. Testing before deploying. What a concept."
    },
    {
      id: "event_driven_automation",
      name: "Event-Driven Automation",
      description: "Something happens. Something else happens automatically in response. This is either genius or terrifying.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", amount: 900 },
        { resourceId: "webhook_events", amount: 80 },
        { resourceId: "automation_jobs", amount: 50 }
      ],
      researchTicks: 110,
      unlocks: {
        buildings: ["webhook_relay"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["enhanced Automation Jobs"]
      },
      prerequisites: ["nautobot_jobs", "rest_apis"],
      flavorOnResearch: "Event-driven automation online. The network now reacts to itself. Skynet is taking notes."
    },
    {
      id: "gitops",
      name: "GitOps",
      description: "The Git repo is the source of truth. The CI/CD pipeline is the enforcer. The main branch is law.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", amount: 800 },
        { resourceId: "git_commits", amount: 150 },
        { resourceId: "pull_requests", amount: 80 }
      ],
      researchTicks: 120,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: ["infrastructure_as_code"],
        workers: [],
        other: ["+30% Git Commits production", "+20% Automation Jobs"]
      },
      prerequisites: ["version_control", "continuous_integration", "config_compliance"],
      flavorOnResearch: "GitOps achieved. The main branch is the law. All hail the merge commit."
    },
    {
      id: "certificate_management",
      name: "Certificate Management",
      description: "SSL certificates. They expire. You forget. The website goes down. You set up auto-renewal. The auto-renewal breaks. Circle of life.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", amount: 500 },
        { resourceId: "ssh_keys", amount: 50 },
        { resourceId: "compliance_reports", amount: 30 }
      ],
      researchTicks: 80,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: ["zero_trust_architecture"],
        workers: [],
        other: ["-10% security Event probability"]
      },
      prerequisites: ["key_based_auth", "secrets_management"],
      flavorOnResearch: "Certificate management automated. Certificates will renew themselves. Probably."
    },
    {
      id: "infrastructure_as_code",
      name: "Infrastructure as Code",
      description: "If it's not in Git, it doesn't exist. If it is in Git, it might still not work. But at least you can blame a specific commit.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", amount: 1e3 },
        { resourceId: "git_commits", amount: 200 },
        { resourceId: "yaml_files", amount: 100 }
      ],
      researchTicks: 130,
      unlocks: {
        buildings: [],
        resources: ["terraform_plans"],
        upgrades: [],
        technologies: ["hybrid_cloud"],
        workers: [],
        other: ["enables Cloud path"]
      },
      prerequisites: ["gitops", "configuration_management"],
      flavorOnResearch: "Infrastructure as Code achieved. Everything is in Git. Everything."
    },
    {
      id: "nautobot_app_development",
      name: "Nautobot App Development",
      description: "Your Nautobot instance has opinions. You give it more opinions. Soon it has all the opinions.",
      era: "full_netdevops",
      costs: [
        { resourceId: "cli_commands", amount: 700 },
        { resourceId: "python_scripts", amount: 100 },
        { resourceId: "graphql_queries", amount: 50 },
        { resourceId: "nautobot_apps", amount: 30 }
      ],
      researchTicks: 100,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: ["custom_nautobot_plugin"],
        technologies: ["app_ecosystem"],
        workers: [],
        other: ["Nautobot Apps production boost", "Nautobot Ecosystem Hub path"]
      },
      prerequisites: ["source_of_truth", "python_basics", "graphql"],
      flavorOnResearch: "Nautobot app development unlocked. Your platform now has opinions about having opinions."
    },
    {
      id: "high_availability",
      name: "High Availability",
      description: "Active/standby. Active/active. The database split-brain scenario you don't want to think about.",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", amount: 2e3 },
        { resourceId: "container_images", amount: 300 },
        { resourceId: "automation_jobs", amount: 100 }
      ],
      researchTicks: 150,
      unlocks: {
        buildings: ["regional_nautobot_cluster"],
        resources: [],
        upgrades: ["load_balancer"],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["containers", "source_of_truth"],
      flavorOnResearch: "High availability achieved. Two of everything. Except the budget."
    },
    {
      id: "zero_touch_provisioning",
      name: "Zero Touch Provisioning",
      description: "A switch boots. Gets a config. Joins the network. No human involved. This is either amazing or the beginning of Skynet.",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", amount: 1500 },
        { resourceId: "golden_configs", amount: 100 },
        { resourceId: "ansible_playbooks", amount: 80 }
      ],
      researchTicks: 140,
      unlocks: {
        buildings: ["ztp_server"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["config_compliance", "configuration_management"],
      flavorOnResearch: "ZTP enabled. Switches configure themselves. You are simultaneously proud and worried."
    },
    {
      id: "continuous_compliance",
      name: "Continuous Compliance",
      description: "Compliance isn't a project. It's a lifestyle. An exhausting, never-ending, audit-driven lifestyle.",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", amount: 2500 },
        { resourceId: "compliance_reports", amount: 200 },
        { resourceId: "config_diffs", amount: 100 }
      ],
      researchTicks: 160,
      unlocks: {
        buildings: ["automated_compliance_engine"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["config_compliance", "nautobot_jobs"],
      flavorOnResearch: "Continuous compliance achieved. The auditors are impressed. They'll still find something."
    },
    {
      id: "digital_twin",
      name: "Digital Twin",
      description: "A perfect copy of your network. In software. Where nothing can go wrong. (Things can go wrong.)",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", amount: 3e3 },
        { resourceId: "test_results", amount: 200 },
        { resourceId: "design_documents", amount: 100 }
      ],
      researchTicks: 180,
      unlocks: {
        buildings: ["network_digital_twin"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["network_testing", "high_availability"],
      flavorOnResearch: "Digital twin created. Your network has a virtual reflection. It's only slightly inaccurate."
    },
    {
      id: "multi_site_automation",
      name: "Multi-Site Automation",
      description: "Same automation. Five sites. Eight time zones. One engineer on call. What could go wrong?",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", amount: 3500 },
        { resourceId: "automation_jobs", amount: 300 },
        { resourceId: "graphql_queries", amount: 150 }
      ],
      researchTicks: 200,
      unlocks: {
        buildings: ["multi_site_orchestrator"],
        resources: [],
        upgrades: [],
        technologies: ["hybrid_cloud", "app_ecosystem"],
        workers: [],
        other: []
      },
      prerequisites: ["high_availability", "event_driven_automation"],
      flavorOnResearch: "Multi-site automation online. One command. Five sites. Zero sleep."
    },
    {
      id: "evpn_vxlan",
      name: "EVPN/VXLAN",
      description: "Overlay networking. Because one layer of complexity wasn't enough.",
      era: "multi_site_empire",
      costs: [
        { resourceId: "cli_commands", amount: 2e3 },
        { resourceId: "design_documents", amount: 200 },
        { resourceId: "config_diffs", amount: 100 }
      ],
      researchTicks: 150,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["Expanded network capacity", "+50% device cap"]
      },
      prerequisites: ["bgp_basics", "multi_site_automation"],
      flavorOnResearch: "EVPN/VXLAN deployed. Overlay on underlay on confusion. But it works."
    },
    {
      id: "hybrid_cloud",
      name: "Hybrid Cloud",
      description: "Some workloads in the cloud. Some on-prem. All the complexity of both. The simplicity of neither.",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", amount: 5e3 },
        { resourceId: "terraform_plans", amount: 300 },
        { resourceId: "container_images", amount: 200 }
      ],
      researchTicks: 250,
      unlocks: {
        buildings: ["cloud_gateway"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["infrastructure_as_code", "multi_site_automation"],
      flavorOnResearch: "Hybrid cloud connected. On-prem and cloud are now one. The billing is... complicated."
    },
    {
      id: "intent_based_networking",
      name: "Intent-Based Networking",
      description: "Tell the network what you want. The network figures out how. You pray it figures out correctly.",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", amount: 6e3 },
        { resourceId: "intent_declarations", amount: 400 },
        { resourceId: "golden_configs", amount: 200 }
      ],
      researchTicks: 280,
      unlocks: {
        buildings: ["self_healing_network_fabric"],
        resources: [],
        upgrades: [],
        technologies: ["network_as_code"],
        workers: [],
        other: ["Intent Declarations resource boost"]
      },
      prerequisites: ["continuous_compliance", "digital_twin"],
      flavorOnResearch: "Intent-based networking achieved. The network understands what you want. Mostly."
    },
    {
      id: "app_ecosystem",
      name: "App Ecosystem",
      description: "A marketplace. An ecosystem. A community. Also, 47 GitHub issues labeled 'help wanted.'",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", amount: 4e3 },
        { resourceId: "nautobot_apps", amount: 200 },
        { resourceId: "graphql_queries", amount: 300 }
      ],
      researchTicks: 220,
      unlocks: {
        buildings: ["nautobot_ecosystem_hub"],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: []
      },
      prerequisites: ["nautobot_app_development", "multi_site_automation"],
      flavorOnResearch: "The app ecosystem flourishes. Community contributions flow in. So do GitHub issues."
    },
    {
      id: "aiops",
      name: "AIOps",
      description: "Artificial intelligence for network operations. It can predict outages before they happen. It cannot predict the budget meeting.",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", amount: 8e3 },
        { resourceId: "automation_jobs", amount: 500 },
        { resourceId: "digital_twin_snapshots", amount: 300 }
      ],
      researchTicks: 300,
      unlocks: {
        buildings: ["the_war_room"],
        resources: [],
        upgrades: ["network_telemetry_streaming"],
        technologies: [],
        workers: ["data_scientist"],
        other: []
      },
      prerequisites: ["intent_based_networking", "digital_twin"],
      flavorOnResearch: "AIOps online. The machines are learning. What they're learning concerns you slightly."
    },
    {
      id: "zero_trust_architecture",
      name: "Zero Trust Architecture",
      description: "Trust nothing. Verify everything. Even this technology description.",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", amount: 4e3 },
        { resourceId: "compliance_reports", amount: 200 },
        { resourceId: "ssh_keys", amount: 100 }
      ],
      researchTicks: 200,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["-30% security Event probability", "+20% Compliance Reports"]
      },
      prerequisites: ["certificate_management", "continuous_compliance"],
      flavorOnResearch: "Zero trust achieved. You trust nothing. Not even this achievement notification."
    },
    {
      id: "network_as_code",
      name: "Network as Code",
      description: "The entire network. In a Git repo. Every VLAN, every route, every ACL. One git push to rule them all.",
      era: "the_cloud",
      costs: [
        { resourceId: "cli_commands", amount: 1e4 },
        { resourceId: "git_commits", amount: 500 },
        { resourceId: "golden_configs", amount: 300 },
        { resourceId: "intent_declarations", amount: 200 }
      ],
      researchTicks: 350,
      unlocks: {
        buildings: [],
        resources: [],
        upgrades: [],
        technologies: [],
        workers: [],
        other: ["Endgame production multipliers (2x all)"]
      },
      prerequisites: ["gitops", "intent_based_networking", "app_ecosystem"],
      flavorOnResearch: "Network as Code achieved. The entire network is in Git. One push to rule them all. The endgame begins."
    }
  ];

  // data/upgrades.json
  var upgrades_default = [
    {
      id: "better_tab_completion",
      name: "Better Tab Completion",
      description: "cisco-device# show ip in[TAB] \u2014 the most satisfying sound in networking.",
      category: "productivity",
      costs: [{ resourceId: "cli_commands", amount: 100 }],
      effects: [{ type: "ratio", target: "cli_commands", amount: 0.1 }],
      unlockCondition: null,
      purchased: false
    },
    {
      id: "aliases_and_shortcuts",
      name: "Aliases and Shortcuts",
      description: "alias sir='show ip route' \u2014 laziness is the mother of efficiency.",
      category: "productivity",
      costs: [
        { resourceId: "cli_commands", amount: 200 },
        { resourceId: "python_scripts", amount: 20 }
      ],
      effects: [{ type: "ratio", target: "cli_commands", amount: 0.15 }],
      unlockCondition: { type: "resource", resourceId: "cli_commands", amount: 500 },
      purchased: false
    },
    {
      id: "syntax_highlighting",
      name: "Syntax Highlighting",
      description: "Seeing your YAML in color doesn't make it correct. But it makes finding the errors 30% faster.",
      category: "productivity",
      costs: [
        { resourceId: "cli_commands", amount: 300 },
        { resourceId: "yaml_files", amount: 30 }
      ],
      effects: [
        { type: "ratio", target: "yaml_files", amount: 0.15 },
        { type: "ratio", target: "python_scripts", amount: 0.1 }
      ],
      unlockCondition: { type: "tech", techId: "yaml" },
      purchased: false
    },
    {
      id: "linters",
      name: "Linters",
      description: "A program that tells you your code is wrong. Like a code review, but it doesn't have opinions about variable naming.",
      category: "productivity",
      costs: [
        { resourceId: "cli_commands", amount: 400 },
        { resourceId: "python_scripts", amount: 50 }
      ],
      effects: [{ type: "reduction", target: "technical_debt", amount: 0.1 }],
      unlockCondition: { type: "tech", techId: "continuous_integration" },
      purchased: false
    },
    {
      id: "auto_formatter",
      name: "Auto Formatter",
      description: "black . \u2014 your code is now formatted. Your ego is now bruised. Both are healthier for it.",
      category: "productivity",
      costs: [
        { resourceId: "cli_commands", amount: 300 },
        { resourceId: "python_scripts", amount: 40 }
      ],
      effects: [
        { type: "ratio", target: "python_scripts", amount: 0.1 },
        { type: "ratio", target: "git_commits", amount: 0.05 }
      ],
      unlockCondition: { type: "tech", techId: "python_basics" },
      purchased: false
    },
    {
      id: "pre_commit_hooks",
      name: "Pre-Commit Hooks",
      description: "Gates that prevent bad code from entering the repo. Also prevent you from committing at 5 PM on Friday.",
      category: "productivity",
      costs: [
        { resourceId: "cli_commands", amount: 500 },
        { resourceId: "git_commits", amount: 80 }
      ],
      effects: [{ type: "reduction", target: "technical_debt", amount: 0.15 }],
      unlockCondition: { type: "tech", techId: "version_control" },
      purchased: false
    },
    {
      id: "parallel_execution",
      name: "Parallel Execution",
      description: "Why configure one device at a time when you can configure 50 at a time and have 50 things go wrong simultaneously?",
      category: "productivity",
      costs: [
        { resourceId: "cli_commands", amount: 800 },
        { resourceId: "ansible_playbooks", amount: 50 }
      ],
      effects: [{ type: "ratio", target: "automation_output", amount: 0.5 }],
      unlockCondition: { type: "tech", techId: "configuration_management" },
      purchased: false
    },
    {
      id: "caching_layer",
      name: "Caching Layer",
      description: "Nautobot queries that used to take 3 seconds now take 3 milliseconds. You briefly feel like a god.",
      category: "productivity",
      costs: [
        { resourceId: "cli_commands", amount: 1e3 },
        { resourceId: "graphql_queries", amount: 100 }
      ],
      effects: [{ type: "ratio", target: "graphql_queries", amount: 0.3 }],
      unlockCondition: { type: "tech", techId: "graphql" },
      purchased: false
    },
    {
      id: "dark_mode",
      name: "Dark Mode",
      description: "Light mode is for people who don't stare at terminals for 10 hours a day.",
      category: "quality_of_life",
      costs: [{ resourceId: "cli_commands", amount: 100 }],
      effects: [{ type: "ratio", target: "happiness", amount: 0.05 }],
      unlockCondition: null,
      purchased: false
    },
    {
      id: "mechanical_keyboard",
      name: "Mechanical Keyboard",
      description: "Cherry MX Blues. The sound of productivity. Also the sound of everyone in the open office planning your demise.",
      category: "quality_of_life",
      costs: [
        { resourceId: "cli_commands", amount: 200 },
        { resourceId: "budget", amount: 50 }
      ],
      effects: [
        { type: "ratio", target: "typing_speed", amount: 0.15 },
        { type: "reduction", target: "coworker_happiness_cubicle_farm", amount: 0.1 }
      ],
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      purchased: false
    },
    {
      id: "multiple_monitors",
      name: "Multiple Monitors",
      description: "Three monitors. One for the terminal. One for documentation. One for the monitoring dashboard you check every 30 seconds.",
      category: "quality_of_life",
      costs: [
        { resourceId: "cli_commands", amount: 300 },
        { resourceId: "budget", amount: 100 }
      ],
      effects: [{ type: "ratio", target: "all_production", amount: 0.1 }],
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      purchased: false
    },
    {
      id: "ergonomic_chair",
      name: "Ergonomic Chair",
      description: "Your back thanks you. Your budget weeps.",
      category: "quality_of_life",
      costs: [{ resourceId: "budget", amount: 200 }],
      effects: [
        { type: "ratio", target: "happiness", amount: 0.05 },
        { type: "ratio", target: "all_production", amount: 0.03 }
      ],
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      purchased: false
    },
    {
      id: "noise_canceling_headphones",
      name: "Noise-Canceling Headphones",
      description: "The meetings continue. You just can't hear them anymore.",
      category: "quality_of_life",
      costs: [{ resourceId: "budget", amount: 150 }],
      effects: [
        { type: "ratio", target: "happiness", amount: 0.05 },
        { type: "reduction", target: "meeting_minutes", amount: 0.2 }
      ],
      unlockCondition: { type: "era", era: "the_platform" },
      purchased: false
    },
    {
      id: "dedicated_lab_environment",
      name: "Dedicated Lab Environment",
      description: "A separate network for testing. What a concept.",
      category: "quality_of_life",
      costs: [
        { resourceId: "cli_commands", amount: 500 },
        { resourceId: "budget", amount: 200 }
      ],
      effects: [
        { type: "ratio", target: "test_results", amount: 0.2 },
        { type: "reduction", target: "event_chance", amount: 0.1 }
      ],
      unlockCondition: { type: "tech", techId: "network_testing" },
      purchased: false
    },
    {
      id: "ssd_upgrade",
      name: "SSD Upgrade",
      description: "Your Nautobot instance now loads in 2 seconds instead of 20. This changes everything and nothing.",
      category: "infrastructure",
      costs: [
        { resourceId: "cli_commands", amount: 500 },
        { resourceId: "budget", amount: 200 }
      ],
      effects: [{ type: "ratio", target: "nautobot_output", amount: 0.2 }],
      unlockCondition: { type: "tech", techId: "source_of_truth" },
      purchased: false
    },
    {
      id: "database_optimization",
      name: "Database Optimization",
      description: "EXPLAIN ANALYZE \u2014 two words that turn a 30-second query into a 30-millisecond query.",
      category: "infrastructure",
      costs: [
        { resourceId: "cli_commands", amount: 800 },
        { resourceId: "graphql_queries", amount: 100 }
      ],
      effects: [{ type: "ratio", target: "graphql_queries", amount: 0.25 }],
      unlockCondition: { type: "tech", techId: "graphql" },
      purchased: false
    },
    {
      id: "redis_cache",
      name: "Redis Cache",
      description: "In-memory data store. Your Nautobot workers are now 40% faster and you only had to Google 'Redis sentinel configuration' twelve times.",
      category: "infrastructure",
      costs: [
        { resourceId: "cli_commands", amount: 600 },
        { resourceId: "container_images", amount: 50 }
      ],
      effects: [{ type: "ratio", target: "nautobot_output", amount: 0.15 }],
      unlockCondition: { type: "tech", techId: "containers" },
      purchased: false
    },
    {
      id: "load_balancer",
      name: "Load Balancer",
      description: "Distributes traffic evenly. Until it doesn't. Then it distributes panic evenly.",
      category: "infrastructure",
      costs: [
        { resourceId: "cli_commands", amount: 1e3 },
        { resourceId: "budget", amount: 100 }
      ],
      effects: [{ type: "ratio", target: "building_output", amount: 0.2 }],
      unlockCondition: { type: "tech", techId: "high_availability" },
      purchased: false
    },
    {
      id: "backup_system",
      name: "Backup System",
      description: "The backup works. The restore works. You tested the restore. You did test the restore, right?",
      category: "infrastructure",
      costs: [
        { resourceId: "cli_commands", amount: 400 },
        { resourceId: "budget", amount: 50 }
      ],
      effects: [{ type: "reduction", target: "event_loss", amount: 0.25 }],
      unlockCondition: { type: "era", era: "the_platform" },
      purchased: false
    },
    {
      id: "log_aggregation",
      name: "Log Aggregation",
      description: "All your logs, in one place, searchable, indexed, and slightly terrifying in their volume.",
      category: "infrastructure",
      costs: [
        { resourceId: "cli_commands", amount: 700 },
        { resourceId: "log_entries", amount: 200 }
      ],
      effects: [
        { type: "ratio", target: "log_entries", amount: 0.3 },
        { type: "ratio", target: "monitoring_output", amount: 0.1 }
      ],
      unlockCondition: { type: "tech", techId: "snmp_monitoring" },
      purchased: false
    },
    {
      id: "custom_nautobot_plugin",
      name: "Custom Nautobot Plugin",
      description: "You wrote a Nautobot App for your specific use case. It's beautiful. It's 4,000 lines of Python. It has 3 users.",
      category: "late_game",
      costs: [
        { resourceId: "cli_commands", amount: 2e3 },
        { resourceId: "python_scripts", amount: 100 },
        { resourceId: "nautobot_apps", amount: 50 }
      ],
      effects: [{ type: "ratio", target: "nautobot_apps", amount: 0.25 }],
      unlockCondition: { type: "tech", techId: "nautobot_app_development" },
      purchased: false
    },
    {
      id: "api_rate_limit_increase",
      name: "API Rate Limit Increase",
      description: "From 100 requests/minute to 10,000. Your automation scripts stop politely waiting and start actually working.",
      category: "late_game",
      costs: [
        { resourceId: "cli_commands", amount: 1500 },
        { resourceId: "api_tokens", amount: 200 }
      ],
      effects: [{ type: "ratio", target: "api_production", amount: 0.4 }],
      unlockCondition: { type: "tech", techId: "rest_apis" },
      eraRequirement: "full_netdevops",
      purchased: false
    },
    {
      id: "automated_rollback",
      name: "Automated Rollback",
      description: "When a change goes wrong, the network rolls itself back. You don't even have to panic. You panic anyway.",
      category: "late_game",
      costs: [
        { resourceId: "cli_commands", amount: 3e3 },
        { resourceId: "automation_jobs", amount: 200 },
        { resourceId: "golden_configs", amount: 100 }
      ],
      effects: [{ type: "reduction", target: "change_event_impact", amount: 0.5 }],
      unlockCondition: { type: "tech", techId: "config_compliance" },
      purchased: false
    },
    {
      id: "network_telemetry_streaming",
      name: "Network Telemetry Streaming",
      description: "Streaming telemetry. Real-time data. Sub-second updates. Your monitoring dashboard now causes motion sickness.",
      category: "late_game",
      costs: [
        { resourceId: "cli_commands", amount: 5e3 },
        { resourceId: "log_entries", amount: 300 },
        { resourceId: "uptime_points", amount: 200 }
      ],
      effects: [
        { type: "ratio", target: "monitoring_output", amount: 0.5 },
        { type: "ratio", target: "uptime_points", amount: 0.3 }
      ],
      unlockCondition: { type: "tech", techId: "aiops" },
      purchased: false
    },
    {
      id: "mindfulness_training",
      name: "Mindfulness Training",
      description: "A corporate wellness initiative that teaches engineers to breathe deeply before typing 'shutdown' on the wrong interface.",
      category: "quality_of_life",
      costs: [
        { resourceId: "budget", amount: 300 },
        { resourceId: "meeting_minutes", amount: 50 }
      ],
      effects: [{ type: "cap_increase", target: "sanity", amount: 50 }],
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      purchased: false
    },
    {
      id: "sla_renegotiations",
      name: "SLA Renegotiations",
      description: "You convinced management that 99.999% uptime was a typo and they meant 99.9%. Three fewer nines. Three more hours of sleep.",
      category: "late_game",
      costs: [
        { resourceId: "meeting_minutes", amount: 100 },
        { resourceId: "goodwill", amount: 30 },
        { resourceId: "documentation_pages", amount: 200 }
      ],
      effects: [{ type: "cap_increase", target: "uptime_points", amount: 200 }],
      unlockCondition: { type: "tech", techId: "high_availability" },
      purchased: false
    },
    {
      id: "budget_expansion_proposal",
      name: "Budget Expansion Proposal",
      description: "A 47-slide PowerPoint deck proving that infrastructure investment yields ROI. Slide 23 is a meme. The CFO liked slide 23.",
      category: "quality_of_life",
      costs: [
        { resourceId: "documentation_pages", amount: 150 },
        { resourceId: "goodwill", amount: 20 },
        { resourceId: "meeting_minutes", amount: 30 }
      ],
      effects: [{ type: "cap_increase", target: "budget", amount: 500 }],
      unlockCondition: { type: "era", era: "the_platform" },
      purchased: false
    },
    {
      id: "move_fast_break_things",
      name: "Move Fast and Break Things",
      description: "Management adopts the Silicon Valley mantra. Your capacity for technical debt has never been higher. Literally.",
      category: "late_game",
      costs: [
        { resourceId: "cli_commands", amount: 1e3 },
        { resourceId: "goodwill", amount: 15 }
      ],
      effects: [{ type: "cap_increase", target: "technical_debt", amount: 250 }],
      unlockCondition: { type: "era", era: "scripting_and_hope" },
      purchased: false
    },
    {
      id: "community_engagement_program",
      name: "Community Engagement Program",
      description: "You start giving conference talks, writing blog posts, and answering questions on the NTC Slack. People know your name. Your impostor syndrome disagrees.",
      category: "quality_of_life",
      costs: [
        { resourceId: "documentation_pages", amount: 100 },
        { resourceId: "cli_commands", amount: 500 }
      ],
      effects: [{ type: "cap_increase", target: "goodwill", amount: 50 }],
      unlockCondition: { type: "era", era: "the_platform" },
      purchased: false
    },
    {
      id: "virtual_environments",
      name: "Virtual Environments",
      description: "Isolated Python environments. pip install works without breaking everything. Usually.",
      category: "productivity",
      costs: [
        { resourceId: "cli_commands", amount: 500 },
        { resourceId: "yaml_files", amount: 50 }
      ],
      effects: [{ type: "cap_increase", target: "python_scripts", amount: 500 }],
      unlockCondition: { type: "tech", techId: "python_basics" },
      purchased: false
    }
  ];

  // data/trades.json
  var trades_default = [
    {
      id: "cisco_tac",
      name: "Cisco TAC",
      description: "Thank you for contacting the Technical Assistance Center. Your case number is SR-847291034. Please have your contract number, device serial, show tech, and the will to live ready.",
      era: "the_terminal",
      personality: "Bureaucratic. Slow. Eventually helpful.",
      unlockCondition: {
        type: "resource",
        resourceId: "log_entries",
        amount: 50
      },
      trades: [
        {
          id: "bug_fix",
          name: "Bug Fix",
          give: [
            { resourceId: "log_entries", amount: 50 },
            { resourceId: "sanity", amount: 3 },
            { resourceId: "change_window_tokens", amount: 2 }
          ],
          receive: [
            { resourceId: "technical_debt", amount: -10 }
          ],
          successRate: 0.7,
          failureMessage: "TAC suggests upgrading to the latest firmware. Again.",
          duration: null,
          notes: null
        },
        {
          id: "smartnet_renewal",
          name: "SmartNet Renewal",
          give: [
            { resourceId: "budget", amount: 200 }
          ],
          receive: [
            { type: "timed_bonus", target: "cisco_output", amount: 0.1, duration: 100 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "You're basically renting your own hardware"
        }
      ],
      attitude: 0,
      maxAttitude: 100,
      specialDeal: {
        unlockAtAttitude: 50,
        description: "Gold TAC - guaranteed 4-hour response time"
      }
    },
    {
      id: "arista_support",
      name: "Arista Support",
      description: "Fast, competent, and slightly smug about it. Their EOS documentation is genuinely good and they know it.",
      era: "scripting_and_hope",
      personality: "Efficient. Occasionally condescending.",
      unlockCondition: {
        type: "era",
        era: "scripting_and_hope"
      },
      trades: [
        {
          id: "config_review",
          name: "Config Review",
          give: [
            { resourceId: "config_diffs", amount: 30 },
            { resourceId: "log_entries", amount: 20 }
          ],
          receive: [
            { resourceId: "golden_configs", amount: 5 },
            { resourceId: "design_documents", amount: 1 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "They'll also tell you about MLAG"
        },
        {
          id: "eos_upgrade",
          name: "EOS Upgrade",
          give: [
            { resourceId: "budget", amount: 100 },
            { resourceId: "change_window_tokens", amount: 20 }
          ],
          receive: [
            { type: "timed_bonus", target: "event_chance", amount: -0.05, duration: 200 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "Smooth upgrades. They're annoyingly good at this"
        }
      ],
      attitude: 0,
      maxAttitude: 100,
      specialDeal: {
        unlockAtAttitude: 50,
        description: "Early access to EOS features and priority support"
      }
    },
    {
      id: "juniper_jtac",
      name: "Juniper JTAC",
      description: "Their CLI is different and they're proud of it. set interfaces ge-0/0/0 unit 0 family inet address \u2014 see? Totally intuitive.",
      era: "scripting_and_hope",
      personality: "Helpful. Insistent that Junos is better.",
      unlockCondition: {
        type: "era",
        era: "scripting_and_hope"
      },
      trades: [
        {
          id: "routing_consultation",
          name: "Routing Consultation",
          give: [
            { resourceId: "log_entries", amount: 40 },
            { resourceId: "cli_commands", amount: 30 }
          ],
          receive: [
            { resourceId: "design_documents", amount: 3 },
            { type: "timed_bonus", target: "routing_output", amount: 0.1, duration: 50 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "They'll convert everything to Junos syntax first"
        }
      ],
      attitude: 0,
      maxAttitude: 100,
      specialDeal: {
        unlockAtAttitude: 50,
        description: "Junos automation library access and dedicated SE"
      }
    },
    {
      id: "open_source_community",
      name: "Open Source Community",
      description: "Pull requests welcome. Documentation contributions especially welcome. Someone? Anyone? Please?",
      era: "scripting_and_hope",
      personality: "Generous. Chaotic. Understaffed.",
      unlockCondition: {
        type: "tech",
        techId: "python_basics"
      },
      trades: [
        {
          id: "contribute_code",
          name: "Contribute Code",
          give: [
            { resourceId: "python_scripts", amount: 20 },
            { resourceId: "git_commits", amount: 10 }
          ],
          receive: [
            { resourceId: "nautobot_apps", amount: 5 },
            { resourceId: "goodwill", amount: 30 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "The gift economy works. +5% Nautobot output permanent"
        },
        {
          id: "request_feature",
          name: "Request Feature",
          give: [
            { resourceId: "documentation_pages", amount: 10 },
            { resourceId: "pull_requests", amount: 5 }
          ],
          receive: [
            { resourceId: "nautobot_apps", amount: 1 }
          ],
          successRate: 0.5,
          failureMessage: "Feature request opened. 10 GitHub issues created. Someone labeled it 'help wanted'.",
          duration: null,
          notes: null
        }
      ],
      attitude: 0,
      maxAttitude: 100,
      specialDeal: {
        unlockAtAttitude: 50,
        description: "Core contributor status - early access to roadmap and direct maintainer access"
      }
    },
    {
      id: "aws_sales_rep",
      name: "AWS Sales Rep",
      description: "They'd like to schedule a call to discuss your cloud journey. The call is actually about your cloud budget. Your cloud budget is their commission.",
      era: "full_netdevops",
      personality: "Persistent. Expensive. Smooth.",
      unlockCondition: {
        type: "era",
        era: "full_netdevops"
      },
      trades: [
        {
          id: "cloud_credits",
          name: "Cloud Credits",
          give: [
            { resourceId: "budget", amount: 300 }
          ],
          receive: [
            { resourceId: "terraform_plans", amount: 100 },
            { resourceId: "container_images", amount: 50 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "The first taste is free. The second is not"
        },
        {
          id: "enterprise_agreement",
          name: "Enterprise Agreement",
          give: [
            { resourceId: "budget", amount: 1e3 }
          ],
          receive: [
            { type: "timed_bonus", target: "cloud_output", amount: 0.3, duration: 200 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "'Right-sizing' is their favorite word"
        }
      ],
      attitude: 0,
      maxAttitude: 100,
      seasonalAvailability: "Unavailable during re:Invent (1 game-week/year)",
      specialDeal: {
        unlockAtAttitude: 50,
        description: "Reserved Instance pricing - 40% off cloud resources permanently"
      }
    },
    {
      id: "the_consultancy",
      name: "The Consultancy",
      description: "They'll tell you what you already know, put it in a PowerPoint, charge you $50,000, and call it a 'digital transformation roadmap.'",
      era: "the_platform",
      personality: "Expensive. Professional. Says 'synergy.'",
      unlockCondition: {
        type: "era",
        era: "the_platform"
      },
      trades: [
        {
          id: "assessment",
          name: "Assessment",
          give: [
            { resourceId: "budget", amount: 500 },
            { resourceId: "meeting_minutes", amount: 50 }
          ],
          receive: [
            { resourceId: "design_documents", amount: 10 },
            { resourceId: "compliance_reports", amount: 5 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "ROI: questionable. Slides: beautiful"
        }
      ],
      attitude: 0,
      maxAttitude: 100,
      specialDeal: {
        unlockAtAttitude: 50,
        description: "Managed services retainer - ongoing architecture support at 20% discount"
      }
    },
    {
      id: "the_var",
      name: "The VAR",
      description: "Value Added Reseller. The 'value added' is debatable. The 'reseller' markup is not.",
      era: "the_terminal",
      personality: "Middleman energy. Knows everyone.",
      unlockCondition: null,
      trades: [
        {
          id: "hardware_order",
          name: "Hardware Order",
          give: [
            { resourceId: "budget", amount: 100 }
          ],
          receive: [
            { resourceId: "copper_cables", amount: 20 },
            { resourceId: "console_cables", amount: 5 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "They add 20% markup but save you 40% of the time"
        }
      ],
      attitude: 0,
      maxAttitude: 100,
      specialDeal: {
        unlockAtAttitude: 50,
        description: "Preferred pricing - 15% discount on all hardware orders"
      }
    },
    {
      id: "palo_alto_networks",
      name: "Palo Alto Networks",
      description: "Their firewalls are great. Their naming conventions (PAN-OS, Panorama, Prisma, Cortex, Strata) sound like a sci-fi franchise.",
      era: "full_netdevops",
      personality: "Security-focused. Confident.",
      unlockCondition: {
        type: "era",
        era: "full_netdevops"
      },
      trades: [
        {
          id: "security_audit",
          name: "Security Audit",
          give: [
            { resourceId: "budget", amount: 200 },
            { resourceId: "log_entries", amount: 30 }
          ],
          receive: [
            { resourceId: "compliance_reports", amount: 10 },
            { type: "timed_bonus", target: "security_event_chance", amount: -0.1, duration: 150 }
          ],
          successRate: 1,
          failureMessage: null,
          duration: null,
          notes: "They'll also try to sell you Cortex XSOAR"
        }
      ],
      attitude: 0,
      maxAttitude: 100,
      specialDeal: {
        unlockAtAttitude: 50,
        description: "Panorama integration - centralized security management across all sites"
      }
    },
    {
      id: "the_intern",
      name: "The Intern",
      description: "Eager. Dangerous. Knows more about TikTok than BGP. Will accidentally improve your documentation by asking 'why?' a lot.",
      era: "scripting_and_hope",
      personality: "Cheap. Unpredictable. Seasonal.",
      unlockCondition: {
        type: "season",
        season: "summer"
      },
      trades: [
        {
          id: "intern_labor",
          name: "Intern Labor",
          give: [
            { resourceId: "coffee", amount: 10 },
            { resourceId: "sanity", amount: 5 }
          ],
          receive: [
            { resourceId: "documentation_pages", amount: 20 },
            { resourceId: "copper_cables", amount: 5 }
          ],
          successRate: 0.85,
          failureMessage: "The intern ran a command on the production switch. It was educational for everyone.",
          duration: null,
          notes: "15% chance of accidental prod change"
        }
      ],
      attitude: 0,
      maxAttitude: 100,
      seasonalAvailability: "Only available in summer",
      specialDeal: {
        unlockAtAttitude: 50,
        description: "Return intern - they actually know things now and only break stuff 5% of the time"
      }
    }
  ];

  // data/events.json
  var events_default = [
    {
      id: "bgp_session_flap",
      name: "BGP Session Flap",
      description: "The core router's BGP session is flapping. Alerts are firing. The NOC is panicking. Turns out it was a cable that 'looked fine.'",
      type: "negative",
      probability: 5e-3,
      conditions: {
        type: "tech",
        techId: "bgp_basics"
      },
      effects: [
        { type: "resource", resourceId: "uptime_points", amount: -30 },
        { type: "resource", resourceId: "sanity", amount: -5 }
      ],
      choices: null,
      mitigation: [
        "Spanning Tree tech (-50%)",
        "Monitoring (-30%)"
      ]
    },
    {
      id: "config_drift_detected",
      name: "Config Drift Detected",
      description: "Someone made a manual change. They didn't document it. They don't remember doing it. The compliance engine is having a breakdown.",
      type: "negative",
      probability: 0.01,
      conditions: {
        type: "building",
        buildingId: "nautobot_instance",
        minCount: 1
      },
      effects: [
        { type: "resource", resourceId: "technical_debt", amount: 20 },
        { type: "resource", resourceId: "golden_configs", amount: -10 },
        { type: "resource", resourceId: "sanity", amount: -3 }
      ],
      choices: null,
      mitigation: [
        "Config Compliance Engine (-60%)",
        "GitOps (-40%)"
      ]
    },
    {
      id: "ransomware_scare",
      name: "Ransomware Scare",
      description: "An email from 'CEO' asks everyone to click a link. Three people did. One was in IT. The Security Engineer is updating their resume.",
      type: "negative",
      probability: 1e-3,
      conditions: null,
      effects: [
        { type: "resource", resourceId: "sanity", amount: -50 },
        { type: "resource", resourceId: "uptime_points", amount: -20 },
        { type: "resource", resourceId: "technical_debt", amount: 30 }
      ],
      choices: null,
      mitigation: [
        "Security Engineer (-5% per)",
        "Zero Trust (-30%)"
      ]
    },
    {
      id: "certificate_expiry",
      name: "Certificate Expiry",
      description: "The SSL certificate expired. At 2 AM. On a Saturday. The monitoring didn't catch it because... the monitoring dashboard's certificate also expired.",
      type: "negative",
      probability: 8e-3,
      conditions: null,
      effects: [
        { type: "resource", resourceId: "uptime_points", amount: -20 },
        { type: "resource", resourceId: "sanity", amount: -5 },
        { type: "resource", resourceId: "goodwill", amount: -10 }
      ],
      choices: null,
      mitigation: [
        "Certificate Management (-80%)",
        "Monitoring (-20%)"
      ]
    },
    {
      id: "dns_outage",
      name: "DNS Outage",
      description: "It's always DNS. It was DNS.",
      type: "negative",
      probability: 3e-3,
      conditions: null,
      effects: [
        { type: "resource", resourceId: "uptime_points", amount: -40 },
        { type: "resource", resourceId: "sanity", amount: -10 },
        { type: "production_modifier", target: "all", amount: -0.5, duration: 5 }
      ],
      choices: null,
      mitigation: [
        "Redundancy buildings (-50%)",
        "HA tech (-30%)"
      ]
    },
    {
      id: "intern_incident",
      name: "Intern Incident",
      description: "The intern ran 'write erase' on the production core switch. They thought it was the lab switch. To be fair, they were named similarly.",
      type: "negative",
      probability: 0.02,
      conditions: {
        type: "season",
        season: "summer"
      },
      effects: [
        { type: "resource", resourceId: "technical_debt", amount: 25 },
        { type: "resource", resourceId: "sanity", amount: -15 },
        { type: "resource", resourceId: "goodwill", amount: -10 }
      ],
      choices: null,
      mitigation: [
        "Dedicated Lab Environment (-70%)",
        "Proper RBAC"
      ]
    },
    {
      id: "vendor_eol_announcement",
      name: "Vendor EOL Announcement",
      description: "Your core platform has been announced End of Life. You have 18 months to migrate. The budget was approved for 6 months of effort.",
      type: "negative",
      probability: 2e-3,
      conditions: null,
      effects: [
        { type: "resource", resourceId: "technical_debt", amount: 50 }
      ],
      choices: null,
      mitigation: [
        "Multi-vendor strategy",
        "Budget reserves"
      ]
    },
    {
      id: "fiber_cut",
      name: "Fiber Cut",
      description: "A backhoe operator has found your fiber. The fiber did not survive the encounter.",
      type: "negative",
      probability: 1e-3,
      conditions: null,
      effects: [
        { type: "resource", resourceId: "uptime_points", amount: -80 },
        { type: "production_modifier", target: "all", amount: -1, duration: 10 }
      ],
      choices: null,
      mitigation: [
        "Redundant circuits",
        "Multi-Site Automation"
      ]
    },
    {
      id: "surprise_audit",
      name: "Surprise Audit",
      description: "The compliance team is here. They have questions. So many questions.",
      type: "choice",
      probability: 5e-3,
      probabilityOverrides: [
        { condition: { type: "season", season: "audit_season" }, probability: 0.02 }
      ],
      conditions: null,
      effects: [],
      choices: [
        {
          id: "submit_reports",
          text: "Submit Compliance Reports",
          description: "Hand over your compliance documentation and hope it's enough.",
          costs: [
            { resourceId: "compliance_reports", amount: 5 }
          ],
          effects: [
            { type: "resource", resourceId: "goodwill", amount: 5, chance: 1 }
          ],
          conditions: null
        },
        {
          id: "fail_audit",
          text: "Fail the audit",
          description: "You don't have the reports. This won't look good.",
          costs: [],
          effects: [
            { type: "resource", resourceId: "goodwill", amount: -30, chance: 1 },
            { type: "resource", resourceId: "sanity", amount: -10, chance: 1 }
          ],
          conditions: null
        }
      ],
      mitigation: [
        "Automated Compliance Engine",
        "Compliance Reports stockpile"
      ]
    },
    {
      id: "clean_change_window",
      name: "Clean Change Window",
      description: "The change window went perfectly. No rollbacks. No pages. The Network Engineer is suspicious.",
      type: "positive",
      probability: 0.02,
      conditions: {
        type: "resource",
        resourceId: "change_window_tokens",
        amount: 1
      },
      effects: [
        { type: "resource", resourceId: "sanity", amount: 10 },
        { type: "resource", resourceId: "goodwill", amount: 5 },
        { type: "resource", resourceId: "uptime_points", amount: 20 }
      ],
      choices: null,
      mitigation: []
    },
    {
      id: "vendor_credit",
      name: "Vendor Credit",
      description: "The vendor admits their firmware had a bug. They're offering credit. Write this date down, it will never happen again.",
      type: "positive",
      probability: 2e-3,
      conditions: null,
      effects: [
        { type: "resource", resourceId: "budget", amount: 100 }
      ],
      choices: null,
      mitigation: []
    },
    {
      id: "automation_success",
      name: "Automation Success",
      description: "Your automation ran across 500 devices. Zero failures. Zero drift. You stare at the logs in disbelief.",
      type: "positive",
      probability: 0.01,
      conditions: {
        type: "resource",
        resourceId: "automation_jobs",
        amount: 50
      },
      effects: [
        { type: "resource", resourceId: "sanity", amount: 20 },
        { type: "resource", resourceId: "goodwill", amount: 10 },
        { type: "resource", resourceId: "automation_jobs", amount: 50 }
      ],
      choices: null,
      mitigation: []
    },
    {
      id: "conference_inspiration",
      name: "Conference Inspiration",
      description: "You attended a talk. They're doing the same thing you're doing, but they called it something different and got promoted.",
      type: "positive",
      probability: 5e-3,
      conditions: null,
      effects: [
        { type: "resource", resourceId: "goodwill", amount: 5 },
        { type: "research_boost", target: "random_tech", amount: 0.1 }
      ],
      choices: null,
      mitigation: []
    },
    {
      id: "good_intern",
      name: "Good Intern",
      description: "The intern documented the entire legacy network. Accurately. With diagrams. Hire this person.",
      type: "positive",
      probability: 5e-3,
      conditions: {
        type: "season",
        season: "summer"
      },
      effects: [
        { type: "resource", resourceId: "documentation_pages", amount: 50 },
        { type: "resource", resourceId: "design_documents", amount: 10 }
      ],
      choices: null,
      mitigation: []
    },
    {
      id: "budget_surplus",
      name: "Budget Surplus",
      description: "The fiscal year is ending and there's unspent budget. Use it or lose it. You have 48 hours.",
      type: "positive",
      probability: 3e-3,
      conditions: {
        type: "season",
        season: "q4_budget"
      },
      effects: [
        { type: "resource", resourceId: "budget", amount: 200 }
      ],
      choices: null,
      mitigation: [],
      notes: "Budget is temporary, expires in 20 ticks"
    },
    {
      id: "the_legacy_migration",
      name: "The Legacy Migration",
      description: "Your oldest switch is running firmware from 2012. It works. Nobody wants to touch it. The compliance team wants it upgraded.",
      type: "choice",
      probability: 5e-3,
      conditions: {
        type: "resource",
        resourceId: "technical_debt",
        amount: 20
      },
      effects: [],
      choices: [
        {
          id: "upgrade_it",
          text: "Upgrade it",
          description: "Attempt the upgrade during a change window. 70% chance of success, 30% chance of making things much worse.",
          costs: [
            { resourceId: "change_window_tokens", amount: 3 },
            { resourceId: "cli_commands", amount: 50 }
          ],
          effects: [
            { type: "resource", resourceId: "compliance_reports", amount: 5, chance: 0.7 },
            { type: "resource", resourceId: "technical_debt", amount: -10, chance: 0.7 },
            { type: "resource", resourceId: "uptime_points", amount: -40, chance: 0.3 },
            { type: "resource", resourceId: "technical_debt", amount: 20, chance: 0.3 }
          ],
          conditions: null
        },
        {
          id: "document_exception",
          text: "Document the exception",
          description: "Write up a risk acceptance document and move on with your life.",
          costs: [
            { resourceId: "documentation_pages", amount: 20 }
          ],
          effects: [
            { type: "resource", resourceId: "technical_debt", amount: 5, chance: 1 },
            { type: "resource", resourceId: "compliance_reports", amount: 2, chance: 1 },
            { type: "resource", resourceId: "sanity", amount: -2, chance: 1 }
          ],
          conditions: null
        },
        {
          id: "replace_hardware",
          text: "Replace the hardware",
          description: "Buy new hardware and do a clean install. Expensive but thorough.",
          costs: [
            { resourceId: "budget", amount: 200 }
          ],
          effects: [
            { type: "resource", resourceId: "technical_debt", amount: -30, chance: 1 },
            { type: "resource", resourceId: "compliance_reports", amount: 5, chance: 1 },
            { type: "resource", resourceId: "sanity", amount: 10, chance: 1 }
          ],
          conditions: null
        }
      ],
      mitigation: []
    },
    {
      id: "vendor_lock_in_dilemma",
      name: "Vendor Lock-in Dilemma",
      description: "A vendor is offering a 40% discount on their proprietary platform. It does everything you need. It also locks you in for 5 years.",
      type: "choice",
      probability: 3e-3,
      conditions: null,
      effects: [],
      choices: [
        {
          id: "take_the_deal",
          text: "Take the deal",
          description: "Accept the discount and the golden handcuffs. Budget boost now, flexibility loss later.",
          costs: [],
          effects: [
            { type: "resource", resourceId: "budget", amount: 500, chance: 1 },
            { type: "timed_bonus", target: "vendor_production", amount: 0.2, duration: 200, chance: 1 },
            { type: "production_modifier", target: "flexibility", amount: -0.3, duration: 200, chance: 1 }
          ],
          conditions: null
        },
        {
          id: "decline_politely",
          text: "Decline politely",
          description: "Walk away from the deal. Your open source colleagues will be proud.",
          costs: [],
          effects: [
            { type: "resource", resourceId: "goodwill", amount: 10, chance: 1 },
            { type: "timed_bonus", target: "open_source_output", amount: 0.1, duration: 100, chance: 1 }
          ],
          conditions: null
        },
        {
          id: "negotiate",
          text: "Negotiate",
          description: "Try to get the discount with less lock-in. 50/50 they'll go for it.",
          costs: [
            { resourceId: "meeting_minutes", amount: 30 }
          ],
          effects: [
            { type: "resource", resourceId: "budget", amount: 500, chance: 0.5 },
            { type: "timed_bonus", target: "vendor_production", amount: 0.2, duration: 200, chance: 0.5 },
            { type: "production_modifier", target: "flexibility", amount: -0.15, duration: 200, chance: 0.5 }
          ],
          conditions: null
        }
      ],
      mitigation: []
    },
    {
      id: "the_reorganization",
      name: "The Reorganization",
      description: "Management is restructuring. Your team might get merged with the 'Cloud Team' or stay independent.",
      type: "choice",
      probability: 2e-3,
      conditions: {
        type: "era",
        era: "the_platform"
      },
      effects: [],
      choices: [
        {
          id: "merge_with_cloud",
          text: "Merge with Cloud Team",
          description: "Join forces with the cloud team. Gain cloud engineers, lose some network focus.",
          costs: [],
          effects: [
            { type: "resource", resourceId: "cloud_engineers", amount: 2, chance: 1 },
            { type: "resource", resourceId: "network_engineers", amount: -1, chance: 1 },
            { type: "production_modifier", target: "cloud_output", amount: 0.2, duration: null, chance: 1 },
            { type: "production_modifier", target: "network_output", amount: -0.1, duration: null, chance: 1 }
          ],
          conditions: null
        },
        {
          id: "stay_independent",
          text: "Stay independent",
          description: "Maintain team autonomy. Goodwill boost and steady output, but no cloud engineers for a while.",
          costs: [],
          effects: [
            { type: "resource", resourceId: "goodwill", amount: 10, chance: 1 },
            { type: "production_modifier", target: "all", amount: 0.05, duration: null, chance: 1 },
            { type: "lock_out", target: "cloud_engineers", duration: 100, chance: 1 }
          ],
          conditions: null
        }
      ],
      mitigation: []
    },
    {
      id: "open_source_or_enterprise",
      name: "Open Source or Enterprise",
      description: "You need a new IPAM tool. There's Nautobot (free, community-driven, requires your time) and VendorIPAM Pro ($$$, support included, requires your soul).",
      type: "choice",
      probability: 3e-3,
      conditions: {
        type: "tech",
        techId: "subnetting"
      },
      effects: [],
      choices: [
        {
          id: "nautobot",
          text: "Nautobot",
          description: "Go open source. Invest your time, keep your freedom, earn community respect.",
          costs: [
            { resourceId: "python_scripts", amount: 100 },
            { resourceId: "git_commits", amount: 50 }
          ],
          effects: [
            { type: "production_modifier", target: "ipam_output", amount: 0.3, duration: null, chance: 1 },
            { type: "resource", resourceId: "goodwill", amount: 20, chance: 1 }
          ],
          conditions: null
        },
        {
          id: "vendoripam_pro",
          text: "VendorIPAM Pro",
          description: "Pay for the enterprise solution. It works out of the box but costs your budget and your soul.",
          costs: [
            { resourceId: "budget", amount: 500 }
          ],
          effects: [
            { type: "production_modifier", target: "ipam_output", amount: 0.2, duration: null, chance: 1 },
            { type: "resource", resourceId: "compliance_reports", amount: 10, chance: 1 },
            { type: "resource", resourceId: "goodwill", amount: -10, chance: 1 }
          ],
          conditions: null
        }
      ],
      mitigation: []
    },
    {
      id: "the_3am_page",
      name: "The 3AM Page",
      description: "PagerDuty goes off. It's the core router. Again.",
      type: "choice",
      probability: 8e-3,
      conditions: {
        type: "building",
        buildingId: "monitoring_dashboard",
        minCount: 1
      },
      effects: [],
      choices: [
        {
          id: "fix_it_now",
          text: "Fix it now",
          description: "Roll out of bed and SSH in. Might fix it, might make it worse at 3 AM.",
          costs: [],
          effects: [
            { type: "resource", resourceId: "sanity", amount: -5, chance: 1 },
            { type: "resource", resourceId: "uptime_points", amount: 10, chance: 0.8 },
            { type: "resource", resourceId: "goodwill", amount: 5, chance: 0.8 },
            { type: "resource", resourceId: "uptime_points", amount: -30, chance: 0.2 }
          ],
          conditions: null
        },
        {
          id: "acknowledge_and_schedule",
          text: "Acknowledge and schedule",
          description: "Ack the page, set a reminder for business hours. Some uptime loss but you keep your sanity.",
          costs: [],
          effects: [
            { type: "resource", resourceId: "sanity", amount: -2, chance: 1 },
            { type: "resource", resourceId: "uptime_points", amount: -10, chance: 1 },
            { type: "auto_resolve", duration: 10, chance: 1 }
          ],
          conditions: null
        },
        {
          id: "let_automation_handle_it",
          text: "Let the automation handle it",
          description: "Trust the runbooks you wrote. 90% of the time, it works every time.",
          costs: [],
          effects: [
            { type: "resource", resourceId: "uptime_points", amount: 5, chance: 0.9 },
            { type: "resource", resourceId: "sanity", amount: -3, chance: 0.1 }
          ],
          conditions: {
            type: "tech",
            techId: "event_driven_automation"
          }
        }
      ],
      mitigation: []
    }
  ];

  // data/achievements.json
  var achievements_default = [
    {
      id: "first_ping",
      name: "First Ping",
      description: "%ACHIEVEMENT-5-UNLOCKED: Reply from 10.0.0.1: bytes=64 time<1ms TTL=64. It's alive.",
      category: "progression",
      condition: { type: "resource_total", resourceId: "ping_responses", amount: 1 },
      reward: null,
      hidden: false
    },
    {
      id: "console_cowboy",
      name: "Console Cowboy",
      description: "%ACHIEVEMENT-5-UNLOCKED: You have enough console cables to lasso a router.",
      category: "progression",
      condition: { type: "resource_total", resourceId: "console_cables", amount: 100 },
      reward: { type: "production_bonus", target: "console_cables", amount: 0.05 },
      hidden: false
    },
    {
      id: "script_kiddie",
      name: "Script Kiddie",
      description: '%ACHIEVEMENT-5-UNLOCKED: print("Hello, Network"). Your automation journey begins.',
      category: "progression",
      condition: { type: "resource_total", resourceId: "python_scripts", amount: 1 },
      reward: null,
      hidden: false
    },
    {
      id: "it_works_on_my_machine",
      name: "It Works On My Machine",
      description: "%ACHIEVEMENT-5-UNLOCKED: Deployed to prod. Fingers crossed.",
      category: "progression",
      condition: { type: "resource_total", resourceId: "automation_jobs", amount: 1 },
      reward: null,
      hidden: false
    },
    {
      id: "source_of_truth_achievement",
      name: "Source of Truth",
      description: "%ACHIEVEMENT-5-UNLOCKED: The spreadsheet has been deprecated. Long live the source of truth.",
      category: "progression",
      condition: { type: "building", buildingId: "nautobot_instance", minCount: 1 },
      reward: { type: "production_bonus", target: "nautobot_output", amount: 0.05 },
      hidden: false
    },
    {
      id: "full_stack_overflow",
      name: "Full Stack Overflow",
      description: "%ACHIEVEMENT-5-UNLOCKED: You have researched everything. You still Google basic syntax.",
      category: "progression",
      condition: { type: "all_technologies_researched" },
      reward: { type: "research_speed", amount: 0.1 },
      hidden: false
    },
    {
      id: "the_network_is_the_computer",
      name: "The Network Is The Computer",
      description: "%ACHIEVEMENT-5-UNLOCKED: The network runs itself. You're not sure if you should be proud or scared.",
      category: "progression",
      condition: { type: "tech", techId: "network_as_code" },
      reward: { type: "production_bonus", target: "all_production", amount: 0.2 },
      hidden: false
    },
    {
      id: "empire_builder",
      name: "Empire Builder",
      description: "%ACHIEVEMENT-5-UNLOCKED: From console cables to cloud gateways. What a journey.",
      category: "progression",
      condition: { type: "buildings_in_all_eras" },
      reward: null,
      hidden: false
    },
    {
      id: "hire_100",
      name: "Hire #100",
      description: "%ACHIEVEMENT-5-UNLOCKED: You now manage more people than devices. The horror.",
      category: "progression",
      condition: { type: "total_workers", amount: 100 },
      reward: { type: "happiness_bonus", amount: 0.05 },
      hidden: false
    },
    {
      id: "have_you_tried_rebooting",
      name: "Have You Tried Rebooting?",
      description: "%ACHIEVEMENT-5-UNLOCKED: The universal fix. Applied to your entire career.",
      category: "humor",
      condition: { type: "prestige_reset", count: 1 },
      reward: null,
      hidden: false
    },
    {
      id: "yaml_whisperer",
      name: "YAML Whisperer",
      description: "%ACHIEVEMENT-5-UNLOCKED: You can sense a wrong indentation from three cubicles away.",
      category: "humor",
      condition: { type: "resource_total", resourceId: "yaml_files", amount: 1e4 },
      reward: null,
      hidden: false
    },
    {
      id: "its_always_dns",
      name: "It's Always DNS",
      description: "%ACHIEVEMENT-5-UNLOCKED: It was DNS. It's always DNS.",
      category: "humor",
      condition: { type: "event_experienced", eventId: "dns_outage" },
      reward: null,
      hidden: false
    },
    {
      id: "caffeine_dependency",
      name: "Caffeine Dependency",
      description: "%ACHIEVEMENT-5-UNLOCKED: Your blood type is now French Roast.",
      category: "humor",
      condition: { type: "resource_total", resourceId: "coffee", amount: 1e4 },
      reward: null,
      hidden: false
    },
    {
      id: "meeting_survivor",
      name: "Meeting Survivor",
      description: '%ACHIEVEMENT-5-UNLOCKED: "This could have been an email." \u2014 You, 1,000 times.',
      category: "humor",
      condition: { type: "resource_total", resourceId: "meeting_minutes", amount: 1e3 },
      reward: null,
      hidden: false
    },
    {
      id: "technical_debt_collector",
      name: "Technical Debt Collector",
      description: "%ACHIEVEMENT-5-UNLOCKED: At this point, it's not debt. It's a mortgage.",
      category: "humor",
      condition: { type: "resource_current", resourceId: "technical_debt", amount: 500 },
      reward: null,
      hidden: false
    },
    {
      id: "zero_trust_zero_friends",
      name: "Zero Trust, Zero Friends",
      description: "%ACHIEVEMENT-5-UNLOCKED: You trust nothing and nobody. Including yourself.",
      category: "humor",
      condition: { type: "tech", techId: "zero_trust_architecture" },
      reward: null,
      hidden: false
    },
    {
      id: "the_blame_game",
      name: "The Blame Game",
      description: '%ACHIEVEMENT-5-UNLOCKED: "Who gave the intern enable access?" \u2014 Everyone, looking at you.',
      category: "humor",
      condition: { type: "event_experienced", eventId: "intern_incident" },
      reward: null,
      hidden: false
    },
    {
      id: "vendor_bingo",
      name: "Vendor Bingo",
      description: "%ACHIEVEMENT-5-UNLOCKED: You've met with every vendor. Your inbox will never be the same.",
      category: "humor",
      condition: { type: "all_trade_partners" },
      reward: null,
      hidden: false
    },
    {
      id: "change_freeze_survivor",
      name: "Change Freeze Survivor",
      description: "%ACHIEVEMENT-5-UNLOCKED: Nothing broke. Nothing was fixed. Peak stability.",
      category: "humor",
      condition: { type: "change_freeze_high_uptime", uptimePercent: 90 },
      reward: null,
      hidden: false
    },
    {
      id: "the_documentation_myth",
      name: "The Documentation Myth",
      description: "%ACHIEVEMENT-5-UNLOCKED: Some say it can't be done. You just did. Update it in 6 months.",
      category: "humor",
      condition: { type: "resource_total", resourceId: "fully_documented_networks", amount: 1 },
      reward: null,
      hidden: false
    },
    {
      id: "commit_message_poetry",
      name: "Commit Message Poetry",
      description: '%ACHIEVEMENT-5-UNLOCKED: "fix", "fix2", "actually fix", "final fix", "FINAL final fix". Art.',
      category: "humor",
      condition: { type: "resource_total", resourceId: "git_commits", amount: 5e3 },
      reward: null,
      hidden: false
    },
    {
      id: "sanity_not_found",
      name: "404 Sanity Not Found",
      description: "%ACHIEVEMENT-5-UNLOCKED: You've stared into the abyss. The abyss filed a Jira ticket.",
      category: "humor",
      condition: { type: "resource_current", resourceId: "sanity", amount: 0 },
      reward: null,
      hidden: false
    },
    {
      id: "five_nines",
      name: "Five Nines",
      description: "%ACHIEVEMENT-5-UNLOCKED: 99.999%. Five minutes of downtime per year. Your therapist sees you more than that.",
      category: "humor",
      condition: { type: "uptime_streak", days: 100, percentage: 99.999 },
      reward: null,
      hidden: false
    },
    {
      id: "the_automation_paradox",
      name: "The Automation Paradox",
      description: "%ACHIEVEMENT-5-UNLOCKED: The machines do more work than you. As intended. Probably.",
      category: "humor",
      condition: { type: "automation_exceeds_manual" },
      reward: null,
      hidden: false
    },
    {
      id: "the_cloud_is_just_someone_elses_computer",
      name: "The Cloud Is Just Someone Else's Computer",
      description: "%ACHIEVEMENT-5-UNLOCKED: You've migrated to the cloud. Congratulations, you've traded your problems for someone else's problems. At 3x the cost.",
      category: "humor",
      condition: { type: "tech", techId: "hybrid_cloud" },
      reward: null,
      hidden: false
    },
    {
      id: "konami_code",
      name: "Konami Code",
      description: "%ACHIEVEMENT-5-UNLOCKED: \u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA. +30 Sanity. You needed that.",
      category: "secret",
      condition: { type: "easter_egg", trigger: "rapid_click_terminal", count: 30 },
      reward: { type: "resource_grant", resourceId: "sanity", amount: 30 },
      hidden: true
    },
    {
      id: "the_kevin",
      name: "The Kevin",
      description: "%ACHIEVEMENT-5-UNLOCKED: Kevin's back. Hide the spreadsheets.",
      category: "secret",
      condition: { type: "easter_egg", trigger: "name_engineer_kevin" },
      reward: null,
      hidden: true
    },
    {
      id: "rubber_duck",
      name: "Rubber Duck",
      description: "%ACHIEVEMENT-5-UNLOCKED: Sometimes the best debugging tool is inaction. And a rubber duck.",
      category: "secret",
      condition: { type: "easter_egg", trigger: "idle_at_zero_bugs", duration: 300 },
      reward: null,
      hidden: true
    },
    {
      id: "packet_loss",
      name: "Packet Loss",
      description: "%ACHIEVEMENT-5-UNLOCKED: When it rains, it pours. Packets, mostly.",
      category: "secret",
      condition: { type: "multiple_events_same_day", count: 3, eventType: "negative" },
      reward: null,
      hidden: true
    },
    {
      id: "the_singularity",
      name: "The Singularity",
      description: "%ACHIEVEMENT-5-UNLOCKED: You believe in everything. The network has achieved consciousness. It agrees.",
      category: "secret",
      condition: { type: "all_philosophies_maxed" },
      reward: null,
      hidden: true
    }
  ];

  // data/prestige.json
  var prestige_default = {
    currency: {
      id: "industry_cred",
      name: "Industry Cred",
      description: "What you keep when you start over. It's not about the network you built, it's about the engineer you became. Also it's a little about the network."
    },
    resetName: "Forklift Upgrade",
    resetFlavor: "You've been recruited to build a new network from scratch. Different company. Bigger scope. But this time, you know what you're doing.",
    formula: "sqrt(total_automation_jobs * total_uptime_points / 1000)",
    formulaBonuses: [
      {
        condition: "each_era_fully_unlocked",
        bonus: 0.1,
        description: "+10% IC per era fully unlocked"
      },
      {
        condition: "each_fully_documented_network",
        bonus: 0.05,
        description: "+5% IC per Fully Documented Network"
      },
      {
        condition: "low_technical_debt",
        threshold: 50,
        bonus: 0.2,
        description: "+20% IC if Technical Debt under 50 at reset"
      },
      {
        condition: "high_happiness",
        threshold: 80,
        bonus: 0.1,
        description: "+10% IC if Happiness over 80% at reset"
      }
    ],
    resets: [
      "resources",
      "buildings",
      "workers",
      "technologies",
      "trade_relationships",
      "seasonal_progress",
      "technical_debt"
    ],
    persists: [
      "industry_cred",
      "achievements",
      "automation_philosophy",
      "prestige_upgrades"
    ],
    milestones: [
      {
        count: 1,
        title: "The Greenfield",
        narrative: "Your first new build. Everything is possible. Nothing is documented."
      },
      {
        count: 2,
        title: "The Brownfield",
        narrative: "Second time around. You know what mistakes to avoid. You'll make exciting new ones."
      },
      {
        count: 3,
        title: "The Consultant",
        narrative: "They're hiring you for your experience now. You've seen things. Terrible, terrible things."
      },
      {
        count: 4,
        title: "The Architect",
        narrative: "You don't configure devices anymore. You design networks. And review other people's configs."
      },
      {
        count: 5,
        title: "The VP",
        narrative: "You have a team. A budget. A strategy deck. You miss the terminal sometimes."
      },
      {
        count: 10,
        title: "The Legend",
        narrative: "Junior engineers speak your name in hushed tones. You once fixed a BGP issue by looking at the router."
      },
      {
        count: 20,
        title: "The Myth",
        narrative: "Some say you can subnet in your head. Others say you once debugged a spanning tree loop using only ping and intuition. Both are true."
      }
    ],
    bonuses: [
      {
        id: "experienced_hire",
        name: "Experienced Hire",
        description: "Start with 1 Network Engineer instead of 0",
        cost: 10,
        effect: {
          type: "start_with_worker",
          workerId: "network_engineer",
          amount: 1
        }
      },
      {
        id: "lessons_learned",
        name: "Lessons Learned",
        description: "+10% research speed (permanent)",
        cost: 15,
        effect: {
          type: "global_ratio",
          target: "research_speed",
          amount: 0.1
        }
      },
      {
        id: "industry_contacts",
        name: "Industry Contacts",
        description: "All trade partners start at relationship level 10",
        cost: 20,
        effect: {
          type: "trade_start_level",
          amount: 10
        }
      },
      {
        id: "known_quantity",
        name: "Known Quantity",
        description: "Start with 50 Goodwill",
        cost: 25,
        effect: {
          type: "start_with_resource",
          resourceId: "goodwill",
          amount: 50
        }
      },
      {
        id: "template_library",
        name: "Template Library",
        description: "Start with 20 Jinja Templates and 10 YAML Files",
        cost: 30,
        effect: {
          type: "start_with_resources",
          resources: [
            { resourceId: "jinja_templates", amount: 20 },
            { resourceId: "yaml_files", amount: 10 }
          ]
        }
      },
      {
        id: "muscle_memory",
        name: "Muscle Memory",
        description: "CLI Command production starts at 2x base",
        cost: 35,
        effect: {
          type: "production_multiplier",
          target: "cli_commands",
          amount: 2
        }
      },
      {
        id: "git_history",
        name: "Git History",
        description: "Start with Git Repository unlocked (no tech requirement)",
        cost: 40,
        effect: {
          type: "start_with_building_unlock",
          buildingId: "git_repository"
        }
      },
      {
        id: "reputation_precedes_you",
        name: "Reputation Precedes You",
        description: "Start in Era II",
        cost: 50,
        effect: {
          type: "start_era",
          era: "scripting_and_hope"
        }
      },
      {
        id: "published_author",
        name: "Published Author",
        description: "+20% Documentation production, start with 100 Documentation Pages",
        cost: 60,
        effect: {
          type: "combined",
          effects: [
            { type: "global_ratio", target: "documentation_pages", amount: 0.2 },
            { type: "start_with_resource", resourceId: "documentation_pages", amount: 100 }
          ]
        }
      },
      {
        id: "ccie_jncie_certified",
        name: "CCIE/JNCIE Certified",
        description: "+15% all network-related production",
        cost: 75,
        effect: {
          type: "global_ratio",
          target: "network_production",
          amount: 0.15
        }
      },
      {
        id: "open_source_maintainer",
        name: "Open Source Maintainer",
        description: "Nautobot Instance costs 50% less, +10% Nautobot output",
        cost: 80,
        effect: {
          type: "combined",
          effects: [
            { type: "building_cost_reduction", buildingId: "nautobot_instance", amount: 0.5 },
            { type: "global_ratio", target: "nautobot_output", amount: 0.1 }
          ]
        }
      },
      {
        id: "conference_speaker",
        name: "Conference Speaker",
        description: "Start with 5 Conference Passes, +30% Conference Season bonuses",
        cost: 90,
        effect: {
          type: "combined",
          effects: [
            { type: "start_with_resource", resourceId: "conference_passes", amount: 5 },
            { type: "season_bonus", season: "q3_conference", amount: 0.3 }
          ]
        }
      },
      {
        id: "cto_material",
        name: "CTO Material",
        description: "Start with 500 Budget, +20% Budget generation",
        cost: 100,
        effect: {
          type: "combined",
          effects: [
            { type: "start_with_resource", resourceId: "budget", amount: 500 },
            { type: "global_ratio", target: "budget", amount: 0.2 }
          ]
        }
      },
      {
        id: "the_architect",
        name: "The Architect",
        description: "Start with 1 Automation Architect, all buildings cost -10%",
        cost: 150,
        effect: {
          type: "combined",
          effects: [
            { type: "start_with_worker", workerId: "automation_architect", amount: 1 },
            { type: "global_building_cost_reduction", amount: 0.1 }
          ]
        }
      },
      {
        id: "network_immortal",
        name: "Network Immortal",
        description: "Start in Era III with Nautobot Instance pre-built",
        cost: 250,
        effect: {
          type: "combined",
          effects: [
            { type: "start_era", era: "the_platform" },
            { type: "start_with_building", buildingId: "nautobot_instance", amount: 1 }
          ]
        }
      }
    ],
    philosophies: [
      {
        id: "infrastructure_as_code_purists",
        name: "Infrastructure as Code Purists",
        description: "If it's not in Git, it didn't happen. Manual changes are heresy.",
        bonuses: [
          { type: "ratio", target: "git_commits", amount: 0.15, description: "+15% Git Commit production" },
          { type: "ratio", target: "config_compliance_output", amount: 0.1, description: "+10% Config Compliance output" },
          { type: "ratio", target: "change_window_tokens", amount: -0.05, description: "-5% flexibility (longer Change Windows)" }
        ]
      },
      {
        id: "clickops_pragmatists",
        name: "ClickOps Pragmatists",
        description: "Sometimes you just need to log into the GUI and click the button. And that's okay.",
        bonuses: [
          { type: "ratio", target: "building_speed", amount: 0.1, description: "+10% building speed" },
          { type: "ratio", target: "happiness", amount: 0.05, description: "+5% Happiness" },
          { type: "ratio", target: "compliance_reports", amount: -0.1, description: "-10% Compliance Reports" }
        ]
      },
      {
        id: "church_of_uptime",
        name: "The Church of Uptime",
        description: "Five nines or nothing. 99.999%. The remaining 0.001% is where your nightmares live.",
        bonuses: [
          { type: "ratio", target: "uptime_points", amount: 0.2, description: "+20% Uptime Points" },
          { type: "ratio", target: "monitoring_output", amount: 0.1, description: "+10% Monitoring output" },
          { type: "ratio", target: "change_window_tokens", amount: -0.1, description: "-10% Change Window Tokens" }
        ]
      },
      {
        id: "devops_evangelists",
        name: "DevOps Evangelists",
        description: "Developers and operators are one. Or at least they should be. The org chart disagrees.",
        bonuses: [
          { type: "ratio", target: "ci_cd_output", amount: 0.15, description: "+15% CI/CD output" },
          { type: "ratio", target: "container_images", amount: 0.1, description: "+10% Container production" },
          { type: "ratio", target: "sanity", amount: -0.05, description: "-5% Sanity" }
        ]
      },
      {
        id: "open_source_advocates",
        name: "Open Source Advocates",
        description: "Community over vendor. Freedom over lock-in. Documentation over... well, let's not talk about documentation.",
        bonuses: [
          { type: "ratio", target: "nautobot_output", amount: 0.15, description: "+15% Nautobot output" },
          { type: "ratio", target: "open_source_trading", amount: 0.1, description: "+10% trading with Open Source Community" },
          { type: "ratio", target: "vendor_trading", amount: -0.1, description: "-10% Vendor trading rates" }
        ]
      },
      {
        id: "observability_order",
        name: "The Observability Order",
        description: "You can't fix what you can't see. You can't see what you don't monitor. You can't monitor what you don't understand.",
        bonuses: [
          { type: "ratio", target: "log_entries", amount: 0.2, description: "+20% Log Entry production" },
          { type: "ratio", target: "monitoring_output", amount: 0.15, description: "+15% Monitoring" },
          { type: "ratio", target: "sanity_from_incidents", amount: 0.1, description: "+10% Sanity from resolved incidents" }
        ]
      }
    ],
    convictionRate: "1 Conviction per 100 Automation Jobs completed",
    philosophyDiminishing: [1, 0.75, 0.5]
  };

  // data/seasons.json
  var seasons_default = [
    {
      id: "q1_planning",
      name: "Q1: Planning Season",
      description: "New year, new budget proposals. Hope springs eternal.",
      startDay: 1,
      endDay: 90,
      duration: 90,
      effects: [
        { type: "ratio", target: "design_documents", amount: 0.2 }
      ],
      eventModifiers: {
        budget_allocation: 1
      }
    },
    {
      id: "q2_execution",
      name: "Q2: Execution Season",
      description: "Plans meet reality. Reality usually wins, but at least we're trying.",
      startDay: 91,
      endDay: 180,
      duration: 90,
      effects: [
        { type: "ratio", target: "all_production", amount: 0.1 }
      ],
      eventModifiers: {}
    },
    {
      id: "q3_conference",
      name: "Q3: Conference Season",
      description: "Swag bags, keynotes, and the annual existential crisis about whether you're doing it right.",
      startDay: 181,
      endDay: 270,
      duration: 90,
      effects: [
        { type: "ratio", target: "trade_bonus", amount: 0.2 },
        { type: "ratio", target: "goodwill", amount: 0.1 }
      ],
      eventModifiers: {
        conference_inspiration: 6
      }
    },
    {
      id: "q4_budget",
      name: "Q4: Budget Season",
      description: "Use it or lose it. The fiscal year ends and the spreadsheets come out. Different spreadsheets this time.",
      startDay: 271,
      endDay: 360,
      duration: 90,
      effects: [
        { type: "special", target: "budget", description: "Use it or lose it mechanics" }
      ],
      eventModifiers: {
        surprise_audit: 10,
        budget_surplus: 10
      }
    },
    {
      id: "change_freeze",
      name: "Change Freeze",
      description: "No changes allowed. The network is frozen. Bugs are frozen. Your ability to fix anything is frozen. Happy holidays.",
      startDay: 350,
      endDay: 10,
      duration: 20,
      effects: [
        { type: "flat", target: "change_window_tokens", amount: 0 },
        { type: "ratio", target: "uptime_points", amount: 0.2 },
        { type: "ratio", target: "sanity", amount: -0.2 }
      ],
      eventModifiers: {
        all_negative: 0.5
      },
      special: "No building upgrades allowed"
    },
    {
      id: "audit_season",
      name: "Audit Season",
      description: "The auditors are coming. They have clipboards. They have questions. They have no mercy.",
      startDay: 80,
      endDay: 100,
      duration: 20,
      effects: [
        { type: "ratio", target: "compliance_report_consumption", amount: 2 }
      ],
      eventModifiers: {
        surprise_audit: 4
      },
      occurrences: [
        { startDay: 80, endDay: 100 },
        { startDay: 260, endDay: 280 }
      ]
    },
    {
      id: "summer",
      name: "Summer",
      description: "Interns arrive. Vacations happen. The office is half empty but twice as productive per capita. Until the intern touches production.",
      startDay: 150,
      endDay: 240,
      duration: 90,
      effects: [
        { type: "ratio", target: "happiness", amount: 0.05 },
        { type: "ratio", target: "all_production", amount: -0.05 }
      ],
      eventModifiers: {
        intern_incident: 1,
        good_intern: 1
      },
      special: "Intern workers available"
    }
  ];

  // data/crafting.json
  var crafting_default = [
    {
      id: "document_the_network",
      name: "Document the Network",
      description: "You wrote documentation. You'll update it. Someday. Probably. Maybe.",
      inputs: [
        { resourceId: "cli_commands", amount: 30 },
        { resourceId: "coffee", amount: 3 }
      ],
      outputs: [
        { resourceId: "documentation_pages", amount: 10 }
      ],
      craftTicks: 0,
      unlockCondition: null
    },
    {
      id: "ping_sweep",
      name: "Ping Sweep",
      description: "for i in $(seq 1 254); do ping -c1 10.0.0.$i; done \u2014 not elegant, but it feels productive.",
      inputs: [
        { resourceId: "cli_commands", amount: 20 },
        { resourceId: "ip_addresses", amount: 5 }
      ],
      outputs: [
        { resourceId: "ping_responses", amount: 15 },
        { resourceId: "log_entries", amount: 5 }
      ],
      craftTicks: 0,
      unlockCondition: { type: "resource", resourceId: "ip_addresses", amount: 5 }
    },
    {
      id: "write_python_script",
      name: "Write Python Script",
      description: "import netmiko  # TODO: add error handling. Narrator: error handling was never added.",
      inputs: [
        { resourceId: "cli_commands", amount: 50 },
        { resourceId: "coffee", amount: 5 }
      ],
      outputs: [
        { resourceId: "python_scripts", amount: 10 }
      ],
      craftTicks: 0,
      unlockCondition: { type: "tech", techId: "python_basics" }
    },
    {
      id: "convert_to_yaml",
      name: "Convert to YAML",
      description: "Tabs or spaces? Spaces. Always spaces. If you used tabs, YAML has already judged you.",
      inputs: [
        { resourceId: "documentation_pages", amount: 20 },
        { resourceId: "python_scripts", amount: 10 }
      ],
      outputs: [
        { resourceId: "yaml_files", amount: 15 }
      ],
      craftTicks: 0,
      unlockCondition: { type: "tech", techId: "yaml" }
    },
    {
      id: "commit_to_git",
      name: "Commit to Git",
      description: "git add . && git commit -m 'fix'. Your future self will hate your present self.",
      inputs: [
        { resourceId: "python_scripts", amount: 15 },
        { resourceId: "yaml_files", amount: 5 }
      ],
      outputs: [
        { resourceId: "git_commits", amount: 10 }
      ],
      craftTicks: 0,
      unlockCondition: { type: "tech", techId: "version_control" }
    },
    {
      id: "craft_jinja_template",
      name: "Craft Jinja Template",
      description: "{{ interface.name }} \u2014 simple until someone needs a nested for loop with conditionals inside a macro.",
      inputs: [
        { resourceId: "yaml_files", amount: 20 },
        { resourceId: "cli_commands", amount: 10 }
      ],
      outputs: [
        { resourceId: "jinja_templates", amount: 8 }
      ],
      craftTicks: 0,
      unlockCondition: { type: "tech", techId: "configuration_templating" }
    },
    {
      id: "generate_ssh_keys",
      name: "Generate SSH Keys",
      description: "ssh-keygen -t ed25519. The passphrase is... actually, you'll forget it in three weeks anyway.",
      inputs: [
        { resourceId: "cli_commands", amount: 30 },
        { resourceId: "documentation_pages", amount: 5 }
      ],
      outputs: [
        { resourceId: "ssh_keys", amount: 5 }
      ],
      craftTicks: 0,
      unlockCondition: { type: "tech", techId: "key_based_auth" }
    },
    {
      id: "generate_api_tokens",
      name: "Generate API Tokens",
      description: "A 64-character hexadecimal string you'll accidentally commit to a public GitHub repo.",
      inputs: [
        { resourceId: "ssh_keys", amount: 10 },
        { resourceId: "python_scripts", amount: 20 }
      ],
      outputs: [
        { resourceId: "api_tokens", amount: 8 }
      ],
      craftTicks: 0,
      unlockCondition: { type: "tech", techId: "rest_apis" }
    },
    {
      id: "query_api",
      name: "Query API",
      description: "GET /api/v1/devices/. 200 OK. 47MB of JSON. You wanted three fields.",
      inputs: [
        { resourceId: "api_tokens", amount: 10 },
        { resourceId: "python_scripts", amount: 15 }
      ],
      outputs: [
        { resourceId: "json_blobs", amount: 20 }
      ],
      craftTicks: 0,
      unlockCondition: { type: "tech", techId: "rest_apis" }
    },
    {
      id: "build_container",
      name: "Build Container Image",
      description: "FROM python:3.11-slim. The Dockerfile has 47 layers. The image is 2.3GB. 'Slim.'",
      inputs: [
        { resourceId: "python_scripts", amount: 30 },
        { resourceId: "yaml_files", amount: 10 },
        { resourceId: "git_commits", amount: 5 }
      ],
      outputs: [
        { resourceId: "container_images", amount: 5 }
      ],
      craftTicks: 15,
      unlockCondition: { type: "tech", techId: "containers" }
    },
    {
      id: "write_ansible_playbook",
      name: "Write Ansible Playbook",
      description: "- hosts: all\n  gather_facts: no\n  # Because who needs facts when you have confidence?",
      inputs: [
        { resourceId: "yaml_files", amount: 25 },
        { resourceId: "jinja_templates", amount: 15 },
        { resourceId: "ssh_keys", amount: 10 }
      ],
      outputs: [
        { resourceId: "ansible_playbooks", amount: 8 }
      ],
      craftTicks: 10,
      unlockCondition: { type: "tech", techId: "configuration_management" }
    },
    {
      id: "open_pull_request",
      name: "Open Pull Request",
      description: "LGTM. Approved without reading. The CI pipeline is the real reviewer.",
      inputs: [
        { resourceId: "git_commits", amount: 20 },
        { resourceId: "documentation_pages", amount: 10 }
      ],
      outputs: [
        { resourceId: "pull_requests", amount: 5 }
      ],
      craftTicks: 5,
      unlockCondition: { type: "tech", techId: "continuous_integration" }
    },
    {
      id: "render_golden_config",
      name: "Render Golden Config",
      description: "The config is golden. The device running firmware from 2017 disagrees.",
      inputs: [
        { resourceId: "jinja_templates", amount: 15 },
        { resourceId: "yaml_files", amount: 20 },
        { resourceId: "ansible_playbooks", amount: 10 }
      ],
      outputs: [
        { resourceId: "golden_configs", amount: 5 }
      ],
      craftTicks: 20,
      unlockCondition: { type: "tech", techId: "config_compliance" }
    },
    {
      id: "create_automation_job",
      name: "Create Automation Job",
      description: "Scheduled for 2 AM. The maintenance window. The engineer's witching hour.",
      inputs: [
        { resourceId: "ansible_playbooks", amount: 10 },
        { resourceId: "python_scripts", amount: 15 },
        { resourceId: "api_tokens", amount: 5 }
      ],
      outputs: [
        { resourceId: "automation_jobs", amount: 8 }
      ],
      craftTicks: 15,
      unlockCondition: { type: "tech", techId: "nautobot_jobs" }
    },
    {
      id: "run_config_diff",
      name: "Run Config Diff",
      description: "Expected: 0 diffs. Actual: 247 diffs. Your eye twitches.",
      inputs: [
        { resourceId: "golden_configs", amount: 5 },
        { resourceId: "cli_commands", amount: 10 },
        { resourceId: "automation_jobs", amount: 5 }
      ],
      outputs: [
        { resourceId: "config_diffs", amount: 10 }
      ],
      craftTicks: 10,
      unlockCondition: { type: "tech", techId: "config_compliance" }
    },
    {
      id: "write_design_document",
      name: "Write Design Document",
      description: "A 40-page document that 3 people will read and everyone will reference incorrectly.",
      inputs: [
        { resourceId: "documentation_pages", amount: 30 },
        { resourceId: "json_blobs", amount: 10 },
        { resourceId: "compliance_reports", amount: 5 }
      ],
      outputs: [
        { resourceId: "design_documents", amount: 3 }
      ],
      craftTicks: 25,
      unlockCondition: { type: "tech", techId: "source_of_truth" }
    },
    {
      id: "run_compliance_audit",
      name: "Run Compliance Audit",
      description: "The auditor smiles. This is not reassuring.",
      inputs: [
        { resourceId: "config_diffs", amount: 10 },
        { resourceId: "golden_configs", amount: 5 },
        { resourceId: "log_entries", amount: 20 }
      ],
      outputs: [
        { resourceId: "compliance_reports", amount: 5 }
      ],
      craftTicks: 20,
      unlockCondition: { type: "tech", techId: "config_compliance" }
    },
    {
      id: "write_terraform_plan",
      name: "Write Terraform Plan",
      description: "terraform plan: 47 to add, 0 to change, 0 to destroy. terraform apply: 'Error: Invalid provider configuration.'",
      inputs: [
        { resourceId: "yaml_files", amount: 20 },
        { resourceId: "container_images", amount: 10 },
        { resourceId: "api_tokens", amount: 15 }
      ],
      outputs: [
        { resourceId: "terraform_plans", amount: 8 }
      ],
      craftTicks: 15,
      unlockCondition: { type: "tech", techId: "infrastructure_as_code" }
    },
    {
      id: "configure_webhook",
      name: "Configure Webhook",
      description: "POST /webhook/. 200 OK. The event fires. The automation runs. Nobody knows who set this up.",
      inputs: [
        { resourceId: "api_tokens", amount: 10 },
        { resourceId: "json_blobs", amount: 20 },
        { resourceId: "automation_jobs", amount: 5 }
      ],
      outputs: [
        { resourceId: "webhook_events", amount: 12 }
      ],
      craftTicks: 10,
      unlockCondition: { type: "tech", techId: "event_driven_automation" }
    },
    {
      id: "run_network_tests",
      name: "Run Network Tests",
      description: "All 200 tests pass. You deploy. The one scenario you didn't test fails.",
      inputs: [
        { resourceId: "python_scripts", amount: 15 },
        { resourceId: "ansible_playbooks", amount: 10 },
        { resourceId: "container_images", amount: 5 }
      ],
      outputs: [
        { resourceId: "test_results", amount: 12 }
      ],
      craftTicks: 15,
      unlockCondition: { type: "tech", techId: "network_testing" }
    },
    {
      id: "attend_a_meeting",
      name: "Attend a Meeting",
      description: "Could've been an email. Wasn't. You now have action items you'll forget by tomorrow and minutes nobody will read.",
      inputs: [
        { resourceId: "coffee", amount: 5 },
        { resourceId: "documentation_pages", amount: 10 }
      ],
      outputs: [
        { resourceId: "meeting_minutes", amount: 8 }
      ],
      craftTicks: 10,
      unlockCondition: { type: "era", era: "scripting_and_hope" }
    },
    {
      id: "complete_site_documentation",
      name: "Complete Site Documentation",
      description: "Every port documented. Every circuit labeled. Every rack elevation drawn. It's beautiful. It's also already out of date.",
      inputs: [
        { resourceId: "documentation_pages", amount: 100 },
        { resourceId: "golden_configs", amount: 20 },
        { resourceId: "design_documents", amount: 10 },
        { resourceId: "compliance_reports", amount: 10 }
      ],
      outputs: [
        { resourceId: "fully_documented_networks", amount: 1 }
      ],
      craftTicks: 50,
      unlockCondition: { type: "era", era: "multi_site_empire" }
    }
  ];

  // js/engine/dataLoader.js
  function buildMap(arr) {
    const map = /* @__PURE__ */ new Map();
    for (const item of arr) {
      map.set(item.id, Object.freeze(item));
    }
    return map;
  }
  function validate(d) {
    for (const [id, building] of d.buildings) {
      for (const cost of building.costs) {
        if (!d.resources.has(cost.resourceId)) {
          console.warn(`Building "${id}" references unknown resource "${cost.resourceId}" in costs`);
        }
      }
      for (const effect of building.effects) {
        if ((effect.type === "production" || effect.type === "cap_increase") && !d.resources.has(effect.resourceId)) {
          console.warn(`Building "${id}" references unknown resource "${effect.resourceId}" in effects`);
        }
      }
      if (building.unlockCondition) {
        validateCondition(d, `building "${id}"`, building.unlockCondition);
      }
    }
    for (const [id, tech] of d.technologies) {
      for (const prereq of tech.prerequisites) {
        if (!d.technologies.has(prereq)) {
          console.warn(`Technology "${id}" references unknown prerequisite "${prereq}"`);
        }
      }
      for (const cost of tech.costs) {
        if (!d.resources.has(cost.resourceId)) {
          console.warn(`Technology "${id}" references unknown resource "${cost.resourceId}" in costs`);
        }
      }
      for (const effect of tech.effects || []) {
        if ((effect.type === "production" || effect.type === "cap_increase") && !d.resources.has(effect.resourceId)) {
          console.warn(`Technology "${id}" references unknown resource "${effect.resourceId}" in effects`);
        }
      }
      if (tech.unlocks) {
        for (const bid of tech.unlocks.buildings || []) {
          if (!d.buildings.has(bid)) {
            console.warn(`Technology "${id}" unlocks unknown building "${bid}"`);
          }
        }
        for (const tid of tech.unlocks.technologies || []) {
          if (!d.technologies.has(tid)) {
            console.warn(`Technology "${id}" unlocks unknown technology "${tid}"`);
          }
        }
      }
    }
    for (const [id, worker] of d.workers) {
      for (const p of worker.produces) {
        if (!d.resources.has(p.resourceId)) {
          console.warn(`Worker "${id}" produces unknown resource "${p.resourceId}"`);
        }
      }
      for (const c of worker.consumes) {
        if (!d.resources.has(c.resourceId)) {
          console.warn(`Worker "${id}" consumes unknown resource "${c.resourceId}"`);
        }
      }
    }
    for (const [id, upgrade] of d.upgrades) {
      for (const cost of upgrade.costs) {
        if (!d.resources.has(cost.resourceId)) {
          console.warn(`Upgrade "${id}" references unknown resource "${cost.resourceId}" in costs`);
        }
      }
    }
    for (const [partnerId, partner] of d.trades) {
      if (partner.unlockCondition) {
        validateCondition(d, `trade partner "${partnerId}"`, partner.unlockCondition);
      }
      for (const trade of partner.trades) {
        for (const give of trade.give) {
          if (!d.resources.has(give.resourceId)) {
            console.warn(`Trade "${partnerId}/${trade.id}" references unknown give resource "${give.resourceId}"`);
          }
        }
        for (const receive of trade.receive) {
          if (receive.resourceId && !d.resources.has(receive.resourceId)) {
            console.warn(`Trade "${partnerId}/${trade.id}" references unknown receive resource "${receive.resourceId}"`);
          }
        }
      }
    }
    for (const [eventId, event] of d.events) {
      if (event.conditions) {
        validateCondition(d, `event "${eventId}"`, event.conditions);
      }
      for (const effect of event.effects || []) {
        if (effect.type === "resource" && !d.resources.has(effect.resourceId)) {
          console.warn(`Event "${eventId}" references unknown resource "${effect.resourceId}"`);
        }
      }
      for (const choice of event.choices || []) {
        for (const cost of choice.costs || []) {
          if (!d.resources.has(cost.resourceId)) {
            console.warn(`Event "${eventId}" choice "${choice.id}" references unknown cost resource "${cost.resourceId}"`);
          }
        }
        if (choice.conditions) {
          validateCondition(d, `event "${eventId}" choice "${choice.id}"`, choice.conditions);
        }
      }
    }
    for (const [id, recipe] of d.crafting) {
      for (const input of recipe.inputs) {
        if (!d.resources.has(input.resourceId)) {
          console.warn(`Crafting recipe "${id}" references unknown input resource "${input.resourceId}"`);
        }
      }
      for (const output of recipe.outputs) {
        if (!d.resources.has(output.resourceId)) {
          console.warn(`Crafting recipe "${id}" references unknown output resource "${output.resourceId}"`);
        }
      }
      if (recipe.unlockCondition) {
        validateCondition(d, `crafting recipe "${id}"`, recipe.unlockCondition);
      }
    }
  }
  function validateCondition(d, context, cond) {
    if (!cond) return;
    if (cond.type === "resource" && !d.resources.has(cond.resourceId)) {
      console.warn(`${context} unlock condition references unknown resource "${cond.resourceId}"`);
    }
    if (cond.type === "tech" && !d.technologies.has(cond.techId)) {
      console.warn(`${context} unlock condition references unknown technology "${cond.techId}"`);
    }
    if (cond.type === "building" && !d.buildings.has(cond.buildingId)) {
      console.warn(`${context} unlock condition references unknown building "${cond.buildingId}"`);
    }
  }
  var data = {
    resources: buildMap(resources_default),
    buildings: buildMap(buildings_default),
    workers: buildMap(workers_default),
    technologies: buildMap(technologies_default),
    upgrades: buildMap(upgrades_default),
    trades: buildMap(trades_default),
    events: buildMap(events_default),
    achievements: buildMap(achievements_default),
    prestige: Object.freeze(prestige_default),
    seasons: seasons_default.map((item) => Object.freeze(item)),
    crafting: buildMap(crafting_default)
  };
  validate(data);

  // js/engine/eventEmitter.js
  var EventEmitter = class {
    constructor() {
      this._listeners = {};
    }
    on(event, fn) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(fn);
      return () => this.off(event, fn);
    }
    off(event, fn) {
      const list = this._listeners[event];
      if (!list) return;
      const idx = list.indexOf(fn);
      if (idx !== -1) list.splice(idx, 1);
    }
    emit(event, ...args) {
      const list = this._listeners[event];
      if (!list) return;
      for (const fn of list) {
        fn(...args);
      }
    }
    once(event, fn) {
      const wrapper = (...args) => {
        this.off(event, wrapper);
        fn(...args);
      };
      return this.on(event, wrapper);
    }
  };
  var emitter = new EventEmitter();

  // js/engine/calendarManager.js
  var cachedActiveSeasons = [];
  var cachedRatios = /* @__PURE__ */ new Map();
  var cachedEventModifiers = /* @__PURE__ */ new Map();
  function isDayInRange(day, startDay, endDay) {
    if (startDay <= endDay) {
      return day >= startDay && day <= endDay;
    }
    return day >= startDay || day <= endDay;
  }
  function recalculate() {
    const day = gameState.time.currentDay;
    const newActive = [];
    for (const season of data.seasons) {
      let active = false;
      if (season.occurrences && season.occurrences.length > 0) {
        for (const occ of season.occurrences) {
          if (isDayInRange(day, occ.startDay, occ.endDay)) {
            active = true;
            break;
          }
        }
      } else {
        active = isDayInRange(day, season.startDay, season.endDay);
      }
      if (active) newActive.push(season);
    }
    const oldIds = gameState.calendar.activeSeasons;
    const newIds = newActive.map((s) => s.id);
    const changed = oldIds.length !== newIds.length || oldIds.some((id, i) => id !== newIds[i]);
    cachedActiveSeasons = newActive;
    gameState.calendar.activeSeasons = newIds;
    cachedRatios = /* @__PURE__ */ new Map();
    cachedEventModifiers = /* @__PURE__ */ new Map();
    for (const season of newActive) {
      for (const effect of season.effects || []) {
        if (effect.type === "ratio") {
          cachedRatios.set(effect.target, (cachedRatios.get(effect.target) || 0) + effect.amount);
        }
      }
      for (const [eventId, multiplier] of Object.entries(season.eventModifiers || {})) {
        cachedEventModifiers.set(eventId, (cachedEventModifiers.get(eventId) || 1) * multiplier);
      }
    }
    if (changed) {
      const budget = gameState.resources.budget;
      if (budget) budget.amount = budget.cap;
      emitter.emit("seasonChanged", { activeSeasons: newIds });
    }
  }
  function init() {
    recalculate();
  }
  function tick() {
    recalculate();
  }
  function isSeasonActive(seasonId) {
    return gameState.calendar.activeSeasons.includes(seasonId);
  }
  function getSeasonRatioModifier(target) {
    return cachedRatios.get(target) || 0;
  }
  function getEventProbabilityMultiplier(eventId) {
    return cachedEventModifiers.get(eventId) || 1;
  }
  function getActiveSeasons() {
    return cachedActiveSeasons;
  }

  // js/engine/unlockManager.js
  var CATEGORY_NAMES = {
    resources: "resources",
    buildings: "buildings",
    technologies: "technologies",
    upgrades: "upgrades",
    workers: "workers",
    trades: "trades",
    crafting: "crafting"
  };
  function evaluateCondition(cond) {
    if (cond === null || cond === void 0) return true;
    switch (cond.type) {
      case "resource": {
        const res = gameState.resources[cond.resourceId];
        return res != null && res.amount >= cond.amount;
      }
      case "tech": {
        const tech = gameState.technologies[cond.techId];
        return tech != null && tech.researched;
      }
      case "era": {
        return isEraReached(cond.era);
      }
      case "building": {
        const b = gameState.buildings[cond.buildingId];
        return b != null && b.count >= cond.minCount;
      }
      case "season": {
        return isSeasonActive(cond.season);
      }
      default:
        return false;
    }
  }
  function isEraReached(era) {
    for (const [, def] of data.technologies) {
      if (def.era === era && gameState.technologies[def.id]?.researched) return true;
    }
    for (const [, def] of data.buildings) {
      if (def.era === era && (gameState.buildings[def.id]?.count || 0) > 0) return true;
    }
    if (era === "the_terminal") return true;
    return false;
  }
  function checkCategory(entityMap, unlockedSet, categoryName, extraCheck) {
    for (const [id, def] of entityMap) {
      if (unlockedSet.has(id)) continue;
      if (!evaluateCondition(def.unlockCondition)) continue;
      if (extraCheck && !extraCheck(id, def)) continue;
      unlockedSet.add(id);
      emitter.emit("unlockChanged", { category: categoryName, id });
    }
  }
  function init2() {
    tick2();
  }
  function tick2() {
    checkCategory(data.resources, gameState.unlocked.resources, CATEGORY_NAMES.resources);
    checkCategory(data.buildings, gameState.unlocked.buildings, CATEGORY_NAMES.buildings);
    checkCategory(data.technologies, gameState.unlocked.technologies, CATEGORY_NAMES.technologies, (id, def) => {
      for (const prereq of def.prerequisites) {
        if (!gameState.technologies[prereq]?.researched) return false;
      }
      return true;
    });
    checkCategory(data.upgrades, gameState.unlocked.upgrades, CATEGORY_NAMES.upgrades);
    checkCategory(data.workers, gameState.unlocked.workers, CATEGORY_NAMES.workers);
    checkCategory(data.trades, gameState.unlocked.trades, CATEGORY_NAMES.trades);
    if (data.crafting) {
      checkCategory(data.crafting, gameState.unlocked.crafting, CATEGORY_NAMES.crafting);
    }
  }

  // js/engine/achievementManager.js
  var ERA_ORDER = [
    "the_terminal",
    "scripting_and_hope",
    "the_platform",
    "full_netdevops",
    "multi_site_empire",
    "the_cloud"
  ];
  var ratioBonusCache = /* @__PURE__ */ new Map();
  var researchSpeedBonus = 0;
  var happinessBonus = 0;
  function init3() {
    if (!gameState.achievements) {
      gameState.achievements = { unlocked: {} };
    }
    rebuildBonusCache();
  }
  function tick3() {
    for (const [id, def] of data.achievements) {
      if (gameState.achievements.unlocked[id]) continue;
      if (def.condition.type === "easter_egg") continue;
      if (checkCondition(def.condition)) {
        unlock(id, def);
      }
    }
  }
  function checkCondition(cond) {
    switch (cond.type) {
      case "resource_total": {
        const res = gameState.resources[cond.resourceId];
        return res != null && res.lifetimeTotal >= cond.amount;
      }
      case "resource_current": {
        const res = gameState.resources[cond.resourceId];
        if (!res) return false;
        if (cond.amount === 0) return res.amount <= 0;
        return res.amount >= cond.amount;
      }
      case "building": {
        const b = gameState.buildings[cond.buildingId];
        return b != null && b.count >= cond.minCount;
      }
      case "tech": {
        const t = gameState.technologies[cond.techId];
        return t != null && t.researched;
      }
      case "prestige_reset":
        return (gameState.prestige?.totalResets || 0) >= cond.count;
      case "event_experienced":
        return gameState.statistics.eventsExperienced.includes(cond.eventId);
      case "all_technologies_researched": {
        for (const [, tech] of data.technologies) {
          if (!gameState.technologies[tech.id]?.researched) return false;
        }
        return true;
      }
      case "buildings_in_all_eras": {
        for (const era of ERA_ORDER) {
          let hasBuilding = false;
          for (const [, bDef] of data.buildings) {
            if (bDef.era === era && (gameState.buildings[bDef.id]?.count || 0) > 0) {
              hasBuilding = true;
              break;
            }
          }
          if (!hasBuilding) return false;
        }
        return true;
      }
      case "total_workers":
        return (gameState.population?.total || 0) >= cond.amount;
      case "uptime_streak": {
        const streak = gameState.statistics.currentUptimeStreak || 0;
        return streak >= cond.days;
      }
      case "multiple_events_same_day": {
        const history = gameState.events?.eventHistory || [];
        const dayCounts = {};
        for (const entry of history) {
          const eventDef = data.events.get(entry.eventId);
          if (!eventDef) continue;
          if (cond.eventType && eventDef.type !== cond.eventType) continue;
          const key = `${entry.day}-${entry.year}`;
          dayCounts[key] = (dayCounts[key] || 0) + 1;
          if (dayCounts[key] >= cond.count) return true;
        }
        return false;
      }
      case "all_philosophies_maxed": {
        const phils = data.prestige.philosophies;
        if (!phils || !gameState.philosophy?.allocations) return false;
        for (const phil of phils) {
          if ((gameState.philosophy.allocations[phil.id] || 0) <= 0) return false;
        }
        return true;
      }
      case "all_trade_partners": {
        for (const [id] of data.trades) {
          if ((gameState.trades[id]?.totalTradesCompleted || 0) <= 0) return false;
        }
        return true;
      }
      case "automation_exceeds_manual": {
        const auto = gameState.resources.automation_jobs;
        const manual = gameState.resources.cli_commands;
        return auto && manual && auto.amount > manual.amount;
      }
      case "change_freeze_high_uptime": {
        if (!isSeasonActive("change_freeze")) return false;
        const uptime = gameState.resources.uptime_points;
        if (!uptime) return false;
        return uptime.amount / uptime.cap * 100 >= (cond.uptimePercent || 90);
      }
      default:
        return false;
    }
  }
  function unlock(id, def) {
    gameState.achievements.unlocked[id] = {
      tick: gameState.time.totalTicks,
      timestamp: Date.now()
    };
    if (def.reward) {
      applyReward(def.reward);
      rebuildBonusCache();
    }
    emitter.emit("achievementUnlocked", { id, def });
    emitter.emit("logMessage", {
      text: def.description,
      type: "success",
      category: "achievement"
    });
  }
  function applyReward(reward) {
    switch (reward.type) {
      case "resource_grant":
        addResource(reward.resourceId, reward.amount);
        break;
      default:
        break;
    }
  }
  function rebuildBonusCache() {
    ratioBonusCache = /* @__PURE__ */ new Map();
    researchSpeedBonus = 0;
    happinessBonus = 0;
    for (const [id, def] of data.achievements) {
      if (!gameState.achievements.unlocked[id]) continue;
      if (!def.reward) continue;
      switch (def.reward.type) {
        case "production_bonus": {
          const target = def.reward.target;
          if (target === "all_production") {
            for (const [rid] of data.resources) {
              ratioBonusCache.set(rid, (ratioBonusCache.get(rid) || 0) + def.reward.amount);
            }
          } else {
            ratioBonusCache.set(target, (ratioBonusCache.get(target) || 0) + def.reward.amount);
          }
          break;
        }
        case "research_speed":
          researchSpeedBonus += def.reward.amount;
          break;
        case "happiness_bonus":
          happinessBonus += def.reward.amount * 100;
          break;
      }
    }
  }
  function triggerEasterEgg(triggerId) {
    for (const [id, def] of data.achievements) {
      if (gameState.achievements.unlocked[id]) continue;
      if (def.condition.type !== "easter_egg") continue;
      if (def.condition.trigger !== triggerId) continue;
      unlock(id, def);
    }
  }
  function isUnlocked(id) {
    return !!gameState.achievements.unlocked[id];
  }
  function getAchievementCount() {
    const unlocked = Object.keys(gameState.achievements.unlocked).length;
    let total = 0;
    let hiddenRemaining = 0;
    for (const [id, def] of data.achievements) {
      total++;
      if (def.hidden && !gameState.achievements.unlocked[id]) {
        hiddenRemaining++;
      }
    }
    return { unlocked, total, hiddenRemaining };
  }
  function getAchievementRatioBonuses() {
    return ratioBonusCache;
  }
  function getAchievementResearchSpeedBonus() {
    return researchSpeedBonus;
  }
  function getAchievementHappinessBonus() {
    return happinessBonus;
  }

  // js/engine/researchManager.js
  function canResearch(techId) {
    if (gameState.research.activeId !== null) return false;
    if (!gameState.unlocked.technologies.has(techId)) return false;
    const techState = gameState.technologies[techId];
    if (!techState || techState.researched) return false;
    const def = data.technologies.get(techId);
    if (!def) return false;
    for (const prereq of def.prerequisites) {
      if (!gameState.technologies[prereq]?.researched) return false;
    }
    for (const cost of def.costs) {
      const res = getResource(cost.resourceId);
      if (!res || res.amount < cost.amount) return false;
    }
    return true;
  }
  function startResearch(techId) {
    if (!canResearch(techId)) return { success: false };
    const def = data.technologies.get(techId);
    for (const cost of def.costs) {
      addResource(cost.resourceId, -cost.amount);
    }
    gameState.research.activeId = techId;
    gameState.technologies[techId].researchProgress = 0;
    emitter.emit("researchStarted", { techId });
    emitter.emit("logMessage", {
      text: `%RESEARCH-5-START: Researching ${def.name}...`,
      type: "info",
      category: "research"
    });
    return { success: true };
  }
  function cancelResearch() {
    const techId = gameState.research.activeId;
    if (techId === null) return;
    const def = data.technologies.get(techId);
    gameState.research.activeId = null;
    emitter.emit("researchCancelled", { techId });
    emitter.emit("logMessage", {
      text: `%RESEARCH-4-CANCEL: ${def?.name || techId} research cancelled. Resources not refunded.`,
      type: "warning",
      category: "research"
    });
  }
  function completeResearch(techId) {
    const def = data.technologies.get(techId);
    gameState.technologies[techId].researched = true;
    gameState.research.activeId = null;
    gameState.statistics.totalTechsResearched++;
    recalculateRates();
    tick2();
    emitter.emit("researchCompleted", { techId });
    emitter.emit("logMessage", {
      text: `%RESEARCH-5-COMPLETE: ${def.name} research complete!`,
      type: "success",
      category: "research"
    });
    if (def.flavorOnResearch) {
      emitter.emit("logMessage", {
        text: def.flavorOnResearch,
        type: "info",
        category: "research"
      });
    }
  }
  function tick4() {
    const activeId = gameState.research.activeId;
    if (activeId === null) return;
    const def = data.technologies.get(activeId);
    if (!def) return;
    const speedBonus = getPrestigeResearchSpeedBonus() + getAchievementResearchSpeedBonus();
    gameState.technologies[activeId].researchProgress += 1 + speedBonus;
    if (gameState.technologies[activeId].researchProgress >= def.researchTicks) {
      completeResearch(activeId);
    }
  }
  function getActiveResearch() {
    return gameState.research.activeId;
  }
  function getResearchProgress(techId) {
    const techState = gameState.technologies[techId];
    const def = data.technologies.get(techId);
    if (!techState || !def) return { current: 0, total: 0, percent: 0 };
    return {
      current: techState.researchProgress,
      total: def.researchTicks,
      percent: def.researchTicks > 0 ? techState.researchProgress / def.researchTicks : 0
    };
  }

  // js/engine/craftingManager.js
  var activeCrafts = /* @__PURE__ */ new Map();
  function canCraft(recipeId, count = 1) {
    if (count <= 0) return false;
    if (!gameState.unlocked.crafting.has(recipeId)) return false;
    const def = data.crafting.get(recipeId);
    if (!def) return false;
    if (def.craftTicks > 0 && activeCrafts.has(recipeId)) return false;
    for (const input of def.inputs) {
      const res = getResource(input.resourceId);
      if (!res || res.amount < input.amount * count) return false;
    }
    return true;
  }
  function getMaxCraftable(recipeId) {
    const def = data.crafting.get(recipeId);
    if (!def) return 0;
    if (!gameState.unlocked.crafting.has(recipeId)) return 0;
    if (def.craftTicks > 0 && activeCrafts.has(recipeId)) return 0;
    let max = Infinity;
    for (const input of def.inputs) {
      const res = getResource(input.resourceId);
      if (!res) return 0;
      max = Math.min(max, Math.floor(res.amount / input.amount));
    }
    return max === Infinity ? 0 : max;
  }
  function craft(recipeId, count = 1) {
    if (!canCraft(recipeId, count)) return { success: false };
    const def = data.crafting.get(recipeId);
    for (const input of def.inputs) {
      addResource(input.resourceId, -input.amount * count);
    }
    if (def.craftTicks === 0) {
      for (const output of def.outputs) {
        addResource(output.resourceId, output.amount * count);
      }
      emitter.emit("craftCompleted", { recipeId, count });
      emitter.emit("logMessage", {
        text: `%CRAFT-5-COMPLETE: ${def.name} x${count} crafted.`,
        type: "success",
        category: "crafting"
      });
    } else {
      activeCrafts.set(recipeId, { count, progress: 0 });
      emitter.emit("craftStarted", { recipeId, count });
      emitter.emit("logMessage", {
        text: `%CRAFT-5-START: ${def.name} x${count} \u2014 crafting in progress...`,
        type: "info",
        category: "crafting"
      });
    }
    return { success: true };
  }
  function craftAll(recipeId) {
    const max = getMaxCraftable(recipeId);
    if (max <= 0) return { success: false };
    return craft(recipeId, max);
  }
  function tick5() {
    for (const [recipeId, state] of activeCrafts) {
      state.progress++;
      const def = data.crafting.get(recipeId);
      if (!def) {
        activeCrafts.delete(recipeId);
        continue;
      }
      if (state.progress >= def.craftTicks) {
        for (const output of def.outputs) {
          addResource(output.resourceId, output.amount * state.count);
        }
        activeCrafts.delete(recipeId);
        emitter.emit("craftCompleted", { recipeId, count: state.count });
        emitter.emit("logMessage", {
          text: `%CRAFT-5-COMPLETE: ${def.name} x${state.count} finished!`,
          type: "success",
          category: "crafting"
        });
      }
    }
  }
  function isRecipeCrafting(recipeId) {
    return activeCrafts.has(recipeId);
  }
  function getCraftProgress(recipeId) {
    const state = activeCrafts.get(recipeId);
    const def = data.crafting.get(recipeId);
    if (!state || !def) return { current: 0, total: 0, percent: 0 };
    return {
      current: state.progress,
      total: def.craftTicks,
      percent: def.craftTicks > 0 ? state.progress / def.craftTicks : 0
    };
  }

  // js/engine/saveManager.js
  var STORAGE_KEY = "nautobot_game_save";
  var autoSaveInterval = null;
  function serializeState() {
    const clone = JSON.parse(JSON.stringify(gameState, (key, value) => {
      if (value instanceof Set) return [...value];
      return value;
    }));
    return clone;
  }
  function deserializeUnlocked(raw) {
    const result = {};
    for (const key of ["resources", "buildings", "technologies", "upgrades", "workers", "trades", "crafting"]) {
      result[key] = new Set(raw[key] || []);
    }
    return result;
  }
  function mergeEntities(target, saved) {
    for (const id of Object.keys(saved)) {
      if (target[id]) {
        Object.assign(target[id], saved[id]);
      }
    }
  }
  function applyState(state) {
    mergeEntities(gameState.resources, state.resources);
    mergeEntities(gameState.buildings, state.buildings);
    mergeEntities(gameState.technologies, state.technologies);
    mergeEntities(gameState.upgrades, state.upgrades);
    mergeEntities(gameState.workers, state.workers);
    gameState.unlocked = deserializeUnlocked(state.unlocked);
    gameState.time = state.time;
    gameState.statistics = state.statistics;
    gameState.meta = state.meta;
    gameState.research = state.research || { activeId: null };
    if (state.crafting) mergeEntities(gameState.crafting, state.crafting);
    if (state.trades) mergeEntities(gameState.trades, state.trades);
    if (state.events) {
      gameState.events = state.events;
      if (!gameState.events.eventQueue) gameState.events.eventQueue = [];
      if (!gameState.events.timedEffects) gameState.events.timedEffects = [];
      if (!gameState.events.cooldowns) gameState.events.cooldowns = {};
      if (!gameState.events.eventHistory) gameState.events.eventHistory = [];
    }
    if (state.calendar) gameState.calendar = state.calendar;
    if (state.prestige) gameState.prestige = state.prestige;
    if (state.philosophy) gameState.philosophy = state.philosophy;
    if (state.achievements) gameState.achievements = state.achievements;
    if (state.population) {
      gameState.population = state.population;
    } else {
      let total = 0;
      for (const id of Object.keys(state.workers || {})) {
        total += state.workers[id]?.count || 0;
      }
      gameState.population = {
        total,
        free: 0,
        happiness: 100,
        names: []
      };
    }
  }
  function save() {
    gameState.meta.lastSaveTimestamp = Date.now();
    const saveObj = {
      version: 1,
      timestamp: Date.now(),
      state: serializeState()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObj));
    } catch (err) {
      console.error("Failed to save:", err);
    }
  }
  var pendingOfflineMs = 0;
  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      const saveObj = JSON.parse(raw);
      if (saveObj.version !== 1) {
        console.warn(`Unknown save version: ${saveObj.version}`);
        return false;
      }
      applyState(saveObj.state);
      pendingOfflineMs = Math.max(0, Date.now() - saveObj.timestamp);
      return true;
    } catch (err) {
      console.error("Failed to load save:", err);
      return false;
    }
  }
  function applyOfflineProgress() {
    if (pendingOfflineMs <= 0) return;
    recalculateRates();
    const elapsedTicks = Math.floor(pendingOfflineMs / 200);
    const cappedTicks = Math.min(elapsedTicks, 18e3);
    const effectiveTicks = Math.floor(cappedTicks * 0.5);
    if (effectiveTicks > 0) {
      for (let i = 0; i < effectiveTicks; i++) {
        tick6();
        tick4();
        tick5();
      }
      if (gameState.events?.timedEffects) {
        gameState.events.timedEffects = gameState.events.timedEffects.filter(
          (e) => e.expiresAtTick === Infinity || e.expiresAtTick > gameState.time.totalTicks
        );
      }
      const minutes = Math.round(pendingOfflineMs / 6e4);
      console.log(`Offline for ~${minutes} min. Applied ${effectiveTicks} ticks at 50% rate.`);
    }
    pendingOfflineMs = 0;
  }
  function exportSave() {
    gameState.meta.lastSaveTimestamp = Date.now();
    const saveObj = {
      version: 1,
      timestamp: Date.now(),
      state: serializeState()
    };
    return btoa(JSON.stringify(saveObj));
  }
  function importSave(base64String) {
    try {
      const saveObj = JSON.parse(atob(base64String));
      if (saveObj.version !== 1) {
        console.warn(`Unknown save version: ${saveObj.version}`);
        return false;
      }
      applyState(saveObj.state);
      recalculateRates();
      return true;
    } catch (err) {
      console.error("Failed to import save:", err);
      return false;
    }
  }
  function wipeSave() {
    localStorage.removeItem(STORAGE_KEY);
    if (data) {
      resetState(data);
      recalculateRates();
    }
  }
  function startAutoSave(intervalSec) {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    const ms = (intervalSec || 30) * 1e3;
    autoSaveInterval = setInterval(save, ms);
    window.addEventListener("beforeunload", save);
  }
  function stopAutoSave() {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = null;
    }
    window.removeEventListener("beforeunload", save);
  }

  // js/engine/prestigeManager.js
  var ERA_ORDER2 = [
    "the_terminal",
    "scripting_and_hope",
    "the_platform",
    "full_netdevops",
    "multi_site_empire",
    "the_cloud"
  ];
  var ratioBonusCache2 = /* @__PURE__ */ new Map();
  var baseMultiplierCache = /* @__PURE__ */ new Map();
  var buildingCostReductionCache = /* @__PURE__ */ new Map();
  var globalBuildingCostReduction = 0;
  var researchSpeedBonus2 = 0;
  function init4() {
    if (!gameState.prestige) {
      gameState.prestige = {
        industryCred: 0,
        totalResets: 0,
        purchasedUpgrades: {},
        currentRunStartTick: 0,
        currentRunStartTime: Date.now(),
        runHistory: []
      };
    }
    if (!gameState.prestige.runHistory) gameState.prestige.runHistory = [];
    if (!gameState.prestige.purchasedUpgrades) gameState.prestige.purchasedUpgrades = {};
    rebuildBonusCache2();
    applyStartOfRunEffects();
  }
  function calculatePotentialIC() {
    const autoJobs = gameState.resources.automation_jobs?.lifetimeTotal || 0;
    const uptime = gameState.resources.uptime_points?.lifetimeTotal || 0;
    const baseIC = Math.floor(Math.sqrt(autoJobs * uptime / 1e3));
    const bonuses = [];
    let totalBonusMultiplier = 0;
    for (const fb of data.prestige.formulaBonuses) {
      let bonusAmount = 0;
      switch (fb.condition) {
        case "each_era_fully_unlocked": {
          let erasFullyUnlocked = 0;
          for (const era of ERA_ORDER2) {
            let allResearched = true;
            let hasTechs = false;
            for (const [, tDef] of data.technologies) {
              if (tDef.era !== era) continue;
              hasTechs = true;
              if (!gameState.technologies[tDef.id]?.researched) {
                allResearched = false;
                break;
              }
            }
            if (hasTechs && allResearched) erasFullyUnlocked++;
          }
          bonusAmount = fb.bonus * erasFullyUnlocked;
          break;
        }
        case "each_fully_documented_network": {
          const fdn = gameState.resources.fully_documented_networks?.amount || 0;
          bonusAmount = fb.bonus * fdn;
          break;
        }
        case "low_technical_debt": {
          const debt = gameState.resources.technical_debt?.amount || 0;
          if (debt < fb.threshold) bonusAmount = fb.bonus;
          break;
        }
        case "high_happiness": {
          const happiness = gameState.population?.happiness || 0;
          if (happiness > fb.threshold) bonusAmount = fb.bonus;
          break;
        }
      }
      if (bonusAmount > 0) {
        bonuses.push({ id: fb.condition, amount: bonusAmount, description: fb.description });
        totalBonusMultiplier += bonusAmount;
      }
    }
    const totalIC = Math.floor(baseIC * (1 + totalBonusMultiplier));
    return { baseIC, bonuses, totalIC, autoJobs, uptime };
  }
  function canPrestige() {
    return calculatePotentialIC().totalIC >= 1;
  }
  function performPrestige() {
    if (!canPrestige()) return { success: false };
    const result = calculatePotentialIC();
    const icEarned = result.totalIC;
    const stats = gameState.statistics;
    const at = stats.allTime;
    at.totalBuildingsBuilt += stats.totalBuildingsBuilt;
    at.totalWorkersHired += stats.totalWorkersHired;
    at.totalTechsResearched += stats.totalTechsResearched;
    at.totalClicks += stats.totalClicks || 0;
    at.totalTradesCompleted += stats.totalTradesCompleted || 0;
    at.totalPlayTimeMs += Date.now() - (gameState.prestige.currentRunStartTime || Date.now());
    at.totalRunsCompleted++;
    const prestige = JSON.parse(JSON.stringify(gameState.prestige));
    const philosophy = JSON.parse(JSON.stringify(gameState.philosophy));
    const achievements = JSON.parse(JSON.stringify(gameState.achievements));
    const allTime = JSON.parse(JSON.stringify(at));
    prestige.industryCred += icEarned;
    prestige.totalResets++;
    prestige.runHistory.push({
      icEarned,
      ticks: gameState.time.totalTicks,
      year: gameState.time.currentYear
    });
    let milestone = null;
    for (const ms of data.prestige.milestones) {
      if (prestige.totalResets >= ms.count) {
        milestone = ms;
      }
    }
    resetState(data);
    gameState.prestige = prestige;
    gameState.philosophy = philosophy;
    gameState.achievements = achievements;
    gameState.statistics.allTime = allTime;
    gameState.statistics.totalPrestigeResets = prestige.totalResets;
    gameState.prestige.currentRunStartTick = 0;
    gameState.prestige.currentRunStartTime = Date.now();
    rebuildBonusCache2();
    rebuildBonusCache();
    applyStartOfRunEffects();
    recalculateRates();
    tick2();
    emitter.emit("prestigeReset", { icEarned, runNumber: prestige.totalResets, milestone });
    if (milestone) {
      emitter.emit("logMessage", {
        text: `%PRESTIGE-5-MILESTONE: ${milestone.title} \u2014 ${milestone.narrative}`,
        type: "success",
        category: "achievement"
      });
    }
    emitter.emit("logMessage", {
      text: `%PRESTIGE-5-RESET: Forklift Upgrade complete. Earned ${icEarned} Industry Cred. ${data.prestige.resetFlavor}`,
      type: "success",
      category: "system"
    });
    save();
    return { success: true, icEarned, milestone };
  }
  function applyStartOfRunEffects() {
    const purchased = gameState.prestige?.purchasedUpgrades || {};
    for (const bonus of data.prestige.bonuses) {
      if (!purchased[bonus.id]) continue;
      applyEffect(bonus.effect);
    }
  }
  function applyEffect(effect) {
    if (!effect) return;
    switch (effect.type) {
      case "start_with_worker": {
        const w = gameState.workers[effect.workerId];
        if (w) {
          w.count += effect.amount;
          gameState.population.total += effect.amount;
        }
        break;
      }
      case "start_with_resource":
        addResource(effect.resourceId, effect.amount);
        break;
      case "start_with_resources":
        for (const r of effect.resources) {
          addResource(r.resourceId, r.amount);
        }
        break;
      case "start_with_building": {
        const b = gameState.buildings[effect.buildingId];
        if (b) {
          b.count += effect.amount;
          gameState.statistics.totalBuildingsBuilt += effect.amount;
        }
        break;
      }
      case "start_with_building_unlock":
        gameState.unlocked.buildings.add(effect.buildingId);
        break;
      case "start_era": {
        const targetIdx = ERA_ORDER2.indexOf(effect.era);
        if (targetIdx < 0) break;
        for (let i = 0; i <= targetIdx; i++) {
          const era = ERA_ORDER2[i];
          for (const [id, def] of data.buildings) {
            if (def.era === era) gameState.unlocked.buildings.add(id);
          }
          for (const [id, def] of data.technologies) {
            if (def.era === era) gameState.unlocked.technologies.add(id);
          }
          for (const [id, def] of data.resources) {
            if (def.era === era) gameState.unlocked.resources.add(id);
          }
          for (const [id, def] of data.workers) {
            if (def.era === era) gameState.unlocked.workers.add(id);
          }
          for (const [id, def] of data.upgrades) {
            if (def.era === era) gameState.unlocked.upgrades.add(id);
          }
        }
        break;
      }
      case "trade_start_level":
        for (const id of Object.keys(gameState.trades)) {
          gameState.trades[id].attitude = Math.max(gameState.trades[id].attitude, effect.amount);
        }
        break;
      case "combined":
        for (const sub of effect.effects) {
          applyEffect(sub);
        }
        break;
      default:
        break;
    }
  }
  function canPurchasePrestigeUpgrade(upgradeId) {
    const bonus = data.prestige.bonuses.find((b) => b.id === upgradeId);
    if (!bonus) return false;
    if (gameState.prestige.purchasedUpgrades[upgradeId]) return false;
    return gameState.prestige.industryCred >= bonus.cost;
  }
  function purchasePrestigeUpgrade(upgradeId) {
    if (!canPurchasePrestigeUpgrade(upgradeId)) return { success: false };
    const bonus = data.prestige.bonuses.find((b) => b.id === upgradeId);
    gameState.prestige.industryCred -= bonus.cost;
    gameState.prestige.purchasedUpgrades[upgradeId] = true;
    rebuildBonusCache2();
    recalculateRates();
    emitter.emit("prestigeUpgradePurchased", { upgradeId });
    emitter.emit("logMessage", {
      text: `%PRESTIGE-5-UPGRADE: Purchased ${bonus.name}.`,
      type: "success",
      category: "system"
    });
    return { success: true };
  }
  function rebuildBonusCache2() {
    ratioBonusCache2 = /* @__PURE__ */ new Map();
    baseMultiplierCache = /* @__PURE__ */ new Map();
    buildingCostReductionCache = /* @__PURE__ */ new Map();
    globalBuildingCostReduction = 0;
    researchSpeedBonus2 = 0;
    const purchased = gameState.prestige?.purchasedUpgrades || {};
    for (const bonus of data.prestige.bonuses) {
      if (!purchased[bonus.id]) continue;
      collectBonuses(bonus.effect);
    }
  }
  function collectBonuses(effect) {
    if (!effect) return;
    switch (effect.type) {
      case "global_ratio":
        if (effect.target === "research_speed") {
          researchSpeedBonus2 += effect.amount;
        } else if (effect.target === "network_production") {
          const networkResources = [
            "cli_commands",
            "ping_responses",
            "log_entries",
            "console_cables",
            "copper_cables",
            "ip_addresses",
            "ssh_keys",
            "subnet_allocations"
          ];
          for (const rid of networkResources) {
            ratioBonusCache2.set(rid, (ratioBonusCache2.get(rid) || 0) + effect.amount);
          }
        } else if (effect.target === "nautobot_output") {
          const nautoResources = ["automation_jobs", "graphql_queries", "nautobot_apps", "webhook_events"];
          for (const rid of nautoResources) {
            ratioBonusCache2.set(rid, (ratioBonusCache2.get(rid) || 0) + effect.amount);
          }
        } else {
          ratioBonusCache2.set(effect.target, (ratioBonusCache2.get(effect.target) || 0) + effect.amount);
        }
        break;
      case "production_multiplier":
        baseMultiplierCache.set(effect.target, (baseMultiplierCache.get(effect.target) || 0) + effect.amount);
        break;
      case "building_cost_reduction":
        buildingCostReductionCache.set(
          effect.buildingId,
          (buildingCostReductionCache.get(effect.buildingId) || 0) + effect.amount
        );
        break;
      case "global_building_cost_reduction":
        globalBuildingCostReduction += effect.amount;
        break;
      case "combined":
        for (const sub of effect.effects) {
          collectBonuses(sub);
        }
        break;
      default:
        break;
    }
  }
  function getPrestigeRatioBonuses() {
    return ratioBonusCache2;
  }
  function getPrestigeBaseMultipliers() {
    return baseMultiplierCache;
  }
  function getPrestigeBuildingCostReduction(buildingId) {
    return (buildingCostReductionCache.get(buildingId) || 0) + globalBuildingCostReduction;
  }
  function getPrestigeResearchSpeedBonus() {
    return researchSpeedBonus2;
  }
  function getPrestigeUpgrades() {
    return data.prestige.bonuses.map((b) => ({
      ...b,
      purchased: !!gameState.prestige.purchasedUpgrades[b.id],
      canAfford: canPurchasePrestigeUpgrade(b.id)
    }));
  }
  function getCurrentMilestone() {
    let milestone = null;
    for (const ms of data.prestige.milestones) {
      if ((gameState.prestige?.totalResets || 0) >= ms.count) {
        milestone = ms;
      }
    }
    return milestone;
  }

  // js/engine/philosophyManager.js
  var ratioBonusCache3 = /* @__PURE__ */ new Map();
  var happinessBonusCache = 0;
  function init5() {
    if (!gameState.philosophy) {
      gameState.philosophy = {
        conviction: 0,
        allocations: {},
        lastConvictionThreshold: 0
      };
    }
    rebuildBonusCache3();
  }
  function tick7() {
    const autoJobs = gameState.resources.automation_jobs?.lifetimeTotal || 0;
    const threshold = gameState.philosophy.lastConvictionThreshold || 0;
    const newConviction = Math.floor(autoJobs / 100) - Math.floor(threshold / 100);
    if (newConviction > 0) {
      gameState.philosophy.conviction += newConviction;
      gameState.philosophy.lastConvictionThreshold = Math.floor(autoJobs / 100) * 100;
      emitter.emit("convictionEarned", { amount: newConviction, total: gameState.philosophy.conviction });
      emitter.emit("logMessage", {
        text: `%PHILOSOPHY-5-CONVICTION: Earned ${newConviction} Conviction from automation experience.`,
        type: "info",
        category: "system"
      });
    }
  }
  function getConviction() {
    const spent = getSpentConviction();
    return {
      available: gameState.philosophy.conviction - spent,
      total: gameState.philosophy.conviction,
      spent
    };
  }
  function getSpentConviction() {
    let total = 0;
    for (const id of Object.keys(gameState.philosophy.allocations)) {
      total += gameState.philosophy.allocations[id] || 0;
    }
    return total;
  }
  function allocateConviction(philosophyId, amount) {
    const phil = data.prestige.philosophies.find((p) => p.id === philosophyId);
    if (!phil) return { success: false };
    const available = getConviction().available;
    if (amount > available) return { success: false };
    if (!gameState.philosophy.allocations[philosophyId]) {
      gameState.philosophy.allocations[philosophyId] = 0;
    }
    gameState.philosophy.allocations[philosophyId] += amount;
    rebuildBonusCache3();
    recalculateRates();
    emitter.emit("philosophyChanged", { philosophyId, amount });
    return { success: true };
  }
  function deallocateConviction(philosophyId, amount) {
    const current = gameState.philosophy.allocations[philosophyId] || 0;
    if (current <= 0) return { success: false };
    const toRemove = Math.min(amount, current);
    gameState.philosophy.allocations[philosophyId] -= toRemove;
    const refund = Math.floor(toRemove * 0.5);
    gameState.philosophy.conviction -= toRemove - refund;
    rebuildBonusCache3();
    recalculateRates();
    emitter.emit("philosophyChanged", { philosophyId, amount: -toRemove });
    return { success: true };
  }
  function rebuildBonusCache3() {
    ratioBonusCache3 = /* @__PURE__ */ new Map();
    happinessBonusCache = 0;
    const allocs = gameState.philosophy?.allocations || {};
    const philosophies = data.prestige.philosophies;
    const diminishing = data.prestige.philosophyDiminishing || [1, 0.75, 0.5];
    const active = philosophies.filter((p) => (allocs[p.id] || 0) > 0).map((p) => ({ ...p, allocation: allocs[p.id] })).sort((a, b) => b.allocation - a.allocation);
    for (let i = 0; i < active.length; i++) {
      const phil = active[i];
      const factor = i < diminishing.length ? diminishing[i] : 0;
      if (factor <= 0) continue;
      const scale = phil.allocation * factor;
      for (const bonus of phil.bonuses) {
        if (bonus.target === "happiness") {
          happinessBonusCache += bonus.amount * scale;
        } else if (bonus.target === "building_speed" || bonus.target === "open_source_trading" || bonus.target === "vendor_trading" || bonus.target === "sanity_from_incidents" || bonus.target === "monitoring_output" || bonus.target === "config_compliance_output" || bonus.target === "ci_cd_output") {
          const mappings = getTargetResourceMapping(bonus.target);
          for (const rid of mappings) {
            ratioBonusCache3.set(rid, (ratioBonusCache3.get(rid) || 0) + bonus.amount * scale);
          }
        } else {
          ratioBonusCache3.set(bonus.target, (ratioBonusCache3.get(bonus.target) || 0) + bonus.amount * scale);
        }
      }
    }
  }
  function getTargetResourceMapping(target) {
    switch (target) {
      case "config_compliance_output":
        return ["compliance_reports", "config_diffs"];
      case "ci_cd_output":
        return ["test_results", "container_images"];
      case "monitoring_output":
        return ["log_entries", "uptime_points"];
      case "nautobot_output":
        return ["automation_jobs", "graphql_queries", "nautobot_apps", "webhook_events"];
      default:
        return [];
    }
  }
  function getPhilosophyRatioBonuses() {
    return ratioBonusCache3;
  }
  function getPhilosophyHappinessBonus() {
    return Math.round(happinessBonusCache);
  }
  function getAllocations() {
    const philosophies = data.prestige.philosophies;
    const allocs = gameState.philosophy?.allocations || {};
    const diminishing = data.prestige.philosophyDiminishing || [1, 0.75, 0.5];
    const active = philosophies.filter((p) => (allocs[p.id] || 0) > 0).sort((a, b) => (allocs[b.id] || 0) - (allocs[a.id] || 0));
    const result = {};
    for (const phil of philosophies) {
      const idx = active.indexOf(phil);
      result[phil.id] = {
        allocated: allocs[phil.id] || 0,
        diminishingFactor: idx >= 0 && idx < diminishing.length ? diminishing[idx] : idx >= diminishing.length ? 0 : 1
      };
    }
    return result;
  }

  // js/engine/resourceManager.js
  var cachedRates = /* @__PURE__ */ new Map();
  var workerRates = /* @__PURE__ */ new Map();
  function recalculateRates() {
    const rates = /* @__PURE__ */ new Map();
    const wRates = /* @__PURE__ */ new Map();
    for (const id of data.resources.keys()) {
      rates.set(id, 0);
      wRates.set(id, 0);
    }
    for (const [id, def] of data.buildings) {
      const count = gameState.buildings[id]?.count || 0;
      if (count === 0) continue;
      for (const effect of def.effects) {
        if (effect.type === "production") {
          rates.set(effect.resourceId, (rates.get(effect.resourceId) || 0) + effect.amount * count);
        }
      }
    }
    const happinessMultiplier = (gameState.population?.happiness ?? 100) / 100;
    for (const [id, def] of data.workers) {
      const count = gameState.workers[id]?.count || 0;
      if (count === 0) continue;
      for (const p of def.produces) {
        const delta = p.amount * count * happinessMultiplier;
        rates.set(p.resourceId, (rates.get(p.resourceId) || 0) + delta);
        wRates.set(p.resourceId, (wRates.get(p.resourceId) || 0) + delta);
      }
      for (const c of def.consumes) {
        const delta = c.amount * count;
        rates.set(c.resourceId, (rates.get(c.resourceId) || 0) - delta);
        wRates.set(c.resourceId, (wRates.get(c.resourceId) || 0) - delta);
      }
    }
    const ratioBonus = /* @__PURE__ */ new Map();
    for (const [id, def] of data.upgrades) {
      if (!gameState.upgrades[id]?.purchased) continue;
      for (const effect of def.effects) {
        if (effect.type === "ratio") {
          if (rates.has(effect.target)) {
            ratioBonus.set(effect.target, (ratioBonus.get(effect.target) || 0) + effect.amount);
          }
        }
      }
    }
    for (const [target, amount] of getPrestigeRatioBonuses()) {
      if (rates.has(target)) {
        ratioBonus.set(target, (ratioBonus.get(target) || 0) + amount);
      }
    }
    for (const [target, amount] of getPhilosophyRatioBonuses()) {
      if (rates.has(target)) {
        ratioBonus.set(target, (ratioBonus.get(target) || 0) + amount);
      }
    }
    for (const [target, amount] of getAchievementRatioBonuses()) {
      if (rates.has(target)) {
        ratioBonus.set(target, (ratioBonus.get(target) || 0) + amount);
      }
    }
    for (const [resourceId] of rates) {
      const rate = rates.get(resourceId);
      if (rate <= 0) continue;
      const seasonBonus = getSeasonRatioModifier(resourceId) + getSeasonRatioModifier("all_production");
      if (seasonBonus !== 0) {
        ratioBonus.set(resourceId, (ratioBonus.get(resourceId) || 0) + seasonBonus);
      }
    }
    for (const effect of gameState.events?.timedEffects || []) {
      if (effect.type !== "production_modifier") continue;
      if (effect.target === "all") {
        for (const [rid, r] of rates) {
          if (r > 0) ratioBonus.set(rid, (ratioBonus.get(rid) || 0) + effect.amount);
        }
      } else if (rates.has(effect.target)) {
        ratioBonus.set(effect.target, (ratioBonus.get(effect.target) || 0) + effect.amount);
      }
    }
    for (const [target, multiplier] of getPrestigeBaseMultipliers()) {
      const baseRate = rates.get(target);
      if (baseRate != null && baseRate > 0) {
        rates.set(target, baseRate * multiplier);
      }
    }
    for (const [resourceId, bonus] of ratioBonus) {
      const baseRate = rates.get(resourceId);
      if (baseRate > 0) {
        rates.set(resourceId, baseRate * Math.max(0, 1 + bonus));
      }
    }
    cachedRates = rates;
    workerRates = wRates;
    for (const [id, def] of data.resources) {
      const res = gameState.resources[id];
      if (res) res.cap = def.baseCap;
    }
    for (const [id, def] of data.buildings) {
      const count = gameState.buildings[id]?.count || 0;
      if (count === 0) continue;
      for (const effect of def.effects) {
        if (effect.type === "cap_increase") {
          const res = gameState.resources[effect.resourceId];
          if (res) res.cap += effect.amount * count;
        }
      }
    }
    for (const [id, def] of data.technologies) {
      if (!gameState.technologies[id]?.researched) continue;
      for (const effect of def.effects || []) {
        if (effect.type === "cap_increase") {
          const res = gameState.resources[effect.resourceId];
          if (res) res.cap += effect.amount;
        }
      }
    }
    for (const [id, def] of data.upgrades) {
      if (!gameState.upgrades[id]?.purchased) continue;
      for (const effect of def.effects) {
        if (effect.type === "cap_increase") {
          const res = gameState.resources[effect.target];
          if (res) res.cap += effect.amount;
        }
      }
    }
  }
  function tick6() {
    const coffeeGated = hasCoffeeShortage();
    for (const [resourceId, rate] of cachedRates) {
      let effectiveRate = rate;
      if (coffeeGated) {
        const wRate = workerRates.get(resourceId) || 0;
        effectiveRate = rate - wRate;
      }
      if (effectiveRate === 0) continue;
      const res = gameState.resources[resourceId];
      if (!res) continue;
      const oldAmount = res.amount;
      setResource(resourceId, oldAmount + effectiveRate);
    }
  }
  function hasCoffeeShortage() {
    const coffee = gameState.resources.coffee;
    if (!coffee || coffee.amount > 0) return false;
    for (const [id] of data.workers) {
      if ((gameState.workers[id]?.count || 0) > 0) return true;
    }
    return false;
  }
  function getPerSecondRate(resourceId) {
    return (cachedRates.get(resourceId) || 0) * 5;
  }

  // js/engine/buildingManager.js
  function geometricSum(base, ratio, owned, quantity) {
    if (ratio === 1) return base * quantity;
    return base * Math.pow(ratio, owned) * (Math.pow(ratio, quantity) - 1) / (ratio - 1);
  }
  function calculateCost(buildingId, quantity) {
    const def = data.buildings.get(buildingId);
    if (!def) return [];
    const owned = gameState.buildings[buildingId]?.count || 0;
    const reduction = getPrestigeBuildingCostReduction(buildingId);
    return def.costs.map((cost) => ({
      resourceId: cost.resourceId,
      totalAmount: geometricSum(cost.baseAmount, cost.priceRatio, owned, quantity) * (1 - reduction)
    }));
  }
  function canAfford(buildingId, quantity) {
    if (quantity <= 0) return false;
    const def = data.buildings.get(buildingId);
    if (!def) return false;
    const owned = gameState.buildings[buildingId]?.count || 0;
    if (def.maxCount !== null && owned + quantity > def.maxCount) return false;
    const costs = calculateCost(buildingId, quantity);
    for (const { resourceId, totalAmount } of costs) {
      const res = gameState.resources[resourceId];
      if (!res || res.amount < totalAmount) return false;
    }
    return true;
  }
  function purchase(buildingId, quantity) {
    if (!canAfford(buildingId, quantity)) {
      return { success: false, flavorText: null };
    }
    const def = data.buildings.get(buildingId);
    const costs = calculateCost(buildingId, quantity);
    for (const { resourceId, totalAmount } of costs) {
      addResource(resourceId, -totalAmount);
    }
    gameState.buildings[buildingId].count += quantity;
    gameState.statistics.totalBuildingsBuilt += quantity;
    recalculateRates();
    emitter.emit("buildingPurchased", {
      id: buildingId,
      quantity,
      newCount: gameState.buildings[buildingId].count,
      flavorText: def.flavorOnBuild
    });
    emitter.emit("logMessage", {
      text: `Built ${def.name} (x${quantity}).`,
      type: "success",
      category: "building"
    });
    return { success: true, flavorText: def.flavorOnBuild };
  }
  function getMaxAffordable(buildingId) {
    const def = data.buildings.get(buildingId);
    if (!def) return 0;
    const owned = gameState.buildings[buildingId]?.count || 0;
    let maxFromCap = def.maxCount !== null ? def.maxCount - owned : 1e3;
    if (maxFromCap <= 0) return 0;
    let lo = 0;
    let hi = Math.min(maxFromCap, 1e3);
    if (!canAfford(buildingId, 1)) return 0;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (canAfford(buildingId, mid)) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    return lo;
  }
  function getTotalHousing() {
    let total = 0;
    for (const [id, def] of data.buildings) {
      const count = gameState.buildings[id]?.count || 0;
      if (count === 0) continue;
      for (const effect of def.effects) {
        if (effect.type === "housing") {
          total += effect.amount * count;
        }
      }
    }
    return total;
  }

  // js/engine/workerManager.js
  var FIRST_NAMES = [
    "Alice",
    "Bob",
    "Charlie",
    "Dave",
    "Eve",
    "Frank",
    "Grace",
    "Heidi",
    "Ivan",
    "Judy",
    "Kevin",
    "Liam",
    "Mia",
    "Nate",
    "Olivia",
    "Pat",
    "Quinn",
    "Rosa",
    "Sam",
    "Tina",
    "Uma",
    "Vic",
    "Wei",
    "Xena",
    "Yuki",
    "Zara"
  ];
  var LAST_NAMES = [
    "Subnet",
    "Vlanberg",
    "Routenstein",
    "Switchworth",
    "Patchfield",
    "Firewaller",
    "Packetson",
    "Loopback",
    "Gatewood",
    "Stackpole",
    "Cablewise",
    "Portfield",
    "Arpington",
    "Ospfsen",
    "Bgpstein",
    "Spanningtree",
    "Dhcpley",
    "Dnsford",
    "Tacacsworth",
    "Radiusman",
    "Syslogger",
    "Netflower",
    "Pingsworth",
    "Uptimer",
    "Configley",
    "Vxlanberg"
  ];
  var happinessBreakdown = [];
  function init6() {
    if (!gameState.population) {
      let total = 0;
      for (const [id] of data.workers) {
        total += gameState.workers[id]?.count || 0;
      }
      gameState.population = {
        total,
        free: 0,
        happiness: 100,
        names: []
      };
    }
  }
  function generateWorkerName() {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${first} ${last}`;
  }
  function checkWorkerArrival() {
    const housing = getTotalHousing();
    if (housing <= 0) return;
    if (gameState.population.total >= housing) return;
    const happinessRatio = gameState.population.happiness / 100;
    const arrivalChance = 0.15 * happinessRatio;
    if (Math.random() < arrivalChance) {
      const name = generateWorkerName();
      gameState.population.total++;
      gameState.population.free++;
      gameState.population.names.push(name);
      gameState.statistics.totalWorkersHired++;
      emitter.emit("workerArrived", { name });
      emitter.emit("logMessage", {
        text: `%HR-5-HIRED: ${name} has joined the team. They brought their own mechanical keyboard.`,
        type: "success",
        category: "worker"
      });
    }
  }
  function assignWorker(roleId, delta) {
    if (delta > 0 && gameState.population.free <= 0) return false;
    if (delta < 0 && (gameState.workers[roleId]?.count || 0) <= 0) return false;
    const roleDef = data.workers.get(roleId);
    if (!roleDef) return false;
    gameState.workers[roleId].count += delta;
    gameState.population.free -= delta;
    recalculateRates();
    emitter.emit("workerAssigned", { roleId, delta });
    const action = delta > 0 ? "assigned to" : "unassigned from";
    emitter.emit("logMessage", {
      text: `%HR-6-ASSIGN: Engineer ${action} ${roleDef.name}.`,
      type: "info",
      category: "worker"
    });
    return true;
  }
  function calculateHappiness() {
    const factors = [];
    let happiness = 100;
    const totalWorkers = gameState.population.total;
    const housing = getTotalHousing();
    if (totalWorkers > 0 && housing > 0 && totalWorkers > housing * 0.8) {
      happiness -= 15;
      factors.push({ name: "Overcrowding", value: -15 });
    }
    const coffee = gameState.resources.coffee;
    if (coffee && coffee.amount <= 0 && totalWorkers > 0) {
      happiness -= 30;
      factors.push({ name: "No coffee", value: -30 });
    }
    const techDebt = gameState.resources.technical_debt;
    if (techDebt && techDebt.amount > 300) {
      happiness -= 15;
      factors.push({ name: "High technical debt", value: -15 });
    }
    const meetings = gameState.resources.meeting_minutes;
    if (meetings && meetings.amount > 100) {
      happiness -= 10;
      factors.push({ name: "Excessive meetings", value: -10 });
    }
    if ((gameState.buildings.wiki?.count || 0) > 0) {
      happiness += 10;
      factors.push({ name: "Good documentation", value: 10 });
    }
    if ((gameState.buildings.snack_wall?.count || 0) > 0) {
      happiness += 5;
      factors.push({ name: "Snack wall", value: 5 });
    }
    if ((gameState.buildings.espresso_machine?.count || 0) > 0) {
      happiness += 5;
      factors.push({ name: "Espresso machine", value: 5 });
    }
    if (gameState.upgrades.dark_mode?.purchased) {
      happiness += 5;
      factors.push({ name: "Dark mode", value: 5 });
    }
    if (gameState.upgrades.mechanical_keyboard?.purchased) {
      happiness += 5;
      factors.push({ name: "Mechanical keyboard", value: 5 });
    }
    if (gameState.upgrades.ergonomic_chair?.purchased) {
      happiness += 5;
      factors.push({ name: "Ergonomic chair", value: 5 });
    }
    if (gameState.upgrades.noise_canceling_headphones?.purchased) {
      happiness += 5;
      factors.push({ name: "Noise-canceling headphones", value: 5 });
    }
    const philHappiness = getPhilosophyHappinessBonus();
    if (philHappiness !== 0) {
      happiness += philHappiness;
      factors.push({ name: "Philosophy bonus", value: philHappiness });
    }
    const achieveHappiness = getAchievementHappinessBonus();
    if (achieveHappiness !== 0) {
      happiness += achieveHappiness;
      factors.push({ name: "Achievement bonus", value: achieveHappiness });
    }
    happiness = Math.max(0, Math.min(100, happiness));
    const oldHappiness = gameState.population.happiness;
    gameState.population.happiness = happiness;
    happinessBreakdown = factors;
    if (happiness !== oldHappiness) {
      emitter.emit("happinessChanged", { value: happiness, factors });
      recalculateRates();
    }
    return happiness;
  }
  function getHappinessBreakdown() {
    return happinessBreakdown;
  }
  function workerTick() {
    checkWorkerArrival();
    calculateHappiness();
  }

  // js/engine/eventManager.js
  var EVENT_COOLDOWN_DAYS = 30;
  var MAX_HISTORY = 50;
  var MAX_QUEUE = 3;
  var DISPLAY_TICKS = 50;
  function init7() {
    if (!gameState.events) {
      gameState.events = {
        activeEvent: null,
        eventHistory: [],
        cooldowns: {},
        timedEffects: [],
        eventQueue: []
      };
    }
    gameState.events.timedEffects = gameState.events.timedEffects.filter(
      (e) => e.expiresAtTick === Infinity || e.expiresAtTick > gameState.time.totalTicks
    );
  }
  function tick8() {
    expireTimedEffects();
    const active = gameState.events.activeEvent;
    if (active && active.resolveAtTick && gameState.time.totalTicks >= active.resolveAtTick) {
      gameState.events.activeEvent = null;
      emitter.emit("eventDismissed", {});
    }
    if (!gameState.events.activeEvent && gameState.events.eventQueue.length > 0) {
      const nextId = gameState.events.eventQueue.shift();
      activateEvent(nextId);
      return;
    }
    rollForEvents();
  }
  function expireTimedEffects() {
    const effects = gameState.events.timedEffects;
    const before = effects.length;
    gameState.events.timedEffects = effects.filter(
      (e) => e.expiresAtTick === Infinity || e.expiresAtTick > gameState.time.totalTicks
    );
    if (gameState.events.timedEffects.length < before) {
      recalculateRates();
      emitter.emit("timedEffectExpired", {});
    }
  }
  function rollForEvents() {
    for (const [eventId, eventDef] of data.events) {
      if (gameState.events.cooldowns[eventId] && gameState.time.currentDay < gameState.events.cooldowns[eventId]) {
        continue;
      }
      if (!evaluateCondition(eventDef.conditions)) continue;
      let prob = eventDef.probability;
      if (eventDef.probabilityOverrides) {
        for (const override of eventDef.probabilityOverrides) {
          if (evaluateCondition(override.condition)) {
            prob = override.probability;
            break;
          }
        }
      }
      prob *= getEventProbabilityMultiplier(eventId);
      if (eventDef.type === "negative") {
        const negMult = getEventProbabilityMultiplier("all_negative");
        if (negMult !== 1) prob *= negMult;
      }
      if (Math.random() >= prob) continue;
      if (!gameState.events.activeEvent) {
        activateEvent(eventId);
        return;
      }
      if (gameState.events.eventQueue.length < MAX_QUEUE) {
        gameState.events.eventQueue.push(eventId);
      }
      return;
    }
  }
  function activateEvent(eventId) {
    const eventDef = data.events.get(eventId);
    if (!eventDef) return;
    gameState.events.cooldowns[eventId] = gameState.time.currentDay + EVENT_COOLDOWN_DAYS;
    const historyEntry = {
      eventId,
      day: gameState.time.currentDay,
      year: gameState.time.currentYear,
      outcome: null
    };
    if (eventDef.type === "choice") {
      gameState.events.activeEvent = { eventId, startTick: gameState.time.totalTicks };
    } else {
      applyEffects(eventDef.effects);
      historyEntry.outcome = eventDef.type;
      gameState.events.activeEvent = {
        eventId,
        startTick: gameState.time.totalTicks,
        resolveAtTick: gameState.time.totalTicks + DISPLAY_TICKS
      };
    }
    gameState.events.eventHistory.push(historyEntry);
    if (gameState.events.eventHistory.length > MAX_HISTORY) {
      gameState.events.eventHistory.shift();
    }
    gameState.statistics.eventsExperienced.push(eventId);
    const logType = eventDef.type === "positive" ? "success" : eventDef.type === "negative" ? "warning" : "info";
    emitter.emit("logMessage", {
      text: `%EVENT-4-ALERT: ${eventDef.name} \u2014 ${eventDef.description}`,
      type: logType,
      category: "event"
    });
    emitter.emit("eventFired", { eventId, eventDef });
  }
  function makeChoice(choiceId) {
    const active = gameState.events.activeEvent;
    if (!active) return { success: false, reason: "no_active_event" };
    const eventDef = data.events.get(active.eventId);
    if (!eventDef || !eventDef.choices) return { success: false, reason: "not_a_choice_event" };
    const choice = eventDef.choices.find((c) => c.id === choiceId);
    if (!choice) return { success: false, reason: "invalid_choice" };
    if (choice.conditions && !evaluateCondition(choice.conditions)) {
      return { success: false, reason: "conditions_not_met" };
    }
    for (const cost of choice.costs || []) {
      const res = gameState.resources[cost.resourceId];
      if (!res || res.amount < cost.amount) {
        return { success: false, reason: "insufficient_resources" };
      }
    }
    for (const cost of choice.costs || []) {
      addResource(cost.resourceId, -cost.amount);
    }
    applyEffects(choice.effects);
    const historyIdx = gameState.events.eventHistory.findIndex(
      (h) => h.eventId === active.eventId && h.outcome === null
    );
    if (historyIdx >= 0) {
      gameState.events.eventHistory[historyIdx].outcome = choiceId;
    }
    gameState.events.activeEvent = null;
    emitter.emit("logMessage", {
      text: `%EVENT-5-CHOICE: ${eventDef.name} \u2014 chose "${choice.text}"`,
      type: "info",
      category: "event"
    });
    emitter.emit("eventResolved", { eventId: active.eventId, choiceId });
    return { success: true, choiceId };
  }
  function dismissEvent() {
    if (!gameState.events.activeEvent) return;
    gameState.events.activeEvent = null;
    emitter.emit("eventDismissed", {});
  }
  function applyEffects(effects) {
    if (!effects) return;
    for (const effect of effects) {
      const chance = effect.chance !== void 0 ? effect.chance : 1;
      if (Math.random() >= chance) continue;
      switch (effect.type) {
        case "resource":
          addResource(effect.resourceId, effect.amount);
          break;
        case "production_modifier":
        case "timed_bonus": {
          const duration = effect.duration;
          const expiresAtTick = duration != null ? gameState.time.totalTicks + duration * 10 : Infinity;
          gameState.events.timedEffects.push({
            type: effect.type,
            target: effect.target,
            amount: effect.amount,
            expiresAtTick,
            sourceId: gameState.events.activeEvent?.eventId || "trade"
          });
          recalculateRates();
          break;
        }
        case "research_boost": {
          const unresearched = [];
          for (const [id, state] of Object.entries(gameState.technologies)) {
            if (!state.researched && gameState.unlocked.technologies.has(id)) {
              unresearched.push(id);
            }
          }
          if (unresearched.length > 0) {
            const targetId = unresearched[Math.floor(Math.random() * unresearched.length)];
            const techDef = data.technologies.get(targetId);
            if (techDef) {
              gameState.technologies[targetId].researchProgress += Math.floor(effect.amount * techDef.researchTicks);
            }
          }
          break;
        }
      }
    }
  }
  function getActiveEvent() {
    return gameState.events.activeEvent;
  }
  function getTimedEffects() {
    return gameState.events.timedEffects;
  }
  function getEventHistory() {
    return gameState.events.eventHistory;
  }

  // js/engine/tradeManager.js
  var ATTITUDE_PER_TRADE = 3;
  var ATTITUDE_LOSS_ON_FAIL = 1;
  function init8() {
    for (const [id] of data.trades) {
      if (!gameState.trades[id]) {
        gameState.trades[id] = { attitude: 0, totalTradesCompleted: 0, lastTradeDay: 0 };
      }
    }
  }
  function findTrade(partnerId, tradeId) {
    const partner = data.trades.get(partnerId);
    if (!partner) return null;
    return partner.trades.find((t) => t.id === tradeId) || null;
  }
  function isPartnerAvailable(partnerId) {
    const partner = data.trades.get(partnerId);
    if (!partner) return false;
    if (!gameState.unlocked.trades.has(partnerId)) return false;
    if (partner.unlockCondition && partner.unlockCondition.type === "season") {
      return isSeasonActive(partner.unlockCondition.season);
    }
    return true;
  }
  function canTrade(partnerId, tradeId, qty = 1) {
    if (!isPartnerAvailable(partnerId)) {
      return { affordable: false, available: false, reason: "partner_unavailable" };
    }
    const trade = findTrade(partnerId, tradeId);
    if (!trade) return { affordable: false, available: false, reason: "trade_not_found" };
    for (const cost of trade.give) {
      const res = getResource(cost.resourceId);
      if (!res || res.amount < cost.amount * qty) {
        return { affordable: false, available: true, reason: "insufficient_resources" };
      }
    }
    return { affordable: true, available: true };
  }
  function executeTrade(partnerId, tradeId, qty = 1) {
    const check = canTrade(partnerId, tradeId, qty);
    if (!check.affordable || !check.available) return { success: false, reason: check.reason };
    const partner = data.trades.get(partnerId);
    const trade = findTrade(partnerId, tradeId);
    const state = gameState.trades[partnerId];
    for (const cost of trade.give) {
      addResource(cost.resourceId, -cost.amount * qty);
    }
    const succeeded = Math.random() < trade.successRate;
    if (succeeded) {
      for (const item of trade.receive) {
        if (item.type === "timed_bonus") {
          const expiresAtTick = item.duration != null ? gameState.time.totalTicks + item.duration * 10 : Infinity;
          gameState.events.timedEffects.push({
            type: "timed_bonus",
            target: item.target,
            amount: item.amount,
            expiresAtTick,
            sourceId: `trade_${partnerId}_${tradeId}`
          });
          recalculateRates();
        } else {
          addResource(item.resourceId, item.amount * qty);
        }
      }
      state.attitude = Math.min(partner.maxAttitude, state.attitude + ATTITUDE_PER_TRADE * qty);
      state.totalTradesCompleted += qty;
      state.lastTradeDay = gameState.time.currentDay;
      const specialJustUnlocked = partner.specialDeal && state.attitude >= partner.specialDeal.unlockAtAttitude && state.attitude - ATTITUDE_PER_TRADE * qty < partner.specialDeal.unlockAtAttitude;
      emitter.emit("logMessage", {
        text: `%TRADE-5-OK: ${partner.name} \u2014 ${trade.name} (x${qty}) completed successfully.`,
        type: "success",
        category: "trade"
      });
      if (specialJustUnlocked) {
        emitter.emit("logMessage", {
          text: `%TRADE-5-DEAL: ${partner.name} special deal unlocked: ${partner.specialDeal.description}`,
          type: "success",
          category: "trade"
        });
      }
      emitter.emit("tradeCompleted", { partnerId, tradeId, qty });
      return { success: true, outcome: "success" };
    }
    state.attitude = Math.max(0, state.attitude - ATTITUDE_LOSS_ON_FAIL);
    emitter.emit("logMessage", {
      text: `%TRADE-4-FAIL: ${partner.name} \u2014 ${trade.failureMessage || "Trade failed."}`,
      type: "warning",
      category: "trade"
    });
    emitter.emit("tradeFailed", { partnerId, tradeId, qty });
    return { success: false, outcome: "failed", failureMessage: trade.failureMessage };
  }
  function getMaxTradeQuantity(partnerId, tradeId) {
    const trade = findTrade(partnerId, tradeId);
    if (!trade) return 0;
    let max = Infinity;
    for (const cost of trade.give) {
      const res = getResource(cost.resourceId);
      if (!res) return 0;
      max = Math.min(max, Math.floor(res.amount / cost.amount));
    }
    return max === Infinity ? 0 : max;
  }
  function getPartnerAttitude(partnerId) {
    const partner = data.trades.get(partnerId);
    const state = gameState.trades[partnerId];
    if (!partner || !state) return { current: 0, max: 100, percent: 0 };
    return {
      current: state.attitude,
      max: partner.maxAttitude,
      percent: Math.round(state.attitude / partner.maxAttitude * 100)
    };
  }
  function isSpecialDealUnlocked(partnerId) {
    const partner = data.trades.get(partnerId);
    const state = gameState.trades[partnerId];
    if (!partner || !state || !partner.specialDeal) return false;
    return state.attitude >= partner.specialDeal.unlockAtAttitude;
  }

  // js/ui/domUtils.js
  function el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }
  function makeBtn(label, onClick, className = "ctrl-btn") {
    const btn = el("button", className);
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }
  var ICON_MAP = {
    cli_commands: ">_",
    ping_responses: "!",
    log_entries: "[]",
    coffee: "\u2615",
    console_cables: "~",
    documentation_pages: "\u{1F4C4}",
    copper_cables: "==",
    ip_addresses: "#",
    python_scripts: "\u{1F40D}",
    yaml_files: "\u{1F4DD}",
    jinja_templates: "{}",
    git_commits: "\u{1F4E6}",
    api_tokens: "\u{1F511}",
    json_blobs: "{}",
    ssh_keys: "\u{1F510}",
    pull_requests: "\u{1F4CB}",
    container_images: "\u{1F4E6}",
    subnet_allocations: "\u{1F310}",
    sanity: "\u{1F9E0}",
    uptime_points: "\u2B06",
    change_window_tokens: "\u{1F3AB}",
    budget: "\u{1F4B0}",
    technical_debt: "\u{1F4C9}",
    goodwill: "\u{1F91D}",
    meeting_minutes: "\u{1F4C5}",
    ansible_playbooks: "\u{1F4D6}",
    nornir_inventories: "\u{1F5C2}",
    graphql_queries: "\u26A1",
    automation_jobs: "\u2699",
    nautobot_apps: "\u{1F50C}",
    webhook_events: "\u{1F514}",
    test_results: "\u2705",
    config_diffs: "\u{1F50D}",
    circuit_ids: "\u{1F517}",
    design_documents: "\u{1F4D0}",
    compliance_reports: "\u{1F4CA}",
    zero_touch_provisions: "\u{1F916}",
    golden_configs: "\u2728",
    fully_documented_networks: "\u{1F3C6}",
    intent_declarations: "\u{1F3AF}",
    terraform_plans: "\u{1F3D7}",
    service_mesh_configs: "\u{1F578}",
    digital_twin_snapshots: "\u{1FA9E}",
    save: "\u{1F4BE}",
    settings: "\u2699",
    pause: "\u23F8",
    play: "\u25B6",
    trophy: "\u{1F3C6}",
    warning: "\u26A0",
    error: "\u274C",
    check: "\u2714"
  };
  function modal(title, contentFn, options = {}) {
    const backdrop = el("div", "modal-backdrop");
    const dialog = el("div", "modal-dialog");
    const header = el("div", "modal-header");
    const titleEl = el("h2", "modal-title");
    titleEl.textContent = title;
    const closeBtn = el("button", "modal-close-btn");
    closeBtn.textContent = "\xD7";
    header.append(titleEl, closeBtn);
    const body = el("div", "modal-body");
    contentFn(body);
    dialog.append(header, body);
    backdrop.appendChild(dialog);
    function close() {
      backdrop.classList.add("modal-backdrop--closing");
      backdrop.addEventListener("animationend", () => backdrop.remove(), { once: true });
      setTimeout(() => backdrop.remove(), 400);
      if (options.onClose) options.onClose();
    }
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", function handler(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", handler);
      }
    });
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add("modal-backdrop--visible"));
    return { close, backdrop, dialog };
  }
  var _switchToTab = null;
  function registerTabSwitcher(fn) {
    _switchToTab = fn;
  }
  function highlightAndScroll(target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.remove("nav-highlight");
    void target.offsetWidth;
    target.classList.add("nav-highlight");
    target.addEventListener("animationend", () => {
      target.classList.remove("nav-highlight");
    }, { once: true });
  }
  function navigateTo(type, id) {
    if (!_switchToTab) return;
    if (type === "resource") {
      requestAnimationFrame(() => {
        const target = document.querySelector(`.resource-sidebar .resource-row[data-id="${id}"]`);
        if (!target) return;
        const category = target.closest(".resource-category--collapsed");
        if (category) {
          category.classList.remove("resource-category--collapsed");
          const chevron = category.querySelector(".category-chevron");
          if (chevron) chevron.textContent = "\u25BE";
        }
        highlightAndScroll(target);
      });
      return;
    }
    const TAB_MAP = { building: "operations", worker: "village", upgrade: "workshop" };
    const SELECTOR_MAP = {
      building: `.building-card[data-id="${id}"]`,
      worker: `.worker-role-row[data-role="${id}"]`,
      upgrade: `.upgrade-card[data-id="${id}"]`
    };
    const tabId = TAB_MAP[type];
    const selector = SELECTOR_MAP[type];
    if (!tabId || !selector) return;
    _switchToTab(tabId);
    requestAnimationFrame(() => {
      const target = document.querySelector(`.tab-panel[data-tab="${tabId}"] ${selector}`);
      if (!target) return;
      const group = target.closest(".era-group--collapsed");
      if (group) {
        group.classList.remove("era-group--collapsed");
        const chevron = group.querySelector(".era-chevron");
        if (chevron) chevron.textContent = "\u25BC";
      }
      highlightAndScroll(target);
    });
  }

  // js/ui/formatUtils.js
  var SEASON_NAMES = ["Q1", "Q2", "Q3", "Q4"];
  var notation = "standard";
  function setNotation(mode) {
    notation = mode;
  }
  function formatNum(n) {
    if (notation === "scientific") {
      if (Math.abs(n) >= 1e3) return n.toExponential(2);
      return Math.round(n).toString();
    }
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return Math.round(n).toString();
  }
  function formatRate(rate) {
    if (rate === 0) return "";
    const sign = rate > 0 ? "+" : "";
    return `${sign}${formatNum(rate)}/s`;
  }
  function formatTimestamp() {
    const day = gameState.time.currentDay;
    const season = SEASON_NAMES[gameState.time.currentSeason] || "Q?";
    return `[D${day} ${season}]`;
  }

  // js/ui/settingsStore.js
  var STORAGE_KEY2 = "nautobot_game_settings";
  var DEFAULTS = {
    theme: "dark",
    notation: "standard",
    animationsEnabled: true,
    autoSaveInterval: 30,
    soundEnabled: false,
    soundVolume: 0.5,
    logProductionTicks: false,
    pinnedBuildings: []
  };
  var cache = null;
  function load2() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY2);
      cache = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      cache = { ...DEFAULTS };
    }
    return cache;
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY2, JSON.stringify(cache));
    } catch {
    }
  }
  function getSetting(key) {
    return load2()[key] ?? DEFAULTS[key];
  }
  function setSetting(key, value) {
    load2();
    cache[key] = value;
    persist();
  }
  function applyTheme() {
    const theme = getSetting("theme");
    if (theme === "dark") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }
  function applyAnimations() {
    document.body.classList.toggle("no-animations", !getSetting("animationsEnabled"));
  }
  function applyAll() {
    applyTheme();
    applyAnimations();
  }

  // js/ui/soundManager.js
  var audioCtx = null;
  var enabled = false;
  var volume = 0.5;
  function getCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return audioCtx;
  }
  function playTone(freq, duration = 0.08, type = "sine") {
    if (!enabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume * 0.3;
    gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
  function playClick() {
    playTone(800, 0.05, "square");
  }
  function playBuild() {
    playTone(440, 0.1, "sine");
    setTimeout(() => playTone(660, 0.1, "sine"), 80);
  }
  function playAchievement() {
    playTone(523, 0.15, "sine");
    setTimeout(() => playTone(659, 0.15, "sine"), 100);
    setTimeout(() => playTone(784, 0.2, "sine"), 200);
  }
  function playEvent() {
    playTone(440, 0.2, "triangle");
    setTimeout(() => playTone(330, 0.2, "triangle"), 150);
  }
  function setEnabled(val) {
    enabled = val;
    if (val && audioCtx?.state === "suspended") {
      audioCtx.resume();
    }
  }
  function setVolume(val) {
    volume = val;
  }
  function init9() {
    enabled = getSetting("soundEnabled");
    volume = getSetting("soundVolume");
  }

  // js/ui/settingsPanel.js
  var rebuildCallback = null;
  function setRebuildCallback(cb) {
    rebuildCallback = cb;
  }
  function open() {
    modal("Settings", (body) => {
      const themeSection = makeSection("Display");
      const themeRow = el("div", "settings-row");
      const themeLabel = el("label", "settings-label");
      themeLabel.textContent = "Theme";
      const themeSelect = el("select", "settings-select");
      for (const [val, label] of [["dark", "Dark"], ["light", "Light"], ["terminal", "Terminal Green"]]) {
        const opt = el("option");
        opt.value = val;
        opt.textContent = label;
        if (getSetting("theme") === val) opt.selected = true;
        themeSelect.appendChild(opt);
      }
      themeSelect.addEventListener("change", () => {
        setSetting("theme", themeSelect.value);
        applyTheme();
      });
      themeRow.append(themeLabel, themeSelect);
      themeSection.appendChild(themeRow);
      const animRow = el("div", "settings-row");
      const animLabel = el("label", "settings-label");
      animLabel.textContent = "Animations";
      const animCheck = el("input", "settings-check");
      animCheck.type = "checkbox";
      animCheck.checked = getSetting("animationsEnabled");
      animCheck.addEventListener("change", () => {
        setSetting("animationsEnabled", animCheck.checked);
        applyAnimations();
      });
      animRow.append(animLabel, animCheck);
      themeSection.appendChild(animRow);
      body.appendChild(themeSection);
      const notationSection = makeSection("Number Format");
      const notationRow = el("div", "settings-row");
      const notationLabel = el("label", "settings-label");
      notationLabel.textContent = "Notation";
      const notationSelect = el("select", "settings-select");
      for (const [val, label] of [["standard", "Standard (1.2K)"], ["scientific", "Scientific (1.2e3)"], ["engineering", "Engineering (1.2K)"]]) {
        const opt = el("option");
        opt.value = val;
        opt.textContent = label;
        if (getSetting("notation") === val) opt.selected = true;
        notationSelect.appendChild(opt);
      }
      notationSelect.addEventListener("change", () => {
        setSetting("notation", notationSelect.value);
        setNotation(notationSelect.value);
      });
      notationRow.append(notationLabel, notationSelect);
      notationSection.appendChild(notationRow);
      body.appendChild(notationSection);
      const saveSection = makeSection("Auto-Save");
      const saveRow = el("div", "settings-row");
      const saveLabel = el("label", "settings-label");
      saveLabel.textContent = "Interval";
      const saveSelect = el("select", "settings-select");
      for (const [val, label] of [["15", "15 seconds"], ["30", "30 seconds"], ["60", "1 minute"], ["120", "2 minutes"], ["300", "5 minutes"]]) {
        const opt = el("option");
        opt.value = val;
        opt.textContent = label;
        if (String(getSetting("autoSaveInterval")) === val) opt.selected = true;
        saveSelect.appendChild(opt);
      }
      saveSelect.addEventListener("change", () => {
        const interval = parseInt(saveSelect.value);
        setSetting("autoSaveInterval", interval);
        stopAutoSave();
        startAutoSave(interval);
      });
      saveRow.append(saveLabel, saveSelect);
      saveSection.appendChild(saveRow);
      body.appendChild(saveSection);
      const soundSection = makeSection("Sound");
      const soundRow = el("div", "settings-row");
      const soundLabel = el("label", "settings-label");
      soundLabel.textContent = "Sound Effects";
      const soundCheck = el("input", "settings-check");
      soundCheck.type = "checkbox";
      soundCheck.checked = getSetting("soundEnabled");
      soundCheck.addEventListener("change", () => {
        setSetting("soundEnabled", soundCheck.checked);
        setEnabled(soundCheck.checked);
      });
      soundRow.append(soundLabel, soundCheck);
      soundSection.appendChild(soundRow);
      const volRow = el("div", "settings-row");
      const volLabel = el("label", "settings-label");
      volLabel.textContent = "Volume";
      const volSlider = el("input", "settings-slider");
      volSlider.type = "range";
      volSlider.min = "0";
      volSlider.max = "100";
      volSlider.value = Math.round(getSetting("soundVolume") * 100);
      volSlider.addEventListener("input", () => {
        const vol = parseInt(volSlider.value) / 100;
        setSetting("soundVolume", vol);
        setVolume(vol);
      });
      volRow.append(volLabel, volSlider);
      soundSection.appendChild(volRow);
      body.appendChild(soundSection);
      const dataSection = makeSection("Data Management");
      const btnRow = el("div", "settings-btn-row");
      const statusEl = el("div", "settings-status");
      function showStatus(text) {
        statusEl.textContent = text;
        statusEl.classList.remove("settings-status--visible");
        void statusEl.offsetWidth;
        statusEl.classList.add("settings-status--visible");
      }
      const btnSave = el("button", "ctrl-btn");
      btnSave.textContent = "\u{1F4BE} Save";
      btnSave.addEventListener("click", () => {
        save();
        showStatus("Game saved.");
        emitter.emit("logMessage", { text: "%SAVE-6-INFO: Game saved.", type: "success", category: "system" });
      });
      const btnLoad = el("button", "ctrl-btn");
      btnLoad.textContent = "\u{1F4C2} Load";
      btnLoad.addEventListener("click", () => {
        if (load()) {
          if (rebuildCallback) rebuildCallback();
          showStatus("Game loaded.");
          emitter.emit("logMessage", { text: "%SAVE-6-INFO: Game loaded.", type: "success", category: "system" });
        }
      });
      const btnExport = el("button", "ctrl-btn");
      btnExport.textContent = "\u{1F4CB} Export";
      btnExport.addEventListener("click", () => {
        const str = exportSave();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(str).then(
            () => {
              showStatus("Save exported to clipboard.");
              emitter.emit("logMessage", { text: "%SAVE-6-INFO: Save exported to clipboard.", type: "success", category: "system" });
            },
            () => {
              window.prompt("Copy this save string:", str);
            }
          );
        } else {
          window.prompt("Copy this save string:", str);
        }
      });
      const btnImport = el("button", "ctrl-btn");
      btnImport.textContent = "\u{1F4E5} Import";
      btnImport.addEventListener("click", () => {
        const str = window.prompt("Paste save string:");
        if (str && importSave(str)) {
          if (rebuildCallback) rebuildCallback();
          showStatus("Save imported.");
          emitter.emit("logMessage", { text: "%SAVE-6-INFO: Save imported.", type: "success", category: "system" });
        }
      });
      btnRow.append(btnSave, btnLoad, btnExport, btnImport);
      dataSection.appendChild(btnRow);
      dataSection.appendChild(statusEl);
      const wipeBtn = el("button", "ctrl-btn ctrl-btn--danger");
      wipeBtn.textContent = "\u{1F5D1} Wipe All Progress";
      wipeBtn.addEventListener("click", () => {
        if (window.confirm("Wipe all progress? This cannot be undone.")) {
          wipeSave();
          if (rebuildCallback) rebuildCallback();
          emitter.emit("logMessage", { text: "%SAVE-4-WARN: Progress wiped. Starting fresh.", type: "warning", category: "system" });
        }
      });
      dataSection.appendChild(wipeBtn);
      body.appendChild(dataSection);
      const creditsSection = makeSection("About");
      const creditsText = el("p", "settings-credits");
      creditsText.innerHTML = 'Source of Truth or Consequences - an idle game by <a href="https://github.com/bnelsontx" target="_blank" rel="noopener noreferrer">bnelsontx</a>. Inspired by the real pain (and joy) of network automation.';
      creditsSection.appendChild(creditsText);
      body.appendChild(creditsSection);
    });
  }
  function makeSection(title) {
    const section = el("div", "settings-section");
    const titleEl = el("h3", "settings-section-title");
    titleEl.textContent = title;
    section.appendChild(titleEl);
    return section;
  }

  // js/ui/resourcePanel.js
  var CATEGORY_ORDER = ["basic", "intermediate", "advanced", "rare", "meta"];
  var CATEGORY_LABELS = {
    basic: "Basic",
    intermediate: "Intermediate",
    advanced: "Advanced",
    rare: "Rare",
    meta: "Meta"
  };
  var collapsedCategories = /* @__PURE__ */ new Set();
  var sidebarEl;
  var lastUnlockedCount = 0;
  var prevAmounts = /* @__PURE__ */ new Map();
  var expandedRow = null;
  var expandedDetail = null;
  var expandedId = null;
  var expandedDef = null;
  var detailHeaderEl = null;
  var detailBreakdownEl = null;
  var breakdownDirty = true;
  function init10(containerEl) {
    sidebarEl = containerEl;
    rebuild();
    emitter.on("unlockChanged", ({ category }) => {
      if (category === "resources") rebuild();
    });
    emitter.on("buildingPurchased", () => {
      breakdownDirty = true;
    });
    emitter.on("workerAssigned", () => {
      breakdownDirty = true;
    });
    emitter.on("workerArrived", () => {
      breakdownDirty = true;
    });
    emitter.on("upgradePurchased", () => {
      breakdownDirty = true;
    });
  }
  function rebuild() {
    collapseDetail();
    sidebarEl.innerHTML = "";
    lastUnlockedCount = gameState.unlocked.resources.size;
    const byCategory = /* @__PURE__ */ new Map();
    for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
    for (const id of gameState.unlocked.resources) {
      const def = data.resources.get(id);
      if (!def) continue;
      const cat = def.category || "basic";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push({ id, def });
    }
    for (const cat of CATEGORY_ORDER) {
      const resources = byCategory.get(cat);
      if (!resources || resources.length === 0) continue;
      const totalInCategory = [...data.resources.values()].filter((d) => (d.category || "basic") === cat).length;
      const group = el("div", "resource-category");
      group.dataset.category = cat;
      const header = el("div", "resource-category-header");
      header.addEventListener("click", () => {
        if (collapsedCategories.has(cat)) {
          collapsedCategories.delete(cat);
          group.classList.remove("resource-category--collapsed");
          chevron.textContent = "\u25BE";
        } else {
          collapsedCategories.add(cat);
          group.classList.add("resource-category--collapsed");
          chevron.textContent = "\u25B8";
        }
      });
      const catName = el("span", "category-name");
      catName.textContent = `${CATEGORY_LABELS[cat] || cat} (${resources.length}/${totalInCategory})`;
      const chevron = el("span", "category-chevron");
      chevron.textContent = collapsedCategories.has(cat) ? "\u25B8" : "\u25BE";
      header.append(catName, chevron);
      if (collapsedCategories.has(cat)) group.classList.add("resource-category--collapsed");
      const items = el("div", "resource-category-items");
      for (const { id, def } of resources) {
        const row = el("div", "resource-row");
        row.dataset.id = id;
        const iconEl = el("span", "res-icon");
        iconEl.textContent = ICON_MAP[id] || def.name.charAt(0);
        const name = el("span", "res-name");
        name.textContent = def.name;
        const value = el("span", "res-value");
        const rate = el("span", "res-rate");
        row.append(iconEl, name, value, rate);
        row.addEventListener("click", () => toggleDetail(id, def, row));
        items.appendChild(row);
      }
      group.append(header, items);
      sidebarEl.appendChild(group);
    }
  }
  function render() {
    if (gameState.unlocked.resources.size !== lastUnlockedCount) {
      rebuild();
    }
    const rows = sidebarEl.querySelectorAll(".resource-row");
    for (const row of rows) {
      const id = row.dataset.id;
      const res = gameState.resources[id];
      if (!res) continue;
      const valueEl = row.querySelector(".res-value");
      const rateEl = row.querySelector(".res-rate");
      const prev = prevAmounts.get(id) ?? res.amount;
      const current = res.amount;
      if (Math.abs(current - prev) > 0.5) {
        valueEl.textContent = `${formatNum(current)} / ${formatNum(res.cap)}`;
      } else {
        valueEl.textContent = `${formatNum(current)} / ${formatNum(res.cap)}`;
      }
      prevAmounts.set(id, current);
      const rate = getPerSecondRate(id);
      if (rate !== 0) {
        rateEl.textContent = formatRate(rate);
        rateEl.className = rate > 0 ? "res-rate rate-positive" : "res-rate rate-negative";
      } else {
        rateEl.textContent = "";
        rateEl.className = "res-rate";
      }
      const atCap = res.amount >= res.cap && res.cap > 0;
      if (atCap) {
        row.classList.add("res-row--capped");
        valueEl.classList.add("res-value--capped");
      } else {
        row.classList.remove("res-row--capped");
        valueEl.classList.remove("res-value--capped");
      }
    }
    if (expandedDetail && expandedId) {
      updateDetailHeader(expandedId, expandedDef);
      if (breakdownDirty) {
        breakdownDirty = false;
        detailBreakdownEl.innerHTML = "";
        detailBreakdownEl.appendChild(buildBreakdownContent(expandedId, expandedDef));
      }
    }
  }
  function updateDetailHeader(id, def) {
    if (!detailHeaderEl) return;
    const desc = detailHeaderEl.querySelector(".tooltip-desc");
    if (desc) desc.textContent = def.description || "";
    const amountEl = detailHeaderEl.querySelector(".tooltip-amount");
    const res = gameState.resources[id];
    if (amountEl && res) {
      amountEl.textContent = `${formatNum(res.amount)} / ${formatNum(res.cap)}`;
    }
  }
  function buildBreakdownContent(id, def) {
    const frag = document.createDocumentFragment();
    const breakdown = el("div", "tooltip-breakdown");
    const breakdownTitle = el("div", "tooltip-breakdown-title");
    breakdownTitle.textContent = "Production";
    breakdown.appendChild(breakdownTitle);
    let hasBreakdown = false;
    for (const [bId, bDef] of data.buildings) {
      const count = gameState.buildings[bId]?.count || 0;
      if (count === 0) continue;
      for (const effect of bDef.effects) {
        if (effect.type === "production" && effect.resourceId === id) {
          const val = effect.amount * count;
          const line = el("div", `tooltip-line tooltip-line--link${val < 0 ? " tooltip-line--negative" : ""}`);
          line.dataset.navType = "building";
          line.dataset.navId = bId;
          const sign = val >= 0 ? "+" : "";
          line.textContent = `${bDef.name} (x${count}): ${sign}${formatNum(val)}/tick`;
          breakdown.appendChild(line);
          hasBreakdown = true;
        }
      }
    }
    for (const [wId, wDef] of data.workers) {
      const count = gameState.workers[wId]?.count || 0;
      if (count === 0) continue;
      for (const p of wDef.produces) {
        if (p.resourceId === id) {
          const val = p.amount * count;
          const line = el("div", `tooltip-line tooltip-line--link${val < 0 ? " tooltip-line--negative" : ""}`);
          line.dataset.navType = "worker";
          line.dataset.navId = wId;
          const sign = val >= 0 ? "+" : "";
          line.textContent = `${wDef.name} (x${count}): ${sign}${formatNum(val)}/tick`;
          breakdown.appendChild(line);
          hasBreakdown = true;
        }
      }
      for (const c of wDef.consumes) {
        if (c.resourceId === id) {
          const line = el("div", "tooltip-line tooltip-line--negative tooltip-line--link");
          line.dataset.navType = "worker";
          line.dataset.navId = wId;
          line.textContent = `${wDef.name} (x${count}): -${formatNum(c.amount * count)}/tick`;
          breakdown.appendChild(line);
          hasBreakdown = true;
        }
      }
    }
    if (hasBreakdown) {
      const netRate = getPerSecondRate(id);
      const totalLine = el("div", "tooltip-line tooltip-line--total");
      totalLine.textContent = `Net: ${formatRate(netRate)}`;
      totalLine.className += netRate >= 0 ? "" : " tooltip-line--negative";
      breakdown.appendChild(totalLine);
      frag.appendChild(breakdown);
    }
    const capSection = el("div", "tooltip-breakdown");
    const capTitle = el("div", "tooltip-breakdown-title");
    capTitle.textContent = "Storage Cap";
    capSection.appendChild(capTitle);
    const baseLine = el("div", "tooltip-line");
    baseLine.textContent = `Base: ${formatNum(def.baseCap)}`;
    capSection.appendChild(baseLine);
    let hasCapBonus = false;
    for (const [bId, bDef] of data.buildings) {
      const count = gameState.buildings[bId]?.count || 0;
      if (count === 0) continue;
      for (const effect of bDef.effects) {
        if (effect.type === "cap_increase" && effect.resourceId === id) {
          const line = el("div", "tooltip-line tooltip-line--link");
          line.dataset.navType = "building";
          line.dataset.navId = bId;
          line.textContent = `${bDef.name} (x${count}): +${formatNum(effect.amount * count)}`;
          capSection.appendChild(line);
          hasCapBonus = true;
        }
      }
    }
    for (const [uId, uDef] of data.upgrades) {
      if (!gameState.upgrades[uId]?.purchased) continue;
      for (const effect of uDef.effects) {
        if (effect.type === "cap_increase" && effect.target === id) {
          const line = el("div", "tooltip-line tooltip-line--link");
          line.dataset.navType = "upgrade";
          line.dataset.navId = uId;
          line.textContent = `${uDef.name}: +${formatNum(effect.amount)}`;
          capSection.appendChild(line);
          hasCapBonus = true;
        }
      }
    }
    if (hasCapBonus) frag.appendChild(capSection);
    const upgradeSection = el("div", "tooltip-breakdown");
    const upgradeTitle = el("div", "tooltip-breakdown-title");
    upgradeTitle.textContent = "Bonuses";
    upgradeSection.appendChild(upgradeTitle);
    let hasUpgradeBonus = false;
    let totalBonus = 0;
    for (const [uId, uDef] of data.upgrades) {
      if (!gameState.upgrades[uId]?.purchased) continue;
      for (const effect of uDef.effects) {
        if (effect.type === "ratio" && effect.target === id) {
          const line = el("div", "tooltip-line tooltip-line--link");
          line.dataset.navType = "upgrade";
          line.dataset.navId = uId;
          line.textContent = `${uDef.name}: +${Math.round(effect.amount * 100)}%`;
          upgradeSection.appendChild(line);
          totalBonus += effect.amount;
          hasUpgradeBonus = true;
        }
      }
    }
    if (hasUpgradeBonus) {
      const totalLine = el("div", "tooltip-line tooltip-line--total");
      totalLine.textContent = `Total bonus: +${Math.round(totalBonus * 100)}%`;
      upgradeSection.appendChild(totalLine);
      frag.appendChild(upgradeSection);
    }
    return frag;
  }
  function toggleDetail(id, def, row) {
    if (expandedRow === row) {
      collapseDetail();
      return;
    }
    collapseDetail();
    expandedDetail = el("div", "resource-detail");
    expandedDetail.addEventListener("click", (e) => {
      const link = e.target.closest(".tooltip-line--link");
      if (!link) return;
      const { navType, navId } = link.dataset;
      if (navType && navId) navigateTo(navType, navId);
    });
    detailHeaderEl = el("div", "resource-detail-header");
    const desc = el("div", "tooltip-desc");
    desc.textContent = def.description || "";
    const amountLine = el("div", "tooltip-amount");
    const res = gameState.resources[id];
    if (res) amountLine.textContent = `${formatNum(res.amount)} / ${formatNum(res.cap)}`;
    detailHeaderEl.append(desc, amountLine);
    detailBreakdownEl = el("div", "resource-detail-breakdown");
    detailBreakdownEl.appendChild(buildBreakdownContent(id, def));
    breakdownDirty = false;
    expandedDetail.append(detailHeaderEl, detailBreakdownEl);
    row.after(expandedDetail);
    row.classList.add("resource-row--expanded");
    expandedRow = row;
    expandedId = id;
    expandedDef = def;
    requestAnimationFrame(() => {
      expandedDetail.classList.add("resource-detail--open");
      expandedDetail.style.maxHeight = expandedDetail.scrollHeight + "px";
      const detail = expandedDetail;
      detail.addEventListener("transitionend", function onEnd(e) {
        if (e.propertyName === "max-height") {
          detail.removeEventListener("transitionend", onEnd);
          detail.style.maxHeight = "none";
        }
      });
    });
  }
  function collapseDetail() {
    if (expandedDetail) {
      expandedDetail.remove();
      expandedDetail = null;
    }
    if (expandedRow) {
      expandedRow.classList.remove("resource-row--expanded");
      expandedRow = null;
    }
    expandedId = null;
    expandedDef = null;
    detailHeaderEl = null;
    detailBreakdownEl = null;
  }

  // js/ui/buildingPanel.js
  var ERA_ORDER3 = [
    "the_terminal",
    "scripting_and_hope",
    "the_platform",
    "full_netdevops",
    "multi_site_empire",
    "the_cloud",
    "support"
  ];
  var ERA_NAMES = {
    the_terminal: "Era I \u2014 The Terminal",
    scripting_and_hope: "Era II \u2014 Scripting & Hope",
    the_platform: "Era III \u2014 The Platform",
    full_netdevops: "Era IV \u2014 Full NetDevOps",
    multi_site_empire: "Era V \u2014 Multi-Site Empire",
    the_cloud: "Era VI \u2014 The Cloud",
    support: "Support"
  };
  var collapsedEras = /* @__PURE__ */ new Set();
  var selectedQty = /* @__PURE__ */ new Map();
  var panelEl;
  var lastUnlockedCount2 = 0;
  function getPinnedSet() {
    return new Set(getSetting("pinnedBuildings") || []);
  }
  function togglePin(id) {
    const pinned = getPinnedSet();
    if (pinned.has(id)) {
      pinned.delete(id);
    } else {
      pinned.add(id);
    }
    setSetting("pinnedBuildings", [...pinned]);
    rebuild2();
  }
  function init11(containerEl) {
    panelEl = containerEl;
    rebuild2();
    panelEl.addEventListener("click", (e) => {
      const link = e.target.closest(".resource-link");
      if (!link) return;
      const resId = link.dataset.resourceId;
      if (resId) navigateTo("resource", resId);
    });
    emitter.on("unlockChanged", ({ category }) => {
      if (category === "buildings") rebuild2();
    });
    return render2;
  }
  function getQty(id) {
    return selectedQty.get(id) || 1;
  }
  function buyBuilding(id, qty, card) {
    if (qty <= 0) return;
    const result = purchase(id, qty);
    if (result.success) {
      playBuild();
      render();
      render2();
      card.classList.add("bld-card--built");
      card.addEventListener("animationend", () => card.classList.remove("bld-card--built"), { once: true });
      const bldDef = data.buildings.get(id);
      const msg = `%BUILD-5-COMPLETE: Built ${bldDef?.name || id} x${qty} (total: ${gameState.buildings[id].count})`;
      emitter.emit("logMessage", { text: msg, type: "success", category: "building" });
      if (result.flavorText) {
        emitter.emit("logMessage", { text: result.flavorText, type: "info", category: "building" });
      }
    }
  }
  function buildCard(id, def, isPinned) {
    const card = el("div", "building-card");
    card.dataset.id = id;
    const cardHeader = el("div", "bld-header");
    const nameSpan = el("span", "bld-name");
    nameSpan.textContent = def.name;
    const countBadge = el("span", "bld-count-badge");
    const pinBtn = el("button", "bld-pin-btn");
    pinBtn.textContent = isPinned ? "\u{1F4CC}" : "\u{1F4CD}";
    pinBtn.title = isPinned ? "Unpin" : "Pin to top";
    pinBtn.setAttribute("aria-label", isPinned ? `Unpin ${def.name}` : `Pin ${def.name} to top`);
    if (isPinned) pinBtn.classList.add("bld-pin-btn--active");
    pinBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePin(id);
    });
    cardHeader.append(nameSpan, countBadge, pinBtn);
    const descEl = el("div", "bld-desc");
    descEl.textContent = def.description || "";
    const effectsEl = el("div", "bld-effects");
    for (const effect of def.effects) {
      const resDef = data.resources.get(effect.resourceId);
      const name = resDef ? resDef.name : effect.resourceId;
      const tag = el("span", "bld-effect-tag");
      if (effect.type === "production") {
        tag.textContent = `+${effect.amount} ${name}`;
        tag.classList.add("bld-effect-tag--positive", "resource-link");
        tag.dataset.resourceId = effect.resourceId;
      } else if (effect.type === "housing") {
        tag.textContent = `\u{1F3E0} ${effect.amount}`;
        tag.classList.add("bld-effect-tag--info");
      } else if (effect.type === "consumption") {
        tag.textContent = `-${effect.amount} ${name}`;
        tag.classList.add("bld-effect-tag--negative", "resource-link");
        tag.dataset.resourceId = effect.resourceId;
      } else if (effect.type === "happiness_bonus") {
        tag.textContent = `+${effect.amount}% happy`;
        tag.classList.add("bld-effect-tag--info");
      } else if (effect.type === "productivity_bonus") {
        tag.textContent = `+${effect.amount}% prod`;
        tag.classList.add("bld-effect-tag--info");
      } else if (effect.type === "speed_bonus") {
        tag.textContent = `+${effect.amount}% speed`;
        tag.classList.add("bld-effect-tag--info");
      } else if (effect.type === "cap_increase") {
        tag.textContent = `+${effect.amount} ${name} cap`;
        tag.classList.add("bld-effect-tag--info", "resource-link");
        tag.dataset.resourceId = effect.resourceId;
      } else {
        continue;
      }
      effectsEl.appendChild(tag);
    }
    const costsEl = el("div", "bld-costs");
    const controlsRow = el("div", "bld-controls");
    const batchSelector = el("div", "batch-selector");
    for (const qty of [1, 10, 25, 100]) {
      const btn = el("button", "batch-btn");
      btn.textContent = qty;
      btn.dataset.qty = qty;
      if (getQty(id) === qty) btn.classList.add("batch-btn--active");
      btn.addEventListener("click", () => {
        selectedQty.set(id, qty);
        batchSelector.querySelectorAll(".batch-btn").forEach((b) => b.classList.remove("batch-btn--active"));
        btn.classList.add("batch-btn--active");
      });
      batchSelector.appendChild(btn);
    }
    const maxBtn = el("button", "batch-btn");
    maxBtn.textContent = "Max";
    maxBtn.dataset.qty = "max";
    if (getQty(id) === "max") maxBtn.classList.add("batch-btn--active");
    maxBtn.addEventListener("click", () => {
      selectedQty.set(id, "max");
      batchSelector.querySelectorAll(".batch-btn").forEach((b) => b.classList.remove("batch-btn--active"));
      maxBtn.classList.add("batch-btn--active");
    });
    batchSelector.appendChild(maxBtn);
    const buildBtn = el("button", "bld-build-btn");
    buildBtn.textContent = "Build";
    buildBtn.addEventListener("click", () => {
      const q = getQty(id);
      const actual = q === "max" ? getMaxAffordable(id) : q;
      buyBuilding(id, actual, card);
    });
    controlsRow.append(batchSelector, buildBtn);
    card.append(cardHeader, descEl, effectsEl, costsEl, controlsRow);
    return card;
  }
  function buildEraGroup(eraKey, eraLabel, buildings, pinned) {
    const group = el("div", "era-group");
    group.dataset.era = eraKey;
    const header = el("div", "era-header");
    const eraName = el("span", "era-name");
    eraName.textContent = eraLabel;
    const chevron = el("span", "era-chevron");
    chevron.textContent = collapsedEras.has(eraKey) ? "\u25B8" : "\u25BE";
    header.append(eraName, chevron);
    if (collapsedEras.has(eraKey)) group.classList.add("era-group--collapsed");
    header.addEventListener("click", () => {
      if (collapsedEras.has(eraKey)) {
        collapsedEras.delete(eraKey);
        group.classList.remove("era-group--collapsed");
        chevron.textContent = "\u25BE";
      } else {
        collapsedEras.add(eraKey);
        group.classList.add("era-group--collapsed");
        chevron.textContent = "\u25B8";
      }
    });
    const items = el("div", "era-items");
    for (const { id, def } of buildings) {
      items.appendChild(buildCard(id, def, pinned.has(id)));
    }
    group.append(header, items);
    return group;
  }
  function rebuild2() {
    panelEl.innerHTML = "";
    lastUnlockedCount2 = gameState.unlocked.buildings.size;
    const pinned = getPinnedSet();
    let pruned = false;
    for (const id of pinned) {
      if (!gameState.unlocked.buildings.has(id)) {
        pinned.delete(id);
        pruned = true;
      }
    }
    if (pruned) setSetting("pinnedBuildings", [...pinned]);
    const byEra = /* @__PURE__ */ new Map();
    for (const era of ERA_ORDER3) byEra.set(era, []);
    for (const id of gameState.unlocked.buildings) {
      const def = data.buildings.get(id);
      if (!def) continue;
      const era = def.era || "support";
      if (!byEra.has(era)) byEra.set(era, []);
      byEra.get(era).push({ id, def });
    }
    if (pinned.size > 0) {
      const pinnedBuildings = [...pinned].map((id) => ({ id, def: data.buildings.get(id) })).filter((entry) => entry.def);
      if (pinnedBuildings.length > 0) {
        panelEl.appendChild(buildEraGroup("pinned", "Pinned", pinnedBuildings, pinned));
      }
    }
    for (const era of ERA_ORDER3) {
      const buildings = byEra.get(era);
      if (!buildings || buildings.length === 0) continue;
      panelEl.appendChild(buildEraGroup(era, ERA_NAMES[era] || era, buildings, pinned));
    }
  }
  function render2() {
    if (gameState.unlocked.buildings.size !== lastUnlockedCount2) {
      rebuild2();
    }
    const cards = panelEl.querySelectorAll(".building-card");
    for (const card of cards) {
      const id = card.dataset.id;
      const bld = gameState.buildings[id];
      if (!bld) continue;
      const countBadge = card.querySelector(".bld-count-badge");
      if (bld.count > 0) {
        countBadge.textContent = `x${bld.count}`;
        countBadge.style.display = "";
      } else {
        countBadge.style.display = "none";
      }
      const q = getQty(id);
      const displayQty = q === "max" ? Math.max(getMaxAffordable(id), 1) : q;
      const costs = calculateCost(id, displayQty);
      const costsEl = card.querySelector(".bld-costs");
      let costLabel = costsEl.querySelector(".bld-cost-label");
      let costSpans = costsEl.querySelectorAll(".resource-link");
      if (!costLabel || costSpans.length !== costs.length) {
        costsEl.innerHTML = "";
        costLabel = el("span", "bld-cost-label");
        costsEl.appendChild(costLabel);
        for (let i = 0; i < costs.length; i++) {
          const span = el("span", "resource-link");
          span.dataset.resourceId = costs[i].resourceId;
          costsEl.appendChild(span);
          if (i < costs.length - 1) costsEl.appendChild(document.createTextNode("  \xB7  "));
        }
        costSpans = costsEl.querySelectorAll(".resource-link");
      }
      costLabel.textContent = q === "max" ? `Cost (max ${getMaxAffordable(id)}): ` : `Cost (x${displayQty}): `;
      for (let i = 0; i < costs.length; i++) {
        const c = costs[i];
        const resDef = data.resources.get(c.resourceId);
        const name = resDef ? resDef.name : c.resourceId;
        const res = gameState.resources[c.resourceId];
        const affordable2 = res && res.amount >= c.totalAmount;
        costSpans[i].className = affordable2 ? "cost-affordable resource-link" : "cost-unaffordable resource-link";
        costSpans[i].textContent = `${formatNum(c.totalAmount)} ${name}`;
      }
      const buildBtn = card.querySelector(".bld-build-btn");
      const actualQty = q === "max" ? getMaxAffordable(id) : q;
      const affordable = q === "max" ? actualQty > 0 : canAfford(id, q);
      buildBtn.disabled = !affordable;
      const anyAffordable = canAfford(id, 1) || getMaxAffordable(id) > 0;
      card.classList.toggle("building-card--dimmed", !anyAffordable);
    }
  }

  // js/ui/tabManager.js
  var tabs = /* @__PURE__ */ new Map();
  var tabBarEl;
  var tabPanelsEl;
  var activeTabId = null;
  function init12(barEl, panelsEl) {
    tabs.clear();
    activeTabId = null;
    tabBarEl = barEl;
    tabPanelsEl = panelsEl;
  }
  function registerTab(id, label, initFn, options = {}) {
    const unlocked = options.unlocked !== false;
    const btn = el("button", "tab-btn");
    btn.dataset.tab = id;
    const labelSpan = el("span", "tab-label");
    labelSpan.textContent = label;
    btn.appendChild(labelSpan);
    const badge = el("span", "tab-badge");
    badge.style.display = "none";
    btn.appendChild(badge);
    btn.addEventListener("click", () => switchTo(id));
    if (!unlocked) btn.style.display = "none";
    tabBarEl.appendChild(btn);
    const panel = el("div", "tab-panel");
    panel.dataset.tab = id;
    panel.style.display = "none";
    tabPanelsEl.appendChild(panel);
    const tabInfo = { id, label, btn, badge, panel, initFn, renderFn: null, unlocked };
    tabs.set(id, tabInfo);
    if (unlocked) {
      tabInfo.renderFn = initFn(panel);
    }
    if (!activeTabId && unlocked) {
      switchTo(id);
    }
  }
  function switchTo(tabId) {
    const tab = tabs.get(tabId);
    if (!tab || !tab.unlocked) return;
    for (const [, t] of tabs) {
      t.btn.classList.remove("tab-btn--active");
      t.panel.style.display = "none";
    }
    tab.btn.classList.add("tab-btn--active");
    tab.panel.style.display = "";
    tab.panel.style.opacity = "0";
    requestAnimationFrame(() => {
      tab.panel.style.opacity = "1";
    });
    activeTabId = tabId;
    if (tab.renderFn) tab.renderFn();
  }
  function setTabBadge(tabId, count) {
    const tab = tabs.get(tabId);
    if (!tab) return;
    if (count > 0) {
      tab.badge.textContent = count;
      tab.badge.style.display = "";
      tab.badge.classList.remove("tab-badge--dot");
    } else {
      tab.badge.style.display = "none";
    }
  }
  function unlockTab(tabId) {
    const tab = tabs.get(tabId);
    if (!tab || tab.unlocked) return;
    tab.unlocked = true;
    tab.btn.style.display = "";
    tab.btn.classList.add("tab-btn--new");
    setTimeout(() => tab.btn.classList.remove("tab-btn--new"), 2500);
    if (!tab.renderFn) {
      tab.renderFn = tab.initFn(tab.panel);
    }
  }
  function renderActiveTab() {
    if (!activeTabId) return;
    const tab = tabs.get(activeTabId);
    if (tab && tab.renderFn) tab.renderFn();
  }

  // js/ui/villagePanel.js
  var panelEl2;
  var lastUnlockedCount3 = 0;
  function sortByLastFirst(a, b) {
    const aParts = a.split(" ");
    const bParts = b.split(" ");
    const aLast = aParts.length > 1 ? aParts[aParts.length - 1] : a;
    const bLast = bParts.length > 1 ? bParts[bParts.length - 1] : b;
    if (aLast !== bLast) return aLast.localeCompare(bLast);
    return aParts[0].localeCompare(bParts[0]);
  }
  function pluralizeRole(name, count) {
    if (count === 1) return name;
    return name + "s";
  }
  function init13(containerEl) {
    panelEl2 = containerEl;
    rebuild3();
    panelEl2.addEventListener("click", (e) => {
      const link = e.target.closest(".resource-link");
      if (!link) return;
      const resId = link.dataset.resourceId;
      if (resId) navigateTo("resource", resId);
    });
    emitter.on("unlockChanged", ({ category }) => {
      if (category === "workers") rebuild3();
    });
    emitter.on("workerArrived", () => {
      render3();
    });
    return render3;
  }
  function rebuild3() {
    panelEl2.innerHTML = "";
    lastUnlockedCount3 = gameState.unlocked.workers.size;
    const summary = el("div", "village-summary");
    const popCounter = el("div", "population-counter");
    popCounter.dataset.role = "pop-counter";
    summary.appendChild(popCounter);
    const freeWorkers = el("div", "free-workers");
    freeWorkers.dataset.role = "free-workers";
    summary.appendChild(freeWorkers);
    const happinessSection = el("div", "happiness-indicator");
    const happinessBarOuter = el("div", "happiness-bar-outer");
    const happinessBar = el("div", "happiness-bar");
    happinessBarOuter.appendChild(happinessBar);
    const happinessValue = el("span", "happiness-value");
    happinessSection.append(happinessBarOuter, happinessValue);
    const happinessTooltip = el("div", "happiness-tooltip");
    happinessTooltip.style.display = "none";
    happinessSection.appendChild(happinessTooltip);
    happinessSection.addEventListener("mouseenter", () => {
      const factors = getHappinessBreakdown();
      happinessTooltip.innerHTML = "";
      const title = el("div", "tooltip-breakdown-title");
      title.textContent = "Happiness Factors:";
      happinessTooltip.appendChild(title);
      if (factors.length === 0) {
        const line = el("div", "tooltip-line");
        line.textContent = "Base: 100%";
        happinessTooltip.appendChild(line);
      } else {
        const baseLine = el("div", "tooltip-line");
        baseLine.textContent = "Base: 100%";
        happinessTooltip.appendChild(baseLine);
        for (const f of factors) {
          const line = el("div", "tooltip-line");
          const sign = f.value > 0 ? "+" : "";
          line.textContent = `${f.name}: ${sign}${f.value}%`;
          line.className = f.value > 0 ? "tooltip-line" : "tooltip-line tooltip-line--negative";
          happinessTooltip.appendChild(line);
        }
      }
      happinessTooltip.style.display = "";
    });
    happinessSection.addEventListener("mouseleave", () => {
      happinessTooltip.style.display = "none";
    });
    summary.appendChild(happinessSection);
    panelEl2.appendChild(summary);
    const rolesSection = el("div", "worker-roles");
    for (const roleId of gameState.unlocked.workers) {
      const def = data.workers.get(roleId);
      if (!def) continue;
      const row = el("div", "worker-role-row");
      row.dataset.role = roleId;
      const header = el("div", "worker-role-header");
      const roleName = el("span", "role-name");
      roleName.textContent = def.name;
      const roleCount = el("span", "role-count");
      header.append(roleName, roleCount);
      const roleDesc = el("p", "role-desc");
      roleDesc.textContent = def.description || "";
      const footer = el("div", "worker-role-footer");
      const rates = el("div", "role-rates");
      const rateProduces = el("span", "role-rate-positive");
      for (let i = 0; i < def.produces.length; i++) {
        const p = def.produces[i];
        const resDef = data.resources.get(p.resourceId);
        const name = resDef ? resDef.name : p.resourceId;
        const resSpan = el("span", "resource-link");
        resSpan.dataset.resourceId = p.resourceId;
        resSpan.textContent = `+${p.amount} ${name}`;
        rateProduces.appendChild(resSpan);
        if (i < def.produces.length - 1) rateProduces.appendChild(document.createTextNode(", "));
      }
      const rateConsumes = el("span", "role-rate-negative");
      for (let i = 0; i < def.consumes.length; i++) {
        const c = def.consumes[i];
        const resDef = data.resources.get(c.resourceId);
        const name = resDef ? resDef.name : c.resourceId;
        const resSpan = el("span", "resource-link");
        resSpan.dataset.resourceId = c.resourceId;
        resSpan.textContent = `-${c.amount} ${name}`;
        rateConsumes.appendChild(resSpan);
        if (i < def.consumes.length - 1) rateConsumes.appendChild(document.createTextNode(", "));
      }
      rates.append(rateProduces);
      if (def.consumes.length > 0) {
        rates.append(document.createTextNode(" | "), rateConsumes);
      }
      const controls = el("div", "role-controls");
      const minusBtn = el("button", "worker-assign-btn");
      minusBtn.textContent = "\u2212";
      minusBtn.addEventListener("click", () => assignWorker(roleId, -1));
      const assignedSpan = el("span", "role-assigned");
      const plusBtn = el("button", "worker-assign-btn");
      plusBtn.textContent = "+";
      plusBtn.addEventListener("click", () => assignWorker(roleId, 1));
      controls.append(minusBtn, assignedSpan, plusBtn);
      footer.append(rates, controls);
      row.append(header, roleDesc, footer);
      rolesSection.appendChild(row);
    }
    panelEl2.appendChild(rolesSection);
    const census = el("div", "worker-census");
    const censusHeader = el("div", "census-header");
    censusHeader.textContent = "Census";
    censusHeader.addEventListener("click", () => {
      census.classList.toggle("worker-census--collapsed");
    });
    const censusList = el("div", "census-list");
    census.append(censusHeader, censusList);
    panelEl2.appendChild(census);
  }
  function render3() {
    if (gameState.unlocked.workers.size !== lastUnlockedCount3) {
      rebuild3();
    }
    const pop = gameState.population;
    const housing = getTotalHousing();
    const popCounter = panelEl2.querySelector('[data-role="pop-counter"]');
    if (popCounter) popCounter.textContent = `Engineers: ${pop.total} / ${housing} housed`;
    const freeEl = panelEl2.querySelector('[data-role="free-workers"]');
    if (freeEl) {
      freeEl.textContent = `Unassigned: ${pop.free}`;
      freeEl.className = pop.free > 0 ? "free-workers free-workers--has-free" : "free-workers";
    }
    const happinessBar = panelEl2.querySelector(".happiness-bar");
    const happinessValue = panelEl2.querySelector(".happiness-value");
    if (happinessBar) {
      happinessBar.style.width = `${pop.happiness}%`;
      if (pop.happiness > 70) {
        happinessBar.className = "happiness-bar happiness-bar--good";
      } else if (pop.happiness > 40) {
        happinessBar.className = "happiness-bar happiness-bar--warning";
      } else {
        happinessBar.className = "happiness-bar happiness-bar--critical";
      }
    }
    if (happinessValue) happinessValue.textContent = `${pop.happiness}%`;
    const rows = panelEl2.querySelectorAll(".worker-role-row");
    for (const row of rows) {
      const roleId = row.dataset.role;
      const count = gameState.workers[roleId]?.count || 0;
      const roleCount = row.querySelector(".role-count");
      if (roleCount) roleCount.textContent = ` (${count} assigned)`;
      const assignedSpan = row.querySelector(".role-assigned");
      if (assignedSpan) assignedSpan.textContent = count;
      const minusBtn = row.querySelector(".worker-assign-btn:first-child");
      const plusBtn = row.querySelector(".worker-assign-btn:last-child");
      if (minusBtn) minusBtn.disabled = count <= 0;
      if (plusBtn) plusBtn.disabled = pop.free <= 0;
    }
    const censusList = panelEl2.querySelector(".census-list");
    if (censusList) {
      let renderGroup = function(label, names) {
        names.sort(sortByLastFirst);
        const entry = el("div", "census-entry");
        const strong = el("strong", "census-role-label");
        strong.textContent = label + ":";
        entry.appendChild(strong);
        entry.appendChild(document.createTextNode(" " + names.join(", ")));
        censusList.appendChild(entry);
      };
      censusList.innerHTML = "";
      const censusHeader = panelEl2.querySelector(".census-header");
      if (censusHeader) censusHeader.textContent = `Census (${pop.total} engineers)`;
      const roleNames = /* @__PURE__ */ new Map();
      let nameIdx = 0;
      for (const [roleId, roleDef] of data.workers) {
        const count = gameState.workers[roleId]?.count || 0;
        if (count === 0) continue;
        const names = [];
        for (let i = 0; i < count; i++) {
          names.push(nameIdx < pop.names.length ? pop.names[nameIdx] : `Worker #${nameIdx + 1}`);
          nameIdx++;
        }
        roleNames.set(roleId, names);
      }
      const unassigned = [];
      for (let i = nameIdx; i < pop.names.length; i++) unassigned.push(pop.names[i]);
      for (let i = Math.max(nameIdx, pop.names.length); i < pop.total; i++) unassigned.push(`Worker #${i + 1}`);
      if (unassigned.length > 0) renderGroup("Unassigned", unassigned);
      const unlockedRoles = [...gameState.unlocked.workers].reverse();
      for (const roleId of unlockedRoles) {
        const names = roleNames.get(roleId);
        if (!names) continue;
        const roleDef = data.workers.get(roleId);
        renderGroup(pluralizeRole(roleDef.name, names.length), names);
      }
    }
    setTabBadge("village", pop.free);
  }

  // js/ui/researchPanel.js
  var ERA_ORDER4 = [
    "the_terminal",
    "scripting_and_hope",
    "the_platform",
    "full_netdevops",
    "multi_site_empire",
    "the_cloud"
  ];
  var ERA_NAMES2 = {
    the_terminal: "Era I: The Terminal",
    scripting_and_hope: "Era II: Scripting & Hope",
    the_platform: "Era III: The Platform",
    full_netdevops: "Era IV: Full NetDevOps",
    multi_site_empire: "Era V: Multi-Site Empire",
    the_cloud: "Era VI: The Cloud"
  };
  var collapsedEras2 = /* @__PURE__ */ new Set();
  var completedCollapsed = true;
  var panelEl3;
  var lastUnlockedCount4 = 0;
  var lastResearchedCount = 0;
  function init14(containerEl) {
    panelEl3 = containerEl;
    rebuild4();
    panelEl3.addEventListener("click", (e) => {
      const link = e.target.closest(".resource-link");
      if (!link) return;
      const resId = link.dataset.resourceId;
      if (resId) navigateTo("resource", resId);
    });
    emitter.on("unlockChanged", ({ category }) => {
      if (category === "technologies") rebuild4();
    });
    emitter.on("researchCompleted", () => rebuild4());
    emitter.on("researchStarted", () => rebuild4());
    emitter.on("researchCancelled", () => rebuild4());
    return render4;
  }
  function rebuild4() {
    panelEl3.innerHTML = "";
    lastUnlockedCount4 = gameState.unlocked.technologies.size;
    lastResearchedCount = countResearched();
    const activeId = getActiveResearch();
    if (activeId) {
      const def = data.technologies.get(activeId);
      const progress = getResearchProgress(activeId);
      const section = el("div", "research-active");
      const header = el("div", "research-active-header");
      const nameEl = el("span", "tech-name");
      nameEl.textContent = `Researching: ${def.name}`;
      const cancelBtn = el("button", "tech-cancel-btn");
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", () => cancelResearch());
      header.append(nameEl, cancelBtn);
      const descEl = el("div", "tech-desc");
      descEl.textContent = def.description;
      const progressOuter = el("div", "tech-progress-outer");
      const progressBar = el("div", "tech-progress-bar");
      progressBar.style.width = `${Math.round(progress.percent * 100)}%`;
      progressOuter.appendChild(progressBar);
      const progressText = el("span", "tech-progress-text");
      progressText.textContent = `${progress.current} / ${progress.total} ticks`;
      section.append(header, descEl, progressOuter, progressText);
      panelEl3.appendChild(section);
    }
    const byEra = /* @__PURE__ */ new Map();
    for (const era of ERA_ORDER4) byEra.set(era, []);
    const completedTechs = [];
    for (const id of gameState.unlocked.technologies) {
      const def = data.technologies.get(id);
      if (!def) continue;
      const techState = gameState.technologies[id];
      if (techState?.researched) {
        completedTechs.push({ id, def });
        continue;
      }
      if (id === activeId) continue;
      let prereqsMet = true;
      for (const prereq of def.prerequisites) {
        if (!gameState.technologies[prereq]?.researched) {
          prereqsMet = false;
          break;
        }
      }
      if (!prereqsMet) continue;
      const era = def.era || "the_terminal";
      if (!byEra.has(era)) byEra.set(era, []);
      byEra.get(era).push({ id, def });
    }
    for (const era of ERA_ORDER4) {
      const techs = byEra.get(era);
      if (!techs || techs.length === 0) continue;
      const group = el("div", "era-group");
      group.dataset.era = era;
      const header = el("div", "era-header");
      const eraName = el("span", "era-name");
      eraName.textContent = ERA_NAMES2[era] || era;
      const chevron = el("span", "era-chevron");
      chevron.textContent = collapsedEras2.has(era) ? "\u25B8" : "\u25BE";
      header.append(eraName, chevron);
      if (collapsedEras2.has(era)) {
        group.classList.add("era-group--collapsed");
      }
      header.addEventListener("click", () => {
        if (collapsedEras2.has(era)) {
          collapsedEras2.delete(era);
          group.classList.remove("era-group--collapsed");
          chevron.textContent = "\u25BC";
        } else {
          collapsedEras2.add(era);
          group.classList.add("era-group--collapsed");
          chevron.textContent = "\u25B6";
        }
      });
      const items = el("div", "era-items");
      for (const { id, def } of techs) {
        const card = el("div", "tech-card");
        card.dataset.id = id;
        const cardHeader = el("div", "tech-header");
        const nameSpan = el("span", "tech-name");
        nameSpan.textContent = def.name;
        cardHeader.appendChild(nameSpan);
        const descEl = el("div", "tech-desc");
        descEl.textContent = def.description;
        const costsEl = el("div", "tech-costs");
        const timeEl = el("div", "tech-time");
        const seconds = (def.researchTicks * 0.2).toFixed(0);
        timeEl.textContent = `Research time: ${def.researchTicks} ticks (~${seconds}s)`;
        const unlocksEl = el("div", "tech-unlocks");
        const unlockParts = [];
        if (def.unlocks) {
          for (const bid of def.unlocks.buildings || []) {
            const bDef = data.buildings.get(bid);
            if (bDef) unlockParts.push(bDef.name);
          }
          for (const rid of def.unlocks.resources || []) {
            const rDef = data.resources.get(rid);
            if (rDef) unlockParts.push(rDef.name);
          }
          for (const tid of def.unlocks.technologies || []) {
            const tDef = data.technologies.get(tid);
            if (tDef) unlockParts.push(tDef.name);
          }
          for (const wid of def.unlocks.workers || []) {
            const wDef = data.workers.get(wid);
            if (wDef) unlockParts.push(wDef.name);
          }
          for (const uid of def.unlocks.upgrades || []) {
            const uDef = data.upgrades.get(uid);
            if (uDef) unlockParts.push(uDef.name);
          }
          for (const other of def.unlocks.other || []) {
            unlockParts.push(other);
          }
        }
        if (unlockParts.length > 0) {
          unlocksEl.textContent = `Unlocks: ${unlockParts.join(", ")}`;
        }
        const buttons = el("div", "tech-buttons");
        const researchBtn = el("button", "tech-research-btn");
        researchBtn.textContent = "Research";
        researchBtn.dataset.id = id;
        researchBtn.addEventListener("click", () => {
          startResearch(id);
        });
        buttons.appendChild(researchBtn);
        card.append(cardHeader, descEl, costsEl, unlocksEl, timeEl, buttons);
        items.appendChild(card);
      }
      group.append(header, items);
      panelEl3.appendChild(group);
    }
    if (completedTechs.length > 0) {
      const section = el("div", "completed-section");
      const header = el("div", "era-header");
      const name = el("span", "era-name");
      name.textContent = `Completed (${completedTechs.length})`;
      const chevron = el("span", "era-chevron");
      chevron.textContent = completedCollapsed ? "\u25B6" : "\u25BC";
      header.append(name, chevron);
      if (completedCollapsed) {
        section.classList.add("era-group--collapsed");
      }
      header.addEventListener("click", () => {
        completedCollapsed = !completedCollapsed;
        section.classList.toggle("era-group--collapsed");
        chevron.textContent = completedCollapsed ? "\u25B6" : "\u25BC";
      });
      const items = el("div", "era-items");
      for (const { id, def } of completedTechs) {
        const card = el("div", "tech-card tech-card--completed");
        const cardHeader = el("div", "tech-header");
        const check = el("span", "tech-check");
        check.textContent = "\u2713";
        const nameSpan = el("span", "tech-name");
        nameSpan.textContent = def.name;
        cardHeader.append(check, nameSpan);
        const flavorEl = el("div", "tech-desc");
        flavorEl.textContent = def.flavorOnResearch || "";
        card.append(cardHeader, flavorEl);
        items.appendChild(card);
      }
      section.append(header, items);
      panelEl3.appendChild(section);
    }
  }
  function countResearched() {
    let count = 0;
    for (const id of gameState.unlocked.technologies) {
      if (gameState.technologies[id]?.researched) count++;
    }
    return count;
  }
  function render4() {
    if (gameState.unlocked.technologies.size !== lastUnlockedCount4 || countResearched() !== lastResearchedCount) {
      rebuild4();
      return;
    }
    const activeId = getActiveResearch();
    const activeSection = panelEl3.querySelector(".research-active");
    if (activeSection && activeId) {
      const progress = getResearchProgress(activeId);
      const bar = activeSection.querySelector(".tech-progress-bar");
      if (bar) bar.style.width = `${Math.round(progress.percent * 100)}%`;
      const text = activeSection.querySelector(".tech-progress-text");
      if (text) text.textContent = `${progress.current} / ${progress.total} ticks`;
    }
    const cards = panelEl3.querySelectorAll(".tech-card:not(.tech-card--completed)");
    for (const card of cards) {
      const id = card.dataset.id;
      if (!id) continue;
      const def = data.technologies.get(id);
      if (!def) continue;
      const costsEl = card.querySelector(".tech-costs");
      if (costsEl) {
        let costSpans = costsEl.querySelectorAll(".resource-link");
        if (costSpans.length !== def.costs.length) {
          costsEl.innerHTML = "";
          for (let i = 0; i < def.costs.length; i++) {
            const span = el("span", "resource-link");
            span.dataset.resourceId = def.costs[i].resourceId;
            costsEl.appendChild(span);
            if (i < def.costs.length - 1) costsEl.appendChild(document.createTextNode(", "));
          }
          costSpans = costsEl.querySelectorAll(".resource-link");
        }
        for (let i = 0; i < def.costs.length; i++) {
          const cost = def.costs[i];
          const resDef = data.resources.get(cost.resourceId);
          const name = resDef ? resDef.name : cost.resourceId;
          const res = gameState.resources[cost.resourceId];
          const affordable = res && res.amount >= cost.amount;
          costSpans[i].className = affordable ? "cost-affordable resource-link" : "cost-unaffordable resource-link";
          costSpans[i].textContent = `${formatNum(cost.amount)} ${name}`;
        }
      }
      const btn = card.querySelector(".tech-research-btn");
      if (btn) {
        btn.disabled = !canResearch(id);
      }
    }
  }

  // js/engine/upgradeManager.js
  function canPurchaseUpgrade(upgradeId) {
    if (!gameState.unlocked.upgrades.has(upgradeId)) return false;
    if (gameState.upgrades[upgradeId]?.purchased) return false;
    const def = data.upgrades.get(upgradeId);
    if (!def) return false;
    for (const cost of def.costs) {
      const res = getResource(cost.resourceId);
      if (!res || res.amount < cost.amount) return false;
    }
    return true;
  }
  function purchaseUpgrade(upgradeId) {
    if (!canPurchaseUpgrade(upgradeId)) return { success: false };
    const def = data.upgrades.get(upgradeId);
    for (const cost of def.costs) {
      addResource(cost.resourceId, -cost.amount);
    }
    gameState.upgrades[upgradeId].purchased = true;
    recalculateRates();
    tick2();
    emitter.emit("upgradePurchased", { upgradeId });
    emitter.emit("logMessage", {
      text: `%UPGRADE-5-PURCHASED: ${def.name} installed!`,
      type: "success",
      category: "system"
    });
    if (def.description) {
      emitter.emit("logMessage", {
        text: def.description,
        type: "info",
        category: "system"
      });
    }
    return { success: true };
  }
  function getEffectDescription(effect) {
    const resDef = data.resources.get(effect.target);
    const name = resDef ? resDef.name : effect.target;
    switch (effect.type) {
      case "ratio":
        return `+${Math.round(effect.amount * 100)}% ${name} production`;
      case "cap_increase":
        return `+${effect.amount} ${name} storage`;
      case "reduction":
        return `-${Math.round(effect.amount * 100)}% ${name} generation`;
      default:
        return `${effect.type}: ${effect.amount} ${name}`;
    }
  }

  // js/ui/workshopPanel.js
  var CATEGORY_ORDER2 = ["productivity", "quality_of_life", "infrastructure", "late_game"];
  var CATEGORY_LABELS2 = {
    productivity: "Productivity",
    quality_of_life: "Quality of Life",
    infrastructure: "Infrastructure",
    late_game: "Late Game"
  };
  var collapsedCategories2 = /* @__PURE__ */ new Set();
  var purchasedCollapsed = true;
  var panelEl4;
  var lastUpgradeUnlockedCount = 0;
  var lastCraftingUnlockedCount = 0;
  var lastPurchasedCount = 0;
  function init15(containerEl) {
    panelEl4 = containerEl;
    rebuild5();
    panelEl4.addEventListener("click", (e) => {
      const link = e.target.closest(".resource-link");
      if (!link) return;
      const resId = link.dataset.resourceId;
      if (resId) navigateTo("resource", resId);
    });
    emitter.on("unlockChanged", ({ category }) => {
      if (category === "upgrades" || category === "crafting") rebuild5();
    });
    emitter.on("upgradePurchased", () => rebuild5());
    emitter.on("craftCompleted", () => rebuild5());
    emitter.on("craftStarted", () => rebuild5());
    return render5;
  }
  function rebuild5() {
    panelEl4.innerHTML = "";
    lastUpgradeUnlockedCount = gameState.unlocked.upgrades.size;
    lastCraftingUnlockedCount = gameState.unlocked.crafting?.size || 0;
    lastPurchasedCount = countPurchased();
    const upgradeTitle = el("div", "section-title");
    upgradeTitle.textContent = "Upgrades";
    panelEl4.appendChild(upgradeTitle);
    const byCategory = /* @__PURE__ */ new Map();
    for (const cat of CATEGORY_ORDER2) byCategory.set(cat, []);
    const purchased = [];
    for (const id of gameState.unlocked.upgrades) {
      const def = data.upgrades.get(id);
      if (!def) continue;
      if (gameState.upgrades[id]?.purchased) {
        purchased.push({ id, def });
        continue;
      }
      const cat = def.category || "productivity";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push({ id, def });
    }
    for (const cat of CATEGORY_ORDER2) {
      const upgrades = byCategory.get(cat);
      if (!upgrades || upgrades.length === 0) continue;
      const group = el("div", "era-group");
      group.dataset.category = cat;
      const header = el("div", "era-header");
      const catName = el("span", "era-name");
      catName.textContent = CATEGORY_LABELS2[cat] || cat;
      const chevron = el("span", "era-chevron");
      chevron.textContent = collapsedCategories2.has(cat) ? "\u25B6" : "\u25BC";
      header.append(catName, chevron);
      if (collapsedCategories2.has(cat)) {
        group.classList.add("era-group--collapsed");
      }
      header.addEventListener("click", () => {
        if (collapsedCategories2.has(cat)) {
          collapsedCategories2.delete(cat);
          group.classList.remove("era-group--collapsed");
          chevron.textContent = "\u25BC";
        } else {
          collapsedCategories2.add(cat);
          group.classList.add("era-group--collapsed");
          chevron.textContent = "\u25B6";
        }
      });
      const items = el("div", "era-items");
      for (const { id, def } of upgrades) {
        const card = el("div", "upgrade-card");
        card.dataset.id = id;
        const cardHeader = el("div", "upgrade-header");
        const nameSpan = el("span", "upgrade-name");
        nameSpan.textContent = def.name;
        cardHeader.appendChild(nameSpan);
        const descEl = el("div", "upgrade-desc");
        descEl.textContent = def.description;
        const costsEl = el("div", "upgrade-costs");
        const effectsEl = el("div", "upgrade-effects");
        for (let i = 0; i < def.effects.length; i++) {
          const e = def.effects[i];
          const span = el("span", "resource-link");
          span.dataset.resourceId = e.target;
          span.textContent = getEffectDescription(e);
          effectsEl.appendChild(span);
          if (i < def.effects.length - 1) effectsEl.appendChild(document.createTextNode(", "));
        }
        const buttons = el("div", "upgrade-buttons");
        const buyBtn = el("button", "upgrade-buy-btn");
        buyBtn.textContent = "Purchase";
        buyBtn.dataset.id = id;
        buyBtn.addEventListener("click", () => {
          const result = purchaseUpgrade(id);
          if (result.success) {
            card.classList.add("upgrade-card--purchased-anim");
            card.addEventListener("animationend", () => card.classList.remove("upgrade-card--purchased-anim"), { once: true });
          }
        });
        buttons.appendChild(buyBtn);
        card.append(cardHeader, descEl, costsEl, effectsEl, buttons);
        items.appendChild(card);
      }
      group.append(header, items);
      panelEl4.appendChild(group);
    }
    if (purchased.length > 0) {
      const section = el("div", "completed-section");
      const header = el("div", "era-header");
      const name = el("span", "era-name");
      name.textContent = `Purchased (${purchased.length})`;
      const chevron = el("span", "era-chevron");
      chevron.textContent = purchasedCollapsed ? "\u25B6" : "\u25BC";
      header.append(name, chevron);
      if (purchasedCollapsed) {
        section.classList.add("era-group--collapsed");
      }
      header.addEventListener("click", () => {
        purchasedCollapsed = !purchasedCollapsed;
        section.classList.toggle("era-group--collapsed");
        chevron.textContent = purchasedCollapsed ? "\u25B6" : "\u25BC";
      });
      const items = el("div", "era-items");
      for (const { id, def } of purchased) {
        const card = el("div", "upgrade-card upgrade-card--purchased");
        card.dataset.id = id;
        const cardHeader = el("div", "upgrade-header");
        const check = el("span", "upgrade-check");
        check.textContent = "\u2713";
        const nameSpan = el("span", "upgrade-name");
        nameSpan.textContent = def.name;
        cardHeader.append(check, nameSpan);
        const effectsEl = el("div", "upgrade-effects");
        for (let i = 0; i < def.effects.length; i++) {
          const e = def.effects[i];
          const span = el("span", "resource-link");
          span.dataset.resourceId = e.target;
          span.textContent = getEffectDescription(e);
          effectsEl.appendChild(span);
          if (i < def.effects.length - 1) effectsEl.appendChild(document.createTextNode(", "));
        }
        card.append(cardHeader, effectsEl);
        items.appendChild(card);
      }
      section.append(header, items);
      panelEl4.appendChild(section);
    }
    if (!gameState.unlocked.crafting || gameState.unlocked.crafting.size === 0) return;
    const divider = el("div", "section-divider");
    panelEl4.appendChild(divider);
    const craftTitle = el("div", "section-title");
    craftTitle.textContent = "Crafting Bench";
    panelEl4.appendChild(craftTitle);
    const craftSection = el("div", "crafting-section");
    for (const id of gameState.unlocked.crafting) {
      const def = data.crafting.get(id);
      if (!def) continue;
      const card = el("div", "recipe-card");
      card.dataset.id = id;
      const cardHeader = el("div", "recipe-header");
      const nameSpan = el("span", "recipe-name");
      nameSpan.textContent = def.name;
      cardHeader.appendChild(nameSpan);
      if (isRecipeCrafting(id)) {
        const status = el("span", "recipe-status");
        status.textContent = "Crafting...";
        cardHeader.appendChild(status);
      }
      const descEl = el("div", "recipe-desc");
      descEl.textContent = def.description;
      const ioEl = el("div", "recipe-io");
      const inputsEl = el("div", "recipe-inputs");
      for (let i = 0; i < def.inputs.length; i++) {
        const input = def.inputs[i];
        const resDef = data.resources.get(input.resourceId);
        const name = resDef ? resDef.name : input.resourceId;
        const span = el("span", "resource-link");
        span.dataset.resourceId = input.resourceId;
        span.textContent = `${input.amount} ${name}`;
        inputsEl.appendChild(span);
        if (i < def.inputs.length - 1) inputsEl.appendChild(document.createTextNode(", "));
      }
      const arrow = el("span", "recipe-arrow");
      arrow.textContent = "\u2192";
      const outputsEl = el("div", "recipe-outputs");
      for (let i = 0; i < def.outputs.length; i++) {
        const output = def.outputs[i];
        const resDef = data.resources.get(output.resourceId);
        const name = resDef ? resDef.name : output.resourceId;
        const span = el("span", "resource-link");
        span.dataset.resourceId = output.resourceId;
        span.textContent = `${output.amount} ${name}`;
        outputsEl.appendChild(span);
        if (i < def.outputs.length - 1) outputsEl.appendChild(document.createTextNode(", "));
      }
      ioEl.append(inputsEl, arrow, outputsEl);
      const timeEl = el("div", "recipe-time");
      if (def.craftTicks === 0) {
        timeEl.textContent = "Instant";
      } else {
        const seconds = (def.craftTicks * 0.2).toFixed(0);
        timeEl.textContent = `${def.craftTicks} ticks (~${seconds}s)`;
      }
      const progressOuter = el("div", "recipe-progress-outer");
      const progressBar = el("div", "recipe-progress-bar");
      progressOuter.appendChild(progressBar);
      if (!isRecipeCrafting(id)) {
        progressOuter.style.display = "none";
      } else {
        const progress = getCraftProgress(id);
        progressBar.style.width = `${Math.round(progress.percent * 100)}%`;
      }
      const buttons = el("div", "recipe-buttons");
      const craftBtn = el("button", "recipe-craft-btn");
      craftBtn.textContent = "Craft";
      craftBtn.addEventListener("click", () => {
        craft(id, 1);
      });
      const craftMaxBtn = el("button", "recipe-craft-btn");
      craftMaxBtn.dataset.qty = "max";
      craftMaxBtn.addEventListener("click", () => {
        craftAll(id);
      });
      buttons.append(craftBtn, craftMaxBtn);
      card.append(cardHeader, descEl, ioEl, timeEl, progressOuter, buttons);
      craftSection.appendChild(card);
    }
    panelEl4.appendChild(craftSection);
  }
  function countPurchased() {
    let count = 0;
    for (const id of gameState.unlocked.upgrades) {
      if (gameState.upgrades[id]?.purchased) count++;
    }
    return count;
  }
  function render5() {
    const currentUpgradeCount = gameState.unlocked.upgrades.size;
    const currentCraftingCount = gameState.unlocked.crafting?.size || 0;
    const currentPurchased = countPurchased();
    if (currentUpgradeCount !== lastUpgradeUnlockedCount || currentCraftingCount !== lastCraftingUnlockedCount || currentPurchased !== lastPurchasedCount) {
      rebuild5();
      return;
    }
    const upgradeCards = panelEl4.querySelectorAll(".upgrade-card:not(.upgrade-card--purchased)");
    for (const card of upgradeCards) {
      const id = card.dataset.id;
      if (!id) continue;
      const def = data.upgrades.get(id);
      if (!def) continue;
      const costsEl = card.querySelector(".upgrade-costs");
      if (costsEl) {
        let costSpans = costsEl.querySelectorAll(".resource-link");
        if (costSpans.length !== def.costs.length) {
          costsEl.innerHTML = "";
          for (let i = 0; i < def.costs.length; i++) {
            const span = el("span", "resource-link");
            span.dataset.resourceId = def.costs[i].resourceId;
            costsEl.appendChild(span);
            if (i < def.costs.length - 1) costsEl.appendChild(document.createTextNode(", "));
          }
          costSpans = costsEl.querySelectorAll(".resource-link");
        }
        for (let i = 0; i < def.costs.length; i++) {
          const cost = def.costs[i];
          const resDef = data.resources.get(cost.resourceId);
          const name = resDef ? resDef.name : cost.resourceId;
          const res = gameState.resources[cost.resourceId];
          const affordable = res && res.amount >= cost.amount;
          costSpans[i].className = affordable ? "cost-affordable resource-link" : "cost-unaffordable resource-link";
          costSpans[i].textContent = `${formatNum(cost.amount)} ${name}`;
        }
      }
      const btn = card.querySelector(".upgrade-buy-btn");
      if (btn) btn.disabled = !canPurchaseUpgrade(id);
    }
    const recipeCards = panelEl4.querySelectorAll(".recipe-card");
    for (const card of recipeCards) {
      const id = card.dataset.id;
      if (!id) continue;
      const def = data.crafting.get(id);
      if (!def) continue;
      const inputsEl = card.querySelector(".recipe-inputs");
      if (inputsEl) {
        let inputSpans = inputsEl.querySelectorAll(".resource-link");
        if (inputSpans.length !== def.inputs.length) {
          inputsEl.innerHTML = "";
          for (let i = 0; i < def.inputs.length; i++) {
            const span = el("span", "resource-link");
            span.dataset.resourceId = def.inputs[i].resourceId;
            inputsEl.appendChild(span);
            if (i < def.inputs.length - 1) inputsEl.appendChild(document.createTextNode(", "));
          }
          inputSpans = inputsEl.querySelectorAll(".resource-link");
        }
        for (let i = 0; i < def.inputs.length; i++) {
          const input = def.inputs[i];
          const resDef = data.resources.get(input.resourceId);
          const name = resDef ? resDef.name : input.resourceId;
          const res = gameState.resources[input.resourceId];
          const affordable = res && res.amount >= input.amount;
          inputSpans[i].className = affordable ? "cost-affordable resource-link" : "cost-unaffordable resource-link";
          inputSpans[i].textContent = `${input.amount} ${name}`;
        }
      }
      const progressOuter = card.querySelector(".recipe-progress-outer");
      if (progressOuter) {
        if (isRecipeCrafting(id)) {
          progressOuter.style.display = "";
          const progress = getCraftProgress(id);
          const bar = progressOuter.querySelector(".recipe-progress-bar");
          if (bar) bar.style.width = `${Math.round(progress.percent * 100)}%`;
        } else {
          progressOuter.style.display = "none";
        }
      }
      const craftBtns = card.querySelectorAll(".recipe-craft-btn");
      const crafting = isRecipeCrafting(id);
      const max = getMaxCraftable(id);
      for (const btn of craftBtns) {
        if (btn.dataset.qty === "max") {
          btn.disabled = max <= 0 || crafting;
          btn.textContent = max > 0 ? `Craft Max(${max})` : "Craft Max";
        } else {
          btn.disabled = !canCraft(id, 1);
        }
      }
      const status = card.querySelector(".recipe-status");
      if (status) {
        status.style.display = crafting ? "" : "none";
      }
    }
  }

  // js/ui/gameLog.js
  var LOG_MAX = 200;
  var CATEGORIES = ["system", "building", "worker", "resource", "event", "achievement", "research", "crafting"];
  var STATES = ["log-collapsed", "log-single", "log-small", "log-expanded"];
  var PREFIX_COLORS = {
    SYS: "log-prefix--system",
    CLI: "log-prefix--system",
    BUILD: "log-prefix--build",
    SAVE: "log-prefix--system",
    RESEARCH: "log-prefix--research",
    EVENT: "log-prefix--event",
    STAFF: "log-prefix--staff",
    TRADE: "log-prefix--trade",
    ACHIEVE: "log-prefix--achieve",
    CRAFT: "log-prefix--craft",
    PROD: "log-prefix--resource",
    WORKER: "log-prefix--staff",
    UNLOCK: "log-prefix--achieve",
    PRESTIGE: "log-prefix--event"
  };
  var logEntries = [];
  var activeFilters = new Set(CATEGORIES);
  var gameLogEl;
  var userScrolled = false;
  var logContainer;
  var stateIndex = 2;
  var upBtn;
  var downBtn;
  function setLogState(newIndex) {
    stateIndex = newIndex;
    logContainer.classList.remove(...STATES);
    logContainer.classList.add(STATES[stateIndex]);
    upBtn.disabled = stateIndex >= STATES.length - 1;
    downBtn.disabled = stateIndex <= 0;
  }
  function init16(containerEl) {
    containerEl.innerHTML = "";
    logContainer = containerEl;
    const titleBar = el("div", "log-titlebar");
    const dots = el("span", "log-dots");
    const dotR = el("span", "log-dot log-dot--red");
    const dotY = el("span", "log-dot log-dot--yellow");
    const dotG = el("span", "log-dot log-dot--green");
    dots.append(dotR, dotY, dotG);
    const title = el("span", "log-title");
    title.textContent = "System Log";
    const sizeControls = el("span", "log-size-controls");
    upBtn = el("button", "log-size-btn");
    upBtn.textContent = "\u25B2";
    upBtn.title = "Expand log";
    upBtn.addEventListener("click", () => {
      if (stateIndex < STATES.length - 1) setLogState(stateIndex + 1);
    });
    downBtn = el("button", "log-size-btn");
    downBtn.textContent = "\u25BC";
    downBtn.title = "Collapse log";
    downBtn.addEventListener("click", () => {
      if (stateIndex > 0) setLogState(stateIndex - 1);
    });
    sizeControls.append(upBtn, downBtn);
    titleBar.append(dots, title, sizeControls);
    containerEl.appendChild(titleBar);
    const filterBar = el("div", "log-filters");
    for (const cat of CATEGORIES) {
      const btn = el("button", "log-filter-btn log-filter-btn--active");
      btn.textContent = cat;
      btn.dataset.category = cat;
      btn.addEventListener("click", () => {
        if (activeFilters.has(cat)) {
          activeFilters.delete(cat);
          btn.classList.remove("log-filter-btn--active");
        } else {
          activeFilters.add(cat);
          btn.classList.add("log-filter-btn--active");
        }
        applyFilters();
      });
      filterBar.appendChild(btn);
    }
    containerEl.appendChild(filterBar);
    gameLogEl = el("div", "game-log");
    gameLogEl.addEventListener("scroll", () => {
      const atBottom = gameLogEl.scrollHeight - gameLogEl.scrollTop - gameLogEl.clientHeight < 30;
      userScrolled = !atBottom;
    });
    containerEl.appendChild(gameLogEl);
    setLogState(2);
    emitter.on("logMessage", ({ text, type, category }) => {
      addMessage(text, type, category);
    });
  }
  function parsePrefix(text) {
    const match = text.match(/^(%[A-Z]+-\d+-[A-Z]+:?)/);
    if (match) {
      const prefix = match[1];
      const facility = prefix.split("-")[0].replace("%", "");
      return { prefix, facility, message: text.slice(match[0].length) };
    }
    return null;
  }
  function addMessage(text, type = "info", category = "system") {
    const timestamp = formatTimestamp();
    const entry = { text: `${timestamp} ${text}`, type, category };
    logEntries.push(entry);
    while (logEntries.length > LOG_MAX) {
      logEntries.shift();
      gameLogEl?.firstChild?.remove();
    }
    if (!gameLogEl) return;
    const entryEl = el("div", `log-entry log-${type}`);
    entryEl.dataset.category = category;
    const tsSpan = el("span", "log-ts");
    tsSpan.textContent = timestamp + " ";
    const parsed = parsePrefix(text);
    if (parsed) {
      const prefixSpan = el("span", `log-prefix ${PREFIX_COLORS[parsed.facility] || ""}`);
      prefixSpan.textContent = parsed.prefix;
      const msgSpan = el("span", "log-msg");
      msgSpan.textContent = parsed.message;
      entryEl.append(tsSpan, prefixSpan, msgSpan);
    } else {
      const msgSpan = el("span", "log-msg");
      msgSpan.textContent = text;
      entryEl.append(tsSpan, msgSpan);
    }
    if (!activeFilters.has(category)) {
      entryEl.style.display = "none";
    }
    gameLogEl.appendChild(entryEl);
    if (!userScrolled) {
      gameLogEl.scrollTop = gameLogEl.scrollHeight;
    }
  }
  function applyFilters() {
    if (!gameLogEl) return;
    const entries = gameLogEl.querySelectorAll(".log-entry");
    for (const e of entries) {
      e.style.display = activeFilters.has(e.dataset.category) ? "" : "none";
    }
  }
  function flush() {
    if (!userScrolled && gameLogEl) {
      gameLogEl.scrollTop = gameLogEl.scrollHeight;
    }
  }

  // js/ui/tradePanel.js
  var panelEl5;
  var lastUnlockedCount5 = 0;
  var bulkSelections = {};
  function init17(containerEl) {
    panelEl5 = containerEl;
    rebuild6();
    emitter.on("unlockChanged", ({ category }) => {
      if (category === "trades") rebuild6();
    });
    emitter.on("seasonChanged", () => rebuild6());
    return render6;
  }
  function rebuild6() {
    panelEl5.innerHTML = "";
    lastUnlockedCount5 = gameState.unlocked.trades.size;
    const header = el("h2", "section-title");
    header.textContent = "Trading Post";
    panelEl5.appendChild(header);
    const unlockedPartners = [];
    const lockedPartners = [];
    for (const [id] of data.trades) {
      if (gameState.unlocked.trades.has(id)) {
        unlockedPartners.push(id);
      } else {
        lockedPartners.push(id);
      }
    }
    for (const partnerId of unlockedPartners) {
      panelEl5.appendChild(buildPartnerCard(partnerId));
    }
    if (lockedPartners.length > 0) {
      const lockedSection = el("div", "trade-locked-section");
      const lockedHeader = el("h3", "trade-locked-header");
      lockedHeader.textContent = "Locked Partners";
      lockedSection.appendChild(lockedHeader);
      for (const partnerId of lockedPartners) {
        lockedSection.appendChild(buildLockedCard(partnerId));
      }
      panelEl5.appendChild(lockedSection);
    }
  }
  function buildPartnerCard(partnerId) {
    const partner = data.trades.get(partnerId);
    const available = isPartnerAvailable(partnerId);
    const attitude = getPartnerAttitude(partnerId);
    const card = el("div", "trade-partner-card");
    card.dataset.partner = partnerId;
    if (!available) card.classList.add("trade-partner--unavailable");
    const headerRow = el("div", "trade-partner-header");
    const nameEl = el("span", "trade-partner-name");
    nameEl.textContent = partner.name;
    const personalityEl = el("span", "trade-partner-personality");
    personalityEl.textContent = partner.personality;
    headerRow.append(nameEl, personalityEl);
    const attitudeRow = el("div", "trade-attitude-row");
    const attLabel = el("span", "trade-attitude-label");
    attLabel.textContent = "Reputation";
    const attOuter = el("div", "attitude-bar-outer");
    const attBar = el("div", "attitude-bar");
    attBar.style.width = `${attitude.percent}%`;
    attOuter.appendChild(attBar);
    const attValue = el("span", "attitude-value");
    attValue.textContent = `${attitude.current}/${attitude.max}`;
    attitudeRow.append(attLabel, attOuter, attValue);
    const descEl = el("div", "trade-partner-desc");
    descEl.textContent = partner.description;
    card.append(headerRow, attitudeRow, descEl);
    if (partner.specialDeal) {
      const dealEl = el("div", isSpecialDealUnlocked(partnerId) ? "trade-special-deal" : "trade-special-deal trade-special-deal--locked");
      const dealLabel = el("span", "trade-deal-label");
      if (isSpecialDealUnlocked(partnerId)) {
        dealLabel.textContent = "Special Deal: ";
        const dealDesc = el("span", "trade-deal-desc");
        dealDesc.textContent = partner.specialDeal.description;
        dealEl.append(dealLabel, dealDesc);
      } else {
        dealLabel.textContent = `Special deal at reputation ${partner.specialDeal.unlockAtAttitude}`;
        dealEl.appendChild(dealLabel);
      }
      card.appendChild(dealEl);
    }
    if (!available) {
      const unavailEl = el("div", "trade-unavail-notice");
      unavailEl.textContent = partner.seasonalAvailability || "Currently unavailable";
      card.appendChild(unavailEl);
    }
    const tradesContainer = el("div", "trade-list");
    for (const trade of partner.trades) {
      tradesContainer.appendChild(buildTradeRow(partnerId, trade, available));
    }
    card.appendChild(tradesContainer);
    return card;
  }
  function buildTradeRow(partnerId, trade, available) {
    const row = el("div", "trade-row");
    row.dataset.trade = trade.id;
    const costsEl = el("div", "trade-give");
    const giveLabel = el("span", "trade-label");
    giveLabel.textContent = "Give: ";
    costsEl.appendChild(giveLabel);
    for (const cost of trade.give) {
      const resDef = data.resources.get(cost.resourceId);
      const span = el("span", "trade-cost-item");
      span.dataset.resource = cost.resourceId;
      span.textContent = `${formatNum(cost.amount)} ${resDef?.name || cost.resourceId}`;
      costsEl.appendChild(span);
    }
    const arrowEl = el("span", "trade-arrow");
    arrowEl.textContent = "\u2192";
    const receiveEl = el("div", "trade-receive");
    const recvLabel = el("span", "trade-label");
    recvLabel.textContent = "Receive: ";
    receiveEl.appendChild(recvLabel);
    for (const item of trade.receive) {
      const span = el("span", "trade-recv-item");
      if (item.type === "timed_bonus") {
        span.textContent = `${item.amount > 0 ? "+" : ""}${Math.round(item.amount * 100)}% ${item.target} (${item.duration} ticks)`;
      } else {
        const resDef = data.resources.get(item.resourceId);
        const sign = item.amount >= 0 ? "+" : "";
        span.textContent = `${sign}${formatNum(item.amount)} ${resDef?.name || item.resourceId}`;
      }
      receiveEl.appendChild(span);
    }
    const metaRow = el("div", "trade-meta");
    if (trade.successRate < 1) {
      const rateEl = el("span", "trade-success-rate");
      const pct = Math.round(trade.successRate * 100);
      rateEl.textContent = `${pct}% success`;
      rateEl.classList.add(pct >= 80 ? "rate-high" : pct >= 50 ? "rate-mid" : "rate-low");
      metaRow.appendChild(rateEl);
    }
    if (trade.notes) {
      const notesEl = el("span", "trade-notes");
      notesEl.textContent = trade.notes;
      metaRow.appendChild(notesEl);
    }
    const bulkKey = `${partnerId}_${trade.id}`;
    if (!bulkSelections[bulkKey]) bulkSelections[bulkKey] = 1;
    const controlsRow = el("div", "trade-controls");
    const bulkSelector = el("div", "trade-bulk-selector");
    for (const amt of [1, 5, 10]) {
      const btn = el("button", "trade-bulk-btn");
      btn.textContent = `${amt}x`;
      btn.dataset.amount = amt;
      if (bulkSelections[bulkKey] === amt) btn.classList.add("trade-bulk-btn--active");
      btn.addEventListener("click", () => {
        bulkSelections[bulkKey] = amt;
        bulkSelector.querySelectorAll(".trade-bulk-btn").forEach((b) => b.classList.remove("trade-bulk-btn--active"));
        btn.classList.add("trade-bulk-btn--active");
      });
      bulkSelector.appendChild(btn);
    }
    const maxBtn = el("button", "trade-bulk-btn");
    maxBtn.textContent = "Max";
    maxBtn.addEventListener("click", () => {
      const max = getMaxTradeQuantity(partnerId, trade.id);
      bulkSelections[bulkKey] = Math.max(1, max);
      bulkSelector.querySelectorAll(".trade-bulk-btn").forEach((b) => b.classList.remove("trade-bulk-btn--active"));
      maxBtn.classList.add("trade-bulk-btn--active");
    });
    bulkSelector.appendChild(maxBtn);
    const execBtn = makeBtn("Trade", () => {
      const qty = bulkSelections[bulkKey] || 1;
      executeTrade(partnerId, trade.id, qty);
    }, "trade-execute-btn");
    execBtn.disabled = !available;
    controlsRow.append(bulkSelector, execBtn);
    row.append(costsEl, arrowEl, receiveEl, metaRow, controlsRow);
    return row;
  }
  function buildLockedCard(partnerId) {
    const partner = data.trades.get(partnerId);
    const card = el("div", "trade-partner-locked");
    const nameEl = el("div", "trade-locked-name");
    nameEl.textContent = "???";
    const hintEl = el("div", "trade-locked-hint");
    if (partner.unlockCondition) {
      const cond = partner.unlockCondition;
      if (cond.type === "era") hintEl.textContent = `Unlocks in era: ${cond.era.replace(/_/g, " ")}`;
      else if (cond.type === "tech") hintEl.textContent = `Requires technology research`;
      else if (cond.type === "resource") hintEl.textContent = `Requires ${cond.amount} of a resource`;
      else if (cond.type === "season") hintEl.textContent = `Seasonal partner`;
      else hintEl.textContent = "Locked";
    } else {
      hintEl.textContent = "Locked";
    }
    card.append(nameEl, hintEl);
    return card;
  }
  function render6() {
    if (gameState.unlocked.trades.size !== lastUnlockedCount5) {
      rebuild6();
      return;
    }
    const cards = panelEl5.querySelectorAll(".trade-partner-card");
    for (const card of cards) {
      const partnerId = card.dataset.partner;
      const available = isPartnerAvailable(partnerId);
      card.classList.toggle("trade-partner--unavailable", !available);
      const attitude = getPartnerAttitude(partnerId);
      const attBar = card.querySelector(".attitude-bar");
      if (attBar) attBar.style.width = `${attitude.percent}%`;
      const attValue = card.querySelector(".attitude-value");
      if (attValue) attValue.textContent = `${attitude.current}/${attitude.max}`;
      const rows = card.querySelectorAll(".trade-row");
      for (const row of rows) {
        const tradeId = row.dataset.trade;
        const bulkKey = `${partnerId}_${tradeId}`;
        const qty = bulkSelections[bulkKey] || 1;
        const check = canTrade(partnerId, tradeId, qty);
        const execBtn = row.querySelector(".trade-execute-btn");
        if (execBtn) execBtn.disabled = !check.affordable || !available;
        const costItems = row.querySelectorAll(".trade-cost-item");
        for (const item of costItems) {
          const resId = item.dataset.resource;
          const res = gameState.resources[resId];
          const trade = data.trades.get(partnerId).trades.find((t) => t.id === tradeId);
          const cost = trade?.give.find((g) => g.resourceId === resId);
          if (res && cost) {
            item.classList.toggle("cost-affordable", res.amount >= cost.amount * qty);
            item.classList.toggle("cost-unaffordable", res.amount < cost.amount * qty);
          }
        }
      }
    }
  }

  // js/ui/eventPanel.js
  var bannerEl;
  var bannerVisible = false;
  var panelEl6;
  function initEventBanner(container) {
    bannerEl = el("div", "event-banner");
    bannerEl.style.display = "none";
    container.appendChild(bannerEl);
    emitter.on("eventFired", ({ eventId, eventDef }) => showBanner(eventId, eventDef));
    emitter.on("eventDismissed", () => hideBanner());
    emitter.on("eventResolved", () => hideBanner());
  }
  function showBanner(eventId, eventDef) {
    playEvent();
    bannerEl.innerHTML = "";
    bannerEl.className = "event-banner";
    bannerEl.classList.add(`event-banner--${eventDef.type}`);
    bannerEl.style.display = "";
    bannerVisible = true;
    const header = el("div", "event-banner-header");
    const badge = el("span", "event-type-badge");
    badge.textContent = eventDef.type.toUpperCase();
    const title = el("span", "event-banner-title");
    title.textContent = eventDef.name;
    header.append(badge, title);
    const desc = el("div", "event-banner-desc");
    desc.textContent = eventDef.description;
    bannerEl.append(header, desc);
    if (eventDef.type === "choice" && eventDef.choices) {
      const choiceList = el("div", "event-choice-list");
      for (const choice of eventDef.choices) {
        const choiceBtn = el("button", "event-choice-btn");
        const choiceText = el("div", "event-choice-text");
        choiceText.textContent = choice.text;
        const choiceDesc = el("div", "event-choice-desc");
        choiceDesc.textContent = choice.description;
        choiceBtn.append(choiceText, choiceDesc);
        if (choice.costs && choice.costs.length > 0) {
          const costsEl = el("div", "event-choice-costs");
          costsEl.textContent = "Cost: " + choice.costs.map((c) => {
            const resDef = data.resources.get(c.resourceId);
            return `${formatNum(c.amount)} ${resDef?.name || c.resourceId}`;
          }).join(", ");
          choiceBtn.appendChild(costsEl);
          const canAfford2 = choice.costs.every((c) => {
            const res = gameState.resources[c.resourceId];
            return res && res.amount >= c.amount;
          });
          if (!canAfford2) choiceBtn.disabled = true;
        }
        if (choice.conditions && !evaluateCondition(choice.conditions)) {
          choiceBtn.disabled = true;
          choiceBtn.title = "Conditions not met";
        }
        choiceBtn.addEventListener("click", () => {
          const result = makeChoice(choice.id);
          if (!result.success && result.reason === "insufficient_resources") {
            choiceBtn.classList.add("event-choice-btn--error");
            setTimeout(() => choiceBtn.classList.remove("event-choice-btn--error"), 500);
          }
        });
        choiceList.appendChild(choiceBtn);
      }
      bannerEl.appendChild(choiceList);
    } else {
      const effectsList = el("div", "event-banner-effects");
      for (const effect of eventDef.effects || []) {
        const line = el("div", "event-effect-line");
        if (effect.type === "resource") {
          const resDef = data.resources.get(effect.resourceId);
          const sign = effect.amount >= 0 ? "+" : "";
          line.textContent = `${sign}${formatNum(effect.amount)} ${resDef?.name || effect.resourceId}`;
          line.classList.add(effect.amount >= 0 ? "effect-positive" : "effect-negative");
        } else if (effect.type === "production_modifier") {
          const sign = effect.amount >= 0 ? "+" : "";
          line.textContent = `${sign}${Math.round(effect.amount * 100)}% ${effect.target} production (${effect.duration || "\u221E"} ticks)`;
        }
        effectsList.appendChild(line);
      }
      bannerEl.appendChild(effectsList);
      const dismissBtn = makeBtn("Dismiss", () => dismissEvent(), "event-dismiss-btn");
      bannerEl.appendChild(dismissBtn);
    }
  }
  function hideBanner() {
    if (bannerEl) {
      bannerEl.style.display = "none";
      bannerEl.innerHTML = "";
      bannerVisible = false;
    }
  }
  function renderEventBanner() {
    const active = getActiveEvent();
    if (!active && bannerVisible) {
      hideBanner();
    }
    if (active && !bannerVisible) {
      const eventDef = data.events.get(active.eventId);
      if (eventDef) showBanner(active.eventId, eventDef);
    }
    if (active && bannerVisible) {
      updateChoiceAffordability();
    }
  }
  function updateChoiceAffordability() {
    if (!bannerEl) return;
    const active = getActiveEvent();
    if (!active) return;
    const eventDef = data.events.get(active.eventId);
    if (!eventDef || !eventDef.choices) return;
    const btns = bannerEl.querySelectorAll(".event-choice-btn");
    btns.forEach((btn, i) => {
      const choice = eventDef.choices[i];
      if (!choice) return;
      const canAfford2 = (choice.costs || []).every((c) => {
        const res = gameState.resources[c.resourceId];
        return res && res.amount >= c.amount;
      });
      btn.disabled = !canAfford2;
    });
  }
  function init18(containerEl) {
    panelEl6 = containerEl;
    rebuildPanel();
    emitter.on("eventFired", () => rebuildPanel());
    emitter.on("eventResolved", () => rebuildPanel());
    emitter.on("eventDismissed", () => rebuildPanel());
    emitter.on("timedEffectExpired", () => rebuildPanel());
    return renderPanel;
  }
  function rebuildPanel() {
    if (!panelEl6) return;
    panelEl6.innerHTML = "";
    const title = el("h2", "section-title");
    title.textContent = "Event Log";
    panelEl6.appendChild(title);
    const effectsSection = el("div", "events-active-section");
    const effectsTitle = el("h3", "events-section-title");
    effectsTitle.textContent = "Active Effects";
    effectsSection.appendChild(effectsTitle);
    const timedEffects = getTimedEffects();
    if (timedEffects.length === 0) {
      const emptyEl = el("div", "events-empty");
      emptyEl.textContent = "No active effects";
      effectsSection.appendChild(emptyEl);
    } else {
      for (const effect of timedEffects) {
        const row = el("div", "timed-effect-row");
        const descEl = el("span", "timed-effect-desc");
        const sign = effect.amount >= 0 ? "+" : "";
        descEl.textContent = `${sign}${Math.round(effect.amount * 100)}% ${effect.target}`;
        const countdownEl = el("span", "timed-effect-countdown");
        if (effect.expiresAtTick === Infinity) {
          countdownEl.textContent = "Permanent";
        } else {
          const ticksLeft = Math.max(0, effect.expiresAtTick - gameState.time.totalTicks);
          const daysLeft = Math.ceil(ticksLeft / 10);
          countdownEl.textContent = `${daysLeft}d remaining`;
        }
        const sourceEl = el("span", "timed-effect-source");
        sourceEl.textContent = effect.sourceId || "";
        row.append(descEl, countdownEl, sourceEl);
        effectsSection.appendChild(row);
      }
    }
    panelEl6.appendChild(effectsSection);
    const historySection = el("div", "events-history-section");
    const historyTitle = el("h3", "events-section-title");
    historyTitle.textContent = "Event History";
    historySection.appendChild(historyTitle);
    const history = getEventHistory();
    if (history.length === 0) {
      const emptyEl = el("div", "events-empty");
      emptyEl.textContent = "No events yet";
      historySection.appendChild(emptyEl);
    } else {
      for (let i = history.length - 1; i >= 0; i--) {
        const entry = history[i];
        const eventDef = data.events.get(entry.eventId);
        if (!eventDef) continue;
        const row = el("div", "event-history-row");
        const timeEl = el("span", "event-history-time");
        timeEl.textContent = `Day ${entry.day}, Year ${entry.year}`;
        const nameEl = el("span", "event-history-name");
        nameEl.textContent = eventDef.name;
        const typeEl = el("span", `event-history-type event-history-type--${eventDef.type}`);
        typeEl.textContent = eventDef.type;
        const outcomeEl = el("span", "event-history-outcome");
        if (entry.outcome && eventDef.choices) {
          const choice = eventDef.choices.find((c) => c.id === entry.outcome);
          outcomeEl.textContent = choice ? `Chose: ${choice.text}` : entry.outcome;
        } else if (entry.outcome) {
          outcomeEl.textContent = entry.outcome;
        }
        row.append(timeEl, nameEl, typeEl, outcomeEl);
        historySection.appendChild(row);
      }
    }
    panelEl6.appendChild(historySection);
  }
  function renderPanel() {
    const effectRows = panelEl6?.querySelectorAll(".timed-effect-row");
    if (!effectRows) return;
    const effects = getTimedEffects();
    if (effectRows.length !== effects.length) {
      rebuildPanel();
      return;
    }
    effectRows.forEach((row, i) => {
      const effect = effects[i];
      if (!effect) return;
      const countdown = row.querySelector(".timed-effect-countdown");
      if (countdown && effect.expiresAtTick !== Infinity) {
        const ticksLeft = Math.max(0, effect.expiresAtTick - gameState.time.totalTicks);
        const daysLeft = Math.ceil(ticksLeft / 10);
        countdown.textContent = `${daysLeft}d remaining`;
      }
    });
  }

  // js/ui/achievementPanel.js
  var CATEGORY_ORDER3 = ["progression", "humor", "secret"];
  var CATEGORY_LABELS3 = {
    progression: "Progression",
    humor: "Humor",
    secret: "Secret"
  };
  var collapsedCategories3 = /* @__PURE__ */ new Set();
  var panelEl7;
  var lastUnlockedCount6 = 0;
  function init19(containerEl) {
    panelEl7 = containerEl;
    rebuild7();
    emitter.on("achievementUnlocked", () => rebuild7());
    return render7;
  }
  function rebuild7() {
    panelEl7.innerHTML = "";
    const counts = getAchievementCount();
    lastUnlockedCount6 = counts.unlocked;
    const header = el("div", "achievement-header");
    const counterEl = el("div", "achievement-panel-counter");
    counterEl.textContent = `Achievements: ${counts.unlocked} / ${counts.total - counts.hiddenRemaining}`;
    header.appendChild(counterEl);
    panelEl7.appendChild(header);
    const byCategory = /* @__PURE__ */ new Map();
    for (const cat of CATEGORY_ORDER3) byCategory.set(cat, []);
    for (const [id, def] of data.achievements) {
      const cat = def.category || "progression";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push({ id, def });
    }
    for (const cat of CATEGORY_ORDER3) {
      const achievements = byCategory.get(cat);
      if (!achievements || achievements.length === 0) continue;
      const unlockedInCat = achievements.filter((a) => isUnlocked(a.id)).length;
      const visibleInCat = achievements.filter((a) => isUnlocked(a.id) || !a.def.hidden).length;
      const group = el("div", "era-group");
      group.dataset.category = cat;
      const groupHeader = el("div", "era-header");
      const catName = el("span", "era-name");
      catName.textContent = `${CATEGORY_LABELS3[cat]} (${unlockedInCat}/${visibleInCat})`;
      const chevron = el("span", "era-chevron");
      chevron.textContent = collapsedCategories3.has(cat) ? "\u25B6" : "\u25BC";
      groupHeader.append(catName, chevron);
      if (collapsedCategories3.has(cat)) {
        group.classList.add("era-group--collapsed");
      }
      groupHeader.addEventListener("click", () => {
        if (collapsedCategories3.has(cat)) {
          collapsedCategories3.delete(cat);
          group.classList.remove("era-group--collapsed");
          chevron.textContent = "\u25BC";
        } else {
          collapsedCategories3.add(cat);
          group.classList.add("era-group--collapsed");
          chevron.textContent = "\u25B6";
        }
      });
      const items = el("div", "era-items");
      for (const { id, def } of achievements) {
        const unlocked = isUnlocked(id);
        if (!unlocked && def.hidden) {
          const card2 = el("div", "achievement-card achievement-card--hidden");
          const nameEl2 = el("div", "achievement-name");
          nameEl2.textContent = "???";
          const descEl2 = el("div", "achievement-desc");
          descEl2.textContent = "Hidden achievement";
          card2.append(nameEl2, descEl2);
          items.appendChild(card2);
          continue;
        }
        const card = el("div", unlocked ? "achievement-card achievement-card--unlocked" : "achievement-card achievement-card--locked");
        card.dataset.id = id;
        const nameEl = el("div", "achievement-name");
        nameEl.textContent = def.name;
        if (unlocked) {
          const check = el("span", "achievement-check");
          check.textContent = " \u2713";
          nameEl.appendChild(check);
        }
        const descEl = el("div", "achievement-desc");
        if (unlocked) {
          descEl.textContent = def.description;
        } else {
          descEl.textContent = getConditionHint(def.condition);
        }
        card.append(nameEl, descEl);
        if (def.reward && unlocked) {
          const rewardEl = el("div", "achievement-reward");
          rewardEl.textContent = getRewardText(def.reward);
          card.appendChild(rewardEl);
        }
        if (!unlocked) {
          const progress = getConditionProgress(def.condition);
          if (progress) {
            const progressOuter = el("div", "achievement-progress-outer");
            const progressBar = el("div", "achievement-progress-bar");
            progressBar.style.width = `${Math.min(100, Math.round(progress.percent * 100))}%`;
            progressOuter.appendChild(progressBar);
            const progressText = el("div", "achievement-progress-text");
            progressText.textContent = `${progress.current} / ${progress.target}`;
            card.append(progressOuter, progressText);
          }
        }
        items.appendChild(card);
      }
      group.append(groupHeader, items);
      panelEl7.appendChild(group);
    }
  }
  function getConditionHint(cond) {
    switch (cond.type) {
      case "resource_total": {
        const resDef = data.resources.get(cond.resourceId);
        return `Produce ${cond.amount} ${resDef?.name || cond.resourceId} (lifetime)`;
      }
      case "resource_current": {
        const resDef = data.resources.get(cond.resourceId);
        if (cond.amount === 0) return `Run out of ${resDef?.name || cond.resourceId}`;
        return `Have ${cond.amount} ${resDef?.name || cond.resourceId}`;
      }
      case "building": {
        const bDef = data.buildings.get(cond.buildingId);
        return `Build ${bDef?.name || cond.buildingId}`;
      }
      case "tech": {
        const tDef = data.technologies.get(cond.techId);
        return `Research ${tDef?.name || cond.techId}`;
      }
      case "prestige_reset":
        return `Perform ${cond.count} prestige reset(s)`;
      case "event_experienced":
        return "Experience a specific event";
      case "all_technologies_researched":
        return "Research all technologies";
      case "buildings_in_all_eras":
        return "Build in all eras";
      case "total_workers":
        return `Hire ${cond.amount} workers`;
      case "all_trade_partners":
        return "Trade with all partners";
      case "uptime_streak":
        return `Maintain ${cond.days} day uptime streak`;
      default:
        return "???";
    }
  }
  function getConditionProgress(cond) {
    switch (cond.type) {
      case "resource_total": {
        const res = gameState.resources[cond.resourceId];
        return {
          current: res ? Math.floor(res.lifetimeTotal) : 0,
          target: cond.amount,
          percent: res ? res.lifetimeTotal / cond.amount : 0
        };
      }
      case "total_workers":
        return {
          current: gameState.population?.total || 0,
          target: cond.amount,
          percent: (gameState.population?.total || 0) / cond.amount
        };
      case "prestige_reset":
        return {
          current: gameState.prestige?.totalResets || 0,
          target: cond.count,
          percent: (gameState.prestige?.totalResets || 0) / cond.count
        };
      default:
        return null;
    }
  }
  function getRewardText(reward) {
    switch (reward.type) {
      case "production_bonus": {
        const pct = Math.round(reward.amount * 100);
        if (reward.target === "all_production") return `Reward: +${pct}% all production`;
        const resDef = data.resources.get(reward.target);
        return `Reward: +${pct}% ${resDef?.name || reward.target} production`;
      }
      case "research_speed":
        return `Reward: +${Math.round(reward.amount * 100)}% research speed`;
      case "happiness_bonus":
        return `Reward: +${Math.round(reward.amount * 100)}% happiness`;
      case "resource_grant": {
        const resDef = data.resources.get(reward.resourceId);
        return `Reward: +${reward.amount} ${resDef?.name || reward.resourceId}`;
      }
      default:
        return "";
    }
  }
  function render7() {
    const counts = getAchievementCount();
    if (counts.unlocked !== lastUnlockedCount6) {
      rebuild7();
      return;
    }
    const progressBars = panelEl7.querySelectorAll(".achievement-card--locked");
    for (const card of progressBars) {
      const id = card.dataset.id;
      if (!id) continue;
      const def = data.achievements.get(id);
      if (!def) continue;
      const progress = getConditionProgress(def.condition);
      if (!progress) continue;
      const bar = card.querySelector(".achievement-progress-bar");
      if (bar) bar.style.width = `${Math.min(100, Math.round(progress.percent * 100))}%`;
      const text = card.querySelector(".achievement-progress-text");
      if (text) text.textContent = `${progress.current} / ${progress.target}`;
    }
  }

  // js/ui/prestigePanel.js
  var panelEl8;
  var lastPurchasedCount2 = 0;
  function init20(containerEl) {
    panelEl8 = containerEl;
    rebuild8();
    emitter.on("prestigeUpgradePurchased", () => rebuild8());
    return render8;
  }
  function rebuild8() {
    panelEl8.innerHTML = "";
    lastPurchasedCount2 = Object.keys(gameState.prestige?.purchasedUpgrades || {}).length;
    const title = el("div", "section-title");
    title.textContent = "Forklift Upgrade";
    panelEl8.appendChild(title);
    const flavor = el("div", "prestige-flavor");
    flavor.textContent = data.prestige.resetFlavor;
    panelEl8.appendChild(flavor);
    const calcSection = el("div", "prestige-calculator");
    const calcTitle = el("div", "prestige-section-title");
    calcTitle.textContent = "Industry Cred Calculator";
    calcSection.appendChild(calcTitle);
    const calcBody = el("div", "prestige-calc-body");
    calcSection.appendChild(calcBody);
    panelEl8.appendChild(calcSection);
    const resetSection = el("div", "prestige-reset-section");
    const resetBtn = el("button", "prestige-reset-btn");
    resetBtn.textContent = "Forklift Upgrade";
    resetBtn.addEventListener("click", () => {
      const ic = calculatePotentialIC();
      const msg = `Are you sure you want to perform a Forklift Upgrade?

You will earn ${ic.totalIC} Industry Cred.

RESET: Resources, buildings, workers, technologies, upgrades, trades, seasons
KEEP: Industry Cred, prestige upgrades, achievements, philosophy`;
      if (window.confirm(msg)) {
        performPrestige();
      }
    });
    resetSection.appendChild(resetBtn);
    const resetInfo = el("div", "prestige-reset-info");
    resetInfo.innerHTML = "<strong>Resets:</strong> Resources, Buildings, Workers, Technologies, Upgrades, Trades<br><strong>Keeps:</strong> Industry Cred, Prestige Upgrades, Achievements, Philosophy, Statistics";
    resetSection.appendChild(resetInfo);
    panelEl8.appendChild(resetSection);
    const milestone = getCurrentMilestone();
    if (milestone) {
      const msEl = el("div", "prestige-milestone");
      msEl.textContent = `Current Title: ${milestone.title}`;
      panelEl8.appendChild(msEl);
    }
    const upgTitle = el("div", "prestige-section-title");
    upgTitle.textContent = "Prestige Upgrades";
    panelEl8.appendChild(upgTitle);
    const upgGrid = el("div", "prestige-upgrades-grid");
    const upgrades = getPrestigeUpgrades();
    for (const upg of upgrades) {
      const card = el("div", upg.purchased ? "prestige-upgrade-card prestige-upgrade-card--purchased" : "prestige-upgrade-card");
      card.dataset.id = upg.id;
      const nameEl = el("div", "prestige-upgrade-name");
      nameEl.textContent = upg.name;
      if (upg.purchased) {
        const check = el("span", "upgrade-check");
        check.textContent = " \u2713";
        nameEl.appendChild(check);
      }
      const descEl = el("div", "prestige-upgrade-desc");
      descEl.textContent = upg.description;
      const costEl = el("div", "prestige-upgrade-cost");
      costEl.textContent = `${upg.cost} IC`;
      card.append(nameEl, descEl, costEl);
      if (!upg.purchased) {
        const buyBtn = el("button", "prestige-buy-btn");
        buyBtn.textContent = "Purchase";
        buyBtn.dataset.id = upg.id;
        buyBtn.addEventListener("click", () => {
          purchasePrestigeUpgrade(upg.id);
        });
        card.appendChild(buyBtn);
      }
      upgGrid.appendChild(card);
    }
    panelEl8.appendChild(upgGrid);
    const msTitle = el("div", "prestige-section-title");
    msTitle.textContent = "Milestones";
    panelEl8.appendChild(msTitle);
    const msList = el("div", "prestige-milestones");
    for (const ms of data.prestige.milestones) {
      const reached = (gameState.prestige?.totalResets || 0) >= ms.count;
      const msCard = el("div", reached ? "prestige-milestone-card prestige-milestone-card--reached" : "prestige-milestone-card");
      const msName = el("div", "prestige-milestone-name");
      msName.textContent = `${ms.title} (${ms.count} resets)`;
      if (reached) msName.textContent += " \u2713";
      const msNarr = el("div", "prestige-milestone-narrative");
      msNarr.textContent = ms.narrative;
      msCard.append(msName, msNarr);
      msList.appendChild(msCard);
    }
    panelEl8.appendChild(msList);
    const history = gameState.prestige?.runHistory || [];
    if (history.length > 0) {
      const histTitle = el("div", "prestige-section-title");
      histTitle.textContent = "Run History";
      panelEl8.appendChild(histTitle);
      const histList = el("div", "prestige-history");
      for (let i = history.length - 1; i >= 0; i--) {
        const run = history[i];
        const row = el("div", "prestige-history-row");
        row.textContent = `Run #${i + 1}: ${run.icEarned} IC earned, ${run.ticks} ticks, Year ${run.year || "?"}`;
        histList.appendChild(row);
      }
      panelEl8.appendChild(histList);
    }
  }
  function render8() {
    const currentPurchased = Object.keys(gameState.prestige?.purchasedUpgrades || {}).length;
    if (currentPurchased !== lastPurchasedCount2) {
      rebuild8();
      return;
    }
    const calcBody = panelEl8.querySelector(".prestige-calc-body");
    if (calcBody) {
      const ic = calculatePotentialIC();
      calcBody.innerHTML = "";
      const formulaRow = el("div", "prestige-calc-row");
      formulaRow.textContent = `Base: sqrt(${formatNum(ic.autoJobs)} \xD7 ${formatNum(ic.uptime)} / 1000) = ${ic.baseIC} IC`;
      calcBody.appendChild(formulaRow);
      for (const bonus of ic.bonuses) {
        const bonusRow = el("div", "prestige-calc-row prestige-calc-bonus");
        bonusRow.textContent = `${bonus.description}: +${Math.round(bonus.amount * 100)}%`;
        calcBody.appendChild(bonusRow);
      }
      const totalRow = el("div", "prestige-calc-row prestige-calc-total");
      totalRow.textContent = `Total: ${ic.totalIC} Industry Cred`;
      calcBody.appendChild(totalRow);
    }
    const resetBtn = panelEl8.querySelector(".prestige-reset-btn");
    if (resetBtn) {
      resetBtn.disabled = !canPrestige();
      const ic = calculatePotentialIC();
      resetBtn.textContent = `Forklift Upgrade (+${ic.totalIC} IC)`;
    }
    const cards = panelEl8.querySelectorAll(".prestige-upgrade-card:not(.prestige-upgrade-card--purchased)");
    for (const card of cards) {
      const id = card.dataset.id;
      const btn = card.querySelector(".prestige-buy-btn");
      const costEl = card.querySelector(".prestige-upgrade-cost");
      if (btn) btn.disabled = !canPurchasePrestigeUpgrade(id);
      if (costEl) {
        costEl.className = canPurchasePrestigeUpgrade(id) ? "prestige-upgrade-cost cost-affordable" : "prestige-upgrade-cost cost-unaffordable";
      }
    }
  }

  // js/ui/philosophyPanel.js
  var panelEl9;
  var lastConviction = -1;
  function init21(containerEl) {
    panelEl9 = containerEl;
    rebuild9();
    emitter.on("philosophyChanged", () => rebuild9());
    emitter.on("convictionEarned", () => rebuild9());
    return render9;
  }
  function rebuild9() {
    panelEl9.innerHTML = "";
    const conviction = getConviction();
    lastConviction = conviction.total;
    const title = el("div", "section-title");
    title.textContent = "Automation Philosophy";
    panelEl9.appendChild(title);
    const subtitle = el("div", "philosophy-subtitle");
    subtitle.textContent = "Choose your beliefs. Earn Conviction from Automation Jobs (1 per 100 completed).";
    panelEl9.appendChild(subtitle);
    const convEl = el("div", "philosophy-conviction");
    convEl.textContent = `Conviction: ${conviction.available} available / ${conviction.total} total`;
    panelEl9.appendChild(convEl);
    const dimNote = el("div", "philosophy-dim-note");
    dimNote.textContent = "Diminishing returns: highest allocation gets 100%, second 75%, third 50%. Others get no bonus.";
    panelEl9.appendChild(dimNote);
    const allocations = getAllocations();
    const grid = el("div", "philosophy-grid");
    for (const phil of data.prestige.philosophies) {
      const alloc = allocations[phil.id] || { allocated: 0, diminishingFactor: 1 };
      const card = el("div", alloc.allocated > 0 ? "philosophy-card philosophy-card--active" : "philosophy-card");
      card.dataset.id = phil.id;
      const nameEl = el("div", "philosophy-name");
      nameEl.textContent = phil.name;
      const descEl = el("div", "philosophy-desc");
      descEl.textContent = phil.description;
      const allocEl = el("div", "philosophy-allocation");
      allocEl.textContent = `Allocated: ${alloc.allocated} Conviction`;
      if (alloc.allocated > 0) {
        const factorEl = el("span", "philosophy-factor");
        factorEl.textContent = ` (${Math.round(alloc.diminishingFactor * 100)}% effectiveness)`;
        allocEl.appendChild(factorEl);
      }
      const bonusList = el("div", "philosophy-bonuses");
      for (const bonus of phil.bonuses) {
        const bonusEl = el("div", "philosophy-bonus-row");
        bonusEl.textContent = bonus.description;
        if (alloc.allocated > 0) {
          const scale = alloc.allocated * alloc.diminishingFactor;
          const effective = bonus.amount * scale;
          const effectiveEl = el("span", "philosophy-effective");
          const sign = effective >= 0 ? "+" : "";
          effectiveEl.textContent = ` (${sign}${(effective * 100).toFixed(1)}% total)`;
          bonusEl.appendChild(effectiveEl);
        }
        bonusList.appendChild(bonusEl);
      }
      const controls = el("div", "philosophy-controls");
      const addBtn = makeBtn("+1", () => allocateConviction(phil.id, 1), "philosophy-btn philosophy-btn--add");
      const removeBtn = makeBtn("-1", () => deallocateConviction(phil.id, 1), "philosophy-btn philosophy-btn--remove");
      controls.append(removeBtn, addBtn);
      card.append(nameEl, descEl, allocEl, bonusList, controls);
      grid.appendChild(card);
    }
    panelEl9.appendChild(grid);
  }
  function render9() {
    const conviction = getConviction();
    if (conviction.total !== lastConviction) {
      rebuild9();
      return;
    }
    const convEl = panelEl9.querySelector(".philosophy-conviction");
    if (convEl) {
      convEl.textContent = `Conviction: ${conviction.available} available / ${conviction.total} total`;
    }
    const cards = panelEl9.querySelectorAll(".philosophy-card");
    for (const card of cards) {
      const id = card.dataset.id;
      const addBtn = card.querySelector(".philosophy-btn--add");
      const removeBtn = card.querySelector(".philosophy-btn--remove");
      if (addBtn) addBtn.disabled = conviction.available <= 0;
      if (removeBtn) removeBtn.disabled = (gameState.philosophy?.allocations?.[id] || 0) <= 0;
    }
  }

  // js/ui/statsPanel.js
  var panelEl10;
  function init22(containerEl) {
    panelEl10 = containerEl;
    rebuild10();
    return render10;
  }
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1e3);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  function rebuild10() {
    panelEl10.innerHTML = "";
    const title = el("div", "section-title");
    title.textContent = "Statistics";
    panelEl10.appendChild(title);
    const grid = el("div", "stats-grid");
    addSection(grid, "Current Run", "stats-current-run");
    addSection(grid, "All-Time", "stats-all-time");
    addSection(grid, "Prestige", "stats-prestige");
    addSection(grid, "Fun Stats", "stats-fun");
    panelEl10.appendChild(grid);
  }
  function addSection(parent, title, className) {
    const section = el("div", `stats-section ${className}`);
    const header = el("div", "stats-section-header");
    header.textContent = title;
    section.appendChild(header);
    const body = el("div", "stats-section-body");
    section.appendChild(body);
    parent.appendChild(section);
  }
  function addRow(parent, label, value) {
    const row = el("div", "stats-row");
    const labelEl = el("span", "stats-label");
    labelEl.textContent = label;
    const valueEl = el("span", "stats-value");
    valueEl.textContent = value;
    row.append(labelEl, valueEl);
    parent.appendChild(row);
  }
  function render10() {
    const sections = panelEl10.querySelectorAll(".stats-section-body");
    if (sections.length < 4) return;
    const [currentEl, allTimeEl, prestigeEl, funEl] = sections;
    currentEl.innerHTML = "";
    const runTicks = gameState.time.totalTicks - (gameState.prestige?.currentRunStartTick || 0);
    const runMs = Date.now() - (gameState.prestige?.currentRunStartTime || Date.now());
    addRow(currentEl, "Run Time (real)", formatTime(runMs));
    addRow(currentEl, "Game Days", String(gameState.time.currentDay));
    addRow(currentEl, "Game Year", String(gameState.time.currentYear));
    addRow(currentEl, "Buildings Built", formatNum(gameState.statistics.totalBuildingsBuilt));
    addRow(currentEl, "Workers Hired", formatNum(gameState.statistics.totalWorkersHired));
    addRow(currentEl, "Techs Researched", formatNum(gameState.statistics.totalTechsResearched));
    addRow(currentEl, "Events Experienced", String(gameState.statistics.eventsExperienced.length));
    addRow(currentEl, "Clicks", formatNum(gameState.statistics.totalClicks || 0));
    allTimeEl.innerHTML = "";
    const at = gameState.statistics.allTime || {};
    addRow(allTimeEl, "Total Play Time", formatTime(at.totalPlayTimeMs || 0));
    addRow(allTimeEl, "Runs Completed", String(at.totalRunsCompleted || 0));
    addRow(allTimeEl, "Buildings Built", formatNum((at.totalBuildingsBuilt || 0) + gameState.statistics.totalBuildingsBuilt));
    addRow(allTimeEl, "Workers Hired", formatNum((at.totalWorkersHired || 0) + gameState.statistics.totalWorkersHired));
    addRow(allTimeEl, "Techs Researched", formatNum((at.totalTechsResearched || 0) + gameState.statistics.totalTechsResearched));
    addRow(allTimeEl, "Total Clicks", formatNum((at.totalClicks || 0) + (gameState.statistics.totalClicks || 0)));
    prestigeEl.innerHTML = "";
    const pres = gameState.prestige || {};
    addRow(prestigeEl, "Industry Cred", formatNum(pres.industryCred || 0));
    addRow(prestigeEl, "Total Resets", String(pres.totalResets || 0));
    const upgCount = Object.keys(pres.purchasedUpgrades || {}).length;
    addRow(prestigeEl, "Upgrades Purchased", `${upgCount} / ${data.prestige.bonuses.length}`);
    addRow(prestigeEl, "Conviction", formatNum(gameState.philosophy?.conviction || 0));
    funEl.innerHTML = "";
    const coffee = gameState.resources.coffee;
    addRow(funEl, "Coffee Consumed", formatNum(coffee?.lifetimeTotal || 0));
    const meetings = gameState.resources.meeting_minutes;
    addRow(funEl, "Meeting Minutes Endured", formatNum(meetings?.lifetimeTotal || 0));
    const techDebt = gameState.resources.technical_debt;
    addRow(funEl, "Peak Technical Debt", formatNum(techDebt?.lifetimeTotal || 0));
    const cli = gameState.resources.cli_commands;
    addRow(funEl, "CLI Commands Typed", formatNum(cli?.lifetimeTotal || 0));
    const sanity = gameState.resources.sanity;
    if (sanity && sanity.amount <= 0) {
      addRow(funEl, "Sanity Status", "Gone");
    } else {
      addRow(funEl, "Sanity Status", "Holding");
    }
  }

  // js/ui/renderer.js
  var SEASON_ICONS = ["\u2744", "\u2600", "\u{1F342}", "\u2744"];
  var gameTimeEl;
  var seasonInfoEl;
  var timedEffectsEl;
  var achievementCounterEl;
  var pauseBtn;
  var pauseIcon;
  var pauseCallback = null;
  var rapidClickCount = 0;
  var rapidClickTimer = null;
  var toastCount = 0;
  function init23() {
    const container = document.getElementById("game-container");
    container.innerHTML = "";
    const header = el("div", "header");
    const titleEl = el("div", "game-title");
    const titleIcon = el("span", "game-title-icon");
    titleIcon.textContent = "\u2B21";
    const titleTextWrap = el("div", "game-title-text");
    const titleMain = el("span", "game-title-main");
    titleMain.textContent = "Source of Truth";
    const titleSub = el("span", "game-title-sub");
    titleSub.textContent = "or Consequences";
    titleTextWrap.append(titleMain, titleSub);
    titleEl.append(titleIcon, titleTextWrap);
    const headerCenter = el("div", "header-center");
    const clickBtn = el("button", "click-btn");
    const clickCursor = el("span", "click-cursor");
    clickCursor.textContent = ">";
    const clickText = el("span");
    clickText.textContent = " show version";
    clickBtn.append(clickCursor, clickText);
    clickBtn.addEventListener("click", () => {
      addResource("cli_commands", 1);
      render();
      renderActiveTab();
      playClick();
      if (gameState.statistics) gameState.statistics.totalClicks = (gameState.statistics.totalClicks || 0) + 1;
      emitter.emit("logMessage", {
        text: "%CLI-6-INPUT: show version \u2014 output received",
        type: "info",
        category: "system"
      });
      const floater = el("span", "click-float");
      floater.textContent = "+1";
      headerCenter.appendChild(floater);
      floater.addEventListener("animationend", () => floater.remove());
      rapidClickCount++;
      if (rapidClickTimer) clearTimeout(rapidClickTimer);
      rapidClickTimer = setTimeout(() => {
        rapidClickCount = 0;
      }, 5e3);
      if (rapidClickCount >= 30) {
        triggerEasterEgg("rapid_click_terminal");
        rapidClickCount = 0;
      }
    });
    headerCenter.appendChild(clickBtn);
    const headerRight = el("div", "header-right");
    const headerTimeCol = el("div", "header-time-col");
    gameTimeEl = el("span", "game-time");
    gameTimeEl.textContent = "Day 1 \xB7 Q1 \xB7 Year 1";
    const headerDetailRow = el("div", "header-detail-row");
    seasonInfoEl = el("span", "season-info");
    timedEffectsEl = el("span", "timed-effects-indicator");
    headerDetailRow.append(seasonInfoEl, timedEffectsEl);
    headerTimeCol.append(gameTimeEl, headerDetailRow);
    achievementCounterEl = el("span", "achievement-counter");
    const counts = getAchievementCount();
    achievementCounterEl.textContent = `\u{1F3C6} ${counts.unlocked}/${counts.total - counts.hiddenRemaining}`;
    const toolbar = el("div", "header-toolbar");
    const btnGuide = el("button", "toolbar-btn");
    btnGuide.title = "User Guide";
    btnGuide.textContent = "\u{1F4D8}";
    btnGuide.addEventListener("click", () => {
      window.open("user-guide.html", "_blank");
    });
    const btnSettings = el("button", "toolbar-btn");
    btnSettings.title = "Settings";
    btnSettings.textContent = "\u2699";
    btnSettings.addEventListener("click", () => open());
    pauseBtn = el("button", "toolbar-btn");
    pauseBtn.title = "Pause";
    pauseIcon = pauseBtn;
    pauseBtn.textContent = "\u23F8";
    pauseBtn.addEventListener("click", () => {
      if (pauseCallback) pauseCallback();
    });
    toolbar.append(btnGuide, btnSettings, pauseBtn);
    headerRight.append(headerTimeCol, achievementCounterEl, toolbar);
    header.append(titleEl, headerCenter, headerRight);
    container.appendChild(header);
    const layout = el("div", "game-layout");
    const sidebar = el("div", "resource-sidebar");
    init10(sidebar);
    const main = el("div", "main-content");
    const tabBarEl2 = el("div", "tab-bar");
    const tabPanelsEl2 = el("div", "tab-panels");
    main.append(tabBarEl2, tabPanelsEl2);
    init12(tabBarEl2, tabPanelsEl2);
    registerTabSwitcher(switchTo);
    registerTab("operations", "Operations Center", init11, { unlocked: true });
    const villageUnlocked = gameState.unlocked.workers.size > 0;
    registerTab("village", "The Village", init13, { unlocked: villageUnlocked });
    if (!villageUnlocked) {
      const unsub = emitter.on("unlockChanged", ({ category }) => {
        if (category === "workers") {
          unlockTab("village");
          unsub();
        }
      });
    }
    const researchUnlocked = gameState.unlocked.technologies.size > 0;
    registerTab("research", "Research Lab", init14, { unlocked: researchUnlocked });
    if (!researchUnlocked) {
      const unsub = emitter.on("unlockChanged", ({ category }) => {
        if (category === "technologies") {
          unlockTab("research");
          unsub();
        }
      });
    }
    const workshopUnlocked = gameState.unlocked.upgrades.size > 0;
    registerTab("workshop", "Workshop", init15, { unlocked: workshopUnlocked });
    if (!workshopUnlocked) {
      const unsub = emitter.on("unlockChanged", ({ category }) => {
        if (category === "upgrades") {
          unlockTab("workshop");
          unsub();
        }
      });
    }
    const tradingUnlocked = gameState.unlocked.trades.size > 0;
    registerTab("trading", "Trading Post", init17, { unlocked: tradingUnlocked });
    if (!tradingUnlocked) {
      const unsub = emitter.on("unlockChanged", ({ category }) => {
        if (category === "trades") {
          unlockTab("trading");
          unsub();
        }
      });
    }
    registerTab("events", "Event Log", init18, { unlocked: false });
    emitter.once("eventFired", () => {
      unlockTab("events");
    });
    const achievementsAlreadyUnlocked = Object.keys(gameState.achievements?.unlocked || {}).length > 0;
    registerTab("achievements", "Achievements", init19, { unlocked: achievementsAlreadyUnlocked });
    if (!achievementsAlreadyUnlocked) {
      emitter.once("achievementUnlocked", () => unlockTab("achievements"));
    }
    const prestigeUnlocked = gameState.technologies.nautobot_jobs?.researched || false;
    registerTab("prestige", "Forklift Upgrade", init20, { unlocked: prestigeUnlocked });
    if (!prestigeUnlocked) {
      const unsub = emitter.on("researchCompleted", ({ techId }) => {
        if (techId === "nautobot_jobs") {
          unlockTab("prestige");
          unsub();
        }
      });
    }
    const philosophyUnlocked = (gameState.philosophy?.conviction || 0) > 0;
    registerTab("philosophy", "Philosophy", init21, { unlocked: philosophyUnlocked });
    if (!philosophyUnlocked) {
      emitter.once("convictionEarned", () => unlockTab("philosophy"));
    }
    registerTab("stats", "Statistics", init22, { unlocked: true });
    initEventBanner(container);
    if (!init23._listenersRegistered) {
      init23._listenersRegistered = true;
      emitter.on("achievementUnlocked", ({ id, def }) => {
        showAchievementToast(def);
        playAchievement();
      });
      emitter.on("prestigeReset", () => {
        init23();
      });
      emitter.on("seasonChanged", () => {
        showSeasonOverlay(gameState.time.currentSeason);
      });
    }
    const logContainer2 = el("div", "game-log-container");
    init16(logContainer2);
    layout.append(sidebar, main, logContainer2);
    container.appendChild(layout);
    setRebuildCallback(rebuildAll);
    init9();
    rebuildAll();
    addMessage('%SYS-6-INIT: Network stack initialized. Type "show version" to begin.', "success", "system");
  }
  function rebuildAll() {
    render();
    renderActiveTab();
  }
  function showAchievementToast(def) {
    const toast = el("div", "achievement-toast");
    const toastIcon = el("span", "achievement-toast-icon");
    toastIcon.textContent = "\u{1F3C6}";
    const toastContent = el("div", "achievement-toast-content");
    const titleEl = el("div", "achievement-toast-title");
    titleEl.textContent = def.name;
    const descEl = el("div", "achievement-toast-desc");
    descEl.textContent = def.description;
    toastContent.append(titleEl, descEl);
    toast.append(toastIcon, toastContent);
    const offset = toastCount * 72;
    toast.style.top = `${12 + offset}px`;
    toastCount++;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("achievement-toast--visible"));
    setTimeout(() => {
      toast.classList.remove("achievement-toast--visible");
      toastCount = Math.max(0, toastCount - 1);
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
      setTimeout(() => toast.remove(), 500);
    }, 5e3);
  }
  function showSeasonOverlay(season) {
    const overlay = el("div", `season-overlay season-overlay--q${season + 1}`);
    const text = el("div", "season-overlay-text");
    text.textContent = `${SEASON_ICONS[season] || ""} ${SEASON_NAMES[season] || "Q?"}`;
    overlay.appendChild(text);
    document.body.appendChild(overlay);
    overlay.addEventListener("animationend", () => overlay.remove());
  }
  function tick9(tickCount2) {
    if (tickCount2 % 3 !== 0) return;
    const s = SEASON_NAMES[gameState.time.currentSeason] || "Q?";
    const seasonIcon = SEASON_ICONS[gameState.time.currentSeason] || "";
    const activeSeasons = getActiveSeasons();
    const seasonNames = activeSeasons.filter((ss) => !ss.id.startsWith("q")).map((ss) => ss.name).join(" \xB7 ");
    gameTimeEl.textContent = `Day ${gameState.time.currentDay} \xB7 ${s} \xB7 Year ${gameState.time.currentYear}`;
    gameTimeEl.title = `Tick: ${gameState.time.totalTicks}`;
    seasonInfoEl.textContent = seasonNames ? `${seasonIcon} ${seasonNames}` : "";
    const effects = getTimedEffects();
    if (effects.length > 0) {
      timedEffectsEl.textContent = `\u26A1 ${effects.length} effect${effects.length > 1 ? "s" : ""}`;
      timedEffectsEl.title = effects.map((e) => {
        const sign = e.amount >= 0 ? "+" : "";
        const dur = e.expiresAtTick === Infinity ? "\u221E" : `${Math.ceil((e.expiresAtTick - gameState.time.totalTicks) / 10)}d`;
        return `${sign}${Math.round(e.amount * 100)}% ${e.target} (${dur})`;
      }).join("\n");
    } else {
      timedEffectsEl.textContent = "";
      timedEffectsEl.title = "";
    }
    if (achievementCounterEl) {
      const counts = getAchievementCount();
      achievementCounterEl.textContent = `\u{1F3C6} ${counts.unlocked}/${counts.total - counts.hiddenRemaining}`;
    }
    renderEventBanner();
    render();
    renderActiveTab();
    setTabBadge("village", gameState.population.free);
    flush();
  }
  function setPauseCallback(cb) {
    pauseCallback = cb;
  }
  function updatePauseButton(paused2) {
    if (pauseIcon) {
      pauseIcon.textContent = paused2 ? "\u25B6" : "\u23F8";
      pauseIcon.title = paused2 ? "Resume" : "Pause";
    }
  }

  // js/engine/ticker.js
  var TICK_INTERVAL = 200;
  var TICKS_PER_DAY = 10;
  var DAYS_PER_SEASON = 100;
  var SEASONS_PER_YEAR = 4;
  var DAYS_PER_YEAR = DAYS_PER_SEASON * SEASONS_PER_YEAR;
  var intervalId = null;
  var tickCount = 0;
  var paused = false;
  function onTick() {
    if (paused) return;
    tickCount++;
    tick6();
    tick4();
    tick5();
    advanceGameClock();
    if (gameState.time.totalTicks > 0 && gameState.time.totalTicks % TICKS_PER_DAY === 0) {
      tick();
      workerTick();
      tick8();
    }
    if (tickCount % 5 === 0) {
      tick2();
    }
    if (tickCount % 25 === 0) {
      tick3();
    }
    if (tickCount % 50 === 0) {
      tick7();
    }
    tick9(tickCount);
  }
  function advanceGameClock() {
    gameState.time.totalTicks++;
    if (gameState.time.totalTicks % TICKS_PER_DAY === 0) {
      const prevSeason = gameState.time.currentSeason;
      gameState.time.currentDay++;
      if (gameState.time.currentDay > DAYS_PER_YEAR) {
        gameState.time.currentDay = 1;
        gameState.time.currentYear++;
      }
      gameState.time.currentSeason = Math.floor((gameState.time.currentDay - 1) / DAYS_PER_SEASON);
      if (gameState.time.currentSeason !== prevSeason) {
        onSeasonChange();
      }
    }
  }
  function onSeasonChange() {
    const budget = gameState.resources.budget;
    if (!budget) return;
    setResource("budget", budget.cap);
    emitter.emit("logMessage", {
      text: "%FIN-5-BUDGET: Quarterly budget refreshed. New allocation approved.",
      type: "success",
      category: "resource"
    });
  }
  function start() {
    if (intervalId) return;
    intervalId = setInterval(onTick, TICK_INTERVAL);
  }
  function togglePause() {
    paused = !paused;
    return paused;
  }

  // js/main.js
  var BOOT_MESSAGES = [
    "%SYS-5-BOOT: Initializing network stack...",
    "%SYS-5-BOOT: Loading BGP neighbor table...",
    "%SYS-5-BOOT: Checking for rogue DHCP servers...",
    "%SYS-5-BOOT: Asking if anyone documented the last change... (timeout)",
    "%SYS-5-BOOT: Warming up the coffee machine...",
    "%SYS-5-BOOT: Compiling excuses for Monday standup...",
    "%SYS-5-BOOT: Loading documentation... 404 Not Found",
    "%SYS-5-BOOT: Generating documentation from scratch...",
    "%SYS-5-BOOT: Checking for leftover VLANs...",
    "%SYS-5-BOOT: System ready."
  ];
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  async function boot() {
    const loadingScreen = document.getElementById("loading-screen");
    const gameContainer = document.getElementById("game-container");
    const bootMessages = document.getElementById("boot-messages");
    const progressBar = document.getElementById("boot-progress-bar");
    applyAll();
    try {
      for (let i = 0; i < BOOT_MESSAGES.length; i++) {
        const line = document.createElement("div");
        line.className = "boot-line";
        line.textContent = BOOT_MESSAGES[i];
        bootMessages.appendChild(line);
        bootMessages.scrollTop = bootMessages.scrollHeight;
        progressBar.style.width = `${(i + 1) / BOOT_MESSAGES.length * 100}%`;
        if (i === 2) {
          resetState(data);
          const loaded = load();
          if (loaded) {
            const restoreLine = document.createElement("div");
            restoreLine.className = "boot-line boot-line--success";
            restoreLine.textContent = "%SYS-6-RESTORE: Previous save data restored.";
            bootMessages.appendChild(restoreLine);
          }
        }
        if (i === 4) {
          init6();
          init();
          init8();
          init7();
        }
        if (i === 6) {
          init3();
          init5();
          init4();
          recalculateRates();
          applyOfflineProgress();
          init2();
        }
        await sleep(120 + Math.random() * 180);
      }
      await sleep(300);
      init23();
      setPauseCallback(() => {
        const nowPaused = togglePause();
        updatePauseButton(nowPaused);
      });
      startAutoSave();
      start();
      loadingScreen.classList.add("loading-screen--fadeout");
      await sleep(400);
      loadingScreen.style.display = "none";
      gameContainer.classList.remove("hidden");
      gameContainer.classList.add("game-container--fadein");
    } catch (err) {
      console.error("Initialization failed:", err);
      const errorLine = document.createElement("div");
      errorLine.className = "boot-line boot-line--error";
      errorLine.textContent = `%SYS-0-FATAL: ${err.message}`;
      bootMessages.appendChild(errorLine);
    }
  }
  boot();
})();
